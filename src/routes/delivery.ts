import { Router } from "express";
import { errorHandler } from "../error-handler";
import { authMiddleWare }  from "../middlewares/auth";
import { adminMiddleWare } from "../middlewares/admin";
import { upload } from "../middlewares/multer";
import { createDelivery, deleteDelivery, getAllDelivery, getDeliveryById, updateDelivery } from "../controllers/delivery";


const deliveryRoutes: Router = Router()

deliveryRoutes.get("/", errorHandler(getAllDelivery))
deliveryRoutes.get("/:id", errorHandler(getDeliveryById))
deliveryRoutes.post("/", [authMiddleWare, adminMiddleWare], errorHandler(createDelivery))
deliveryRoutes.put("/:id", [authMiddleWare, adminMiddleWare], errorHandler(updateDelivery))
deliveryRoutes.delete("/:id", [authMiddleWare, adminMiddleWare], errorHandler(deleteDelivery))


export default deliveryRoutes;