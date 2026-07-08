"use client";
import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { Type, Image, Video, Code } from "lucide-react";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import FontPickerComponent from "@/app/admin/components/FontPicker";
import ProjectPreview from "../components/ProjectPreview";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const BLOCK_TYPES = [
  { id: "text_block", label: "Text Block", icon: Type, color: "blue" },
  { id: "image", label: "Image Block", icon: Image, color: "green" },
  { id: "video", label: "Video Block", icon: Video, color: "purple" },
  { id: "iframe", label: "Iframe", icon: Code, color: "orange" },
];

const WEIGHT_OPTIONS = [
  { label: "Light (300)", value: "300" },
  { label: "Regular (400)", value: "400" },
  { label: "Medium (500)", value: "500" },
  { label: "Bold (700)", value: "700" },
  { label: "Black (900)", value: "900" },
];
const ALIGN_OPTIONS = [
  { label: "Trái (Left)", value: "left" },
  { label: "Giữa (Center)", value: "center" },
  { label: "Phải (Right)", value: "right" },
];

const convertToEmbedUrl = (url: string): string => {
  if (!url) return "";
  let cleanUrl = url.trim();
  if (cleanUrl.includes("vimeo.com")) {
    if (cleanUrl.includes("player.vimeo.com")) return cleanUrl;
    const vimeoReg =
      /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
    const match = cleanUrl.match(vimeoReg);
    if (match && match[3]) {
      return `https://player.vimeo.com/video/${match[3]}?badge=0&autopause=0&player_id=0&app_id=58479`;
    }
  }
  if (cleanUrl.includes("youtube.com") || cleanUrl.includes("youtu.be")) {
    if (cleanUrl.includes("youtube.com/embed/")) return cleanUrl;
    const ytReg =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = cleanUrl.match(ytReg);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
  }
  return cleanUrl;
};

// Component SortableItem riêng biệt
const SortableBlockItem = ({
  block,
  index,
  isSelected,
  setSelectedTarget,
  mediaBlocks,
  setMediaBlocks,
  handleCloudinaryUpload,
}: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const wPercent =
    block.width_percent !== undefined ? block.width_percent : 100;
  const hPx = block.height_px !== undefined ? block.height_px : 450;

  let alignClass = "mx-auto";
  if (block.align_block === "left") alignClass = "mr-auto ml-0";
  else if (block.align_block === "right") alignClass = "ml-auto mr-0";

  const textStyle = {
    fontFamily: block.text_font || "Inter",
    fontSize: `${block.text_size || 16}px`,
    fontWeight: block.text_weight || "400",
    color: block.text_color || "#ffffff",
    textAlign: (block.text_align || "center") as any,
    letterSpacing: `${block.text_letter_spacing || 0}px`,
  };

  return (
    <div
      ref={setNodeRef}
      style={{ width: `${wPercent}%`, ...style }}
      className={`px-2 ${alignClass} relative group transition-all duration-200 select-none`}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          setSelectedTarget(index);
        }}
        className={`border rounded-xl p-0 overflow-hidden transition-all duration-300 ease-out ${
          isDragging
            ? "bg-slate-900 border-indigo-500 shadow-2xl scale-[1.02] ring-2 ring-indigo-500/50 opacity-90"
            : isSelected
              ? "ring-2 ring-blue-500 border-blue-500 bg-[#1f2937]/90 shadow-lg shadow-blue-500/5"
              : "border-slate-800 bg-[#1f2937]/40 hover:border-slate-700"
        }`}
      >
        <div
          {...attributes}
          {...listeners}
          className="flex justify-between items-center p-3 border-b border-slate-800 text-[10px] uppercase font-black text-slate-400 bg-black/40 cursor-grab active:cursor-grabbing hover:bg-black/60 transition-colors relative"
        >
          <span className="flex items-center gap-1.5">
            <span className="text-slate-500 text-xs">⠿</span>
            Khối #{index + 1} -{" "}
            <span className="text-blue-400">{block.type}</span> ({wPercent}% x{" "}
            {hPx}px)
          </span>

          {/* ⭐ NÚT XÓA - TĂNG VÙNG CLICK + PADDING */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const copy = [...mediaBlocks];
              copy.splice(index, 1);
              setMediaBlocks(copy.map((b, i) => ({ ...b, sort_order: i })));
              setSelectedTarget("metadata");
            }}
            className="text-red-400 hover:text-red-500 lowercase normal-case border border-red-900/50 font-bold transition z-30 px-3 py-1.5 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 min-w-[50px] text-center relative"
          >
            Xóa
          </button>

          {(block.type === "image" || block.type === "video") && (
            <div className="absolute right-8 pr-8 top-0 mt-4 pt-4 group-hover:flex -translate-y-1/2 items-center pl-4 z-20 animate-fade-in hidden">
              <label className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] px-2 py-1 rounded cursor-pointer transition normal-case shadow">
                Thay {block.type === "image" ? "hình ảnh" : "video"}
                <input
                  type="file"
                  accept={
                    block.type === "image"
                      ? "image/*,.jpg,.jpeg,.png,.webp,.svg,.gif"
                      : "video/*,.mp4,.mov,.mkv,.avi,.webm"
                  }
                  onChange={(e) => {
                    handleCloudinaryUpload(e, index, block.type === "video");
                  }}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        <div
          style={{
            height: `${Math.min(hPx, 1000)}px`,
            maxHeight: "1000px",
            overflow: "hidden",
          }}
          className="w-full flex flex-col justify-center relative overflow-hidden transition-all duration-200"
        >
          {block.type === "text_block" && (
            <div
              className="p-6 overflow-y-auto h-full flex items-center justify-center transition-all"
              style={{
                ...textStyle,
                position: "relative",
                paddingTop: `${block.text_y ?? 50}%`,
                paddingBottom: `${100 - (block.text_y ?? 50)}%`,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: `${block.text_x ?? 50}%`,
                  top: `${block.text_y ?? 50}%`,
                  transform: "translate(-50%, -50%)",
                  width: "90%",
                  ...textStyle,
                }}
              >
                {block.text_content?.vi ||
                  "Nhấp chọn khối này để cấu hình văn bản đa ngôn ngữ..."}
              </span>
            </div>
          )}

          {/* {block.type === "image" && (
            <div className="relative w-full h-full flex items-center justify-center bg-zinc-950 group/img">
              {block.src ? (
                <div className="relative w-full h-full">
                  <img
                    src={block.src}
                    alt="Cloudinary Block"
                    className="w-full h-full object-cover block mx-auto transition duration-300"
                    style={{
                      objectFit: hPx > 1000 ? "contain" : "cover",
                    }}
                  />
                  {block.has_text_overlay && (
                    <div
                      className="absolute whitespace-pre-line max-w-[85%] z-10 pointer-events-none transition-all duration-150"
                      style={{
                        left: `${block.text_x ?? 50}%`,
                        top: `${block.text_y ?? 50}%`,
                        transform: "translate(-50%, -50%)",
                        width: "90%",
                        ...textStyle,
                      }}
                    >
                      {block.text_content?.vi || "Text Overlay sample"}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-4">
                  <p className="text-xs text-slate-500 mb-3 font-mono">
                    Chưa tải ảnh lên hệ thống
                  </p>
                  <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded shadow-md transition-all inline-block active:scale-95">
                    Upload Video
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleCloudinaryUpload(e, index, false)}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          )} */}

          {block.type === "image" && (
            <div
              className="relative w-full"
              style={{
                paddingBottom: `${(block.height_px / ((block.width_percent / 100) * 1200)) * 100}%`,
              }}
            >
              {block.src && (
                <img
                  src={block.src}
                  alt="Project image"
                  className="absolute inset-0 w-full h-full object-contain"
                />
              )}
              {!block.src && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 text-slate-400 text-xs">
                  Chưa có ảnh
                </div>
              )}

              {block.overlay?.src && (
                <div
                  className="absolute"
                  style={{
                    left: `${block.overlay.x || 50}%`,
                    top: `${block.overlay.y || 50}%`,
                    width: `${block.overlay.width || 30}%`,
                    height: `${block.overlay.height || 30}%`,
                    transform: `translate(-50%, -50%) rotate(${block.overlay.rotation || 0}deg)`,
                    opacity: block.overlay.opacity || 1,
                  }}
                >
                  {block.overlay.type === "video" ? (
                    <video
                      src={block.overlay.src}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <img
                      src={block.overlay.src}
                      alt="Overlay"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              )}

              {/* Text overlay - chỉ render khi có text và has_text_overlay */}
              {block.has_text_overlay && block.text_content?.vi && (
                <div
                  className="absolute whitespace-pre-line max-w-[85%]"
                  style={{
                    left: `${block.text_x ?? 50}%`,
                    top: `${block.text_y ?? 50}%`,
                    transform: "translate(-50%, -50%)",
                    width: "90%",
                    fontFamily: block.text_font || "Inter",
                    fontSize: `${block.text_size || 24}px`,
                    fontWeight: block.text_weight || "400",
                    color: block.text_color || "#ffffff",
                    textAlign: block.text_align || "center",
                    letterSpacing: `${block.text_letter_spacing || 0}px`,
                  }}
                >
                  {block.text_content?.vi}
                </div>
              )}
            </div>
          )}

          {block.type === "video" && (
            <div className="relative w-full h-full flex items-center justify-center bg-zinc-950">
              {block.src ? (
                <video
                  src={block.src}
                  controls
                  muted
                  loop
                  className="w-full h-full object-contain"
                  style={{
                    objectFit: hPx > 1000 ? "contain" : "cover",
                  }}
                />
              ) : (
                <div className="text-center p-4">
                  <p className="text-xs text-slate-500 mb-3 font-mono">
                    Chưa tải video lên hệ thống
                  </p>
                  <label className="cursor-pointer bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2 rounded inline-block transition active:scale-95 shadow-md">
                    Upload Video
                    <input
                      type="file"
                      accept="video/*,.mp4,.mov,.mkv,.avi,.webm"
                      onChange={(e) => handleCloudinaryUpload(e, index, true)}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          )}

          {block.type === "iframe" && (
            <div className="p-0 w-full h-full flex flex-col justify-between bg-black">
              <div className="p-3 bg-zinc-900 border-b border-slate-900">
                <input
                  type="text"
                  value={block.src || ""}
                  onChange={(e) => {
                    const u = [...mediaBlocks];
                    u[index].src = e.target.value;
                    setMediaBlocks(u);
                  }}
                  placeholder="Nhập link Youtube / Vimeo..."
                  className="w-full bg-black border border-slate-800 p-2 text-white rounded text-xs focus:outline-none focus:border-indigo-500 transition font-mono"
                />
              </div>
              <div className="flex-1 w-full bg-zinc-950 relative">
                {block.src ? (
                  <iframe
                    src={convertToEmbedUrl(block.src)}
                    className="w-full h-full border-0"
                    allowFullScreen
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-600 font-mono">
                    Iframe Preview Empty
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function FramerStudioAdmin() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<
    "metadata" | number | null
  >("metadata");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewPayload, setPreviewPayload] = useState<any>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [company, setCompany] = useState("");
  const [year, setYear] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [catVi, setCatVi] = useState("");
  const [catEn, setCatEn] = useState("");
  const [catDe, setCatDe] = useState("");
  const [descVi, setDescVi] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descDe, setDescDe] = useState("");
  const [liveLabelVi, setLiveLabelVi] = useState("");
  const [liveLabelEn, setLiveLabelEn] = useState("");
  const [liveLabelDe, setLiveLabelDe] = useState("");
  const [overlayType, setOverlayType] = useState<"image" | "video">("image");

  const [styleTitle, setStyleTitle] = useState<any>({
    font: "Inter",
    size: 32,
    weight: "700",
    color: "#ffffff",
    align: "left",
    letter_spacing: 0,
  });
  const [styleCompany, setStyleCompany] = useState<any>({
    font: "Inter",
    size: 14,
    weight: "600",
    color: "#a3a3a3",
    align: "left",
    letter_spacing: 1,
  });
  const [styleYear, setStyleYear] = useState<any>({
    font: "Inter",
    size: 14,
    weight: "600",
    color: "#ffffff",
    align: "left",
    letter_spacing: 0,
  });
  const [styleCategory, setStyleCategory] = useState<any>({
    font: "Inter",
    size: 14,
    weight: "600",
    color: "#ffffff",
    align: "left",
    letter_spacing: 0,
  });
  const [styleDescription, setStyleDescription] = useState<any>({
    font: "Inter",
    size: 18,
    weight: "400",
    color: "#e2e8f0",
    align: "left",
    letter_spacing: 0,
  });
  const [styleLive, setStyleLive] = useState<any>({
    font: "Inter",
    size: 14,
    weight: "600",
    color: "#3b82f6",
    align: "left",
    letter_spacing: 0,
  });
  const [styleCompanyValue, setStyleCompanyValue] = useState<any>({
    font: "Inter",
    size: 14,
    weight: "400",
    color: "#a3a3a3",
    letter_spacing: 0,
  });
  const [styleYearValue, setStyleYearValue] = useState<any>({
    font: "Inter",
    size: 14,
    weight: "400",
    color: "#ffffff",
    letter_spacing: 0,
  });
  const [styleCategoryValue, setStyleCategoryValue] = useState<any>({
    font: "Inter",
    size: 14,
    weight: "400",
    color: "#ffffff",
    letter_spacing: 0,
  });
  const [styleLiveValue, setStyleLiveValue] = useState<any>({
    font: "Inter",
    size: 14,
    weight: "400",
    color: "#3b82f6",
    letter_spacing: 0,
  });

  const [mediaBlocks, setMediaBlocks] = useState<any[]>([]);

  const API_BASE = `${API_URL}/api/projects`;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const fetchProjects = () => {
    fetch(API_BASE)
      .then((res) => res.json())
      .then((j) => j.success && setProjects(j.data));
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = mediaBlocks.findIndex((item) => item.id === active.id);
    const newIndex = mediaBlocks.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newBlocks = arrayMove(mediaBlocks, oldIndex, newIndex);
    const reordered = newBlocks.map((block, i) => ({
      ...block,
      sort_order: i,
    }));
    setMediaBlocks(reordered);

    if (typeof selectedTarget === "number") {
      if (selectedTarget === oldIndex) {
        setSelectedTarget(newIndex);
      } else if (
        selectedTarget > Math.min(oldIndex, newIndex) &&
        selectedTarget < Math.max(oldIndex, newIndex)
      ) {
        setSelectedTarget(selectedTarget + (oldIndex > newIndex ? 1 : -1));
      }
    }
  };

  const handleCloudinaryUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    isVideo: boolean = false,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ⭐ KIỂM TRA LOẠI FILE
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    const isVideoFile =
      isVideo ||
      fileType.startsWith("video/") ||
      [".mp4", ".mov", ".mkv", ".avi", ".webm", ".m4v", ".3gp"].some((ext) =>
        fileName.endsWith(ext),
      );

    const mimeType = isVideoFile ? "video" : "image";

    console.log(`📤 Uploading: ${file.name}`);
    console.log(`📦 MIME: ${mimeType}`);

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/upload-media?mime=${mimeType}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.url) {
        const updated = [...mediaBlocks];
        updated[index].src = data.url;
        if (isVideoFile) {
          updated[index].type = "video";
        }
        setMediaBlocks(updated);
        toast.success(`Upload ${isVideoFile ? "video" : "ảnh"} thành công!`);
      } else {
        toast.error(
          "Upload thất bại: " + (data.message || "Lỗi không xác định"),
        );
      }
    } catch (err) {
      console.error("Lỗi upload:", err);
      toast.error("Đã xảy ra lỗi trong quá trình upload!");
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    isVideo: boolean = false, // ⭐ THÊM PARAM
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    // ⭐ GỬI CẢ MIME VÀ overlay=true
    const mimeType = isVideo ? "video" : "image";
    const url = `${API_BASE}/upload-media?mime=${mimeType}&overlay=true`;

    try {
      setLoading(true);
      const res = await fetch(url, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.url) {
        const u = [...mediaBlocks];
        const targetIdx = selectedTarget as number;

        if (!u[targetIdx].overlay) {
          u[targetIdx].overlay = {
            src: "",
            type: "image",
            x: 50,
            y: 50,
            width: 30,
            height: 30,
            opacity: 1,
            rotation: 0,
          };
        }

        u[targetIdx].overlay.src = data.url;
        u[targetIdx].overlay.type = isVideo ? "video" : "image"; // ⭐ LƯU TYPE
        setMediaBlocks(u);
        toast.success(
          `Upload ${isVideo ? "video" : "ảnh"} overlay thành công!`,
        );
      } else {
        toast.error(
          "Upload thất bại: " + (data.message || "Lỗi không xác định"),
        );
      }
    } catch (err) {
      console.error("Lỗi upload overlay:", err);
      toast.error("Đã xảy ra lỗi khi upload overlay!");
    } finally {
      setLoading(false);
    }
  };

  const addBlock = (type: "image" | "video" | "iframe" | "text_block") => {
    const newIdx = mediaBlocks.length;
    const newBlock: any = {
      id: "b_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
      type,
      src: "",
      text_content: { vi: "", en: "", de: "" },
      text_font: "Inter",
      text_size: 24,
      text_weight: "400",
      text_color: "#ffffff",
      text_align: "center",
      text_letter_spacing: 0,
      text_x: 50,
      text_y: 50,
      width_percent: 100,
      height_px: 450,
      align_block: "center",
      sort_order: newIdx,
      has_text_overlay: false,
      // ⭐ THÊM image_overlay CHO IMAGE BLOCK
      ...(type === "image" && {
        overlay: {
          src: "",
          x: 50,
          y: 50,
          width: 30,
          height: 30,
          opacity: 1,
          rotation: 0,
        },
      }),
    };

    setMediaBlocks([...mediaBlocks, newBlock]);
    setSelectedTarget(newIdx);
  };

  const openEditModal = (p: any) => {
    setEditingId(p._id);
    setSlug(p.slug);
    setTitle(p.title);
    setCompany(p.company || "");
    setYear(p.year || "");
    setLiveLabelVi(p.live?.label?.vi || p.live?.text || "");
    setLiveLabelEn(p.live?.label?.en || "");
    setLiveLabelDe(p.live?.label?.de || "");
    setLiveUrl(p.live?.url || "");
    setCatVi(p.category?.vi || "");
    setCatEn(p.category?.en || "");
    setCatDe(p.category?.de || "");
    setDescVi(p.description?.vi || "");
    setDescEn(p.description?.en || "");
    setDescDe(p.description?.de || "");
    setStyleTitle(p.style_title || styleTitle);
    setStyleCompany(p.style_company || styleCompany);
    setStyleYear(p.style_year || styleYear);
    setStyleCategory(p.style_category || styleCategory);
    setStyleDescription(p.style_description || styleDescription);
    setStyleLive(p.style_live || styleLive);
    setStyleCompanyValue(p.style_company_value || styleCompanyValue);
    setStyleYearValue(p.style_year_value || styleYearValue);
    setStyleCategoryValue(p.style_category_value || styleCategoryValue);
    setStyleLiveValue(p.style_live_value || styleLiveValue);
    const normBlocks = (p.media_blocks || []).map((b: any) => ({
      ...b,
      width_percent: b.width_percent !== undefined ? b.width_percent : 100,
      height_px: b.height_px !== undefined ? b.height_px : 450,
      text_content:
        typeof b.text_content === "string"
          ? { vi: b.text_content, en: "", de: "" }
          : b.text_content || { vi: "", en: "", de: "" },
    }));
    setMediaBlocks(
      normBlocks.sort((a: any, b: any) => a.sort_order - b.sort_order),
    );
    setSelectedTarget("metadata");
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!slug.trim()) return toast.error("Vui lòng nhập định danh Slug!");
    if (loading) return;
    setLoading(true);
    const payload = {
      slug,
      title,
      company,
      year,
      live: {
        label: {
          vi: liveLabelVi,
          en: liveLabelEn,
          de: liveLabelDe,
        },
        url: liveUrl,
      },
      style_title: styleTitle,
      style_company: styleCompany,
      style_year: styleYear,
      style_category: styleCategory,
      style_description: styleDescription,
      style_live: styleLive,
      style_company_value: styleCompanyValue,
      style_year_value: styleYearValue,
      style_category_value: styleCategoryValue,
      style_live_value: styleLiveValue,
      category: { vi: catVi, en: catEn, de: catDe },
      description: { vi: descVi, en: descEn, de: descDe },
      media_blocks: mediaBlocks,
    };
    try {
      const res = await fetch(
        editingId ? `${API_BASE}/${editingId}` : API_BASE,
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchProjects();
      } else {
        toast.error("Lỗi lưu dữ liệu: " + data.message);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc muốn xóa dự án "${title}"?`)) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Xóa dự án thành công!");
        fetchProjects();
      } else {
        toast.success("Lỗi xóa dự án: " + data.message);
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Đã xảy ra lỗi khi xóa dự án!");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPayload = () => {
    return {
      slug,
      title,
      company,
      year,
      live: {
        label: {
          vi: liveLabelVi,
          en: liveLabelEn,
          de: liveLabelDe,
        },
        url: liveUrl,
      },
      style_title: styleTitle,
      style_company: styleCompany,
      style_year: styleYear,
      style_category: styleCategory,
      style_description: styleDescription,
      style_live: styleLive,
      style_company_value: styleCompanyValue,
      style_year_value: styleYearValue,
      style_category_value: styleCategoryValue,
      style_live_value: styleLiveValue,
      category: { vi: catVi, en: catEn, de: catDe },
      description: { vi: descVi, en: descEn, de: descDe },
      media_blocks: mediaBlocks,
    };
  };

  return (
    <div className="bg-[#0B0F19] text-[#E2E8F0] min-h-screen p-6 font-sans antialiased selection:bg-blue-500/30 scroll-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4 sticky top-0 px-4 bg-[#0B0F19]/90 backdrop-blur-sm z-10">
        <div>
          <h1 className="text-xl font-black tracking-widest text-white uppercase">
            DETAIL PROJECTS
          </h1>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setTitle("");
            setSlug("");
            setCompany("");
            setYear("");
            setLiveUrl("");
            setCatVi("");
            setCatEn("");
            setCatDe("");
            setDescVi("");
            setDescEn("");
            setDescDe("");
            setMediaBlocks([]);
            setSelectedTarget("metadata");
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-500 text-white transition active:scale-95 shadow-lg shadow-blue-600/20"
        >
          + Thêm Dự Án Mới
        </button>
      </div>

      <div className="mt-6 max-w-7xl mx-auto max-h-[98vh] overflow-y-auto grid grid-cols-1 gap-3">
        {projects.map((p) => (
          <div
            key={p._id}
            className="p-4 bg-[#131A2C] border border-slate-800 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-md hover:border-slate-700 transition-all hover:shadow-lg"
          >
            <div>
              <h2 className="text-sm font-bold text-white">{p.title}</h2>
              <p className="text-[11px] text-slate-400 mt-1">
                URL Slug:{" "}
                <span className="text-blue-400 font-mono">
                  /projects/{p.slug}
                </span>
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => openEditModal(p)}
                className="flex-1 sm:flex-none text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
              >
                Open Editor
              </button>
              <button
                onClick={() => handleDelete(p._id, p.title)}
                disabled={loading}
                className="flex-1 sm:flex-none text-xs bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold transition-all active:scale-95 shadow-lg shadow-red-600/20 disabled:opacity-50"
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 z-50 flex justify-end p-2 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0F1626] w-full h-full max-w-auto rounded-xl border border-slate-800 shadow-2xl flex flex-col lg:flex-row overflow-hidden">
            <div className="flex-1 flex flex-col bg-[#0b0f17] overflow-y-auto p-4 md:p-8 text-white">
              <div className="flex flex-wrap gap-2 p-3 bg-[#1f2937] rounded-lg border border-slate-700 justify-center sticky top-0 z-30 shadow-lg mb-4">
                {BLOCK_TYPES.map(({ id, label, icon: Icon, color }) => (
                  <button
                    key={id}
                    onClick={() => addBlock(id as any)}
                    className={`bg-[#374151] hover:bg-[#4b5563] text-xs font-bold px-3 py-2 rounded-lg text-white transition active:scale-95 flex items-center gap-1.5 border border-slate-600/30 hover:border-${color}-500/50`}
                  >
                    <Icon className={`w-4 h-4 text-${color}-400`} />
                    {label}
                  </button>
                ))}
              </div>

              <div
                onClick={() => setSelectedTarget("metadata")}
                className={`p-5 rounded-xl cursor-pointer transition-all duration-200 mb-4 ${
                  selectedTarget === "metadata"
                    ? "ring-2 ring-blue-500 bg-blue-950/40 border-blue-800 shadow-lg shadow-blue-500/10"
                    : "hover:bg-[#1f2937]/50"
                }`}
              >
                <span className="text-[10px] uppercase font-bold text-white tracking-widest block mb-2">
                  Project Header Metadata
                </span>
                <h1
                  style={{
                    fontFamily: styleTitle.font,
                    fontSize: `${styleTitle.size}px`,
                    fontWeight: styleTitle.weight,
                    color: "#fff",
                    textAlign: styleTitle.align,
                  }}
                >
                  {title || "Tiêu đề dự án mẫu..."}
                </h1>
              </div>

              <p className="text-xs text-slate-500 font-mono mb-4 px-2">
                * Kéo thả các khối để sắp xếp vị trí hiển thị:
              </p>
              <div className="relative">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={mediaBlocks.map((b) => b.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="relative flex flex-wrap gap-y-6 pt-6 border-t border-slate-800 w-full items-start min-h-[200px]">
                      {mediaBlocks.map((block, idx) => (
                        <SortableBlockItem
                          key={block.id}
                          block={block}
                          index={idx}
                          isSelected={selectedTarget === idx}
                          setSelectedTarget={setSelectedTarget}
                          mediaBlocks={mediaBlocks}
                          setMediaBlocks={setMediaBlocks}
                          handleCloudinaryUpload={handleCloudinaryUpload}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            </div>

            <div className="w-full lg:w-[420px] border-t lg:border-t-0 lg:border-l border-slate-800 bg-[#111827] flex flex-col h-[50vh] lg:h-full text-xs text-slate-300 shadow-2xl">
              <div className="p-4 border-b border-slate-800 flex flex-wrap gap-2 justify-between items-center bg-black/40">
                <div>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {selectedTarget === "metadata"
                      ? `Slug: /${slug || "---"}`
                      : `Đang sửa khối #${Number(selectedTarget) + 1}`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-emerald-600 text-white px-3 py-1.5 font-bold rounded-lg hover:bg-emerald-500 shadow-md transition-all active:scale-95 text-xs"
                  >
                    {loading ? "Saving..." : "Lưu"}
                  </button>
                  <button
                    onClick={() => {
                      const currentData = getCurrentPayload();
                      setPreviewPayload(currentData);
                      setIsPreviewOpen(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 font-bold rounded-lg shadow-md transition-all active:scale-95 text-xs"
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-xs px-3 py-1.5 rounded text-white transition"
                  >
                    Đóng
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {selectedTarget === "metadata" ? (
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="font-bold text-blue-400 uppercase tracking-wide border-b border-slate-800 pb-1">
                      Project Information
                    </h3>
                    <div>
                      <label className="block mb-1 text-slate-400">
                        Tiêu đề chính (Title)
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:border-blue-500 focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-slate-400">
                        Định danh URL (Slug)
                      </label>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) =>
                          setSlug(
                            e.target.value.toLowerCase().replace(/\s+/g, "-"),
                          )
                        }
                        className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-blue-400 font-mono text-xs focus:border-blue-500 focus:outline-none transition"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block mb-1 text-slate-400">
                          Công ty
                        </label>
                        <input
                          type="text"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:border-blue-500 focus:outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-slate-400">
                          Thời gian (Year)
                        </label>
                        <input
                          type="text"
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:border-blue-500 focus:outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="bg-[#1F2937]/30 p-3 rounded-lg border border-slate-800 space-y-2">
                      <h4 className="font-bold text-[11px] text-amber-400 uppercase tracking-widest">
                        Thể Loại Dự Án
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-1">
                            VI
                          </label>
                          <input
                            type="text"
                            value={catVi}
                            onChange={(e) => setCatVi(e.target.value)}
                            className="w-full bg-black border border-slate-800 p-1.5 rounded text-white text-[11px] focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-1">
                            EN
                          </label>
                          <input
                            type="text"
                            value={catEn}
                            onChange={(e) => setCatEn(e.target.value)}
                            className="w-full bg-black border border-slate-800 p-1.5 rounded text-white text-[11px] focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-1">
                            DE
                          </label>
                          <input
                            type="text"
                            value={catDe}
                            onChange={(e) => setCatDe(e.target.value)}
                            className="w-full bg-black border border-slate-800 p-1.5 rounded text-white text-[11px] focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#1F2937]/50 p-3 rounded-lg border border-slate-800/80 space-y-3">
                      <h4 className="text-white font-bold text-[11px] uppercase tracking-wide text-indigo-400">
                        Cấu hình Live Project
                      </h4>

                      <div>
                        <label className="block mb-1 text-slate-400 text-[10px] font-medium">
                          Nhãn hiển thị
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-[9px] text-slate-500 block mb-0.5">
                              🇻🇳 VI
                            </label>
                            <input
                              type="text"
                              value={liveLabelVi}
                              onChange={(e) => setLiveLabelVi(e.target.value)}
                              placeholder="Xem dự án"
                              className="w-full bg-[#111827] border border-slate-700 p-1.5 rounded text-white text-[11px] focus:border-blue-500 focus:outline-none transition"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-slate-500 block mb-0.5">
                              🇬🇧 EN
                            </label>
                            <input
                              type="text"
                              value={liveLabelEn}
                              onChange={(e) => setLiveLabelEn(e.target.value)}
                              placeholder="View Project"
                              className="w-full bg-[#111827] border border-slate-700 p-1.5 rounded text-white text-[11px] focus:border-blue-500 focus:outline-none transition"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-slate-500 block mb-0.5">
                              🇩🇪 DE
                            </label>
                            <input
                              type="text"
                              value={liveLabelDe}
                              onChange={(e) => setLiveLabelDe(e.target.value)}
                              placeholder="Projekt ansehen"
                              className="w-full bg-[#111827] border border-slate-700 p-1.5 rounded text-white text-[11px] focus:border-blue-500 focus:outline-none transition"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block mb-1 text-slate-400 text-[10px] font-medium">
                          Đường dẫn liên kết
                        </label>
                        <input
                          type="text"
                          value={liveUrl}
                          onChange={(e) => setLiveUrl(e.target.value)}
                          placeholder="https://example.com"
                          className="w-full bg-[#111827] border border-slate-700 p-2 rounded text-blue-400 font-mono text-xs focus:border-blue-500 focus:outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="bg-[#1F2937]/30 p-3 rounded-lg border border-slate-800 space-y-3">
                      <h4 className="font-bold text-[11px] text-teal-400 uppercase tracking-widest">
                        Mô tả tóm tắt
                      </h4>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">
                          Mô tả (VI)
                        </label>
                        <textarea
                          value={descVi}
                          onChange={(e) => setDescVi(e.target.value)}
                          className="w-full bg-black border border-slate-800 p-2 h-16 rounded text-white text-xs resize-none focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">
                          Description (EN)
                        </label>
                        <textarea
                          value={descEn}
                          onChange={(e) => setDescEn(e.target.value)}
                          className="w-full bg-black border border-slate-800 p-2 h-16 rounded text-white text-xs resize-none focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">
                          Beschreibung (DE)
                        </label>
                        <textarea
                          value={descDe}
                          onChange={(e) => setDescDe(e.target.value)}
                          className="w-full bg-black border border-slate-800 p-2 h-16 rounded text-white text-xs resize-none focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-4 border-t border-slate-800 pt-4 mt-4">
                        <h3 className="font-bold text-pink-400 uppercase tracking-wide border-b border-slate-800 pb-1">
                          Typography Styles
                        </h3>

                        {/* 1. Title Style */}
                        <div className="bg-[#1F2937]/30 p-3 rounded-lg border border-slate-800 space-y-2">
                          <h4 className="font-bold text-[11px] text-white uppercase tracking-widest">
                            1. Title Style (Không bắt buộc cấu hình)
                          </h4>
                          <div className="grid grid-cols-1 gap-2">
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Font
                              </label>
                              <FontPickerComponent
                                value={styleTitle.font}
                                onChange={(font) =>
                                  setStyleTitle({ ...styleTitle, font })
                                }
                                placeholder="Chọn font..."
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Size
                              </label>
                              <input
                                type="number"
                                value={styleTitle.size}
                                onChange={(e) =>
                                  setStyleTitle({
                                    ...styleTitle,
                                    size: Number(e.target.value),
                                  })
                                }
                                className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Weight
                              </label>
                              <select
                                value={styleTitle.weight}
                                onChange={(e) =>
                                  setStyleTitle({
                                    ...styleTitle,
                                    weight: e.target.value,
                                  })
                                }
                                className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                              >
                                {WEIGHT_OPTIONS.map((w) => (
                                  <option key={w.value} value={w.value}>
                                    {w.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Color
                              </label>
                              <div className="flex gap-1">
                                <input
                                  type="color"
                                  value={styleTitle.color}
                                  onChange={(e) =>
                                    setStyleTitle({
                                      ...styleTitle,
                                      color: e.target.value,
                                    })
                                  }
                                  className="w-7 h-7 bg-transparent border-0 cursor-pointer p-0"
                                />
                                <input
                                  type="text"
                                  value={styleTitle.color}
                                  onChange={(e) =>
                                    setStyleTitle({
                                      ...styleTitle,
                                      color: e.target.value,
                                    })
                                  }
                                  className="flex-1 bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                                />
                              </div>
                            </div>
                            <div className="col-span-2">
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Letter Spacing
                              </label>
                              <input
                                type="number"
                                step="0.5"
                                value={styleTitle.letter_spacing}
                                onChange={(e) =>
                                  setStyleTitle({
                                    ...styleTitle,
                                    letter_spacing: Number(e.target.value),
                                  })
                                }
                                className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 2. Company Style */}
                        <div className="bg-[#1F2937]/30 p-3 rounded-lg border border-slate-800 space-y-2">
                          <h4 className="font-bold text-[11px] text-cyan-400 uppercase tracking-widest">
                            2. Company Style
                          </h4>
                          <div className="grid grid-cols-1 gap-2">
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Font
                              </label>
                              <FontPickerComponent
                                value={styleCompany.font}
                                onChange={(font) =>
                                  setStyleCompany({ ...styleCompany, font })
                                }
                                placeholder="Chọn font..."
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Size
                              </label>
                              <input
                                type="number"
                                value={styleCompany.size}
                                onChange={(e) =>
                                  setStyleCompany({
                                    ...styleCompany,
                                    size: Number(e.target.value),
                                  })
                                }
                                className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Weight
                              </label>
                              <select
                                value={styleCompany.weight}
                                onChange={(e) =>
                                  setStyleCompany({
                                    ...styleCompany,
                                    weight: e.target.value,
                                  })
                                }
                                className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                              >
                                {WEIGHT_OPTIONS.map((w) => (
                                  <option key={w.value} value={w.value}>
                                    {w.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Color
                              </label>
                              <div className="flex gap-1">
                                <input
                                  type="color"
                                  value={styleCompany.color}
                                  onChange={(e) =>
                                    setStyleCompany({
                                      ...styleCompany,
                                      color: e.target.value,
                                    })
                                  }
                                  className="w-7 h-7 bg-transparent border-0 cursor-pointer p-0"
                                />
                                <input
                                  type="text"
                                  value={styleCompany.color}
                                  onChange={(e) =>
                                    setStyleCompany({
                                      ...styleCompany,
                                      color: e.target.value,
                                    })
                                  }
                                  className="flex-1 bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                                />
                              </div>
                            </div>
                            <div className="col-span-2">
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Letter Spacing
                              </label>
                              <input
                                type="number"
                                step="0.5"
                                value={styleCompany.letter_spacing}
                                onChange={(e) =>
                                  setStyleCompany({
                                    ...styleCompany,
                                    letter_spacing: Number(e.target.value),
                                  })
                                }
                                className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 2.1 Company Value Style */}
                        <div className="bg-[#1F2937]/30 p-3 rounded-lg border border-slate-800/50 ml-4 space-y-2">
                          <h4 className="font-bold text-[10px] text-cyan-400/60 uppercase tracking-widest">
                            2.1 Company Value Style
                          </h4>
                          <div className="grid grid-cols-1 gap-2">
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Font
                              </label>
                              <FontPickerComponent
                                value={styleCompanyValue.font}
                                onChange={(font) =>
                                  setStyleCompanyValue({
                                    ...styleCompanyValue,
                                    font,
                                  })
                                }
                                placeholder="Chọn font..."
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Size
                              </label>
                              <input
                                type="number"
                                value={styleCompanyValue.size}
                                onChange={(e) =>
                                  setStyleCompanyValue({
                                    ...styleCompanyValue,
                                    size: Number(e.target.value),
                                  })
                                }
                                className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Weight
                              </label>
                              <select
                                value={styleCompanyValue.weight}
                                onChange={(e) =>
                                  setStyleCompanyValue({
                                    ...styleCompanyValue,
                                    weight: e.target.value,
                                  })
                                }
                                className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                              >
                                {WEIGHT_OPTIONS.map((w) => (
                                  <option key={w.value} value={w.value}>
                                    {w.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Color
                              </label>
                              <div className="flex gap-1">
                                <input
                                  type="color"
                                  value={styleCompanyValue.color}
                                  onChange={(e) =>
                                    setStyleCompanyValue({
                                      ...styleCompanyValue,
                                      color: e.target.value,
                                    })
                                  }
                                  className="w-7 h-7 bg-transparent border-0 cursor-pointer p-0"
                                />
                                <input
                                  type="text"
                                  value={styleCompanyValue.color}
                                  onChange={(e) =>
                                    setStyleCompanyValue({
                                      ...styleCompanyValue,
                                      color: e.target.value,
                                    })
                                  }
                                  className="flex-1 bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                                />
                              </div>
                            </div>
                            <div className="col-span-2">
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Letter Spacing
                              </label>
                              <input
                                type="number"
                                step="0.5"
                                value={styleCompanyValue.letter_spacing}
                                onChange={(e) =>
                                  setStyleCompanyValue({
                                    ...styleCompanyValue,
                                    letter_spacing: Number(e.target.value),
                                  })
                                }
                                className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 3. Timeline Style */}
                        <div className="bg-[#1F2937]/30 p-3 rounded-lg border border-slate-800 space-y-2">
                          <h4 className="font-bold text-[11px] text-yellow-400 uppercase tracking-widest">
                            3. Timeline Style
                          </h4>
                          <div className="grid grid-cols-1 gap-2">
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Font
                              </label>
                              <FontPickerComponent
                                value={styleYear.font}
                                onChange={(font) =>
                                  setStyleYear({ ...styleYear, font })
                                }
                                placeholder="Chọn font..."
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Size
                              </label>
                              <input
                                type="number"
                                value={styleYear.size}
                                onChange={(e) =>
                                  setStyleYear({
                                    ...styleYear,
                                    size: Number(e.target.value),
                                  })
                                }
                                className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Weight
                              </label>
                              <select
                                value={styleYear.weight}
                                onChange={(e) =>
                                  setStyleYear({
                                    ...styleYear,
                                    weight: e.target.value,
                                  })
                                }
                                className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                              >
                                {WEIGHT_OPTIONS.map((w) => (
                                  <option key={w.value} value={w.value}>
                                    {w.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Color
                              </label>
                              <div className="flex gap-1">
                                <input
                                  type="color"
                                  value={styleYear.color}
                                  onChange={(e) =>
                                    setStyleYear({
                                      ...styleYear,
                                      color: e.target.value,
                                    })
                                  }
                                  className="w-7 h-7 bg-transparent border-0 cursor-pointer p-0"
                                />
                                <input
                                  type="text"
                                  value={styleYear.color}
                                  onChange={(e) =>
                                    setStyleYear({
                                      ...styleYear,
                                      color: e.target.value,
                                    })
                                  }
                                  className="flex-1 bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                                />
                              </div>
                            </div>
                            <div className="col-span-2">
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Letter Spacing
                              </label>
                              <input
                                type="number"
                                step="0.5"
                                value={styleYear.letter_spacing}
                                onChange={(e) =>
                                  setStyleYear({
                                    ...styleYear,
                                    letter_spacing: Number(e.target.value),
                                  })
                                }
                                className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 3.1 Year Value Style */}
                        <div className="bg-[#1F2937]/30 p-3 rounded-lg border border-slate-800/50 ml-4 space-y-2">
                          <h4 className="font-bold text-[10px] text-yellow-400/60 uppercase tracking-widest">
                            3.1 Year Value Style
                          </h4>
                          <div className="grid grid-cols-1 gap-2">
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Font
                              </label>
                              <FontPickerComponent
                                value={styleYearValue.font}
                                onChange={(font) =>
                                  setStyleYearValue({ ...styleYearValue, font })
                                }
                                placeholder="Chọn font..."
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Size
                              </label>
                              <input
                                type="number"
                                value={styleYearValue.size}
                                onChange={(e) =>
                                  setStyleYearValue({
                                    ...styleYearValue,
                                    size: Number(e.target.value),
                                  })
                                }
                                className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Weight
                              </label>
                              <select
                                value={styleYearValue.weight}
                                onChange={(e) =>
                                  setStyleYearValue({
                                    ...styleYearValue,
                                    weight: e.target.value,
                                  })
                                }
                                className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                              >
                                {WEIGHT_OPTIONS.map((w) => (
                                  <option key={w.value} value={w.value}>
                                    {w.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Color
                              </label>
                              <div className="flex gap-1">
                                <input
                                  type="color"
                                  value={styleYearValue.color}
                                  onChange={(e) =>
                                    setStyleYearValue({
                                      ...styleYearValue,
                                      color: e.target.value,
                                    })
                                  }
                                  className="w-7 h-7 bg-transparent border-0 cursor-pointer p-0"
                                />
                                <input
                                  type="text"
                                  value={styleYearValue.color}
                                  onChange={(e) =>
                                    setStyleYearValue({
                                      ...styleYearValue,
                                      color: e.target.value,
                                    })
                                  }
                                  className="flex-1 bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                                />
                              </div>
                            </div>
                            <div className="col-span-2">
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Letter Spacing
                              </label>
                              <input
                                type="number"
                                step="0.5"
                                value={styleYearValue.letter_spacing}
                                onChange={(e) =>
                                  setStyleYearValue({
                                    ...styleYearValue,
                                    letter_spacing: Number(e.target.value),
                                  })
                                }
                                className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 4. Category Style */}
                        <div className="bg-[#1F2937]/30 p-3 rounded-lg border border-slate-800 space-y-2">
                          <h4 className="font-bold text-[11px] text-orange-400 uppercase tracking-widest">
                            4. Category Style
                          </h4>
                          <div className="grid grid-cols-1 gap-2">
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Font
                              </label>
                              <FontPickerComponent
                                value={styleCategory.font}
                                onChange={(font) =>
                                  setStyleCategory({ ...styleCategory, font })
                                }
                                placeholder="Chọn font..."
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Size
                              </label>
                              <input
                                type="number"
                                value={styleCategory.size}
                                onChange={(e) =>
                                  setStyleCategory({
                                    ...styleCategory,
                                    size: Number(e.target.value),
                                  })
                                }
                                className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Weight
                              </label>
                              <select
                                value={styleCategory.weight}
                                onChange={(e) =>
                                  setStyleCategory({
                                    ...styleCategory,
                                    weight: e.target.value,
                                  })
                                }
                                className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                              >
                                {WEIGHT_OPTIONS.map((w) => (
                                  <option key={w.value} value={w.value}>
                                    {w.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Color
                              </label>
                              <div className="flex gap-1">
                                <input
                                  type="color"
                                  value={styleCategory.color}
                                  onChange={(e) =>
                                    setStyleCategory({
                                      ...styleCategory,
                                      color: e.target.value,
                                    })
                                  }
                                  className="w-7 h-7 bg-transparent border-0 cursor-pointer p-0"
                                />
                                <input
                                  type="text"
                                  value={styleCategory.color}
                                  onChange={(e) =>
                                    setStyleCategory({
                                      ...styleCategory,
                                      color: e.target.value,
                                    })
                                  }
                                  className="flex-1 bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                                />
                              </div>
                            </div>
                            <div className="col-span-2">
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Letter Spacing
                              </label>
                              <input
                                type="number"
                                step="0.5"
                                value={styleCategory.letter_spacing}
                                onChange={(e) =>
                                  setStyleCategory({
                                    ...styleCategory,
                                    letter_spacing: Number(e.target.value),
                                  })
                                }
                                className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 4.1 Category Value Style */}
                        <div className="bg-[#1F2937]/30 p-3 rounded-lg border border-slate-800/50 ml-4 space-y-2">
                          <h4 className="font-bold text-[10px] text-orange-400/60 uppercase tracking-widest">
                            4.1 Category Value Style
                          </h4>
                          <div className="grid grid-cols-1 gap-2">
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Font
                              </label>
                              <FontPickerComponent
                                value={styleCategoryValue.font}
                                onChange={(font) =>
                                  setStyleCategoryValue({
                                    ...styleCategoryValue,
                                    font,
                                  })
                                }
                                placeholder="Chọn font..."
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Size
                              </label>
                              <input
                                type="number"
                                value={styleCategoryValue.size}
                                onChange={(e) =>
                                  setStyleCategoryValue({
                                    ...styleCategoryValue,
                                    size: Number(e.target.value),
                                  })
                                }
                                className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Weight
                              </label>
                              <select
                                value={styleCategoryValue.weight}
                                onChange={(e) =>
                                  setStyleCategoryValue({
                                    ...styleCategoryValue,
                                    weight: e.target.value,
                                  })
                                }
                                className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                              >
                                {WEIGHT_OPTIONS.map((w) => (
                                  <option key={w.value} value={w.value}>
                                    {w.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Color
                              </label>
                              <div className="flex gap-1">
                                <input
                                  type="color"
                                  value={styleCategoryValue.color}
                                  onChange={(e) =>
                                    setStyleCategoryValue({
                                      ...styleCategoryValue,
                                      color: e.target.value,
                                    })
                                  }
                                  className="w-7 h-7 bg-transparent border-0 cursor-pointer p-0"
                                />
                                <input
                                  type="text"
                                  value={styleCategoryValue.color}
                                  onChange={(e) =>
                                    setStyleCategoryValue({
                                      ...styleCategoryValue,
                                      color: e.target.value,
                                    })
                                  }
                                  className="flex-1 bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                                />
                              </div>
                            </div>
                            <div className="col-span-2">
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Letter Spacing
                              </label>
                              <input
                                type="number"
                                step="0.5"
                                value={styleCategoryValue.letter_spacing}
                                onChange={(e) =>
                                  setStyleCategoryValue({
                                    ...styleCategoryValue,
                                    letter_spacing: Number(e.target.value),
                                  })
                                }
                                className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 5. Description Style */}
                        <div className="bg-[#1F2937]/30 p-3 rounded-lg border border-slate-800 space-y-2">
                          <h4 className="font-bold text-[11px] text-teal-400 uppercase tracking-widest">
                            5. Description Style
                          </h4>
                          <div className="grid grid-cols-1 gap-2">
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Font
                              </label>
                              <FontPickerComponent
                                value={styleDescription.font}
                                onChange={(font) =>
                                  setStyleDescription({
                                    ...styleDescription,
                                    font,
                                  })
                                }
                                placeholder="Chọn font..."
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Size
                              </label>
                              <input
                                type="number"
                                value={styleDescription.size}
                                onChange={(e) =>
                                  setStyleDescription({
                                    ...styleDescription,
                                    size: Number(e.target.value),
                                  })
                                }
                                className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Weight
                              </label>
                              <select
                                value={styleDescription.weight}
                                onChange={(e) =>
                                  setStyleDescription({
                                    ...styleDescription,
                                    weight: e.target.value,
                                  })
                                }
                                className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                              >
                                {WEIGHT_OPTIONS.map((w) => (
                                  <option key={w.value} value={w.value}>
                                    {w.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Color
                              </label>
                              <div className="flex gap-1">
                                <input
                                  type="color"
                                  value={styleDescription.color}
                                  onChange={(e) =>
                                    setStyleDescription({
                                      ...styleDescription,
                                      color: e.target.value,
                                    })
                                  }
                                  className="w-7 h-7 bg-transparent border-0 cursor-pointer p-0"
                                />
                                <input
                                  type="text"
                                  value={styleDescription.color}
                                  onChange={(e) =>
                                    setStyleDescription({
                                      ...styleDescription,
                                      color: e.target.value,
                                    })
                                  }
                                  className="flex-1 bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                                />
                              </div>
                            </div>
                            <div className="col-span-2">
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Letter Spacing
                              </label>
                              <input
                                type="number"
                                step="0.5"
                                value={styleDescription.letter_spacing}
                                onChange={(e) =>
                                  setStyleDescription({
                                    ...styleDescription,
                                    letter_spacing: Number(e.target.value),
                                  })
                                }
                                className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 6. Live Style */}
                        <div className="bg-[#1F2937]/30 p-3 rounded-lg border border-slate-800 space-y-2">
                          <h4 className="font-bold text-[11px] text-indigo-400 uppercase tracking-widest">
                            6. Live Style
                          </h4>
                          <div className="grid grid-cols-1 gap-2">
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Font
                              </label>
                              <FontPickerComponent
                                value={styleLive.font}
                                onChange={(font) =>
                                  setStyleLive({ ...styleLive, font })
                                }
                                placeholder="Chọn font..."
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Size
                              </label>
                              <input
                                type="number"
                                value={styleLive.size}
                                onChange={(e) =>
                                  setStyleLive({
                                    ...styleLive,
                                    size: Number(e.target.value),
                                  })
                                }
                                className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Weight
                              </label>
                              <select
                                value={styleLive.weight}
                                onChange={(e) =>
                                  setStyleLive({
                                    ...styleLive,
                                    weight: e.target.value,
                                  })
                                }
                                className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                              >
                                {WEIGHT_OPTIONS.map((w) => (
                                  <option key={w.value} value={w.value}>
                                    {w.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Color
                              </label>
                              <div className="flex gap-1">
                                <input
                                  type="color"
                                  value={styleLive.color}
                                  onChange={(e) =>
                                    setStyleLive({
                                      ...styleLive,
                                      color: e.target.value,
                                    })
                                  }
                                  className="w-7 h-7 bg-transparent border-0 cursor-pointer p-0"
                                />
                                <input
                                  type="text"
                                  value={styleLive.color}
                                  onChange={(e) =>
                                    setStyleLive({
                                      ...styleLive,
                                      color: e.target.value,
                                    })
                                  }
                                  className="flex-1 bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                                />
                              </div>
                            </div>
                            <div className="col-span-2">
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Letter Spacing
                              </label>
                              <input
                                type="number"
                                step="0.5"
                                value={styleLive.letter_spacing}
                                onChange={(e) =>
                                  setStyleLive({
                                    ...styleLive,
                                    letter_spacing: Number(e.target.value),
                                  })
                                }
                                className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 6.1 Live Value Style */}
                        <div className="bg-[#1F2937]/30 p-3 rounded-lg border border-slate-800/50 ml-4 space-y-2">
                          <h4 className="font-bold text-[10px] text-indigo-400/60 uppercase tracking-widest">
                            6.1 Live Value Style
                          </h4>
                          <div className="grid grid-cols-1 gap-2">
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Font
                              </label>
                              <FontPickerComponent
                                value={styleLiveValue.font}
                                onChange={(font) =>
                                  setStyleLiveValue({ ...styleLiveValue, font })
                                }
                                placeholder="Chọn font..."
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Size
                              </label>
                              <input
                                type="number"
                                value={styleLiveValue.size}
                                onChange={(e) =>
                                  setStyleLiveValue({
                                    ...styleLiveValue,
                                    size: Number(e.target.value),
                                  })
                                }
                                className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Weight
                              </label>
                              <select
                                value={styleLiveValue.weight}
                                onChange={(e) =>
                                  setStyleLiveValue({
                                    ...styleLiveValue,
                                    weight: e.target.value,
                                  })
                                }
                                className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                              >
                                {WEIGHT_OPTIONS.map((w) => (
                                  <option key={w.value} value={w.value}>
                                    {w.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Color
                              </label>
                              <div className="flex gap-1">
                                <input
                                  type="color"
                                  value={styleLiveValue.color}
                                  onChange={(e) =>
                                    setStyleLiveValue({
                                      ...styleLiveValue,
                                      color: e.target.value,
                                    })
                                  }
                                  className="w-7 h-7 bg-transparent border-0 cursor-pointer p-0"
                                />
                                <input
                                  type="text"
                                  value={styleLiveValue.color}
                                  onChange={(e) =>
                                    setStyleLiveValue({
                                      ...styleLiveValue,
                                      color: e.target.value,
                                    })
                                  }
                                  className="flex-1 bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                                />
                              </div>
                            </div>
                            <div className="col-span-2">
                              <label className="text-[10px] text-slate-400 block mb-0.5">
                                Letter Spacing
                              </label>
                              <input
                                type="number"
                                step="0.5"
                                value={styleLiveValue.letter_spacing}
                                onChange={(e) =>
                                  setStyleLiveValue({
                                    ...styleLiveValue,
                                    letter_spacing: Number(e.target.value),
                                  })
                                }
                                className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : typeof selectedTarget === "number" &&
                  mediaBlocks[selectedTarget] ? (
                  <div className="space-y-5 animate-fade-in">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <h3 className="font-black text-blue-400 uppercase tracking-wide">
                        Cấu hình Khối #{selectedTarget + 1}
                      </h3>
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-400 font-mono">
                        {mediaBlocks[selectedTarget].type}
                      </span>
                    </div>

                    <div className="bg-zinc-900/50 p-3 rounded-lg border border-slate-800 space-y-4">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1 text-slate-400">
                          <label className="font-bold">
                            Chiều rộng khối (Width %):
                          </label>
                          <span className="font-mono font-bold text-blue-400">
                            {mediaBlocks[selectedTarget].width_percent || 100}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="15"
                          max="100"
                          step="5"
                          value={
                            mediaBlocks[selectedTarget].width_percent || 100
                          }
                          onChange={(e) => {
                            const u = [...mediaBlocks];
                            u[selectedTarget].width_percent = Number(
                              e.target.value,
                            );
                            setMediaBlocks(u);
                          }}
                          className="w-full accent-blue-500 cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1 text-slate-400">
                          <label className="font-bold">
                            Chiều cao khối (Height px):
                          </label>
                          <span className="font-mono font-bold text-emerald-400">
                            {mediaBlocks[selectedTarget].height_px ?? 450}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="150"
                          max="2000"
                          step="10"
                          value={mediaBlocks[selectedTarget].height_px ?? 450}
                          onChange={(e) => {
                            const u = [...mediaBlocks];
                            u[selectedTarget].height_px = Number(
                              e.target.value,
                            );
                            setMediaBlocks(u);
                          }}
                          className="w-full accent-emerald-500 cursor-pointer"
                        />
                        {mediaBlocks[selectedTarget].height_px > 1000 && (
                          <p className="text-[10px] text-amber-400 mt-1">
                            Chiều cao &gt; 1000px sẽ tự động giới hạn hiển thị
                            với clamp
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block mb-1 text-slate-400">
                        Vị trí căn lề khối (Block Align Layout)
                      </label>
                      <select
                        value={
                          mediaBlocks[selectedTarget].align_block || "center"
                        }
                        onChange={(e) => {
                          const u = [...mediaBlocks];
                          u[selectedTarget].align_block = e.target.value;
                          setMediaBlocks(u);
                        }}
                        className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none focus:border-blue-500"
                      >
                        <option value="left">Căn Lề Trái</option>
                        <option value="center">Căn Giữa</option>
                        <option value="right">Căn Lề Phải</option>
                      </select>
                    </div>

                    {mediaBlocks[selectedTarget].type === "image" && (
                      <div className="bg-[#1F2937]/50 p-3 rounded-lg border border-slate-800 space-y-3">
                        <label className="flex items-center gap-2 text-white font-bold cursor-pointer text-xs select-none">
                          <input
                            type="checkbox"
                            checked={
                              !!mediaBlocks[selectedTarget].has_text_overlay
                            }
                            onChange={(e) => {
                              const u = [...mediaBlocks];
                              u[selectedTarget].has_text_overlay =
                                e.target.checked;
                              setMediaBlocks(u);
                            }}
                            className="w-4 h-4 accent-blue-500"
                          />
                          Kích hoạt văn bản đè lên ảnh
                        </label>
                        {mediaBlocks[selectedTarget].has_text_overlay && (
                          <div className="space-y-3 pt-2 border-t border-slate-700 animate-fade-in">
                            <div className="grid grid-cols-1 gap-2">
                              <div>
                                <label className="block text-[11px] text-slate-400">
                                  Tọa độ X (
                                  {mediaBlocks[selectedTarget].text_x ?? 50}%)
                                </label>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={
                                    mediaBlocks[selectedTarget].text_x ?? 50
                                  }
                                  onChange={(e) => {
                                    const u = [...mediaBlocks];
                                    u[selectedTarget].text_x = Number(
                                      e.target.value,
                                    );
                                    setMediaBlocks(u);
                                  }}
                                  className="w-full accent-indigo-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] text-slate-400">
                                  Tọa độ Y (
                                  {mediaBlocks[selectedTarget].text_y ?? 50}%)
                                </label>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={
                                    mediaBlocks[selectedTarget].text_y ?? 50
                                  }
                                  onChange={(e) => {
                                    const u = [...mediaBlocks];
                                    u[selectedTarget].text_y = Number(
                                      e.target.value,
                                    );
                                    setMediaBlocks(u);
                                  }}
                                  className="w-full accent-indigo-500"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[11px] mb-1 text-slate-400">
                                Phông chữ Overlay
                              </label>
                              <FontPickerComponent
                                value={
                                  mediaBlocks[selectedTarget].text_font ||
                                  "Inter"
                                }
                                onChange={(font) => {
                                  const u = [...mediaBlocks];
                                  u[selectedTarget].text_font = font;
                                  setMediaBlocks(u);
                                }}
                                placeholder="Chọn font..."
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ⭐ OVERLAY SETTINGS (HỖ TRỢ CẢ ẢNH VÀ VIDEO) */}
                    {mediaBlocks[selectedTarget]?.type === "image" && (
                      <div className="bg-purple-950/30 p-3 rounded-lg border border-purple-800/40 space-y-3">
                        <h4 className="font-bold text-[11px] text-purple-400 uppercase tracking-widest flex items-center gap-2">
                          Overlay (Ảnh/Video đè)
                          <span className="text-[8px] text-slate-500 font-normal ml-auto">
                            {overlayType === "video" ? "Video" : "Ảnh"}
                          </span>
                        </h4>

                        {/* ⭐ NÚT CHỌN LOẠI OVERLAY */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => setOverlayType("image")}
                            className={`flex-1 text-[10px] font-bold py-1.5 rounded transition ${
                              overlayType === "image"
                                ? "bg-blue-600 text-white"
                                : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                            }`}
                          >
                            Ảnh
                          </button>
                          <button
                            onClick={() => setOverlayType("video")}
                            className={`flex-1 text-[10px] font-bold py-1.5 rounded transition ${
                              overlayType === "video"
                                ? "bg-purple-600 text-white"
                                : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                            }`}
                          >
                            Video
                          </button>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">
                            URL {overlayType === "video" ? "video" : "ảnh"}{" "}
                            overlay
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={
                                mediaBlocks[selectedTarget]?.overlay?.src || ""
                              }
                              onChange={(e) => {
                                const u = [...mediaBlocks];
                                if (!u[selectedTarget].overlay) {
                                  u[selectedTarget].overlay = {
                                    src: "",
                                    type: "image",
                                    x: 50,
                                    y: 50,
                                    width: 30,
                                    height: 30,
                                    opacity: 1,
                                    rotation: 0,
                                  };
                                }
                                u[selectedTarget].overlay.src = e.target.value;
                                setMediaBlocks(u);
                              }}
                              placeholder={`Dán link ${overlayType === "video" ? "video" : "ảnh"} overlay...`}
                              className="flex-1 bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:border-purple-500 focus:outline-none"
                            />
                            <label className="cursor-pointer bg-purple-600 hover:bg-purple-500 text-white text-[10px] px-3 py-2 rounded transition flex items-center gap-1 whitespace-nowrap">
                              Upload
                              <input
                                type="file"
                                accept={
                                  overlayType === "video"
                                    ? "video/*,.mp4,.mov,.mkv,.avi,.webm"
                                    : "image/*,.jpg,.jpeg,.png,.webp,.svg,.gif"
                                }
                                onChange={(e) =>
                                  handleOverlayUpload(
                                    e,
                                    overlayType === "video",
                                  )
                                }
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>

                        {/* ⭐ PREVIEW OVERLAY */}
                        {mediaBlocks[selectedTarget]?.overlay?.src && (
                          <div className="bg-black/50 rounded-lg p-2">
                            {mediaBlocks[selectedTarget].overlay.type ===
                            "video" ? (
                              <video
                                src={mediaBlocks[selectedTarget].overlay.src}
                                muted
                                loop
                                autoPlay
                                className="w-full rounded max-h-[150px] object-contain"
                              />
                            ) : (
                              <img
                                src={mediaBlocks[selectedTarget].overlay.src}
                                alt="Overlay preview"
                                className="w-full rounded max-h-[150px] object-contain"
                              />
                            )}
                            <p className="text-[8px] text-slate-500 text-center mt-1">
                              {mediaBlocks[selectedTarget].overlay.type ===
                              "video"
                                ? "Video"
                                : "Ảnh"}{" "}
                              overlay
                            </p>
                          </div>
                        )}

                        {/* ⭐ ĐIỀU KHIỂN VỊ TRÍ */}
                        {mediaBlocks[selectedTarget]?.overlay?.src && (
                          <div className="space-y-2 pt-2 border-t border-purple-800/30">
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-1">
                                Vị trí X:{" "}
                                {mediaBlocks[selectedTarget].overlay?.x || 50}%
                              </label>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={
                                  mediaBlocks[selectedTarget].overlay?.x || 50
                                }
                                onChange={(e) => {
                                  const u = [...mediaBlocks];
                                  u[selectedTarget].overlay.x = Number(
                                    e.target.value,
                                  );
                                  setMediaBlocks(u);
                                }}
                                className="w-full accent-purple-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-1">
                                Vị trí Y:{" "}
                                {mediaBlocks[selectedTarget].overlay?.y || 50}%
                              </label>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={
                                  mediaBlocks[selectedTarget].overlay?.y || 50
                                }
                                onChange={(e) => {
                                  const u = [...mediaBlocks];
                                  u[selectedTarget].overlay.y = Number(
                                    e.target.value,
                                  );
                                  setMediaBlocks(u);
                                }}
                                className="w-full accent-purple-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-1">
                                Chiều rộng:{" "}
                                {mediaBlocks[selectedTarget].overlay?.width ||
                                  30}
                                %
                              </label>
                              <input
                                type="range"
                                min="5"
                                max="80"
                                value={
                                  mediaBlocks[selectedTarget].overlay?.width ||
                                  30
                                }
                                onChange={(e) => {
                                  const u = [...mediaBlocks];
                                  u[selectedTarget].overlay.width = Number(
                                    e.target.value,
                                  );
                                  setMediaBlocks(u);
                                }}
                                className="w-full accent-purple-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-1">
                                Chiều cao:{" "}
                                {mediaBlocks[selectedTarget].overlay?.height ||
                                  30}
                                %
                              </label>
                              <input
                                type="range"
                                min="5"
                                max="80"
                                value={
                                  mediaBlocks[selectedTarget].overlay?.height ||
                                  30
                                }
                                onChange={(e) => {
                                  const u = [...mediaBlocks];
                                  u[selectedTarget].overlay.height = Number(
                                    e.target.value,
                                  );
                                  setMediaBlocks(u);
                                }}
                                className="w-full accent-purple-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-1">
                                Độ trong suốt:{" "}
                                {Math.round(
                                  (mediaBlocks[selectedTarget].overlay
                                    ?.opacity || 1) * 100,
                                )}
                                %
                              </label>
                              <input
                                type="range"
                                min="0.1"
                                max="1"
                                step="0.05"
                                value={
                                  mediaBlocks[selectedTarget].overlay
                                    ?.opacity || 1
                                }
                                onChange={(e) => {
                                  const u = [...mediaBlocks];
                                  u[selectedTarget].overlay.opacity = Number(
                                    e.target.value,
                                  );
                                  setMediaBlocks(u);
                                }}
                                className="w-full accent-purple-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-1">
                                Xoay:{" "}
                                {mediaBlocks[selectedTarget].overlay
                                  ?.rotation || 0}
                                °
                              </label>
                              <input
                                type="range"
                                min="-180"
                                max="180"
                                value={
                                  mediaBlocks[selectedTarget].overlay
                                    ?.rotation || 0
                                }
                                onChange={(e) => {
                                  const u = [...mediaBlocks];
                                  u[selectedTarget].overlay.rotation = Number(
                                    e.target.value,
                                  );
                                  setMediaBlocks(u);
                                }}
                                className="w-full accent-purple-500"
                              />
                            </div>
                            <button
                              onClick={() => {
                                const u = [...mediaBlocks];
                                u[selectedTarget].overlay = {
                                  src: "",
                                  type: "image",
                                  x: 50,
                                  y: 50,
                                  width: 30,
                                  height: 30,
                                  opacity: 1,
                                  rotation: 0,
                                };
                                setMediaBlocks(u);
                                toast.success("Đã xóa overlay");
                              }}
                              className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 text-[10px] font-bold py-1.5 rounded transition"
                            >
                              Xóa overlay
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {(mediaBlocks[selectedTarget].type === "text_block" ||
                      mediaBlocks[selectedTarget].has_text_overlay) && (
                      <div className="bg-[#1A2333] p-4 rounded-xl border border-slate-700/60 space-y-3">
                        <h4 className="font-bold text-white uppercase tracking-wide text-[11px] text-blue-400">
                          Bộ Chỉnh Sửa Văn Bản
                        </h4>

                        {mediaBlocks[selectedTarget].type === "text_block" && (
                          <div className="pt-2 border-t border-slate-700 space-y-3">
                            <p className="text-[10px] text-slate-400 font-medium">
                              Vị trí hiển thị (Position)
                            </p>
                            <div className="grid grid-cols-1 gap-2">
                              <div>
                                <label className="block text-[11px] text-slate-400">
                                  Tọa độ X (
                                  {mediaBlocks[selectedTarget].text_x ?? 50}%)
                                </label>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={
                                    mediaBlocks[selectedTarget].text_x ?? 50
                                  }
                                  onChange={(e) => {
                                    const u = [...mediaBlocks];
                                    u[selectedTarget].text_x = Number(
                                      e.target.value,
                                    );
                                    setMediaBlocks(u);
                                  }}
                                  className="w-full accent-indigo-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] text-slate-400">
                                  Tọa độ Y (
                                  {mediaBlocks[selectedTarget].text_y ?? 50}%)
                                </label>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={
                                    mediaBlocks[selectedTarget].text_y ?? 50
                                  }
                                  onChange={(e) => {
                                    const u = [...mediaBlocks];
                                    u[selectedTarget].text_y = Number(
                                      e.target.value,
                                    );
                                    setMediaBlocks(u);
                                  }}
                                  className="w-full accent-indigo-500"
                                />
                              </div>
                            </div>
                            <p className="text-[9px] text-slate-500 italic">
                              Điều chỉnh vị trí hiển thị:
                            </p>
                          </div>
                        )}
                        <div className="space-y-2">
                          <div>
                            <label className="block text-[10px] text-slate-400">
                              Văn bản (VI)
                            </label>
                            <textarea
                              value={
                                mediaBlocks[selectedTarget].text_content?.vi ||
                                ""
                              }
                              onChange={(e) => {
                                const u = [...mediaBlocks];
                                if (!u[selectedTarget].text_content)
                                  u[selectedTarget].text_content = {};
                                u[selectedTarget].text_content.vi =
                                  e.target.value;
                                setMediaBlocks(u);
                              }}
                              className="w-full bg-[#111827] border border-slate-700 p-2 h-16 rounded text-white text-xs resize-none focus:border-blue-500 focus:outline-none"
                              placeholder="Nhập chữ Tiếng Việt..."
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400">
                              Content (EN)
                            </label>
                            <textarea
                              value={
                                mediaBlocks[selectedTarget].text_content?.en ||
                                ""
                              }
                              onChange={(e) => {
                                const u = [...mediaBlocks];
                                if (!u[selectedTarget].text_content)
                                  u[selectedTarget].text_content = {};
                                u[selectedTarget].text_content.en =
                                  e.target.value;
                                setMediaBlocks(u);
                              }}
                              className="w-full bg-[#111827] border border-slate-700 p-2 h-16 rounded text-white text-xs resize-none focus:border-blue-500 focus:outline-none"
                              placeholder="English text..."
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400">
                              Inhalt (DE)
                            </label>
                            <textarea
                              value={
                                mediaBlocks[selectedTarget].text_content?.de ||
                                ""
                              }
                              onChange={(e) => {
                                const u = [...mediaBlocks];
                                if (!u[selectedTarget].text_content)
                                  u[selectedTarget].text_content = {};
                                u[selectedTarget].text_content.de =
                                  e.target.value;
                                setMediaBlocks(u);
                              }}
                              className="w-full bg-[#111827] border border-slate-700 p-2 h-16 rounded text-white text-xs resize-none focus:border-blue-500 focus:outline-none"
                              placeholder="Deutscher Text..."
                            />
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800 space-y-2">
                          <div>
                            <label className="block text-[11px] mb-1 text-slate-400">
                              Chọn Phông chữ (Font Family)
                            </label>
                            <FontPickerComponent
                              value={
                                mediaBlocks[selectedTarget].text_font || "Inter"
                              }
                              onChange={(font) => {
                                const u = [...mediaBlocks];
                                u[selectedTarget].text_font = font;
                                setMediaBlocks(u);
                              }}
                              placeholder="Chọn font..."
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-2">
                            <div>
                              <label className="block text-[11px] mb-1 text-slate-400">
                                Độ đậm (Weight)
                              </label>
                              <select
                                value={
                                  mediaBlocks[selectedTarget].text_weight ||
                                  "400"
                                }
                                onChange={(e) => {
                                  const u = [...mediaBlocks];
                                  u[selectedTarget].text_weight =
                                    e.target.value;
                                  setMediaBlocks(u);
                                }}
                                className="w-full bg-[#111827] border border-slate-700 p-2 rounded text-white text-xs focus:border-blue-500 focus:outline-none"
                              >
                                {WEIGHT_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[11px] mb-1 text-slate-400">
                                Căn lề chữ (Align)
                              </label>
                              <select
                                value={
                                  mediaBlocks[selectedTarget].text_align ||
                                  "center"
                                }
                                onChange={(e) => {
                                  const u = [...mediaBlocks];
                                  u[selectedTarget].text_align = e.target.value;
                                  setMediaBlocks(u);
                                }}
                                className="w-full bg-[#111827] border border-slate-700 p-2 rounded text-white text-xs focus:border-blue-500 focus:outline-none"
                              >
                                {ALIGN_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-2">
                            <div>
                              <label className="block text-[11px] mb-1 text-slate-400">
                                Cỡ chữ (Size px)
                              </label>
                              <input
                                type="number"
                                value={
                                  mediaBlocks[selectedTarget].text_size || 24
                                }
                                onChange={(e) => {
                                  const u = [...mediaBlocks];
                                  u[selectedTarget].text_size = Number(
                                    e.target.value,
                                  );
                                  setMediaBlocks(u);
                                }}
                                className="w-full bg-[#111827] border border-slate-700 p-2 rounded text-white text-xs focus:border-blue-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] mb-1 text-slate-400">
                                Màu sắc (Color)
                              </label>
                              <div className="flex gap-2 items-center">
                                <input
                                  type="color"
                                  value={
                                    mediaBlocks[selectedTarget].text_color ||
                                    "#ffffff"
                                  }
                                  onChange={(e) => {
                                    const u = [...mediaBlocks];
                                    u[selectedTarget].text_color =
                                      e.target.value;
                                    setMediaBlocks(u);
                                  }}
                                  className="w-8 h-8 bg-transparent border-0 cursor-pointer"
                                />
                                <input
                                  type="text"
                                  value={
                                    mediaBlocks[selectedTarget].text_color ||
                                    "#ffffff"
                                  }
                                  onChange={(e) => {
                                    const u = [...mediaBlocks];
                                    u[selectedTarget].text_color =
                                      e.target.value;
                                    setMediaBlocks(u);
                                  }}
                                  className="w-full bg-[#111827] border border-slate-700 p-1 rounded text-white text-[11px] font-mono focus:border-blue-500 focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] mb-1 text-slate-400">
                              Khoảng cách chữ (Letter Spacing px)
                            </label>
                            <input
                              type="number"
                              step="0.5"
                              value={
                                mediaBlocks[selectedTarget]
                                  .text_letter_spacing || 0
                              }
                              onChange={(e) => {
                                const u = [...mediaBlocks];
                                u[selectedTarget].text_letter_spacing = Number(
                                  e.target.value,
                                );
                                setMediaBlocks(u);
                              }}
                              className="w-full bg-[#111827] border border-slate-700 p-2 rounded text-white text-xs focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}

      {isPreviewOpen && previewPayload && (
        <div className="fixed inset-0 z-[999] bg-black/90 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto relative">
            <button
              onClick={() => {
                setIsPreviewOpen(false);
                setPreviewPayload(null);
              }}
              className="fixed top-4 right-10 text-white text-2xl z-50 hover:text-gray-300 transition-colors"
            >
              ✕
            </button>
            <ProjectPreview project={previewPayload} />
          </div>
        </div>
      )}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.99);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
