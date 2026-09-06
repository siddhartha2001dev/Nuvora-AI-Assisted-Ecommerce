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
        img, video, picture, canvas.no-invert, [data-no-invert], .no-invert, #app-footer, .country-flag, [data-flag],
        .razorpay-container {
          filter: invert(1) hue-rotate(180deg) !important;
        }
        .country-flag, [data-flag], .no-invert, [data-no-invert] {
          display: inline-block;
        }
      `;
      localStorage.setItem("nuvora_theme", "light");
    }
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
