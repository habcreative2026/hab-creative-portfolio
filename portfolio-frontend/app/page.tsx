// frontend/app/page.tsx

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-6">
      <div className="max-w-4xl w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-indigo-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 className="text-5xl font-bold text-white mb-2">
            HAB <span className="text-indigo-400">Creative</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Nền tảng quản lý nội dung
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://bhtdev.work"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl transition-colors text-lg font-semibold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Tải ứng dụng desktop
          </a>
          
          <a
            href="/admin/login"
            className="inline-flex items-center gap-2 bg-[#1a2332] hover:bg-[#2a3342] text-slate-300 px-8 py-4 rounded-xl transition-colors text-lg font-semibold"
          >
            Đăng nhập
          </a>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="bg-[#131A2C] border border-[#1a2332] rounded-xl p-6 text-left">
            <h3 className="text-white font-semibold">Bảo mật</h3>
            <p className="text-slate-400 text-sm">Chỉ truy cập qua ứng dụng desktop</p>
          </div>
          <div className="bg-[#131A2C] border border-[#1a2332] rounded-xl p-6 text-left">
            <h3 className="text-white font-semibold">Đa nền tảng</h3>
            <p className="text-slate-400 text-sm">Windows, macOS, Linux</p>
          </div>
          <div className="bg-[#131A2C] border border-[#1a2332] rounded-xl p-6 text-left">
            <h3 className="text-white font-semibold">Tích hợp</h3>
            <p className="text-slate-400 text-sm">Đồng bộ với HAB Creative</p>
          </div>
        </div>
      </div>
    </div>
  );
}
