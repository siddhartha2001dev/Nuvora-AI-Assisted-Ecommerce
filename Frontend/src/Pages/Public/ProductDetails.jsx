import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
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
  HiOutlineShare,
  HiOutlineCheck,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi";

/**
 * Render description while preserving exact admin formatting:
 * - Double line breaks create distinct paragraphs
 * - Single line breaks stay on their own lines (whitespace-pre-line)
 * - Lines starting with bullet markers (-, *, •) render as clean styled bullet items
 */
const renderProductDescription = (rawText) => {
  if (!rawText) return null;

  // Split into paragraph blocks (separated by 2 or more newlines)
  const blocks = String(rawText).split(/\n\s*\n/);

  return (
    <div className="space-y-3 pt-1 text-xs sm:text-sm text-neutral-300 leading-relaxed break-words">
      {blocks.map((block, blockIdx) => {
        const trimmedBlock = block.trim();
        if (!trimmedBlock) return null;

        const lines = trimmedBlock.split("\n").map((l) => l.trim()).filter(Boolean);
        const isBulletList = lines.length > 0 && lines.every((line) => /^[-*•]\s+/.test(line));

        if (isBulletList) {
          return (
            <ul key={blockIdx} className="space-y-1.5 pl-2 list-none">
              {lines.map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start space-x-2 text-neutral-300">
                  <span className="text-white mt-1 select-none text-[10px] leading-none">•</span>
                  <span className="flex-1">{item.replace(/^[-*•]\s+/, "")}</span>
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={blockIdx} className="whitespace-pre-line text-neutral-400">
            {trimmedBlock}
          </p>
        );
      })}
    </div>
  );
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
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
  const [copied, setCopied] = useState(false);

  // Gallery slider ref & touch helpers
  const sliderRef = useRef(null);

  const scrollToImage = (index) => {
    setSelectedImg(index);
    if (sliderRef.current) {
      sliderRef.current.scrollTo({
        left: index * sliderRef.current.clientWidth,
        behavior: "smooth",
      });
    }
  };

  const handlePrevImage = (e) => {
    if (e) e.stopPropagation();
    const imgs = product?.images || [];
    if (!imgs.length) return;
    const prev = selectedImg === 0 ? imgs.length - 1 : selectedImg - 1;
    scrollToImage(prev);
  };

  const handleNextImage = (e) => {
    if (e) e.stopPropagation();
    const imgs = product?.images || [];
    if (!imgs.length) return;
    const next = selectedImg === imgs.length - 1 ? 0 : selectedImg + 1;
    scrollToImage(next);
  };

  const handleSliderScroll = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, clientWidth } = sliderRef.current;
    if (clientWidth > 0) {
      const newIndex = Math.round(scrollLeft / clientWidth);
      const imgs = product?.images || [];
      if (newIndex >= 0 && newIndex < imgs.length && newIndex !== selectedImg) {
        setSelectedImg(newIndex);
      }
    }
  };

  // Keep slider position aligned on screen resize
  useEffect(() => {
    const handleResize = () => {
      if (sliderRef.current) {
        sliderRef.current.scrollTo({
          left: selectedImg * sliderRef.current.clientWidth,
          behavior: "auto",
        });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [selectedImg]);

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
      : (product?.rating && product.rating > 0 ? product.rating : null);

  const handleShareProduct = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const shareUrl = window.location.href;
    const shareData = {
      title: `${product?.title || "Product"} | NUVORA`,
      text: `Check out ${product?.title || "this luxury piece"} on NUVORA!`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success("Shared successfully!");
        return;
      } catch (err) {
        if (err.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Product link copied to clipboard! 🔗");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy product link");
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to your bag");
      navigate("/login", { state: { from: location } });
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
      navigate("/login", { state: { from: location } });
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
        {/* Gallery with Mobile Touch-Swipe Carousel & Desktop Controls */}
        <div className="space-y-3 sm:space-y-4">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-[#121215] border border-neutral-800 group">
            {/* Horizontal Scroll Snap Image Slider Container */}
            <div
              ref={sliderRef}
              onScroll={handleSliderScroll}
              className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scroll-smooth touch-pan-x [&::-webkit-scrollbar]:hidden select-none"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {images.length > 0 ? (
                images.map((img, idx) => (
                  <div
                    key={idx}
                    className="min-w-full w-full h-full flex-shrink-0 snap-center relative"
                  >
                    <img
                      src={img}
                      alt={`${product.title} - View ${idx + 1}`}
                      className="w-full h-full object-cover object-center pointer-events-none"
                      loading={idx === 0 ? "eager" : "lazy"}
                    />
                  </div>
                ))
              ) : (
                <div className="min-w-full w-full h-full flex-shrink-0 snap-center relative">
                  <img
                    src=""
                    alt={product.title}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              )}
            </div>

            {/* Left / Right Chevron Navigation Buttons */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-neutral-700/60 text-white transition-all shadow-xl opacity-80 hover:opacity-100 hover:scale-105 active:scale-95 z-10 cursor-pointer"
                  aria-label="Previous image"
                >
                  <HiChevronLeft className="text-xl sm:text-2xl text-white" />
                </button>

                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-neutral-700/60 text-white transition-all shadow-xl opacity-80 hover:opacity-100 hover:scale-105 active:scale-95 z-10 cursor-pointer"
                  aria-label="Next image"
                >
                  <HiChevronRight className="text-xl sm:text-2xl text-white" />
                </button>
              </>
            )}

            {/* Top-Right Image Overlay Actions: Share & Wishlist */}
            <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
              <button
                type="button"
                onClick={handleShareProduct}
                className="p-3 rounded-full bg-black/60 backdrop-blur-md border border-neutral-700/60 text-white hover:scale-110 active:scale-95 transition-all shadow-xl cursor-pointer"
                title="Share Product Link"
              >
                {copied ? (
                  <HiOutlineCheck className="text-xl sm:text-2xl text-emerald-400" />
                ) : (
                  <HiOutlineShare className="text-xl sm:text-2xl text-white" />
                )}
              </button>

              <button
                type="button"
                onClick={handleToggleWishlist}
                className="p-3 rounded-full bg-black/60 backdrop-blur-md border border-neutral-700/60 text-white hover:scale-110 active:scale-95 transition-all shadow-xl cursor-pointer"
                title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
              >
                {isWishlisted ? (
                  <HiHeart className="text-xl sm:text-2xl text-rose-500 fill-rose-500" />
                ) : (
                  <HiOutlineHeart className="text-xl sm:text-2xl text-white" />
                )}
              </button>
            </div>

            {/* Bottom-Right Slide Counter Badge (e.g. 1 / 4) */}
            {images.length > 1 && (
              <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-neutral-700/60 text-white font-mono text-[11px] font-bold shadow-lg pointer-events-none z-10 flex items-center space-x-1">
                <span>{selectedImg + 1}</span>
                <span className="text-neutral-500">/</span>
                <span className="text-neutral-400">{images.length}</span>
              </div>
            )}

            {/* Bottom-Center Interactive Pagination Dots */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 z-10 pointer-events-auto bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full border border-neutral-800/80">
                {images.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={() => scrollToImage(dotIdx)}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      selectedImg === dotIdx
                        ? "w-5 h-1.5 bg-white shadow-sm"
                        : "w-1.5 h-1.5 bg-neutral-500 hover:bg-neutral-300"
                    }`}
                    aria-label={`Go to slide ${dotIdx + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Out of Stock Overlay Ribbon */}
            {availableStock === 0 && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center pointer-events-none z-20">
                <span className="text-sm font-extrabold uppercase tracking-widest text-white px-6 py-2 rounded-full border border-rose-700 bg-rose-950/80 shadow-2xl font-mono">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div
              className="flex space-x-2.5 sm:space-x-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => scrollToImage(index)}
                  className={`w-16 h-20 sm:w-20 sm:h-24 rounded-2xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                    selectedImg === index
                      ? "border-white shadow-md scale-102 ring-1 ring-white/30"
                      : "border-neutral-800 opacity-50 hover:opacity-100"
                  }`}
                  aria-label={`View photo ${index + 1}`}
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
                  In Stock
                </span>
              ) : (
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-rose-950/60 text-rose-400 border border-rose-800/60 font-mono">
                  Out of Stock
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-['Syne',sans-serif] leading-tight">
              {product.title}
            </h1>

            {/* Live Real-time Rating & Review Count */}
            {totalReviewsCount > 0 && liveAverageRating ? (
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
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-neutral-400 font-medium bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-full font-mono">
                  No reviews available
                </span>
              </div>
            )}

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

            {/* Formatted Description (Preserving Admin Paragraphs & Bullet Lists) */}
            {renderProductDescription(product.description)}

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
          <div className="space-y-4 pt-6 border-t border-neutral-800">
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Add to Cart (Disabled when out of stock, enabled when refilled) */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={availableStock <= 0 || isAddingCart}
                className={`flex-1 py-4 text-xs uppercase font-extrabold tracking-widest rounded-2xl transition-all shadow-lg flex items-center justify-center space-x-2 ${
                  availableStock > 0
                    ? "bg-white text-black hover:bg-neutral-200 active:scale-98 cursor-pointer"
                    : "bg-neutral-800/80 text-neutral-500 border border-neutral-700/60 cursor-not-allowed opacity-60"
                }`}
                title={availableStock > 0 ? "Add to Shopping Bag" : "Currently Out of Stock"}
              >
                <HiOutlineShoppingBag className="text-lg" />
                <span>
                  {availableStock <= 0
                    ? "Out of Stock"
                    : isAddingCart
                    ? "Adding..."
                    : "Add to Shopping Bag"}
                </span>
              </button>

              {/* Wishlist Action Button */}
              <button
                type="button"
                onClick={handleToggleWishlist}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-center shrink-0 cursor-pointer ${
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

              {/* Share Action Button */}
              <button
                type="button"
                onClick={handleShareProduct}
                className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900 text-white hover:bg-neutral-800 hover:border-neutral-700 transition-all flex items-center justify-center shrink-0 active:scale-95 cursor-pointer"
                title="Share Product Link"
              >
                {copied ? (
                  <HiOutlineCheck className="text-xl text-emerald-400" />
                ) : (
                  <HiOutlineShare className="text-xl" />
                )}
              </button>
            </div>

            {/* Out of Stock Notice if stock is 0 */}
            {availableStock <= 0 && (
              <p className="text-xs text-rose-400/90 font-medium text-center sm:text-left">
                ⚠️ This piece is currently sold out. Save it to your Wishlist to be notified on the next refill drop.
              </p>
            )}

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
