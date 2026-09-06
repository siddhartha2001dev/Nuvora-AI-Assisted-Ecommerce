import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { HiOutlineSun, HiOutlineMoon } from "react-icons/hi";

const ThemeToggleSwitch = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="md:hidden fixed bottom-6 right-5 z-40">
      <button
        type="button"
        onClick={toggleTheme}
        className="relative flex items-center w-16 h-9 p-1 bg-neutral-900/95 backdrop-blur-md border border-neutral-700/80 rounded-full shadow-2xl transition-all active:scale-95 cursor-pointer"
        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        aria-label="Toggle Dark and Light Mode"
      >
        {/* Sliding knob with single theme icon */}
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-300 shadow-md ${
            isDarkMode
              ? "translate-x-7 bg-neutral-800 text-amber-300 border border-neutral-600"
              : "translate-x-0 bg-white text-neutral-900"
          }`}
        >
          {isDarkMode ? (
            <HiOutlineSun className="text-sm" />
          ) : (
            <HiOutlineMoon className="text-sm" />
          )}
        </div>
      </button>
    </div>
  );
};

export default ThemeToggleSwitch;
