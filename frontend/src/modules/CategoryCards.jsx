import React from "react";

// ==========================================================
// Category Cards
// ==========================================================

const CategoryCards = ({
    categories = [],
    onCategoryClick,
    loading = false,
}) => {
    // ========================================================
    // Loading State
    // ========================================================

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[...Array(6)].map((_, index) => (
                    <div
                        key={index}
                        className="animate-pulse bg-white rounded-xl shadow-md p-5 border border-gray-200"
                    >
                        <div className="h-5 w-32 bg-gray-200 rounded mb-4"></div>

                        <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>

                        <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    // ========================================================
    // Empty State
    // ========================================================

    if (!categories.length) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
                <h3 className="text-lg font-semibold text-gray-700">
                    No Categories Found
                </h3>

                <p className="text-gray-500 mt-2">
                    Start by creating your first category.
                </p>
            </div>
        );
    }

    // ========================================================
    // Render
    // ========================================================

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {categories.map((category) => (
                <button
                    key={category.category_id}
                    type="button"
                    onClick={() =>
                        onCategoryClick?.(category.category_id)
                    }
                    className="
            bg-white
            rounded-xl
            border
            border-gray-200
            shadow-sm
            hover:shadow-lg
            hover:border-blue-400
            transition-all
            duration-200
            text-left
            p-5
            group
          "
                >
                    {/* Category Name */}

                    <h3
                        className="
              text-lg
              font-bold
              text-gray-800
              group-hover:text-blue-600
              transition-colors
            "
                    >
                        {category.category_name}
                    </h3>

                    {/* Divider */}

                    <div className="my-4 border-t border-gray-100"></div>

                    {/* Total Products */}

                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">
                            Total Products
                        </span>

                        <span className="font-semibold text-gray-700">
                            {category.total_products}
                        </span>
                    </div>

                    {/* Total Stock */}

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                            Total Stock
                        </span>

                        <span className="text-green-600">
                            <span className="font-semibold">{category.total_stock}</span> Units left
                        </span>
                    </div>

                    {/* View Details */}

                    <div className="mt-5 text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        View Details →
                    </div>
                </button>
            ))}
        </div>
    );
};

export default CategoryCards;