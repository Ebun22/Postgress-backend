import { Router } from 'express';
import authRoutes from './auth';
import productsRoutes from './products';
import usersRoutes from './users';
import cartRoutes from './cart';
import orderRoutes from './orders';
import categoryRoutes from './categories';
import recipeRoutes from './recipe';
import deliveryRoutes from './delivery';
import wishlistRoutes from './wishlist';
import rateRoutes from './exchangeRate';

const rootRouter: Router = Router();

rootRouter.use('/auth', authRoutes)
rootRouter.use('/product', productsRoutes)
rootRouter.use('/user', usersRoutes)
rootRouter.use('/cart', cartRoutes)
rootRouter.use('/order', orderRoutes)
rootRouter.use('/category', categoryRoutes)
rootRouter.use('/recipe', recipeRoutes)
rootRouter.use('/delivery', deliveryRoutes)
rootRouter.use('/wishlist', wishlistRoutes)
rootRouter.use('/rate', rateRoutes)

export default rootRouter;