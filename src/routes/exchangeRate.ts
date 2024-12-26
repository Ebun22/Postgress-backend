import { Router } from "express";
import { errorHandler } from "../error-handler";
import { authMiddleWare }  from "../middlewares/auth";
import { adminMiddleWare } from "../middlewares/admin";
import { upload } from "../middlewares/multer";
import { addToWishlist, getAllWishlist } from "../controllers/wishlist";
import { addCurrency, createExchangeRate, getAllCurrency } from "../controllers/exchangeRate";


const rateRoutes: Router = Router()

rateRoutes.post("/currency", errorHandler(addCurrency))
rateRoutes.get("/currency", errorHandler(getAllCurrency))

//Exchange Rate
rateRoutes.post("/", errorHandler(createExchangeRate))
// rateRoutes.get("/", errorHandler(addCurrency))
// rateistRoutes.get("/:id", errorHandler(getProductById))
rateRoutes.post("/", [authMiddleWare], errorHandler(addToWishlist))


export default rateRoutes;