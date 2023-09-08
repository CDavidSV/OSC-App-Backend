import { NextFunction, Request, Response } from "express";

interface RateLimit {
    timeoutWindowMs: number;
    maxRequests: number;
}

interface Requests {
    requests: number;
    timeout: NodeJS.Timeout;
}

const endpoints: { [key: string]: RateLimit } = {
    '/oauth2/login': {
        timeoutWindowMs: 300_000,
        maxRequests: 15
    },
    '/oauth2/revoke': {
        timeoutWindowMs: 300_000,
        maxRequests: 10
    },
    'oauth2/refreshToken': {
        timeoutWindowMs: 300_000,
        maxRequests: 10
    },
    '/api/v1/updateUsername': {
        timeoutWindowMs: 3_600_000,
        maxRequests: 5
    },
};

const defaultRateLimit: RateLimit = {
    timeoutWindowMs: 60_000,
    maxRequests: 100
};

const rateLimits = new Map<string, Map<string, Requests>>();
const globalLimits = new Map<string, Requests>();

const updateOrInitializeLimits = (ipAddress: string, rateLimit: RateLimit, limitMap: Map<string, Requests>) => {
    const lastRequest = limitMap.get(ipAddress);

    if (!lastRequest) {
        const timeoutFunction = setTimeout(() => limitMap.delete(ipAddress), rateLimit.timeoutWindowMs);
        limitMap.set(ipAddress, { requests: 1, timeout: timeoutFunction });
        return false; // Not exceeding the limit.
    }

    limitMap.set(ipAddress, { requests: lastRequest.requests + 1, timeout: lastRequest.timeout });

    return lastRequest.requests > rateLimit.maxRequests;
};

const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
    const ipAddress = req.socket.remoteAddress!;

    // Handle global default rate limiting.
    if (updateOrInitializeLimits(ipAddress, defaultRateLimit, globalLimits)) {
        res.status(429).send({ status: "failed", message: "Too many requests" });
        return;
    }

    const rateLimit = endpoints[req.originalUrl];

    if (rateLimit) {
        if (!rateLimits.has(req.originalUrl)) {
            rateLimits.set(req.originalUrl, new Map<string, Requests>());
        }
        
        const endpointLimits = rateLimits.get(req.originalUrl)!;

        if (updateOrInitializeLimits(ipAddress, rateLimit, endpointLimits)) {
            res.status(429).send({ status: "failed", message: "Too many requests" });
            return;
        }
    }

    next();
};

export default rateLimiter;