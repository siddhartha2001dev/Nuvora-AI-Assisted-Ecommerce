import * as yup from "yup";

// 1. Generic Validation Middleware
export const validate = (schema) => async (req, res, next) => {
    try {
        req.body = await schema.validate(req.body, { abortEarly: false, stripUnknown: false });
        next();
    } catch (err) {
        const detailMsg = err.errors ? err.errors.join(", ") : err.message;
        return res.status(400).json({
            success: false,
            message: detailMsg || "Validation Error",
            errors: err.errors
        });
    }
};

// 2. User Register Validation Schema
export const userRegisterSchema = yup.object({
    userName: yup
        .string()
        .trim()
        .min(2, "Username must be at least 2 characters")
        .required("Username is required"),
    email: yup
        .string()
        .email("Please enter a valid email address")
        .required("Email is required"),
    password: yup
        .string()
        .required("Password is required")
        .min(6, "Password must be at least 6 characters"),
    phone: yup
        .string()
        .trim()
        .optional()
        .default(""),
    role: yup
        .string()
        .oneOf(["Buyer", "Admin"], "Role must be either 'Buyer' or 'Admin'")
        .default("Buyer"),
    shopName: yup
        .string()
        .trim()
        .optional()
        .default(""),
    address: yup
        .string()
        .trim()
        .optional()
        .default("")
});

// 3. User Login Validation Schema
export const userLoginSchema = yup.object({
    email: yup
        .string()
        .email("Please enter a valid email address")
        .required("Email is required"),
    password: yup
        .string()
        .required("Password is required")
});

// 4. Product Creation Validation Schema
export const productSchema = yup.object({
    title: yup
        .string()
        .trim()
        .required("Product title is required"),
    description: yup
        .string()
        .required("Product description is required"),
    price: yup
        .number()
        .typeError("Price must be a number")
        .min(0, "Price cannot be negative")
        .required("Product price is required"),
    discountPrice: yup
        .number()
        .typeError("Discount price must be a number")
        .min(0, "Discount price cannot be negative")
        .optional()
        .default(0),
    category: yup
        .string()
        .trim()
        .required("Product category is required"),
    stock: yup
        .number()
        .typeError("Stock must be a number")
        .min(0, "Stock cannot be negative")
        .optional()
        .default(1),
    brand: yup
        .string()
        .trim()
        .optional()
        .default(""),
    colors: yup
        .mixed()
        .optional(),
    sizes: yup
        .mixed()
        .optional()
});

// 5. Review Validation Schema
export const reviewValidationSchema = yup.object({
    productId: yup
        .string()
        .required("Product ID is required"),
    rating: yup
        .number()
        .typeError("Rating must be a number")
        .min(1, "Rating must be at least 1")
        .max(5, "Rating cannot be more than 5")
        .required("Rating is required"),
    comment: yup
        .string()
        .trim()
        .required("Review comment is required")
});

// 6. Cart Validation Schema (Supports positive & negative delta for increment/decrement)
export const cartValidationSchema = yup.object({
    productId: yup
        .string()
        .required("Product ID is required"),
    quantity: yup
        .number()
        .typeError("Quantity must be a number")
        .required("Quantity is required")
        .default(1),
    selectedColor: yup
        .string()
        .optional()
        .default(""),
    selectedSize: yup
        .string()
        .optional()
        .default("")
});

// 7. Order Validation Schema
export const orderValidationSchema = yup.object({
    productId: yup
        .string()
        .required("Product ID is required"),
    quantity: yup
        .number()
        .typeError("Quantity must be a number")
        .min(1, "Quantity must be at least 1")
        .optional()
        .default(1),
    selectedColor: yup
        .string()
        .optional()
        .default(""),
    selectedSize: yup
        .string()
        .optional()
        .default(""),
    address: yup
        .string()
        .trim()
        .required("Delivery address is required"),
    paymentMethod: yup
        .string()
        .oneOf(["COD", "Razorpay"], "Payment method must be 'COD' or 'Razorpay'")
        .default("COD")
});