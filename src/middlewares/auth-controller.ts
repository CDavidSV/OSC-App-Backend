import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

/**
 * Authenticate an access token
 * @param req 
 * @param res 
 * @param next 
 */
const authenticateAccessToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader?.substring(7);
    if (!token) return res.sendStatus(401);

    jwt.verify(token,"123", (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        
        next();
    });
}

export {
    authenticateAccessToken
};
