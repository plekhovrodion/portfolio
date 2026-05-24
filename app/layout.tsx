import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Родион Плехов",
  description:
    "Product design portfolio with case studies, process details, and measurable outcomes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
