import { Router } from "express";
import { errorHandler } from "../error-handler";
import { authMiddleWare } from "../middlewares/auth";
import { cancelOrders, createOrder, getOrderById, listOrders } from "../controllers/orders";

const orderRoutes: Router = Router()


orderRoutes.get("/", [authMiddleWare], errorHandler(listOrders))
orderRoutes.post("/", [authMiddleWare], errorHandler(createOrder))
// orderRoutes.post("/:orderId/checkout", [authMiddleWare], errorHandler(createCheckout))
orderRoutes.get("/:id", [authMiddleWare], errorHandler(getOrderById))
orderRoutes.put("/:id", [authMiddleWare], errorHandler(cancelOrders))

export default orderRoutes;
