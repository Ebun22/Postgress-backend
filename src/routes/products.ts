import { Router } from "express";
import { addProductToTrash, createProducts, deleteProduct, getAllProducts, getAllTrash, getProductById, updateProducts } from "../controllers/products";
import { errorHandler } from "../error-handler";
import { authMiddleWare }  from "../middlewares/auth";
import { adminMiddleWare } from "../middlewares/admin";

const productsRoutes: Router = Router()

productsRoutes.get("/", errorHandler(getAllProducts))
productsRoutes.get("/trash", errorHandler(getAllTrash))
productsRoutes.get("/:id", errorHandler(getProductById))
productsRoutes.post("/", [authMiddleWare, adminMiddleWare], errorHandler(createProducts))
productsRoutes.put("/:id", [authMiddleWare, adminMiddleWare], errorHandler(updateProducts))
productsRoutes.delete("/:id", [authMiddleWare, adminMiddleWare], errorHandler(deleteProduct))
productsRoutes.delete("/:id/trash", [authMiddleWare, adminMiddleWare], errorHandler(addProductToTrash))



export default productsRoutes;