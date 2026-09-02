import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyOrders, cancelOrder } from "../../redux/slices/orderSlice";
import Loader from "../../Components/Common/Loader";
import toast from "react-hot-toast";
import {
  HiOutlineShoppingBag,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineTruck,
  HiOutlineXCircle,
} from "react-icons/hi";

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

const MyOrders = () => {
  const dispatch = useDispatch();
  const { myOrders: orders, loading: isLoading, actionLoading: isCancelling } = useSelector(
    (state) => state.orders
  );

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

                  <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0">
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
                    <div className="space-y-1 min-w-0 flex-1">
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
                    <p className="text-base sm:text-xl font-extrabold text-white font-mono">
                      ₹{order.totalPrice?.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
