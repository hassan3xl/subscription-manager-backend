import { Router } from "express";
import {
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} from "../admin/controllers/admin.user.controller.js";
import {
  deleteSubscription,
  getSubscriptionById,
  getSubscriptions,
  updateSubscription,
} from "../admin/controllers/admin.subscription.controller.js";
import { adminAuth } from "../middlewres/auth.middleware.js";
import { getAdminDashboard } from "../admin/controllers/admin.dashboard.controller.js";

const adminRouter = Router();

// ADMIN USERS ROUTES

// dashboard
adminRouter.get("/dashboard", getAdminDashboard);
// get all users
adminRouter.get("/users", getUsers);
// get user by id
adminRouter.get("/users/:id", getUser);

// update user
adminRouter.patch("/users/:id", updateUser);
// delete user
adminRouter.delete("/users/:id", deleteUser);

// ADMIN SUBSCRIPTIONS ROUTES
// get all subscriptions
adminRouter.get("/subscriptions", getSubscriptions);
// get subscription by id
adminRouter.get("/subscriptions/:id", getSubscriptionById);
// update subscription
adminRouter.patch("/subscriptions/:id", updateSubscription);
// delete subscription
adminRouter.delete("/subscriptions/:id", deleteSubscription);

export default adminRouter;
