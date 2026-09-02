import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchWishlist } from "../../redux/slices/wishlistSlice";
import ProductCard from "../../Components/Product/ProductCard";
import Loader from "../../Components/Common/Loader";
import { HiOutlineHeart, HiOutlineArrowLeft } from "react-icons/hi";

const WishList = () => {
  const dispatch = useDispatch();
  const { items: wishlistItems, loading: isLoading } = useSelector(
    (state) => state.wishlist
  );

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  if (isLoading && wishlistItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader text="Loading your saved pieces..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title & Back */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-500">
            SAVED ESSENTIALS ({wishlistItems.length})
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-['Syne',sans-serif]">
            Your Wishlist
          </h1>
        </div>

        <Link
          to="/shop"
          className="flex items-center space-x-2 text-xs uppercase tracking-wider font-semibold text-neutral-400 hover:text-white"
        >
          <HiOutlineArrowLeft />
          <span>Back to Collection</span>
        </Link>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-24 bg-[#121215] border border-neutral-800/80 rounded-3xl space-y-4">
          <HiOutlineHeart className="text-5xl text-neutral-600 mx-auto" />
          <h2 className="text-xl font-bold text-white font-['Syne',sans-serif]">
            Your Wishlist is Empty
          </h2>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Save pieces you admire for later and check back anytime.
          </p>
          <Link
            to="/shop"
            className="inline-block mt-2 px-6 py-3 bg-white text-black text-xs uppercase font-extrabold tracking-widest rounded-xl hover:bg-neutral-200 transition-colors shadow-lg"
          >
            Explore Essentials
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {wishlistItems.map((item) => (
            <ProductCard
              key={item._id}
              product={item.productId || item}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishList;
