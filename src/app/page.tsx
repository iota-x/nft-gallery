import Footer from "@/components/Footer";
import LandingPage from "@/components/LandingPage";

export default function Home() {
  return (
    <main className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02]">
      <LandingPage />
      <Footer />
    </main>
  );
}
