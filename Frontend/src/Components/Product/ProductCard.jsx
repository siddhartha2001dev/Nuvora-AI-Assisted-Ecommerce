import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useAddToCartMutation,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useGetWishlistQuery,
} from "../../redux/apiSlice";
import toast from "react-hot-toast";
import { HiOutlineHeart, HiHeart, HiOutlineShoppingBag, HiStar } from "react-icons/hi";

const ProductCard = ({ product }) => {
  const {
    _id,
    title = "Monochrome Piece",
    price = 0,
    discountPrice = 0,
    category = "General",
    images = [],
    rating = 5.0,
    numReviews = 0,
    stock = 1,
  } = product || {};

  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [addToCart, { isLoading: isAddingCart }] = useAddToCartMutation();
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  const { data: wishlistData } = useGetWishlistQuery(undefined, {
    skip: !isAuthenticated,
  });

  const isWishlisted = wishlistData?.data?.some(
    (item) => item.productId?._id === _id || item.productId === _id
  );

  const displayImage =
    images && images.length > 0
      ? images[0]
      : "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop";

  const hasDiscount = discountPrice && discountPrice > 0 && discountPrice < price;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please sign in to add items to your bag");
      navigate("/login");
      return;
    }

    try {
      await addToCart({ productId: _id, quantity: 1 }).unwrap();
      toast.success("Added to Shopping Bag!");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to add to bag");
    }
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please sign in to save items to wishlist");
      navigate("/login");
      return;
    }

    try {
      if (isWishlisted) {
        await removeFromWishlist(_id).unwrap();
        toast.success("Removed from wishlist");
      } else {
        await addToWishlist({ productId: _id }).unwrap();
        toast.success("Saved to wishlist!");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Wishlist action failed");
    }
  };

  return (
    <div className="group relative bg-[#121215] border border-neutral-800/80 hover:border-neutral-700 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300">
      {/* Image Box */}
      <div className="relative aspect-[4/5] sm:aspect-[3/4] bg-neutral-950 overflow-hidden">
        <Link to={`/product/${_id}`}>
          <img
            src={displayImage}
            alt={title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        </Link>

        {/* Specular Liquid Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/80 via-transparent to-black/20 pointer-events-none"></div>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex flex-col gap-1.5 z-10">
          {hasDiscount && (
            <span className="bg-white text-black text-[9px] sm:text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full shadow-lg backdrop-blur-md">
              Sale
            </span>
          )}
          {stock <= 3 && stock > 0 && (
            <span className="bg-neutral-900/90 text-neutral-300 border border-neutral-700 text-[9px] sm:text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
              Few Left
            </span>
          )}
          {stock === 0 && (
            <span className="bg-rose-950 text-rose-300 border border-rose-800 text-[9px] sm:text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 p-2 sm:p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-neutral-700 text-white hover:bg-white hover:text-black transition-all shadow-md z-10"
          title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
        >
          {isWishlisted ? (
            <HiHeart className="text-rose-500 text-sm sm:text-base" />
          ) : (
            <HiOutlineHeart className="text-sm sm:text-base" />
          )}
        </button>

        {/* Quick Add Overlay on Hover (Desktop) */}
        {stock > 0 && (
          <div className="absolute bottom-3 inset-x-3 hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <button
              onClick={handleAddToCart}
              disabled={isAddingCart}
              className="w-full py-2.5 bg-white text-black text-[11px] uppercase font-extrabold tracking-widest rounded-xl hover:bg-neutral-200 transition-all shadow-[0_4px_20px_rgba(255,255,255,0.25)] flex items-center justify-center space-x-2 disabled:opacity-60"
            >
              <HiOutlineShoppingBag className="text-base" />
              <span>{isAddingCart ? "Adding..." : "Quick Bag"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
            <span className="uppercase tracking-widest font-mono text-[10px]">{category}</span>
            <div className="flex items-center text-neutral-300 font-semibold space-x-1">
              <HiStar className="text-amber-400 text-xs sm:text-sm" />
              <span>{rating || 5}</span>
              <span className="text-neutral-500 text-[9px]">({numReviews || 0})</span>
            </div>
          </div>

          <Link to={`/product/${_id}`}>
            <h3 className="text-xs sm:text-sm font-semibold text-neutral-200 group-hover:text-white transition-colors line-clamp-1">
              {title}
            </h3>
          </Link>
        </div>

        {/* Price & Mobile Add to Bag */}
        <div className="mt-3 pt-2.5 border-t border-neutral-800/60 flex items-center justify-between">
          <div className="flex items-baseline space-x-1.5 sm:space-x-2">
            <span className="text-sm sm:text-base font-extrabold text-white font-mono">
              ₹{hasDiscount ? discountPrice.toLocaleString() : price.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-[10px] sm:text-xs text-neutral-500 line-through font-mono">
                ₹{price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Mobile Quick Add Icon */}
          {stock > 0 && (
            <button
              onClick={handleAddToCart}
              disabled={isAddingCart}
              className="sm:hidden p-1.5 rounded-lg border border-neutral-800 bg-neutral-900 text-white active:scale-95 transition-transform"
              title="Add to Bag"
            >
              <HiOutlineShoppingBag className="text-base" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
