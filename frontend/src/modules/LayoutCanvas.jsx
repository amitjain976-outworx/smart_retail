import React, { useRef } from "react";

const GRID_SIZE = 20;

const LayoutCanvas = ({
  items = [],
  paths = [],

  selectedItem,
  setSelectedItem,

  selectedPathId,
  setSelectedPathId,

  editorMode,

  onPositionChange,
  onPathPositionChange,
}) => {
  const canvasRef = useRef(null);

  // ==========================================================
  // Drag Start
  // ==========================================================

  const handleMouseDown = (e, item) => {

    if (editorMode !== "CATEGORY") {
      return;
    }

    e.preventDefault();

    setSelectedItem(item.category_id);

    setSelectedPathId(null);

    const startX = e.clientX;
    const startY = e.clientY;

    const initialX = item.x;
    const initialY = item.y;

    const handleMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      const newX = Math.max(
        0,
        Math.round((initialX + dx) / GRID_SIZE) *
        GRID_SIZE
      );

      const newY = Math.max(
        0,
        Math.round((initialY + dy) / GRID_SIZE) *
        GRID_SIZE
      );

      onPositionChange(item.category_id, {
        x: newX,
        y: newY,
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      document.removeEventListener(
        "mouseup",
        handleMouseUp
      );
    };

    document.addEventListener(
      "mousemove",
      handleMouseMove
    );

    document.addEventListener(
      "mouseup",
      handleMouseUp
    );
  };

  const handlePathMouseDown = (e, path) => {

    e.preventDefault();

    if (editorMode !== "PATH") {
      return;
    }

    setSelectedPathId(path.id);

    setSelectedItem(null);

    const startX = e.clientX;
    const startY = e.clientY;

    const initialX = path.x;
    const initialY = path.y;

    const handleMouseMove = (moveEvent) => {

      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      const newX =
        Math.max(
          0,
          Math.round((initialX + dx) / GRID_SIZE)
          * GRID_SIZE
        );

      const newY =
        Math.max(
          0,
          Math.round((initialY + dy) / GRID_SIZE)
          * GRID_SIZE
        );

      onPathPositionChange(path.id, {
        x: newX,
        y: newY,
      });

    };

    const handleMouseUp = () => {

      document.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      document.removeEventListener(
        "mouseup",
        handleMouseUp
      );

    };

    document.addEventListener(
      "mousemove",
      handleMouseMove
    );

    document.addEventListener(
      "mouseup",
      handleMouseUp
    );

  };

  // ==========================================================
  // Canvas
  // ==========================================================

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}

      <div className="border-b px-6 py-4 bg-gray-50">
        <h2 className="font-semibold text-lg text-gray-800">
          Store Layout
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Drag categories and walkable paths to match your actual shop layout.
        </p>
      </div>

      {/* Canvas */}

      <div
        ref={canvasRef}
        className="relative w-full h-[750px] overflow-auto"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
          `,
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
        }}
      >

        {paths.map((path) => {

          const isSelected =
            selectedPathId === path.id;

          // Swap dimensions for 90° and 270°
          const isVertical =
            path.rotation % 180 !== 0;

          const displayWidth =
            isVertical ? path.height : path.width;

          const displayHeight =
            isVertical ? path.width : path.height;

          return (

            <div
              key={path.id}
              onMouseDown={(e) => handlePathMouseDown(e, path)}
              onClick={() => {
                setSelectedPathId(path.id);
                setSelectedItem(null);
              }}
              className="absolute cursor-grab transition-all overflow-hidden"
              style={{
                left: path.x,
                top: path.y,

                width: displayWidth,
                height: displayHeight,

                backgroundColor: "#F9FAFB",

                border: `1px solid ${isSelected ? "#2563EB" : "#D1D5DB"
                  }`,

                borderRadius: "4px",

                zIndex: 1,
              }}
            >
              {/* Center dashed lane */}
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
                        "repeating-linear-gradient(to bottom, #94A3B8 0 30px, transparent 30px 50px)",

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
                        "repeating-linear-gradient(to right, #94A3B8 0 30px, transparent 30px 50px)",

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
    text-gray-500
    pointer-events-none
    font-medium
  "
              >
                {path.path_name}
              </span>
            </div>
          );
        })}


        {items.map((item) => {
          const isSelected = selectedItem === item.category_id;

          return (
            <div
              key={item.category_id}
              onMouseDown={(e) => handleMouseDown(e, item)}
              onClick={() => {
                setSelectedItem(item.category_id);
                setSelectedPathId(null);
              }}
              className="absolute"
              style={{
                left: item.x,
                top: item.y,
                width: item.width,
                height: item.height,
                transform: `rotate(${item.rotation}deg)`,
                transformOrigin: "top left",
                zIndex: isSelected ? 50 : 10,
              }}
            >
              {/* Category Label */}
              <div
                className="
          absolute
          -top-6
          left-0
          w-full
          text-center
          text-xs
          font-bold
          text-gray-800
          pointer-events-none
          select-none
        "
              >
                {item.category_name}
              </div>

              {/* Shelf */}
              <div
                className="
          w-full
          h-full
          cursor-move
          rounded-xl
          shadow-md
          border-2
          transition-all
          duration-150
        "
                style={{
                  backgroundColor: item.color,
                  borderColor: isSelected
                    ? "#1b2a49"
                    : "transparent",
                }}
              />
            </div>
          );
        })}

        {/* Empty State */}

        {items.length === 0 &&
          paths.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <h3 className="font-semibold text-gray-700">
                  Store Layout is Empty
                </h3>

                <p className="text-gray-500 text-sm mt-2">
                  Add categories or walkable paths from the sidebar to start designing the layout.
                </p>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default LayoutCanvas;