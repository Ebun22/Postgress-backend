import { Router } from "express";
import { errorHandler } from "../error-handler";
import { authMiddleWare } from "../middlewares/auth";
import { adminMiddleWare } from "../middlewares/admin";
import { createCategories, deleteCategories, getAllCategories, getCategoriesById, updateCategory } from "../controllers/categories";

const categoryRoutes: Router = Router()
//d66e30b2-07b8-46a1-83bc-d6aa175d306d

categoryRoutes.post("/", [authMiddleWare, adminMiddleWare], errorHandler(createCategories))
categoryRoutes.put("/:id", [authMiddleWare, adminMiddleWare], errorHandler(updateCategory))
categoryRoutes.get("/", [authMiddleWare], errorHandler(getAllCategories))
categoryRoutes.get("/:id", [authMiddleWare], errorHandler(getCategoriesById))
categoryRoutes.delete("/:id", [authMiddleWare, adminMiddleWare], errorHandler(deleteCategories))

export default categoryRoutes;
