import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axiosInstance";

// =============================================================================
// ASYNC THUNKS (API CALLS)
// =============================================================================

// 1. Fetch Cart
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/cart/my-cart");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch cart");
    }
  }
);

// 2. Add to Cart
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (cartData, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post("/cart/add", cartData);
      // Auto-refresh cart items after adding
      dispatch(fetchCart());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to add to cart");
    }
  }
);

// 3. Remove from Cart
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (itemId, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.delete(`/cart/remove/${itemId}`);
      // Auto-refresh cart items after removing
      dispatch(fetchCart());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to remove item");
    }
  }
);

// =============================================================================
// CART SLICE
// =============================================================================
const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    loading: false,
    actionLoading: false,
    error: null,
  },
  reducers: {
    clearCartState: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Cart
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data || [];
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add To Cart
    builder
      .addCase(addToCart.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(addToCart.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(addToCart.rejected, (state) => {
        state.actionLoading = false;
      });

    // Remove From Cart
    builder
      .addCase(removeFromCart.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(removeFromCart.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(removeFromCart.rejected, (state) => {
        state.actionLoading = false;
      });
  },
});

export const { clearCartState } = cartSlice.actions;
export default cartSlice.reducer;
