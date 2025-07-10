import React from "react";
import { Stage, Layer, Rect, Circle, Line } from "react-konva";
import ShapeRenderer from "./ShapeRenderer";

export default function CanvasStage({
  stageRef,
  shapes,
  newRect,
  newCircle,
  newLine,
  newPencilLine,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  selectedId,
  setSelectedId,
  handleDrag,
  tool
}) {
  return (
    <Stage
      ref={stageRef}
      width={1000}
      height={600}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="bg-white border-4 border-gray-300 shadow-xl"
      style={{
        cursor:
          tool === "select"
            ? "grab"
            : tool === "rect"
            ? "crosshair"
            : tool === "circle"
            ? "circle"
            : tool === "line"
            ? "cell"
            : tool === "pencil"
            ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='black' viewBox='0 0 24 24'%3E%3Cpath d='M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41L18.37 3.29c-.39-.39-1.02-.39-1.41 0L15.13 5.12l4.24 4.24 1.34-1.32z'/%3E%3C/svg%3E") 0 24, auto`
            : "default",
      }}
    >
      <Layer>
        <ShapeRenderer
          shapes={shapes}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          handleDrag={handleDrag}
        />
        {newRect && <Rect {...newRect} />}
        {newCircle && <Circle {...newCircle} />}
        {newLine && <Line {...newLine} />}
        {newPencilLine && (
          <Line
            {...newPencilLine}
            tension={0.5}
            lineCap="round"
            lineJoin="round"
          />
        )}
      </Layer>
    </Stage>
  );
}
