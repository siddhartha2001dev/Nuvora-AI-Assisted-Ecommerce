import reviewSchema from "../models/reviewSchema.js";
import productSchema from "../models/productSchema.js";

// Helper to recalculate and update product rating and review count
const updateProductRatingStats = async (productId) => {
    try {
        const allProductReviews = await reviewSchema.find({ productId });
        const count = allProductReviews.length;
        const avgRating = count > 0
            ? allProductReviews.reduce((sum, r) => sum + Number(r.rating || 5), 0) / count
            : 5;

        await productSchema.findByIdAndUpdate(productId, {
            rating: Number(avgRating.toFixed(1)),
            numReviews: count
        });
    } catch (err) {
        console.error("Error updating product rating stats:", err.message);
    }
};

// 1. Add or Update Review (Allows editing existing review)
export const addReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;

        if (!productId || !rating || !comment) {
            return res.status(400).json({
                success: false,
                message: "All fields (productId, rating, comment) are required"
            });
        }

        // Check if user already reviewed this product -> update if exists, otherwise create
        let review = await reviewSchema.findOne({
            userId: req.userId,
            productId
        });

        if (review) {
            review.rating = Number(rating);
            review.comment = comment;
            await review.save();
        } else {
            review = await reviewSchema.create({
                userId: req.userId,
                productId,
                rating: Number(rating),
                comment
            });
        }

        // Recalculate product rating stats
        await updateProductRatingStats(productId);

        const populatedReview = await reviewSchema.findById(review._id).populate("userId", "userName avatarUrl");

        return res.status(200).json({
            success: true,
            message: "Review submitted successfully",
            data: populatedReview
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 2. Get Product Reviews
export const getProductReviews = async (req, res) => {
    try {
        const reviews = await reviewSchema.find({ productId: req.params.productId })
            .populate("userId", "userName avatarUrl")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 3. Get Logged-in User's Reviews
export const getMyReviews = async (req, res) => {
    try {
        const reviews = await reviewSchema.find({ userId: req.userId })
            .populate("productId")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 4. Delete Review
export const deleteReview = async (req, res) => {
    try {
        const review = await reviewSchema.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found or unauthorized"
            });
        }

        // Recalculate product rating stats
        await updateProductRatingStats(review.productId);

        return res.status(200).json({
            success: true,
            message: "Review deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
