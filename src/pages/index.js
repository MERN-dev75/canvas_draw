import React, { useState, useRef } from "react";
import { Toaster, toast } from 'react-hot-toast';
import Canva from "../Components/Canva";
import Toolbar from "../Components/Toolbar";
import CanvasStage from "../Components/CanvasStage";

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

    if (e.target === stage) setSelectedId(null);

    switch (tool) {
      case "rect":
        setNewRect({ id, type: "rect", x, y, width: 0, height: 0, ...shapeDefaults });
        break;
      case "circle":
        setNewCircle({ id, type: "circle", x, y, radius: 0, ...shapeDefaults });
        break;
      case "line":
        setNewLine({ id, type: "line", points: [x, y, x, y], ...shapeDefaults });
        break;
      case "pencil":
        setNewPencilLine({ id, type: "pencil", points: [x, y], ...shapeDefaults });
        break;
    }
  };

  const handleMouseMove = (e) => {
    const { x, y } = stageRef.current.getStage().getPointerPosition();
    if (newRect) setNewRect({ ...newRect, width: x - newRect.x, height: y - newRect.y });
    else if (newCircle) {
      const dx = x - newCircle.x;
      const dy = y - newCircle.y;
      setNewCircle({ ...newCircle, radius: Math.sqrt(dx * dx + dy * dy) });
    } else if (newLine) {
      setNewLine({ ...newLine, points: [...newLine.points.slice(0, 2), x, y] });
    } else if (newPencilLine) {
      setNewPencilLine({ ...newPencilLine, points: [...newPencilLine.points, x, y] });
    }
  };

  const handleMouseUp = () => {
    if (newRect) setShapes((p) => [...p, newRect]), setNewRect(null);
    if (newCircle) setShapes((p) => [...p, newCircle]), setNewCircle(null);
    if (newLine) setShapes((p) => [...p, newLine]), setNewLine(null);
    if (newPencilLine) setShapes((p) => [...p, newPencilLine]), setNewPencilLine(null);
    setTool("select");
  };

  const handleDrag = (index, e) => {
    const updated = [...shapes];
    const shape = updated[index];

    if (shape.type === "line" || shape.type === "pencil") {
      const dx = e.target.x() - (shape.x || 0);
      const dy = e.target.y() - (shape.y || 0);
      const newPoints = shape.points.map((pt, i) => (i % 2 === 0 ? pt + dx : pt + dy));
      updated[index] = { ...shape, points: newPoints, x: 0, y: 0 };
      e.target.position({ x: 0, y: 0 });
    } else {
      updated[index] = { ...shape, x: e.target.x(), y: e.target.y() };
    }

    setShapes(updated);
  };

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

  const removeSelectedShape = () => {
    if (selectedId === null) return;
    setShapes(shapes.filter((s) => s.id !== selectedId));
    setSelectedId(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans flex">
      <Toaster />
      <Toolbar
        tool={tool}
        setTool={setTool}
        saveDrawing={saveDrawing}
        loadDrawing={loadDrawing}
        removeSelectedShape={removeSelectedShape}
        updateStyle={updateStyle}
      />
      <CanvasStage
        stageRef={stageRef}
        shapes={shapes}
        newRect={newRect}
        newCircle={newCircle}
        newLine={newLine}
        newPencilLine={newPencilLine}
        handleMouseDown={handleMouseDown}
        handleMouseMove={handleMouseMove}
        handleMouseUp={handleMouseUp}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        handleDrag={handleDrag}
        tool={tool}
      />
    </div>
  );
}

