import React, { useState, useRef } from "react";
import Canva from "../Components/Canva"
import { Toaster, toast } from "react-hot-toast";

export default function DrawingApp() {
  return (
    <div className="overflow-hidden w-screen min-h-screen bg-gray-100 p-6 font-sans flex">
      <Toaster />
      <Canva />
    </div>
  );
}
