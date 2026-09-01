import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Next360 Office Dashboard",
  description: "Office Attendance & Team Management Dashboard - Next360 Organic Products",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
