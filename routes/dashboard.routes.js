import { Router } from "express";
import { getUserDashboard } from "../controllers/dashboard.controller.js";
import authorize from "../middlewres/auth.middleware.js";

const dashboardRouter = Router();

// GET /api/v1/dashboard
dashboardRouter.get("/", authorize, getUserDashboard);

export default dashboardRouter;
