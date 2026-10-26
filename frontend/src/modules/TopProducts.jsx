import React from "react";

// ==========================================================
// Single Product Row
// ==========================================================

const ProductRow = ({ product, rank }) => {
  const rankColors = {
    1: "bg-yellow-500 text-white",
    2: "bg-gray-400 text-white",
    3: "bg-orange-500 text-white",
  };

  return (
    <div
      className="
        flex
        items-center
        justify-between
        p-3
        rounded-lg
        border
        border-gray-100
        hover:bg-gray-50
        transition
      "
    >
      {/* Rank Badge */}

      <div className="flex items-center gap-3">
        <div
          className={`
            w-8
            h-8
            flex
            items-center
            justify-center
            rounded-full
            text-sm
            font-bold
            ${
              rankColors[rank] ||
              "bg-blue-500 text-white"
            }
          `}
        >
          {rank}
        </div>

        {/* Product Name */}

        <div>
          <h4 className="font-medium text-gray-800">
            {product.product_name}
          </h4>

          <p className="text-xs text-gray-500">
            Product ID: {product.product_id}
          </p>
        </div>
      </div>

      {/* Quantity Sold */}

      <div className="text-right">
        <p className="text-lg font-bold text-gray-800">
          {product.quantity_sold}
        </p>

        <p className="text-xs text-gray-500">
          Sold
        </p>
      </div>
    </div>
  );
};

// ==========================================================
// Loading Skeleton
// ==========================================================

const Skeleton = () => {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          className="
            h-16
            bg-gray-100
            rounded-lg
            animate-pulse
          "
        />
      ))}
    </div>
  );
};

// ==========================================================
// Top Products Component
// ==========================================================

const TopProducts = ({
  products = [],
  loading = false,
}) => {
  return (
    <section className="bg-white border border-gray-200 rounded-xl shadow-sm">
      {/* Header */}

      <div className="px-5 py-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800">
          Top 5 Most Sold Products
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Last 3 days sales performance
        </p>
      </div>

      {/* Content */}

      <div className="p-4">
        {/* Loading */}

        {loading && <Skeleton />}

        {/* Empty State */}

        {!loading && products.length === 0 && (
          <div className="text-center py-8">
            <h3 className="text-gray-700 font-semibold">
              No Sales Data
            </h3>

            <p className="text-sm text-gray-500 mt-2">
              Sales data will appear here once
              transactions are recorded.
            </p>
          </div>
        )}

        {/* Product List */}

        {!loading &&
          products.length > 0 && (
            <div className="space-y-3">
              {products
                .slice(0, 5)
                .map((product, index) => (
                  <ProductRow
                    key={product.product_id}
                    product={product}
                    rank={index + 1}
                  />
                ))}
            </div>
          )}
      </div>
    </section>
  );
};

export default TopProducts;