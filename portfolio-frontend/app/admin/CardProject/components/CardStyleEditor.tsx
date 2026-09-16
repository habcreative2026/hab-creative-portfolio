"use client";

import React from "react";
import FontPickerComponent from "@/app/admin/components/FontPicker";

export interface CardStyleData {
  font: string;
  weight: number;
  size: number;
  color: string;
}

interface CardStyleEditorProps {
  label: string;
  value: CardStyleData;
  onChange: (value: CardStyleData) => void;
  accentColor?: "sky" | "emerald" | "indigo";
}

const FONT_WEIGHTS = [
  { value: 0, label: "Mặc định" },
  { value: 100, label: "100" },
  { value: 200, label: "200" },
  { value: 300, label: "300" },
  { value: 400, label: "400" },
  { value: 500, label: "500" },
  { value: 600, label: "600" },
  { value: 700, label: "700" },
  { value: 800, label: "800" },
  { value: 900, label: "900" },
];

export default function CardStyleEditor({
  label,
  value,
  onChange,
  accentColor = "indigo",
}: CardStyleEditorProps) {
  const updateField = <K extends keyof CardStyleData>(
    field: K,
    val: CardStyleData[K],
  ) => {
    onChange({ ...value, [field]: val });
  };

  const accentClasses = {
    sky: "text-sky-400 border-sky-900/40",
    emerald: "text-emerald-400 border-emerald-900/40",
    indigo: "text-indigo-400 border-indigo-900/40",
  };

  return (
    <div
      className={`bg-[#141E33] p-3 rounded-xl border ${accentClasses[accentColor].split(" ")[1]} space-y-3`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-[10px] font-bold uppercase ${accentClasses[accentColor].split(" ")[0]}`}
        >
          {label}
        </span>
        <button
          type="button"
          onClick={() => onChange({ font: "", weight: 0, size: 0, color: "" })}
          className="text-[9px] text-slate-500 hover:text-red-400 transition"
        >
          Reset
        </button>
      </div>

      {/* Font */}
      <FontPickerComponent
        value={value.font}
        onChange={(font) => updateField("font", font)}
      />

      {/* Weight */}
      <div>
        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
          Weight
        </label>
        <div className="grid grid-cols-5 gap-1">
          {FONT_WEIGHTS.map((w) => (
            <button
              key={w.value}
              type="button"
              onClick={() => updateField("weight", w.value)}
              className={`py-1 rounded text-[9px] font-bold transition ${
                value.weight === w.value
                  ? "bg-indigo-600 text-white"
                  : "bg-[#0F172A] text-slate-400 hover:bg-[#1E293B]"
              }`}
              title={w.label}
            >
              {w.value === 0 ? "Auto" : w.value}
            </button>
          ))}
        </div>
      </div>

      {/* Size + Color */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
            Size (px)
          </label>
          <input
            type="number"
            min="0"
            max="200"
            value={value.size}
            onChange={(e) => updateField("size", Number(e.target.value))}
            placeholder="Auto"
            className="w-full p-2 bg-[#0F172A] border border-[#1E293B] rounded-lg text-xs"
          />
        </div>
        <div>
          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
            Color
          </label>
          <div className="flex gap-1">
            <input
              type="color"
              value={value.color || "#000000"}
              onChange={(e) => updateField("color", e.target.value)}
              className="w-10 h-8 rounded border border-[#1E293B] cursor-pointer"
            />
            <input
              type="text"
              value={value.color}
              onChange={(e) => updateField("color", e.target.value)}
              placeholder="Auto"
              className="flex-1 p-2 bg-[#0F172A] border border-[#1E293B] rounded-lg text-[10px] font-mono"
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-[#0F172A] p-2 rounded-lg border border-[#1E293B]">
        <p
          className="text-xs truncate"
          style={{
            fontFamily: value.font ? `"${value.font}", sans-serif` : "inherit",
            fontWeight: value.weight || "inherit",
            fontSize: value.size ? `${value.size}px` : "inherit",
            color: value.color || "inherit",
          }}
        >
          Preview — {label}
        </p>
      </div>
    </div>
  );
}
