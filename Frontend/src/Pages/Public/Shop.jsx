import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPaginatedProducts } from "../../redux/slices/productSlice";
import ProductFilter from "../../Components/Product/ProductFilter";
import ProductCard from "../../Components/Product/ProductCard";
import Loader from "../../Components/Common/Loader";
import {
  HiOutlineSearch,
  HiOutlineAdjustments,
  HiOutlineX,
  HiOutlineShoppingBag,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi";

const Shop = () => {
  const dispatch = useDispatch();
  const { paginatedData, loading: isLoading } = useSelector((state) => state.products);

  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamQuery = searchParams.get("search") || "";
  const searchParamCategory = searchParams.get("category") || "All";

  const [searchQuery, setSearchQuery] = useState(searchParamQuery);
  const [selectedCategory, setSelectedCategory] = useState(searchParamCategory);
  const [sortBy, setSortBy] = useState("Featured");
  const [priceRange, setPriceRange] = useState(25000);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [page, setPage] = useState(1);

  // Sync with URL query
  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
    setSelectedCategory(searchParams.get("category") || "All");
    setPage(1);
  }, [searchParams]);

  // Fetch paginated products using Redux async thunk
  useEffect(() => {
    dispatch(
      fetchPaginatedProducts({
        page,
        limit: 9,
        category: selectedCategory,
        search: searchQuery,
        maxPrice: priceRange,
        sortBy,
      })
    );
  }, [dispatch, page, selectedCategory, searchQuery, priceRange, sortBy]);

  const products = paginatedData?.data || [];
  const totalPages = paginatedData?.totalPages || 1;
  const currentPage = paginatedData?.currentPage || 1;
  const totalProducts = paginatedData?.totalProducts || 0;

  const handleCategoryChange = (cat) => {
    // If clicking already selected category, toggle back to All
    const nextCategory = cat === selectedCategory && cat !== "All" ? "All" : cat;
    setSelectedCategory(nextCategory);
    setPage(1);

    const updatedParams = new URLSearchParams(searchParams);
    if (nextCategory === "All") {
      updatedParams.delete("category");
    } else {
      updatedParams.set("category", nextCategory);
    }
    setSearchParams(updatedParams);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setPage(1);
    const updatedParams = new URLSearchParams(searchParams);
    updatedParams.delete("search");
    setSearchParams(updatedParams);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setPriceRange(25000);
    setSortBy("Featured");
    setPage(1);
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-5 sm:space-y-8">
      {/* Title & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-800 pb-5 sm:pb-6">
        <div>
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-neutral-500">
            NUVORA CATALOGUE
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-['Syne',sans-serif]">
            {selectedCategory === "All" ? "All Products" : selectedCategory}
          </h1>

          {/* Active Search & Category Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {searchQuery && (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-neutral-900 border border-neutral-700 text-white rounded-full text-xs font-semibold">
                <span>"{searchQuery}"</span>
                <button
                  onClick={handleClearSearch}
                  className="hover:text-rose-400 transition-colors"
                  title="Clear search"
                >
                  <HiOutlineX className="text-xs" />
                </button>
              </span>
            )}
            {selectedCategory !== "All" && (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white text-black rounded-full text-xs font-bold shadow-sm">
                <span>{selectedCategory}</span>
                <button
                  onClick={() => handleCategoryChange("All")}
                  className="hover:opacity-70 transition-opacity"
                  title="Clear category"
                >
                  <HiOutlineX className="text-xs" />
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Sort & Filter Trigger Controls */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-neutral-400 font-semibold hidden sm:inline">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="bg-neutral-900 text-xs text-neutral-300 font-semibold px-4 py-2.5 rounded-xl border border-neutral-800 cursor-pointer focus:outline-none focus:border-white transition-colors"
            >
              <option>Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Top Rated</option>
            </select>
          </div>

          {/* Mobile Filter Toggle Button */}
          <button
            onClick={() => setShowMobileFilter(!showMobileFilter)}
            className={`lg:hidden flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold uppercase tracking-wider shrink-0 transition-all ${
              showMobileFilter
                ? "bg-white text-black border-white shadow-md font-bold"
                : "border-neutral-800 bg-neutral-900 text-white hover:border-neutral-700"
            }`}
            title="Toggle Filter Options"
          >
            <HiOutlineAdjustments className="text-base" />
            <span>{showMobileFilter ? "Hide Filters" : "Filter"}</span>
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="relative w-full lg:hidden">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Search products in catalogue..."
          className="w-full bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white pl-10 pr-10 py-3 rounded-2xl placeholder:text-neutral-500 font-medium focus:outline-none focus:border-white transition-colors"
        />
        <HiOutlineSearch className="absolute left-3.5 top-3.5 text-neutral-400 text-base" />
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-white"
          >
            <HiOutlineX className="text-sm" />
          </button>
        )}
      </div>

      {/* Mobile Inline Expandable Filter Block */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          showMobileFilter ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-[#121215] border border-neutral-800/80 rounded-2xl p-4 sm:p-5 shadow-xl">
          <ProductFilter
            priceRange={priceRange}
            onPriceChange={(val) => {
              setPriceRange(val);
              setPage(1);
            }}
            selectedCategory={selectedCategory}
            onCategoryChange={(cat) => {
              handleCategoryChange(cat);
            }}
            onReset={handleResetFilters}
          />
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block shrink-0">
          <ProductFilter
            priceRange={priceRange}
            onPriceChange={(val) => {
              setPriceRange(val);
              setPage(1);
            }}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            onReset={handleResetFilters}
          />
        </div>

        {/* Products Grid Area */}
        <div className="flex-1 w-full space-y-8 min-w-0">
          {isLoading && products.length === 0 ? (
            <div className="py-20">
              <Loader text="Loading luxury catalogue..." />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-[#121215] border border-neutral-800/80 rounded-3xl p-8 space-y-4">
              <HiOutlineShoppingBag className="text-5xl text-neutral-600 mx-auto" />
              <h3 className="text-lg font-bold text-white font-['Syne',sans-serif]">
                No Pieces Found
              </h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                No items match your selected filter criteria. Try adjusting your filters or price range.
              </p>
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center px-5 py-2.5 bg-white text-black text-xs font-extrabold uppercase tracking-wider rounded-xl hover:bg-neutral-200"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              {/* Product Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Numbered Pagination (1, 2, 3...) */}
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
        </div>
      </div>
    </div>
  );
};

export default Shop;
