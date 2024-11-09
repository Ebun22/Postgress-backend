import { Router } from "express";
import { createProducts } from "../controllers/products";

const productRouter: Router = Router()

productRouter.post("/", createProducts)