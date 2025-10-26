import { Router } from "express";
import {
  createCategory,
  getCategories,
  getCategoryByName,
} from "../controllers/category.contoller.js";
import {
  createProduct,
  getProducts,
  updateProduct,
} from "../controllers/product.controller.js";

const productRouter = Router();

// create category
productRouter.post("/categories", createCategory);

// get category
productRouter.get("/categories", getCategories);

// get category by name
productRouter.get("/categories/:name", getCategoryByName);

// create product
productRouter.post("/", createProduct);

// get product
productRouter.get("/", getProducts);

// Update product
productRouter.patch("/", updateProduct);

export default productRouter;
