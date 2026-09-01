import express from "express";
import {
    addReview,
    getProductReviews,
    getMyReviews,
    deleteReview
} from "../controllers/reviewController.js";
import { hashToken } from "../middlewares/hashToken.js";
import { validate, reviewValidationSchema } from "../validator/validator.js";

const reviewRouter = express.Router();

// Public Route
reviewRouter.get("/product/:productId", getProductReviews);

// Protected Routes
reviewRouter.post("/add", hashToken, validate(reviewValidationSchema), addReview);
reviewRouter.get("/my-reviews", hashToken, getMyReviews);
reviewRouter.delete("/delete/:id", hashToken, deleteReview);

export default reviewRouter;
