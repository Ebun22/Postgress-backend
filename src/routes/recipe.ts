import { Router } from "express";
import { errorHandler } from "../error-handler";
import { authMiddleWare }  from "../middlewares/auth";
import { adminMiddleWare } from "../middlewares/admin";
import { upload } from "../middlewares/multer";
import { createRecipe, deleteAllRecipeImage, deleteRecipe, deleteRecipeImageById, getAllRecipes, getRecipeById, getRecipesBySearch, updateRecipe } from "../controllers/recipe";


const recipeRoutes: Router = Router()

recipeRoutes.get("/", errorHandler(getAllRecipes))
recipeRoutes.get("/search/:search", errorHandler(getRecipesBySearch))
recipeRoutes.get("/:id", errorHandler(getRecipeById))
recipeRoutes.post("/", upload.array('image', 3), [authMiddleWare, adminMiddleWare], errorHandler(createRecipe))
recipeRoutes.put("/:id", upload.array('image', 3), [authMiddleWare, adminMiddleWare], errorHandler(updateRecipe))
recipeRoutes.delete("/:id", [authMiddleWare, adminMiddleWare], errorHandler(deleteRecipe))
recipeRoutes.delete("/image/:id", [authMiddleWare, adminMiddleWare], errorHandler(deleteRecipeImageById))
recipeRoutes.delete("/image/all/:id", [authMiddleWare, adminMiddleWare], errorHandler(deleteAllRecipeImage))


export default recipeRoutes;    