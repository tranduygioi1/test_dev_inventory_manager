import express from 'express';
import cors from 'cors';
import { engine } from 'express-handlebars';
import path from 'path';
import cookieParser from 'cookie-parser';
import receiptRoutes from './routes/receipt.route';
import authRoutes from './routes/auth.route';
import { authenticateJWT, requirePermission } from './middlewares/auth.middleware';

const app = express();

// Các Middleware (Thành phần trung gian)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../src/public')));

// Cấu hình Handlebars (Template Engine)
app.engine('.handlebars', engine({ 
  extname: '.handlebars',
  helpers: {
    hasPerm: function(array: string[], value: string) {
      if (!array || !Array.isArray(array)) return false;
      return array.includes(value);
    },
    eq: function(a: any, b: any) { return a === b; }
  }
}));
app.set('view engine', '.handlebars');
app.set('views', path.join(__dirname, '../src/views'));

import userRoutes from './routes/user.route';
import roleRoutes from './routes/role.route';

// Các định tuyến (Routes)
app.use('/', authRoutes);
app.use('/users', userRoutes);
app.use('/roles', roleRoutes);
app.use('/api/receipts', authenticateJWT, receiptRoutes);

// Các định tuyến cho giao diện (View Routes)
app.get('/', authenticateJWT, (req, res) => {
  res.render('home');
});

app.get('/list', authenticateJWT, (req, res) => {
  res.render('list');
});

app.get('/view/:id', authenticateJWT, (req, res) => {
  res.render('detail', { id: req.params.id });
});

export default app;
