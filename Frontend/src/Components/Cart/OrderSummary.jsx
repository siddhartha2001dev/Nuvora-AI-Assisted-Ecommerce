import React from "react";
import { Link } from "react-router-dom";
import { HiOutlineShieldCheck, HiOutlineTruck } from "react-icons/hi";

const OrderSummary = ({
  subtotal = 0,
  shipping = 0,
  discount = 0,
  buttonText = "Proceed to Checkout",
  buttonLink = "/checkout",
  onButtonClick,
}) => {
  // Total calculation
  const total = Math.max(0, subtotal + shipping - discount);

  return (
    <div className="bg-[#121215] border border-neutral-800/80 rounded-2xl p-6 space-y-6 h-fit">
      <h3 className="text-base font-bold uppercase tracking-wider text-white border-b border-neutral-800 pb-4">
        Order Summary
      </h3>

      {/* Pricing breakdown */}
      <div className="space-y-3 text-sm text-neutral-400">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="text-neutral-200 font-mono">₹{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Standard Delivery</span>
          <span className="text-neutral-200 font-mono">
            {shipping === 0 ? "FREE" : `₹${shipping.toLocaleString()}`}
          </span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-white font-medium">
            <span>Special Discount</span>
            <span className="font-mono">- ₹{discount.toLocaleString()}</span>
          </div>
        )}
        <div className="pt-4 border-t border-neutral-800 flex justify-between items-baseline">
          <span className="text-base font-bold text-white">Estimated Total</span>
          <span className="text-xl font-extrabold text-white font-mono">
            ₹{total.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Checkout button */}
      {onButtonClick ? (
        <button
          type="button"
          onClick={onButtonClick}
          className="w-full block text-center py-3.5 bg-white text-black text-xs uppercase font-extrabold tracking-widest rounded-xl hover:bg-neutral-200 transition-colors shadow-xl cursor-pointer"
        >
          {buttonText}
        </button>
      ) : (
        <Link
          to={buttonLink}
          className="w-full block text-center py-3.5 bg-white text-black text-xs uppercase font-extrabold tracking-widest rounded-xl hover:bg-neutral-200 transition-colors shadow-xl"
        >
          {buttonText}
        </Link>
      )}

      {/* Badges */}
      <div className="space-y-2 pt-2 text-[11px] text-neutral-500">
        <div className="flex items-center space-x-2">
          <HiOutlineShieldCheck className="text-neutral-400 text-base" />
          <span>256-Bit Encrypted Secure Checkout</span>
        </div>
        <div className="flex items-center space-x-2">
          <HiOutlineTruck className="text-neutral-400 text-base" />
          <span>Free Express Delivery on orders over ₹1,999</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
