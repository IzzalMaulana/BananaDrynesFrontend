import Navbar from "../components/Navbar";
import HistorySection from "../components/HistorySection";
import Footer from "../components/Footer";

export default function HistoryPage() {
  return (
    <main style={{ background: "#fafafa", minHeight: "100vh" }}>
      <Navbar />
      <HistorySection />
      <Footer />
    </main>
  );
} 