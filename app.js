import express from "express";
import { PORT } from "./config/env.js";
import authRouter from "./routes/auth.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import connectToDb from "./database/mongodb.js";
import errorMiddleware from "./middlewres/error.middleware.js";
import cookieParser from "cookie-parser";
import workflowRouter from "./routes/workflow.routes.js";
import corsMiddleware from "./middlewres/cors.middleware.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import adminRouter from "./routes/admin.routes.js";
import webhookRouter from "./routes/webhook.route.js";
import productRouter from "./routes/product.routes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static("public"));
// app.use(arcjetMiddleware);
app.use(corsMiddleware);

app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/workflows", workflowRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/webhook", webhookRouter);

app.use(errorMiddleware);

app.listen(PORT, async () => {
  console.log(`🚀 App listening on port ${PORT}`);
  await connectToDb();
});

export default app;
