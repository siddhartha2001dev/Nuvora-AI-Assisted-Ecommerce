import React from "react";

const Loader = ({ label = "Loading Essentials..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
      {/* Spinner */}
      <div className="relative w-12 h-12">
        <div className="w-12 h-12 rounded-full border-2 border-neutral-800 border-t-white animate-spin" />
      </div>

      <p className="text-xs uppercase tracking-widest font-medium text-neutral-500 font-mono">
        {label}
      </p>
    </div>
  );
};

export default Loader;
