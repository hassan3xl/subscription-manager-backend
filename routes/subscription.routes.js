import { Router } from "express";
import authorize from "../middlewres/auth.middleware.js";
import {
  cancelSubscription,
  createSubscription,
  getSubscriptionById,
  getSubscriptions,
} from "../controllers/subscription.controller.js";

Router;

const subscriptionRouter = Router();

subscriptionRouter.get("/", authorize, getSubscriptions);

subscriptionRouter.post("/", authorize, createSubscription);

subscriptionRouter.get("/:id", authorize, getSubscriptionById);

subscriptionRouter.put("/:id/cancel", authorize, cancelSubscription);

export default subscriptionRouter;
