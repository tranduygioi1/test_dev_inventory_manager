import { Request, Response } from 'express';
import pool from '../db';
import bcrypt from 'bcryptjs';

export const listUsers = async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT u.id, u.username, u.employee_id, u.department, r.name as role_name, u.created_at
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY u.created_at DESC
    `;
    const result = await pool.query(query);
    
    const rolesResult = await pool.query('SELECT id, name FROM roles');
    
    res.render('users/list', { 
      users: result.rows,
      roles: rolesResult.rows
    });
  } catch (error) {
    console.error('[USER_LIST_ERROR]:', error);
    res.status(500).send('Server Error');
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, password, role_id, employee_id, department } = req.body;
    
    if (!username || !password || !role_id || !employee_id || !department) {
      return res.status(400).send('Missing fields (username, password, role_id, employee_id, department are required)');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    await pool.query(
      'INSERT INTO users (username, password_hash, role_id, employee_id, department) VALUES ($1, $2, $3, $4, $5)',
      [username, passwordHash, role_id, employee_id, department]
    );

    console.log(`[USER_CREATED] Username: ${username}, RoleID: ${role_id}`);
    res.redirect('/users');
  } catch (error) {
    console.error('[USER_CREATE_ERROR]:', error);
    res.status(500).send('Error creating user');
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    console.log(`[USER_DELETED] UserID: ${id}`);
    res.status(200).send('User deleted');
  } catch (error) {
    console.error('[USER_DELETE_ERROR]:', error);
    res.status(500).send('Error deleting user');
  }
};
