import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useGetPaginatedProductsQuery } from "../../redux/apiSlice";
import ProductCard from "../../Components/Product/ProductCard";
import Loader from "../../Components/Common/Loader";
import {
  HiOutlineArrowRight,
  HiOutlineShieldCheck,
  HiOutlineTruck,
  HiOutlineRefresh,
  HiOutlineSparkles,
  HiOutlineShoppingBag,
  HiOutlineTag,
  HiOutlineDeviceMobile,
  HiOutlineHome,
  HiOutlineClock,
  HiOutlineChevronDown,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineSearch,
  HiOutlineAdjustments,
  HiOutlineX,
} from "react-icons/hi";

const CATEGORY_CARDS = [
  {
    id: "Fashion & Brands",
    name: "Fashion & Brands",
    subtitle: "Apparel, Streetwear & Luxury Labels",
    icon: HiOutlineTag,
  },
  {
    id: "Tech & Accessories",
    name: "Tech & Accessories",
    subtitle: "Audio, Minimal EDC & Tech Gear",
    icon: HiOutlineDeviceMobile,
  },
  {
    id: "Home Decors",
    name: "Home Decors",
    subtitle: "Aesthetic Living, Lights & Accents",
    icon: HiOutlineHome,
  },
  {
    id: "Wearables",
    name: "Wearables",
    subtitle: "Timepieces, Eyewear & Footwear",
    icon: HiOutlineClock,
  },
];

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Featured");
  const [priceRange, setPriceRange] = useState(25000);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [page, setPage] = useState(1);

  // Backend separate paginate query with live filter parameters
  const { data: paginateResponse, isLoading } = useGetPaginatedProductsQuery({
    page,
    limit: 8,
    category: selectedCategory,
    search: searchQuery,
    maxPrice: priceRange,
    sortBy,
  });

  const products = paginateResponse?.data || [];
  const totalPages = paginateResponse?.totalPages || 1;
  const currentPage = paginateResponse?.currentPage || 1;
  const totalProducts = paginateResponse?.totalProducts || 0;

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, searchQuery, sortBy, priceRange]);

  const handleResetFilters = () => {
    setSelectedCategory("All");
    setSearchQuery("");
    setSortBy("Featured");
    setPriceRange(25000);
    setPage(1);
  };

  return (
    <div className="relative w-full max-w-full space-y-6 sm:space-y-12 pt-3 sm:pt-0 pb-16 sm:pb-24 overflow-x-hidden">
      {/* Desktop Hero Section (PC Only) */}
      <section className="hidden md:block relative px-4 sm:px-6 lg:px-8 py-10 sm:py-16 text-center border-b border-neutral-800/80 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 sm:w-[450px] h-64 sm:h-[450px] bg-white/[0.03] rounded-full blur-[100px] pointer-events-none -z-10"></div>

        <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-[#121215] border border-neutral-800 text-[10px] sm:text-xs font-mono uppercase tracking-widest text-neutral-300 shadow-sm">
            <HiOutlineSparkles className="text-white text-xs" />
            <span>EXCLUSIVE MONOCHROME STORE</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-white font-['Syne',sans-serif] leading-tight">
            ESSENTIALS REDEFINED IN <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-white via-neutral-300 to-neutral-400 bg-clip-text text-transparent">
              MONOCHROME.
            </span>
          </h1>

          <p className="text-xs sm:text-base text-neutral-400 max-w-xl mx-auto font-light leading-relaxed px-2">
            Explore curated statement pieces with timeless aesthetic, premium craftsmanship, and fast doorstep delivery across India.
          </p>

          <div className="flex items-center justify-center pt-2">
            <Link
              to="/shop"
              className="px-7 py-3.5 bg-white text-black text-xs uppercase font-extrabold tracking-widest rounded-xl hover:bg-neutral-200 transition-all flex items-center justify-center space-x-2 shadow-lg"
            >
              <span>Browse All Catalogue</span>
              <HiOutlineArrowRight className="text-sm" />
            </Link>
          </div>
        </div>
      </section>

      {/* Mobile-Only Search, Sort & Filter Bar (lg:hidden -> Hidden on PC View) */}
      <section className="lg:hidden w-full max-w-7xl mx-auto px-4 sm:px-6 space-y-3">
        {/* Search Bar Input */}
        <div className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pieces, brands, categories..."
            className="w-full bg-[#121215] border border-neutral-800 text-xs text-white pl-10 pr-9 py-3 rounded-2xl placeholder:text-neutral-500 font-medium focus:outline-none focus:border-white transition-colors shadow-sm"
          />
          <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-base" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              title="Clear search"
            >
              <HiOutlineX className="text-sm" />
            </button>
          )}
        </div>

        {/* Sort & Filter Controls Bar */}
        <div className="flex items-center justify-between gap-2.5">
          {/* Sort Dropdown */}
          <div className="flex-1 relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-[#121215] border border-neutral-800 text-[11px] font-semibold text-neutral-300 px-3 py-2.5 rounded-xl appearance-none focus:outline-none focus:border-white transition-colors cursor-pointer pr-8"
            >
              <option value="Featured">Sort: Featured</option>
              <option value="Price: Low to High">Price: Low to High</option>
              <option value="Price: High to Low">Price: High to Low</option>
              <option value="Top Rated">Top Rated</option>
            </select>
            <HiOutlineChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 text-xs pointer-events-none" />
          </div>

          {/* Filter Trigger Button */}
          <button
            onClick={() => setShowMobileFilter(!showMobileFilter)}
            className={`flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl border text-[11px] font-semibold transition-all shrink-0 ${
              showMobileFilter || priceRange < 25000
                ? "bg-white text-black border-white font-bold shadow-sm"
                : "bg-[#121215] border-neutral-800 text-white hover:border-neutral-700"
            }`}
          >
            <HiOutlineAdjustments className="text-sm" />
            <span>{showMobileFilter ? "Hide Filter" : `Filter ${priceRange < 25000 ? `(₹${priceRange / 1000}k)` : ""}`}</span>
          </button>
        </div>

        {/* Mobile Inline Collapsible Price Filter Accordion */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            showMobileFilter ? "max-h-96 opacity-100 pt-2" : "max-h-0 opacity-0 pointer-events-none"
          }`}
        >
          <div className="bg-[#121215] border border-neutral-800/90 rounded-2xl p-4 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <span className="text-xs uppercase font-mono font-bold text-white">Price Budget Filter</span>
              <span className="text-xs font-mono font-bold text-white">₹{priceRange.toLocaleString()}</span>
            </div>

            <input
              type="range"
              min="500"
              max="25000"
              step="500"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-white bg-neutral-800 rounded-lg cursor-pointer h-1.5"
            />
            <div className="flex justify-between text-[11px] text-neutral-500 font-mono">
              <span>Min: ₹500</span>
              <span>Max: ₹25,000</span>
            </div>

            <div className="flex space-x-2 pt-1">
              <button
                onClick={() => {
                  setPriceRange(25000);
                  setShowMobileFilter(false);
                }}
                className="flex-1 py-2.5 bg-neutral-900 text-neutral-400 text-xs uppercase font-bold rounded-xl border border-neutral-800 hover:text-white"
              >
                Reset
              </button>
              <button
                onClick={() => setShowMobileFilter(false)}
                className="flex-1 py-2.5 bg-white text-black text-xs uppercase font-extrabold rounded-xl shadow-md hover:bg-neutral-200 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Active Query Feedback */}
        {searchQuery && (
          <div className="flex items-center justify-between text-[11px] text-neutral-400 px-1 pt-1">
            <span>
              Results for: <strong className="text-white">"{searchQuery}"</strong>
            </span>
            <button onClick={() => setSearchQuery("")} className="text-neutral-500 hover:text-white underline">
              Clear
            </button>
          </div>
        )}
      </section>

      {/* 1. Explore By Category (Dropdown in Mobile, 4-Cards Grid on Desktop) */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-xs uppercase tracking-widest text-neutral-500 font-mono">
              CURATED DEPARTMENTS
            </span>
            <h2 className="text-lg sm:text-3xl font-extrabold tracking-tight text-white font-['Syne',sans-serif]">
              Explore Categories
            </h2>
          </div>
        </div>

        {/* Mobile Dropdown View (sm:hidden) */}
        <div className="sm:hidden relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-[#121215] border border-neutral-800 text-xs font-bold uppercase tracking-wider text-white px-4 py-3.5 rounded-2xl appearance-none focus:outline-none focus:border-white transition-colors cursor-pointer shadow-sm pr-10"
          >
            <option value="All">All Categories</option>
            {CATEGORY_CARDS.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <HiOutlineChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 text-base pointer-events-none" />
        </div>

        {/* Desktop 4-Category Cards Grid (hidden sm:grid) */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {CATEGORY_CARDS.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`group relative p-6 rounded-3xl border cursor-pointer transition-all duration-300 flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? "bg-[#16161b] border-white ring-1 ring-white/20 shadow-[0_4px_25px_rgba(255,255,255,0.08)] -translate-y-1"
                    : "bg-[#121215] border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-900/60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`p-3 rounded-2xl border transition-colors ${
                      isSelected
                        ? "bg-white text-black border-white"
                        : "bg-neutral-900 border-neutral-800 text-neutral-300 group-hover:text-white group-hover:bg-neutral-800"
                    }`}
                  >
                    <Icon className="text-2xl" />
                  </div>

                  {isSelected && (
                    <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded-full bg-white text-black font-extrabold tracking-wider">
                      Active
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-white font-['Syne',sans-serif] leading-tight">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 line-clamp-1 font-light">
                    {cat.subtitle}
                  </p>
                </div>

                <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-xs font-semibold text-neutral-400 group-hover:text-white transition-colors">
                  <span>View Products</span>
                  <HiOutlineArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Categorized Products List with Numbered Pagination (1, 2, 3...) */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {isLoading ? (
          <div className="py-16">
            <Loader text="Loading products..." />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-[#121215] border border-neutral-800/80 rounded-3xl space-y-4">
            <HiOutlineShoppingBag className="text-5xl text-neutral-600 mx-auto" />
            <h3 className="text-base sm:text-lg font-bold text-white font-['Syne',sans-serif]">
              {searchQuery ? `No Products Matching "${searchQuery}"` : `No Pieces In "${selectedCategory}" Yet`}
            </h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Try adjusting your search terms or select another category department.
            </p>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-white text-black text-xs font-extrabold uppercase tracking-wider rounded-xl hover:bg-neutral-200"
            >
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Standard Numbered Pagination (1, 2, 3...) */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-neutral-800/80">
                <span className="text-xs font-mono text-neutral-400">
                  Page {currentPage} of {totalPages} ({totalProducts} pieces)
                </span>

                <div className="flex items-center space-x-2">
                  {/* Prev Button */}
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="p-2.5 rounded-xl border border-neutral-800 bg-[#121215] text-neutral-400 hover:text-white hover:border-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="Previous Page"
                  >
                    <HiOutlineChevronLeft className="text-base" />
                  </button>

                  {/* Page Numbers 1, 2, 3... */}
                  <div className="flex items-center space-x-1.5 text-xs font-mono">
                    {[...Array(totalPages)].map((_, i) => {
                      const pageNumber = i + 1;
                      const isActive = currentPage === pageNumber;
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setPage(pageNumber)}
                          className={`w-9 h-9 rounded-xl font-bold transition-all ${
                            isActive
                              ? "bg-white text-black shadow-md"
                              : "bg-[#121215] border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="p-2.5 rounded-xl border border-neutral-800 bg-[#121215] text-neutral-400 hover:text-white hover:border-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="Next Page"
                  >
                    <HiOutlineChevronRight className="text-base" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Value Badges */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-6 p-5 sm:p-8 rounded-3xl bg-[#121215] border border-neutral-800/80">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-2xl bg-neutral-900 border border-neutral-800 text-white shrink-0">
              <HiOutlineTruck className="text-xl" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                Fast Dispatch
              </h4>
              <p className="text-xs text-neutral-400 mt-0.5">
                Free standard delivery on orders over ₹1,999.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-2xl bg-neutral-900 border border-neutral-800 text-white shrink-0">
              <HiOutlineShieldCheck className="text-xl" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                Verified Quality
              </h4>
              <p className="text-xs text-neutral-400 mt-0.5">
                100% authentic materials and premium craftsmanship.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-2xl bg-neutral-900 border border-neutral-800 text-white shrink-0">
              <HiOutlineRefresh className="text-xl" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                Easy Replacements
              </h4>
              <p className="text-xs text-neutral-400 mt-0.5">
                Hassle-free 7-day replacement support on all pieces.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
