import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/jwt';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = verifyToken(token);
        req.user = decoded as any;
        next();
    } catch {
        return res.status(401).json({ message: 'Invalid token' });
    }
}
