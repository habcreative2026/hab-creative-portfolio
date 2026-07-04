import Link from "next/link";

export default function AuthDeniedPage() {
  return (
    <div className="flex pt-32 items-center justify-center px-4">
      <div className="w-full bg-white p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>

        <p className="mt-3 text-sm text-gray-600">
          Tài khoản của bạn không có quyền truy cập khu vực này.
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex w-w-md items-center justify-center rounded-lg bg-black px-4 py-3 text-white transition hover:bg-gray-800"
        >
          Quay về trang chủ
        </Link>
      </div>
    </div>
  );
}
