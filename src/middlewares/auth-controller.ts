import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

/**
 * Authenticate an access token
 * @param req 
 * @param res 
 * @param next 
 */
const authenticateAccessToken = (req: Request, res: Response, next: NextFunction) => {
    let token = req.headers.authorization;
    token = token ? token?.substring(7) : "";
    jwt.verify(token,"123", (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

export {
    authenticateAccessToken
};
