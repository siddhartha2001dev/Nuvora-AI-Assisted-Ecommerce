import React from "react";
import { HiOutlineAdjustments, HiOutlineTag } from "react-icons/hi";

export const CATEGORIES = [
  "All",
  "Fashion & Brands",
  "Tech & Accessories",
  "Home Decors",
  "Wearables",
];

const ProductFilter = ({
  priceRange = 25000,
  onPriceChange,
  selectedCategory = "All",
  onCategoryChange,
  onReset,
}) => {
  return (
    <aside className="w-full lg:w-64 bg-[#121215] border border-neutral-800/80 rounded-2xl p-5 sm:p-6 space-y-6 h-fit">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <div className="flex items-center space-x-2">
          <HiOutlineAdjustments className="text-lg text-white" />
          <h3 className="text-xs sm:text-sm uppercase tracking-wider font-bold text-white">Filters</h3>
        </div>
        {onReset && (
          <button
            onClick={onReset}
            className="text-xs text-neutral-500 hover:text-white transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Categories Filter */}
      <div className="space-y-3">
        <div className="flex items-center space-x-1.5 text-neutral-400">
          <HiOutlineTag className="text-sm" />
          <h4 className="text-xs uppercase tracking-widest font-semibold font-mono">
            Categories
          </h4>
        </div>
        <div className="flex flex-col space-y-1.5">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onCategoryChange && onCategoryChange(cat)}
                className={`text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
                  isSelected
                    ? "bg-white text-black font-bold shadow-sm"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                }`}
              >
                <span>{cat}</span>
                {isSelected && <span className="text-[10px] uppercase font-mono">●</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3 pt-4 border-t border-neutral-800">
        <div className="flex items-center justify-between">
          <h4 className="text-xs uppercase tracking-widest font-semibold text-neutral-400 font-mono">
            Max Price
          </h4>
          <span className="text-xs font-mono font-bold text-white">
            ₹{Number(priceRange).toLocaleString()}
          </span>
        </div>
        <input
          type="range"
          min="500"
          max="25000"
          step="500"
          value={priceRange}
          onChange={(e) => onPriceChange && onPriceChange(Number(e.target.value))}
          className="w-full accent-white bg-neutral-800 rounded-lg cursor-pointer h-1.5"
        />
        <div className="flex justify-between text-[11px] text-neutral-500 font-mono">
          <span>Min: ₹500</span>
          <span>Max: ₹25,000</span>
        </div>
      </div>
    </aside>
  );
};

export default ProductFilter;
