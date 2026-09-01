import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { HiOutlineSun, HiOutlineMoon } from "react-icons/hi";

const ThemeToggleSwitch = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [hideWithFooter, setHideWithFooter] = useState(false);
  const location = useLocation();

  // If on orders pages, always keep visible
  const isOrdersPage = location.pathname.includes("orders");

  useEffect(() => {
    const handleScroll = () => {
      // Only runs on mobile
      if (window.innerWidth >= 768) return;

      if (isOrdersPage) {
        setHideWithFooter(false);
        return;
      }

      const footer = document.getElementById("app-footer") || document.querySelector("footer");
      if (footer) {
        const rect = footer.getBoundingClientRect();
        const isPageScrollable = document.documentElement.scrollHeight > window.innerHeight + 150;

        // Hide only when user has actively scrolled deep into footer on long pages
        if (isPageScrollable && rect.top <= window.innerHeight - 60 && window.scrollY > 80) {
          setHideWithFooter(true);
        } else {
          setHideWithFooter(false);
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
  }, [isOrdersPage, location.pathname]);

  return (
    <div
      className={`md:hidden fixed bottom-8 right-5 z-40 transition-all duration-300 ease-in-out ${
        hideWithFooter
          ? "opacity-0 translate-y-16 pointer-events-none scale-90"
          : "opacity-100 translate-y-0 scale-100"
      }`}
    >
      <button
        onClick={toggleTheme}
        className="group relative flex items-center justify-between bg-[#121215]/95 hover:bg-[#18181c] border border-neutral-700/90 backdrop-blur-xl p-1.5 rounded-full shadow-2xl transition-all duration-300 w-20 h-10 cursor-pointer active:scale-95 hover:border-neutral-500"
        title={isDarkMode ? "Switch to Day Mode (White Theme)" : "Switch to Night Mode (Black Theme)"}
        aria-label="Toggle Theme Mode"
      >
        {/* Track Icons */}
        <div className="w-full flex items-center justify-between px-2 text-xs">
          <HiOutlineSun className={`transition-opacity duration-300 ${isDarkMode ? "opacity-40 text-neutral-400" : "opacity-0"}`} />
          <HiOutlineMoon className={`transition-opacity duration-300 ${isDarkMode ? "opacity-0" : "opacity-40 text-neutral-400"}`} />
        </div>

        {/* Sliding Indicator Knob */}
        <div
          className={`absolute top-1 bottom-1 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 ease-in-out shadow-md ${
            isDarkMode
              ? "translate-x-9 bg-neutral-900 text-amber-300 border border-neutral-700"
              : "translate-x-0 bg-white text-black border border-neutral-300"
          }`}
        >
          {isDarkMode ? (
            <HiOutlineSun className="text-base" />
          ) : (
            <HiOutlineMoon className="text-base text-neutral-900" />
          )}
        </div>
      </button>
    </div>
  );
};

export default ThemeToggleSwitch;
