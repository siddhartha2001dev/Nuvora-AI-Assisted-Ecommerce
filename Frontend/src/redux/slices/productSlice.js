import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axiosInstance";

// =============================================================================
// ASYNC THUNKS (API CALLS)
// =============================================================================

// 1. Fetch All Products
export const fetchAllProducts = createAsyncThunk(
  "products/fetchAllProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/product/all");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch products");
    }
  }
);

// 2. Fetch Paginated & Filtered Products
export const fetchPaginatedProducts = createAsyncThunk(
  "products/fetchPaginatedProducts",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const {
        page = 1,
        limit = 9,
        category = "",
        search = "",
        maxPrice = "",
        sortBy = "",
      } = filters;

      let url = `/product/paginate?page=${page}&limit=${limit}`;
      if (category && category !== "All") url += `&category=${encodeURIComponent(category)}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (maxPrice) url += `&maxPrice=${maxPrice}`;
      if (sortBy) url += `&sortBy=${encodeURIComponent(sortBy)}`;

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch products");
    }
  }
);

// 3. Fetch Product Details by ID
export const fetchProductDetails = createAsyncThunk(
  "products/fetchProductDetails",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/product/${productId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch product details");
    }
  }
);

// 4. Fetch AI Summary of a Product
export const fetchProductAiSummary = createAsyncThunk(
  "products/fetchProductAiSummary",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/product/${productId}/ai-summary`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch AI summary");
    }
  }
);

// 5. Create Product (Seller)
export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/product/create", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create product");
    }
  }
);

// 6. Update Product (Seller)
export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/product/update/${id}`, formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update product");
    }
  }
);

// 7. Fetch Seller's Own Products
export const fetchSellerProducts = createAsyncThunk(
  "products/fetchSellerProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/product/seller/my-products");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch seller products");
    }
  }
);

// 8. Delete Product (Seller)
export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/product/delete/${productId}`);
      return { productId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete product");
    }
  }
);

// =============================================================================
// PRODUCT SLICE
// =============================================================================
const productSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    paginatedData: null,
    productDetails: null,
    aiSummary: null,
    sellerProducts: [],
    loading: false,
    detailsLoading: false,
    aiLoading: false,
    error: null,
  },
  reducers: {
    clearProductDetails: (state) => {
      state.productDetails = null;
      state.aiSummary = null;
    },
  },
  extraReducers: (builder) => {
    // Paginated Products
    builder
      .addCase(fetchPaginatedProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaginatedProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.paginatedData = action.payload;
      })
      .addCase(fetchPaginatedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Product Details
    builder
      .addCase(fetchProductDetails.pending, (state) => {
        state.detailsLoading = true;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.productDetails = action.payload.data || action.payload;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload;
      });

    // AI Summary
    builder
      .addCase(fetchProductAiSummary.pending, (state) => {
        state.aiLoading = true;
      })
      .addCase(fetchProductAiSummary.fulfilled, (state, action) => {
        state.aiLoading = false;
        state.aiSummary = action.payload.data || action.payload;
      })
      .addCase(fetchProductAiSummary.rejected, (state) => {
        state.aiLoading = false;
      });

    // Seller Products
    builder
      .addCase(fetchSellerProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSellerProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.sellerProducts = action.payload.data || [];
      })
      .addCase(fetchSellerProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete Product
    builder.addCase(deleteProduct.fulfilled, (state, action) => {
      state.sellerProducts = state.sellerProducts.filter(
        (p) => p._id !== action.payload.productId
      );
    });
  },
});

export const { clearProductDetails } = productSlice.actions;
export default productSlice.reducer;
