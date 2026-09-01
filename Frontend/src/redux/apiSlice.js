import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8000",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("nuvora_token");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Product", "Cart", "Wishlist", "Order", "User", "Review"],
  endpoints: (builder) => ({
    // 1. User & Auth
    login: builder.mutation({
      query: (body) => ({ url: "/user/login", method: "POST", body }),
      invalidatesTags: ["User", "Cart", "Wishlist", "Order"],
    }),
    register: builder.mutation({
      query: (body) => ({ url: "/user/register", method: "POST", body }),
    }),
    verifyEmail: builder.mutation({
      query: (token) => ({
        url: `/user/verify-email?token=${token}`,
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),
    logout: builder.mutation({
      query: () => ({ url: "/user/logout", method: "DELETE" }),
      invalidatesTags: ["User", "Cart", "Wishlist"],
    }),
    getProfile: builder.query({
      query: () => "/user/profile",
      providesTags: ["User"],
    }),
    updateProfile: builder.mutation({
      query: (body) => ({ url: "/user/profile", method: "PUT", body }),
      invalidatesTags: ["User"],
    }),
    uploadProfilePicture: builder.mutation({
      query: (formData) => ({
        url: "/user/profile/picture",
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),
    changePassword: builder.mutation({
      query: (body) => ({ url: "/user/change-password", method: "PUT", body }),
    }),
    forgotPassword: builder.mutation({
      query: (body) => ({ url: "/user/forgot-password", method: "POST", body }),
    }),
    resetPassword: builder.mutation({
      query: (body) => ({ url: "/user/reset-password", method: "POST", body }),
    }),

    // 2. Products
    getProducts: builder.query({
      query: () => "/product/all",
      providesTags: ["Product"],
    }),
    getPaginatedProducts: builder.query({
      query: ({ page = 1, limit = 9, category = "", search = "", maxPrice = "", sortBy = "" } = {}) => {
        let url = `/product/paginate?page=${page}&limit=${limit}`;
        if (category && category !== "All") url += `&category=${encodeURIComponent(category)}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (maxPrice) url += `&maxPrice=${maxPrice}`;
        if (sortBy) url += `&sortBy=${encodeURIComponent(sortBy)}`;
        return url;
      },
      providesTags: ["Product"],
    }),
    getProductDetails: builder.query({
      query: (id) => `/product/${id}`,
      providesTags: ["Product"],
    }),
    getProductAiSummary: builder.query({
      query: (id) => `/product/${id}/ai-summary`,
    }),
    createProduct: builder.mutation({
      query: (formData) => ({
        url: "/product/create",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Product"],
    }),
    updateProduct: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/product/update/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Product"],
    }),
    getSellerProducts: builder.query({
      query: () => "/product/seller/my-products",
      providesTags: ["Product"],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({ url: `/product/delete/${id}`, method: "DELETE" }),
      invalidatesTags: ["Product"],
    }),

    // 3. Cart
    getCart: builder.query({
      query: () => "/cart/my-cart",
      providesTags: ["Cart"],
    }),
    addToCart: builder.mutation({
      query: (body) => ({ url: "/cart/add", method: "POST", body }),
      invalidatesTags: ["Cart"],
    }),
    removeFromCart: builder.mutation({
      query: (id) => ({ url: `/cart/remove/${id}`, method: "DELETE" }),
      invalidatesTags: ["Cart"],
    }),

    // 4. Wishlist
    getWishlist: builder.query({
      query: () => "/wishlist/my-wishlist",
      providesTags: ["Wishlist"],
    }),
    addToWishlist: builder.mutation({
      query: (body) => ({ url: "/wishlist/add", method: "POST", body }),
      invalidatesTags: ["Wishlist"],
    }),
    removeFromWishlist: builder.mutation({
      query: (id) => ({ url: `/wishlist/remove/${id}`, method: "DELETE" }),
      invalidatesTags: ["Wishlist"],
    }),

    // 5. Orders
    placeOrder: builder.mutation({
      query: (body) => ({ url: "/order/place", method: "POST", body }),
      invalidatesTags: ["Order", "Cart", "Product"],
    }),
    getMyOrders: builder.query({
      query: () => "/order/my-orders",
      providesTags: ["Order"],
    }),
    cancelOrder: builder.mutation({
      query: (id) => ({ url: `/order/cancel/${id}`, method: "PUT" }),
      invalidatesTags: ["Order", "Product"],
    }),
    getSellerOrders: builder.query({
      query: () => "/order/seller/orders",
      providesTags: ["Order"],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/order/seller/status/${id}`,
        method: "PUT",
        body: { orderStatus: status },
      }),
      invalidatesTags: ["Order"],
    }),

    // 6. Reviews
    getProductReviews: builder.query({
      query: (productId) => `/review/product/${productId}`,
      providesTags: ["Review"],
    }),
    addReview: builder.mutation({
      query: (body) => ({ url: "/review/add", method: "POST", body }),
      invalidatesTags: ["Review", "Product"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyEmailMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadProfilePictureMutation,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetProductsQuery,
  useGetPaginatedProductsQuery,
  useGetProductDetailsQuery,
  useGetProductAiSummaryQuery,
  useLazyGetProductAiSummaryQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useGetSellerProductsQuery,
  useDeleteProductMutation,
  useGetCartQuery,
  useAddToCartMutation,
  useRemoveFromCartMutation,
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  usePlaceOrderMutation,
  useGetMyOrdersQuery,
  useCancelOrderMutation,
  useGetSellerOrdersQuery,
  useUpdateOrderStatusMutation,
  useGetProductReviewsQuery,
  useAddReviewMutation,
} = apiSlice;
