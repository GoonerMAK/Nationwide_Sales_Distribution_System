import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from 'express';

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.jwt;
    
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.SECRET!) as jwt.JwtPayload;
        req.user = decodedToken;
        next(); 
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' });
    }
}   