import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axiosInstance";
import SellerSidebar from "../../Components/Seller/SellerSidebar";
import Loader from "../../Components/Common/Loader";
import toast from "react-hot-toast";
import {
  HiOutlineTag,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineX,
  HiOutlineCalendar,
  HiOutlineSparkles,
  HiOutlineArrowLeft,
} from "react-icons/hi";

const SellerCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    minPurchaseAmount: "",
    maxDiscountAmount: "",
    expiryDate: "",
    isActive: true,
  });

  // Fetch all coupons
  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/coupon/all");
      if (data?.success) {
        setCoupons(data.coupons || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load coupons");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Create Coupon
  const handleCreateCoupon = async (e) => {
    e.preventDefault();

    if (!formData.code.trim()) {
      return toast.error("Please enter a coupon code");
    }

    if (!formData.discountValue || Number(formData.discountValue) <= 0) {
      return toast.error("Please enter a valid discount amount");
    }

    if (formData.discountType === "percentage" && Number(formData.discountValue) > 100) {
      return toast.error("Percentage discount cannot exceed 100%");
    }

    setIsSubmitting(true);
    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minPurchaseAmount: formData.minPurchaseAmount ? Number(formData.minPurchaseAmount) : 0,
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : 0,
        expiryDate: formData.expiryDate || null,
        isActive: formData.isActive,
      };

      const { data } = await api.post("/coupon/create", payload);
      toast.success(data?.message || "Coupon created successfully!");
      setShowCreateModal(false);
      setFormData({
        code: "",
        description: "",
        discountType: "percentage",
        discountValue: "",
        minPurchaseAmount: "",
        maxDiscountAmount: "",
        expiryDate: "",
        isActive: true,
      });
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create coupon");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Status
  const handleToggleStatus = async (id) => {
    try {
      const { data } = await api.put(`/coupon/toggle/${id}`);
      toast.success(data?.message || "Coupon status updated");
      setCoupons((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isActive: !c.isActive } : c))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to toggle status");
    }
  };

  // Delete Coupon
  const handleDeleteCoupon = async (id, code) => {
    if (!window.confirm(`Are you sure you want to delete coupon "${code}"?`)) return;

    try {
      const { data } = await api.delete(`/coupon/${id}`);
      toast.success(data?.message || "Coupon deleted");
      setCoupons((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete coupon");
    }
  };

  const activeCount = coupons.filter((c) => c.isActive).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
        {/* Left Sidebar */}
        <SellerSidebar />

        {/* Coupons Main Content */}
        <div className="flex-1 space-y-6 sm:space-y-8 min-w-0">
          {/* Breadcrumb back link */}
          <Link
            to="/seller/dashboard"
            className="inline-flex items-center space-x-1.5 text-xs text-neutral-400 hover:text-white transition-colors group"
          >
            <HiOutlineArrowLeft className="text-sm transition-transform group-hover:-translate-x-1" />
            <span>Back to Dashboard</span>
          </Link>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
            <div>
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-neutral-500">
                MARKETING & PROMOTIONS
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-['Syne',sans-serif]">
                Custom Coupons ({coupons.length})
              </h1>
              <p className="text-xs text-neutral-400 mt-1">
                Create multiple promotional codes, set custom percentage or flat discounts, and track usage.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center space-x-2 px-5 py-3 bg-white text-black text-xs font-extrabold uppercase tracking-widest rounded-xl hover:bg-neutral-200 transition-colors shadow-lg self-start sm:self-auto cursor-pointer"
            >
              <HiOutlinePlus className="text-base" />
              <span>Create Coupon</span>
            </button>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-[#121215] border border-neutral-800/80 rounded-2xl p-5 space-y-1">
              <span className="text-[10px] sm:text-xs font-mono uppercase text-neutral-500">
                Total Codes
              </span>
              <p className="text-2xl font-extrabold text-white font-mono">{coupons.length}</p>
            </div>

            <div className="bg-[#121215] border border-neutral-800/80 rounded-2xl p-5 space-y-1">
              <span className="text-[10px] sm:text-xs font-mono uppercase text-neutral-500">
                Active Promo Codes
              </span>
              <p className="text-2xl font-extrabold text-emerald-400 font-mono">{activeCount}</p>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-[#121215] border border-neutral-800/80 rounded-2xl p-5 space-y-1">
              <span className="text-[10px] sm:text-xs font-mono uppercase text-neutral-500">
                Default Welcome Code
              </span>
              <p className="text-sm font-bold text-white font-mono flex items-center space-x-1.5 pt-1">
                <span className="px-2 py-0.5 bg-neutral-800 rounded border border-neutral-700">
                  NUVORA10
                </span>
                <span className="text-[11px] text-neutral-400">10% OFF</span>
              </p>
            </div>
          </div>

          {/* Coupons List */}
          {isLoading ? (
            <div className="py-20 flex justify-center">
              <Loader text="Loading coupons..." />
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-16 bg-[#121215] border border-neutral-800/80 rounded-3xl space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-500 flex items-center justify-center mx-auto">
                <HiOutlineTag className="text-2xl" />
              </div>
              <h3 className="text-base font-bold text-white font-['Syne',sans-serif]">
                No Custom Coupons Created Yet
              </h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Create promotional discount codes for your customers to use during checkout.
              </p>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-neutral-200 transition-colors"
              >
                <HiOutlinePlus />
                <span>Create Your First Code</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coupons.map((coupon) => {
                const isExpired =
                  coupon.expiryDate && new Date() > new Date(coupon.expiryDate);

                return (
                  <div
                    key={coupon._id}
                    className={`bg-[#121215] border rounded-2xl p-5 space-y-4 transition-all relative overflow-hidden ${
                      coupon.isActive && !isExpired
                        ? "border-neutral-800 hover:border-neutral-700"
                        : "border-neutral-900 opacity-60"
                    }`}
                  >
                    {/* Top Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-white font-mono text-sm font-bold uppercase tracking-wider">
                            {coupon.code}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              coupon.isActive && !isExpired
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : isExpired
                                ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                                : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                            }`}
                          >
                            {isExpired ? "Expired" : coupon.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        {coupon.description && (
                          <p className="text-xs text-neutral-400 pt-1">
                            {coupon.description}
                          </p>
                        )}
                      </div>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteCoupon(coupon._id, coupon.code)}
                        className="p-1.5 text-neutral-500 hover:text-rose-400 rounded-lg hover:bg-neutral-900 transition-colors"
                        title="Delete coupon"
                      >
                        <HiOutlineTrash className="text-base" />
                      </button>
                    </div>

                    {/* Discount & Conditions breakdown */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-neutral-900">
                      <div>
                        <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">
                          Discount Value
                        </span>
                        <span className="text-white font-mono font-bold text-sm">
                          {coupon.discountType === "percentage"
                            ? `${coupon.discountValue}% OFF`
                            : `₹${coupon.discountValue.toLocaleString()} FLAT`}
                        </span>
                        {coupon.discountType === "percentage" && coupon.maxDiscountAmount > 0 && (
                          <span className="text-[10px] text-neutral-500 block">
                            Max: ₹{coupon.maxDiscountAmount}
                          </span>
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">
                          Minimum Order
                        </span>
                        <span className="text-white font-mono font-bold text-sm">
                          {coupon.minPurchaseAmount > 0
                            ? `₹${coupon.minPurchaseAmount.toLocaleString()}`
                            : "No Minimum"}
                        </span>
                      </div>
                    </div>

                    {/* Expiry & Toggle Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-900 text-xs">
                      <div className="flex items-center space-x-1.5 text-[11px] text-neutral-400">
                        <HiOutlineCalendar className="text-neutral-500" />
                        <span>
                          {coupon.expiryDate
                            ? new Date(coupon.expiryDate).toLocaleDateString()
                            : "Never expires"}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(coupon._id)}
                        className={`text-[11px] font-semibold px-3 py-1 rounded-lg border transition-colors ${
                          coupon.isActive
                            ? "bg-neutral-900 text-neutral-300 hover:text-rose-400 border-neutral-800"
                            : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/30"
                        }`}
                      >
                        {coupon.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Coupon Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[#121215] border border-neutral-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center space-x-2">
                <HiOutlineSparkles className="text-xl text-white" />
                <h3 className="text-base font-bold uppercase tracking-wider text-white">
                  Create Custom Coupon
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
              >
                <HiOutlineX className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              {/* Code */}
              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      code: e.target.value.toUpperCase().replace(/\s/g, ""),
                    }))
                  }
                  required
                  placeholder="e.g. FESTIVE25, SUMMER500"
                  className="w-full bg-neutral-900 border border-neutral-800 text-sm text-white uppercase font-mono px-4 py-3 rounded-xl focus:outline-none focus:border-white transition-colors"
                />
                <p className="text-[10px] text-neutral-500 font-mono">
                  All coupon codes are unique across your store and automatically uppercase.
                </p>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                  Description / Note
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="e.g. Exclusive seasonal launch discount"
                  className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white px-4 py-3 rounded-xl focus:outline-none focus:border-white transition-colors"
                />
              </div>

              {/* Discount Type */}
              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                  Discount Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, discountType: "percentage" }))
                    }
                    className={`py-3 px-4 rounded-xl border text-xs font-bold uppercase tracking-wider transition-colors text-center ${
                      formData.discountType === "percentage"
                        ? "bg-white text-black border-white shadow-md"
                        : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white"
                    }`}
                  >
                    Percentage (%)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, discountType: "flat" }))
                    }
                    className={`py-3 px-4 rounded-xl border text-xs font-bold uppercase tracking-wider transition-colors text-center ${
                      formData.discountType === "flat"
                        ? "bg-white text-black border-white shadow-md"
                        : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white"
                    }`}
                  >
                    Flat Rupee (₹)
                  </button>
                </div>
              </div>

              {/* Discount Value */}
              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                  {formData.discountType === "percentage"
                    ? "Discount Percentage (1 - 100%) *"
                    : "Flat Discount Amount (₹) *"}
                </label>
                <input
                  type="number"
                  name="discountValue"
                  min="1"
                  max={formData.discountType === "percentage" ? "100" : undefined}
                  value={formData.discountValue}
                  onChange={handleInputChange}
                  required
                  placeholder={
                    formData.discountType === "percentage" ? "e.g. 20 for 20%" : "e.g. 500 for ₹500"
                  }
                  className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white font-mono px-4 py-3 rounded-xl focus:outline-none focus:border-white transition-colors"
                />
              </div>

              {/* Min Purchase & Max Cap */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                    Min Order Spend (₹)
                  </label>
                  <input
                    type="number"
                    name="minPurchaseAmount"
                    min="0"
                    value={formData.minPurchaseAmount}
                    onChange={handleInputChange}
                    placeholder="0 for no minimum"
                    className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white font-mono px-4 py-3 rounded-xl focus:outline-none focus:border-white transition-colors"
                  />
                </div>

                {formData.discountType === "percentage" && (
                  <div className="space-y-1.5">
                    <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                      Max Discount Cap (₹)
                    </label>
                    <input
                      type="number"
                      name="maxDiscountAmount"
                      min="0"
                      value={formData.maxDiscountAmount}
                      onChange={handleInputChange}
                      placeholder="0 for unlimited"
                      className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white font-mono px-4 py-3 rounded-xl focus:outline-none focus:border-white transition-colors"
                    />
                  </div>
                )}
              </div>

              {/* Expiry Date */}
              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white font-mono px-4 py-3 rounded-xl focus:outline-none focus:border-white transition-colors"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center space-x-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-1/2 py-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs uppercase font-bold tracking-wider rounded-xl transition-colors border border-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 py-3 bg-white text-black hover:bg-neutral-200 text-xs uppercase font-extrabold tracking-widest rounded-xl transition-colors disabled:opacity-50 shadow-lg"
                >
                  {isSubmitting ? "Creating..." : "Save Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerCoupons;
