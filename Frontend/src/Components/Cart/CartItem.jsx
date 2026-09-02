import React from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { removeFromCart, addToCart } from "../../redux/slices/cartSlice";
import toast from "react-hot-toast";
import { HiOutlineTrash, HiOutlineMinus, HiOutlinePlus } from "react-icons/hi";

const CartItem = ({ item }) => {
  const dispatch = useDispatch();
  const { actionLoading: isDeleting } = useSelector((state) => state.cart);

  // Item details
  const product = item?.productId || {};
  const cartItemId = item?._id;
  const productId = product?._id || item?.productId;
  const quantity = item?.quantity || 1;
  const availableStock = product?.stock !== undefined ? product.stock : 99;

  // Price calculation
  const price =
    product?.discountPrice > 0 ? product.discountPrice : product?.price || 0;

  const image = product?.images?.[0] || "";

  // Delete item from cart
  const handleDelete = async () => {
    try {
      const res = await dispatch(removeFromCart(cartItemId)).unwrap();
      toast.success(res?.message || "Removed from bag");
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to remove item");
    }
  };

  // Change quantity
  const handleUpdateQty = async (delta) => {
    if (quantity + delta <= 0) {
      handleDelete();
      return;
    }

    if (quantity + delta > availableStock) {
      toast.error(`Only ${availableStock} pieces available in stock`);
      return;
    }

    try {
      await dispatch(
        addToCart({
          productId,
          quantity: delta,
          selectedColor: item?.selectedColor || "",
          selectedSize: item?.selectedSize || "",
        })
      ).unwrap();
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to update quantity");
    }
  };

  return (
    <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 p-4 sm:p-5 bg-[#121215] border border-neutral-800/80 rounded-2xl min-w-0 overflow-hidden">
      {/* Product info */}
      <div className="flex items-center space-x-3.5 sm:space-x-4 w-full sm:flex-1 min-w-0">
        <img
          src={image}
          alt={product?.title || "Product"}
          className="w-16 h-20 sm:w-20 sm:h-24 object-cover rounded-xl bg-neutral-900 border border-neutral-800 shrink-0"
        />
        <div className="space-y-1 min-w-0 flex-1">
          {/* Category and stock */}
          <div className="flex items-center space-x-2">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-semibold text-neutral-500 font-mono block">
              {product?.category || "Essential"}
            </span>
            {availableStock <= 3 && availableStock > 0 && (
              <span className="text-[9px] text-amber-400 font-mono bg-amber-950/80 border border-amber-800/80 px-1.5 py-0.2 rounded">
                Only {availableStock} left
              </span>
            )}
          </div>

          {/* Title */}
          <Link
            to={`/product/${productId}`}
            className="block text-xs sm:text-sm font-semibold text-white hover:underline truncate"
            title={product?.title}
          >
            {product?.title || "Essential Piece"}
          </Link>

          {/* Variants */}
          {(item?.selectedColor || item?.selectedSize) && (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {item?.selectedColor && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-700 text-neutral-300 font-mono">
                  Color: <strong className="text-white">{item.selectedColor}</strong>
                </span>
              )}
              {item?.selectedSize && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-700 text-neutral-300 font-mono">
                  Size: <strong className="text-white">{item.selectedSize}</strong>
                </span>
              )}
            </div>
          )}

          {/* Mobile price */}
          <div className="text-xs font-bold text-white sm:hidden font-mono pt-1">
            ₹{(price * quantity).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between sm:justify-end space-x-4 sm:space-x-6 w-full sm:w-auto shrink-0 pt-2.5 sm:pt-0 border-t sm:border-0 border-neutral-800/70">
        {/* Quantity buttons */}
        <div className="flex items-center space-x-2 bg-neutral-900 border border-neutral-800 rounded-xl px-2 py-1">
          <button
            type="button"
            onClick={() => handleUpdateQty(-1)}
            className="p-1 text-neutral-400 hover:text-white transition-colors"
            title="Decrease"
          >
            <HiOutlineMinus className="text-xs" />
          </button>
          <span className="text-xs font-mono font-bold text-white px-2">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => handleUpdateQty(1)}
            disabled={quantity >= availableStock}
            className="p-1 text-neutral-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Increase"
          >
            <HiOutlinePlus className="text-xs" />
          </button>
        </div>

        {/* Desktop price */}
        <div className="hidden sm:block text-right min-w-[90px]">
          <span className="text-sm sm:text-base font-bold text-white font-mono">
            ₹{(price * quantity).toLocaleString()}
          </span>
          <p className="text-[10px] text-neutral-500 font-mono">
            ₹{price.toLocaleString()} each
          </p>
        </div>

        {/* Remove button */}
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 text-neutral-500 hover:text-rose-400 hover:bg-neutral-900 rounded-xl transition-colors disabled:opacity-50"
          title="Remove"
        >
          <HiOutlineTrash className="text-base sm:text-lg" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
