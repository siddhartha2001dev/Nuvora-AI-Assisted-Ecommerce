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
  const total = Math.max(0, subtotal + shipping - discount);

  return (
    <div className="bg-[#121215] border border-neutral-800/80 rounded-2xl p-6 space-y-6 h-fit">
      <h3 className="text-base font-bold uppercase tracking-wider text-white border-b border-neutral-800 pb-4">
        Order Summary
      </h3>

      {/* Promo Code Input */}
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Promo code (e.g. NUVORA10)"
          className="w-full bg-neutral-900 text-xs text-white uppercase tracking-wider px-3.5 py-2.5 rounded-xl border border-neutral-800 focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600 font-mono"
        />
        <button
          type="button"
          className="bg-neutral-800 text-neutral-200 text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-neutral-700 hover:text-white transition-colors shrink-0"
        >
          Apply
        </button>
      </div>

      {/* Calculation Breakdown */}
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

      {/* Primary CTA Button */}
      {onButtonClick ? (
        <button
          type="button"
          onClick={onButtonClick}
          className="w-full block text-center py-3.5 bg-white text-black text-xs uppercase font-extrabold tracking-widest rounded-xl hover:bg-neutral-200 transition-colors shadow-xl"
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

      {/* Trust Badges */}
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
