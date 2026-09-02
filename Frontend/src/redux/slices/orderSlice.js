import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axiosInstance";
import { fetchCart } from "./cartSlice";

// =============================================================================
// ASYNC THUNKS (API CALLS)
// =============================================================================

// 1. Place Order
export const placeOrder = createAsyncThunk(
  "orders/placeOrder",
  async (orderData, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post("/order/place", orderData);
      // Auto-clear or refresh cart after order is placed
      dispatch(fetchCart());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to place order");
    }
  }
);

// 2. Fetch My Orders (Customer)
export const fetchMyOrders = createAsyncThunk(
  "orders/fetchMyOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/order/my-orders");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch orders");
    }
  }
);

// 3. Cancel Order (Customer)
export const cancelOrder = createAsyncThunk(
  "orders/cancelOrder",
  async (orderId, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.put(`/order/cancel/${orderId}`);
      // Refresh order list
      dispatch(fetchMyOrders());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to cancel order");
    }
  }
);

// 4. Fetch Seller Orders (Seller)
export const fetchSellerOrders = createAsyncThunk(
  "orders/fetchSellerOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/order/seller/orders");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch seller orders");
    }
  }
);

// 5. Update Order Status (Seller)
export const updateOrderStatus = createAsyncThunk(
  "orders/updateOrderStatus",
  async ({ id, status }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.put(`/order/seller/status/${id}`, {
        orderStatus: status,
      });
      // Refresh seller orders
      dispatch(fetchSellerOrders());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update order status");
    }
  }
);

// =============================================================================
// ORDER SLICE
// =============================================================================
const orderSlice = createSlice({
  name: "orders",
  initialState: {
    myOrders: [],
    sellerOrders: [],
    loading: false,
    actionLoading: false,
    error: null,
  },
  reducers: {
    clearOrderState: (state) => {
      state.myOrders = [];
      state.sellerOrders = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // My Orders
    builder
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.myOrders = action.payload.data || [];
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Seller Orders
    builder
      .addCase(fetchSellerOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellerOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.sellerOrders = action.payload.data || [];
      })
      .addCase(fetchSellerOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Place Order Loading
    builder
      .addCase(placeOrder.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(placeOrder.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(placeOrder.rejected, (state) => {
        state.actionLoading = false;
      });
  },
});

export const { clearOrderState } = orderSlice.actions;
export default orderSlice.reducer;
