import express from "express";
import {
  validateCoupon,
  createCoupon,
  getAllCoupons,
  toggleCouponStatus,
  deleteCoupon,
} from "../controllers/couponController.js";
import { hashToken } from "../middlewares/hashToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const couponRouter = express.Router();

// 1. Public / Buyer route to validate and calculate coupon discount
couponRouter.post("/validate", validateCoupon);

// 2. Admin / Seller protected routes to manage custom coupons
couponRouter.post("/create", hashToken, isAdmin, createCoupon);
couponRouter.get("/all", hashToken, isAdmin, getAllCoupons);
couponRouter.put("/toggle/:id", hashToken, isAdmin, toggleCouponStatus);
couponRouter.delete("/:id", hashToken, isAdmin, deleteCoupon);

export default couponRouter;
