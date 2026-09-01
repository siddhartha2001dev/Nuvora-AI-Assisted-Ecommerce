import wishlistSchema from "../models/wishlistSchema.js";
import productSchema from "../models/productSchema.js";

// 1. Add to Wishlist
export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        // Check if product exists
        const product = await productSchema.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Check if already in wishlist
        const existingItem = await wishlistSchema.findOne({
            userId: req.userId,
            productId
        });

        if (existingItem) {
            return res.status(400).json({
                success: false,
                message: "Product already in wishlist"
            });
        }

        const wishlistItem = await wishlistSchema.create({
            userId: req.userId,
            productId
        });

        const populatedItem = await wishlistSchema.findById(wishlistItem._id).populate("productId");

        return res.status(201).json({
            success: true,
            message: "Product added to wishlist",
            data: populatedItem
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 2. Get User's Wishlist
export const getMyWishlist = async (req, res) => {
    try {
        const wishlist = await wishlistSchema.find({ userId: req.userId })
            .populate("productId")
            .sort({ createdAt: -1 });

        // Filter out any orphaned items if product was deleted
        const validWishlist = wishlist.filter(item => item.productId !== null);

        return res.status(200).json({
            success: true,
            count: validWishlist.length,
            data: validWishlist
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 3. Remove from Wishlist (Supports both wishlist item _id and productId)
export const removeFromWishlist = async (req, res) => {
    try {
        const { id } = req.params;

        // Try deleting by wishlist document ID first, or by productId
        let deletedItem = null;

        // Check if valid ObjectId
        try {
            deletedItem = await wishlistSchema.findOneAndDelete({
                _id: id,
                userId: req.userId
            });
        } catch {
            // Not a direct wishlist doc id or invalid format, try productId
        }

        if (!deletedItem) {
            deletedItem = await wishlistSchema.findOneAndDelete({
                productId: id,
                userId: req.userId
            });
        }

        if (!deletedItem) {
            return res.status(404).json({
                success: false,
                message: "Item not found in wishlist"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
