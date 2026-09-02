import cartSchema from "../models/cartSchema.js";
import productSchema from "../models/productSchema.js";

// 1. Add to Cart / Update Quantity (With Real-Time Stock Limits & Decrement Support)
export const addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1, selectedColor = "", selectedSize = "" } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        // Check if product exists and check available stock
        const product = await productSchema.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Check if item with matching color and size already in user's cart
        let cartItem = await cartSchema.findOne({
            userId: req.userId,
            productId,
            selectedColor: selectedColor || "",
            selectedSize: selectedSize || ""
        });

        const requestedDelta = Number(quantity);

        // If adding positive quantity but product is already out of stock
        if (requestedDelta > 0 && product.stock <= 0) {
            return res.status(400).json({
                success: false,
                message: "This piece is currently out of stock."
            });
        }

        const newTotalQty = cartItem ? cartItem.quantity + requestedDelta : requestedDelta;

        if (newTotalQty <= 0) {
            // Remove if reduced to 0 or less
            if (cartItem) {
                await cartSchema.findByIdAndDelete(cartItem._id);
            }
            return res.status(200).json({
                success: true,
                message: "Item removed from cart"
            });
        }

        // Strict Stock Synchronization: Cannot exceed available stock
        if (newTotalQty > product.stock) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} pieces available in stock.`
            });
        }

        if (cartItem) {
            cartItem.quantity = newTotalQty;
            await cartItem.save();
        } else {
            cartItem = await cartSchema.create({
                userId: req.userId,
                productId,
                quantity: newTotalQty,
                selectedColor: selectedColor || "",
                selectedSize: selectedSize || ""
            });
        }

        const populatedCart = await cartSchema.findById(cartItem._id).populate("productId");

        return res.status(200).json({
            success: true,
            message: "Cart updated successfully",
            data: populatedCart
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 2. Get User's Cart
export const getMyCart = async (req, res) => {
    try {
        const cartItems = await cartSchema.find({ userId: req.userId })
            .populate("productId")
            .sort({ createdAt: -1 });

        // Filter out any orphaned cart items where product was deleted
        const validCartItems = cartItems.filter(item => item.productId !== null);

        // Calculate total amount
        const totalAmount = validCartItems.reduce((acc, item) => {
            const price = item.productId?.discountPrice > 0 ? item.productId.discountPrice : (item.productId?.price || 0);
            return acc + (price * item.quantity);
        }, 0);

        return res.status(200).json({
            success: true,
            count: validCartItems.length,
            totalAmount,
            data: validCartItems
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 3. Remove from Cart
export const removeFromCart = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await cartSchema.findOneAndDelete({ _id: id, userId: req.userId });

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Item removed from cart"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
