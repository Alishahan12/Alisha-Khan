import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Text to Video Converter",
  description: "Convert your text into beautiful animated videos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
