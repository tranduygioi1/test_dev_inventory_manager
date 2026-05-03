import { Router } from 'express';
import { listRoles, createRole, deleteRole, updateRolePermissions } from '../controllers/role.controller';
import { authenticateJWT, requirePermission } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);
router.use(requirePermission('manage_roles'));

router.get('/', listRoles);
router.post('/create', createRole);
router.delete('/:id', deleteRole);
router.post('/:id/permissions', updateRolePermissions);

export default router;
