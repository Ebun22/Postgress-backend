import { Router } from "express";
import { errorHandler } from "../error-handler";
import { authMiddleWare } from "../middlewares/auth";
import { createCheckout, createOrder, deleteOrder, EditOrderStatus, getOrderById, listOrders, totalOnOrderDashboard } from "../controllers/orders";
import { adminMiddleWare } from "../middlewares/admin";

const orderRoutes: Router = Router()


orderRoutes.get("/", [authMiddleWare], errorHandler(listOrders))
orderRoutes.get("/total", [authMiddleWare, adminMiddleWare], errorHandler(totalOnOrderDashboard))
orderRoutes.post("/", [authMiddleWare], errorHandler(createOrder))
orderRoutes.post("/:orderId/checkout", [authMiddleWare], errorHandler(createCheckout))
orderRoutes.post("/:orderId/stripe/webhook", [authMiddleWare], errorHandler(createCheckout))
orderRoutes.get("/:id", [authMiddleWare], errorHandler(getOrderById))
orderRoutes.get("/search/:search", [authMiddleWare], errorHandler(getOrderById))
orderRoutes.put("/:id", [authMiddleWare], errorHandler(EditOrderStatus))
orderRoutes.delete("/:id",[authMiddleWare, adminMiddleWare], errorHandler(deleteOrder))

export default orderRoutes;
