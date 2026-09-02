import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer
      id="app-footer"
      className="no-invert bg-[#050507] border-t border-neutral-800/80 text-neutral-400 relative z-20"
      style={{ backgroundColor: "#050507", color: "#a3a3a3" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info Column */}
          <div className="space-y-4 md:col-span-1">
            <Link
              to="/"
              className="text-2xl font-extrabold tracking-widest uppercase font-['Syne',sans-serif] text-white"
            >
              NUVORA<span className="text-neutral-500">.</span>
            </Link>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Curated everyday minimalist essentials. Crafted with precision, designed for longevity and timeless aesthetics.
            </p>
            <div className="flex space-x-3 text-xs uppercase tracking-widest text-neutral-400">
              <span>EST. 2026</span>
              <span>•</span>
              <span>GLOBAL SHIPPING</span>
            </div>
          </div>

          {/* Quick Explore Links */}
          <div>
            <h4 className="text-xs uppercase tracking-widest font-semibold text-white mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/shop" className="hover:text-white transition-colors">
                  All Collections
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Fashion %26 Brands" className="hover:text-white transition-colors">
                  Fashion & Brands
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Tech %26 Accessories" className="hover:text-white transition-colors">
                  Tech & Accessories
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Wearables" className="hover:text-white transition-colors">
                  Wearables
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Hub Links */}
          <div>
            <h4 className="text-xs uppercase tracking-widest font-semibold text-white mb-4">
              Customer Hub
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/my-orders" className="hover:text-white transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-white transition-colors">
                  My Wishlist
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">
                  Shopping Bag
                </Link>
              </li>
              <li>
                <Link to="/seller/dashboard" className="hover:text-white transition-colors">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscription Column */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-white mb-4">
              Stay In The Loop
            </h4>
            <p className="text-sm text-neutral-400">
              Subscribe to receive exclusive collection drops and minimalist editorial insights.
            </p>
            <div className="flex space-x-2">
              <input
                type="email"
                placeholder="Enter email address"
                className="w-full bg-neutral-900 text-sm text-white px-3.5 py-2.5 rounded-lg border border-neutral-800 focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600"
              />
              <button
                type="button"
                className="bg-white text-black text-xs uppercase tracking-wider font-bold px-4 py-2.5 rounded-lg hover:bg-neutral-200 transition-colors shrink-0 cursor-pointer"
              >
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Policies */}
        <div className="mt-14 pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 space-y-4 sm:space-y-0">
          <p>© {new Date().getFullYear()} NUVORA Studio. All rights reserved.</p>
          <div className="flex space-x-6">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-white cursor-pointer transition-colors">Shipping & Returns</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
