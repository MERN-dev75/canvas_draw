import React from "react";
import { Rect, Circle, Line } from "react-konva";

export default function ShapeRenderer({ shapes, selectedId, setSelectedId, handleDrag }) {
  return shapes.map((shape, i) => {
    const isSelected = shape.id === selectedId;
    const commonProps = {
      key: shape.id,
      draggable: isSelected,
      onClick: () => setSelectedId(shape.id),
      onDragEnd: (e) => handleDrag(i, e),
      ...shape,
    };

    switch (shape.type) {
      case "rect":
        return (
          <>
            <Rect {...commonProps} />
            {isSelected && (
              <Rect
                x={shape.x - 4}
                y={shape.y - 4}
                width={shape.width + 8}
                height={shape.height + 8}
                stroke="blue"
                dash={[4, 2]}
                strokeWidth={1.5}
                listening={false}
              />
            )}
          </>
        );
      case "circle":
        return (
          <>
            <Circle {...commonProps} />
            {isSelected && (
              <Circle
                x={shape.x}
                y={shape.y}
                radius={shape.radius + 4}
                stroke="blue"
                dash={[4, 2]}
                strokeWidth={1.5}
                listening={false}
              />
            )}
          </>
        );
      case "line":
      case "pencil":
        return (
          <>
            <Line {...commonProps} />
            {isSelected && (
              <Line
                points={shape.points}
                stroke="blue"
                dash={[10, 5]}
                strokeWidth={shape.strokeWidth + 2}
                tension={shape.type === "pencil" ? 0.5 : 0}
                lineCap="round"
                lineJoin="round"
                listening={false}
              />
            )}
          </>
        );
      default:
        return null;
    }
  });
}
