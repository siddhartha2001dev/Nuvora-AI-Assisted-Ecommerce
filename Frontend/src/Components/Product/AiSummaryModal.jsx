import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { HiOutlineSparkles, HiOutlineX } from "react-icons/hi";

/**
 * AiSummaryModal Component
 * ------------------------
 * Displays Google Gemini AI summary for a product.
 * Formats markdown bold (**text**) into readable bold text.
 */
const AiSummaryModal = ({ isOpen, onClose, isLoading, summaryData }) => {
  // Prevent background page from scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // If modal is not open, do not render anything
  if (!isOpen) return null;

  // Helper function: Splits text into bullet points and bolds **headings**
  const formatSummaryText = (text) => {
    if (!text) {
      return (
        <p className="text-xs text-neutral-400">
          Summary is currently unavailable.
        </p>
      );
    }

    // Split text into individual lines
    const lines = text.split("\n").filter((line) => line.trim().length > 0);

    return (
      <div className="space-y-3">
        {lines.map((line, index) => {
          // Split by markdown bold syntax (**bold**)
          const parts = line.split(/(\*\*.*?\*\*)/g);

          return (
            // Single bullet point card
            <div
              key={index}
              className="flex items-start space-x-3 p-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-800"
            >
              {/* Number Badge (1, 2, 3) */}
              <span className="w-5 h-5 rounded-full bg-violet-950 border border-violet-800 text-violet-300 text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                {index + 1}
              </span>

              {/* Text content with bold headings */}
              <div className="text-xs text-neutral-300 leading-relaxed flex-1">
                {parts.map((part, pIdx) => {
                  if (part.startsWith("**") && part.endsWith("**")) {
                    return (
                      <strong key={pIdx} className="font-bold text-white">
                        {part.slice(2, -2)}
                      </strong>
                    );
                  }
                  // Remove leading numbers like "1. " from the text line
                  return (
                    <span key={pIdx}>
                      {part.replace(/^[0-9]+\.\s*/, "")}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return createPortal(
    // Backdrop overlay
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-fadeIn"
      onClick={onClose}
    >
      {/* Modal Card Container */}
      <div
        className="w-full max-w-lg bg-[#121215] border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl relative max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-violet-950 border border-violet-800 text-amber-400">
              <HiOutlineSparkles className="text-lg" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white font-['Syne',sans-serif]">
                NUVORA AI Insights
              </h3>
              <p className="text-[11px] text-neutral-400">
                Generated from product specs & verified reviews
              </p>
            </div>
          </div>
          
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto pr-1">
          {isLoading ? (
            // Loading Spinner State
            <div className="py-10 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-neutral-300 font-medium animate-pulse">
                Analyzing product with Gemini AI...
              </p>
            </div>
          ) : (
            // Formatted Summary Result
            formatSummaryText(summaryData)
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
          <span className="text-[11px] text-neutral-500 font-mono">
            Powered by Google Gemini
          </span>

          {/* Footer Action Button */}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-neutral-200 transition-colors shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AiSummaryModal;
