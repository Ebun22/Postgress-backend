import { Router } from "express";
import { createProducts, deleteAllProductImage, deleteProduct, deleteProductImageById, getAllProducts, getProductById, manageCategoriesOnProduct, updateProducts } from "../controllers/products";
import { errorHandler } from "../error-handler";
import { authMiddleWare }  from "../middlewares/auth";
import { adminMiddleWare } from "../middlewares/admin";
import { upload } from "../middlewares/multer";
import { createRecipe, getRecipeById } from "../controllers/recipe";


const recipeRoutes: Router = Router()

recipeRoutes.get("/", errorHandler(getAllProducts))
recipeRoutes.get("/:id", errorHandler(getRecipeById))
recipeRoutes.post("/", upload.array('image', 3), [authMiddleWare, adminMiddleWare], errorHandler(createRecipe))
recipeRoutes.put("/:id", upload.array('images', 3), [authMiddleWare, adminMiddleWare], errorHandler(updateProducts))
recipeRoutes.patch("/:productid/", [authMiddleWare, adminMiddleWare], errorHandler(manageCategoriesOnProduct))
recipeRoutes.delete("/:id", [authMiddleWare, adminMiddleWare], errorHandler(deleteProduct))
recipeRoutes.delete("/image/:id", [authMiddleWare, adminMiddleWare], errorHandler(deleteProductImageById))
recipeRoutes.delete("/image/all/:id", [authMiddleWare, adminMiddleWare], errorHandler(deleteAllProductImage))


export default recipeRoutes;