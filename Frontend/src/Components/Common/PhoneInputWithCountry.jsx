import React, { useState, useEffect, useRef, useMemo } from "react";
import { HiOutlineChevronDown, HiOutlineSearch, HiCheck } from "react-icons/hi";
import { useTheme } from "../../context/ThemeContext";

// Curated list of popular country calling codes with flags
const COUNTRIES = [
  { name: "India", code: "IN", dialCode: "+91", flag: "🇮🇳" },
  { name: "United States", code: "US", dialCode: "+1", flag: "🇺🇸" },
  { name: "United Kingdom", code: "GB", dialCode: "+44", flag: "🇬🇧" },
  { name: "United Arab Emirates", code: "AE", dialCode: "+971", flag: "🇦🇪" },
  { name: "Canada", code: "CA", dialCode: "+1", flag: "🇨🇦" },
  { name: "Australia", code: "AU", dialCode: "+61", flag: "🇦🇺" },
  { name: "Singapore", code: "SG", dialCode: "+65", flag: "🇸🇬" },
  { name: "Germany", code: "DE", dialCode: "+49", flag: "🇩🇪" },
  { name: "France", code: "FR", dialCode: "+33", flag: "🇫🇷" },
  { name: "Saudi Arabia", code: "SA", dialCode: "+966", flag: "🇸🇦" },
  { name: "Qatar", code: "QA", dialCode: "+974", flag: "🇶🇦" },
  { name: "Kuwait", code: "KW", dialCode: "+965", flag: "🇰🇼" },
  { name: "Oman", code: "OM", dialCode: "+968", flag: "🇴🇲" },
  { name: "Bahrain", code: "BH", dialCode: "+973", flag: "🇧🇭" },
  { name: "Nepal", code: "NP", dialCode: "+977", flag: "🇳🇵" },
  { name: "Bangladesh", code: "BD", dialCode: "+880", flag: "🇧🇩" },
  { name: "Sri Lanka", code: "LK", dialCode: "+94", flag: "🇱🇰" },
  { name: "Pakistan", code: "PK", dialCode: "+92", flag: "🇵🇰" },
  { name: "Malaysia", code: "MY", dialCode: "+60", flag: "🇲🇾" },
  { name: "Indonesia", code: "ID", dialCode: "+62", flag: "🇮🇩" },
  { name: "Japan", code: "JP", dialCode: "+81", flag: "🇯🇵" },
  { name: "South Korea", code: "KR", dialCode: "+82", flag: "🇰🇷" },
  { name: "China", code: "CN", dialCode: "+86", flag: "🇨🇳" },
  { name: "Hong Kong", code: "HK", dialCode: "+852", flag: "🇭🇰" },
  { name: "New Zealand", code: "NZ", dialCode: "+64", flag: "🇳🇿" },
  { name: "South Africa", code: "ZA", dialCode: "+27", flag: "🇿🇦" },
  { name: "Netherlands", code: "NL", dialCode: "+31", flag: "🇳🇱" },
  { name: "Spain", code: "ES", dialCode: "+34", flag: "🇪🇸" },
  { name: "Italy", code: "IT", dialCode: "+39", flag: "🇮🇹" },
  { name: "Switzerland", code: "CH", dialCode: "+41", flag: "🇨🇭" },
  { name: "Sweden", code: "SE", dialCode: "+46", flag: "🇸🇪" },
  { name: "Norway", code: "NO", dialCode: "+47", flag: "🇳🇴" },
  { name: "Ireland", code: "IE", dialCode: "+353", flag: "🇮🇪" },
  { name: "Turkey", code: "TR", dialCode: "+90", flag: "🇹🇷" },
  { name: "Egypt", code: "EG", dialCode: "+20", flag: "🇪🇬" },
  { name: "Thailand", code: "TH", dialCode: "+66", flag: "🇹🇭" },
  { name: "Vietnam", code: "VN", dialCode: "+84", flag: "🇻🇳" },
  { name: "Philippines", code: "PH", dialCode: "+63", flag: "🇵🇭" },
  { name: "Brazil", code: "BR", dialCode: "+55", flag: "🇧🇷" },
  { name: "Mexico", code: "MX", dialCode: "+52", flag: "🇲🇽" },
  { name: "Russia", code: "RU", dialCode: "+7", flag: "🇷🇺" },
];

/**
 * Split full phone string into matching country and national number
 */
const parsePhoneNumber = (fullPhone = "") => {
  const trimmed = fullPhone ? String(fullPhone).trim() : "";
  if (!trimmed) {
    return { country: COUNTRIES[0], nationalNumber: "" };
  }

  // If starts with +, match largest dialCode first
  if (trimmed.startsWith("+")) {
    const sortedCountries = [...COUNTRIES].sort(
      (a, b) => b.dialCode.length - a.dialCode.length
    );

    for (const c of sortedCountries) {
      if (trimmed.startsWith(c.dialCode)) {
        const rest = trimmed.slice(c.dialCode.length).trim();
        return { country: c, nationalNumber: rest };
      }
    }
  }

  // Default to India (+91) if no country code or unrecognized
  return { country: COUNTRIES[0], nationalNumber: trimmed };
};

const PhoneInputWithCountry = ({
  name = "phone",
  value = "",
  onChange,
  required = false,
  placeholder = "Enter phone number",
  className = "",
  disabled = false,
  autoComplete = "tel",
}) => {
  const themeContext = useTheme();
  const isDarkMode = themeContext?.isDarkMode ?? true;

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const prevValueRef = useRef(value);

  const initialParsed = useMemo(() => parsePhoneNumber(value), [value]);
  const [selectedCountry, setSelectedCountry] = useState(initialParsed.country);
  const [nationalNumber, setNationalNumber] = useState(initialParsed.nationalNumber);

  // Sync only if prop value genuinely changed from outside
  useEffect(() => {
    if (prevValueRef.current !== value) {
      prevValueRef.current = value;
      const parsed = parsePhoneNumber(value);
      setSelectedCountry(parsed.country);
      setNationalNumber(parsed.nationalNumber);
    }
  }, [value]);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleKeyDown);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Filter countries by name, code or dial code
  const filteredCountries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Dispatch change upwards
  const emitChange = (newCountry, newNumber) => {
    const cleanedNumber = newNumber.replace(/[^\d\s-]/g, "");
    const combinedValue = cleanedNumber.trim()
      ? `${newCountry.dialCode} ${cleanedNumber.trim()}`
      : "";

    prevValueRef.current = combinedValue;

    if (typeof onChange === "function") {
      onChange({
        target: {
          name,
          value: combinedValue,
        },
      });
    }
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchQuery("");
    emitChange(country, nationalNumber);
  };

  const handleNumberChange = (e) => {
    const val = e.target.value;
    setNationalNumber(val);
    emitChange(selectedCountry, val);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="flex items-center rounded-xl bg-neutral-900 border border-neutral-800 focus-within:border-white transition-colors overflow-hidden">
        {/* Country Code Trigger Button */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          disabled={disabled}
          className="flex items-center space-x-1.5 px-3 py-3 bg-neutral-800/60 hover:bg-neutral-800 text-white border-r border-neutral-800 text-xs sm:text-sm font-medium transition-colors focus:outline-none select-none shrink-0"
          title={`${selectedCountry.name} (${selectedCountry.dialCode})`}
        >
          <span
            className="text-base leading-none country-flag no-invert inline-block select-none"
            data-no-invert
            data-flag
            style={!isDarkMode ? { filter: "invert(1) hue-rotate(180deg)" } : undefined}
          >
            {selectedCountry.flag}
          </span>
          <span className="font-mono text-neutral-200 text-xs font-semibold">
            {selectedCountry.dialCode}
          </span>
          <HiOutlineChevronDown
            className={`text-neutral-400 text-xs transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* National Phone Number Input */}
        <div className="relative flex-1 min-w-0">
          <input
            type="tel"
            name={name}
            value={nationalNumber}
            onChange={handleNumberChange}
            required={required}
            disabled={disabled}
            autoComplete={autoComplete}
            placeholder={placeholder}
            className="w-full bg-transparent text-xs sm:text-sm text-white px-3 sm:px-4 py-3 focus:outline-none placeholder:text-neutral-600 font-medium font-mono"
          />
        </div>
      </div>

      {/* Country Selection Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 max-w-[90vw] bg-[#121215] border border-neutral-700/80 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-md">
          {/* Search Box */}
          <div className="p-2.5 border-b border-neutral-800 bg-neutral-900/80">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country or code..."
                className="w-full bg-neutral-950 text-xs text-white pl-8 pr-3 py-2 rounded-lg border border-neutral-800 focus:outline-none focus:border-white transition-colors placeholder:text-neutral-500"
              />
              <HiOutlineSearch className="absolute left-2.5 top-2.5 text-neutral-400 text-sm" />
            </div>
          </div>

          {/* Countries List */}
          <div className="max-h-56 sm:max-h-64 overflow-y-auto divide-y divide-neutral-900/60 custom-scrollbar">
            {filteredCountries.length === 0 ? (
              <div className="p-4 text-center text-xs text-neutral-500">
                No matching country found
              </div>
            ) : (
              filteredCountries.map((c) => {
                const isSelected = selectedCountry.code === c.code;
                return (
                  <button
                    key={`${c.code}-${c.dialCode}`}
                    type="button"
                    onClick={() => handleCountrySelect(c)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs transition-colors hover:bg-white/10 ${
                      isSelected ? "bg-white/15 text-white font-semibold" : "text-neutral-300"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                      <span
                        className="text-base shrink-0 country-flag no-invert inline-block select-none"
                        data-no-invert
                        data-flag
                        style={!isDarkMode ? { filter: "invert(1) hue-rotate(180deg)" } : undefined}
                      >
                        {c.flag}
                      </span>
                      <span className="truncate">{c.name}</span>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="font-mono text-neutral-400 text-[11px]">
                        {c.dialCode}
                      </span>
                      {isSelected && <HiCheck className="text-white text-sm" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoneInputWithCountry;
