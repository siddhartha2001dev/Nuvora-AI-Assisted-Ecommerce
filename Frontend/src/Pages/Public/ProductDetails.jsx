import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProductDetails,
  fetchProductAiSummary,
} from "../../redux/slices/productSlice";
import { fetchProductReviews } from "../../redux/slices/reviewSlice";
import { addToCart } from "../../redux/slices/cartSlice";
import {
  addToWishlist,
  removeFromWishlist,
  fetchWishlist,
} from "../../redux/slices/wishlistSlice";
import ReviewSection from "../../Components/Product/ReviewSection";
import AiSummaryModal from "../../Components/Product/AiSummaryModal";
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
  const dispatch = useDispatch();

  const { isAuthenticated } = useSelector((state) => state.auth);
  const {
    productDetails: product,
    detailsLoading: isLoading,
    aiSummary: aiData,
    aiLoading: isAiLoading,
    error: productError,
  } = useSelector((state) => state.products);

  const { reviews } = useSelector((state) => state.reviews);
  const { actionLoading: isAddingCart } = useSelector((state) => state.cart);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  const [selectedImg, setSelectedImg] = useState(0);
  const [showAiModal, setShowAiModal] = useState(false);

  // Variant selection states (Optional)
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  // Fetch product details and reviews on mount / id change
  useEffect(() => {
    if (id) {
      dispatch(fetchProductDetails(id));
      dispatch(fetchProductReviews(id));
      if (isAuthenticated) {
        dispatch(fetchWishlist());
      }
    }
  }, [dispatch, id, isAuthenticated]);

  // Set default selected color and size when product loads
  useEffect(() => {
    if (product?.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0]);
    } else {
      setSelectedColor("");
    }

    if (product?.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    } else {
      setSelectedSize("");
    }
  }, [product]);

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

  const handleOpenAiModal = () => {
    setShowAiModal(true);
    dispatch(fetchProductAiSummary(id));
  };

  const isWishlisted = wishlistItems?.some(
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
      await dispatch(
        addToCart({
          productId: id,
          quantity: 1,
          selectedColor: selectedColor || "",
          selectedSize: selectedSize || "",
        })
      ).unwrap();
      toast.success("Added to Shopping Bag!");
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to add to bag");
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
        await dispatch(removeFromWishlist(id)).unwrap();
        toast.success("Removed from wishlist");
      } else {
        await dispatch(addToWishlist({ productId: id })).unwrap();
        toast.success("Saved to wishlist!");
      }
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Wishlist action failed");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader text="Loading piece details..." />
      </div>
    );
  }

  if (productError || !product) {
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

  const images = product.images || [];

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

            {/* Optional Available Colors Selector */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-neutral-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-semibold text-neutral-300">
                    Select Color:
                  </span>
                  <span className="text-xs font-bold text-white font-mono">{selectedColor}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => {
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          isSelected
                            ? "bg-white text-black border-white shadow-md font-bold scale-105"
                            : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-white"
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Optional Available Sizes Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-neutral-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-semibold text-neutral-300">
                    Select Size:
                  </span>
                  <span className="text-xs font-bold text-white font-mono">{selectedSize}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-10 rounded-xl text-xs font-mono font-bold border transition-all flex items-center justify-center ${
                          isSelected
                            ? "bg-white text-black border-white shadow-md scale-105"
                            : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-white"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
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

      {/* Reusable AI Summary Modal */}
      <AiSummaryModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        isLoading={isAiLoading}
        summaryData={aiData}
      />
    </div>
  );
};

export default ProductDetails;
