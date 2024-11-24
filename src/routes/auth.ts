import { Router } from 'express'
import { login, signup } from '../controllers/auth.ts';
import { errorHandler } from '../error-handler.ts';
import { authMiddleWare } from '../middlewares/auth.ts';

const authRoutes:Router = Router();

authRoutes.post('/signup', errorHandler(signup));
authRoutes.post('/login', errorHandler(login));

export default authRoutes