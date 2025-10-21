import mongoose from "mongoose";
import { DB_URI, NODE_ENV } from "../config/env.js";

if (!DB_URI) {
  throw new Error(
    "plese provide a database url either development or production"
  );
}

const connectToDb = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log(`🚀 Database connected on ${NODE_ENV} mode`);
  } catch (error) {
    console.log(error);
  }
};

export default connectToDb;
