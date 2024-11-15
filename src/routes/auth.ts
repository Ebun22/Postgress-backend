import { Router } from 'express'
import { account, login, signup } from '../controllers/auth.ts';
import { errorHandler } from '../error-handler.ts';
import { authMiddleWare } from '../middlewares/auth.ts';

const authRoutes:Router = Router();

authRoutes.post('/signup', errorHandler(signup));
authRoutes.post('/login', errorHandler(login));
authRoutes.get('/account', [authMiddleWare],  errorHandler(account));

export default authRoutes