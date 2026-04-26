import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Peptide Journal - Weekly Schedule",
  description: "Sean and Vanessa's weekly peptide schedule.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
