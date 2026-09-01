import express from "express";
import {
    placeOrder,
    getMyOrders,
    getSellerOrders,
    updateOrderStatus,
    cancelOrder
} from "../controllers/orderController.js";
import { hashToken } from "../middlewares/hashToken.js";
import { isSeller } from "../middlewares/isSeller.js";
import { validate, orderValidationSchema } from "../validator/validator.js";

const orderRouter = express.Router();

// Buyer Protected Routes
orderRouter.post("/place", hashToken, validate(orderValidationSchema), placeOrder);
orderRouter.get("/my-orders", hashToken, getMyOrders);
orderRouter.put("/cancel/:id", hashToken, cancelOrder);

// Seller Protected Routes
orderRouter.get("/seller/orders", hashToken, isSeller, getSellerOrders);
orderRouter.put("/seller/status/:id", hashToken, isSeller, updateOrderStatus);

export default orderRouter;
