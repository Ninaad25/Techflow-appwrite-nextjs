
import { Inter } from "next/font/google";
import "./globals.css";

import HeroSection from "./components/HeroSection";
import TopContributers from "./components/TopContributers";
import Footer from "./components/Footer";


const inter = Inter({ subsets: ["latin"] });
import { cn } from "@/lib/utils";
import Header from "./components/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.className, "dark:bg-black dark:text-white")}>
        <Header />
        <HeroSection />
        {children}
        <TopContributers />
        <Footer />
      </body>
    </html>
  );
}
