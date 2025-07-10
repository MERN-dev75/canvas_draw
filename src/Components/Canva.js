import React, { useRef, useState, useEffect } from "react";
import { Toaster, toast } from 'react-hot-toast';
import { distanceFromLineSegment } from "./helper";

export default function ShapeDrawingApp() {
  const canvasRef = useRef(null);
  const [shapes, setShapes] = useState([]);
  const [tool, setTool] = useState("rect");
  const [startPoint, setStartPoint] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [mode, setMode] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    shapes.forEach((shape) => {
      ctx.beginPath();
      ctx.lineWidth = shape.strokeWidth || 2;
      ctx.strokeStyle =
        shape.id === selectedId ? "red" : shape.stroke || "black";
      ctx.fillStyle = shape.fill || "transparent";
      if (shape.dash) {
        ctx.setLineDash(shape.dash);
      } else {
        ctx.setLineDash([]);
      }

      if (shape.type === "rect") {
        ctx.rect(shape.x, shape.y, shape.width, shape.height);
        ctx.fill();
        ctx.stroke();
      } else if (shape.type === "circle") {
        ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (shape.type === "line") {
        const [x1, y1, x2, y2] = shape.points;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      } else if (shape.type === "pencil") {
        const pts = shape.points;
        ctx.moveTo(pts[0], pts[1]);
        for (let i = 2; i < pts.length; i += 2) {
          ctx.lineTo(pts[i], pts[i + 1]);
        }
        ctx.stroke();
      }
    });
  }, [shapes, selectedId]);

  const getMouse = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e) => {
    const { x, y } = getMouse(e);
    const hit = shapes.find((s) => {
      if (s.type === "rect") {
        return (
          x >= s.x && x <= s.x + s.width && y >= s.y && y <= s.y + s.height
        );
      } else if (s.type === "circle") {
        return Math.sqrt((x - s.x) ** 2 + (y - s.y) ** 2) <= s.radius;
      } else if (s.type === "line") {
        const [x1, y1, x2, y2] = s.points;
        return distanceFromLineSegment(x, y, x1, y1, x2, y2) <= 5;
      } else if (s.type === "pencil") {
        const pts = s.points;
        for (let i = 0; i < pts.length - 2; i += 2) {
          if (
            distanceFromLineSegment(
              x,
              y,
              pts[i],
              pts[i + 1],
              pts[i + 2],
              pts[i + 3]
            ) <= 5
          ) {
            return true;
          }
        }
      }
      return false;
    });

    if (tool === "eraser" && hit) {
      setShapes((prev) => prev.filter((s) => s.id !== hit.id));
      setSelectedId(null);
      return;
    }

    if (hit) {
      setSelectedId(hit.id);
      if (tool === "select") {
        setMode("move");
        if (hit.type === "line" || hit.type === "pencil") {
          setOffset({ x, y });
        } else {
          setOffset({ x: x - hit.x, y: y - hit.y });
        }
      }
    } else {
      const id = Date.now();
      const base = {
        id,
        stroke: "black",
        fill: "transparent",
        strokeWidth: 2,
        dash: [],
      };

      if (tool === "rect") {
        setShapes([
          ...shapes,
          { ...base, type: "rect", x, y, width: 0, height: 0 },
        ]);
      } else if (tool === "circle") {
        setShapes([...shapes, { ...base, type: "circle", x, y, radius: 0 }]);
      } else if (tool === "line") {
        setShapes([...shapes, { ...base, type: "line", points: [x, y, x, y] }]);
      } else if (tool === "pencil") {
        setShapes([...shapes, { ...base, type: "pencil", points: [x, y] }]);
      }
      setSelectedId(id);
      setStartPoint({ x, y });
      setMode("draw");
    }
  };

  const handleMouseMove = (e) => {
    if (!mode) return;
    const { x, y } = getMouse(e);
    const updated = shapes.map((shape) => {
      if (shape.id !== selectedId) return shape;
      if (mode === "draw") {
        if (shape.type === "rect") {
          return { ...shape, width: x - shape.x, height: y - shape.y };
        } else if (shape.type === "circle") {
          const dx = x - shape.x;
          const dy = y - shape.y;
          return { ...shape, radius: Math.sqrt(dx * dx + dy * dy) };
        } else if (shape.type === "line") {
          const [x1, y1] = shape.points;
          return { ...shape, points: [x1, y1, x, y] };
        } else if (shape.type === "pencil") {
          return { ...shape, points: [...shape.points, x, y] };
        }
      } else if (mode === "move" && tool === "select") {
        if (shape.type === "rect" || shape.type === "circle") {
          return { ...shape, x: x - offset.x, y: y - offset.y };
        }
        if (shape.type === "line") {
          const [x1, y1, x2, y2] = shape.points;
          const dx = x - offset.x;
          const dy = y - offset.y;
          setOffset({ x, y });
          return {
            ...shape,
            points: [x1 + dx, y1 + dy, x2 + dx, y2 + dy],
          };
        }
        if (shape.type === "pencil") {
          const dx = x - offset.x;
          const dy = y - offset.y;
          setOffset({ x, y });
          const newPoints = shape.points.map((val, idx) =>
            idx % 2 === 0 ? val + dx : val + dy
          );
          return { ...shape, points: newPoints };
        }
      }
      return shape;
    });
    setShapes(updated);
  };

  const handleMouseUp = () => {
    setStartPoint(null);
    setMode(null);
  };

  const tools = [
    { name: "select", icon: "🖱" },
    { name: "rect", icon: "▭" },
    { name: "circle", icon: "⭕" },
    { name: "line", icon: "📏" },
    { name: "pencil", icon: "✏️" },
    { name: "eraser", icon: "🧽" },
  ];

  const updateStyle = (prop, value) => {
    if (selectedId === null) return;
    setShapes((prev) =>
      prev.map((s) => (s.id === selectedId ? { ...s, [prop]: value } : s))
    );
  };

    const saveDrawing = () => {
    localStorage.setItem("drawing", JSON.stringify(shapes));
    toast.success("Drawing saved!");
  };

  const loadDrawing = () => {
    const saved = localStorage.getItem("drawing");
    if (saved) setShapes(JSON.parse(saved)), toast.success("Drawing loaded");
    else toast.success("No saved drawing found!");
  };


  return (
    <div className="flex flex-row gap-4 p-4 min-h-screen bg-gray-100">
      <div className="w-72 bg-white shadow-md rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4 text-indigo-700">🛠 Tools</h2>
        <div className="flex flex-col gap-2">
          {tools.map(({ name, icon }) => (
            <button
              key={name}
              onClick={() => setTool(name)}
              className={`w-full px-4 py-2 rounded-md shadow-sm border text-left border-gray-300 transition-all duration-200 ${
                tool === name
                  ? "bg-teal-500 text-white"
                  : "bg-white text-gray-800 hover:bg-gray-200"
              }`}
            >
              {icon} {name.charAt(0).toUpperCase() + name.slice(1)}
            </button>
          ))}
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
              className="w-20 px-2 py-1 border rounded"
              onChange={(e) =>
                updateStyle("strokeWidth", parseInt(e.target.value))
              }
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
          <button
            onClick={saveDrawing}
            className="w-full px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600"
          >
            💾 Save
          </button>
          <button
            onClick={loadDrawing}
            className="w-full px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
          >
            📂 Load
          </button>
        </div>
      </div>

      <div className="flex-grow">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className={`bg-white border-4 border-gray-400 shadow-md ${tool}-cursor`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
      </div>
    </div>
  );
}
