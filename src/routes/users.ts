import { Router } from "express";
import { errorHandler } from "../error-handler";
import { authMiddleWare } from "../middlewares/auth";
import { adminMiddleWare } from "../middlewares/admin";
import { createShippingAddress, deleteShippingAddress, editShippingAddress, editUser, getAllUser, getByIdShippingAddress, getCustomersBySearch, getShippingAddress, getTotalOnDashboard, getUser, getUserById} from "../controllers/users";

const usersRoutes: Router = Router()



usersRoutes.get("/address", [authMiddleWare], errorHandler(getShippingAddress))
usersRoutes.get("/all/", [authMiddleWare, adminMiddleWare], errorHandler(getAllUser))
usersRoutes.get("/total/", [authMiddleWare, adminMiddleWare], errorHandler(getTotalOnDashboard))
usersRoutes.get("/address/:id", errorHandler(getByIdShippingAddress))
usersRoutes.post("/address", [authMiddleWare], errorHandler(createShippingAddress))
usersRoutes.put("/address/:id", [authMiddleWare], errorHandler(editShippingAddress))
usersRoutes.delete("/address/:id", [authMiddleWare], errorHandler(deleteShippingAddress))

usersRoutes.put("/", [authMiddleWare], errorHandler(editUser))
usersRoutes.get("/", [authMiddleWare], errorHandler(getUser))
usersRoutes.get("/:id", [authMiddleWare, adminMiddleWare], errorHandler(getUserById))
usersRoutes.get("/search/:search", [authMiddleWare, adminMiddleWare], errorHandler(getCustomersBySearch))

export default usersRoutes;