import { useEffect, useMemo, useState } from "react";
import {
    FiSave,
    FiRotateCcw,
} from "react-icons/fi";

import layoutApi from "../services/layoutApi";
import LayoutCanvas from "../modules/LayoutCanvas";
import LayoutSidebar from "../modules/LayoutSidebar";

const LayoutEditor = () => {

    // ==========================================================
    // State
    // ==========================================================

    const [layoutItems, setLayoutItems] = useState([]);
    const [availableCategories, setAvailableCategories] = useState([]);

    const [selectedCategoryId, setSelectedCategoryId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [paths, setPaths] = useState([]);
    const [selectedPathId, setSelectedPathId] = useState(null);

    const [editorMode, setEditorMode] = useState("CATEGORY");

    // ==========================================================
    // Selected Item
    // ==========================================================

    const selectedItem = useMemo(() => {
        return (
            layoutItems.find(
                (item) =>
                    item.category_id === selectedCategoryId
            ) || null
        );
    }, [layoutItems, selectedCategoryId]);

    const selectedPath = useMemo(() => {

        return (
            paths.find(
                (path) =>
                    path.id === selectedPathId
            ) || null
        );

    }, [paths, selectedPathId]);

    // ==========================================================
    // Load Data
    // ==========================================================

    const loadData = async () => {
        try {
            setLoading(true);

            const [layout, categories, storePaths] =
                await Promise.all([
                    layoutApi.getLayout(),
                    layoutApi.getAvailableCategories(),
                    layoutApi.getPaths(),
                ]);

            setLayoutItems(layout?.items || layout || []);
            setPaths(storePaths || []);
            setAvailableCategories(categories);
        } catch (error) {
            console.error(
                "Failed to load layout data:",
                error
            );

            alert(
                error?.message ||
                "Failed to load layout."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // ==========================================================
    // Add Category
    // ==========================================================

    const handleAddCategory = (category) => {
        setLayoutItems((prev) => [
            ...prev,
            category,
        ]);

        setAvailableCategories((prev) =>
            prev.filter(
                (c) => c.id !== category.category_id
            )
        );

        setSelectedCategoryId(
            category.category_id
        );
    };

    // ==========================================================
    // Update Item
    // ==========================================================

    const handleUpdateItem = (
        categoryId,
        updates
    ) => {
        setLayoutItems((prev) =>
            prev.map((item) =>
                item.category_id === categoryId
                    ? {
                        ...item,
                        ...updates,
                    }
                    : item
            )
        );
    };

    // ==========================================================
    // Drag Position Update
    // ==========================================================

    const handlePositionChange = (
        categoryId,
        position
    ) => {
        handleUpdateItem(
            categoryId,
            position
        );
    };

    // ==========================================================
    // Delete Item
    // ==========================================================

    const handleDeleteItem = (
        categoryId
    ) => {
        const item = layoutItems.find(
            (x) =>
                x.category_id === categoryId
        );

        if (!item) return;

        setLayoutItems((prev) =>
            prev.filter(
                (x) =>
                    x.category_id !== categoryId
            )
        );

        setAvailableCategories((prev) => [
            ...prev,
            {
                id: item.category_id,
                category_name:
                    item.category_name,
            },
        ]);

        setSelectedCategoryId(null);
    };

    const handleAddPath = async (path) => {
        try {
            const res = await layoutApi.createPath({
                path_name: path.path_name,
                x: path.x,
                y: path.y,
                width: path.width,
                height: path.height,
                rotation: path.rotation,
                color: path.color,
            });

            const newPath = {
                ...path,
                id: res.id, // backend must return id
            };

            setPaths((prev) => [...prev, newPath]);
            setSelectedPathId(res.id);

        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdatePath = (pathId, updates) => {
        setPaths(prev =>
            prev.map(path =>
                path.id === pathId
                    ? {
                        ...path,
                        ...updates,
                    }
                    : path
            )
        );
    };

    const handleDeletePath = async (pathId) => {

        try {

            if (!String(pathId).startsWith("temp")) {
                await layoutApi.deletePath(pathId);
            }

            setPaths(prev =>
                prev.filter(path => path.id !== pathId)
            );

            setSelectedPathId(null);

        } catch (error) {
            console.error(error);
        }
    };

    const handlePathPositionChange = (
        pathId,
        position
    ) => {

        handleUpdatePath(
            pathId,
            position
        );

    };

    // ==========================================================
    // Save Layout
    // ==========================================================

    const handleSave = async () => {

        // Validate categories
        for (const item of layoutItems) {
            if (item.width <= 0 || item.height <= 0) {
                alert(
                    `Category "${item.category_name}" must have width and height greater than 0.`
                );
                return;
            }
        }

        // Validate paths
        for (const path of paths) {
            if (path.width <= 0 || path.height <= 0) {
                alert(
                    `Path "${path.path_name}" must have width and height greater than 0.`
                );
                return;
            }
        }
        try {
            setSaving(true);

            const layoutPayload = {
                items: layoutItems.map(item => ({
                    category_id: item.category_id,
                    x: item.x,
                    y: item.y,
                    width: item.width,
                    height: item.height,
                    rotation: item.rotation,
                    color: item.color,
                })),
            };

            // Save categories
            await layoutApi.saveLayout(layoutPayload);

            // Save all paths
            await Promise.all(
                paths.map(path =>
                    layoutApi.updatePath(path.id, {
                        path_name: path.path_name,
                        x: path.x,
                        y: path.y,
                        width: path.width,
                        height: path.height,
                        rotation: path.rotation,
                        color: path.color,
                    })
                )
            );

            alert("Layout saved successfully.");

        } catch (error) {
            console.error(error);

            alert(
                error?.message ||
                "Failed to save layout."
            );

        } finally {
            setSaving(false);
        }
    };

    // ==========================================================
    // Reset Layout
    // ==========================================================

    const handleReset = async () => {
        const confirmReset =
            window.confirm(
                "Reset entire layout?"
            );

        if (!confirmReset) return;

        try {
            await layoutApi.resetLayout();
            await layoutApi.resetPaths();

            await loadData();

            setSelectedCategoryId(null);
        } catch (error) {
            console.error(error);

            alert(
                error?.message ||
                "Failed to reset layout."
            );
        }
    };

    // ==========================================================
    // Loading
    // ==========================================================

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center text-lg font-semibold text-gray-600">
                Loading Layout Editor...
            </div>
        );
    }

    // ==========================================================
    // Render
    // ==========================================================

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            {/* ==================================================== */}
            {/* Header */}
            {/* ==================================================== */}

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Store Layout Designer
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Design your store layout by
                        placing product categories.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleReset}
                        className="
              flex
              items-center
              gap-2
              px-5
              py-3
              rounded-xl
              bg-red-600
              hover:bg-red-700
              text-white
            "
                    >
                        <FiRotateCcw />
                        Reset
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="
                        flex
                        items-center
                        gap-2
                        px-6
                        py-3
                        rounded-xl
                        bg-blue-600
                        hover:bg-blue-700
                        text-white
                        disabled:opacity-60
                        "
                    >
                        <FiSave />

                        {saving
                            ? "Saving..."
                            : "Save Layout"}
                    </button>
                </div>
            </div>

            {/* ==================================================== */}
            {/* Main Grid */}
            {/* ==================================================== */}

            <div
                className="
                    grid
                    grid-cols-12
                    gap-6
                    flex-1
                    min-h-0
                "
            >
                {/* Sidebar */}

                <div
                    className="
                        col-span-12
                        lg:col-span-3
                        min-h-0
                        overflow-y-auto
                        pr-2
                    "
                >
                    <LayoutSidebar
                        availableCategories={availableCategories}
                        paths={paths}
                        editorMode={editorMode}
                        setEditorMode={setEditorMode}
                        selectedCategoryId={selectedCategoryId}
                        selectedItem={selectedItem}
                        selectedPath={selectedPath}
                        onAddCategory={handleAddCategory}
                        onUpdateItem={handleUpdateItem}
                        onDeleteItem={handleDeleteItem}
                        onAddPath={handleAddPath}
                        onUpdatePath={handleUpdatePath}
                        onDeletePath={handleDeletePath}

                    />
                </div>

                {/* Canvas */}

                <div className="col-span-12 lg:col-span-9 min-h-0 overflow-auto">
                    <LayoutCanvas
                        items={layoutItems}
                        paths={paths}
                        selectedItem={selectedCategoryId}
                        setSelectedItem={setSelectedCategoryId}
                        selectedPathId={selectedPathId}
                        setSelectedPathId={setSelectedPathId}
                        editorMode={editorMode}
                        onPositionChange={handlePositionChange}
                        onPathPositionChange={handlePathPositionChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default LayoutEditor;