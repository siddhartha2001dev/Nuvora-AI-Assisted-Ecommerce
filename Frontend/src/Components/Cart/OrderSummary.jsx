import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axiosInstance";
import toast from "react-hot-toast";
import {
  HiOutlineShieldCheck,
  HiOutlineTruck,
  HiOutlineTag,
  HiOutlineX,
  HiOutlineCheck,
  HiOutlineChevronDown,
} from "react-icons/hi";

const OrderSummary = ({
  subtotal = 0,
  shipping = 0,
  specialDiscount = 0,
  appliedCoupon = null,
  onCouponApply,
  onCouponRemove,
  allowCoupon = true,
  buttonText = "Proceed to Checkout",
  buttonLink = "/checkout",
  onButtonClick,
}) => {
  const [couponInput, setCouponInput] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showAvailableDropdown, setShowAvailableDropdown] = useState(false);

  // Coupon discount calculation
  const couponDiscount = appliedCoupon?.discountAmount || 0;
  const totalDiscount = specialDiscount + couponDiscount;

  // Final total calculation
  const total = Math.max(0, subtotal + shipping - totalDiscount);

  // Fetch active coupons created by Admin for buyer convenience
  useEffect(() => {
    if (!allowCoupon) return;
    const fetchAvailable = async () => {
      try {
        const { data } = await api.get("/coupon/available");
        if (data?.success) {
          setAvailableCoupons(data.coupons || []);
        }
      } catch (err) {
        console.warn("Could not load available coupons:", err.message);
      }
    };
    fetchAvailable();
  }, [allowCoupon]);

  // Execute coupon validation against backend
  const executeCouponValidation = async (codeToApply) => {
    if (!codeToApply) {
      toast.error("Please enter a coupon code");
      return;
    }

    if (subtotal <= 0) {
      toast.error("Add items to your bag before applying coupon");
      return;
    }

    setIsValidating(true);
    try {
      const { data } = await api.post("/coupon/validate", {
        code: codeToApply,
        orderAmount: subtotal,
      });

      if (data?.success && data?.coupon) {
        toast.success(data.message || `Coupon "${codeToApply}" applied!`);
        if (typeof onCouponApply === "function") {
          onCouponApply(data.coupon);
        }
        setCouponInput("");
        setShowAvailableDropdown(false);
      } else {
        toast.error(data?.message || "Invalid coupon code");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Invalid or expired coupon code. Please check and try again.";
      toast.error(msg);
    } finally {
      setIsValidating(false);
    }
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    executeCouponValidation(couponInput.trim().toUpperCase());
  };

  const handleSelectCouponFromList = (code) => {
    executeCouponValidation(code.trim().toUpperCase());
  };

  return (
    <div className="bg-[#121215] border border-neutral-800/80 rounded-2xl p-6 space-y-6 h-fit shadow-xl">
      <h3 className="text-base font-bold uppercase tracking-wider text-white border-b border-neutral-800 pb-4">
        Order Summary
      </h3>

      {/* Coupon Application Block */}
      {allowCoupon && (
        <div className="space-y-3 pt-1 pb-3 border-b border-neutral-800">
          <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
            Have a Promo Code?
          </label>

          {appliedCoupon ? (
            /* Active Applied Coupon Chip */
            <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl animate-in fade-in duration-200">
              <div className="flex items-center space-x-2 min-w-0 pr-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <HiOutlineTag className="text-sm" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono text-xs font-bold tracking-wider text-white uppercase">
                      {appliedCoupon.code}
                    </span>
                    <HiOutlineCheck className="text-emerald-400 text-xs" />
                  </div>
                  <p className="text-[10px] text-emerald-400">
                    Saved ₹{couponDiscount.toLocaleString()}{" "}
                    {appliedCoupon.discountType === "percentage"
                      ? `(${appliedCoupon.discountValue}% OFF)`
                      : `(Flat Discount)`}
                  </p>
                </div>
              </div>

              {typeof onCouponRemove === "function" && (
                <button
                  type="button"
                  onClick={onCouponRemove}
                  className="p-1 text-neutral-400 hover:text-rose-400 rounded-md hover:bg-neutral-800 transition-colors"
                  title="Remove coupon"
                >
                  <HiOutlineX className="text-base" />
                </button>
              )}
            </div>
          ) : (
            /* Coupon Code Input Form */
            <form onSubmit={handleApplyCoupon} className="flex space-x-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="e.g. NUVORA10"
                  disabled={isValidating}
                  className="w-full bg-neutral-900 border border-neutral-800 text-xs text-white uppercase font-mono px-3 py-2.5 rounded-xl focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600 placeholder:normal-case"
                />
              </div>
              <button
                type="submit"
                disabled={isValidating || !couponInput.trim()}
                className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors disabled:opacity-40 shrink-0"
              >
                {isValidating ? "..." : "Apply"}
              </button>
            </form>
          )}

          {/* Available Coupons Dropdown List */}
          {availableCoupons.length > 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowAvailableDropdown((prev) => !prev)}
                className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-neutral-900/90 border border-neutral-800/90 hover:border-neutral-700 text-xs text-neutral-300 hover:text-white transition-all cursor-pointer group"
              >
                <span className="flex items-center space-x-1.5 font-medium">
                  <span className="text-amber-400 text-xs">✨</span>
                  <span>Available Coupons ({availableCoupons.length})</span>
                </span>
                <HiOutlineChevronDown
                  className={`text-neutral-400 group-hover:text-white transition-transform duration-200 ${
                    showAvailableDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showAvailableDropdown && (
                <div className="mt-2 space-y-2 max-h-56 overflow-y-auto pr-1 animate-in fade-in slide-in-from-top-1 duration-150 custom-scrollbar">
                  {availableCoupons.map((c) => {
                    const isCurrent = appliedCoupon?.code === c.code;
                    const meetsMin = !c.minPurchaseAmount || subtotal >= c.minPurchaseAmount;

                    return (
                      <div
                        key={c.code}
                        className={`p-2.5 rounded-xl border transition-all text-xs flex items-center justify-between gap-2 ${
                          isCurrent
                            ? "bg-emerald-500/10 border-emerald-500/40"
                            : "bg-neutral-950/90 border-neutral-800/90 hover:border-neutral-700"
                        }`}
                      >
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-mono font-bold text-white uppercase tracking-wider">
                              {c.code}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                              {c.discountType === "percentage"
                                ? `${c.discountValue}% OFF`
                                : `₹${c.discountValue} OFF`}
                            </span>
                          </div>
                          {c.description && (
                            <p className="text-[10px] text-neutral-400 truncate">
                              {c.description}
                            </p>
                          )}
                          <p className="text-[10px] text-neutral-500">
                            {c.minPurchaseAmount > 0
                              ? `Min order: ₹${c.minPurchaseAmount.toLocaleString()}`
                              : "No minimum order requirement"}
                          </p>
                        </div>

                        {isCurrent ? (
                          <span className="text-[11px] font-semibold text-emerald-400 flex items-center space-x-1 shrink-0 px-2 py-1">
                            <HiOutlineCheck />
                            <span>Applied</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={isValidating || !meetsMin}
                            onClick={() => handleSelectCouponFromList(c.code)}
                            className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-colors shrink-0 ${
                              meetsMin
                                ? "bg-white text-black hover:bg-neutral-200 shadow-sm cursor-pointer"
                                : "bg-neutral-900 text-neutral-500 border border-neutral-800 cursor-not-allowed"
                            }`}
                            title={
                              meetsMin
                                ? `Apply ${c.code}`
                                : `Requires minimum order of ₹${c.minPurchaseAmount.toLocaleString()}`
                            }
                          >
                            Apply
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Pricing breakdown */}
      <div className="space-y-3 text-sm text-neutral-400">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="text-neutral-200 font-mono">₹{subtotal.toLocaleString()}</span>
        </div>

        <div className="flex justify-between">
          <span>Standard Delivery</span>
          <span className="text-neutral-200 font-mono">
            {shipping === 0 ? (
              <span className="text-emerald-400 font-semibold">FREE</span>
            ) : (
              `₹${shipping.toLocaleString()}`
            )}
          </span>
        </div>

        {/* Coupon Discount */}
        {couponDiscount > 0 && (
          <div className="flex justify-between text-emerald-400 font-medium">
            <span className="flex items-center space-x-1">
              <HiOutlineTag className="text-xs" />
              <span>Coupon ({appliedCoupon?.code})</span>
            </span>
            <span className="font-mono font-semibold">
              - ₹{couponDiscount.toLocaleString()}
            </span>
          </div>
        )}

        {/* Special Volume Discount */}
        {specialDiscount > 0 && (
          <div className="flex justify-between text-neutral-300 font-medium">
            <span>Volume Discount</span>
            <span className="font-mono">- ₹{specialDiscount.toLocaleString()}</span>
          </div>
        )}

        {/* Total Price */}
        <div className="pt-4 border-t border-neutral-800 flex justify-between items-baseline">
          <span className="text-base font-bold text-white">Estimated Total</span>
          <div className="text-right">
            <span className="text-xl font-extrabold text-white font-mono">
              ₹{total.toLocaleString()}
            </span>
            {totalDiscount > 0 && (
              <p className="text-[10px] text-emerald-400 font-mono">
                Total Saved: ₹{totalDiscount.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Button */}
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

      {/* Trust Badges */}
      <div className="space-y-2 pt-2 text-[11px] text-neutral-500 border-t border-neutral-900">
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
