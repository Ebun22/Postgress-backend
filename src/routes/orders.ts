import { Router } from "express";
import { errorHandler } from "../error-handler";
import { authMiddleWare } from "../middlewares/auth";
import { cancelOrders, createOrder, getOrderById, listOrders } from "../controllers/orders";

const orderRoutes: Router = Router()


orderRoutes.post("/", [authMiddleWare], errorHandler(createOrder))
orderRoutes.get("/", [authMiddleWare], errorHandler(listOrders))
orderRoutes.get("/:id", [authMiddleWare], errorHandler(getOrderById))
orderRoutes.put("/:id", [authMiddleWare], errorHandler(cancelOrders))

export default orderRoutes;
