import express from "express";
import {
    createProduct,
    getAllProducts,
    paginateProducts,
    getProductById,
    getSellerProducts,
    updateProduct,
    deleteProduct,
    summarizeProductWithAI
} from "../controllers/productController.js";
import { hashToken } from "../middlewares/hashToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { upload } from "../middlewares/multer.js";
import { validate, productSchema } from "../validator/validator.js";

const productRouter = express.Router();

// Public Routes (Buyer / Anyone)
productRouter.get("/all", getAllProducts);
productRouter.get("/paginate", paginateProducts);
productRouter.get("/:id/ai-summary", summarizeProductWithAI);
productRouter.get("/:id", getProductById);

// Admin Protected Routes (Requires Login Token + Admin Role)
productRouter.post("/create", hashToken, isAdmin, upload.array("images", 5), validate(productSchema), createProduct);
productRouter.get("/seller/my-products", hashToken, isAdmin, getSellerProducts);
productRouter.put("/update/:id", hashToken, isAdmin, upload.array("images", 5), updateProduct);
productRouter.delete("/delete/:id", hashToken, isAdmin, deleteProduct);

export default productRouter;
