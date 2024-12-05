import { Router } from "express";
import { createProducts, deleteAllProductImage, deleteProduct, deleteProductImageById, getAllProducts, getProductById, manageCategoriesOnProduct, updateProducts } from "../controllers/products";
import { errorHandler } from "../error-handler";
import { authMiddleWare }  from "../middlewares/auth";
import { adminMiddleWare } from "../middlewares/admin";
import { upload } from "../middlewares/multer";


const productsRoutes: Router = Router()

productsRoutes.get("/", errorHandler(getAllProducts))
productsRoutes.get("/:id", errorHandler(getProductById))
productsRoutes.post("/", upload.array('images', 3), [authMiddleWare, adminMiddleWare], errorHandler(createProducts))
productsRoutes.put("/:id", [authMiddleWare, adminMiddleWare], errorHandler(updateProducts))
productsRoutes.patch("/:productid/", [authMiddleWare, adminMiddleWare], errorHandler(manageCategoriesOnProduct))
productsRoutes.delete("/:id", [authMiddleWare, adminMiddleWare], errorHandler(deleteProduct))
productsRoutes.delete("/:id", [authMiddleWare, adminMiddleWare], errorHandler(deleteProductImageById))
productsRoutes.delete("/:id", [authMiddleWare, adminMiddleWare], errorHandler(deleteAllProductImage))



export default productsRoutes;