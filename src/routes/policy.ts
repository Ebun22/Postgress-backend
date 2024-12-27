import { Router } from "express";
import { errorHandler } from "../error-handler";
import { authMiddleWare }  from "../middlewares/auth";
import { adminMiddleWare } from "../middlewares/admin";
import { createPolicy, deletePolicy, getAllPolicies, getPolicyById, updatePolicy } from "../controllers/policy";


const policyRoutes: Router = Router()

policyRoutes.get("/", errorHandler(getAllPolicies))
policyRoutes.get("/:id", errorHandler(getPolicyById))
policyRoutes.post("/", [authMiddleWare, adminMiddleWare], errorHandler(createPolicy))
policyRoutes.put("/:id", [authMiddleWare, adminMiddleWare], errorHandler(updatePolicy))
policyRoutes.delete("/:id", [authMiddleWare, adminMiddleWare], errorHandler(deletePolicy))


export default policyRoutes;