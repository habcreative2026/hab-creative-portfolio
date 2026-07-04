"use client";
import { useEffect, useState } from "react";
// Import các thành phần kéo thả từ `@hello-pangea/dnd`
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import "@/app/admin/globals.css";
import toast from "react-hot-toast";

interface CardProject {
  _id: string;
  title: string;
  client: string;
  slug: string;
  homeImage?: string;
  projectsPageImage?: string;
  showOnHome: boolean;
  showOnProjects: boolean;
  order: number;
}

export default function CardProjectAdmin() {
  const [viewFilter, setViewFilter] = useState<"all" | "home" | "projects">(
    "all",
  );
  const [cards, setCards] = useState<CardProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  // Form States
  const [titleVi, setTitleVi] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [titleDe, setTitleDe] = useState("");

  const [clientVi, setClientVi] = useState("");
  const [clientEn, setClientEn] = useState("");
  const [clientDe, setClientDe] = useState("");

  const [slug, setSlug] = useState("");
  const [order, setOrder] = useState("0");

  const [showOnHome, setShowOnHome] = useState(true);
  const [showOnProjects, setShowOnProjects] = useState(true);

  // Ảnh upload file & Preview URL nội bộ
  const [homeImgFile, setHomeImgFile] = useState<File | null>(null);
  const [homeImgPreview, setHomeImgPreview] = useState<string>("");

  const [projImgFile, setProjImgFile] = useState<File | null>(null);
  const [projImgPreview, setProjImgPreview] = useState<string>("");

  // Nhập link trực tiếp
  const [homeImageUrl, setHomeImageUrl] = useState("");
  const [projectsPageImageUrl, setProjectsPageImageUrl] = useState("");

  // Tạo Preview tự động khi chọn File
  useEffect(() => {
    if (!homeImgFile) {
      setHomeImgPreview("");
      return;
    }
    const objectUrl = URL.createObjectURL(homeImgFile);
    setHomeImgPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [homeImgFile]);

  useEffect(() => {
    if (!projImgFile) {
      setProjImgPreview("");
      return;
    }
    const objectUrl = URL.createObjectURL(projImgFile);
    setProjImgPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [projImgFile]);

  const fetchCards = async (filterType: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const query = filterType !== "all" ? `?type=${filterType}` : "";
      const res = await fetch(`${baseUrl}/api/cards${query}`);
      const resData = await res.json();
      if (resData.success) {
        // Sắp xếp danh sách theo thuộc tính order tăng dần nhận từ API
        const sortedData = resData.data.sort(
          (a: CardProject, b: CardProject) => a.order - b.order,
        );
        setCards(sortedData);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCards(viewFilter);
  }, [viewFilter]);

  // --- LOGIC HOÁN ĐỔI VỊ TRÍ TRỰC TIẾP (SWAP POSITIONS) VỚI @HELLO-PANGEA/DND ---
  const handleDragEnd = async (result: DropResult) => {
    const { source, destination } = result;

    // Nếu thả ra ngoài danh sách hoặc thả tại vị trí cũ thì bỏ qua
    if (!destination || source.index === destination.index) return;

    const sourceIdx = source.index;
    const targetIdx = destination.index;

    // Thực hiện logic hoán đổi vị trí trực tiếp (Thả 3 vào 1 -> 1 sang vị trí của 3)
    const updatedCards = [...cards];
    const temp = updatedCards[sourceIdx];
    updatedCards[sourceIdx] = updatedCards[targetIdx];
    updatedCards[targetIdx] = temp;

    // Cập nhật lại thuộc tính 'order' nội bộ dựa trên chỉ mục index mới để đồng nhất dữ liệu
    const reorderedCards = updatedCards.map((card, index) => ({
      ...card,
      order: index,
    }));

    setCards(reorderedCards);

    // Tiến hành đồng bộ mảng thứ tự mới xuống Database API
    setIsReordering(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const sortedIds = reorderedCards.map((item) => item._id);

      const res = await fetch(`${baseUrl}/api/cards/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortedIds }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error("Không thể lưu thứ tự mới vào hệ thống.");
        fetchCards(viewFilter); // Hoàn tác dữ liệu cũ nếu lỗi hệ thống
      }
    } catch (error) {
      console.error("Lỗi đồng bộ thứ tự:", error);
      fetchCards(viewFilter);
    } finally {
      setIsReordering(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showOnHome && !showOnProjects) {
      toast.error("Vui lòng chọn ít nhất một vị trí hiển thị!");
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append("titleVi", titleVi);
    formData.append("titleEn", titleEn);
    formData.append("titleDe", titleDe);
    formData.append("clientVi", clientVi);
    formData.append("clientEn", clientEn);
    formData.append("clientDe", clientDe);
    formData.append("slug", slug);
    formData.append("order", order);
    formData.append("showOnHome", String(showOnHome));
    formData.append("showOnProjects", String(showOnProjects));

    formData.append("homeImageUrl", homeImageUrl);
    formData.append("projectsPageImageUrl", projectsPageImageUrl);

    if (showOnHome && homeImgFile) formData.append("homeImage", homeImgFile);
    if (showOnProjects && projImgFile)
      formData.append("projectsPageImage", projImgFile);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const endpoint = editingId
      ? `${baseUrl}/api/cards/${editingId}`
      : `${baseUrl}/api/cards`;
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(endpoint, { method, body: formData });
      const data = await res.json();
      if (data.success) {
        toast.success("Thao tác thành công!");
        resetForm();
        fetchCards(viewFilter);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = async (card: CardProject) => {
    setEditingId(card._id);
    setSlug(card.slug);
    setOrder(card.order.toString());
    setShowOnHome(card.showOnHome);
    setShowOnProjects(card.showOnProjects);
    setHomeImageUrl(card.homeImage || "");
    setProjectsPageImageUrl(card.projectsPageImage || "");

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${baseUrl}/api/translations/admin-list`, {
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        const titleTrans = json.data.find((t: any) => t.key === card.title);
        const clientTrans = json.data.find((t: any) => t.key === card.client);

        if (titleTrans) {
          setTitleVi(titleTrans.vi);
          setTitleEn(titleTrans.en);
          setTitleDe(titleTrans.de);
        }
        if (clientTrans) {
          setClientVi(clientTrans.vi);
          setClientEn(clientTrans.en);
          setClientDe(clientTrans.de);
        } else {
          setClientVi("");
          setClientEn("");
          setClientDe("");
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitleVi("");
    setTitleEn("");
    setTitleDe("");
    setClientVi("");
    setClientEn("");
    setClientDe("");
    setSlug("");
    setOrder("0");
    setShowOnHome(true);
    setShowOnProjects(true);
    setHomeImgFile(null);
    setProjImgFile(null);
    setHomeImageUrl("");
    setProjectsPageImageUrl("");
  };

  return (
    <div className="bg-[#090D16] text-[#E2E8F0] p-4 sm:p-6 min-h-full scroll-none">
      <div className="max-w-full mx-auto space-y-6">
        {/* Bộ lọc đầu trang */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* <div className="flex gap-2 bg-[#0F172A] p-1.5 rounded-xl border border-[#1E293B] w-fit">
            {(["all", "home", "projects"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setViewFilter(type)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                  viewFilter === type
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {type}
              </button>
            ))}
          </div> */}
          {/* {isReordering && (
            <span className="text-xs text-indigo-400 font-medium bg-indigo-950/50 border border-indigo-900/40 px-3 py-1.5 rounded-xl animate-pulse">
              Đang lưu thứ tự mới...
            </span>
          )} */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* FORM NHẬP LIỆU */}
          <div className="scroll-none lg:col-span-5 lg:max-h-[calc(90vh)] lg:overflow-y-auto bg-[#0F172A] p-4 sm:p-6 rounded-2xl border border-[#1E293B] space-y-4 shadow-xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              {editingId ? "Sửa Dự Án Tổng Hợp" : "Thêm Dự Án Mới"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-[#141E33] p-3 rounded-xl border border-[#23334F] flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOnHome}
                    onChange={(e) => setShowOnHome(e.target.checked)}
                    className="rounded text-indigo-600 bg-[#0F172A] border-[#1E293B] focus:ring-0"
                  />
                  Hiển thị ở Trang Chủ
                </label>
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOnProjects}
                    onChange={(e) => setShowOnProjects(e.target.checked)}
                    className="rounded text-indigo-600 bg-[#0F172A] border-[#1E293B] focus:ring-0"
                  />
                  Hiển thị ở trang /Projects
                </label>
              </div>

              {/* Tên Dự Án */}
              <div className="bg-[#141E33] p-3 rounded-xl border border-[#23334F] space-y-2">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">
                  Tên Dự Án
                </span>
                <input
                  type="text"
                  value={titleVi}
                  onChange={(e) => setTitleVi(e.target.value)}
                  placeholder="Tiếng Việt..."
                  className="w-full p-2 bg-[#0F172A] border border-[#1E293B] rounded-lg text-xs"
                  required
                />
                <input
                  type="text"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="Tiếng Anh..."
                  className="w-full p-2 bg-[#0F172A] border border-[#1E293B] rounded-lg text-xs"
                  required
                />
                <input
                  type="text"
                  value={titleDe}
                  onChange={(e) => setTitleDe(e.target.value)}
                  placeholder="Tiếng Đức..."
                  className="w-full p-2 bg-[#0F172A] border border-[#1E293B] rounded-lg text-xs"
                  required
                />
              </div>

              {/* Tập đoàn */}
              <div className="bg-[#141E33] p-3 rounded-xl border border-[#23334F] space-y-2">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">
                  Tập đoàn
                </span>
                <input
                  type="text"
                  value={clientVi}
                  onChange={(e) => setClientVi(e.target.value)}
                  placeholder="Tập đoàn (VI)..."
                  className="w-full p-2 bg-[#0F172A] border border-[#1E293B] rounded-lg text-xs"
                />
                <input
                  type="text"
                  value={clientEn}
                  onChange={(e) => setClientEn(e.target.value)}
                  placeholder="Tập đoàn (EN)..."
                  className="w-full p-2 bg-[#0F172A] border border-[#1E293B] rounded-lg text-xs"
                />
                <input
                  type="text"
                  value={clientDe}
                  onChange={(e) => setClientDe(e.target.value)}
                  placeholder="Tập đoàn (DE)..."
                  className="w-full p-2 bg-[#0F172A] border border-[#1E293B] rounded-lg text-xs"
                />
              </div>

              {/* Slug & Order */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Slug định danh
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="slug-du-an"
                    className="w-full p-2 bg-[#111A2E] border border-[#1E293B] rounded-lg text-xs text-cyan-400 font-mono"
                    required
                  />
                </div>
              </div>

              {/* KHU VỰC CHỌN ẢNH XỊN SÒ */}
              <div className="space-y-4">
                {showOnHome && (
                  <div className="bg-sky-950/20 p-3 rounded-xl border border-sky-900/40 space-y-2">
                    <label className="block text-[11px] font-bold text-sky-400 uppercase">
                      Ảnh hiển thị Trang Chủ
                    </label>
                    <div className="relative group flex flex-col items-center justify-center border-2 border-dashed border-sky-900/50 hover:border-sky-500 bg-[#0F172A] p-4 rounded-xl cursor-pointer transition">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setHomeImgFile(e.target.files?.[0] || null)
                        }
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <span className="text-[11px] text-slate-400">
                        {homeImgFile
                          ? homeImgFile.name
                          : "Kéo thả hoặc Click chọn ảnh"}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={homeImageUrl}
                      onChange={(e) => setHomeImageUrl(e.target.value)}
                      placeholder="Hoặc dán link URL ảnh tại đây..."
                      className="w-full p-2 bg-[#0F172A] border border-sky-900/40 rounded-lg text-[11px]"
                    />
                    {(homeImgPreview || homeImageUrl) && (
                      <div className="relative mt-2 border border-sky-900/40 rounded-lg overflow-hidden bg-slate-950">
                        <img
                          src={homeImgPreview || homeImageUrl}
                          alt="Preview"
                          className="w-full h-24 object-contain mx-auto"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setHomeImgFile(null);
                            setHomeImageUrl("");
                          }}
                          className="absolute top-1 right-1 px-2 py-0.5 bg-red-600 rounded text-[9px] font-bold text-white"
                        >
                          Xóa
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {showOnProjects && (
                  <div className="bg-emerald-950/20 p-3 rounded-xl border border-emerald-900/40 space-y-2">
                    <label className="block text-[11px] font-bold text-emerald-400 uppercase">
                      Ảnh trang /Projects
                    </label>
                    <div className="relative group flex flex-col items-center justify-center border-2 border-dashed border-emerald-900/50 hover:border-emerald-500 bg-[#0F172A] p-4 rounded-xl cursor-pointer transition">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setProjImgFile(e.target.files?.[0] || null)
                        }
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <span className="text-[11px] text-slate-400">
                        {projImgFile
                          ? projImgFile.name
                          : "Kéo thả hoặc Click chọn ảnh"}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={projectsPageImageUrl}
                      onChange={(e) => setProjectsPageImageUrl(e.target.value)}
                      placeholder="Hoặc dán link URL ảnh tại đây..."
                      className="w-full p-2 bg-[#0F172A] border border-emerald-900/40 rounded-lg text-[11px]"
                    />
                    {(projImgPreview || projectsPageImageUrl) && (
                      <div className="relative mt-2 border border-emerald-900/40 rounded-lg overflow-hidden bg-slate-950">
                        <img
                          src={projImgPreview || projectsPageImageUrl}
                          alt="Preview"
                          className="w-full h-24 object-contain mx-auto"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setProjImgFile(null);
                            setProjectsPageImageUrl("");
                          }}
                          className="absolute top-1 right-1 px-2 py-0.5 bg-red-600 rounded text-[9px] font-bold text-white"
                        >
                          Xóa
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl text-xs uppercase tracking-wider"
                >
                  {loading
                    ? "Đang xử lý..."
                    : editingId
                      ? "Cập Nhật Dự Án"
                      : "Tạo Dự Án"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="py-3 px-4 bg-slate-700 rounded-xl text-xs font-bold"
                  >
                    Hủy
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* DANH SÁCH DỰ ÁN TÍCH HỢP @HELLO-PANGEA/DND */}
          <div className="scroll-none lg:col-span-7 lg:max-h-[calc(90vh)] lg:overflow-y-auto bg-[#0F172A] p-4 sm:p-6 rounded-2xl border border-[#1E293B] shadow-xl space-y-3">
            <h2 className="text-sm font-bold text-purple-400 uppercase tracking-wider">
              Danh sách ({cards.length}) - Kéo thả để Hoán đổi vị trí trực tiếp
            </h2>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="projects-list" direction="vertical">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-3 min-h-full"
                  >
                    {cards.map((card, index) => (
                      <Draggable
                        key={card._id}
                        draggableId={card._id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                            }}
                            className={`p-4 rounded-xl flex items-center justify-between gap-4 border transition-all duration-150 ${
                              snapshot.isDragging
                                ? "bg-[#1E293B] border-indigo-500 shadow-2xl scale-[1.02]"
                                : "bg-[#111827] border-[#1E293B] hover:border-slate-700"
                            }`}
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <img
                                src={
                                  card.homeImage ||
                                  card.projectsPageImage ||
                                  "https://placehold.co/150x100"
                                }
                                className="w-16 h-12 object-cover rounded border border-slate-900 flex-shrink-0"
                                alt=""
                              />
                              <div className="truncate">
                                <div className="flex flex-col">
                                  <h4 className="font-bold text-sm text-white truncate">
                                    {card.title}
                                  </h4>
                                  <span className="text-xs text-slate-400 truncate">
                                    {card.client || "No Client"}
                                  </span>
                                </div>
                                <div className="flex gap-2 mt-1 flex-wrap">
                                  {card.showOnHome && (
                                    <span className="bg-sky-950 text-sky-400 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                      Home
                                    </span>
                                  )}
                                  {card.showOnProjects && (
                                    <span className="bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                      Projects
                                    </span>
                                  )}
                                  <span className="text-gray-500 text-[10px] font-mono self-center">
                                    /{card.slug}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditClick(card);
                                }}
                                className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg"
                              >
                                Sửa
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm("Xóa dự án này?"))
                                    fetch(
                                      `${process.env.NEXT_PUBLIC_API_URL}/api/cards/${card._id}`,
                                      { method: "DELETE" },
                                    ).then(() => fetchCards(viewFilter));
                                }}
                                className="text-xs bg-red-950 text-red-400 px-3 py-1.5 rounded-lg"
                              >
                                Xóa
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      </div>
    </div>
  );
}
