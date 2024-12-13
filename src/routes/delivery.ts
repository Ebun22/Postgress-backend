import { Router } from "express";
import { createProducts, deleteAllProductImage, deleteProduct, deleteProductImageById, getAllProducts, getProductById, manageCategoriesOnProduct, updateProducts } from "../controllers/products";
import { errorHandler } from "../error-handler";
import { authMiddleWare }  from "../middlewares/auth";
import { adminMiddleWare } from "../middlewares/admin";
import { upload } from "../middlewares/multer";
import { createDelivery, deleteDelivery, getAllDelivery, getDeliveryById } from "../controllers/delivery";


const deliveryRoutes: Router = Router()

deliveryRoutes.get("/", errorHandler(getAllDelivery))
deliveryRoutes.get("/:id", errorHandler(getDeliveryById))
deliveryRoutes.post("/", upload.array('images', 3), [authMiddleWare, adminMiddleWare], errorHandler(createDelivery))
deliveryRoutes.put("/:id", upload.array('images', 3), [authMiddleWare, adminMiddleWare], errorHandler(updateProducts))
deliveryRoutes.patch("/:productid/", [authMiddleWare, adminMiddleWare], errorHandler(manageCategoriesOnProduct))
deliveryRoutes.delete("/:id", [authMiddleWare, adminMiddleWare], errorHandler(deleteDelivery))


export default deliveryRoutes;