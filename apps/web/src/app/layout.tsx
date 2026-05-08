import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rachao",
  description: "SaaS para gestao de peladas recorrentes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
