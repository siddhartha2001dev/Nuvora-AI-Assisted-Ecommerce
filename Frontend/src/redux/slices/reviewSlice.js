import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axiosInstance";

// =============================================================================
// ASYNC THUNKS (API CALLS)
// =============================================================================

// 1. Fetch Product Reviews
export const fetchProductReviews = createAsyncThunk(
  "reviews/fetchProductReviews",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/review/product/${productId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch reviews");
    }
  }
);

// 2. Add Review
export const addReview = createAsyncThunk(
  "reviews/addReview",
  async (reviewData, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post("/review/add", reviewData);
      // Auto-refresh reviews for this product
      if (reviewData.productId) {
        dispatch(fetchProductReviews(reviewData.productId));
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to add review");
    }
  }
);

// =============================================================================
// REVIEW SLICE
// =============================================================================
const reviewSlice = createSlice({
  name: "reviews",
  initialState: {
    reviews: [],
    loading: false,
    actionLoading: false,
    error: null,
  },
  reducers: {
    clearReviews: (state) => {
      state.reviews = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.data || [];
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(addReview.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(addReview.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(addReview.rejected, (state) => {
        state.actionLoading = false;
      });
  },
});

export const { clearReviews } = reviewSlice.actions;
export default reviewSlice.reducer;
