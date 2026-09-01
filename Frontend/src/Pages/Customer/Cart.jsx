import React from "react";
import { Link } from "react-router-dom";
import { useGetCartQuery } from "../../redux/apiSlice";
import CartItem from "../../Components/Cart/CartItem";
import OrderSummary from "../../Components/Cart/OrderSummary";
import Loader from "../../Components/Common/Loader";
import { HiOutlineArrowLeft, HiOutlineShoppingBag } from "react-icons/hi";

const Cart = () => {
  const { data: cartRes, isLoading } = useGetCartQuery();
  const cartItems = cartRes?.data || [];

  const subtotal = cartItems.reduce((acc, item) => {
    const p = item.productId || {};
    const price = p.discountPrice > 0 ? p.discountPrice : p.price || 0;
    return acc + price * (item.quantity || 1);
  }, 0);

  const discount = subtotal > 3000 ? 500 : 0;
  const shipping = subtotal > 1999 || subtotal === 0 ? 0 : 150;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader text="Loading your bag..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6 sm:space-y-8">
      {/* Title & Back */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-neutral-500">
            CHECKOUT BAG ({cartItems.length})
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-['Syne',sans-serif]">
            Your Shopping Bag
          </h1>
        </div>

        <Link
          to="/shop"
          className="flex items-center space-x-2 text-xs uppercase tracking-wider font-semibold text-neutral-400 hover:text-white"
        >
          <HiOutlineArrowLeft />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {/* Cart Layout */}
      {cartItems.length === 0 ? (
        <div className="text-center py-20 sm:py-24 bg-[#121215] border border-neutral-800/80 rounded-3xl space-y-4">
          <HiOutlineShoppingBag className="text-5xl text-neutral-600 mx-auto" />
          <h2 className="text-xl font-bold text-white font-['Syne',sans-serif]">
            Your Bag is Empty
          </h2>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Looks like you haven't added any minimal essentials to your bag yet.
          </p>
          <Link
            to="/shop"
            className="inline-block mt-2 px-6 py-3 bg-white text-black text-xs uppercase font-extrabold tracking-widest rounded-xl hover:bg-neutral-200 transition-colors shadow-lg"
          >
            Explore Essentials
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <CartItem key={item._id} item={item} />
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              subtotal={subtotal}
              shipping={shipping}
              discount={discount}
              buttonText="Proceed to Checkout"
              buttonLink="/checkout"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
