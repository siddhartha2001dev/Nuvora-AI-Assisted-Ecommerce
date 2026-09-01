import { createSlice } from "@reduxjs/toolkit";

let savedUser = null;
try {
  savedUser = localStorage.getItem("nuvora_user")
    ? JSON.parse(localStorage.getItem("nuvora_user"))
    : null;
} catch {
  savedUser = null;
}

const savedToken = localStorage.getItem("nuvora_token") || null;

const initialState = {
  user: savedUser,
  token: savedToken,
  isAuthenticated: !!savedToken,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const user = action.payload.data || action.payload.user;
      const token = action.payload.accessToken || action.payload.token;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      if (user) localStorage.setItem("nuvora_user", JSON.stringify(user));
      if (token) localStorage.setItem("nuvora_token", token);
    },
    logoutUser: (state) => {
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
});

export const { setCredentials, logoutUser, updateUserData } = authSlice.actions;
export default authSlice.reducer;
