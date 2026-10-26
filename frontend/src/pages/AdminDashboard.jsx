import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

import { FiMenu, FiPlusCircle, FiBox, FiLogOut, FiX, FiMap } from "react-icons/fi";

import api from "../services/api";

import CategoryCards from "../modules/CategoryCards";
import CategoryModal from "../modules/CategoryModal";
import InventoryInsight from "../modules/InventoryInsight";
import TopProducts from "../modules/TopProducts";
import AddCategoryModal from "../modules/AddCategoryModal";
import AddProductModal from "../modules/AddProductModal";
import StoreLayoutView from "../modules/StoreLayoutView";
import LayoutEditor from "./LayoutEditor";

// ==========================================================
// Admin Dashboard
// ==========================================================

const AdminDashboard = () => {
  // ========================================================
  // State
  // ========================================================

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [layoutRefreshKey, setLayoutRefreshKey] = useState(0);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const [layoutEditorOpen, setLayoutEditorOpen] = useState(false);

  const { logout } = useAuth();

  // ========================================================
  // Fetch Dashboard
  // ========================================================

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const res = await api.get("/admin/dashboard");
      setDashboard(res.data);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // ========================================================
  // Fetch Category Details (Modal)
  // ========================================================

  const handleCategoryClick = async (categoryId) => {
    try {
      setModalOpen(true);
      setModalLoading(true);

      const res = await api.get(
        `/admin/category-details/${categoryId}`
      );

      setSelectedCategory(res.data);
    } catch (error) {
      console.error("Category fetch error:", error);
      setSelectedCategory(null);
    } finally {
      setModalLoading(false);
    }
  };

  // ========================================================
  // Close Modal
  // ========================================================

  const closeModal = () => {
    setModalOpen(false);
    setSelectedCategory(null);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  // ========================================================
  // Refresh after CRUD actions
  // ========================================================

  const handleDataRefresh = async () => {
    await fetchDashboard();
  };

  // ========================================================
  // Loading UI
  // ========================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold text-gray-600">
        Loading Admin Dashboard...
      </div>
    );
  }

  // ========================================================
  // Render
  // ========================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 lg:p-8">

      {/* ================================================= */}
      {/* Header */}
      {/* ================================================= */}

      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Admin Dashboard
          </h1>
        </div>

        {/* Hamburger Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-12 h-12 rounded-xl bg-white shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
          >
            {menuOpen ? (
              <FiX size={22} />
            ) : (
              <FiMenu size={22} />
            )}
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
              <button
                onClick={() => {
                  setAddCategoryOpen(true);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-blue-50 text-gray-700 transition"
              >
                <FiPlusCircle
                  className="text-blue-600"
                  size={18}
                />
                Add Category
              </button>

              <button
                onClick={() => {
                  setAddProductOpen(true);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-green-50 text-gray-700 transition"
              >
                <FiBox
                  className="text-green-600"
                  size={18}
                />
                Add Product
              </button>

              <button
                onClick={() => {
                  setLayoutEditorOpen(true);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-purple-50 text-gray-700 transition"
              >
                <FiMap
                  className="text-purple-600"
                  size={18}
                />
                Design Layout
              </button>

              <div className="border-t" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-red-50 text-red-600 transition"
              >
                <FiLogOut size={18} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 p-8 text-white shadow-xl">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold">
              Welcome back 👋
            </h2>

            <p className="mt-2 text-blue-100">
              Track inventory levels, monitor top-selling
              products, and manage categories efficiently.
            </p>
          </div>

          <div className="absolute right-0 top-0 h-full w-64 bg-white/10 blur-3xl" />
        </div>
      </div>

      {/* ================================================= */}
      {/* STORE LAYOUT */}
      {/* ================================================= */}

      <div className="mb-10">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Store Layout
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Visual arrangement of category locations.
              </p>
            </div>

            <button
              onClick={() =>
                setLayoutEditorOpen(true)
              }
              className="
          px-4 py-2
          bg-indigo-600
          text-white
          rounded-xl
          hover:bg-indigo-700
          transition
        "
            >
              Edit Layout
            </button>
          </div>

          <StoreLayoutView key={layoutRefreshKey} />
        </div>
      </div>

      {/* ================================================= */}
      {/* Category Cards */}
      {/* ================================================= */}

      <div className="mb-10">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <CategoryCards
            categories={dashboard?.cards || []}
            loading={loading}
            onCategoryClick={handleCategoryClick}
          />
        </div>
      </div>

      {/* ================================================= */}
      {/* AI INSIGHTS */}
      {/* ================================================= */}

      <div className="mb-10">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <InventoryInsight
            insights={dashboard?.insights || {}}
            loading={loading}
          />
        </div>
      </div>

      {/* ================================================= */}
      {/* TOP PRODUCTS */}
      {/* ================================================= */}

      <div className="mb-10">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <TopProducts
            products={dashboard?.top_selling || []}
            loading={loading}
          />
        </div>
      </div>

      {/* ================================================= */}
      {/* CATEGORY MODAL */}
      {/* ================================================= */}

      <CategoryModal
        isOpen={modalOpen}
        onClose={closeModal}
        loading={modalLoading}
        categoryData={selectedCategory}
      />

      {/* ================================================= */}
      {/* ADD CATEGORY MODAL */}
      {/* ================================================= */}

      <AddCategoryModal
        isOpen={addCategoryOpen}
        onClose={() => setAddCategoryOpen(false)}
        onSubmit={async (data) => {
          await api.post("/admin/categories", data);
          await handleDataRefresh();
        }}
      />

      {/* ================================================= */}
      {/* ADD PRODUCT MODAL */}
      {/* ================================================= */}

      <AddProductModal
        isOpen={addProductOpen}
        onClose={() => setAddProductOpen(false)}
        categories={dashboard?.cards || []}
        onSubmit={async (data) => {
          await api.post("/admin/products", data);
          await handleDataRefresh();
        }}
      />

      {/* ================================================= */}
      {/* LAYOUT EDITOR */}
      {/* ================================================= */}

      {layoutEditorOpen && (
        <div
          className="
      fixed
      inset-0
      z-[999]
      bg-black/50
      backdrop-blur-sm
      flex
      items-center
      justify-center
      p-4
    "
        >
          <div
            className="
              bg-white
              w-full
              max-w-7xl
              h-[90vh]
              rounded-3xl
              overflow-hidden
              shadow-2xl
              flex
              flex-col
            "
          >
            <div
              className="
          flex
          items-center
          justify-between
          px-6
          py-4
          border-b
        "
            >
              <h2 className="text-xl font-bold">
                Store Layout Designer
              </h2>

              <button
                onClick={() => {
                  setLayoutEditorOpen(false);
                  setLayoutRefreshKey((prev) => prev + 1);
                }}
                className="
                  w-10
                  h-10
                  rounded-xl
                  hover:bg-gray-100
                  flex
                  items-center
                  justify-center
                "
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="flex-1 min-h-0">
              <LayoutEditor />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

