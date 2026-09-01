import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetProductDetailsQuery,
  useGetProductReviewsQuery,
  useAddToCartMutation,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useGetWishlistQuery,
  useLazyGetProductAiSummaryQuery,
} from "../../redux/apiSlice";
import ReviewSection from "../../Components/Product/ReviewSection";
import Loader from "../../Components/Common/Loader";
import toast from "react-hot-toast";
import {
  HiStar,
  HiOutlineHeart,
  HiHeart,
  HiOutlineShoppingBag,
  HiOutlineTruck,
  HiOutlineShieldCheck,
  HiOutlineArrowLeft,
  HiOutlineSparkles,
  HiOutlineX,
} from "react-icons/hi";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const { data: productRes, isLoading, isError } = useGetProductDetailsQuery(id);
  const { data: reviewsRes } = useGetProductReviewsQuery(id, { skip: !id });

  const product = productRes?.data;
  const reviews = reviewsRes?.data || [];

  const [selectedImg, setSelectedImg] = useState(0);
  const [showAiModal, setShowAiModal] = useState(false);

  // Lock background scrolling when AI modal is open
  useEffect(() => {
    if (showAiModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showAiModal]);

  const [triggerAiSummary, { data: aiData, isFetching: isAiLoading }] =
    useLazyGetProductAiSummaryQuery();

  const handleOpenAiModal = () => {
    setShowAiModal(true);
    triggerAiSummary(id);
  };

  const [addToCart, { isLoading: isAddingCart }] = useAddToCartMutation();
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  const { data: wishlistData } = useGetWishlistQuery(undefined, {
    skip: !isAuthenticated,
  });

  const isWishlisted = wishlistData?.data?.some(
    (item) => item.productId?._id === id || item.productId === id
  );

  const availableStock = product?.stock !== undefined ? product.stock : 0;

  // Real-time calculated rating and review counts
  const totalReviewsCount = reviews.length > 0 ? reviews.length : (product?.numReviews || 0);
  const liveAverageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
      : (product?.rating || 5);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to your bag");
      navigate("/login");
      return;
    }

    if (availableStock <= 0) {
      toast.error("Sorry, this piece is currently out of stock.");
      return;
    }

    try {
      await addToCart({ productId: id, quantity: 1 }).unwrap();
      toast.success("Added to Shopping Bag!");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to add to bag");
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to save items to wishlist");
      navigate("/login");
      return;
    }

    try {
      if (isWishlisted) {
        await removeFromWishlist(id).unwrap();
        toast.success("Removed from wishlist");
      } else {
        await addToWishlist({ productId: id }).unwrap();
        toast.success("Saved to wishlist!");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Wishlist action failed");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader text="Loading piece details..." />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-[#121215] border border-neutral-800 rounded-3xl space-y-4">
        <h2 className="text-xl font-bold text-white font-['Syne',sans-serif]">
          Piece Not Found
        </h2>
        <p className="text-xs text-neutral-400">
          This piece might have been removed or is no longer available in the catalogue.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-black text-xs uppercase font-extrabold tracking-widest rounded-xl hover:bg-neutral-200"
        >
          <HiOutlineArrowLeft />
          <span>Return to Collection</span>
        </Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0
    ? product.images
    : ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop"];

  const hasDiscount = product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 pb-28 sm:pb-12">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-[11px] text-neutral-500 uppercase tracking-wider font-mono">
        <Link to="/" className="hover:text-white">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-white">Collection</Link>
        <span>/</span>
        <span className="text-neutral-300 truncate max-w-[150px] sm:max-w-xs">{product.title}</span>
      </nav>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Gallery */}
        <div className="space-y-3 sm:space-y-4">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-[#121215] border border-neutral-800 group">
            <img
              src={images[selectedImg] || images[0]}
              alt={product.title}
              className="w-full h-full object-cover object-center"
            />
            {/* Wishlist Button directly on the Image */}
            <button
              onClick={handleToggleWishlist}
              className="absolute top-4 right-4 p-3 rounded-full bg-black/60 backdrop-blur-md border border-neutral-700/60 text-white hover:scale-110 active:scale-95 transition-all shadow-xl z-10"
              title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
            >
              {isWishlisted ? (
                <HiHeart className="text-2xl text-rose-500 fill-rose-500" />
              ) : (
                <HiOutlineHeart className="text-2xl text-white" />
              )}
            </button>

            {/* Out of Stock Overlay Ribbon */}
            {availableStock === 0 && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
                <span className="text-sm font-extrabold uppercase tracking-widest text-white px-6 py-2 rounded-full border border-rose-700 bg-rose-950/80 shadow-2xl font-mono">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex space-x-2.5 sm:space-x-3 overflow-x-auto pb-1">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImg(index)}
                  className={`w-16 h-20 sm:w-20 sm:h-24 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImg === index
                      ? "border-white shadow-md"
                      : "border-neutral-800 opacity-50 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="space-y-6 sm:space-y-8 flex flex-col justify-between">
          <div className="space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest font-bold text-neutral-400 font-mono">
                {product.brand || product.category || "NUVORA"}
              </span>
              {availableStock > 0 ? (
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 font-mono">
                  In Stock ({availableStock} Available)
                </span>
              ) : (
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-rose-950/60 text-rose-400 border border-rose-800/60 font-mono">
                  Sold Out
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-['Syne',sans-serif] leading-tight">
              {product.title}
            </h1>

            {/* Live Real-time Rating & Review Count */}
            <div className="flex items-center space-x-2.5">
              <div className="flex text-amber-400 text-sm">
                {[...Array(5)].map((_, i) => (
                  <HiStar
                    key={i}
                    className={i < Math.round(Number(liveAverageRating)) ? "text-amber-400" : "text-neutral-700"}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-white">{liveAverageRating}</span>
              <span className="text-xs text-neutral-400">({totalReviewsCount} {totalReviewsCount === 1 ? "Review" : "Reviews"})</span>
            </div>

            {/* Glowing AI Summarizer Banner Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleOpenAiModal}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-950/50 transition-all active:scale-95 border border-violet-400/40 group"
              >
                <HiOutlineSparkles className="text-base text-amber-300 animate-pulse group-hover:rotate-12 transition-transform" />
                <span>Summarize with AI (Gemini)</span>
              </button>
            </div>

            {/* Price */}
            <div className="flex items-baseline space-x-3 pt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                ₹{hasDiscount ? product.discountPrice.toLocaleString() : product.price.toLocaleString()}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-base sm:text-lg text-neutral-500 line-through font-mono">
                    ₹{product.price.toLocaleString()}
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white text-black uppercase">
                    Save ₹{(product.price - product.discountPrice).toLocaleString()}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed pt-1">
              {product.description}
            </p>
          </div>

          {/* Actions & Wishlist */}
          {availableStock > 0 ? (
            <div className="space-y-4 pt-6 border-t border-neutral-800">
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingCart}
                  className="flex-1 py-4 bg-white text-black text-xs uppercase font-extrabold tracking-widest rounded-2xl hover:bg-neutral-200 transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-60"
                >
                  <HiOutlineShoppingBag className="text-lg" />
                  <span>{isAddingCart ? "Adding..." : "Add to Shopping Bag"}</span>
                </button>

                {/* Wishlist Action Button */}
                <button
                  onClick={handleToggleWishlist}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-center shrink-0 ${
                    isWishlisted
                      ? "border-rose-900/60 bg-rose-950/30 text-rose-400 shadow-md"
                      : "border-neutral-800 bg-neutral-900 text-white hover:bg-neutral-800"
                  }`}
                  title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
                >
                  {isWishlisted ? (
                    <HiHeart className="text-xl text-rose-500 fill-rose-500" />
                  ) : (
                    <HiOutlineHeart className="text-xl" />
                  )}
                </button>
              </div>

              {/* Quality Perks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-neutral-400">
                <div className="flex items-center space-x-2.5 p-3.5 rounded-2xl bg-[#121215] border border-neutral-800/80">
                  <HiOutlineTruck className="text-lg text-white" />
                  <span>Express Dispatched in 24h</span>
                </div>
                <div className="flex items-center space-x-2.5 p-3.5 rounded-2xl bg-[#121215] border border-neutral-800/80">
                  <HiOutlineShieldCheck className="text-lg text-white" />
                  <span>Authentic Verified Piece</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 text-center space-y-2">
              <span className="text-sm font-bold text-rose-400 uppercase tracking-wider">
                Out of Stock
              </span>
              <p className="text-xs text-neutral-400">
                This piece has sold out. Save it to your Wishlist to be notified on the next drop.
              </p>
              <button
                onClick={handleToggleWishlist}
                className="mt-3 inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl border border-neutral-700 bg-neutral-800 text-xs font-semibold text-white hover:bg-neutral-700 transition-colors"
              >
                {isWishlisted ? <HiHeart className="text-rose-500" /> : <HiOutlineHeart />}
                <span>{isWishlisted ? "In Your Wishlist" : "Save to Wishlist"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Verified Reviews Section */}
      <ReviewSection productId={id} />

      {/* Glassmorphic AI Insights Modal (Rendered directly on Document Body for 100% Full Viewport Blur) */}
      {showAiModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] w-screen h-screen flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-2xl animate-fadeIn"
            onClick={() => setShowAiModal(false)}
          >
            <div
              className="w-full max-w-lg bg-[#121215]/95 backdrop-blur-2xl border border-neutral-800 rounded-3xl p-5 sm:p-7 space-y-4 sm:space-y-5 shadow-2xl relative max-h-[85vh] flex flex-col text-left"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3.5">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-violet-950/60 border border-violet-800/60 text-violet-400 shrink-0">
                    <HiOutlineSparkles className="text-lg text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white font-['Syne',sans-serif]">
                      NUVORA AI Insights
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-neutral-400">
                      Live synthesis from database specs & reviews
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  className="p-2.5 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors"
                  title="Close"
                >
                  <HiOutlineX className="text-xl" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto pr-1">
                {isAiLoading ? (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-white animate-pulse">
                        Analyzing specs & customer feedback with Gemini...
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        Generating tailored buying insights
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800/80 space-y-3">
                    <div className="text-xs text-neutral-200 whitespace-pre-line leading-relaxed font-sans">
                      {aiData?.data || "Unable to generate summary at the moment."}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-[10px] text-neutral-500 font-mono">
                  Google Gemini 3.6 Flash
                </span>
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  className="px-5 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-neutral-200 transition-colors shadow-md"
                >
                  Close Insights
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default ProductDetails;
