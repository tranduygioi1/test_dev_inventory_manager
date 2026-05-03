import { Request, Response } from 'express';
import pool from '../db';

export const listRoles = async (req: Request, res: Response) => {
  try {
    const rolesResult = await pool.query('SELECT * FROM roles ORDER BY name');
    const permissionsResult = await pool.query('SELECT * FROM permissions ORDER BY name');
    const rolePermissionsResult = await pool.query('SELECT role_id, permission_id FROM role_permissions');

    const permissions = permissionsResult.rows;
    
    // Ánh xạ quyền hạn vào vai trò
    const roles = rolesResult.rows.map(role => {
      const rolePermIds = rolePermissionsResult.rows
        .filter(rp => rp.role_id === role.id)
        .map(rp => rp.permission_id);
      
      role.permissions = permissions.map(p => ({
        id: p.id,
        name: p.name,
        hasPermission: rolePermIds.includes(p.id)
      }));
      return role;
    });

    res.render('roles/list', { roles, allPermissions: permissions });
  } catch (error) {
    console.error('[ROLE_LIST_ERROR]:', error);
    res.status(500).send('Server Error');
  }
};

export const createRole = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).send('Name is required');
    }
    await pool.query('INSERT INTO roles (name, description) VALUES ($1, $2)', [name, description]);
    res.redirect('/roles');
  } catch (error) {
    console.error('[ROLE_CREATE_ERROR]:', error);
    res.status(500).send('Error creating role');
  }
};

export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Kiểm tra xem vai trò có đang được sử dụng không
    const userCheck = await pool.query('SELECT id FROM users WHERE role_id = $1 LIMIT 1', [id]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Cannot delete role because it is assigned to users.' });
    }
    await pool.query('DELETE FROM roles WHERE id = $1', [id]);
    res.status(200).json({ message: 'Role deleted' });
  } catch (error) {
    console.error('[ROLE_DELETE_ERROR]:', error);
    res.status(500).json({ error: 'Error deleting role' });
  }
};

export const updateRolePermissions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body; 

    await pool.query('BEGIN');
    
    await pool.query('DELETE FROM role_permissions WHERE role_id = $1', [id]);
    
    const permsArray = permissions ? (Array.isArray(permissions) ? permissions : [permissions]) : [];
    
    for (const permId of permsArray) {
      await pool.query('INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)', [id, permId]);
    }

    await pool.query('COMMIT');

    const roleRes = await pool.query('SELECT name FROM roles WHERE id = $1', [id]);
    const roleName = roleRes.rows[0]?.name || 'Unknown';
    
    let permNames = [];
    if (permsArray.length > 0) {
      const pRes = await pool.query('SELECT name FROM permissions WHERE id = ANY($1)', [permsArray]);
      permNames = pRes.rows.map(r => r.name);
    }
    
    console.log(`\n=== [ROLE PERMISSIONS UPDATED] ===`);
    console.log(`By User: ${(req as any).user ? (req as any).user.username : 'Unknown'}`);
    console.log(`Role: ${roleName}`);
    console.log(`Permissions Assigned: ${permNames.length > 0 ? permNames.join(', ') : 'None'}`);
    console.log(`===================================\n`);

    res.redirect('/roles');
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('[ROLE_UPDATE_PERMS_ERROR]:', error);
    res.status(500).send('Error updating permissions');
  }
};
