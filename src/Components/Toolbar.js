import React from 'react';

export default function Toolbar({
  tool,
  setTool,
  saveDrawing,
  loadDrawing,
  removeSelectedShape,
  updateStyle
}) {
  const tools = [
    { name: "select", icon: "🖱" },
    { name: "rect", icon: "▭" },
    { name: "circle", icon: "⭕" },
    { name: "line", icon: "📏" },
    { name: "pencil", icon: "✏️" },
  ];

  return (
    <div className="w-72 bg-white shadow-md rounded-lg p-4 mr-6">
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

        <button onClick={saveDrawing} className="w-full px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600">💾 Save</button>
        <button onClick={loadDrawing} className="w-full px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600">📂 Load</button>
        <button onClick={removeSelectedShape} className="w-full px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600">🗑 Remove</button>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-4 text-indigo-700">🎨 Styles</h2>
      <div className="flex flex-col gap-3">
        <label className="flex items-center justify-between">
          <span className="text-sm">Line Color</span>
          <input type="color" onChange={(e) => updateStyle("stroke", e.target.value)} />
        </label>
        <label className="flex items-center justify-between">
          <span className="text-sm">Fill Color</span>
          <input type="color" onChange={(e) => updateStyle("fill", e.target.value)} />
        </label>
        <label className="flex items-center justify-between">
          <span className="text-sm">Stroke Width</span>
          <input
            type="number"
            min="1"
            max="20"
            className="w-20 px-2 py-1 border rounded"
            onChange={(e) => updateStyle("strokeWidth", parseInt(e.target.value))}
          />
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" onChange={(e) => updateStyle("dash", e.target.checked ? [10, 5] : [])} />
          <span className="text-sm">Dashed Line</span>
        </label>
      </div>
    </div>
  );
}
