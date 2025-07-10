import { useRef, useState } from "react";
import { toast } from 'react-hot-toast';
import { Stage, Layer, Rect, Circle, Line } from "react-konva";

const shapeDefaults = {
  fill: "transparent",
  stroke: "black",
  strokeWidth: 2,
  dash: [],
};

export default function DrawingApp() {
  const [shapes, setShapes] = useState([]);
  const [tool, setTool] = useState("select");
  const [selectedId, setSelectedId] = useState(null);
  const [newRect, setNewRect] = useState(null);
  const [newCircle, setNewCircle] = useState(null);
  const [newLine, setNewLine] = useState(null);
  const [newPencilLine, setNewPencilLine] = useState(null);
  const stageRef = useRef();

  const handleMouseDown = (e) => {
    const stage = stageRef.current.getStage();
    const { x, y } = stage.getPointerPosition();
    const id = shapes.length + 1;

    if (e.target === stage) {
      setSelectedId(null);
    }

    if (tool === "rect") {
      setNewRect({
        id,
        type: "rect",
        x,
        y,
        width: 0,
        height: 0,
        ...shapeDefaults,
      });
    } else if (tool === "circle") {
      setNewCircle({ id, type: "circle", x, y, radius: 0, ...shapeDefaults });
    } else if (tool === "line") {
      setNewLine({ id, type: "line", points: [x, y, x, y], ...shapeDefaults });
    } else if (tool === "pencil") {
      setNewPencilLine({
        id,
        type: "pencil",
        points: [x, y],
        ...shapeDefaults,
      });
    }
  };

  const handleMouseMove = (e) => {
    const stage = stageRef.current.getStage();
    const { x, y } = stage.getPointerPosition();

    if (newRect) {
      const width = x - newRect.x;
      const height = y - newRect.y;
      setNewRect({ ...newRect, width, height });
    } else if (newCircle) {
      const dx = x - newCircle.x;
      const dy = y - newCircle.y;
      const radius = Math.sqrt(dx * dx + dy * dy);
      setNewCircle({ ...newCircle, radius });
    } else if (newLine) {
      const points = [...newLine.points.slice(0, 2), x, y];
      setNewLine({ ...newLine, points });
    } else if (newPencilLine) {
      setNewPencilLine({
        ...newPencilLine,
        points: [...newPencilLine.points, x, y],
      });
    }
  };

  const handleMouseUp = () => {
    if (newRect) {
      setShapes((prev) => [...prev, newRect]);
      setNewRect(null);
      setTool("select");
    }
    if (newCircle) {
      setShapes((prev) => [...prev, newCircle]);
      setNewCircle(null);
      setTool("select");
    }
    if (newLine) {
      setShapes((prev) => [...prev, newLine]);
      setNewLine(null);
      setTool("select");
    }
    if (newPencilLine) {
      setShapes((prev) => [...prev, newPencilLine]);
      setNewPencilLine(null);
      setTool("select");
    }
  };

  const handleDrag = (index, e) => {
    const updated = [...shapes];
    const shape = updated[index];

    if (shape.type === "pencil") {
      const shapeNode = e.target;
      const dx = shapeNode.x();
      const dy = shapeNode.y();

      const newPoints = shape.points.map((point, i) =>
        i % 2 === 0 ? point + dx : point + dy
      );

      updated[index] = {
        ...shape,
        points: newPoints,
        x: 0,
        y: 0,
      };

      shapeNode.position({ x: 0, y: 0 });
    } else if (shape.type === "line") {
      const dx = e.target.x() - (shape.x || 0);
      const dy = e.target.y() - (shape.y || 0);

      const newPoints = shape.points.map((point, i) =>
        i % 2 === 0 ? point + dx : point + dy
      );

      updated[index] = {
        ...shape,
        points: newPoints,
        x: 0,
        y: 0,
      };

      e.target.position({ x: 0, y: 0 });
    } else {
      updated[index] = {
        ...shape,
        x: e.target.x(),
        y: e.target.y(),
      };
    }

    setShapes(updated);
  };

  const updateStyle = (property, value) => {
    if (selectedId === null) return;
    setShapes(
      shapes.map((shape) =>
        shape.id === selectedId ? { ...shape, [property]: value } : shape
      )
    );
  };

  const saveDrawing = () => {
    const json = JSON.stringify(shapes);
    localStorage.setItem("drawing", json);
    // alert("Drawing saved to localStorage!");
    toast.success('Drawing saved!');
  };

  const loadDrawing = () => {
    const saved = localStorage.getItem("drawing");
    if (saved) {
      const parsedShapes = JSON.parse(saved);
      setShapes(parsedShapes);
      toast.success('Drawing loaded');
    } else {
      toast.success('No saved drawing found!');
    }
  };

  const removeSelectedShape = () => {
    if (selectedId === null) return;
    setShapes(shapes.filter((shape) => shape.id !== selectedId));
    setSelectedId(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans flex">
      <div className="w-72 bg-white shadow-md rounded-lg p-4 mr-6">
        <h2 className="text-lg font-semibold mb-4 text-indigo-700">🛠 Tools</h2>
        <div className="flex flex-col gap-2">
          {[
            { name: "select", icon: "🖱" },
            { name: "rect", icon: "▭" },
            { name: "circle", icon: "⭕" },
            { name: "line", icon: "📏" },
            { name: "pencil", icon: "✏️" },
          ].map((toolItem) => (
            <button
              key={toolItem.name}
              onClick={() => setTool(toolItem.name)}
              className={`w-full px-4 py-2 rounded-md shadow-sm border text-left border-gray-300 transition-all duration-200 ease-in-out ${
                tool === toolItem.name
                  ? "bg-teal-500 text-white"
                  : "bg-white text-gray-800 hover:bg-gray-200 hover:text-black"
              }`}
            >
              {toolItem.icon}{" "}
              {toolItem.name.charAt(0).toUpperCase() + toolItem.name.slice(1)}
            </button>
          ))}
          <button
            onClick={saveDrawing}
            className="w-full px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600 transition shadow-sm"
          >
            💾 Save
          </button>
          <button
            onClick={loadDrawing}
            className="w-full px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition shadow-sm"
          >
            📂 Load
          </button>

          <button
            onClick={removeSelectedShape}
            className="w-full px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition shadow-sm"
          >
            🗑 Remove
          </button>
        </div>

        <h2 className="text-lg font-semibold mt-6 mb-4 text-indigo-700">
          🎨 Styles
        </h2>
        <div className="flex flex-col gap-3">
          <label className="flex items-center justify-between">
            <span className="text-sm">Line Color</span>
            <input
              type="color"
              onChange={(e) => updateStyle("stroke", e.target.value)}
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm">Fill Color</span>
            <input
              type="color"
              onChange={(e) => updateStyle("fill", e.target.value)}
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm">Stroke Width</span>
            <input
              type="number"
              min="1"
              max="20"
              onChange={(e) =>
                updateStyle("strokeWidth", parseInt(e.target.value))
              }
              className="w-20 px-2 py-1 border rounded"
            />
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              onChange={(e) =>
                updateStyle("dash", e.target.checked ? [10, 5] : [])
              }
            />
            <span className="text-sm">Dashed Line</span>
          </label>
        </div>
      </div>

      <div className="flex-1 flex justify-center items-start">
        <Stage
          ref={stageRef}
          width={1000}
          height={600}
          className="bg-white border-4 border-gray-300 shadow-xl"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
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
            {shapes.map((shape, i) => {
              const isSelected = shape.id === selectedId;
              const commonProps = {
                key: shape.id,
                draggable: isSelected,
                onClick: () => setSelectedId(() => shape.id),
                onDragEnd: (e) => handleDrag(i, e),
                ...shape,
              };

              if (shape.type === "rect") {
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
              }

              if (shape.type === "circle") {
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
              }

              if (shape.type === "line" || shape.type === "pencil") {
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
              }

              return null;
            })}

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
      </div>
    </div>
  );
}
