import { Router } from "express";
import { errorHandler } from "../error-handler";
import { authMiddleWare } from "../middlewares/auth";
import { adminMiddleWare } from "../middlewares/admin";
import { createShippingAddress, deleteShippingAddress, editShippingAddress, editUser, getAllUser, getByIdShippingAddress, getShippingAddress, getUser} from "../controllers/users";

const usersRoutes: Router = Router()


usersRoutes.put("/", [authMiddleWare], errorHandler(editUser))
usersRoutes.get("/", [authMiddleWare], errorHandler(getUser))

usersRoutes.get("/", [authMiddleWare], errorHandler(getAllUser))
usersRoutes.get("/address", errorHandler(getShippingAddress))
usersRoutes.get("/address/:id", errorHandler(getByIdShippingAddress))
usersRoutes.post("/address", [authMiddleWare], errorHandler(createShippingAddress))
usersRoutes.put("/address/:id", [authMiddleWare], errorHandler(editShippingAddress))
usersRoutes.delete("/address/:id", [authMiddleWare], errorHandler(deleteShippingAddress))



export default usersRoutes;