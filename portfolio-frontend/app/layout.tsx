import "./globals.css";
import ClientLayout from "./ClientLayout";
import { LanguageProvider } from "@/app/i18n/LanguageContext";
import { LinkProvider } from "@/app/context/LinkContext";
import MaintenanceGuard from "@/app/components/MaintenanceGuard";
import { TextStyleProvider } from "@/app/context/TextStyleContext";

export const metadata = {
  title: "HAB Creative | Where Strategy Meets Creativity",
  description:
    "A Vietnam-based creative partner specializing in branding, design, and digital experiences that shape memorable brands.",
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
      <body cz-shortcut-listen="true">
        <MaintenanceGuard>
          <LinkProvider>
            <LanguageProvider>
              <TextStyleProvider>
                <ClientLayout>{children}</ClientLayout>
              </TextStyleProvider>
            </LanguageProvider>
          </LinkProvider>
        </MaintenanceGuard>
      </body>
    </html>
  );
}
