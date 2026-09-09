import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSellerOrders,
  updateOrderStatus,
  updateReplacementStatus,
} from "../../redux/slices/orderSlice";
import SellerSidebar from "../../Components/Seller/SellerSidebar";
import Loader from "../../Components/Common/Loader";
import toast from "react-hot-toast";
import {
  HiOutlineShoppingBag,
  HiOutlineLocationMarker,
  HiOutlineUser,
  HiOutlineTag,
  HiOutlineCurrencyRupee,
  HiOutlineFilter,
  HiOutlineRefresh,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
} from "react-icons/hi";

const SellerOrders = () => {
  const dispatch = useDispatch();
  const { sellerOrders: orders, loading: isLoading, actionLoading: isUpdating } = useSelector(
    (state) => state.orders
  );

  const [filterType, setFilterType] = useState("all"); // "all", "replacements", "with_coupon", "no_coupon"
  const [updatingReplacementId, setUpdatingReplacementId] = useState(null);

  useEffect(() => {
    dispatch(fetchSellerOrders());
  }, [dispatch]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await dispatch(updateOrderStatus({ id: orderId, status: newStatus })).unwrap();
      toast.success(`Order status updated to "${newStatus}"`);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to update order status");
    }
  };

  const handleReplacementAction = async (orderId, status) => {
    try {
      setUpdatingReplacementId(orderId);
      await dispatch(updateReplacementStatus({ id: orderId, status })).unwrap();
      toast.success(`Replacement request marked as ${status}`);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to update replacement status");
    } finally {
      setUpdatingReplacementId(null);
    }
  };

  const couponOrdersCount = orders.filter((o) => o.couponCode || o.couponDiscount > 0).length;
  const replacementOrdersCount = orders.filter((o) => o.replacement?.isRequested).length;
  const pendingReplacementsCount = orders.filter(
    (o) => o.replacement?.isRequested && o.replacement?.status === "Pending"
  ).length;
  const standardOrdersCount = orders.length - couponOrdersCount;
  const totalDiscountsGiven = orders.reduce((acc, o) => acc + (o.couponDiscount || 0), 0);

  const filteredOrders = orders.filter((order) => {
    if (filterType === "replacements") return Boolean(order.replacement?.isRequested);
    const hasCoupon = Boolean(order.couponCode || order.couponDiscount > 0);
    if (filterType === "with_coupon") return hasCoupon;
    if (filterType === "no_coupon") return !hasCoupon;
    return true;
  });

  if (isLoading && orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader text="Loading customer orders..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
        {/* Left Sidebar */}
        <SellerSidebar />

        {/* Orders Content */}
        <div className="flex-1 space-y-6 sm:space-y-8 min-w-0">
          <div className="border-b border-neutral-800 pb-6">
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-neutral-500">
              FULFILLMENT & ORDER AUDIT
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-['Syne',sans-serif]">
              Customer Orders ({orders.length})
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Track incoming customer purchases, manage 7-day replacement requests, audit coupons, and fulfill shipments.
            </p>
          </div>

          {/* Admin Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-4 rounded-2xl bg-[#121215] border border-neutral-800 space-y-1">
              <span className="text-[10px] font-mono uppercase text-neutral-500">Total Orders</span>
              <p className="text-xl sm:text-2xl font-extrabold text-white font-mono">{orders.length}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#121215] border border-neutral-800 space-y-1">
              <span className="text-[10px] font-mono uppercase text-neutral-500">Order Placed</span>
              <p className="text-xl sm:text-2xl font-extrabold text-amber-400 font-mono">
                {orders.filter((o) => o.orderStatus === "Placed").length}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#121215] border border-neutral-800 space-y-1">
              <span className="text-[10px] font-mono uppercase text-neutral-500">Replacements</span>
              <p className="text-xl sm:text-2xl font-extrabold text-indigo-400 font-mono flex items-center justify-between">
                <span>{replacementOrdersCount}</span>
                {pendingReplacementsCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {pendingReplacementsCount} new
                  </span>
                )}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#121215] border border-neutral-800 space-y-1">
              <span className="text-[10px] font-mono uppercase text-neutral-500">Coupon Orders</span>
              <p className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono">
                {couponOrdersCount}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#121215] border border-neutral-800 space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono uppercase text-neutral-500">Discounts Given</span>
              <p className="text-xl sm:text-2xl font-extrabold text-white font-mono flex items-center">
                ₹{totalDiscountsGiven.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[#121215] border border-neutral-800">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                filterType === "all"
                  ? "bg-white text-black shadow-md"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              All Orders ({orders.length})
            </button>

            <button
              type="button"
              onClick={() => setFilterType("replacements")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 cursor-pointer ${
                filterType === "replacements"
                  ? "bg-indigo-500 text-white shadow-md font-extrabold"
                  : "text-indigo-400 hover:text-indigo-300"
              }`}
            >
              <HiOutlineRefresh className="text-sm" />
              <span>Replacements ({replacementOrdersCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterType("with_coupon")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 cursor-pointer ${
                filterType === "with_coupon"
                  ? "bg-emerald-500 text-black shadow-md font-extrabold"
                  : "text-emerald-400 hover:text-emerald-300"
              }`}
            >
              <HiOutlineTag className="text-sm" />
              <span>With Coupon ({couponOrdersCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterType("no_coupon")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                filterType === "no_coupon"
                  ? "bg-white text-black shadow-md"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Standard Orders ({standardOrdersCount})
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-16 bg-[#121215] border border-neutral-800/80 rounded-3xl space-y-4">
              <HiOutlineShoppingBag className="text-5xl text-neutral-600 mx-auto" />
              <h3 className="text-lg font-bold text-white font-['Syne',sans-serif]">
                No Orders Yet
              </h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Customer orders for your listed pieces will appear here in real-time.
              </p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-16 bg-[#121215] border border-neutral-800/80 rounded-3xl space-y-2">
              <HiOutlineFilter className="text-3xl text-neutral-600 mx-auto" />
              <p className="text-sm font-semibold text-white">No orders match this filter.</p>
              <button
                type="button"
                onClick={() => setFilterType("all")}
                className="text-xs text-neutral-400 underline hover:text-white pt-2 cursor-pointer"
              >
                View all orders
              </button>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {filteredOrders.map((order) => {
                const product = order.productId || {};
                const buyer = order.buyerId || {};
                const hasCoupon = Boolean(order.couponCode || order.couponDiscount > 0);
                const originalVal = order.originalPrice || (order.totalPrice + (order.couponDiscount || 0));

                return (
                  <div
                    key={order._id}
                    className={`bg-[#121215] border rounded-3xl p-4 sm:p-7 space-y-4 sm:space-y-6 overflow-hidden min-w-0 transition-all ${
                      hasCoupon
                        ? "border-emerald-500/40 shadow-lg shadow-emerald-950/20 ring-1 ring-emerald-500/20"
                        : "border-neutral-800/80"
                    }`}
                  >
                    {/* Order Top Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
                        <div className="min-w-0">
                          <span className="text-[9px] uppercase font-mono text-neutral-500 block">
                            ORDER NO.
                          </span>
                          <h3 className="text-xs sm:text-base font-bold font-mono text-white truncate max-w-[200px] sm:max-w-none" title={order._id}>
                            {order._id}
                          </h3>
                        </div>

                        {/* Prominent Coupon Indicator Badge for Admin */}
                        {hasCoupon ? (
                          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-extrabold shadow-sm">
                            <HiOutlineTag className="text-sm shrink-0" />
                            <span>COUPON: {order.couponCode || "DISCOUNT"} (-₹{order.couponDiscount?.toLocaleString()})</span>
                          </div>
                        ) : (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-500 font-mono">
                            Standard (No Coupon)
                          </span>
                        )}
                        {/* Replacement badge in top bar if requested */}
                        {order.replacement?.isRequested && (
                          <span
                            className={`text-[10px] px-2.5 py-0.5 rounded-lg font-mono font-bold uppercase border ${
                              order.replacement.status === "Pending"
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse"
                                : order.replacement.status === "Approved"
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                                : "bg-rose-500/20 text-rose-300 border-rose-500/50"
                            }`}
                          >
                            Replacement: {order.replacement.status}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2.5 shrink-0">
                        <span className="text-xs text-neutral-400 font-semibold">Status:</span>
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          disabled={isUpdating}
                          className="bg-neutral-900 border border-neutral-800 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl text-white focus:outline-none focus:border-white transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <option value="Placed">Placed (Pending)</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-xs text-neutral-300 min-w-0">
                      {/* Item Details & Pricing Breakdown */}
                      <div className="space-y-2.5 min-w-0 p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800/60">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 block">
                            ORDERED ITEM & PRICING
                          </span>
                          {hasCoupon && (
                            <span className="text-[10px] font-bold text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                              Discounted Order
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-semibold text-white break-words line-clamp-2">
                          {product.title || "Essential Piece"}
                        </h4>

                        {/* Variant Badges */}
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

                        {/* Financial breakdown for admin transparency */}
                        <div className="pt-2 border-t border-neutral-800/80 space-y-1 font-mono text-xs">
                          <div className="flex justify-between text-neutral-400">
                            <span>Quantity:</span>
                            <span className="text-white">{order.quantity} pcs</span>
                          </div>

                          {hasCoupon && (
                            <>
                              <div className="flex justify-between text-neutral-400">
                                <span>Original Price:</span>
                                <span className="line-through text-neutral-500">₹{originalVal?.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-emerald-400 font-bold">
                                <span>Coupon ({order.couponCode}):</span>
                                <span>-₹{order.couponDiscount?.toLocaleString()}</span>
                              </div>
                            </>
                          )}

                          <div className="flex justify-between items-baseline pt-1 border-t border-neutral-800 text-white font-bold">
                            <span>Final Total ({order.paymentMethod}):</span>
                            <span className="text-sm font-extrabold text-white">
                              ₹{order.totalPrice?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Customer Info & Exact Delivery Address */}
                      <div className="space-y-2.5 min-w-0 p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800/60 flex flex-col justify-between">
                        <div className="space-y-2">
                          <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 block">
                            BUYER & DELIVERY DESTINATION
                          </span>
                          
                          <div className="space-y-1">
                            <p className="font-semibold text-white flex items-center space-x-1.5 truncate">
                              <HiOutlineUser className="text-sm text-neutral-400 shrink-0" />
                              <span className="truncate">{buyer.userName || "Customer"}</span>
                              {buyer.email && (
                                <span className="text-[11px] text-neutral-500 font-mono">({buyer.email})</span>
                              )}
                            </p>

                            {buyer.phone && (
                              <p className="text-[11px] text-neutral-400 font-mono pl-5">
                                Phone: {buyer.phone}
                              </p>
                            )}

                            <div className="text-neutral-300 flex items-start space-x-1.5 pt-1">
                              <HiOutlineLocationMarker className="text-base text-rose-400 mt-0.5 shrink-0" />
                              <div className="min-w-0 flex-1">
                                <span className="text-[10px] text-neutral-500 uppercase font-mono block">Shipping Address:</span>
                                <p className="text-xs text-neutral-200 break-words font-medium">
                                  {order.address || "No address provided"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Admin audit note */}
                        {hasCoupon && (
                          <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-[11px] text-emerald-400 flex items-center space-x-1.5">
                            <HiOutlineTag className="text-xs shrink-0" />
                            <span>Buyer redeemed coupon <strong className="text-white uppercase">{order.couponCode}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Replacement Request Card for Admin */}
                    {order.replacement?.isRequested && (
                      <div
                        className={`p-4 sm:p-5 rounded-2xl border space-y-3.5 transition-all ${
                          order.replacement.status === "Pending"
                            ? "bg-amber-950/20 border-amber-500/50 ring-1 ring-amber-500/20 shadow-lg shadow-amber-950/30"
                            : order.replacement.status === "Approved"
                            ? "bg-emerald-950/20 border-emerald-500/40"
                            : "bg-rose-950/20 border-rose-500/40"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800/80 pb-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <HiOutlineRefresh
                              className={`text-base ${
                                order.replacement.status === "Pending"
                                  ? "text-amber-400 animate-spin"
                                  : order.replacement.status === "Approved"
                                  ? "text-emerald-400"
                                  : "text-rose-400"
                              }`}
                            />
                            <span className="text-xs font-bold uppercase tracking-wider text-white">
                              Replacement Request
                            </span>
                            <span
                              className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold border ${
                                order.replacement.status === "Pending"
                                  ? "bg-amber-500/15 text-amber-400 border-amber-500/40"
                                  : order.replacement.status === "Approved"
                                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
                                  : "bg-rose-500/15 text-rose-400 border-rose-500/40"
                              }`}
                            >
                              {order.replacement.status}
                            </span>
                          </div>

                          {order.replacement.requestedAt && (
                            <span className="text-[10px] text-neutral-400 font-mono">
                              Requested:{" "}
                              {new Date(order.replacement.requestedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </div>

                        {/* Buyer Info & Replacement Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          {/* User ID and Gmail Info */}
                          <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800/80 space-y-1.5">
                            <span className="text-[9px] uppercase font-mono tracking-widest text-neutral-500 block">
                              CUSTOMER / BUYER IDENTITY
                            </span>
                            <p className="font-semibold text-white flex items-center space-x-1.5">
                              <span className="text-neutral-400 text-[11px]">Buyer Name:</span>
                              <span className="text-white">{buyer.userName || "N/A"}</span>
                            </p>
                            <p className="font-mono text-[11px] text-neutral-300">
                              <span className="text-neutral-500">User ID: </span>
                              <span className="text-neutral-300 select-all font-bold">
                                {buyer._id || order.buyerId?._id || "N/A"}
                              </span>
                            </p>
                            <p className="font-mono text-[11px] text-neutral-300">
                              <span className="text-neutral-500">Gmail: </span>
                              <span className="text-sky-400 font-medium select-all">
                                {buyer.email || "N/A"}
                              </span>
                            </p>
                          </div>

                          {/* Reason and Note */}
                          <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800/80 space-y-1.5">
                            <span className="text-[9px] uppercase font-mono tracking-widest text-neutral-500 block">
                              REASON & NOTES
                            </span>
                            <p className="font-semibold text-white">
                              Reason: <span className="text-amber-400 font-mono">{order.replacement.reason}</span>
                            </p>
                            <p className="text-neutral-300 text-[11px] italic break-words">
                              Note: {order.replacement.userNote || "No specific note provided"}
                            </p>
                            {order.replacement.adminNote && (
                              <p className="text-neutral-400 text-[11px] pt-1 font-mono">
                                Admin Feedback: {order.replacement.adminNote}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Admin Action Buttons */}
                        {order.replacement.status === "Pending" ? (
                          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                            <span className="text-xs text-neutral-400 font-semibold">
                              Decide on this replacement:
                            </span>
                            <div className="flex items-center space-x-2.5 self-end sm:self-auto">
                              <button
                                type="button"
                                disabled={updatingReplacementId === order._id}
                                onClick={() => handleReplacementAction(order._id, "Rejected")}
                                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/40 text-rose-400 hover:text-rose-300 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
                              >
                                <HiOutlineXCircle className="text-sm" />
                                <span>Reject Request</span>
                              </button>
                              <button
                                type="button"
                                disabled={updatingReplacementId === order._id}
                                onClick={() => handleReplacementAction(order._id, "Approved")}
                                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center space-x-1.5"
                              >
                                <HiOutlineCheckCircle className="text-sm" />
                                <span>Accept Replacement</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="pt-1.5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                            <span className="text-neutral-500">
                              Resolved:{" "}
                              {order.replacement.resolvedAt
                                ? new Date(order.replacement.resolvedAt).toLocaleDateString()
                                : "Processed"}
                            </span>
                            <div className="flex items-center space-x-3">
                              {order.replacement.status === "Approved" ? (
                                <span className="text-emerald-400 font-bold flex items-center space-x-1">
                                  <HiOutlineCheckCircle className="text-base" />
                                  <span>Replacement Accepted</span>
                                </span>
                              ) : (
                                <span className="text-rose-400 font-bold flex items-center space-x-1">
                                  <HiOutlineXCircle className="text-base" />
                                  <span>Replacement Rejected</span>
                                </span>
                              )}
                              <button
                                type="button"
                                disabled={updatingReplacementId === order._id}
                                onClick={() =>
                                  handleReplacementAction(
                                    order._id,
                                    order.replacement.status === "Approved" ? "Rejected" : "Approved"
                                  )
                                }
                                className="text-[11px] text-neutral-400 underline hover:text-white cursor-pointer"
                              >
                                Change to {order.replacement.status === "Approved" ? "Reject" : "Accept"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerOrders;
