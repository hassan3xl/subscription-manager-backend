import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const signUp = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, email, password } = req.body;

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("User already exists");
      error.statusCode = 400;
      throw error;
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create new user and save with session
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save({ session });

    // generate token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
      token,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      const error = new Error("Incorrect password");
      error.statusCode = 401;
      throw error;
    } else {
      if (user && isPasswordCorrect) {
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRES_IN,
        });
        res.status(200).json({
          success: true,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
          },
          token,
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

export const signOut = async (req, res, next) => {
  res.send({
    title: "Sign out",
  });
};
