import Image from "next/image";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import TopContributers from "./components/TopContributers";
import Footer from "./components/Footer";
import HeroSectionHeader from "./components/HeroSectionHeader";

export default function Home() {
  return (
    <main className="flex  min-h-screen flex-col items-center justify-between">
      <Header />
      <HeroSection />
      <TopContributers />
      <Footer />

    </main>

  );
}
