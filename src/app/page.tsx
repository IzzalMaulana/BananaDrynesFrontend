"use client";

import React from "react";
import Navbar from "./components/Navbar";
import HomeSection from "./components/HomeSection";
import Footer from "./components/Footer";

export default function Page() {
  const handleUploadSuccess = () => {
    // Fungsi ini akan dipanggil setelah upload berhasil
    // Bisa digunakan untuk refresh data atau navigasi
    console.log("Upload berhasil!");
  };

  return (
    <main style={{ background: "#fafafa", minHeight: "100vh" }}>
      <Navbar />
      <HomeSection onUploadSuccess={handleUploadSuccess} />
      <Footer />
    </main>
  );
}