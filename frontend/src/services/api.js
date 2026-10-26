import axios from "axios";

// ==========================================================
// API CONFIGURATION
// ==========================================================

const API_BASE_URL =
  process.env.REACT_APP_API_URL;

// ==========================================================
// AXIOS INSTANCE
// ==========================================================

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ==========================================================
// REQUEST INTERCEPTOR
// Automatically attach JWT token
// ==========================================================

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================================================
// RESPONSE INTERCEPTOR
// Handle expired / invalid token
// ==========================================================

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem("access_token");
      sessionStorage.removeItem("user");

      // Prevent redirect loop if already on login page
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

// ==========================================================
// AUTH APIs
// ==========================================================

export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const getRoles = async () => {
  const response = await api.get("/auth/roles");
  return response.data;
};

// ==========================================================
// ADMIN DASHBOARD
// ==========================================================

export const getDashboard = async () => {
  const response = await api.get("/admin/dashboard");
  return response.data;
};

export const getCategoryDetails = async (
  categoryId
) => {
  const response = await api.get(
    `/admin/category-details/${categoryId}`
  );

  return response.data;
};


// ==========================================================
// CATEGORY
// ==========================================================

export const getCategories = async () => {
  const response = await api.get(
    "/admin/categories"
  );

  return response.data;
};

export const createCategory = async (
  payload
) => {
  const response = await api.post(
    "/admin/categories",
    payload
  );

  return response.data;
};


// ==========================================================
// PRODUCT
// ==========================================================

export const getProducts = async () => {
  const response = await api.get(
    "/admin/products"
  );

  return response.data;
};

export const createProduct = async (
  payload
) => {
  const response = await api.post(
    "/admin/products",
    payload
  );

  return response.data;
};

// ==========================================================
// INSIGHTS
// ==========================================================

export const getInsights = async () => {
  const response = await api.get(
    "/admin/insights"
  );

  return response.data;
};

export const getTopProducts = async () => {
  const response = await api.get(
    "/admin/top-products"
  );

  return response.data;
};


// ==========================================================
// CASHIER / POS
// ==========================================================

export const searchCashierProducts = async (
  search = ""
) => {
  const response = await api.get(
    "/cashier/products/search",
    {
      params: {
        search: search || undefined,
      },
    }
  );

  return response.data;
};

export const getCashierProduct = async (
  productId
) => {
  const response = await api.get(
    `/cashier/products/${productId}`
  );

  return response.data;
};

export const checkoutSale = async (
  payload
) => {
  const response = await api.post(
    "/cashier/checkout",
    payload
  );

  return response.data;
};

export const getCashierSales = async (
  limit = 100
) => {
  const response = await api.get(
    "/cashier/sales",
    {
      params: { limit },
    }
  );

  return response.data;
};

export const getSaleDetails = async (
  saleId
) => {
  const response = await api.get(
    `/cashier/sales/${saleId}`
  );

  return response.data;
};

export const getReceipt = async (
  saleId
) => {
  const response = await api.get(
    `/cashier/receipt/${saleId}`
  );

  return response.data;
};

export const stockIn = async (payload) => {
  const response = await api.post(
    "/cashier/stock-in",
    payload
  );

  return response.data;
};

// ==========================================================
// EXPORT AXIOS INSTANCE
// ==========================================================

export default api;