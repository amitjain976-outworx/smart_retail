import React, { useEffect } from "react";

// ==========================================================
// Category Details Modal
// ==========================================================

const CategoryModal = ({
  isOpen,
  onClose,
  loading = false,
  categoryData = null,
}) => {
  // ========================================================
  // Close on Escape Key
  // ========================================================

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    if (isOpen) {
      window.addEventListener(
        "keydown",
        handleEscape
      );
    }

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [isOpen, onClose]);

  // ========================================================
  // Not Open
  // ========================================================

  if (!isOpen) return null;

  // ========================================================
  // Modal
  // ========================================================

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/50
        backdrop-blur-sm
        px-4
      "
      onClick={onClose}
    >
      <div
        className="
          bg-white
          rounded-2xl
          shadow-2xl
          w-full
          max-w-4xl
          max-h-[85vh]
          overflow-hidden
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================================================= */}
        {/* Header */}
        {/* ================================================= */}

        <div
          className="
            flex
            items-center
            justify-between
            px-6
            py-4
            border-b
            border-gray-200
          "
        >
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {categoryData?.category_name ||
                "Category Details"}
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Inventory & Sales Overview
            </p>
          </div>

          <button
            onClick={onClose}
            className="
              w-10
              h-10
              rounded-full
              hover:bg-gray-100
              transition
              text-gray-500
              text-xl
            "
          >
            ×
          </button>
        </div>

        {/* ================================================= */}
        {/* Body */}
        {/* ================================================= */}

        <div className="p-6 overflow-y-auto">
          {/* Loading */}

          {loading && (
            <div className="space-y-3">
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="
                    animate-pulse
                    h-16
                    bg-gray-100
                    rounded-lg
                  "
                />
              ))}
            </div>
          )}

          {/* No Products */}

          {!loading &&
            categoryData &&
            categoryData.products.length === 0 && (
              <div className="text-center py-10">
                <h3 className="text-lg font-semibold text-gray-700">
                  No Products Found
                </h3>

                <p className="text-gray-500 mt-2">
                  This category does not contain
                  any products.
                </p>
              </div>
            )}

          {/* Product Table */}

          {!loading &&
            categoryData &&
            categoryData.products.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr
                      className="
                        bg-gray-50
                        border-b
                        border-gray-200
                      "
                    >
                      <th
                        className="
                          px-4
                          py-3
                          text-left
                          text-sm
                          font-semibold
                          text-gray-600
                        "
                      >
                        Product
                      </th>

                      <th
                        className="
                          px-4
                          py-3
                          text-center
                          text-sm
                          font-semibold
                          text-gray-600
                        "
                      >
                        Current Stock
                      </th>

                      <th
                        className="
                          px-4
                          py-3
                          text-center
                          text-sm
                          font-semibold
                          text-gray-600
                        "
                      >
                        Sold Today
                      </th>

                      <th
                        className="
                          px-4
                          py-3
                          text-center
                          text-sm
                          font-semibold
                          text-gray-600
                        "
                      >
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {categoryData.products.map(
                      (product) => {
                        const stockStatus =
                          product.current_stock <= 5
                            ? {
                                label: "Critical",
                                color:
                                  "bg-red-100 text-red-700",
                              }
                            : product.current_stock <= 20
                            ? {
                                label: "Moderate",
                                color:
                                  "bg-yellow-100 text-yellow-700",
                              }
                            : {
                                label: "Healthy",
                                color:
                                  "bg-green-100 text-green-700",
                              };

                        return (
                          <tr
                            key={product.product_id}
                            className="
                              border-b
                              border-gray-100
                              hover:bg-gray-50
                            "
                          >
                            <td className="px-4 py-4">
                              <span className="font-medium text-gray-800">
                                {
                                  product.product_name
                                }
                              </span>
                            </td>

                            <td className="px-4 py-4 text-center font-semibold text-gray-700">
                              {
                                product.current_stock
                              }
                            </td>

                            <td className="px-4 py-4 text-center font-semibold text-blue-600">
                              {product.sold_today}
                            </td>

                            <td className="px-4 py-4 text-center">
                              <span
                                className={`
                                  px-3
                                  py-1
                                  rounded-full
                                  text-xs
                                  font-semibold
                                  ${stockStatus.color}
                                `}
                              >
                                {
                                  stockStatus.label
                                }
                              </span>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            )}
        </div>

        {/* ================================================= */}
        {/* Footer */}
        {/* ================================================= */}

        <div
          className="
            border-t
            border-gray-200
            px-6
            py-4
            flex
            justify-end
          "
        >
          <button
            onClick={onClose}
            className="
              px-5
              py-2
              bg-gray-100
              hover:bg-gray-200
              rounded-lg
              font-medium
              transition
            "
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;