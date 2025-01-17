import { Router } from "express";
import { errorHandler } from "../error-handler";
import { authMiddleWare }  from "../middlewares/auth";
import { adminMiddleWare } from "../middlewares/admin";
import { upload } from "../middlewares/multer";
import { addToWishlist, getAllWishlist, removeFromWishlist } from "../controllers/wishlist";


const wishlistRoutes: Router = Router()

wishlistRoutes.get("/", errorHandler(getAllWishlist))
wishlistRoutes.post("/", [authMiddleWare], errorHandler(addToWishlist))
wishlistRoutes.delete("/:id", [authMiddleWare], errorHandler(removeFromWishlist))



export default wishlistRoutes;