import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart } from "../../redux/slices/cartSlice";
import CartItem from "../../Components/Cart/CartItem";
import OrderSummary from "../../Components/Cart/OrderSummary";
import Loader from "../../Components/Common/Loader";
import { HiOutlineArrowLeft, HiOutlineShoppingBag } from "react-icons/hi";

const Cart = () => {
  const dispatch = useDispatch();

  // Step 1: Read cart state from Redux store
  const { items: cartItems, loading: isLoading } = useSelector((state) => state.cart);

  // Step 2: Fetch cart items on initial component mount
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // Step 3: Calculate Subtotal (sum of price * quantity for all items)
  let subtotal = 0;
  cartItems.forEach((item) => {
    const product = item.productId || {};
    
    // Use discountPrice if available, otherwise fallback to regular price
    const activePrice = product.discountPrice > 0 ? product.discountPrice : (product.price || 0);
    const quantity = item.quantity || 1;

    // Add item total to subtotal
    subtotal += activePrice * quantity;
  });

  // Step 4: Calculate Discount (Apply ₹500 discount if subtotal exceeds ₹3000)
  let discount = 0;
  if (subtotal > 3000) {
    discount = 500;
  }

  // Step 5: Calculate Shipping charges (Free shipping over ₹1999 or when empty, else ₹150)
  let shipping = 150;
  if (subtotal === 0 || subtotal > 1999) {
    shipping = 0;
  }

  // Step 6: Show loader while data is being fetched from the backend
  if (isLoading && cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader text="Loading your bag..." />
      </div>
    );
  }

  // Step 7: Render Cart UI
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6 sm:space-y-8">
      {/* Header: Title and Continue Shopping link */}
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

      {/* Case A: Empty Bag state */}
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
        /* Case B: Cart with Items */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column: List of cart items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <CartItem key={item._id} item={item} />
            ))}
          </div>

          {/* Right Column: Order Summary (Subtotal, Discount, Shipping & Checkout action) */}
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
