import React from "react";

// ==========================================================
// Insight Card
// ==========================================================

const InsightCard = ({
  title,
  color,
  products = [],
}) => {
  return (
    <div
      className="
        bg-white
        rounded-xl
        shadow-sm
        border
        border-gray-200
        overflow-hidden
        h-[250px]
        flex
        flex-col
      "
    >
      {/* Header */}

      <div
        className={`
          px-5
          py-4
          text-white
          font-semibold
          ${color}
        `}
      >
        {title}
      </div>

      {/* Content */}

      <div className="p-4 flex-1 overflow-y-auto">
        {products.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500">
              No products found
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <div
                key={product.product_id}
                className="
                  border
                  border-gray-100
                  rounded-lg
                  p-3
                  hover:bg-gray-50
                  transition
                "
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-800">
                    {product.product_name}
                  </h4>

                  <span className="text-sm font-semibold text-gray-700">
                    {product.current_stock}
                  </span>
                </div>

                <div className="mt-2 flex justify-between text-xs text-gray-500">
                  <span>
                    Current Stock
                  </span>

                  <span>
                    Reorder Level:{" "}
                    {product.reorder_level}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================================
// Loading Skeleton
// ==========================================================

const SkeletonCard = () => {
  return (
    <div
      className="
        bg-white
        rounded-xl
        shadow-sm
        border
        border-gray-200
        overflow-hidden
      "
    >
      <div className="h-14 bg-gray-200 animate-pulse" />

      <div className="p-4 space-y-3">
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
    </div>
  );
};

// ==========================================================
// Inventory Insight
// ==========================================================

const InventoryInsight = ({
  insights,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <section>
      {/* Title */}

      <div className="mb-5">
        <h2 className="text-2xl font-bold text-gray-800">
          AI Insights
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Smart inventory monitoring
          based on stock levels
        </p>
      </div>

      {/* Insight Cards */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Critical */}

        <InsightCard
          title="Critical"
          color="bg-red-600"
          products={
            insights?.critical || []
          }
        />

        {/* Moderate */}

        <InsightCard
          title="Moderate"
          color="bg-yellow-500"
          products={
            insights?.moderate || []
          }
        />

        {/* Healthy */}

        <InsightCard
          title="Healthy"
          color="bg-green-600"
          products={
            insights?.healthy || []
          }
        />
      </div>
    </section>
  );
};

export default InventoryInsight;