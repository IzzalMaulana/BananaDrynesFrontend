// src/app/page.tsx

"use client";

import React from "react";
import Navbar from "./components/Navbar";
import HomeSection from "./components/HomeSection";
import Footer from "./components/Footer";

export default function Page() {
  return (
    <main style={{ background: "#fafafa", minHeight: "100vh" }}>
      <Navbar />
      <HomeSection />
      <Footer />
    </main>
  );
}