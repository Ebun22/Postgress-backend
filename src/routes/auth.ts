import { Router } from 'express'
import { account, login, signup } from '../controllers/auth.ts';
import { errorHandler } from '../error-handler.ts';
import { unauthorized } from '../middlewares/auth.ts';

const authRoutes:Router = Router();

authRoutes.post('/signup', errorHandler(signup));
authRoutes.post('/login', errorHandler(login));
authRoutes.get('/account', [unauthorized],  errorHandler(account));

export default authRoutes