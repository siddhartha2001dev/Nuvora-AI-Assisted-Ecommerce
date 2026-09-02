import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { createProduct } from "../../redux/slices/productSlice";
import SellerSidebar from "../../Components/Seller/SellerSidebar";
import toast from "react-hot-toast";
import {
  HiOutlineUpload,
  HiOutlineTag,
  HiOutlineCurrencyRupee,
  HiOutlineX,
  HiOutlinePlus,
  HiCheck,
} from "react-icons/hi";

// Popular color presets for quick selection
const POPULAR_COLORS = [
  "Black",
  "White",
  "Navy Blue",
  "Beige",
  "Olive Green",
  "Charcoal Grey",
  "Crimson Red",
  "Gold",
  "Silver",
];

// Standard clothing / merch sizes
const MERCH_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

const AddProduct = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    brand: "",
    category: "Fashion & Brands",
    stock: 10,
    price: "",
    discountPrice: "",
    description: "",
  });

  // Optional Variants State
  const [enableColors, setEnableColors] = useState(false);
  const [selectedColors, setSelectedColors] = useState([]);
  const [customColorInput, setCustomColorInput] = useState("");

  const [enableSizes, setEnableSizes] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState([]);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Color selection helpers
  const handleToggleColor = (color) => {
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter((c) => c !== color));
    } else {
      setSelectedColors([...selectedColors, color]);
    }
  };

  const handleAddCustomColor = (e) => {
    e.preventDefault();
    const trimmed = customColorInput.trim();
    if (!trimmed) return;
    if (selectedColors.includes(trimmed)) {
      toast.error("Color already added");
      return;
    }
    setSelectedColors([...selectedColors, trimmed]);
    setCustomColorInput("");
  };

  // Size selection helpers
  const handleToggleSize = (size) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter((s) => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 5) {
      toast.error("Maximum 5 product photos allowed");
      return;
    }

    const updatedFiles = [...selectedFiles, ...files];
    setSelectedFiles(updatedFiles);

    const urls = updatedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleRemoveImage = (index) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    setPreviewUrls(updatedFiles.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.price || !formData.description) {
      toast.error("Please fill in title, price, and description");
      return;
    }

    if (selectedFiles.length === 0) {
      toast.error("Please upload at least 1 product image");
      return;
    }

    if (enableColors && selectedColors.length === 0) {
      toast.error("Please select at least 1 color or disable the color option");
      return;
    }

    if (enableSizes && selectedSizes.length === 0) {
      toast.error("Please select at least 1 size or disable the size option");
      return;
    }

    setIsLoading(true);
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("brand", formData.brand || "Nuvora");
      data.append("category", formData.category || "Fashion & Brands");
      data.append("stock", Number(formData.stock) || 1);
      data.append("price", Number(formData.price));
      if (formData.discountPrice) {
        data.append("discountPrice", Number(formData.discountPrice));
      }
      data.append("description", formData.description);

      // Append optional colors and sizes if enabled
      if (enableColors && selectedColors.length > 0) {
        data.append("colors", JSON.stringify(selectedColors));
      } else {
        data.append("colors", JSON.stringify([]));
      }

      if (enableSizes && selectedSizes.length > 0) {
        data.append("sizes", JSON.stringify(selectedSizes));
      } else {
        data.append("sizes", JSON.stringify([]));
      }

      for (let i = 0; i < selectedFiles.length; i++) {
        data.append("images", selectedFiles[i]);
      }

      await dispatch(createProduct(data)).unwrap();

      toast.success("Product published to store successfully!");
      navigate("/seller/dashboard");
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to create product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
        {/* Left Sidebar */}
        <SellerSidebar />

        {/* Form Content */}
        <div className="flex-1 bg-[#121215] border border-neutral-800/80 rounded-3xl p-6 sm:p-10 space-y-6 sm:space-y-8">
          <div className="border-b border-neutral-800 pb-6">
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-neutral-500">
              ADMIN PUBLISHING
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-['Syne',sans-serif]">
              Add New Product
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Upload product photos, pricing, stock count, colors, and clothing sizes.
            </p>
          </div>

          <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
            {/* Image Upload Area */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                Product Photography (Max 5 Images) *
              </label>
              <label className="border-2 border-dashed border-neutral-800 hover:border-neutral-600 rounded-2xl p-6 sm:p-8 text-center bg-neutral-900/40 cursor-pointer transition-colors block space-y-2.5">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-neutral-800 bg-neutral-900 text-white flex items-center justify-center mx-auto">
                  <HiOutlineUpload className="text-xl sm:text-2xl" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-white">
                    Click to browse files or drag and drop
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-neutral-500 font-mono">
                    High resolution JPG, PNG, WEBP up to 5MB each ({selectedFiles.length}/5 selected)
                  </p>
                </div>
              </label>

              {/* Previews */}
              {previewUrls.length > 0 && (
                <div className="flex space-x-3 pt-2 overflow-x-auto">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative w-16 h-20 rounded-xl overflow-hidden border border-neutral-700 shrink-0">
                      <img src={url} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 p-0.5 bg-black/80 rounded-full text-white hover:text-rose-400"
                      >
                        <HiOutlineX className="text-xs" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Brand */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                  Product Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Oversized Graphic Hoodie"
                  className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white px-4 py-3 rounded-xl focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                  Brand Name
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g. Nuvora Studio"
                  className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white px-4 py-3 rounded-xl focus:outline-none focus:border-white transition-colors"
                />
              </div>
            </div>

            {/* Category & Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white px-4 py-3 rounded-xl focus:outline-none focus:border-white transition-colors cursor-pointer"
                >
                  <option value="Fashion & Brands">Fashion & Brands</option>
                  <option value="Tech & Accessories">Tech & Accessories</option>
                  <option value="Home Decors">Home Decors</option>
                  <option value="Wearables">Wearables</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                  Initial Stock Inventory
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="1"
                  className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white px-4 py-3 rounded-xl focus:outline-none focus:border-white transition-colors"
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                  Original Retail Price (₹) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="1"
                    placeholder="3499"
                    className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-white transition-colors"
                  />
                  <HiOutlineCurrencyRupee className="absolute left-3.5 top-3.5 text-neutral-500 text-lg" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                  Discounted Selling Price (₹)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="discountPrice"
                    value={formData.discountPrice}
                    onChange={handleChange}
                    min="0"
                    placeholder="2999"
                    className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-white transition-colors"
                  />
                  <HiOutlineTag className="absolute left-3.5 top-3.5 text-neutral-500 text-lg" />
                </div>
              </div>
            </div>

            {/* ============================================================= */}
            {/* OPTIONAL COLOR VARIANTS */}
            {/* ============================================================= */}
            <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-bold text-white">
                    Available Color Options (Optional)
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Enable this if the product is available in multiple colors.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableColors}
                    onChange={(e) => {
                      setEnableColors(e.target.checked);
                      if (!e.target.checked) setSelectedColors([]);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white"></div>
                </label>
              </div>

              {enableColors && (
                <div className="space-y-3.5 pt-2 border-t border-neutral-800/80 animate-fadeIn">
                  {/* Active Selected Colors Display */}
                  {selectedColors.length > 0 && (
                    <div className="space-y-1.5 p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                      <span className="text-[10px] uppercase font-mono text-neutral-400 block font-bold">
                        Active Selected Colors ({selectedColors.length}):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {selectedColors.map((col) => (
                          <span
                            key={col}
                            className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white text-black shadow-sm"
                          >
                            <span>{col}</span>
                            <button
                              type="button"
                              onClick={() => handleToggleColor(col)}
                              className="p-0.5 rounded-full hover:bg-neutral-200 text-black"
                              title="Remove color"
                            >
                              <HiOutlineX className="text-xs" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Preset Colors */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-mono text-neutral-400 block">
                      Quick Select Preset Colors:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_COLORS.map((col) => {
                        const isSelected = selectedColors.includes(col);
                        return (
                          <button
                            key={col}
                            type="button"
                            onClick={() => handleToggleColor(col)}
                            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                              isSelected
                                ? "bg-neutral-800 text-neutral-400 border-neutral-700 opacity-60 line-through cursor-pointer"
                                : "bg-neutral-900 border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:text-white"
                            }`}
                          >
                            {isSelected && <HiCheck className="text-xs" />}
                            <span>{col}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Add Custom Color Input */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase font-mono text-neutral-400 block">
                      Add Custom Color:
                    </span>
                    <div className="flex items-center space-x-2 max-w-md">
                      <input
                        type="text"
                        value={customColorInput}
                        onChange={(e) => setCustomColorInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCustomColor(e);
                          }
                        }}
                        placeholder="Type custom color (e.g. Pastel Pink, Gold)"
                        className="flex-1 bg-neutral-900 border border-neutral-800 text-xs text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-white transition-colors"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomColor}
                        className="px-4 py-2.5 bg-white text-black hover:bg-neutral-200 text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center space-x-1"
                      >
                        <HiOutlinePlus className="text-sm" />
                        <span>Add Color</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ============================================================= */}
            {/* OPTIONAL CLOTHING / MERCH SIZES */}
            {/* ============================================================= */}
            <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-bold text-white">
                    Available Clothing / Merch Sizes (Optional)
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Enable this for apparel, merchandise, and wearables.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableSizes}
                    onChange={(e) => {
                      setEnableSizes(e.target.checked);
                      if (!e.target.checked) setSelectedSizes([]);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white"></div>
                </label>
              </div>

              {enableSizes && (
                <div className="space-y-3.5 pt-2 border-t border-neutral-800/80 animate-fadeIn">
                  {/* Active Selected Sizes Display */}
                  {selectedSizes.length > 0 && (
                    <div className="space-y-1.5 p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                      <span className="text-[10px] uppercase font-mono text-neutral-400 block font-bold">
                        Active Selected Sizes ({selectedSizes.length}):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {selectedSizes.map((sz) => (
                          <span
                            key={sz}
                            className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-mono font-bold bg-white text-black shadow-sm"
                          >
                            <span>{sz}</span>
                            <button
                              type="button"
                              onClick={() => handleToggleSize(sz)}
                              className="p-0.5 rounded-full hover:bg-neutral-200 text-black"
                              title="Remove size"
                            >
                              <HiOutlineX className="text-xs" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Preset Merch Sizes */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-mono text-neutral-400 block">
                      Toggle Sizes:
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {MERCH_SIZES.map((sz) => {
                        const isSelected = selectedSizes.includes(sz);
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => handleToggleSize(sz)}
                            className={`w-12 h-10 rounded-xl text-xs font-mono font-bold border transition-all flex items-center justify-center ${
                              isSelected
                                ? "bg-white text-black border-white shadow-md scale-105"
                                : "bg-neutral-900 border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:text-white"
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                Detailed Product Description *
              </label>
              <textarea
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Describe material, specifications, warranty, dimensions..."
                className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white px-4 py-3 rounded-xl focus:outline-none focus:border-white transition-colors"
              ></textarea>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-neutral-800">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-8 py-3.5 bg-white text-black text-xs uppercase font-extrabold tracking-widest rounded-xl hover:bg-neutral-200 transition-colors shadow-lg disabled:opacity-50"
              >
                {isLoading ? "Uploading & Publishing..." : "Publish to Store"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
