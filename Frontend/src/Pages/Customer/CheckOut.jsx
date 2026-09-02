import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { placeOrder } from "../../redux/slices/orderSlice";
import { fetchCart } from "../../redux/slices/cartSlice";
import OrderSummary from "../../Components/Cart/OrderSummary";
import Loader from "../../Components/Common/Loader";
import toast from "react-hot-toast";
import { HiOutlineCash, HiOutlineCreditCard, HiOutlineLocationMarker } from "react-icons/hi";

const CheckOut = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { items: cartItems, loading: isCartLoading } = useSelector((state) => state.cart);
  const { actionLoading: isPlacingOrder } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [addressData, setAddressData] = useState({
    street: user?.address || "",
    city: "",
    pinCode: "",
    state: "",
    phone: user?.phone || "",
  });

  const subtotal = cartItems.reduce((acc, item) => {
    const p = item.productId || {};
    const price = p.discountPrice > 0 ? p.discountPrice : p.price || 0;
    return acc + price * (item.quantity || 1);
  }, 0);

  const discount = subtotal > 3000 ? 500 : 0;
  const shipping = subtotal > 1999 || subtotal === 0 ? 0 : 150;

  const handleInputChange = (e) => {
    setAddressData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleConfirmOrder = async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      navigate("/shop");
      return;
    }

    if (
      !addressData.street.trim() ||
      !addressData.city.trim() ||
      !addressData.state.trim() ||
      !addressData.pinCode.trim() ||
      !addressData.phone.trim()
    ) {
      toast.error("Please fill in your complete delivery address & phone number");
      return;
    }

    const fullAddress = `${addressData.street.trim()}, ${addressData.city.trim()}, ${addressData.state.trim()} - ${addressData.pinCode.trim()} (Phone: ${addressData.phone.trim()})`;

    try {
      // Place orders for items in cart
      for (const item of cartItems) {
        const prodId = item.productId?._id || item.productId;
        await dispatch(
          placeOrder({
            productId: prodId,
            quantity: item.quantity || 1,
            selectedColor: item.selectedColor || "",
            selectedSize: item.selectedSize || "",
            cartItemId: item._id,
            address: fullAddress,
            paymentMethod: paymentMethod,
          })
        ).unwrap();
      }

      toast.success(
        paymentMethod === "COD"
          ? "Order placed successfully with Cash on Delivery!"
          : "Order placed successfully! Online payment confirmed."
      );
      navigate("/my-orders");
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to place order. Please check item stock.");
    }
  };

  if (isCartLoading && cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader text="Preparing checkout..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6 sm:space-y-8">
      {/* Title */}
      <div className="border-b border-neutral-800 pb-6">
        <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-neutral-500">
          SECURE TRANSACTIONS
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-['Syne',sans-serif]">
          Complete Checkout
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        {/* Form Details Area */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8 min-w-0">
          {/* 1. Shipping Address */}
          <div className="bg-[#121215] border border-neutral-800/80 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center space-x-3 border-b border-neutral-800 pb-4">
              <HiOutlineLocationMarker className="text-xl text-white" />
              <div>
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
                  1. Delivery Destination & Contact
                </h2>
                <p className="text-[11px] text-neutral-400">Enter the exact address where your package should be delivered.</p>
              </div>
            </div>

            <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                  Street Address / Flat / House No. *
                </label>
                <input
                  type="text"
                  name="street"
                  value={addressData.street}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter house no, building name, street area"
                  className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white px-4 py-3 rounded-xl focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                  City / Town *
                </label>
                <input
                  type="text"
                  name="city"
                  value={addressData.city}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your city"
                  className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white px-4 py-3 rounded-xl focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                  PIN Code / Postal Code *
                </label>
                <input
                  type="text"
                  name="pinCode"
                  value={addressData.pinCode}
                  onChange={handleInputChange}
                  required
                  placeholder="6-digit PIN code"
                  className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white px-4 py-3 rounded-xl focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600 font-medium font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                  State / Province *
                </label>
                <input
                  type="text"
                  name="state"
                  value={addressData.state}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter state"
                  className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white px-4 py-3 rounded-xl focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={addressData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="Mobile number for delivery coordination"
                  className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white px-4 py-3 rounded-xl focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600 font-medium font-mono"
                />
              </div>
            </form>
          </div>

          {/* 2. Payment Method */}
          <div className="bg-[#121215] border border-neutral-800/80 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center space-x-3 border-b border-neutral-800 pb-4">
              <HiOutlineCreditCard className="text-xl text-white" />
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
                2. Payment Method
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* COD Option */}
              <div
                onClick={() => setPaymentMethod("COD")}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start space-x-4 ${
                  paymentMethod === "COD"
                    ? "bg-neutral-900 border-white text-white shadow-lg"
                    : "bg-[#121215] border-neutral-800 text-neutral-400 hover:border-neutral-700"
                }`}
              >
                <div className="p-2.5 rounded-xl border border-neutral-800 bg-neutral-900">
                  <HiOutlineCash className="text-2xl text-white" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold">Cash on Delivery (COD)</h4>
                  <p className="text-xs text-neutral-400">Pay cash or UPI at the time of doorstep delivery.</p>
                </div>
              </div>

              {/* Razorpay Option */}
              <div
                onClick={() => setPaymentMethod("Razorpay")}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start space-x-4 ${
                  paymentMethod === "Razorpay"
                    ? "bg-neutral-900 border-white text-white shadow-lg"
                    : "bg-[#121215] border-neutral-800 text-neutral-400 hover:border-neutral-700"
                }`}
              >
                <div className="p-2.5 rounded-xl border border-neutral-800 bg-neutral-900">
                  <HiOutlineCreditCard className="text-2xl text-white" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold">Razorpay Online</h4>
                  <p className="text-xs text-neutral-400">UPI, NetBanking, Cards & Wallets.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Side */}
        <div className="lg:col-span-1 space-y-6 min-w-0">
          {/* Order Items Preview Card */}
          <div className="bg-[#121215] border border-neutral-800/80 rounded-2xl p-5 space-y-3.5 min-w-0 overflow-hidden">
            <h3 className="text-xs uppercase font-bold tracking-wider text-neutral-400 font-mono border-b border-neutral-800 pb-2.5">
              Review Items ({cartItems.length})
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cartItems.map((item) => {
                const prod = item.productId || {};
                const price = prod.discountPrice > 0 ? prod.discountPrice : prod.price || 0;
                const img = prod?.images?.[0] || "";

                return (
                  <div key={item._id} className="flex items-center space-x-3 min-w-0">
                    <img
                      src={img}
                      alt={prod.title || "Item"}
                      className="w-12 h-14 object-cover rounded-lg bg-neutral-900 border border-neutral-800 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-white truncate" title={prod.title}>
                        {prod.title || "Essential Piece"}
                      </p>
                      {(item.selectedColor || item.selectedSize) && (
                        <p className="text-[10px] text-neutral-400 font-mono">
                          {item.selectedColor && `Color: ${item.selectedColor}`}
                          {item.selectedColor && item.selectedSize && " • "}
                          {item.selectedSize && `Size: ${item.selectedSize}`}
                        </p>
                      )}
                      <p className="text-[11px] text-neutral-400 font-mono">
                        Qty: {item.quantity} • ₹{(price * (item.quantity || 1)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <OrderSummary
            subtotal={subtotal}
            discount={discount}
            shipping={shipping}
            buttonText={isPlacingOrder ? "Placing Order..." : "Confirm & Place Order"}
            onButtonClick={handleConfirmOrder}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckOut;
