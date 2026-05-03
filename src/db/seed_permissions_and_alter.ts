import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function seedAndAlter() {
  try {
    // 1. Cập nhật bảng users
    try {
      await pool.query(`ALTER TABLE users ADD COLUMN employee_id VARCHAR(50);`);
      await pool.query(`ALTER TABLE users ADD COLUMN department VARCHAR(100);`);
      console.log('Added employee_id and department to users table.');
    } catch (e: any) {
      if (e.code !== '42701') { // 42701 là lỗi trùng lặp cột
        throw e;
      } else {
        console.log('Columns employee_id and department already exist.');
      }
    }

    // 2. Thêm quyền quản lý vai trò
    const permRes = await pool.query(
      `INSERT INTO permissions (name, description) VALUES ('manage_roles', 'Manage roles and permissions') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`
    );
    const manageRolesPermId = permRes.rows[0].id;

    // 3. Gán quyền quản lý vai trò cho admin
    const adminRoleRes = await pool.query(`SELECT id FROM roles WHERE name = 'admin'`);
    if (adminRoleRes.rows.length > 0) {
      const adminRoleId = adminRoleRes.rows[0].id;
      await pool.query(
        `INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [adminRoleId, manageRolesPermId]
      );
      console.log('Assigned manage_roles permission to admin role.');
    }

    console.log('Seed and alter completed successfully.');
  } catch (error) {
    console.error('Error during seed and alter:', error);
  } finally {
    await pool.end();
  }
}

seedAndAlter();
