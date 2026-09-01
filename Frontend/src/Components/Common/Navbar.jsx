import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  useGetCartQuery,
  useGetWishlistQuery,
  useLogoutMutation,
} from "../../redux/apiSlice";
import { logoutUser } from "../../redux/slices/authSlice";
import { useTheme } from "../../context/ThemeContext";
import toast from "react-hot-toast";
import {
  HiOutlineShoppingBag,
  HiOutlineHeart,
  HiOutlineUser,
  HiOutlineSearch,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineSparkles,
  HiOutlineLogout,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineClipboardList,
  HiOutlineChevronDown,
  HiOutlineHome,
  HiOutlineChevronRight,
  HiOutlineCollection,
} from "react-icons/hi";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [hideOnMobile, setHideOnMobile] = useState(false);
  const dropdownRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isDarkMode, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const isSeller = isAuthenticated && user?.role === "Seller";

  const { data: cartData } = useGetCartQuery(undefined, {
    skip: !isAuthenticated || isSeller,
  });
  const { data: wishlistData } = useGetWishlistQuery(undefined, {
    skip: !isAuthenticated || isSeller,
  });
  const [logoutApi] = useLogoutMutation();

  const cartCount = cartData?.data?.length || 0;
  const wishlistCount = wishlistData?.data?.length || 0;

  // Close dropdowns on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

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

  // Auto-hide navbar on mobile when scrolling into footer area
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth >= 768) {
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
  }, []);

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      // ignore
    }
    dispatch(logoutUser());
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const userInitials = user?.userName
    ? user.userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : isSeller ? "SE" : "NV";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-[#09090b]/90 backdrop-blur-lg border-b border-neutral-800 transition-transform duration-300 ease-in-out ${
        hideOnMobile ? "-translate-y-full md:translate-y-0" : "translate-y-0"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Navbar Bar */}
        <div className="flex items-center justify-between py-4 sm:py-5 min-h-[76px] sm:min-h-[84px]">
          {/* Brand Logo */}
          <div className="flex items-center space-x-8">
            <Link
              to={isSeller ? "/seller/dashboard" : "/"}
              className="group flex items-center space-x-2 py-1"
            >
              <span className="text-xl sm:text-2xl font-extrabold tracking-widest uppercase font-['Syne',sans-serif] text-white group-hover:text-neutral-300 transition-colors flex items-center">
                NUVORA
                <span className="w-1.5 h-1.5 rounded-full bg-white ml-1.5 inline-block animate-pulse"></span>
              </span>
              {isSeller && (
                <span className="text-[9px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-800/80 hidden sm:inline-block">
                  MERCHANT
                </span>
              )}
            </Link>

            {/* Desktop Navigation Links */}
            {isSeller ? (
              /* Seller-Only Desktop Nav Links */
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
          {!isSeller && (
            <div className="hidden lg:flex items-center relative w-64 xl:w-80">
              <input
                type="text"
                placeholder="Search products..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target.value.trim()) {
                    navigate(`/shop?search=${encodeURIComponent(e.target.value.trim())}`);
                  }
                }}
                className="w-full bg-neutral-900/90 text-xs text-neutral-200 pl-9 pr-4 py-2.5 rounded-full border border-neutral-800 focus:outline-none focus:border-white transition-colors placeholder:text-neutral-500 font-medium"
              />
              <HiOutlineSearch className="absolute left-3 top-3 text-neutral-400 text-base" />
            </div>
          )}

          {/* Action Icons */}
          <div className="flex items-center space-x-2 sm:space-x-3.5">
            {/* Day / Night Mode Toggle on Desktop PC View */}
            <button
              onClick={toggleTheme}
              className="hidden md:inline-flex p-2.5 text-neutral-400 hover:text-white transition-colors rounded-xl border border-neutral-800/80 bg-neutral-900/70 hover:bg-neutral-800"
              title={isDarkMode ? "Switch to Day Mode (White Theme)" : "Switch to Night Mode (Black Theme)"}
            >
              {isDarkMode ? (
                <HiOutlineSun className="text-xl text-amber-300" />
              ) : (
                <HiOutlineMoon className="text-xl text-blue-300" />
              )}
            </button>

            {/* Buyer Only Icons: Wishlist & Cart */}
            {!isSeller && (
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
                      : "border-neutral-800 bg-neutral-900/80 hover:border-neutral-700 text-neutral-300"
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

                {/* Animated Dropdown Menu List */}
                <div
                  className={`absolute right-0 mt-2.5 w-60 bg-[#121215]/95 backdrop-blur-2xl border border-neutral-800 rounded-2xl shadow-2xl p-2 z-50 space-y-1 transition-all duration-200 ease-out origin-top-right ${
                    userDropdownOpen
                      ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                      : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                  }`}
                >
                  <div className="px-3 py-2.5 border-b border-neutral-800/80">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-white truncate">{user?.userName || "Member"}</p>
                      {isSeller && (
                        <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                          Seller
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-500 truncate font-mono">{user?.email}</p>
                  </div>

                  <div className="flex flex-col space-y-0.5 pt-1">
                    {isSeller ? (
                      /* Seller-Only Menu Links */
                      <>
                        <Link
                          to="/seller/dashboard"
                          className="flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-900 rounded-xl transition-colors"
                        >
                          <div className="flex items-center space-x-2.5">
                            <HiOutlineSparkles className="text-base text-amber-400" />
                            <span>Dashboard</span>
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
                          to="/profile"
                          className="flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-900 rounded-xl transition-colors"
                        >
                          <div className="flex items-center space-x-2.5">
                            <HiOutlineUser className="text-base text-neutral-400" />
                            <span>Seller Profile</span>
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

                  <div className="pt-1 border-t border-neutral-800/80">
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

            {/* Mobile Menu Toggle Button with Rotation Animation */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 text-neutral-300 hover:text-white border border-neutral-800 bg-neutral-900 rounded-xl active:scale-90 transition-all duration-200"
              title="Toggle Menu"
            >
              <div className="relative w-5 h-5 flex items-center justify-center">
                <HiOutlineX
                  className={`text-xl absolute transition-all duration-300 ${
                    mobileMenuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
                  }`}
                />
                <HiOutlineMenu
                  className={`text-xl absolute transition-all duration-300 ${
                    mobileMenuOpen ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer with Silky Smooth Slide & Expand Animation */}
      <div
        className={`md:hidden border-t border-neutral-800 bg-[#09090b]/98 backdrop-blur-2xl px-6 transition-all duration-300 ease-in-out overflow-hidden ${
          mobileMenuOpen
            ? "max-h-[85vh] opacity-100 pt-6 pb-10 translate-y-0 pointer-events-auto"
            : "max-h-0 opacity-0 pt-0 pb-0 -translate-y-3 pointer-events-none"
        } space-y-4 overflow-y-auto`}
      >
        {/* Vertical Menu List */}
        <nav className="flex flex-col divide-y divide-neutral-800/80 border-b border-neutral-800 text-sm uppercase tracking-wider font-semibold">
          {isSeller ? (
            /* Mobile Seller Navigation */
            <>
              <Link
                to="/seller/dashboard"
                className="flex items-center justify-between py-4 px-2.5 text-neutral-200 hover:text-white transition-colors active:bg-neutral-900/50 rounded-xl"
              >
                <div className="flex items-center space-x-3.5">
                  <HiOutlineSparkles className="text-xl text-amber-400" />
                  <span>Dashboard Overview</span>
                </div>
                <HiOutlineChevronRight className="text-neutral-600 text-base" />
              </Link>

              <Link
                to="/seller/orders"
                className="flex items-center justify-between py-4 px-2.5 text-neutral-200 hover:text-white transition-colors active:bg-neutral-900/50 rounded-xl"
              >
                <div className="flex items-center space-x-3.5">
                  <HiOutlineClipboardList className="text-xl text-neutral-400" />
                  <span>Customer Orders</span>
                </div>
                <HiOutlineChevronRight className="text-neutral-600 text-base" />
              </Link>

              <Link
                to="/profile"
                className="flex items-center justify-between py-4 px-2.5 text-neutral-200 hover:text-white transition-colors active:bg-neutral-900/50 rounded-xl"
              >
                <div className="flex items-center space-x-3.5">
                  <HiOutlineUser className="text-xl text-neutral-400" />
                  <span>Seller Profile</span>
                </div>
                <HiOutlineChevronRight className="text-neutral-600 text-base" />
              </Link>
            </>
          ) : (
            /* Mobile Buyer / Guest Navigation */
            <>
              <Link
                to="/"
                className="flex items-center justify-between py-4 px-2.5 text-neutral-200 hover:text-white transition-colors active:bg-neutral-900/50 rounded-xl"
              >
                <div className="flex items-center space-x-3.5">
                  <HiOutlineHome className="text-xl text-neutral-400" />
                  <span>Home</span>
                </div>
                <HiOutlineChevronRight className="text-neutral-600 text-base" />
              </Link>

              {isAuthenticated && (
                <>
                  <Link
                    to="/my-orders"
                    className="flex items-center justify-between py-4 px-2.5 text-neutral-200 hover:text-white transition-colors active:bg-neutral-900/50 rounded-xl"
                  >
                    <div className="flex items-center space-x-3.5">
                      <HiOutlineClipboardList className="text-xl text-neutral-400" />
                      <span>My Orders</span>
                    </div>
                    <HiOutlineChevronRight className="text-neutral-600 text-base" />
                  </Link>

                  <Link
                    to="/profile"
                    className="flex items-center justify-between py-4 px-2.5 text-neutral-200 hover:text-white transition-colors active:bg-neutral-900/50 rounded-xl"
                  >
                    <div className="flex items-center space-x-3.5">
                      <HiOutlineUser className="text-xl text-neutral-400" />
                      <span>Profile Settings</span>
                    </div>
                    <HiOutlineChevronRight className="text-neutral-600 text-base" />
                  </Link>
                </>
              )}
            </>
          )}
        </nav>

        {/* Action Auth Buttons */}
        <div className="pt-2">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-2xl border border-rose-900/40 bg-rose-950/20 text-rose-400 text-xs uppercase tracking-wider font-bold hover:bg-rose-950/40 transition-colors active:scale-98"
            >
              <HiOutlineLogout className="text-lg" />
              <span>Log Out</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="block w-full text-center text-xs uppercase tracking-wider font-extrabold bg-white text-black py-4 rounded-2xl shadow-lg hover:bg-neutral-200 transition-colors active:scale-98"
            >
              Sign In / Register
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
