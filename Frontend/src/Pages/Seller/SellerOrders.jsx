import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSellerOrders,
  updateOrderStatus,
} from "../../redux/slices/orderSlice";
import SellerSidebar from "../../Components/Seller/SellerSidebar";
import Loader from "../../Components/Common/Loader";
import toast from "react-hot-toast";
import {
  HiOutlineShoppingBag,
  HiOutlineLocationMarker,
  HiOutlineUser,
} from "react-icons/hi";

const SellerOrders = () => {
  const dispatch = useDispatch();
  const { sellerOrders: orders, loading: isLoading, actionLoading: isUpdating } = useSelector(
    (state) => state.orders
  );

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
              FULFILLMENT PORTAL
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-['Syne',sans-serif]">
              Customer Orders ({orders.length})
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Track incoming customer purchases and view buyer dispatch addresses.
            </p>
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
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {orders.map((order) => {
                const product = order.productId || {};
                const buyer = order.buyerId || {};

                return (
                  <div
                    key={order._id}
                    className="bg-[#121215] border border-neutral-800/80 rounded-3xl p-4 sm:p-7 space-y-4 sm:space-y-6 overflow-hidden min-w-0"
                  >
                    {/* Order Top Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
                      <div className="min-w-0">
                        <span className="text-[9px] uppercase font-mono text-neutral-500 block">
                          ORDER NO.
                        </span>
                        <h3 className="text-xs sm:text-base font-bold font-mono text-white truncate max-w-[220px] sm:max-w-none" title={order._id}>
                          {order._id}
                        </h3>
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
                      {/* Item Details */}
                      <div className="space-y-2 min-w-0 p-3.5 rounded-2xl bg-neutral-900/40 border border-neutral-800/60">
                        <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 block">
                          ORDERED ITEM
                        </span>
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

                        <p className="font-mono text-neutral-400">
                          Quantity: <strong className="text-white">{order.quantity} pcs</strong> • Total:{" "}
                          <strong className="text-white font-mono">₹{order.totalPrice?.toLocaleString()}</strong> (
                          {order.paymentMethod})
                        </p>
                      </div>

                      {/* Customer Info & Exact Delivery Address */}
                      <div className="space-y-2 min-w-0 p-3.5 rounded-2xl bg-neutral-900/40 border border-neutral-800/60">
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
                    </div>
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
