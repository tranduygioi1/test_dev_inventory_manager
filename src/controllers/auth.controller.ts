import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db';

// Khóa bí mật dùng để mã hóa JWT. Trong thực tế, bắt buộc phải đọc từ file .env
const JWT_SECRET = process.env.JWT_SECRET || 'TEST_DEV';
if (!process.env.JWT_SECRET) {
  console.warn('CẢNH BÁO: Chưa cấu hình JWT_SECRET trong file .env. Đang sử dụng khóa mặc định kém an toàn!');
}

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    console.log(`[LOGIN ATTEMPT] Username: ${username}`);

    if (!username || !password) {
      console.log(`[LOGIN FAILED] Missing credentials for username: ${username}`);
      return res.status(400).render('login', { error: 'Vui lòng nhập tài khoản và mật khẩu', layout: false });
    }

    const userQuery = `
      SELECT u.*, r.name as role_name 
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.username = $1
    `;
    const userResult = await pool.query(userQuery, [username]);
    const user = userResult.rows[0];

    if (!user) {
      console.log(`[LOGIN FAILED] Account not found: ${username}`);
      return res.status(401).render('login', { error: 'Tài khoản không tồn tại', layout: false });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      console.log(`[LOGIN FAILED] Incorrect password for: ${username}`);
      return res.status(401).render('login', { error: 'Mật khẩu không chính xác', layout: false });
    }

    const permQuery = `
      SELECT p.name 
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = $1
    `;
    const permResult = await pool.query(permQuery, [user.role_id]);
    const permissions = permResult.rows.map(row => row.name);

    const payload = {
      id: user.id,
      username: user.username,
      role: user.role_name,
      permissions: permissions
    };


    const token = jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 1 ngày
    });

    console.log(`\n=== [LOGIN SUCCESS] ===`);
    console.log(`Username: ${username}`);
    console.log(`Role: ${user.role_name}`);
    console.log(`Permissions: ${permissions.join(', ')}`);
    console.log(`[Encoded JWT]: ${token}`);


    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(`[Decoded JWT Payload]:`, decoded);
    console.log(`=======================\n`);

    res.redirect('/list');
  } catch (error) {
    console.error('[LOGIN ERROR]:', error);
    res.status(500).render('login', { error: 'Lỗi server', layout: false });
  }
};

export const logout = (req: Request, res: Response) => {
  console.log(`[LOGOUT] User logged out`);
  res.clearCookie('token');
  res.redirect('/login');
};
