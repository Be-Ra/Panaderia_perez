import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Panadería - Gestión",
  description: "Sistema de administración de panadería",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-full bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}