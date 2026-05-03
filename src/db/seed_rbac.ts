import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
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

async function seedRbac() {
  try {
    // 1. Tạo các bảng nếu chưa tồn tại
    await pool.query(`
      CREATE TABLE IF NOT EXISTS roles (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(50) UNIQUE NOT NULL,
          description VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS permissions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(50) UNIQUE NOT NULL,
          description VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS role_permissions (
          role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
          permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
          PRIMARY KEY (role_id, permission_id)
      );
    `);

    // 2. Thay đổi bảng users nếu cột role_id chưa tồn tại
    try {
      await pool.query(`ALTER TABLE users ADD COLUMN role_id UUID REFERENCES roles(id) ON DELETE SET NULL;`);
      console.log('Added role_id to users table');
    } catch (e: any) {
      if (e.code !== '42701') { // 42701 là lỗi trùng lặp cột
        throw e;
      }
    }

    // 3. Khởi tạo dữ liệu Vai trò
    const adminRoleRes = await pool.query(`INSERT INTO roles (name, description) VALUES ('admin', 'Administrator with full access') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`);
    const userRoleRes = await pool.query(`INSERT INTO roles (name, description) VALUES ('user', 'Standard user') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`);
    
    const adminRoleId = adminRoleRes.rows[0].id;
    const userRoleId = userRoleRes.rows[0].id;

    // 4. Khởi tạo dữ liệu Quyền hạn
    const perms = ['manage_users', 'create_receipts', 'delete_receipts', 'view_receipts'];
    const permIds = [];
    for (const p of perms) {
        const res = await pool.query(`INSERT INTO permissions (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`, [p]);
        permIds.push({ name: p, id: res.rows[0].id });
    }

    // 5. Gán quyền cho các vai trò
    // Admin có tất cả quyền
    for (const p of permIds) {
        await pool.query(`INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [adminRoleId, p.id]);
    }
    // User chỉ có quyền xem và tạo phiếu
    for (const p of permIds) {
        if (p.name === 'view_receipts' || p.name === 'create_receipts') {
            await pool.query(`INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [userRoleId, p.id]);
        }
    }

    // 6. Đảm bảo người dùng admin mặc định có vai trò admin
    const passwordHash = await bcrypt.hash('123456', 10);
    const existingAdmin = await pool.query('SELECT * FROM users WHERE username = $1', ['admin']);
    
    if (existingAdmin.rows.length === 0) {
      await pool.query(
        'INSERT INTO users (username, password_hash, role_id) VALUES ($1, $2, $3)',
        ['admin', passwordHash, adminRoleId]
      );
      console.log('Admin user created and assigned admin role.');
    } else {
      await pool.query('UPDATE users SET role_id = $1 WHERE username = $2', [adminRoleId, 'admin']);
      console.log('Existing admin user assigned admin role.');
    }

    console.log('RBAC seed completed successfully');
  } catch (error) {
    console.error('Error seeding RBAC:', error);
  } finally {
    await pool.end();
  }
}

seedRbac();
