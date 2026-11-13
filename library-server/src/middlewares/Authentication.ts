import { NextFunction, Request, Response } from 'express';
import UserDao, { IUserModel } from '../daos/UserDao';
import { verifyAuthToken } from '../utils/AuthToken';

declare global {
    namespace Express {
        interface Request {
            authenticatedUser?: IUserModel;
        }
    }
}

export async function authenticateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    const authorization = req.headers.authorization;
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;
    const payload = token ? verifyAuthToken(token) : undefined;

    if (!payload) {
        res.status(401).json({ message: 'Authentication is required.' });
        return;
    }

    try {
        const user = await UserDao.findById(payload.userId).select('-password');
        if (!user) {
            res.status(401).json({ message: 'Authentication is required.' });
            return;
        }
        req.authenticatedUser = user;
        next();
    } catch (error) {
        next(error);
    }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
    if (req.authenticatedUser?.type !== 'ADMIN') {
        res.status(403).json({ message: 'Administrator access is required.' });
        return;
    }
    next();
}
