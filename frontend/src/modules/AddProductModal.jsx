import React, { useEffect, useState } from "react";

// ==========================================================
// Add Product Modal
// ==========================================================

const AddProductModal = ({
    isOpen,
    onClose,
    onSubmit,
    categories = [],
    loading = false,
}) => {
    // ========================================================
    // Form State
    // ========================================================

    const [form, setForm] = useState({
        category_id: "",
        product_name: "",
        sku: "",
        selling_price: "",
        cost_price: "",
        current_stock: 0,
        reorder_level: 10,
    });

    const [error, setError] = useState("");

    // ========================================================
    // Reset when modal opens
    // ========================================================

    useEffect(() => {
        if (isOpen) {
            setForm({
                category_id: "",
                product_name: "",
                sku: "",
                selling_price: "",
                cost_price: "",
                current_stock: 0,
                reorder_level: 10,
            });
            setError("");
        }
    }, [isOpen]);

    // ========================================================
    // Handle Input Change
    // ========================================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm({
            ...form,
            [name]:
                name === "category_id" ||
                    name === "current_stock" ||
                    name === "reorder_level"
                    ? Number(value)
                    : value,
        });
    };

    // ========================================================
    // Validation
    // ========================================================

    const validate = () => {
        if (!form.category_id) {
            setError("Category is required");
            return false;
        }

        if (!form.product_name.trim()) {
            setError("Product name is required");
            return false;
        }

        if (!form.selling_price || form.selling_price <= 0) {
            setError("Selling price must be greater than 0");
            return false;
        }

        if (form.cost_price && form.cost_price < 0) {
            setError("Cost price cannot be negative");
            return false;
        }

        if (form.current_stock < 0) {
            setError("Stock cannot be negative");
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
                category_id: form.category_id,
                product_name: form.product_name.trim(),
                sku: form.sku.trim() || null,
                selling_price: Number(form.selling_price),
                cost_price: form.cost_price
                    ? Number(form.cost_price)
                    : null,
                current_stock: Number(form.current_stock),
                reorder_level: Number(form.reorder_level),
            });

            onClose?.();
        } catch (err) {
            console.error(err);
            setError(
                "Failed to create product. Try again."
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
          max-w-2xl
          rounded-2xl
          shadow-xl
          overflow-hidden
        "
                onClick={(e) => e.stopPropagation()}
            >
                {/* ================= HEADER ================= */}

                <div className="px-6 py-4 border-b">
                    <h2 className="text-lg font-bold text-gray-800">
                        Add New Product
                    </h2>

                    <p className="text-sm text-gray-500">
                        Create and manage inventory item
                    </p>
                </div>

                {/* ================= FORM ================= */}

                <form
                    onSubmit={handleSubmit}
                    className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                    {/* Category */}

                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-700">
                            Category *
                        </label>

                        <select
                            name="category_id"
                            value={form.category_id}
                            onChange={handleChange}
                            className="
                w-full mt-1 px-4 py-2
                border rounded-lg
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
              "
                        >
                            <option value="">
                                Select Category
                            </option>

                            {categories.map((cat) => (
                                <option
                                    key={cat.category_id}
                                    value={cat.category_id}
                                >
                                    {cat.category_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Product Name */}

                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Product Name *
                        </label>

                        <input
                            type="text"
                            name="product_name"
                            value={form.product_name}
                            onChange={handleChange}
                            className="
                w-full mt-1 px-4 py-2
                border rounded-lg
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
              "
                        />
                    </div>

                    {/* SKU */}

                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            SKU
                        </label>

                        <input
                            type="text"
                            name="sku"
                            value={form.sku}
                            onChange={handleChange}
                            className="
                w-full mt-1 px-4 py-2
                border rounded-lg
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
              "
                        />
                    </div>

                    {/* Selling Price */}

                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Selling Price *
                        </label>

                        <input
                            type="number"
                            name="selling_price"
                            value={form.selling_price}
                            onChange={handleChange}
                            className="
                w-full mt-1 px-4 py-2
                border rounded-lg
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
              "
                        />
                    </div>

                    {/* Cost Price */}

                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Cost Price
                        </label>

                        <input
                            type="number"
                            name="cost_price"
                            value={form.cost_price}
                            onChange={handleChange}
                            className="
                w-full mt-1 px-4 py-2
                border rounded-lg
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
              "
                        />
                    </div>

                    {/* Stock */}

                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Initial Stock
                        </label>

                        <input
                            type="number"
                            name="current_stock"
                            value={form.current_stock}
                            onChange={handleChange}
                            className="
                w-full mt-1 px-4 py-2
                border rounded-lg
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
              "
                        />
                    </div>

                    {/* Reorder Level */}

                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Reorder Level
                        </label>

                        <input
                            type="number"
                            name="reorder_level"
                            value={form.reorder_level}
                            onChange={handleChange}
                            className="
                w-full mt-1 px-4 py-2
                border rounded-lg
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
              "
                        />
                    </div>

                    {/* Error */}

                    {error && (
                        <div className="md:col-span-2 text-sm text-red-500">
                            {error}
                        </div>
                    )}

                    {/* Buttons */}

                    <div className="md:col-span-2 flex justify-end gap-3 pt-2">
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
                bg-green-600
                hover:bg-green-700
                text-white
                disabled:opacity-50
              "
                        >
                            {loading
                                ? "Creating..."
                                : "Create Product"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProductModal;