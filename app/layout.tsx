import "./globals.css";
import ClientLayout from "./ClientLayout";

export const metadata = {
  title: "HAB Creative",
  description: "Mô tả",
    icons: {
    icon: "/icon.png?=999",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}