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
    '/oauth2/userLogin': {
        timeoutWindowMs: 300_000,
        maxRequests: 10
    }
};
const rateLimits = new Map<string, Map<string, Requests>>();

const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
    if (!endpoints[req.originalUrl]) next();
    const ipAddress = req.socket.remoteAddress!;

    if (!rateLimits.has(req.originalUrl)) {
        rateLimits.set(req.originalUrl, new Map<string, Requests>());
    }

    const endpointLimits = rateLimits.get(req.originalUrl)!;
    const lastRequest = endpointLimits.get(ipAddress);
    const rateLimit = endpoints[req.originalUrl];

    if (!lastRequest) {
        const timeoutFunction = setTimeout(() => endpointLimits.delete(ipAddress), rateLimit.timeoutWindowMs)
        endpointLimits.set(ipAddress, { requests: 1, timeout: timeoutFunction });
        return next();
    }

    endpointLimits.set(ipAddress, { requests: lastRequest.requests + 1, timeout: lastRequest.timeout });

    if (lastRequest.requests > rateLimit.maxRequests) {
        res.status(429).send({ staus: "failed", message: "Too many requests" });
        return;
    }

    next();
};

export default rateLimiter;