import axios from "axios";

/**
 * Axios instance configuration
 * Centralizes backend URL and automatically attaches the JWT token
 * to the Authorization header for protected requests.
 */
const api = axios.create({
  baseURL: "http://localhost:8000",
});

// Request interceptor: Attach token before sending every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("nuvora_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
