import "./App.css";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { useAuth } from "./AuthContext";

import Login from "./pages/Login";
import SignUp from "./pages/SignUp";

import AdminDashboard from "./pages/AdminDashboard";
import CashierDashboard from "./pages/CashierDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";


// ==========================================================
// Protected Route
// ==========================================================

const ProtectedRoute = ({ children, allowedRoles }) => {
  const {
    loading,
    isAuthenticated,
    user,
  } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Role based authorization
  if (
    allowedRoles &&
    !allowedRoles.includes(user.role.role_name)
  ) {
    return <Navigate to="/" replace />;
  }

  return children;
};


// ==========================================================
// Redirect Logged In Users
// ==========================================================

const PublicRoute = ({ children }) => {
  const {
    loading,
    isAuthenticated,
    user,
  } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
        Loading...
      </div>
    );
  }

  if (isAuthenticated) {
    switch (user.role.role_name) {
      case "ADMIN":
        return <Navigate to="/admin" replace />;

      case "CASHIER":
        return <Navigate to="/cashier" replace />;

      case "CUSTOMER":
        return <Navigate to="/customer" replace />;

      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};


// ==========================================================
// App
// ==========================================================

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Login */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Optional Signup */}
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          }
        />

        {/* ========================= */}
        {/* Admin */}
        {/* ========================= */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute
              allowedRoles={["ADMIN"]}
            >
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ========================= */}
        {/* Cashier */}
        {/* ========================= */}

        <Route
          path="/cashier"
          element={
            <ProtectedRoute
              allowedRoles={["CASHIER"]}
            >
              <CashierDashboard />
            </ProtectedRoute>
          }
        />

        {/* ========================= */}
        {/* Customer */}
        {/* ========================= */}

        <Route
          path="/customer"
          element={
            <ProtectedRoute
              allowedRoles={["CUSTOMER"]}
            >
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Unknown Routes */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;
