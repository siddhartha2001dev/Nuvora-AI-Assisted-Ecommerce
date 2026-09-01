import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateProductMutation } from "../../redux/apiSlice";
import SellerSidebar from "../../Components/Seller/SellerSidebar";
import toast from "react-hot-toast";
import {
  HiOutlineUpload,
  HiOutlineTag,
  HiOutlineCurrencyRupee,
  HiOutlineX,
} from "react-icons/hi";

const AddProduct = () => {
  const navigate = useNavigate();
  const [createProduct, { isLoading }] = useCreateProductMutation();

  const [formData, setFormData] = useState({
    title: "",
    brand: "",
    category: "General",
    stock: 10,
    price: "",
    discountPrice: "",
    description: "",
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
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

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("brand", formData.brand || "Nuvora");
      data.append("category", formData.category || "General");
      data.append("stock", Number(formData.stock) || 1);
      data.append("price", Number(formData.price));
      if (formData.discountPrice) {
        data.append("discountPrice", Number(formData.discountPrice));
      }
      data.append("description", formData.description);

      for (let i = 0; i < selectedFiles.length; i++) {
        data.append("images", selectedFiles[i]);
      }

      await createProduct(data).unwrap();

      toast.success("Product published to store successfully!");
      navigate("/seller/dashboard");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create product");
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
              STORE PUBLISHING
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-['Syne',sans-serif]">
              Add New Product
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Upload product photos, pricing, stock count, and description.
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
                  placeholder="e.g. Minimalist Watch"
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
                  placeholder="e.g. Nuvora"
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
