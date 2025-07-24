import Navbar from "./components/Navbar";
import HomeSection from "./components/HomeSection";
import HistorySection from "./components/HistorySection";
import AboutSection from "./components/AboutSection";
import BananaFactsSection from "./components/BananaFactsSection";
import Footer from "./components/Footer";

export default function Page() {
  return (
    <main style={{ background: "#fafafa", minHeight: "100vh" }}>
      <Navbar />
      <HomeSection />
      <HistorySection />
      <AboutSection />
      <BananaFactsSection />
      <Footer />
    </main>
  );
}