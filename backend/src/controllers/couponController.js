import couponSchema from "../models/couponSchema.js";

/**
 * 1. Validate and Apply Coupon Code (Public/Buyer)
 * Validates active status, expiry, min purchase, and calculates discount
 */
export const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount = 0 } = req.body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid coupon code",
      });
    }

    const cleanCode = code.trim().toUpperCase();
    const amount = Number(orderAmount) || 0;

    let coupon = await couponSchema.findOne({ code: cleanCode });

    // Auto-seed NUVORA10 default welcome coupon if missing
    if (!coupon && cleanCode === "NUVORA10") {
      coupon = await couponSchema.create({
        code: "NUVORA10",
        description: "Welcome 10% discount on orders over ₹500",
        discountType: "percentage",
        discountValue: 10,
        minPurchaseAmount: 500,
        maxDiscountAmount: 1000,
        isActive: true,
      });
    }

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: `Coupon code "${cleanCode}" is invalid. Please check and try again.`,
      });
    }

    if (!coupon.isActive) {
      return res.status(400).json({
        success: false,
        message: `Coupon code "${cleanCode}" is currently inactive.`,
      });
    }

    if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({
        success: false,
        message: `Coupon code "${cleanCode}" has expired.`,
      });
    }

    if (coupon.minPurchaseAmount > 0 && amount < coupon.minPurchaseAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value of ₹${coupon.minPurchaseAmount.toLocaleString()} required for this coupon. (Current subtotal: ₹${amount.toLocaleString()})`,
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = Math.round((amount * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount > 0) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
      }
    } else {
      discountAmount = Math.min(amount, coupon.discountValue);
    }

    const finalAmount = Math.max(0, amount - discountAmount);

    return res.status(200).json({
      success: true,
      message: `Coupon "${cleanCode}" applied successfully! You saved ₹${discountAmount.toLocaleString()}`,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        finalAmount,
      },
    });
  } catch (error) {
    console.error("Validate coupon error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to validate coupon",
    });
  }
};

/**
 * 2. Create Custom Coupon (Admin Only)
 */
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description = "",
      discountType = "percentage",
      discountValue,
      minPurchaseAmount = 0,
      maxDiscountAmount = 0,
      expiryDate = null,
      isActive = true,
    } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required",
      });
    }

    if (!discountValue || Number(discountValue) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid discount value greater than 0 is required",
      });
    }

    if (discountType === "percentage" && Number(discountValue) > 100) {
      return res.status(400).json({
        success: false,
        message: "Percentage discount cannot exceed 100%",
      });
    }

    const cleanCode = code.trim().toUpperCase();

    const existingCoupon = await couponSchema.findOne({ code: cleanCode });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: `Coupon "${cleanCode}" already exists`,
      });
    }

    const newCoupon = await couponSchema.create({
      code: cleanCode,
      description: description.trim(),
      discountType,
      discountValue: Number(discountValue),
      minPurchaseAmount: Math.max(0, Number(minPurchaseAmount) || 0),
      maxDiscountAmount: Math.max(0, Number(maxDiscountAmount) || 0),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      isActive: Boolean(isActive),
      createdBy: req.userId,
    });

    return res.status(201).json({
      success: true,
      message: `Coupon "${cleanCode}" created successfully!`,
      coupon: newCoupon,
    });
  } catch (error) {
    console.error("Create coupon error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create coupon",
    });
  }
};

/**
 * 3. Get All Coupons (Admin Only)
 */
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await couponSchema.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      coupons,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch coupons",
    });
  }
};

/**
 * 4. Toggle Coupon Active Status (Admin Only)
 */
export const toggleCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await couponSchema.findById(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    return res.status(200).json({
      success: true,
      message: `Coupon "${coupon.code}" is now ${coupon.isActive ? "Active" : "Inactive"}`,
      coupon,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to toggle coupon status",
    });
  }
};

/**
 * 5. Delete Coupon (Admin Only)
 */
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await couponSchema.findByIdAndDelete(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Coupon "${coupon.code}" deleted successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete coupon",
    });
  }
};
