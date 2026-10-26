import React, { useState, useEffect } from "react";

// ==========================================================
// Add Category Modal
// ==========================================================

const AddCategoryModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}) => {
  // ========================================================
  // Form State
  // ========================================================

  const [form, setForm] = useState({
    category_name: "",
    description: "",
  });

  const [error, setError] = useState("");

  // ========================================================
  // Reset form when modal opens/closes
  // ========================================================

  useEffect(() => {
    if (isOpen) {
      setForm({
        category_name: "",
        description: "",
      });
      setError("");
    }
  }, [isOpen]);

  // ========================================================
  // Handle Input Change
  // ========================================================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ========================================================
  // Validation
  // ========================================================

  const validate = () => {
    if (!form.category_name.trim()) {
      setError("Category name is required");
      return false;
    }

    if (
      form.category_name.trim().length < 2
    ) {
      setError(
        "Category name must be at least 2 characters"
      );
      return false;
    }

    return true;
  };

  // ========================================================
  // Submit Handler
  // ========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await onSubmit?.({
        category_name: form.category_name.trim(),
        description: form.description.trim(),
      });

      onClose?.();
    } catch (err) {
      console.error(err);
      setError(
        "Failed to create category. Try again."
      );
    }
  };

  // ========================================================
  // Not Open
  // ========================================================

  if (!isOpen) return null;

  // ========================================================
  // UI
  // ========================================================

  return (
    <div
      className="
        fixed inset-0 z-50
        bg-black/50
        flex items-center justify-center
        px-4
      "
      onClick={onClose}
    >
      <div
        className="
          bg-white
          w-full
          max-w-md
          rounded-2xl
          shadow-xl
          overflow-hidden
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= HEADER ================= */}

        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">
            Add New Category
          </h2>

          <p className="text-sm text-gray-500">
            Create a new product category
          </p>
        </div>

        {/* ================= FORM ================= */}

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4"
        >
          {/* Category Name */}

          <div>
            <label className="text-sm font-medium text-gray-700">
              Category Name *
            </label>

            <input
              type="text"
              name="category_name"
              value={form.category_name}
              onChange={handleChange}
              placeholder="e.g. Soap, Shampoo"
              className="
                w-full mt-1 px-4 py-2
                border rounded-lg
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            />
          </div>

          {/* Description */}

          <div>
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Optional description"
              rows={3}
              className="
                w-full mt-1 px-4 py-2
                border rounded-lg
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            />
          </div>

          {/* Error Message */}

          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          {/* Buttons */}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="
                px-4 py-2
                rounded-lg
                bg-gray-100
                hover:bg-gray-200
                text-gray-700
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="
                px-4 py-2
                rounded-lg
                bg-blue-600
                hover:bg-blue-700
                text-white
                disabled:opacity-50
              "
            >
              {loading
                ? "Creating..."
                : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;