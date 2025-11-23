import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "YCSYH - Premium Beats & Publishing",
  description: "Premium beats for artists worldwide. YCSYH Publishing.",
  icons: {
    icon: '/publishing_company_logo.jpg',
    shortcut: '/publishing_company_logo.jpg',
    apple: '/publishing_company_logo.jpg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <Navbar />
        <main className="pt-16 min-h-screen">
        {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
