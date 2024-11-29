import { Router } from "express";
import { errorHandler } from "../error-handler";
import { authMiddleWare } from "../middlewares/auth";
import { cancelOrders, createOrder, getOrderById, listOrders } from "../controllers/orders";
import { adminMiddleWare } from "../middlewares/admin";

const catgoriesRoutes: Router = Router()


catgoriesRoutes.post("/", [authMiddleWare, adminMiddleWare], errorHandler(createOrder))
catgoriesRoutes.get("/", [authMiddleWare], errorHandler(listOrders))
catgoriesRoutes.get("/:id", [authMiddleWare], errorHandler(getOrderById))
catgoriesRoutes.put("/:id", [authMiddleWare, adminMiddleWare], errorHandler(cancelOrders))

export default catgoriesRoutes;
