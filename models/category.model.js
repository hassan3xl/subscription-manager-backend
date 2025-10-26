// models/Category.js
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
      unique: true,
    },
  },
  {
    timestamps: true, // ✅ Corrected: was 'Timestamp'
  }
);

const Category = mongoose.model("Category", categorySchema);
export default Category;
