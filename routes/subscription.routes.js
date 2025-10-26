import { Router } from "express";
import authorize from "../middlewres/auth.middleware.js";
import {
  cancelSubscription,
  createSubscription,
  getSubscriptionById,
  getSubscriptions,
} from "../controllers/subscription.controller.js";
import {
  initializeSubscriptionPayment,
  // verifySubscriptionPayment,
} from "../controllers/payment.controller.js";

Router;

const subscriptionRouter = Router();

subscriptionRouter.get("/", authorize, getSubscriptions);

subscriptionRouter.post("/", authorize, createSubscription);

subscriptionRouter.get("/:id", authorize, getSubscriptionById);

subscriptionRouter.put("/:id/cancel", authorize, cancelSubscription);

// Payment routes
subscriptionRouter.post(
  "/initialize-payment",
  authorize,
  initializeSubscriptionPayment
);
// subscriptionRouter.post(
//   "/verify-payment",
//   authorize,
//   verifySubscriptionPayment
// );

// Webhook route (no authentication needed)
// subscriptionRouter.post("/webhook/paystack", handlePaystackWebhook);

export default subscriptionRouter;
