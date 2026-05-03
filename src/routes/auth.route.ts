import { Router } from 'express';
import { login, logout } from '../controllers/auth.controller';

const router = Router();

router.get('/login', (req, res) => {
  res.render('login', { layout: false });
});

router.post('/login', login);
router.post('/logout', logout);
router.get('/logout', logout); // cho phép phương thức GET để đăng xuất đơn giản hơn từ UI

export default router;
