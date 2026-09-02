import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axiosInstance";

// Load initial user state from localStorage
let savedUser = null;
try {
  savedUser = localStorage.getItem("nuvora_user")
    ? JSON.parse(localStorage.getItem("nuvora_user"))
    : null;
} catch {
  savedUser = null;
}

const savedToken = localStorage.getItem("nuvora_token") || null;

// =============================================================================
// ASYNC THUNKS (API CALLS)
// =============================================================================

// 1. User Login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post("/user/login", credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

// 2. User Register
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post("/user/register", userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Registration failed");
    }
  }
);

// 3. Verify Email
export const verifyEmailThunk = createAsyncThunk(
  "auth/verifyEmail",
  async (token, { rejectWithValue }) => {
    try {
      const response = await api.post(`/user/verify-email?token=${token}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Email verification failed");
    }
  }
);

// 4. Fetch User Profile
export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/user/profile");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch profile");
    }
  }
);

// 5. Update Profile
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.put("/user/profile", profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update profile");
    }
  }
);

// 6. Upload Profile Picture
export const uploadProfilePicture = createAsyncThunk(
  "auth/uploadProfilePicture",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.put("/user/profile/picture", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to upload picture");
    }
  }
);

// 7. Change Password
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (passwords, { rejectWithValue }) => {
    try {
      const response = await api.put("/user/change-password", passwords);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to change password");
    }
  }
);

// 8. Forgot Password
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (emailData, { rejectWithValue }) => {
    try {
      const response = await api.post("/user/forgot-password", emailData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to send reset link");
    }
  }
);

// 9. Reset Password
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (resetData, { rejectWithValue }) => {
    try {
      const response = await api.post("/user/reset-password", resetData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to reset password");
    }
  }
);

// 10. Logout User
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await api.delete("/user/logout");
      return true;
    } catch (error) {
      return true; // Still clear local session even if backend logout fails
    }
  }
);

// =============================================================================
// AUTH SLICE
// =============================================================================
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: savedUser,
    token: savedToken,
    isAuthenticated: !!savedToken,
    loading: false,
    error: null,
  },
  reducers: {
    // Manual state updater if needed
    setCredentials: (state, action) => {
      const user = action.payload.data || action.payload.user;
      const token = action.payload.accessToken || action.payload.token;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      if (user) localStorage.setItem("nuvora_user", JSON.stringify(user));
      if (token) localStorage.setItem("nuvora_token", token);
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("nuvora_user");
      localStorage.removeItem("nuvora_token");
    },
    updateUserData: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("nuvora_user", JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        const user = action.payload.data || action.payload.user;
        const token = action.payload.accessToken || action.payload.token;
        state.user = user;
        state.token = token;
        state.isAuthenticated = true;
        if (user) localStorage.setItem("nuvora_user", JSON.stringify(user));
        if (token) localStorage.setItem("nuvora_token", token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Profile Fetch
    builder.addCase(fetchProfile.fulfilled, (state, action) => {
      const user = action.payload.data || action.payload;
      state.user = user;
      localStorage.setItem("nuvora_user", JSON.stringify(user));
    });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("nuvora_user");
      localStorage.removeItem("nuvora_token");
    });
  },
});

export const { setCredentials, clearAuth, updateUserData } = authSlice.actions;
export default authSlice.reducer;
