import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../redux/slices/authSlice";
import { fetchCart } from "../../redux/slices/cartSlice";
import { fetchWishlist } from "../../redux/slices/wishlistSlice";
import { useTheme } from "../../context/ThemeContext";
import toast from "react-hot-toast";
import {
  HiOutlineShoppingBag,
  HiOutlineHeart,
  HiOutlineUser,
  HiOutlineSearch,
  HiOutlineSparkles,
  HiOutlineLogout,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineClipboardList,
  HiOutlineChevronDown,
  HiOutlineHome,
  HiOutlineChevronRight,
  HiOutlineTag,
  HiOutlinePlus,
  HiOutlineEye,
} from "react-icons/hi";

// Unique Bespoke Animated Luxury Hamburger Component
const AnimatedHamburger = ({ isOpen, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
      aria-expanded={isOpen}
      className={`md:hidden relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200 focus:outline-none select-none z-50 ${
        isOpen
          ? "bg-white text-black border border-white shadow-md"
          : "bg-[#141418] text-neutral-300 border border-neutral-800 hover:border-neutral-700 active:scale-95"
      }`}
    >
      <div className="w-5 h-4 relative flex items-center justify-center">
        {/* Top bar */}
        <span
          className={`absolute left-0 w-5 h-[2px] rounded-full transition-all duration-300 ease-in-out ${
            isOpen
              ? "top-[7px] rotate-45 bg-black"
              : "top-0 bg-neutral-200"
          }`}
        />
        {/* Middle bar */}
        <span
          className={`absolute left-0 top-[7px] h-[2px] rounded-full transition-all duration-200 ease-in-out ${
            isOpen
              ? "w-0 opacity-0"
              : "w-3.5 opacity-100 bg-neutral-400"
          }`}
        />
        {/* Bottom bar */}
        <span
          className={`absolute left-0 w-5 h-[2px] rounded-full transition-all duration-300 ease-in-out ${
            isOpen
              ? "top-[7px] -rotate-45 bg-black"
              : "top-[14px] bg-neutral-200"
          }`}
        />
      </div>
    </button>
  );
};

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [hideOnMobile, setHideOnMobile] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isDarkMode, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  const isAdmin = isAuthenticated && (user?.role === "Admin" || user?.role === "Seller");

  // Initial fetch for cart & wishlist when authenticated buyer
  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated, isAdmin]);

  const cartCount = cartItems?.length || 0;
  const wishlistCount = wishlistItems?.length || 0;

  // Close dropdowns on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile full-screen menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [mobileMenuOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setUserDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-hide navbar on mobile when scrolling into footer area (disabled when menu is open)
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth >= 768 || mobileMenuOpen) {
        setHideOnMobile(false);
        return;
      }

      const footer = document.getElementById("app-footer") || document.querySelector("footer");
      if (footer) {
        const rect = footer.getBoundingClientRect();
        if (rect.top <= 120) {
          setHideOnMobile(true);
        } else {
          setHideOnMobile(false);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const handleMobileSearch = (e) => {
    if (e.key === "Enter" && mobileSearchQuery.trim()) {
      setMobileMenuOpen(false);
      navigate(`/shop?search=${encodeURIComponent(mobileSearchQuery.trim())}`);
      setMobileSearchQuery("");
    }
  };

  const userInitials = user?.userName
    ? user.userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : isAdmin ? "AD" : "NV";

  const isHeaderHidden = hideOnMobile && !mobileMenuOpen;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-[#09090b] border-b border-neutral-800 transition-transform duration-200 ease-in-out ${
        isHeaderHidden ? "-translate-y-full md:translate-y-0" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Navbar Bar */}
        <div className="flex items-center justify-between py-4 sm:py-5 min-h-[76px] sm:min-h-[84px]">
          {/* Brand Logo */}
          <div className="flex items-center space-x-8">
            <Link
              to={isAdmin ? "/seller/dashboard" : "/"}
              onClick={() => setMobileMenuOpen(false)}
              className="group flex items-center space-x-2 py-1"
            >
              <span className="text-xl sm:text-2xl font-extrabold tracking-widest uppercase font-['Syne',sans-serif] text-white group-hover:text-neutral-300 transition-colors flex items-center">
                NUVORA
                <span className="w-1.5 h-1.5 rounded-full bg-white ml-1.5 inline-block animate-pulse"></span>
              </span>
              {isAdmin && (
                <span className="text-[9px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-800 hidden sm:inline-block">
                  ADMIN
                </span>
              )}
            </Link>

            {/* Desktop Navigation Links */}
            {isAdmin ? (
              /* Admin Desktop Nav Links */
              <nav className="hidden md:flex items-center space-x-7 text-xs uppercase tracking-wider font-semibold text-neutral-400">
                <Link
                  to="/seller/dashboard"
                  className={`py-2 transition-all hover:text-white relative ${
                    location.pathname === "/seller/dashboard"
                      ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-white after:rounded-full"
                      : ""
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/seller/orders"
                  className={`py-2 transition-all hover:text-white relative ${
                    location.pathname === "/seller/orders"
                      ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-white after:rounded-full"
                      : ""
                  }`}
                >
                  Customer Orders
                </Link>
                <Link
                  to="/seller/coupons"
                  className={`py-2 transition-all hover:text-white relative ${
                    location.pathname === "/seller/coupons"
                      ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-white after:rounded-full"
                      : ""
                  }`}
                >
                  Coupons & Offers
                </Link>
              </nav>
            ) : (
              /* Buyer/Public Desktop Nav Links */
              <nav className="hidden md:flex items-center space-x-7 text-xs uppercase tracking-wider font-semibold text-neutral-400">
                <Link
                  to="/"
                  className={`py-2 transition-all hover:text-white relative ${
                    location.pathname === "/"
                      ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-white after:rounded-full"
                      : ""
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/shop"
                  className={`py-2 transition-all hover:text-white relative ${
                    location.pathname === "/shop"
                      ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-white after:rounded-full"
                      : ""
                  }`}
                >
                  Shop Products
                </Link>
              </nav>
            )}
          </div>

          {/* Search Bar (Desktop - Buyer Only) */}
          {!isAdmin && (
            <div className="hidden lg:flex items-center relative w-64 xl:w-80">
              <input
                type="text"
                placeholder="Search products..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target.value.trim()) {
                    navigate(`/shop?search=${encodeURIComponent(e.target.value.trim())}`);
                  }
                }}
                className="w-full bg-[#121215] text-xs text-neutral-200 pl-9 pr-4 py-2.5 rounded-full border border-neutral-800 focus:outline-none focus:border-white transition-colors placeholder:text-neutral-500 font-medium"
              />
              <HiOutlineSearch className="absolute left-3 top-3 text-neutral-400 text-base" />
            </div>
          )}

          {/* Action Icons */}
          <div className="flex items-center space-x-2 sm:space-x-3.5">
            {/* Day / Night Mode Toggle on Desktop PC View */}
            <button
              onClick={toggleTheme}
              className="hidden md:inline-flex p-2.5 text-neutral-400 hover:text-white transition-colors rounded-xl border border-neutral-800 bg-[#121215] hover:bg-neutral-800"
              title={isDarkMode ? "Switch to Day Mode (White Theme)" : "Switch to Night Mode (Black Theme)"}
            >
              {isDarkMode ? (
                <HiOutlineSun className="text-xl text-amber-300" />
              ) : (
                <HiOutlineMoon className="text-xl text-blue-300" />
              )}
            </button>

            {/* Buyer Only Icons: Wishlist & Cart */}
            {!isAdmin && (
              <>
                <Link
                  to="/wishlist"
                  className="relative p-2.5 text-neutral-400 hover:text-white transition-colors"
                  title="Wishlist"
                >
                  <HiOutlineHeart className="text-xl sm:text-2xl" />
                  {isAuthenticated && wishlistCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-white text-black text-[9px] font-extrabold rounded-full flex items-center justify-center shadow-md">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/cart"
                  className="relative p-2.5 text-neutral-400 hover:text-white transition-colors"
                  title="Cart"
                >
                  <HiOutlineShoppingBag className="text-xl sm:text-2xl" />
                  {isAuthenticated && cartCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-white text-black text-[9px] font-extrabold rounded-full flex items-center justify-center shadow-md">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {/* Account Dropdown on Desktop */}
            {isAuthenticated ? (
              <div className="relative hidden md:block" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`flex items-center space-x-2 p-1.5 pr-2.5 rounded-full border transition-all duration-200 ${
                    userDropdownOpen
                      ? "border-white bg-neutral-800 text-white shadow-lg"
                      : "border-neutral-800 bg-[#121215] hover:border-neutral-700 text-neutral-300"
                  }`}
                  title="Account Menu"
                >
                  <div className="w-7 h-7 rounded-full bg-white text-black font-extrabold text-[11px] flex items-center justify-center font-['Syne',sans-serif] overflow-hidden">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user?.userName || "User"} className="w-full h-full object-cover" />
                    ) : (
                      userInitials
                    )}
                  </div>
                  <HiOutlineChevronDown
                    className={`text-xs transition-transform duration-200 ${
                      userDropdownOpen ? "rotate-180 text-white" : "text-neutral-400"
                    }`}
                  />
                </button>

                {/* Animated Dropdown Menu List (100% Solid, No Transparency) */}
                <div
                  className={`absolute right-0 mt-2.5 w-60 bg-[#141418] border border-neutral-800 rounded-2xl shadow-2xl p-2 z-50 space-y-1 transition-all duration-150 ease-out origin-top-right ${
                    userDropdownOpen
                      ? "opacity-100 scale-100 pointer-events-auto visible"
                      : "opacity-0 scale-95 pointer-events-none invisible"
                  }`}
                >
                  <div className="px-3 py-2.5 border-b border-neutral-800">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-white truncate">{user?.userName || "Member"}</p>
                      {isAdmin && (
                        <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-500 truncate font-mono">{user?.email}</p>
                  </div>

                  <div className="flex flex-col space-y-0.5 pt-1">
                    {isAdmin ? (
                      /* Admin Menu Links */
                      <>
                        <Link
                          to="/seller/dashboard"
                          className="flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-900 rounded-xl transition-colors"
                        >
                          <div className="flex items-center space-x-2.5">
                            <HiOutlineSparkles className="text-base text-amber-400" />
                            <span>Admin Dashboard</span>
                          </div>
                          <HiOutlineChevronRight className="text-neutral-600 text-xs" />
                        </Link>

                        <Link
                          to="/seller/orders"
                          className="flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-900 rounded-xl transition-colors"
                        >
                          <div className="flex items-center space-x-2.5">
                            <HiOutlineClipboardList className="text-base text-neutral-400" />
                            <span>Customer Orders</span>
                          </div>
                          <HiOutlineChevronRight className="text-neutral-600 text-xs" />
                        </Link>

                        <Link
                          to="/seller/coupons"
                          className="flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-900 rounded-xl transition-colors"
                        >
                          <div className="flex items-center space-x-2.5">
                            <HiOutlineTag className="text-base text-neutral-400" />
                            <span>Coupons & Offers</span>
                          </div>
                          <HiOutlineChevronRight className="text-neutral-600 text-xs" />
                        </Link>

                        <Link
                          to="/profile"
                          className="flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-900 rounded-xl transition-colors"
                        >
                          <div className="flex items-center space-x-2.5">
                            <HiOutlineUser className="text-base text-neutral-400" />
                            <span>Admin Profile</span>
                          </div>
                          <HiOutlineChevronRight className="text-neutral-600 text-xs" />
                        </Link>
                      </>
                    ) : (
                      /* Buyer Menu Links */
                      <>
                        <Link
                          to="/profile"
                          className="flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-900 rounded-xl transition-colors"
                        >
                          <div className="flex items-center space-x-2.5">
                            <HiOutlineUser className="text-base text-neutral-400" />
                            <span>My Profile</span>
                          </div>
                          <HiOutlineChevronRight className="text-neutral-600 text-xs" />
                        </Link>

                        <Link
                          to="/my-orders"
                          className="flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-900 rounded-xl transition-colors"
                        >
                          <div className="flex items-center space-x-2.5">
                            <HiOutlineClipboardList className="text-base text-neutral-400" />
                            <span>My Orders</span>
                          </div>
                          <HiOutlineChevronRight className="text-neutral-600 text-xs" />
                        </Link>
                      </>
                    )}
                  </div>

                  <div className="pt-1 border-t border-neutral-800">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/30 rounded-xl transition-colors text-left"
                    >
                      <HiOutlineLogout className="text-base" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex text-[11px] uppercase tracking-wider font-extrabold bg-white text-black px-4 py-2.5 rounded-full hover:bg-neutral-200 transition-all shadow-md"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Animated Hamburger Button */}
            <AnimatedHamburger
              isOpen={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            />
          </div>
        </div>
      </div>

      {/* 100% Solid Opaque Full-Screen Mobile Menu (Anchored, Zero Drift, Zero Transparency) */}
      <div
        className={`md:hidden fixed inset-x-0 bottom-0 top-[76px] z-40 bg-[#09090b] transition-opacity duration-200 ease-in-out flex flex-col justify-between pt-4 pb-10 px-5 sm:px-6 overflow-y-auto overflow-x-hidden touch-pan-y ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto visible"
            : "opacity-0 pointer-events-none invisible"
        }`}
      >
        {/* Top Scrollable Navigation Container */}
        <div className="space-y-4 w-full">
          {isAdmin ? (
            /* ================= ADMIN MOBILE SOLID FULL SCREEN CONTENT ================= */
            <>
              {/* Admin Profile Banner Card (100% Solid) */}
              <div className="p-4 rounded-2xl bg-[#16141a] border border-amber-900/60 flex items-center justify-between shadow-lg">
                <div className="flex items-center space-x-3.5">
                  <div className="w-11 h-11 rounded-xl bg-amber-400 text-black font-extrabold text-sm flex items-center justify-center font-['Syne',sans-serif] shadow-md">
                    {userInitials}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-bold text-white font-['Syne',sans-serif]">
                        {user?.userName || "Administrator"}
                      </p>
                      <span className="text-[9px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                        ADMIN
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 font-mono truncate max-w-[210px]">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Admin Menu Grid / Cards (100% Solid) */}
              <nav className="flex flex-col space-y-2 pt-1">
                {/* Dashboard Overview */}
                <Link
                  to="/seller/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-colors active:scale-[0.99] ${
                    location.pathname === "/seller/dashboard"
                      ? "bg-[#1c1c22] border-white text-white shadow-md"
                      : "bg-[#141418] border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400">
                      <HiOutlineSparkles className="text-lg" />
                    </div>
                    <div>
                      <p className="text-xs uppercase font-extrabold tracking-wider">Dashboard Overview</p>
                      <p className="text-[10px] text-neutral-400 font-normal">Sales, analytics & stock levels</p>
                    </div>
                  </div>
                  <HiOutlineChevronRight className="text-neutral-500 text-sm" />
                </Link>

                {/* Customer Orders */}
                <Link
                  to="/seller/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-colors active:scale-[0.99] ${
                    location.pathname === "/seller/orders"
                      ? "bg-[#1c1c22] border-white text-white shadow-md"
                      : "bg-[#141418] border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-950/60 border border-blue-800/60 flex items-center justify-center text-blue-400">
                      <HiOutlineClipboardList className="text-lg" />
                    </div>
                    <div>
                      <p className="text-xs uppercase font-extrabold tracking-wider">Customer Orders</p>
                      <p className="text-[10px] text-neutral-400 font-normal">Manage shipments & discount transparency</p>
                    </div>
                  </div>
                  <HiOutlineChevronRight className="text-neutral-500 text-sm" />
                </Link>

                {/* Custom Coupons & Promotional Offers (Prominently featured in Dropdown menu) */}
                <Link
                  to="/seller/coupons"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-colors active:scale-[0.99] ${
                    location.pathname === "/seller/coupons"
                      ? "bg-[#1c1c22] border-amber-400 text-white shadow-md"
                      : "bg-[#141418] border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                      <HiOutlineTag className="text-lg" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs uppercase font-extrabold tracking-wider">Custom Coupons</p>
                        <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                          Active
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-400 font-normal">Create discount codes & promotional rules</p>
                    </div>
                  </div>
                  <HiOutlineChevronRight className="text-neutral-500 text-sm" />
                </Link>

                {/* Add New Piece */}
                <Link
                  to="/seller/add-product"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-colors active:scale-[0.99] ${
                    location.pathname === "/seller/add-product"
                      ? "bg-[#1c1c22] border-white text-white shadow-md"
                      : "bg-[#141418] border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white">
                      <HiOutlinePlus className="text-lg" />
                    </div>
                    <div>
                      <p className="text-xs uppercase font-extrabold tracking-wider">Add New Piece</p>
                      <p className="text-[10px] text-neutral-400 font-normal">Upload luxury inventory & media</p>
                    </div>
                  </div>
                  <HiOutlineChevronRight className="text-neutral-500 text-sm" />
                </Link>

                {/* Admin Profile */}
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-colors active:scale-[0.99] ${
                    location.pathname === "/profile"
                      ? "bg-[#1c1c22] border-white text-white shadow-md"
                      : "bg-[#141418] border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-950/60 border border-purple-800/60 flex items-center justify-center text-purple-400">
                      <HiOutlineUser className="text-lg" />
                    </div>
                    <div>
                      <p className="text-xs uppercase font-extrabold tracking-wider">Admin Profile</p>
                      <p className="text-[10px] text-neutral-400 font-normal">Account settings & credentials</p>
                    </div>
                  </div>
                  <HiOutlineChevronRight className="text-neutral-500 text-sm" />
                </Link>

                {/* Preview Customer Storefront */}
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-neutral-800 bg-[#141418] text-neutral-400 hover:text-white transition-colors active:scale-[0.99]"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-300">
                      <HiOutlineEye className="text-lg" />
                    </div>
                    <div>
                      <p className="text-xs uppercase font-bold tracking-wider">Customer Storefront</p>
                      <p className="text-[10px] text-neutral-500 font-normal">Preview customer shopping experience</p>
                    </div>
                  </div>
                  <HiOutlineChevronRight className="text-neutral-600 text-sm" />
                </Link>
              </nav>
            </>
          ) : (
            /* ================= BUYER / PUBLIC MOBILE SOLID FULL SCREEN CONTENT ================= */
            <>
              {/* Luxury Search Bar (Solid) */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search luxury catalog..."
                  value={mobileSearchQuery}
                  onChange={(e) => setMobileSearchQuery(e.target.value)}
                  onKeyDown={handleMobileSearch}
                  className="w-full bg-[#141418] text-xs text-neutral-200 pl-10 pr-4 py-3.5 rounded-2xl border border-neutral-800 focus:outline-none focus:border-white transition-colors placeholder:text-neutral-500 font-medium"
                />
                <HiOutlineSearch className="absolute left-3.5 top-4 text-neutral-400 text-base" />
              </div>

              {/* Quick Bag & Wishlist Access Grid (Solid) */}
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  to="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3.5 rounded-2xl bg-[#141418] border border-neutral-800 flex items-center justify-between hover:border-neutral-700 active:scale-95 transition-all shadow-sm"
                >
                  <div className="flex items-center space-x-2.5">
                    <HiOutlineShoppingBag className="text-lg text-white" />
                    <span className="text-xs uppercase font-extrabold tracking-wider text-neutral-200">Bag</span>
                  </div>
                  {cartCount > 0 ? (
                    <span className="w-5 h-5 rounded-full bg-white text-black text-[10px] font-extrabold flex items-center justify-center font-mono shadow">
                      {cartCount}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-neutral-500">0</span>
                  )}
                </Link>

                <Link
                  to="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3.5 rounded-2xl bg-[#141418] border border-neutral-800 flex items-center justify-between hover:border-neutral-700 active:scale-95 transition-all shadow-sm"
                >
                  <div className="flex items-center space-x-2.5">
                    <HiOutlineHeart className="text-lg text-rose-400" />
                    <span className="text-xs uppercase font-extrabold tracking-wider text-neutral-200">Saved</span>
                  </div>
                  {wishlistCount > 0 ? (
                    <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center font-mono shadow">
                      {wishlistCount}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-neutral-500">0</span>
                  )}
                </Link>
              </div>

              {/* Buyer Navigation Links (Solid) */}
              <nav className="flex flex-col space-y-2 pt-1">
                {/* Home */}
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-colors active:scale-[0.99] ${
                    location.pathname === "/"
                      ? "bg-[#1c1c22] border-white text-white shadow-md"
                      : "bg-[#141418] border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white">
                      <HiOutlineHome className="text-lg" />
                    </div>
                    <div>
                      <p className="text-xs uppercase font-extrabold tracking-wider">Home</p>
                      <p className="text-[10px] text-neutral-400 font-normal">Curated collections & featured runway</p>
                    </div>
                  </div>
                  <HiOutlineChevronRight className="text-neutral-500 text-sm" />
                </Link>

                {/* Shop Catalog */}
                <Link
                  to="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-colors active:scale-[0.99] ${
                    location.pathname === "/shop"
                      ? "bg-[#1c1c22] border-white text-white shadow-md"
                      : "bg-[#141418] border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-200">
                      <HiOutlineShoppingBag className="text-lg" />
                    </div>
                    <div>
                      <p className="text-xs uppercase font-extrabold tracking-wider">Shop Products</p>
                      <p className="text-[10px] text-neutral-400 font-normal">All luxury apparel & new drops</p>
                    </div>
                  </div>
                  <HiOutlineChevronRight className="text-neutral-500 text-sm" />
                </Link>

                {isAuthenticated && (
                  <>
                    {/* My Orders */}
                    <Link
                      to="/my-orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-colors active:scale-[0.99] ${
                        location.pathname === "/my-orders"
                          ? "bg-[#1c1c22] border-white text-white shadow-md"
                          : "bg-[#141418] border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700"
                      }`}
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-950/60 border border-blue-800/60 flex items-center justify-center text-blue-400">
                          <HiOutlineClipboardList className="text-lg" />
                        </div>
                        <div>
                          <p className="text-xs uppercase font-extrabold tracking-wider">My Orders</p>
                          <p className="text-[10px] text-neutral-400 font-normal">Track orders & discount invoices</p>
                        </div>
                      </div>
                      <HiOutlineChevronRight className="text-neutral-500 text-sm" />
                    </Link>

                    {/* Profile */}
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-colors active:scale-[0.99] ${
                        location.pathname === "/profile"
                          ? "bg-[#1c1c22] border-white text-white shadow-md"
                          : "bg-[#141418] border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700"
                      }`}
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className="w-9 h-9 rounded-xl bg-purple-950/60 border border-purple-800/60 flex items-center justify-center text-purple-400">
                          <HiOutlineUser className="text-lg" />
                        </div>
                        <div>
                          <p className="text-xs uppercase font-extrabold tracking-wider">Profile Settings</p>
                          <p className="text-[10px] text-neutral-400 font-normal">Manage addresses & account security</p>
                        </div>
                      </div>
                      <HiOutlineChevronRight className="text-neutral-500 text-sm" />
                    </Link>
                  </>
                )}
              </nav>
            </>
          )}
        </div>

        {/* Bottom Section: Theme Switcher & Auth Actions */}
        <div className="pt-6 space-y-3 border-t border-neutral-800">
          {/* Day / Night Theme Switcher (Solid) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full flex items-center justify-between p-3 rounded-2xl border border-neutral-800 bg-[#141418] hover:bg-neutral-900 transition-colors text-left active:scale-[0.99]"
          >
            <div className="flex items-center space-x-3">
              {isDarkMode ? (
                <div className="w-8 h-8 rounded-xl bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-300">
                  <HiOutlineSun className="text-base" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-xl bg-blue-950/60 border border-blue-800/60 flex items-center justify-center text-blue-300">
                  <HiOutlineMoon className="text-base" />
                </div>
              )}
              <div>
                <p className="text-[11px] font-extrabold text-white uppercase tracking-wider">Visual Theme</p>
                <p className="text-[10px] text-neutral-400">
                  {isDarkMode ? "Day Mode (White Theme)" : "Night Mode (Dark Theme)"}
                </p>
              </div>
            </div>
            <span className="text-[9px] font-mono px-2 py-1 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
              Switch
            </span>
          </button>

          {/* Auth Action Buttons */}
          {isAuthenticated ? (
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-2xl border border-rose-900/60 bg-[#1a1113] text-rose-400 text-xs uppercase tracking-wider font-extrabold hover:bg-rose-950/40 transition-colors active:scale-[0.99]"
              >
                <HiOutlineLogout className="text-base" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center text-xs uppercase tracking-wider font-extrabold bg-white text-black py-3.5 rounded-2xl shadow-xl hover:bg-neutral-200 transition-colors active:scale-[0.99]"
              >
                Sign In to Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
