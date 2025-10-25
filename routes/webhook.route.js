// routes/webhook.route.js
import { Router } from "express";
import { handleMonnifyWebhook } from "../controllers/monnifyWebhook.controller.js";

const webhookRouter = Router();

webhookRouter.post("/monnify", handleMonnifyWebhook);

export default webhookRouter;
