import React from "react";
import {
  FiPlusCircle,
  FiTrash2,
  FiSettings,
} from "react-icons/fi";

const DEFAULT_WIDTH = 100;
const DEFAULT_HEIGHT = 40;

const DEFAULT_PATH_WIDTH = 300;
const DEFAULT_PATH_HEIGHT = 40;

const LayoutSidebar = ({
  availableCategories = [],

  paths = [],

  editorMode,
  setEditorMode,

  selectedCategoryId,
  selectedItem,

  selectedPath,

  onAddCategory,
  onUpdateItem,
  onDeleteItem,

  onAddPath,
  onUpdatePath,
  onDeletePath,
}) => {
  // ==========================================================
  // No Selection
  // ==========================================================

  const renderNoSelection = () => (
    <div className="text-center py-12">
      <FiSettings
        size={40}
        className="mx-auto text-gray-300 mb-3"
      />

      <h3 className="font-semibold text-gray-700">
        No Block Selected
      </h3>

      <p className="text-sm text-gray-500 mt-2">
        Select a category or a walkable path on the layout to edit its properties.
      </p>
    </div>
  );

  // ==========================================================
  // Selected Block Editor
  // ==========================================================

  const renderEditor = () => (
    <div className="space-y-5">
      {/* Category */}

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Category
        </label>

        <div className="mt-2 rounded-xl border px-4 py-3 bg-gray-50 font-medium text-gray-700">
          {selectedItem.category_name}
        </div>
      </div>

      {/* Width */}

      <div>
        <label className="text-sm font-medium text-gray-700">
          Width
        </label>

        <input
          type="number"
          min="30"
          value={selectedItem.width}
          onChange={(e) =>
            onUpdateItem(selectedItem.category_id, {
              width: Number(e.target.value),
            })
          }
          className="mt-2 w-full border rounded-xl px-3 py-2"
        />
      </div>

      {/* Height */}

      <div>
        <label className="text-sm font-medium text-gray-700">
          Height
        </label>

        <input
          type="number"
          min="30"
          value={selectedItem.height}
          onChange={(e) =>
            onUpdateItem(selectedItem.category_id, {
              height: Number(e.target.value),
            })
          }
          className="mt-2 w-full border rounded-xl px-3 py-2"
        />
      </div>

      {/* Rotation */}

      <div>
        <label className="text-sm font-medium text-gray-700">
          Rotation
        </label>

        <div className="relative mt-2">
          <input
            type="number"
            min="0"
            max="360"
            step="1"
            value={selectedItem.rotation}
            onChange={(e) =>
              onUpdateItem(selectedItem.category_id, {
                rotation: Number(e.target.value),
              })
            }
            className="w-full border rounded-xl px-3 py-2 pr-8"
          />

          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
            °
          </span>
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {selectedItem.rotation}°
        </div>
      </div>

      {/* Color */}

      <div>
        <label className="text-sm font-medium text-gray-700">
          Color
        </label>

        <input
          type="color"
          value={selectedItem.color}
          onChange={(e) =>
            onUpdateItem(selectedItem.category_id, {
              color: e.target.value,
            })
          }
          className="mt-2 w-full h-12 border rounded-xl"
        />
      </div>

      {/* Delete */}

      <button
        onClick={() =>
          onDeleteItem(selectedItem.category_id)
        }
        className="
          w-full
          mt-4
          flex
          items-center
          justify-center
          gap-2
          bg-red-600
          hover:bg-red-700
          text-white
          py-3
          rounded-xl
          transition
        "
      >
        <FiTrash2 size={18} />
        Remove From Layout
      </button>
    </div>
  );

  const renderPathEditor = () => (

    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium text-gray-700">
          Path Name
        </label>

        <input
          className="mt-2 w-full border rounded-xl px-3 py-2"
          value={selectedPath.path_name}

          onChange={(e) =>
            onUpdatePath(
              selectedPath.id,

              {

                path_name:
                  e.target.value
              }

            )
          }
        />

      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">
          Width
        </label>

        <input
          type="number"
          min="20"
          value={selectedPath.width}
          onChange={(e) =>
            onUpdatePath(
              selectedPath.id,
              {
                width: Number(e.target.value)
              }
            )
          }
          className="mt-2 w-full border rounded-xl px-3 py-2"
        />

      </div>

      <div>

        <label className="text-sm font-medium text-gray-700">
          Height
        </label>

        <input
          type="number"
          min="20"
          value={selectedPath.height}
          onChange={(e) =>
            onUpdatePath(
              selectedPath.id,
              {
                height: Number(e.target.value)
              }
            )
          }
          className="mt-2 w-full border rounded-xl px-3 py-2"
        />

      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">
          Rotation
        </label>

        <div className="relative mt-2">
          <input
            type="number"
            min="0"
            max="360"
            step="1"
            value={selectedPath.rotation}
            onChange={(e) =>
              onUpdatePath(selectedPath.id, {
                rotation: Number(e.target.value),
              })
            }
            className="w-full border rounded-xl px-3 py-2 pr-8"
          />

          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
            °
          </span>
        </div>

        <div className="text-sm text-gray-500 mt-1">
          {selectedPath.rotation}°
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">
          Color
        </label>

        <input

          type="color"
          value={selectedPath.color}
          onChange={(e) =>
            onUpdatePath(
              selectedPath.id,
              {
                color: e.target.value
              }
            )
          }
          className="mt-2 w-full h-12 border rounded-xl"
        />

      </div>

      <button
        className="
          w-full
          mt-4
          flex
          items-center
          justify-center
          gap-2
          bg-red-600
          hover:bg-red-700
          text-white
          py-3
          rounded-xl
          transition
        "
        onClick={() => onDeletePath(selectedPath.id)}
      >
        <FiTrash2 size={18} />
        Delete Path
      </button>
    </div>
  );

  // ==========================================================
  // Render
  // ==========================================================

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 h-full flex flex-col min-h-0">
      {/* Header */}

      <div className="border-b px-5 py-4 bg-gray-50 shrink-0">
        <h2 className="text-lg font-semibold text-gray-800">
          Layout Controls
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Design your store by placing category and walkable paths.
        </p>
      </div>

      <div className="flex gap-2">

        <button
          onClick={() => setEditorMode("CATEGORY")}
          className={`
            flex-1
            py-2
            rounded-lg
            ${editorMode === "CATEGORY"
              ? "bg-blue-600 text-white"
              : "bg-gray-100"
            }
        `}
        >
          Categories
        </button>

        <button
          onClick={() => setEditorMode("PATH")}
          className={`
            flex-1
            py-2
            rounded-lg
            ${editorMode === "PATH"
              ? "bg-green-600 text-white"
              : "bg-gray-100"
            }
        `}
        >
          Paths
        </button>
      </div>

      <div className="p-5 space-y-6 flex-1 overflow-y-auto min-h-0">
        {/* ================================================== */}
        {/* Add Category */}
        {/* ================================================== */}
        {editorMode === "CATEGORY" && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">
              Add Category
            </h3>

            {availableCategories.length === 0 ? (
              <div className="text-sm text-gray-500 border rounded-xl p-4 bg-gray-50">
                All categories are already placed
                on the layout.
              </div>
            ) : (
              <div className="space-y-2">
                {availableCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() =>
                      onAddCategory({
                        category_id: category.id,
                        category_name:
                          category.category_name,
                        x: 50,
                        y: 50,
                        width: DEFAULT_WIDTH,
                        height: DEFAULT_HEIGHT,
                        rotation: 0,
                        color: "#3B82F6",
                      })
                    }
                    className="
                    w-full
                    flex
                    items-center
                    justify-between
                    px-4
                    py-3
                    border
                    rounded-xl
                    hover:bg-blue-50
                    transition
                  "
                  >
                    <span className="text-gray-700">
                      {category.category_name}
                    </span>

                    <FiPlusCircle
                      className="text-blue-600"
                      size={18}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {editorMode === "PATH" && (

          <div>
            <h3 className="font-semibold mb-3">
              Walkable Paths
            </h3>

            <button
              className="
                w-full
                flex
                items-center
                justify-center
                gap-2
                bg-green-600
                hover:bg-green-700
                text-white
                rounded-xl
                py-3
                transition
              "
              onClick={() =>
                onAddPath({
                  path_name: `Path ${paths.length + 1}`,
                  x: 100,
                  y: 100,
                  width: DEFAULT_PATH_WIDTH,
                  height: DEFAULT_PATH_HEIGHT,
                  rotation: 0,
                  color: "#E5E7EB",
                })
              }
            >
              <FiPlusCircle size={18} />
              Add Path
            </button>
          </div>
        )}

        {/* ================================================== */}
        {/* Editor */}
        {/* ================================================== */}

        <div>
          <h3 className="font-semibold text-gray-800 mb-4">
            {editorMode === "CATEGORY"
              ? "Category Properties"
              : "Path Properties"}
          </h3>

          {editorMode === "CATEGORY" ? (

            !selectedCategoryId
              ? renderNoSelection()
              : renderEditor()

          ) : (

            !selectedPath
              ? renderNoSelection()
              : renderPathEditor()

          )}
        </div>
      </div>
    </div>
  );
};

export default LayoutSidebar;