import { Router } from "express";
import authorize from "../middlewres/auth.middleware.js";
import {
  createSubscription,
  getSubscriptionById,
  getSubscriptions,
} from "../controllers/subscription.controller.js";

Router;

const subscriptionRouter = Router();

subscriptionRouter.get("/", authorize, getSubscriptions);

subscriptionRouter.post("/", authorize, createSubscription);

subscriptionRouter.get("/:id", authorize, getSubscriptionById);

subscriptionRouter.put("/:id/cancel", (req, res) => {
  res.send({
    title: "Cancel suscription",
  });
});

export default subscriptionRouter;
