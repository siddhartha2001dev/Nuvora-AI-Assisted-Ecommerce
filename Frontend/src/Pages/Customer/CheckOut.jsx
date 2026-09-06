import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { placeOrder } from "../../redux/slices/orderSlice";
import { fetchCart } from "../../redux/slices/cartSlice";
import { fetchProfile, addAddress } from "../../redux/slices/authSlice";
import OrderSummary from "../../Components/Cart/OrderSummary";
import Loader from "../../Components/Common/Loader";
import toast from "react-hot-toast";
import api from "../../api/axiosInstance";
import {
  HiOutlineCash,
  HiOutlineCreditCard,
  HiOutlineLocationMarker,
  HiOutlineHome,
  HiOutlineOfficeBuilding,
  HiOutlineCheck,
  HiOutlinePlus,
} from "react-icons/hi";
import PhoneInputWithCountry from "../../Components/Common/PhoneInputWithCountry";

const CheckOut = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { items: cartItems, loading: isCartLoading } = useSelector((state) => state.cart);
  const { actionLoading: isPlacingOrder } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchCart());
    dispatch(fetchProfile());
  }, [dispatch]);

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [isPayingRazorpay, setIsPayingRazorpay] = useState(false);

  const savedAddresses = user?.addresses || [];
  const defaultSaved = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [saveToAddressBook, setSaveToAddressBook] = useState(true);

  const [newAddressData, setNewAddressData] = useState({
    fullName: user?.userName || "",
    phone: user?.phone || "",
    street: "",
    city: "",
    state: "",
    pinCode: "",
    label: "Home",
  });

  // Auto-select default saved address when addresses are available
  useEffect(() => {
    if (savedAddresses.length > 0) {
      if (!selectedAddressId || selectedAddressId === "new") {
        const def = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
        setSelectedAddressId(def?._id || "new");
      }
    } else {
      setSelectedAddressId("new");
    }
  }, [savedAddresses]);

  // Keep phone/name in newAddressData initialized from user
  useEffect(() => {
    if (user) {
      setNewAddressData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.userName || "",
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user]);

  const handleNewAddressChange = (e) => {
    setNewAddressData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = sessionStorage.getItem("nuvora_applied_coupon");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleCouponApply = (coupon) => {
    setAppliedCoupon(coupon);
    try {
      sessionStorage.setItem("nuvora_applied_coupon", JSON.stringify(coupon));
    } catch {}
  };

  const handleCouponRemove = () => {
    setAppliedCoupon(null);
    try {
      sessionStorage.removeItem("nuvora_applied_coupon");
    } catch {}
  };

  const subtotal = cartItems.reduce((acc, item) => {
    const p = item.productId || {};
    const price = p.discountPrice > 0 ? p.discountPrice : p.price || 0;
    return acc + price * (item.quantity || 1);
  }, 0);

  const specialDiscount = subtotal > 3000 ? 500 : 0;
  const couponDiscount = appliedCoupon?.discountAmount || 0;
  const totalDiscount = specialDiscount + couponDiscount;
  const shipping = subtotal > 1999 || subtotal === 0 ? 0 : 150;
  const finalTotal = Math.max(0, subtotal - totalDiscount + shipping);

  const getDeliveryInfo = () => {
    if (selectedAddressId && selectedAddressId !== "new") {
      const chosen = savedAddresses.find((a) => a._id === selectedAddressId);
      if (chosen) {
        const recipient = chosen.fullName || user?.userName || "Valued Customer";
        const phone = chosen.phone || user?.phone || "";
        const fullAddress = `${chosen.street.trim()}, ${chosen.city.trim()}, ${chosen.state.trim()} - ${chosen.pinCode.trim()}${phone ? ` (Phone: ${phone})` : ""}${recipient ? ` (Recipient: ${recipient})` : ""}`;
        return {
          valid: true,
          fullAddress,
          recipient,
          phone,
          isNew: false,
        };
      }
    }

    // New address case
    if (
      !newAddressData.street.trim() ||
      !newAddressData.city.trim() ||
      !newAddressData.state.trim() ||
      !newAddressData.pinCode.trim()
    ) {
      return {
        valid: false,
        error: "Please enter complete delivery address (street, city, state, PIN code)",
      };
    }

    const recipient = newAddressData.fullName.trim() || user?.userName || "Valued Customer";
    const phone = newAddressData.phone.trim() || user?.phone || "";
    if (!phone) {
      return {
        valid: false,
        error: "Please enter contact phone number for delivery",
      };
    }

    const fullAddress = `${newAddressData.street.trim()}, ${newAddressData.city.trim()}, ${newAddressData.state.trim()} - ${newAddressData.pinCode.trim()} (Phone: ${phone}) (Recipient: ${recipient})`;

    return {
      valid: true,
      fullAddress,
      recipient,
      phone,
      isNew: true,
    };
  };

  const handleConfirmOrder = async () => {
    // 1. Validation
    if (cartItems.length === 0) return toast.error("Cart is empty");

    const delivery = getDeliveryInfo();
    if (!delivery.valid) {
      return toast.error(delivery.error);
    }

    const fullAddress = delivery.fullAddress;

    // Save to address book if requested
    if (delivery.isNew && saveToAddressBook) {
      dispatch(
        addAddress({
          fullName: delivery.recipient,
          phone: delivery.phone,
          street: newAddressData.street.trim(),
          city: newAddressData.city.trim(),
          state: newAddressData.state.trim(),
          pinCode: newAddressData.pinCode.trim(),
          label: newAddressData.label || "Home",
          isDefault: savedAddresses.length === 0,
        })
      );
    }

    // 2. Agar COD hai
    if (paymentMethod === "COD") {
      try {
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
              paymentMethod: "COD",
            })
          ).unwrap();
        }
        toast.success("Order placed with Cash on Delivery!");
        handleCouponRemove();
        dispatch(fetchCart());
        navigate("/my-orders");
      } catch (err) {
        toast.error(typeof err === "string" ? err : "Failed to place order. Please check item stock.");
      }
      return;
    }

    // 3. Agar Razorpay hai
    try {
      setIsPayingRazorpay(true);

      // Ensure Razorpay SDK is loaded
      const loadRazorpayScript = () => {
        return new Promise((resolve) => {
          if (window.Razorpay) {
            resolve(true);
            return;
          }
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.async = true;
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !window.Razorpay) {
        setIsPayingRazorpay(false);
        return toast.error("Razorpay SDK failed to load. Please check your internet connection.");
      }

      // Step A: Backend se order create karwao
      const { data } = await api.post("/order/razorpay/create-order", {
        amount: finalTotal,
      });

      const razorpayKey =
        data?.keyId ||
        import.meta.env.VITE_RAZORPAY_KEY_ID ||
        "rzp_test_TYfrRVbqnoyzaT";

      // Step B: Razorpay Popup Open karo
      const razor = new window.Razorpay({
        key: razorpayKey,
        amount: data.amount,
        currency: data.currency || "INR",
        name: "NUVORA Studio",
        description: "Curated Minimalist Essentials",
        order_id: data.orderId,
        handler: async (response) => {
          // Step C: Payment verify karke order place karo
          try {
            await api.post("/order/razorpay/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              cartItems: cartItems,
              address: fullAddress,
            });

            toast.success("Payment Successful! Order Placed 🎉");
            handleCouponRemove();
            dispatch(fetchCart());
            navigate("/my-orders");
          } catch (verErr) {
            toast.error(verErr.response?.data?.message || "Payment verification failed.");
          } finally {
            setIsPayingRazorpay(false);
          }
        },
        prefill: {
          name: delivery.recipient || user?.userName || "",
          email: user?.email || "",
          contact: delivery.phone || user?.phone || "",
        },
        theme: { color: "#000000" },
        modal: {
          ondismiss: () => setIsPayingRazorpay(false),
        },
      });

      razor.open();
    } catch (error) {
      setIsPayingRazorpay(false);
      toast.error(error.response?.data?.message || "Payment failed. Please try again.");
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
              <div className="flex items-center space-x-3">
                <HiOutlineLocationMarker className="text-xl text-white shrink-0" />
                <div>
                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
                    1. Delivery Destination & Contact
                  </h2>
                  <p className="text-[11px] text-neutral-400">
                    {savedAddresses.length > 0 && selectedAddressId !== "new"
                      ? "Applied automatically from your saved Address Book."
                      : "Enter delivery details for this shipment."}
                  </p>
                </div>
              </div>

              {savedAddresses.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setSelectedAddressId((prev) =>
                      prev === "new" ? (defaultSaved?._id || savedAddresses[0]._id) : "new"
                    )
                  }
                  className="px-3.5 py-1.5 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-xs font-semibold text-white transition-colors self-start sm:self-auto flex items-center space-x-1.5 shadow-sm"
                >
                  {selectedAddressId === "new" ? (
                    <span>← Choose Saved Address</span>
                  ) : (
                    <>
                      <HiOutlinePlus className="text-xs" />
                      <span>Deliver to New Address</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* If user has saved addresses and has NOT toggled to 'new' address */}
            {savedAddresses.length > 0 && selectedAddressId !== "new" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr._id;
                    const labelIcon =
                      addr.label === "Work" ? (
                        <HiOutlineOfficeBuilding />
                      ) : addr.label === "Other" ? (
                        <HiOutlineLocationMarker />
                      ) : (
                        <HiOutlineHome />
                      );

                    return (
                      <div
                        key={addr._id}
                        onClick={() => setSelectedAddressId(addr._id)}
                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                          isSelected
                            ? "bg-neutral-900 border-white text-white shadow-xl ring-1 ring-white/20"
                            : "bg-[#16161a] border-neutral-800/80 text-neutral-300 hover:border-neutral-700"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center space-x-2">
                              <span className="inline-flex items-center space-x-1 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300">
                                {labelIcon}
                                <span>{addr.label || "Home"}</span>
                              </span>
                              {addr.isDefault && (
                                <span className="inline-flex items-center space-x-1 text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-950/90 text-emerald-400 border border-emerald-700/60">
                                  Default
                                </span>
                              )}
                            </div>

                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                isSelected
                                  ? "border-white bg-white text-black"
                                  : "border-neutral-600 bg-transparent"
                              }`}
                            >
                              {isSelected && <HiOutlineCheck className="text-xs font-bold" />}
                            </div>
                          </div>

                          <div className="pt-1">
                            <h4 className="text-xs sm:text-sm font-bold text-white">
                              {addr.fullName || user?.userName || "Valued Customer"}
                            </h4>
                            {addr.phone && (
                              <p className="text-xs text-neutral-400 font-mono mt-0.5">
                                {addr.phone}
                              </p>
                            )}
                          </div>

                          <p className="text-xs text-neutral-300 leading-relaxed">
                            {addr.street}, {addr.city}, {addr.state} - <span className="font-mono">{addr.pinCode}</span>
                          </p>
                        </div>

                        {isSelected && (
                          <div className="pt-2 border-t border-neutral-800 text-[11px] text-emerald-400 font-semibold flex items-center space-x-1">
                            <HiOutlineCheck className="text-xs" />
                            <span>Address applied for this delivery</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* New Address Entry Form */
              <div className="space-y-4">
                {savedAddresses.length > 0 && (
                  <div className="flex items-center justify-between bg-neutral-900/60 border border-neutral-800/80 px-4 py-2.5 rounded-xl">
                    <span className="text-xs text-neutral-300 font-medium">
                      Entering a new delivery address
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedAddressId(defaultSaved?._id || savedAddresses[0]._id)}
                      className="text-xs text-white underline hover:text-neutral-300 transition-colors font-semibold"
                    >
                      Use a saved address instead
                    </button>
                  </div>
                )}

                {/* Address Type Selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                    Address Type
                  </label>
                  <div className="grid grid-cols-3 gap-2 max-w-sm">
                    {["Home", "Work", "Other"].map((label) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setNewAddressData((prev) => ({ ...prev, label }))}
                        className={`py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all flex items-center justify-center space-x-1.5 ${
                          newAddressData.label === label
                            ? "bg-white text-black border-white shadow-md"
                            : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700"
                        }`}
                      >
                        {label === "Home" && <HiOutlineHome />}
                        {label === "Work" && <HiOutlineOfficeBuilding />}
                        {label === "Other" && <HiOutlineLocationMarker />}
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                      Recipient Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={newAddressData.fullName}
                      onChange={handleNewAddressChange}
                      placeholder="Receiver's name"
                      className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white px-4 py-3 rounded-xl focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600 font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                      Contact Phone Number *
                    </label>
                    <PhoneInputWithCountry
                      name="phone"
                      value={newAddressData.phone}
                      onChange={handleNewAddressChange}
                      placeholder="Mobile number for delivery"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                    Street Address / Flat / House No. *
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={newAddressData.street}
                    onChange={handleNewAddressChange}
                    required
                    placeholder="Enter house no, building name, street area"
                    className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white px-4 py-3 rounded-xl focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                      City / Town *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={newAddressData.city}
                      onChange={handleNewAddressChange}
                      required
                      placeholder="Enter city"
                      className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white px-4 py-3 rounded-xl focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600 font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                      State / Province *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={newAddressData.state}
                      onChange={handleNewAddressChange}
                      required
                      placeholder="Enter state"
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
                      value={newAddressData.pinCode}
                      onChange={handleNewAddressChange}
                      required
                      placeholder="6-digit PIN code"
                      className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white px-4 py-3 rounded-xl focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600 font-medium font-mono"
                    />
                  </div>
                </div>

                {/* Save to Address Book Checkbox */}
                <label className="flex items-center space-x-3 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={saveToAddressBook}
                    onChange={(e) => setSaveToAddressBook(e.target.checked)}
                    className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 text-black focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs text-neutral-300 font-medium">
                    Save this address to my Address Book for future orders
                  </span>
                </label>
              </div>
            )}
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
            specialDiscount={specialDiscount}
            shipping={shipping}
            appliedCoupon={appliedCoupon}
            onCouponApply={handleCouponApply}
            onCouponRemove={handleCouponRemove}
            allowCoupon={true}
            buttonText={
              isPlacingOrder || isPayingRazorpay
                ? "Processing..."
                : paymentMethod === "Razorpay"
                ? `Pay ₹${finalTotal.toLocaleString()} with Razorpay`
                : `Confirm Order (₹${finalTotal.toLocaleString()})`
            }
            onButtonClick={handleConfirmOrder}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckOut;
