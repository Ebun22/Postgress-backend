import { Router } from "express";
import { errorHandler } from "../error-handler";
import { authMiddleWare }  from "../middlewares/auth";
import { adminMiddleWare } from "../middlewares/admin";
import { addFAQ, createPolicy, deleteFAQ, deletePolicy, getAllFAQ, getAllPolicies, getFAQById, getPolicyById, updateFAQ, updatePolicy } from "../controllers/policy";


const policyRoutes: Router = Router()

policyRoutes.get("/faq", errorHandler(getAllFAQ))
policyRoutes.get("/faq/:id", errorHandler(getFAQById))
policyRoutes.post("/faq/", [authMiddleWare, adminMiddleWare], errorHandler(addFAQ))
policyRoutes.put("/faq/:id", [authMiddleWare, adminMiddleWare], errorHandler(updateFAQ))
policyRoutes.delete("/faq/:id", [authMiddleWare, adminMiddleWare], errorHandler(deleteFAQ))

policyRoutes.get("/", errorHandler(getAllPolicies))
policyRoutes.get("/:id", errorHandler(getPolicyById))
policyRoutes.post("/", [authMiddleWare, adminMiddleWare], errorHandler(createPolicy))
policyRoutes.put("/:id", [authMiddleWare, adminMiddleWare], errorHandler(updatePolicy))
policyRoutes.delete("/:id", [authMiddleWare, adminMiddleWare], errorHandler(deletePolicy))


export default policyRoutes;