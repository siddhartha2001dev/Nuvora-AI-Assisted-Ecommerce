import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  useGetSellerProductsQuery,
  useDeleteProductMutation,
  useUpdateProductMutation,
  useGetSellerOrdersQuery,
} from "../../redux/apiSlice";
import SellerSidebar from "../../Components/Seller/SellerSidebar";
import Loader from "../../Components/Common/Loader";
import toast from "react-hot-toast";
import {
  HiOutlineCurrencyRupee,
  HiOutlineShoppingBag,
  HiOutlineClipboardList,
  HiOutlineStar,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineRefresh,
  HiOutlinePencilAlt,
  HiOutlineX,
  HiOutlineCheck,
} from "react-icons/hi";

const CATEGORIES = [
  "Fashion & Brands",
  "Tech & Accessories",
  "Home Decors",
  "Wearables",
];

const SellerDashboard = () => {
  const { data: productsRes, isLoading: isProductsLoading } = useGetSellerProductsQuery();
  const { data: ordersRes } = useGetSellerOrdersQuery();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  // Stock Refill Modal State
  const [refillModalProduct, setRefillModalProduct] = useState(null);
  const [newStockAmount, setNewStockAmount] = useState(10);
  const [refillMode, setRefillMode] = useState("add"); // "add" or "set"

  // Full Edit Product Modal State
  const [editModalProduct, setEditModalProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    brand: "",
    category: "Fashion & Brands",
    price: "",
    discountPrice: "",
    stock: 1,
    description: "",
  });

  const products = productsRes?.data || [];
  const orders = ordersRes?.data || [];

  const totalRevenue = orders.reduce((acc, o) => acc + (o.totalPrice || 0), 0);
  const lowStockCount = products.filter((p) => (p.stock || 0) <= 3).length;

  // 1. Delete Product
  const handleDelete = async (productId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;

    try {
      await deleteProduct(productId).unwrap();
      toast.success(`"${title}" deleted successfully`);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete product");
    }
  };

  // 2. Open Edit Modal
  const handleOpenEditModal = (product) => {
    setEditModalProduct(product);
    setEditFormData({
      title: product.title || "",
      brand: product.brand || "",
      category: product.category || "Fashion & Brands",
      price: product.price || "",
      discountPrice: product.discountPrice || "",
      stock: product.stock || 1,
      description: product.description || "",
    });
  };

  // 3. Save Full Product Edit
  const handleSaveEditProduct = async (e) => {
    e.preventDefault();
    if (!editModalProduct) return;

    if (!editFormData.title || !editFormData.price || !editFormData.description) {
      toast.error("Please fill in Title, Price, and Description");
      return;
    }

    try {
      await updateProduct({
        id: editModalProduct._id,
        formData: {
          title: editFormData.title.trim(),
          brand: editFormData.brand.trim() || "Nuvora",
          category: editFormData.category,
          price: Number(editFormData.price),
          discountPrice: editFormData.discountPrice ? Number(editFormData.discountPrice) : 0,
          stock: Math.max(0, Number(editFormData.stock)),
          description: editFormData.description.trim(),
        },
      }).unwrap();

      toast.success(`"${editFormData.title}" updated successfully!`);
      setEditModalProduct(null);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update product details");
    }
  };

  // 4. Quick Stock Refill Handlers
  const handleOpenRefillModal = (product) => {
    setRefillModalProduct(product);
    setNewStockAmount(10);
    setRefillMode("add");
  };

  const handleConfirmRefill = async (e) => {
    e.preventDefault();
    if (!refillModalProduct) return;

    const currentStock = refillModalProduct.stock || 0;
    const finalStock =
      refillMode === "add"
        ? currentStock + Number(newStockAmount)
        : Number(newStockAmount);

    if (finalStock < 0) {
      toast.error("Stock quantity cannot be negative");
      return;
    }

    try {
      await updateProduct({
        id: refillModalProduct._id,
        formData: { stock: finalStock },
      }).unwrap();

      toast.success(`Stock for "${refillModalProduct.title}" updated to ${finalStock} units!`);
      setRefillModalProduct(null);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update stock");
    }
  };

  if (isProductsLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader text="Loading merchant dashboard..." />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
        {/* Left Sidebar */}
        <SellerSidebar />

        {/* Main Content Area */}
        <div className="flex-1 space-y-6 sm:space-y-8 min-w-0">
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
            <div>
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-neutral-500">
                MERCHANT CONTROL PANEL
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-['Syne',sans-serif]">
                Dashboard Overview
              </h1>
            </div>

            <Link
              to="/seller/add-product"
              className="inline-flex items-center justify-center space-x-2 px-5 py-3 bg-white text-black text-xs uppercase font-extrabold tracking-wider rounded-xl hover:bg-neutral-200 transition-colors shadow-lg"
            >
              <HiOutlinePlus className="text-base" />
              <span>Add New Piece</span>
            </Link>
          </div>

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 sm:p-5 bg-[#121215] border border-neutral-800/80 rounded-2xl space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold">Total Revenue</span>
                <HiOutlineCurrencyRupee className="text-lg sm:text-xl text-white" />
              </div>
              <p className="text-lg sm:text-2xl font-extrabold text-white font-mono">
                ₹{totalRevenue.toLocaleString()}
              </p>
              <span className="text-[9px] sm:text-[10px] text-emerald-400 font-mono">from all orders</span>
            </div>

            <div className="p-4 sm:p-5 bg-[#121215] border border-neutral-800/80 rounded-2xl space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold">Orders Received</span>
                <HiOutlineClipboardList className="text-lg sm:text-xl text-white" />
              </div>
              <p className="text-lg sm:text-2xl font-extrabold text-white font-mono">{orders.length}</p>
              <span className="text-[9px] sm:text-[10px] text-neutral-400 font-mono">
                {orders.filter((o) => o.orderStatus === "Placed").length} pending
              </span>
            </div>

            <div className="p-4 sm:p-5 bg-[#121215] border border-neutral-800/80 rounded-2xl space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold">Active Listings</span>
                <HiOutlineShoppingBag className="text-lg sm:text-xl text-white" />
              </div>
              <p className="text-lg sm:text-2xl font-extrabold text-white font-mono">{products.length}</p>
              <span className="text-[9px] sm:text-[10px] text-neutral-400 font-mono">
                {lowStockCount} low stock
              </span>
            </div>

            <div className="p-4 sm:p-5 bg-[#121215] border border-neutral-800/80 rounded-2xl space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold">Merchant Score</span>
                <HiOutlineStar className="text-lg sm:text-xl text-amber-400" />
              </div>
              <p className="text-lg sm:text-2xl font-extrabold text-white font-mono">5.0 / 5</p>
              <span className="text-[9px] sm:text-[10px] text-emerald-400 font-mono">Top Tier</span>
            </div>
          </div>

          {/* Product Listings Table */}
          <div className="bg-[#121215] border border-neutral-800/80 rounded-3xl p-4 sm:p-8 space-y-4 sm:space-y-6 overflow-hidden">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
                  Catalog Inventory
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Manage, edit details, refill stock or remove your listed pieces.
                </p>
              </div>
              <span className="text-xs text-neutral-500 font-mono">{products.length} Live Pieces</span>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <HiOutlineShoppingBag className="text-4xl text-neutral-600 mx-auto" />
                <h4 className="text-sm font-bold text-white">No Pieces Listed Yet</h4>
                <p className="text-xs text-neutral-400">
                  Click "Add New Piece" above to publish your first piece to the store.
                </p>
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[620px]">
                  <thead>
                    <tr className="border-b border-neutral-800 text-neutral-500 uppercase tracking-wider font-mono text-[10px]">
                      <th className="pb-3">Product</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3">Price</th>
                      <th className="pb-3">Current Stock</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                    {products.map((p) => {
                      const image =
                        p.images && p.images.length > 0
                          ? p.images[0]
                          : "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop";

                      const stock = p.stock || 0;

                      return (
                        <tr key={p._id} className="hover:bg-neutral-900/40 transition-colors">
                          <td className="py-3.5 flex items-center space-x-3">
                            <img
                              src={image}
                              alt={p.title}
                              className="w-10 h-12 object-cover rounded-xl bg-neutral-900 border border-neutral-800 shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="font-semibold text-white block truncate max-w-[140px] sm:max-w-xs">
                                {p.title}
                              </span>
                              {p.brand && (
                                <span className="text-[10px] text-neutral-500 font-mono">
                                  {p.brand}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 text-neutral-400">{p.category || "Fashion & Brands"}</td>
                          <td className="py-3.5 font-mono font-bold text-white">
                            ₹{(p.discountPrice > 0 ? p.discountPrice : p.price).toLocaleString()}
                          </td>
                          <td className="py-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-md border font-mono font-bold text-[11px] inline-flex items-center space-x-1 ${
                                stock === 0
                                  ? "bg-rose-950/80 border-rose-800 text-rose-400"
                                  : stock <= 3
                                  ? "bg-amber-950/80 border-amber-800 text-amber-300"
                                  : "bg-emerald-950/60 border-emerald-800/60 text-emerald-400"
                              }`}
                            >
                              <span>{stock} in stock</span>
                              {stock === 0 && <span>(Out)</span>}
                            </span>
                          </td>
                          <td className="py-3.5 text-right">
                            <div className="inline-flex items-center space-x-1.5 sm:space-x-2">
                              {/* 1. Edit Details Button */}
                              <button
                                onClick={() => handleOpenEditModal(p)}
                                className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:text-black hover:bg-white rounded-lg border border-neutral-700 bg-neutral-900 transition-all shadow-sm"
                                title="Edit Product Details"
                              >
                                <HiOutlinePencilAlt className="text-xs" />
                                <span>Edit</span>
                              </button>

                              {/* 2. Refill Stock Button */}
                              <button
                                onClick={() => handleOpenRefillModal(p)}
                                className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-[11px] font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg border border-neutral-800 bg-neutral-900 transition-all shadow-sm"
                                title="Refill / Update Stock"
                              >
                                <HiOutlineRefresh className="text-xs" />
                                <span>Refill</span>
                              </button>

                              {/* 3. Delete Listing Button */}
                              <button
                                onClick={() => handleDelete(p._id, p.title)}
                                disabled={isDeleting}
                                className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg border border-neutral-800 bg-neutral-900 transition-colors disabled:opacity-50 inline-flex items-center justify-center"
                                title="Delete Listing"
                              >
                                <HiOutlineTrash className="text-sm" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FULL PRODUCT EDIT MODAL */}
      {editModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-fadeIn"
            onClick={() => setEditModalProduct(null)}
          ></div>

          <div className="relative w-full max-w-lg bg-[#121215] border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto animate-scaleUp">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center space-x-2">
                <HiOutlinePencilAlt className="text-xl text-white" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white font-['Syne',sans-serif]">
                  Edit Product Details
                </h3>
              </div>
              <button
                onClick={() => setEditModalProduct(null)}
                className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white"
              >
                <HiOutlineX className="text-base" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProduct} className="space-y-4">
              {/* Title & Brand */}
              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                  Product Title *
                </label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  required
                  placeholder="Product Title"
                  className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={editFormData.brand}
                    onChange={(e) => setEditFormData({ ...editFormData, brand: e.target.value })}
                    placeholder="e.g. Nuvora"
                    className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-white transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                    Category *
                  </label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-white transition-colors cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                    Regular Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editFormData.price}
                    onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                    required
                    className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white px-3.5 py-2.5 rounded-xl font-mono focus:outline-none focus:border-white transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                    Discount Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.discountPrice}
                    onChange={(e) => setEditFormData({ ...editFormData, discountPrice: e.target.value })}
                    placeholder="Optional"
                    className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white px-3.5 py-2.5 rounded-xl font-mono focus:outline-none focus:border-white transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                    Stock Units *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.stock}
                    onChange={(e) => setEditFormData({ ...editFormData, stock: e.target.value })}
                    required
                    className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white px-3.5 py-2.5 rounded-xl font-mono focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                  Description *
                </label>
                <textarea
                  rows={3}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  required
                  placeholder="Describe your piece..."
                  className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-white transition-colors"
                ></textarea>
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditModalProduct(null)}
                  className="flex-1 py-3 bg-neutral-900 text-neutral-300 text-xs uppercase font-bold tracking-wider rounded-xl hover:bg-neutral-800 border border-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-3 bg-white text-black text-xs uppercase font-extrabold tracking-wider rounded-xl hover:bg-neutral-200 transition-all shadow-xl disabled:opacity-60 flex items-center justify-center space-x-2"
                >
                  <HiOutlineCheck className="text-base" />
                  <span>{isUpdating ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK STOCK REFILL MODAL */}
      {refillModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-fadeIn"
            onClick={() => setRefillModalProduct(null)}
          ></div>

          <div className="relative w-full max-w-md bg-[#121215] border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl z-10 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center space-x-2">
                <HiOutlineRefresh className="text-lg text-white" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white font-['Syne',sans-serif]">
                  Refill Inventory Stock
                </h3>
              </div>
              <button
                onClick={() => setRefillModalProduct(null)}
                className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white"
              >
                <HiOutlineX className="text-base" />
              </button>
            </div>

            {/* Target Product Summary */}
            <div className="flex items-center space-x-3.5 p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800">
              <img
                src={
                  refillModalProduct.images?.[0] ||
                  "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop"
                }
                alt={refillModalProduct.title}
                className="w-12 h-14 object-cover rounded-xl bg-neutral-950 border border-neutral-800 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{refillModalProduct.title}</p>
                <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                  Current Stock:{" "}
                  <strong className={refillModalProduct.stock === 0 ? "text-rose-400" : "text-emerald-400"}>
                    {refillModalProduct.stock || 0} units
                  </strong>
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmRefill} className="space-y-4">
              {/* Mode Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-neutral-900 border border-neutral-800">
                <button
                  type="button"
                  onClick={() => setRefillMode("add")}
                  className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    refillMode === "add" ? "bg-white text-black shadow-md" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  + Add to Existing
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRefillMode("set");
                    setNewStockAmount(refillModalProduct.stock || 0);
                  }}
                  className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    refillMode === "set" ? "bg-white text-black shadow-md" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Set Exact Total
                </button>
              </div>

              {/* Quick Presets */}
              {refillMode === "add" && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-mono text-neutral-400">Quick Add:</span>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 10, 25, 50].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setNewStockAmount(preset)}
                        className={`py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                          newStockAmount === preset
                            ? "bg-white text-black border-white"
                            : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                        }`}
                      >
                        +{preset}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Input */}
              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-400">
                  {refillMode === "add" ? "Quantity to Add" : "New Total Stock"}
                </label>
                <input
                  type="number"
                  min="0"
                  max="10000"
                  value={newStockAmount}
                  onChange={(e) => setNewStockAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 text-sm font-mono font-bold text-white px-4 py-3 rounded-xl focus:outline-none focus:border-white transition-colors"
                />
              </div>

              {/* Preview calculation */}
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono flex items-center justify-between">
                <span className="text-neutral-400">Resulting Stock:</span>
                <span className="font-extrabold text-emerald-400 text-sm">
                  {refillMode === "add"
                    ? (refillModalProduct.stock || 0) + Number(newStockAmount)
                    : Number(newStockAmount)}{" "}
                  pieces
                </span>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRefillModalProduct(null)}
                  className="flex-1 py-3 bg-neutral-900 text-neutral-300 text-xs uppercase font-bold tracking-wider rounded-xl hover:bg-neutral-800 border border-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-3 bg-white text-black text-xs uppercase font-extrabold tracking-wider rounded-xl hover:bg-neutral-200 transition-all shadow-xl disabled:opacity-60"
                >
                  {isUpdating ? "Updating..." : "Confirm Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
