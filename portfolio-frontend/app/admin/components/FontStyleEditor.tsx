// logic style about

// "use client";

// import React from "react";
// import FontPickerComponent from "@/app/admin/components/FontPicker";

// export interface TextStyle {
//   font: string;
//   size: number;
//   weight: string;
//   letterSpacing: number;
//   color: string;
// }

// export const DEFAULT_TEXT_STYLE: TextStyle = {
//   font: "Inter",
//   size: 0,
//   weight: "400",
//   letterSpacing: 0,
//   color: "",
// };

// interface FontStyleEditorProps {
//   label: string;
//   value: TextStyle;
//   onChange: (value: TextStyle) => void;
//   /** Có hiển thị Letter Spacing không */
//   showLetterSpacing?: boolean;
//   /** Cho phép size = 0 (kế thừa) */
//   allowInheritSize?: boolean;
//   /** Color mặc định khi mở color picker */
//   defaultColor?: string;
// }

// const WEIGHT_OPTIONS = [
//   { label: "100 Thin", value: "100" },
//   { label: "200 ExtraLight", value: "200" },
//   { label: "300 Light", value: "300" },
//   { label: "400 Regular", value: "400" },
//   { label: "500 Medium", value: "500" },
//   { label: "600 SemiBold", value: "600" },
//   { label: "700 Bold", value: "700" },
//   { label: "800 ExtraBold", value: "800" },
//   { label: "900 Black", value: "900" },
// ];

// export default function FontStyleEditor({
//   label,
//   value,
//   onChange,
//   showLetterSpacing = true,
//   allowInheritSize = true,
//   defaultColor = "#111111",
// }: FontStyleEditorProps) {
//   const update = <K extends keyof TextStyle>(field: K, val: TextStyle[K]) => {
//     onChange({ ...value, [field]: val });
//   };

//   const handleReset = () => {
//     onChange({ ...DEFAULT_TEXT_STYLE });
//   };

//   return (
//     <div className="bg-[#1F2937]/30 p-3 rounded-lg border border-slate-700/50 space-y-2">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <span className="text-[10px] font-bold text-slate-400 uppercase">
//           {label}
//         </span>
//         <button
//           type="button"
//           onClick={handleReset}
//           className="text-[9px] text-slate-500 hover:text-red-400 transition"
//         >
//           Reset
//         </button>
//       </div>

//       {/* Font + Weight */}
//       <div className="grid grid-cols-2 gap-2">
//         <div>
//           <label className="text-[10px] text-slate-400 block mb-0.5">
//             Font
//           </label>
//           <FontPickerComponent
//             value={value.font}
//             onChange={(font) => update("font", font)}
//             placeholder="Inter"
//           />
//         </div>
//         <div>
//           <label className="text-[10px] text-slate-400 block mb-0.5">
//             Weight
//           </label>
//           <select
//             value={value.weight}
//             onChange={(e) => update("weight", e.target.value)}
//             className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
//           >
//             {WEIGHT_OPTIONS.map((w) => (
//               <option key={w.value} value={w.value}>
//                 {w.label}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* Size + Letter Spacing */}
//       <div
//         className={`grid ${showLetterSpacing ? "grid-cols-2" : "grid-cols-1"} gap-2`}
//       >
//         <div>
//           <label className="text-[10px] text-slate-400 block mb-0.5">
//             Size (px)
//           </label>
//           <div className="flex gap-1">
//             <input
//               type="number"
//               min="0"
//               max="300"
//               value={value.size}
//               onChange={(e) => update("size", Number(e.target.value))}
//               className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
//               placeholder={allowInheritSize ? "0 = kế thừa" : ""}
//             />
//             {allowInheritSize && (
//               <span className="text-[9px] text-slate-500 self-center">
//                 {value.size === 0 ? "inherit" : "px"}
//               </span>
//             )}
//           </div>
//         </div>
//         {showLetterSpacing && (
//           <div>
//             <label className="text-[10px] text-slate-400 block mb-0.5">
//               Letter Spacing (em)
//             </label>
//             <input
//               type="number"
//               step="0.01"
//               min="-0.1"
//               max="1"
//               value={value.letterSpacing}
//               onChange={(e) => update("letterSpacing", Number(e.target.value))}
//               className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
//             />
//           </div>
//         )}
//       </div>

//       {/* Color */}
//       <div>
//         <label className="text-[10px] text-slate-400 block mb-0.5">Color</label>
//         <div className="flex gap-1 items-center">
//           <input
//             type="color"
//             value={value.color || defaultColor}
//             onChange={(e) => update("color", e.target.value)}
//             className="w-8 h-8 bg-transparent border-0 cursor-pointer p-0 rounded"
//           />
//           <input
//             type="text"
//             value={value.color}
//             onChange={(e) => update("color", e.target.value)}
//             placeholder="inherit"
//             className="flex-1 bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none font-mono"
//           />
//           {value.color && (
//             <button
//               type="button"
//               onClick={() => update("color", "")}
//               className="px-2 py-2 text-[10px] text-slate-500 hover:text-red-400 transition border border-slate-700 rounded"
//               title="Xóa màu (kế thừa)"
//             >
//               ✕
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Preview */}
//       <div className="bg-[#0B0F19] p-2 rounded border border-slate-800">
//         <p
//           className="text-xs truncate"
//           style={{
//             fontFamily: value.font ? `"${value.font}", sans-serif` : "inherit",
//             fontWeight: value.weight || "inherit",
//             fontSize: value.size ? `${value.size}px` : "12px",
//             letterSpacing: value.letterSpacing
//               ? `${value.letterSpacing}em`
//               : "normal",
//             color: value.color || defaultColor,
//           }}
//         >
//           Preview — {label}
//         </p>
//       </div>
//     </div>
//   );
// }
