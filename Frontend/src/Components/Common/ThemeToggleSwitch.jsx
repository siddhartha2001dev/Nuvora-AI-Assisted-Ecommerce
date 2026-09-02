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
        className="relative flex items-center justify-between w-16 h-9 p-1 bg-neutral-900 border border-neutral-700 rounded-full shadow-xl transition-all active:scale-95 cursor-pointer"
        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        aria-label="Toggle Dark and Light Mode"
      >
        <div className="w-full flex items-center justify-between px-1.5 text-xs text-neutral-400">
          <HiOutlineSun className="text-amber-400 text-sm" />
          <HiOutlineMoon className="text-blue-300 text-sm" />
        </div>

        {/* Sliding knob */}
        <div
          className={`absolute top-1 w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-300 shadow-md ${
            isDarkMode
              ? "translate-x-7 bg-neutral-800 text-amber-300 border border-neutral-600"
              : "translate-x-0 bg-white text-neutral-900"
          }`}
        >
          {isDarkMode ? (
            <HiOutlineSun className="text-xs" />
          ) : (
            <HiOutlineMoon className="text-xs" />
          )}
        </div>
      </button>
    </div>
  );
};

export default ThemeToggleSwitch;
