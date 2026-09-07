import "./globals.css";
import ToastProvider from "./providers/ToastProvider";
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      {children} <ToastProvider />
    </div>
  );
}
