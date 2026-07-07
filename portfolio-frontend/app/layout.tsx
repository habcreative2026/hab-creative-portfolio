import "./globals.css";
import ClientLayout from "./ClientLayout";
import { LanguageProvider } from "./i18n/LanguageContext";
import { LinkProvider } from "./context/LinkContext";
import MaintenanceGuard from "./components/MaintenanceGuard";

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
<body cz-shortcut-listen="true">
<MaintenanceGuard>
<LinkProvider>
<LanguageProvider>
<ClientLayout>{children}</ClientLayout>
</LanguageProvider>
</LinkProvider>
</MaintenanceGuard>
</body>
</html>
);
}
