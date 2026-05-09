import type { Metadata } from "next";
import "./globals.css";
import { PWARegister } from "./pwa-register";
import { Providers } from "./providers";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "Rachão",
  description: "Organizador de rachões, turmas, jogos e finanças.",
  manifest: "/manifest.json",
  themeColor: "#020617",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Rachão",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <PWARegister />
        <Providers>
          <ToastProvider>{children}</ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
