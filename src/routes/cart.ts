import { Router } from "express";
import { errorHandler } from "../error-handler";
import { authMiddleWare } from "../middlewares/auth";
import { addItemToCart, changeQuantity, deleteItemFromCart, getCart } from "../controllers/cart";

const cartRoutes: Router = Router()


cartRoutes.post("/", [authMiddleWare], errorHandler(addItemToCart))
cartRoutes.get("/", [authMiddleWare], errorHandler(getCart))
cartRoutes.put("/:id", [authMiddleWare], errorHandler(changeQuantity))
cartRoutes.delete("/:id", [authMiddleWare], errorHandler(deleteItemFromCart))

export default cartRoutes;
