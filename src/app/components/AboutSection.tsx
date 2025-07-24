// src/components/AboutSection.tsx

"use client";

import React from "react";
import Image from "next/image";
import { FiTarget, FiCpu, FiBarChart2, FiUpload, FiRepeat, FiCheckCircle } from "react-icons/fi";

export default function AboutSection() {
  return (
    <section id="about" style={{ padding: "6rem 2.5rem", background: "linear-gradient(135deg, #f7f9fc 0%, #e8f1f8 100%)", overflow: "hidden" }}>
      <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          alignItems: "center",
          gap: "4rem",
        }}
      >
        {/* Kolom Kiri: Gambar Dekoratif */}
        <div style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "450px"
          }}
        >
          {/* Latar Belakang Bentuk Abstrak */}
          <div style={{
              position: "absolute",
              width: "80%",
              height: "80%",
              background: "#e0e7ff",
              borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
              animation: "blobMorph 10s ease-in-out infinite alternate"
            }}
          ></div>
          
          {/* Gambar Ilustrasi */}
          <Image
            src="/assets/images/banana.png" // Ganti dengan path ilustrasi Anda
            alt="Ilustrasi Teknologi AI"
            width={400}
            height={400}
            style={{
              position: "relative",
              zIndex: 2,
              filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.1))"
            }}
          />
        </div>

        {/* Kolom Kanan: Teks About */}
        <div>
          <h2 style={{
              fontSize: "2.8rem",
              fontWeight: 800,
              color: "#1a202c",
              marginBottom: "1rem",
              letterSpacing: "-1.5px"
            }}
          >
            Tentang Proyek Ini
          </h2>
          <p style={{ fontSize: "1.1rem", color: "#4a5568", lineHeight: 1.7, marginBottom: "2.5rem" }}>
            Aplikasi ini dirancang sebagai solusi cerdas untuk membantu para petani dan pelaku industri mengukur kualitas pisang secara objektif. Dengan memanfaatkan kekuatan kecerdasan buatan (AI), kami mengubah cara Anda menganalisis produk.
          </p>

          {/* Sub-bagian: Cara Kerja */}
          <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#334155", marginBottom: "1.5rem" }}>
            Cara Kerja
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <FiUpload size={24} style={{ color: "#fbbf24", flexShrink: 0 }} />
              <p style={{ color: "#4a5568" }}><b>1. Unggah Gambar:</b> Ambil atau unggah gambar pisang yang ingin dianalisis.</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <FiCpu size={24} style={{ color: "#fbbf24", flexShrink: 0 }} />
              <p style={{ color: "#4a5568" }}><b>2. Proses AI:</b> Model AI kami akan menganalisis fitur-fitur visual pada gambar.</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <FiCheckCircle size={24} style={{ color: "#fbbf24", flexShrink: 0 }} />
              <p style={{ color: "#4a5568" }}><b>3. Dapatkan Hasil:</b> Lihat hasil akurat mengenai tingkat kekeringan dalam sekejap.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}