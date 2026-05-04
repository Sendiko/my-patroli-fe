import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lost & Found Tracker",
  description: "Corporate Academic Lost & Found Mobile Tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${inter.className} bg-gray-200`}>
        <div className="mobile-container">
          {children}
        </div>
      </body>
    </html>
  );
}
