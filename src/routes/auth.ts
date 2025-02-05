import { Router } from 'express'
import { forgotPassword, getOTP, login, OTPLogin, signup } from '../controllers/auth.ts';
import { errorHandler } from '../error-handler.ts';
import { authMiddleWare } from '../middlewares/auth.ts';

const authRoutes:Router = Router();

authRoutes.post('/signup', errorHandler(signup));
authRoutes.post('/login', errorHandler(login));
authRoutes.post('/forgotpassword', errorHandler(forgotPassword));
authRoutes.post('/login/getotp', errorHandler(getOTP));
authRoutes.post('/login/otp', errorHandler(OTPLogin));
authRoutes.patch('/resetPassword/:token', errorHandler(forgotPassword));

export default authRoutes