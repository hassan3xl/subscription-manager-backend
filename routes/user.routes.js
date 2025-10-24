import { Router } from "express";
import {
  getUser,
  getUsers,
} from "../admin/controllers/admin.user.controller.js";
import authorize from "../middlewres/auth.middleware.js";

const userRouter = Router();

// get all users
userRouter.get("/", getUsers);

// get user by id
userRouter.get("/:id", authorize, getUser);

// create new user
userRouter.post("/", (req, res) => {
  res.send({
    title: "create new user",
  });
});

userRouter.put("/:id", (req, res) => {
  res.send({
    title: "UPDATE user by id",
  });
});

userRouter.delete("/:id", (req, res) => {
  res.send({
    title: "get user by id",
  });
});

export default userRouter;
