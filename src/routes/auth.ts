import {RequestHandler, Router} from 'express'
import { login, signup } from '../controllers/auth.ts';
import { errorHandler } from '../error-handler.ts';

const authRoutes:Router = Router();

authRoutes.post('/signup', errorHandler(signup));
authRoutes.post('/login', login);

export default authRoutes