import {Router} from 'express'
import { Login, signup } from '../controllers/auth.ts';

const authRoutes:Router = Router();

authRoutes.post('/signup', signup);
authRoutes.get('/login', Login);

export default authRoutes