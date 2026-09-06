import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("nuvora_theme");
    return savedTheme !== "light"; // Default to dark mode
  });

  useEffect(() => {
    const root = document.documentElement;
    const styleId = "nuvora-theme-dynamic-style";

    const updateDOM = (suspended = false) => {
      let dynamicStyle = document.getElementById(styleId);

      if (isDarkMode || suspended) {
        root.style.filter = "";
        root.style.backgroundColor = "#09090b";
        if (dynamicStyle) {
          dynamicStyle.remove();
        }
        if (!suspended) {
          localStorage.setItem("nuvora_theme", isDarkMode ? "dark" : "light");
        }
      } else {
        root.style.filter = "invert(1) hue-rotate(180deg)";
        root.style.backgroundColor = "#f6f6f4";

        if (!dynamicStyle) {
          dynamicStyle = document.createElement("style");
          dynamicStyle.id = styleId;
          document.head.appendChild(dynamicStyle);
        }
        dynamicStyle.innerHTML = `
          img, video, picture, canvas.no-invert, [data-no-invert], .no-invert, #app-footer, .country-flag, [data-flag] {
            filter: invert(1) hue-rotate(180deg) !important;
          }
          .country-flag, [data-flag], .no-invert, [data-no-invert] {
            display: inline-block;
          }
        `;
        localStorage.setItem("nuvora_theme", "light");
      }
    };

    updateDOM(false);

    // Watch for Razorpay modal opening/closing to completely suspend theme inversion on Razorpay window
    let isSuspended = false;
    const checkRazorpay = () => {
      const hasRazorpay = Boolean(
        document.body.classList.contains("razorpay-open") ||
        document.querySelector(".razorpay-container, [class*='razorpay-container'], iframe[src*='razorpay'], iframe[name*='razorpay']")
      );
      if (hasRazorpay !== isSuspended) {
        isSuspended = hasRazorpay;
        if (!isDarkMode) {
          updateDOM(hasRazorpay);
        }
      }
    };

    const observer = new MutationObserver(checkRazorpay);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
    };
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
