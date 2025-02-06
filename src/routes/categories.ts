import { Router } from "express";
import { errorHandler } from "../error-handler";
import { authMiddleWare } from "../middlewares/auth";
import { adminMiddleWare } from "../middlewares/admin";
import { createCategories, deleteCategories, getAllCategories, getCategoriesById, getCategoryBySearch, updateCategory } from "../controllers/categories";

const categoryRoutes: Router = Router()
categoryRoutes.post("/", [authMiddleWare, adminMiddleWare], errorHandler(createCategories))
categoryRoutes.put("/:id", [authMiddleWare, adminMiddleWare], errorHandler(updateCategory))
categoryRoutes.get("/", errorHandler(getAllCategories))
categoryRoutes.get("/search/:search", errorHandler(getCategoryBySearch))
categoryRoutes.get("/:id", errorHandler(getCategoriesById))
categoryRoutes.delete("/:id", [authMiddleWare, adminMiddleWare], errorHandler(deleteCategories))

export default categoryRoutes;
