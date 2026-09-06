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
    let dynamicStyle = document.getElementById(styleId);

    const applyTheme = () => {
      // If Razorpay modal is actively open in the DOM, do not apply invert filter so it stays in default Light Theme
      const isRazorpayOpen = !!document.querySelector(".razorpay-container, iframe[src*='razorpay']");
      if (isRazorpayOpen) {
        root.style.filter = "";
        root.style.backgroundColor = "#09090b";
        return;
      }

      if (isDarkMode) {
        root.style.filter = "";
        root.style.backgroundColor = "#09090b";
        if (dynamicStyle) {
          dynamicStyle.remove();
        }
        localStorage.setItem("nuvora_theme", "dark");
      } else {
        root.style.filter = "invert(1) hue-rotate(180deg)";
        root.style.backgroundColor = "#f6f6f4";

        // Protect images, videos, canvas, flags, and footer so they stay in true natural colors
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
            display: inline-block !important;
          }
        `;
        localStorage.setItem("nuvora_theme", "light");
      }
    };

    applyTheme();

    // Listen for Razorpay modal opening/closing to ensure it ALWAYS stays in native default Light Theme
    const observer = new MutationObserver(() => {
      const isRazorpayOpen = !!document.querySelector(".razorpay-container, iframe[src*='razorpay']");
      if (isRazorpayOpen) {
        if (root.style.filter) {
          root.dataset.suspendedTheme = "true";
          root.style.filter = "";
          root.style.backgroundColor = "#09090b";
        }
      } else if (root.dataset.suspendedTheme === "true") {
        delete root.dataset.suspendedTheme;
        if (!isDarkMode) {
          root.style.filter = "invert(1) hue-rotate(180deg)";
          root.style.backgroundColor = "#f6f6f4";
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

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
