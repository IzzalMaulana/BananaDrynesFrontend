import Navbar from "../components/Navbar";
import BananaFactsSection from "../components/BananaFactsSection";
import Footer from "../components/Footer";

export default function BananaFactsPage() {
  return (
    <main style={{ background: "#fafafa", minHeight: "100vh" }}>
      <Navbar />
      <BananaFactsSection />
      <Footer />
    </main>
  );
} 