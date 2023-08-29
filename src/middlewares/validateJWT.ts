import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

/**
 * Verifies the validity of a token.
 * @param {string} token - Token to verify.
 * @returns {JwtPayload} - Decoded token object.
 * @throws {Error} - If the token is invalid.
 */
function verifyToken(req: Request, res: Response, next: NextFunction) {
    let token = req.headers.authorization;
    token = token ? token?.substring(7) : "";
    jwt.verify(token,"123", (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

export {
    verifyToken
};
