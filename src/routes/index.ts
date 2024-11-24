import { Router } from 'express';
import authRoutes from './auth';
import productsRoutes from './products';
import usersRoutes from './users';
import cartRoutes from './cart';
import orderRoutes from './orders';

const rootRouter: Router = Router();

rootRouter.use('/auth', authRoutes)
rootRouter.use('/product', productsRoutes)
rootRouter.use('/user', usersRoutes)
rootRouter.use('/cart', cartRoutes)
rootRouter.use('/order', orderRoutes)

export default rootRouter;