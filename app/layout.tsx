import "./globals.css";
import ClientLayout from "./ClientLayout";
import { LanguageProvider } from "./i18n/LanguageContext";

export const metadata = {
  title: "HAB Creative",
  description: "Mô tả",
  icons: {
    icon: "/icon.png?=999",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <ClientLayout>{children}</ClientLayout>
        </LanguageProvider>
      </body>
    </html>
  );
}