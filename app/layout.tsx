import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Firearms Search",
  description: "Search firearms licence holders",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
