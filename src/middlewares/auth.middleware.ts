import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.token;

  if (token) {
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) {
        return res.redirect('/login');
      }
      req.user = user;
      // Truyền thông tin người dùng vào locals cho Handlebars
      res.locals.user = user;
      next();
    });
  } else {
    res.redirect('/login');
  }
};

export const requirePermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.permissions) {
      console.log(`[ACCESS DENIED] User missing or no permissions loaded.`);
      if (req.originalUrl.startsWith('/api')) {
        return res.status(403).json({ error: 'Truy cập bị từ chối' });
      }
      return res.status(403).send('Access Denied');
    }

    if (req.user.permissions.includes(permission)) {
      next();
    } else {
      console.log(`[ACCESS DENIED] User ${req.user.username} lacks permission: ${permission}`);
      if (req.originalUrl.startsWith('/api')) {
        return res.status(403).json({ error: 'Bạn không có quyền thực hiện thao tác này!' });
      }
      res.status(403).send('Truy cập bị từ chối: Bạn không có quyền thực hiện thao tác này!');
    }
  };
};
