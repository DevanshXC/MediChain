import { Request, Response, NextFunction } from 'express';

/**
 * Middleware factory that restricts access to users with given roles.
 * Also enforces that status is 'approved' unless role is 'admin'.
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    if (!roles.includes(user.role)) {
      res.status(403).json({ success: false, error: 'Insufficient permissions' });
      return;
    }

    // Admin bypass: admins always have access regardless of status
    if (user.role !== 'admin' && user.status !== 'approved') {
      res.status(403).json({
        success: false,
        error: 'Account pending approval. Please wait for admin approval.',
      });
      return;
    }

    next();
  };
}
