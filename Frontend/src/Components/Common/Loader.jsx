import React from "react";

/**
 * Loader Component
 * ----------------
 * Minimalist circular spinner used during asynchronous data fetching.
 *
 * Props:
 * - label (string): Optional custom text below the spinner (Defaults to "Loading Essentials...")
 */
const Loader = ({ label = "Loading Essentials..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
      {/* Animated Circular Spinner */}
      <div className="relative w-12 h-12">
        <div className="w-12 h-12 rounded-full border-2 border-neutral-800 border-t-white animate-spin" />
      </div>

      {/* Label Text */}
      <p className="text-xs uppercase tracking-widest font-medium text-neutral-500 font-mono">
        {label}
      </p>
    </div>
  );
};

export default Loader;
