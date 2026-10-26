import { useEffect, useState } from "react";
import layoutApi from "../services/layoutApi";

const GRID_SIZE = 20;

const getStockColor = (currentStock, reorderLevel) => {
  if (currentStock <= reorderLevel) {
    return "#EF4444"; // Red
  }

  if (currentStock <= reorderLevel * 2) {
    return "#FACC15"; // Yellow
  }

  return "#22C55E"; // Green
};

const getTextColor = (currentStock, reorderLevel) => {
  return currentStock <= reorderLevel * 2
    ? "#111827"
    : "#FFFFFF";
};

const StoreLayoutView = () => {
  // ==========================================================
  // State
  // ==========================================================

  const [layoutItems, setLayoutItems] = useState([]);
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================================
  // Load Layout
  // ==========================================================

  const fetchLayout = async () => {
    try {
      setLoading(true);

      const { layout, paths, } = await layoutApi.getCompleteLayout();

      setLayoutItems(layout || []);
      setPaths(paths || []);

    } catch (error) {
      console.error(
        "Failed to load store layout:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLayout();
  }, []);

  // ==========================================================
  // Loading
  // ==========================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500 font-medium">
          Loading Store Layout...
        </p>
      </div>
    );
  }

  // ==========================================================
  // Empty Layout
  // ==========================================================

  if (
    !layoutItems.length &&
    !paths.length
  ) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-10 text-center">
        <h2 className="text-xl font-semibold text-gray-700">
          No Layout Available
        </h2>

        <p className="text-gray-500 mt-3">
          Store layout has not been configured yet.
        </p>
      </div>
    );
  }

  // ==========================================================
  // Render
  // ==========================================================

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
      {/* ==================================================== */}
      {/* Header */}
      {/* ==================================================== */}

      {/* <div className="border-b bg-gray-50 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Store Layout
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Browse store sections and product categories.
        </p>
      </div> */}

      {/* ==================================================== */}
      {/* Canvas */}
      {/* ==================================================== */}

      <div
        className="relative w-full h-[650px] overflow-auto"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
          `,
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
        }}
      >
        {/* ========================================== */}
        {/* Paths */}
        {/* ========================================== */}

        {paths.map((path) => {

          const isVertical =
            path.rotation % 180 !== 0;

          const displayWidth =
            isVertical ? path.height : path.width;

          const displayHeight =
            isVertical ? path.width : path.height;

          return (
            <div
              key={path.id}
              className="absolute overflow-hidden"
              style={{
                left: path.x,
                top: path.y,
                transformOrigin: "top left",

                width: displayWidth,
                height: displayHeight,

                backgroundColor: "transparent",
                border: "1px solid #94A3B8",

                borderRadius: "4px",

                zIndex: 1,
              }}
            >
              {/* Road markings */}
              <div
                style={
                  isVertical
                    ? {
                      position: "absolute",
                      left: "50%",
                      top: 0,
                      bottom: 0,
                      width: "8px",
                      transform: "translateX(-50%)",

                      backgroundImage:
                        "repeating-linear-gradient(to bottom, #94A3B8 0px, #94A3B8 28px, transparent 28px, transparent 48px)",

                      backgroundRepeat: "repeat-y",
                    }
                    : {
                      position: "absolute",
                      top: "50%",
                      left: 0,
                      right: 0,
                      height: "8px",
                      transform: "translateY(-50%)",

                      backgroundImage:
                        "repeating-linear-gradient(to right, #94A3B8 0px, #94A3B8 28px, transparent 28px, transparent 48px)",

                      backgroundRepeat: "repeat-x",
                    }
                }
              />

              <span
                className="
    absolute
    inset-0
    flex
    items-center
    justify-center
    text-xs
    font-medium
    text-gray-900
    pointer-events-none
    select-none
    text-center
  "
              >
                {path.path_name}
              </span>
            </div>
          );
        })}

        {layoutItems.map((item) => {
          const products = item.products || [];

          const productCount = products.length;

          let fontSize = "10px";
          let padding = "4px";

          if (productCount > 6) {
            fontSize = "9px";
            padding = "2px";
          }

          if (productCount > 10) {
            fontSize = "8px";
            padding = "1px";
          }

          if (productCount > 16) {
            fontSize = "7px";
            padding = "1px";
          }

          const columns =
            products.length <= 1
              ? 1
              : products.length <= 4
                ? 2
                : 3;

          return (
            <div
              key={item.category_id}
              className="absolute"
              style={{
                left: item.x,
                top: item.y,
                width: item.width,
                height: item.height,
                transform: `rotate(${item.rotation}deg)`,
                transformOrigin: "top left",
                zIndex: 10,
              }}
            >
              {/* Category Name */}
              <div
                className="
                absolute
                -top-5
                left-0
                w-full
                text-center
                text-xs
                font-bold
                text-gray-800
                pointer-events-none
              "
              >
                {item.category_name}
              </div>

              {/* Shelf */}
              <div className="w-full h-full rounded-xl border-2 border-black shadow-md overflow-hidden bg-white"
              >
                <div
                  className="grid w-full h-full"
                  style={{
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    gridAutoRows: "1fr",
                  }}
                >
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="
                        border
                        border-gray-600 
                        flex
                        flex-col
                        items-center
                        justify-center
                        font-medium
                        text-center
                      "
                      style={{
                        backgroundColor: getStockColor(
                          product.current_stock,
                          product.reorder_level
                        ),
                        color: getTextColor(
                          product.current_stock,
                          product.reorder_level
                        ),
                        fontSize,
                        padding,
                      }}
                    >
                      <div className="font-semibold text-[8px] leading-none">
                        {product.product_name}({product.current_stock})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ==================================================== */}
      {/* Stock Level Legend */}
      {/* ==================================================== */}

      <div className="border-t bg-gray-50 px-6 py-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Stock Level Legend
        </h3>

        <div className="flex flex-wrap gap-6">

          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded border border-gray-300"
              style={{ backgroundColor: "#22C55E" }}
            />
            <span className="text-sm text-gray-700">
              Good Stock
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded border border-gray-300"
              style={{ backgroundColor: "#FACC15" }}
            />
            <span className="text-sm text-gray-700">
              Medium Stock
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded border border-gray-300"
              style={{ backgroundColor: "#EF4444" }}
            />
            <span className="text-sm text-gray-700">
              Low Stock (Reorder Required)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded border border-gray-300"
              style={{ backgroundColor: "#ffffff" }}
            />
            <span className="text-sm text-gray-700">
              No Products in Category
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreLayoutView;