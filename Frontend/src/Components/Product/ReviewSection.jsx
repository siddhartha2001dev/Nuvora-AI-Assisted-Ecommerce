import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductReviews, addReview } from "../../redux/slices/reviewSlice";
import toast from "react-hot-toast";
import { HiStar, HiOutlineCheckCircle, HiOutlineChatAlt2 } from "react-icons/hi";

/**
 * ReviewSection Component
 * -----------------------
 * Displays verified customer reviews for a product.
 * Allows logged-in buyers to submit or update their review and star rating.
 */
const ReviewSection = ({ productId }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { reviews, loading: isLoading, actionLoading: isSubmitting } = useSelector(
    (state) => state.reviews
  );

  // 1. Fetch reviews on product load
  useEffect(() => {
    if (productId) {
      dispatch(fetchProductReviews(productId));
    }
  }, [dispatch, productId]);

  // 2. Check if the current logged-in user has already submitted a review
  const existingUserReview = reviews.find(
    (r) => (r.userId?._id || r.userId) === user?._id
  );

  // 3. Pre-fill rating and comment if user is editing their existing review
  useEffect(() => {
    if (existingUserReview) {
      setRating(existingUserReview.rating || 5);
      setComment(existingUserReview.comment || "");
    }
  }, [existingUserReview]);

  // 4. Calculate average rating score
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
      : "5.0";

  // 5. Submit or update review handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please sign in to submit a review");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please enter your feedback");
      return;
    }

    try {
      await dispatch(
        addReview({
          productId,
          rating: Number(rating),
          comment: comment.trim(),
        })
      ).unwrap();

      toast.success(
        existingUserReview
          ? "Review updated successfully!"
          : "Thank you! Review published successfully."
      );
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to submit review");
    }
  };

  return (
    <section className="mt-16 pt-12 border-t border-neutral-800">
      {/* Section Header & Average Rating */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-['Syne',sans-serif]">
            Verified Customer Reviews
          </h2>
          <div className="flex items-center space-x-2 mt-2">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <HiStar
                  key={i}
                  className={`text-lg ${
                    i < Math.round(Number(averageRating))
                      ? "text-amber-400"
                      : "text-neutral-700"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-bold text-white">
              {averageRating} out of 5
            </span>
            <span className="text-neutral-500 text-xs">
              • {reviews.length} {reviews.length === 1 ? "Verified Review" : "Verified Reviews"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Write / Edit Review Form */}
        <div className="lg:col-span-1 bg-[#121215] border border-neutral-800/80 rounded-2xl p-6 h-fit space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm uppercase tracking-wider font-bold text-white">
              {existingUserReview ? "Edit Your Review" : "Write a Review"}
            </h3>
            {existingUserReview && (
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800 text-amber-400 font-bold">
                Editing
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Star Rating Selector */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-neutral-400 mb-2">
                Select Rating
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`p-2 rounded-lg border transition-all cursor-pointer ${
                      rating >= star
                        ? "bg-white text-black border-white"
                        : "bg-neutral-900 border-neutral-800 text-neutral-500 hover:border-neutral-600"
                    }`}
                  >
                    <HiStar className="text-lg" />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment Textarea */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-neutral-400 mb-2">
                Your Feedback
              </label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share details of your experience with this essential piece..."
                className="w-full bg-neutral-900 text-sm text-white px-3.5 py-2.5 rounded-xl border border-neutral-800 focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-white text-black text-xs uppercase font-bold tracking-wider rounded-xl hover:bg-neutral-200 transition-colors shadow-md disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting
                ? "Submitting..."
                : existingUserReview
                ? "Update Review"
                : "Submit Review"}
            </button>
          </form>
        </div>

        {/* Reviews List Column */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading && reviews.length === 0 ? (
            <p className="text-xs text-neutral-500">Loading verified reviews...</p>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 bg-[#121215] border border-neutral-800/80 rounded-2xl space-y-2">
              <HiOutlineChatAlt2 className="text-4xl text-neutral-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Reviews Yet</h4>
              <p className="text-xs text-neutral-400">
                Be the first to review this handcrafted piece.
              </p>
            </div>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev._id}
                className="bg-[#121215] border border-neutral-800/70 rounded-2xl p-6 space-y-3"
              >
                <div className="flex items-center justify-between">
                  {/* User Profile info */}
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-bold text-white">
                      {(rev.userId?.userName || "U").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-semibold text-white">
                          {rev.userId?.userName || "Verified Buyer"}
                        </h4>
                        <span className="flex items-center text-[10px] text-neutral-400 space-x-1">
                          <HiOutlineCheckCircle className="text-white text-xs" />
                          <span>Verified</span>
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-500 font-mono">
                        {new Date(rev.createdAt || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex text-amber-400 text-sm">
                    {[...Array(5)].map((_, i) => (
                      <HiStar
                        key={i}
                        className={
                          i < (rev.rating || 5)
                            ? "text-amber-400"
                            : "text-neutral-700"
                        }
                      />
                    ))}
                  </div>
                </div>

                <p className="text-sm text-neutral-300 leading-relaxed">
                  {rev.comment}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default ReviewSection;
