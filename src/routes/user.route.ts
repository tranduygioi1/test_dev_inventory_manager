import { Router } from 'express';
import { listUsers, createUser, deleteUser } from '../controllers/user.controller';
import { authenticateJWT, requirePermission } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);
router.use(requirePermission('manage_users'));

router.get('/', listUsers);
router.post('/create', createUser);
router.delete('/:id', deleteUser);

export default router;
