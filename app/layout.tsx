import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Applyly — Application tracker",
  description: "A calmer way to manage your job search.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
