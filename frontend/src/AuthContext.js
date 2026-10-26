import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  loginUser,
  getCurrentUser,
} from "./services/api";

// ==========================================================
// Context
// ==========================================================

const AuthContext = createContext(null);

// ==========================================================
// Provider
// ==========================================================

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  // ======================================================
  // Load user on page refresh
  // ======================================================

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    const token = sessionStorage.getItem("access_token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const currentUser = await getCurrentUser();

      setUser(currentUser);

      setIsAuthenticated(true);
    } catch (error) {
      console.error("Authentication failed:", error);

      sessionStorage.removeItem("access_token");
      sessionStorage.removeItem("user");

      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // Login
  // ======================================================

  const login = async (email, password) => {
    const response = await loginUser({
      email,
      password,
    });

    sessionStorage.setItem(
      "access_token",
      response.access_token
    );

    const currentUser = await getCurrentUser();

    sessionStorage.setItem(
      "user",
      JSON.stringify(currentUser)
    );

    setUser(currentUser);

    setIsAuthenticated(true);

    return currentUser;
  };

  // ======================================================
  // Logout
  // ======================================================

  const logout = () => {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("user");

    setUser(null);

    setIsAuthenticated(false);
  };

  // ======================================================
  // Helpers
  // ======================================================

  const isAdmin =
    user?.role_id === 1;

  const isCashier =
    user?.role_id === 2;

  const isCustomer =
    user?.role_id === 3;

  // ======================================================
  // Context Value
  // ======================================================

  const value = {
    user,

    loading,

    isAuthenticated,

    login,

    logout,

    isAdmin,

    isCashier,

    isCustomer,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ==========================================================
// Hook
// ==========================================================

export const useAuth = () => {
  return useContext(AuthContext);
};