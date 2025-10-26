import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import mongoose from "mongoose";
// ✅ Create new product
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, features, imageUrl } = req.body;

    // Check if category exists
    const existingCategory = await Category.findById(category);
    if (!existingCategory) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category ID" });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      features,
      imageUrl,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
};

// get products

export const getProducts = async (req, res, next) => {
  try {
    const { category, search } = req.query;

    let filter = { isActive: true };

    if (category) {
      // Check if category is a valid ObjectId (ID) or a string (name)
      if (mongoose.Types.ObjectId.isValid(category)) {
        // If it's an ObjectId, search by category ID
        filter.category = category;
      } else {
        // If it's a string, search by category name
        filter.category = { $regex: category, $options: "i" };
      }
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .populate("category", "name")
      .select("-metadata");

    res.status(200).json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error) {
    next(error);
  }
};

// get product by category
export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.query;

    // If no category is passed, just return all products
    if (!category) {
      const allProducts = await Product.find().populate("category");
      return res.status(200).json({
        success: true,
        message: "All products fetched successfully",
        data: allProducts,
      });
    }

    // ✅ Find the category by name (since name is unique)
    const categoryDoc = await Category.findOne({
      name: category.trim().toLowerCase(),
    });
    if (!categoryDoc) {
      return res.status(404).json({
        success: false,
        message: `Category '${category}' not found`,
      });
    }

    // ✅ Find all products in that category
    const products = await Product.find({ category: categoryDoc._id }).populate(
      "category"
    );

    return res.status(200).json({
      success: true,
      message: `Products for category '${category}' fetched successfully`,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching products",
    });
  }
};

// ✅ Update product
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const product = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};
