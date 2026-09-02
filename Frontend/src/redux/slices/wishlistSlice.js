import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axiosInstance";

// =============================================================================
// ASYNC THUNKS (API CALLS)
// =============================================================================

// 1. Fetch Wishlist
export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/wishlist/my-wishlist");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch wishlist");
    }
  }
);

// 2. Add to Wishlist
export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async (wishlistData, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post("/wishlist/add", wishlistData);
      // Auto-refresh wishlist
      dispatch(fetchWishlist());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to add to wishlist");
    }
  }
);

// 3. Remove from Wishlist
export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async (itemId, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.delete(`/wishlist/remove/${itemId}`);
      // Auto-refresh wishlist
      dispatch(fetchWishlist());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to remove from wishlist");
    }
  }
);

// =============================================================================
// WISHLIST SLICE
// =============================================================================
const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [],
    loading: false,
    actionLoading: false,
    error: null,
  },
  reducers: {
    clearWishlistState: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Wishlist
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data || [];
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add / Remove loading states
    builder
      .addCase(addToWishlist.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(addToWishlist.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(addToWishlist.rejected, (state) => {
        state.actionLoading = false;
      })
      .addCase(removeFromWishlist.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(removeFromWishlist.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(removeFromWishlist.rejected, (state) => {
        state.actionLoading = false;
      });
  },
});

export const { clearWishlistState } = wishlistSlice.actions;
export default wishlistSlice.reducer;
