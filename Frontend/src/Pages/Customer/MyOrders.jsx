import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyOrders, cancelOrder, requestOrderReplacement } from "../../redux/slices/orderSlice";
import Loader from "../../Components/Common/Loader";
import toast from "react-hot-toast";
import {
  HiOutlineShoppingBag,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineTruck,
  HiOutlineXCircle,
  HiOutlineTag,
  HiOutlineRefresh,
  HiOutlineX,
} from "react-icons/hi";

const isWithin7Days = (createdAt) => {
  if (!createdAt) return false;
  const orderTime = new Date(createdAt).getTime();
  const diffDays = (Date.now() - orderTime) / (1000 * 60 * 60 * 24);
  return diffDays <= 7;
};

const getStatusBadge = (status) => {
  switch (status) {
    case "Delivered":
      return (
        <span className="flex items-center space-x-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 backdrop-blur-md shrink-0">
          <HiOutlineCheckCircle />
          <span>Delivered</span>
        </span>
      );
    case "Shipped":
      return (
        <span className="flex items-center space-x-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-950/80 text-blue-400 border border-blue-700/60 backdrop-blur-md shrink-0">
          <HiOutlineTruck />
          <span>Shipped</span>
        </span>
      );
    case "Cancelled":
      return (
        <span className="flex items-center space-x-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-rose-950/80 text-rose-400 border border-rose-700/60 backdrop-blur-md shrink-0">
          <HiOutlineXCircle />
          <span>Cancelled</span>
        </span>
      );
    default:
      return (
        <span className="flex items-center space-x-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-200 shrink-0">
          <HiOutlineClock />
          <span>Placed</span>
        </span>
      );
  }
};

const getReplacementBadge = (status) => {
  switch (status) {
    case "Approved":
      return (
        <span className="flex items-center space-x-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 backdrop-blur-md shrink-0">
          <HiOutlineCheckCircle />
          <span>Replacement: Approved</span>
        </span>
      );
    case "Rejected":
      return (
        <span className="flex items-center space-x-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-rose-950/80 text-rose-400 border border-rose-700/60 backdrop-blur-md shrink-0">
          <HiOutlineXCircle />
          <span>Replacement: Rejected</span>
        </span>
      );
    default:
      return (
        <span className="flex items-center space-x-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-950/80 text-amber-400 border border-amber-700/60 backdrop-blur-md shrink-0 animate-pulse">
          <HiOutlineRefresh />
          <span>Replacement: Pending</span>
        </span>
      );
  }
};

const MyOrders = () => {
  const dispatch = useDispatch();
  const { myOrders: orders, loading: isLoading, actionLoading: isCancelling } = useSelector(
    (state) => state.orders
  );

  // Replacement modal state
  const [selectedOrderForReplacement, setSelectedOrderForReplacement] = useState(null);
  const [replacementReason, setReplacementReason] = useState("Defective / Damaged Item");
  const [replacementNote, setReplacementNote] = useState("");
  const [isSubmittingReplacement, setIsSubmittingReplacement] = useState(false);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      await dispatch(cancelOrder(orderId)).unwrap();
      toast.success("Order cancelled successfully");
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to cancel order");
    }
  };

  const handleOpenReplacementModal = (order) => {
    setSelectedOrderForReplacement(order);
    setReplacementReason("Defective / Damaged Item");
    setReplacementNote("");
  };

  const handleCloseReplacementModal = () => {
    setSelectedOrderForReplacement(null);
    setReplacementReason("Defective / Damaged Item");
    setReplacementNote("");
  };

  const handleSubmitReplacement = async (e) => {
    e.preventDefault();
    if (!selectedOrderForReplacement) return;
    if (!replacementReason) {
      toast.error("Please select a reason for replacement");
      return;
    }

    try {
      setIsSubmittingReplacement(true);
      await dispatch(
        requestOrderReplacement({
          orderId: selectedOrderForReplacement._id,
          reason: replacementReason,
          userNote: replacementNote,
        })
      ).unwrap();

      toast.success("Replacement request sent successfully! Status: Pending.");
      handleCloseReplacementModal();
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to submit replacement request");
    } finally {
      setIsSubmittingReplacement(false);
    }
  };

  if (isLoading && orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader text="Retrieving your orders..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6 sm:space-y-8">
      {/* Title */}
      <div className="border-b border-neutral-800 pb-6">
        <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-neutral-500">
          CUSTOMER PORTAL
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-['Syne',sans-serif]">
          Your Orders & Tracking
        </h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 sm:py-24 bg-[#121215] border border-neutral-800/80 rounded-3xl space-y-4">
          <HiOutlineShoppingBag className="text-5xl text-neutral-600 mx-auto" />
          <h2 className="text-xl font-bold text-white font-['Syne',sans-serif]">
            No Orders Yet
          </h2>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            You have not placed any orders yet. Explore our curated collections.
          </p>
          <Link
            to="/shop"
            className="inline-block mt-2 px-6 py-3 bg-white text-black text-xs uppercase font-extrabold tracking-widest rounded-xl hover:bg-neutral-200"
          >
            Explore Catalogue
          </Link>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {orders.map((order) => {
            const product = order.productId || {};
            const image = product?.images?.[0] || "";

            return (
              <div
                key={order._id}
                className="bg-[#121215] border border-neutral-800/80 rounded-3xl p-4 sm:p-7 space-y-4 sm:space-y-6 overflow-hidden"
              >
                {/* Card Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
                  <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                    <div className="min-w-0">
                      <span className="text-[9px] uppercase font-mono text-neutral-500 block">
                        ORDER REF
                      </span>
                      <h3 className="text-xs sm:text-base font-bold font-mono text-white truncate max-w-[200px] sm:max-w-none" title={order._id}>
                        {order._id}
                      </h3>
                    </div>
                    <span className="text-neutral-600 hidden sm:inline">•</span>
                    <div className="hidden sm:block shrink-0">
                      <span className="text-[9px] uppercase font-mono text-neutral-500 block">
                        DATE
                      </span>
                      <p className="text-xs text-neutral-300 font-mono">
                        {new Date(order.createdAt || Date.now()).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5 shrink-0">
                    {order.replacement?.isRequested && getReplacementBadge(order.replacement?.status)}
                    {getStatusBadge(order.orderStatus)}
                    {order.orderStatus === "Placed" && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        disabled={isCancelling}
                        className="text-xs text-rose-400 hover:text-rose-300 font-semibold transition-colors disabled:opacity-50"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                {/* Product Info Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 min-w-0">
                  <div className="flex items-start sm:items-center space-x-3.5 sm:space-x-4 w-full sm:flex-1 min-w-0">
                    <img
                      src={image}
                      alt={product.title || "Product"}
                      className="w-16 h-20 sm:w-20 sm:h-24 object-cover rounded-2xl bg-neutral-900 border border-neutral-800 shrink-0"
                    />
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-semibold text-white break-words line-clamp-2">
                        {product.title || "Essential Piece"}
                      </h4>

                      {/* Variant Tags */}
                      {(order.selectedColor || order.selectedSize) && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {order.selectedColor && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-700 text-neutral-300 font-mono">
                              Color: <strong className="text-white">{order.selectedColor}</strong>
                            </span>
                          )}
                          {order.selectedSize && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-700 text-neutral-300 font-mono">
                              Size: <strong className="text-white">{order.selectedSize}</strong>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Applied Coupon Badge if present */}
                      {(order.couponCode || order.couponDiscount > 0) && (
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
                          <HiOutlineTag className="text-xs shrink-0" />
                          <span>
                            Coupon Applied: <strong className="text-white uppercase">{order.couponCode}</strong>
                            {order.couponDiscount > 0 && ` (-₹${order.couponDiscount.toLocaleString()})`}
                          </span>
                        </div>
                      )}

                      <p className="text-xs text-neutral-400 font-mono">
                        Qty: {order.quantity} • Unit Price: ₹{((order.totalPrice || 0) / (order.quantity || 1)).toLocaleString()}
                      </p>
                      <p className="text-[11px] text-neutral-500 break-words line-clamp-1">
                        To: {order.address}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-neutral-800 shrink-0">
                    <span className="text-[9px] uppercase font-mono text-neutral-500 block">
                      TOTAL ({order.paymentMethod || "COD"})
                    </span>
                    <div className="space-y-0.5">
                      <p className="text-base sm:text-xl font-extrabold text-white font-mono">
                        ₹{order.totalPrice?.toLocaleString()}
                      </p>
                      {order.couponDiscount > 0 && (
                        <div className="flex sm:justify-end items-center space-x-2 font-mono text-[11px]">
                          <span className="text-neutral-500 line-through">
                            ₹{(order.originalPrice || (order.totalPrice + order.couponDiscount))?.toLocaleString()}
                          </span>
                          <span className="text-emerald-400 font-semibold">
                            Saved ₹{order.couponDiscount?.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Replacement Action / Status Section */}
                <div className="pt-3.5 border-t border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {order.replacement?.isRequested ? (
                    <div className="space-y-1 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono uppercase text-neutral-500">Reason:</span>
                        <span className="font-semibold text-white bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded">
                          {order.replacement.reason}
                        </span>
                        {order.replacement.requestedAt && (
                          <span className="text-[11px] text-neutral-500 font-mono">
                            (Requested on {new Date(order.replacement.requestedAt).toLocaleDateString()})
                          </span>
                        )}
                      </div>
                      {order.replacement.userNote && (
                        <p className="text-neutral-400 text-[11px] italic">
                          "{order.replacement.userNote}"
                        </p>
                      )}
                      {order.replacement.adminNote && (
                        <p className="text-amber-400 text-[11px]">
                          Seller Note: {order.replacement.adminNote}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2">
                      <div className="text-[11px] text-neutral-500 font-mono">
                        {order.orderStatus === "Cancelled" ? (
                          <span>Order cancelled • Replacement not available</span>
                        ) : order.orderStatus !== "Delivered" ? (
                          <span className="text-neutral-500">Replacement available within 7 days once Delivered</span>
                        ) : isWithin7Days(order.createdAt) ? (
                          <span className="text-emerald-400/90">Delivered • Eligible for 7-day replacement</span>
                        ) : (
                          <span className="text-neutral-500">7-day replacement window has expired</span>
                        )}
                      </div>

                      {order.orderStatus === "Delivered" && isWithin7Days(order.createdAt) && (
                        <button
                          type="button"
                          onClick={() => handleOpenReplacementModal(order)}
                          className="px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-semibold text-white transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm hover:border-neutral-500 shrink-0 self-start sm:self-auto"
                        >
                          <HiOutlineRefresh className="text-sm text-neutral-400" />
                          <span>Request Replacement</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Replacement Request Modal */}
      {selectedOrderForReplacement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141417] border border-neutral-800 rounded-3xl p-6 sm:p-7 w-full max-w-lg space-y-5 shadow-2xl relative">
            <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                  RETURN & REPLACEMENT
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white font-['Syne',sans-serif]">
                  Request Product Replacement
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5 font-mono truncate max-w-[280px] sm:max-w-none">
                  Order Ref: {selectedOrderForReplacement._id}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseReplacementModal}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Product summary snippet */}
            <div className="flex items-center space-x-3 p-3 rounded-2xl bg-neutral-900/60 border border-neutral-800">
              {selectedOrderForReplacement.productId?.images?.[0] && (
                <img
                  src={selectedOrderForReplacement.productId.images[0]}
                  alt="Product"
                  className="w-12 h-14 object-cover rounded-xl border border-neutral-700 shrink-0"
                />
              )}
              <div className="min-w-0 flex-1 text-xs">
                <p className="font-semibold text-white truncate">
                  {selectedOrderForReplacement.productId?.title || "Item"}
                </p>
                <p className="text-neutral-400 font-mono text-[11px]">
                  Qty: {selectedOrderForReplacement.quantity} • Total: ₹{selectedOrderForReplacement.totalPrice?.toLocaleString()}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitReplacement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Reason for Replacement <span className="text-rose-400">*</span>
                </label>
                <select
                  value={replacementReason}
                  onChange={(e) => setReplacementReason(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white transition-colors cursor-pointer"
                  required
                >
                  <option value="Defective / Damaged Item">Defective / Damaged Item</option>
                  <option value="Wrong Item Received">Wrong Item Received</option>
                  <option value="Size / Fit Issue">Size / Fit Issue</option>
                  <option value="Quality Not as Expected">Quality Not as Expected</option>
                  <option value="Missing Parts / Accessories">Missing Parts / Accessories</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Additional Notes / Details <span className="text-neutral-500 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={replacementNote}
                  onChange={(e) => setReplacementNote(e.target.value)}
                  placeholder="Describe what went wrong with the item..."
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseReplacementModal}
                  disabled={isSubmittingReplacement}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReplacement}
                  className="px-5 py-2.5 rounded-xl bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-all shadow-lg disabled:opacity-50 flex items-center space-x-2 cursor-pointer"
                >
                  {isSubmittingReplacement ? (
                    <span>Submitting...</span>
                  ) : (
                    <span>Submit Request</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
