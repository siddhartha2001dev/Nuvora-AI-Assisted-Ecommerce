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
import { isSeller } from "../middlewares/isSeller.js";
import { upload } from "../middlewares/multer.js";
import { validate, productSchema } from "../validator/validator.js";

const productRouter = express.Router();

// Public Routes (Buyer / Anyone)
productRouter.get("/all", getAllProducts);
productRouter.get("/paginate", paginateProducts);
productRouter.get("/:id/ai-summary", summarizeProductWithAI);
productRouter.get("/:id", getProductById);


// Seller Protected Routes (Requires Login Token + Seller Role)
productRouter.post("/create", hashToken, isSeller, upload.array("images", 5), validate(productSchema), createProduct);
productRouter.get("/seller/my-products", hashToken, isSeller, getSellerProducts);
productRouter.put("/update/:id", hashToken, isSeller, upload.array("images", 5), updateProduct);
productRouter.delete("/delete/:id", hashToken, isSeller, deleteProduct);

export default productRouter;
