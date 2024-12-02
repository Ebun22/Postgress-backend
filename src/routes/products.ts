import { Router } from "express";
import { createProducts, deleteProduct, getAllProducts, getProductById, manageCategoriesOnProduct, updateProducts } from "../controllers/products";
import { errorHandler } from "../error-handler";
import { authMiddleWare }  from "../middlewares/auth";
import { adminMiddleWare } from "../middlewares/admin";

const productsRoutes: Router = Router()

productsRoutes.get("/", errorHandler(getAllProducts))
productsRoutes.get("/:id", errorHandler(getProductById))
productsRoutes.post("/", [authMiddleWare, adminMiddleWare], errorHandler(createProducts))
productsRoutes.put("/:id", [authMiddleWare, adminMiddleWare], errorHandler(updateProducts))
productsRoutes.patch("/:productid/", [authMiddleWare, adminMiddleWare], errorHandler(manageCategoriesOnProduct))
productsRoutes.delete("/:id", [authMiddleWare, adminMiddleWare], errorHandler(deleteProduct))



export default productsRoutes;