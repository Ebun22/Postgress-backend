import { Router } from "express";
import { errorHandler } from "../error-handler";
import { authMiddleWare }  from "../middlewares/auth";
import { adminMiddleWare } from "../middlewares/admin";
import { upload } from "../middlewares/multer";
import { addToWishlist, getAllWishlist } from "../controllers/wishlist";


const wishlistRoutes: Router = Router()

wishlistRoutes.get("/", errorHandler(getAllWishlist))
// wishlistRoutes.get("/:id", errorHandler(getProductById))
wishlistRoutes.post("/", [authMiddleWare], errorHandler(addToWishlist))
// wishlistRoutes.put("/:id", upload.array('images', 3), [authMiddleWare, adminMiddleWare], errorHandler(updateProducts))
// wishlistRoutes.patch("/:productid/", [authMiddleWare, adminMiddleWare], errorHandler(manageCategoriesOnProduct))
// wishlistRoutes.delete("/:id", [authMiddleWare, adminMiddleWare], errorHandler(deleteProduct))
// wishlistRoutes.delete("/image/:id", [authMiddleWare, adminMiddleWare], errorHandler(deleteProductImageById))
// wishlistRoutes.delete("/image/all/:id", [authMiddleWare, adminMiddleWare], errorHandler(deleteAllProductImage))



export default wishlistRoutes;