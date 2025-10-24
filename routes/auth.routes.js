import { Router } from "express";
import { signIn, signOut, signUp } from "../controllers/auth.controller.js";
import { requestAdminOtp } from "../admin/controllers/admin.requestOtp.controller.js";
import { verifyAdminOtp } from "../admin/controllers/admin.verifyOtp.controller.js";
const authRouter = Router();

// path: api/v1/auth
authRouter.post("/admin/request-otp", requestAdminOtp);
authRouter.post("/admin/verify-otp", verifyAdminOtp);

authRouter.post("/sign-up", signUp);
authRouter.post("/sign-in", signIn);
authRouter.post("/sign-out", signOut);

export default authRouter;
