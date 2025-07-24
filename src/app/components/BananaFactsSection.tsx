"use client";
import React, { useState } from "react";
import Image from "next/image";

const title1 = "Pisang Kepok: Si Buah Tradisional yang Kaya Manfaat dan Potensi Teknologi";
const content1 = `Pernahkah kamu menikmati renyahnya keripik pisang atau gurihnya pisang goreng di sore hari? Bisa jadi, camilan favoritmu itu berasal dari pisang kepok — salah satu jenis pisang lokal yang sangat populer di Indonesia.

Tidak hanya lezat dan mengenyangkan, pisang kepok ternyata menyimpan segudang manfaat dan keunikan, bahkan kini menjadi objek dalam penelitian berbasis kecerdasan buatan (AI). Yuk, kenali lebih dalam buah tropis satu ini!`;
const preview1 = content1.slice(0, 90) + "...";

const title2 = "Kandungan Gizi yang Menguntungkan";
const content2 = `Tak hanya enak, pisang kepok juga sangat bergizi. Dalam 100 gram pisang matang, kamu bisa mendapatkan:

• ±120 kalori sebagai sumber energi
• 31 gram karbohidrat alami
• 2,3 gram serat untuk pencernaan
• Kalium tinggi (±400 mg) untuk menjaga tekanan darah
• Vitamin A dan C yang berperan penting dalam kekebalan tubuh

Dengan kandungan ini, pisang kepok cocok untuk semua usia, termasuk anak-anak, orang tua, hingga atlet sekalipun.`;
const preview2 = content2.slice(0, 90) + "...";

const title3 = "Hasil Hibrida yang Tangguh";
const content3 = `Tahukah kamu? Pisang kepok bukan pisang biasa. Ia adalah hasil hibridisasi alami antara dua spesies pisang liar, yang membuatnya:

• Hampir tidak memiliki biji
• Lebih tahan terhadap penyakit
• Cocok ditanam di berbagai jenis tanah tropis

Hal ini menjadikannya pilihan utama dalam budidaya dan produksi besar, terutama untuk keperluan industri pangan.`;
const preview3 = content3.slice(0, 90) + "...";

const imageUrl1 = "/assets/images/kepok.jpeg";
const imageUrl2 = "/assets/images/picang.jpeg";
const imageUrl3 = "/assets/images/pisangkepok.jpeg";

export default function BananaFactsSection() {
  const [showModal, setShowModal] = useState<1 | 2 | 3 | null>(null);
  return (
    <section id="banana-facts" style={{ maxWidth: 800, margin: "0 auto", padding: "4rem 2rem", display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1 style={{
        fontSize: '2.7rem',
        fontWeight: 900,
        color: '#fbbf24',
        textShadow: '0 2px 8px rgba(251,191,36,0.15)',
        letterSpacing: '-1.5px',
        marginBottom: '2.5rem',
        textAlign: 'center',
        fontFamily: 'cursive, Comic Sans MS, sans-serif'
      }}>BananaFacts</h1>
      {/* Card 1 */}
      <div
        onClick={() => setShowModal(1)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1.5rem",
          background: "#f9fafb",
          borderRadius: "12px",
          padding: "1.5rem",
          cursor: "pointer",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          transition: "box-shadow 0.2s",
        }}
        title="Klik untuk info lengkap"
      >
        <div style={{ flexShrink: 0 }}>
          <Image src={imageUrl1} alt="Pisang Kepok" width={90} height={90} style={{ borderRadius: 10, objectFit: "cover" }} />
        </div>
        <div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: 8 }}>{title1}</h2>
          <p style={{ color: "#374151", fontSize: "1.05rem", margin: 0 }}>{preview1}</p>
        </div>
      </div>
      {/* Card 2 */}
      <div
        onClick={() => setShowModal(2)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1.5rem",
          background: "#f9fafb",
          borderRadius: "12px",
          padding: "1.5rem",
          cursor: "pointer",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          transition: "box-shadow 0.2s",
        }}
        title="Klik untuk info lengkap"
      >
        <div style={{ flexShrink: 0 }}>
          <Image src={imageUrl2} alt="Pisang Kepok" width={90} height={90} style={{ borderRadius: 10, objectFit: "cover" }} />
        </div>
        <div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: 8 }}>{title2}</h2>
          <p style={{ color: "#374151", fontSize: "1.05rem", margin: 0 }}>{preview2}</p>
        </div>
      </div>
      {/* Card 3 */}
      <div
        onClick={() => setShowModal(3)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1.5rem",
          background: "#f9fafb",
          borderRadius: "12px",
          padding: "1.5rem",
          cursor: "pointer",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          transition: "box-shadow 0.2s",
        }}
        title="Klik untuk info lengkap"
      >
        <div style={{ flexShrink: 0 }}>
          <Image src={imageUrl3} alt="Pisang Kepok" width={90} height={90} style={{ borderRadius: 10, objectFit: "cover" }} />
        </div>
        <div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: 8 }}>{title3}</h2>
          <p style={{ color: "#374151", fontSize: "1.05rem", margin: 0 }}>{preview3}</p>
        </div>
      </div>
      {/* Modal 1 */}
      {showModal === 1 && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.25)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowModal(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              maxWidth: 500,
              width: "90vw",
              padding: "2.2rem 2rem 2rem 2rem",
              position: "relative",
              display: "flex",
              gap: "1.5rem",
              alignItems: "flex-start",
            }}
            onClick={e => e.stopPropagation()}
          >
            <Image src={imageUrl1} alt="Pisang Kepok" width={90} height={90} style={{ borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
            <div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: 12 }}>{title1}</h2>
              <p style={{ color: "#374151", fontSize: "1.08rem", whiteSpace: "pre-line" }}>{content1}</p>
            </div>
            <button
              onClick={() => setShowModal(null)}
              style={{ position: "absolute", top: 12, right: 12, background: "#f3f4f6", border: "none", borderRadius: 8, padding: 4, cursor: "pointer" }}
              title="Tutup"
            >
              ×
            </button>
          </div>
        </div>
      )}
      {/* Modal 2 */}
      {showModal === 2 && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.25)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowModal(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              maxWidth: 500,
              width: "90vw",
              padding: "2.2rem 2rem 2rem 2rem",
              position: "relative",
              display: "flex",
              gap: "1.5rem",
              alignItems: "flex-start",
            }}
            onClick={e => e.stopPropagation()}
          >
            <Image src={imageUrl2} alt="Pisang Kepok" width={90} height={90} style={{ borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
            <div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: 12 }}>{title2}</h2>
              <p style={{ color: "#374151", fontSize: "1.08rem", whiteSpace: "pre-line" }}>{content2}</p>
            </div>
            <button
              onClick={() => setShowModal(null)}
              style={{ position: "absolute", top: 12, right: 12, background: "#f3f4f6", border: "none", borderRadius: 8, padding: 4, cursor: "pointer" }}
              title="Tutup"
            >
              ×
            </button>
          </div>
        </div>
      )}
      {/* Modal 3 */}
      {showModal === 3 && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.25)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowModal(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              maxWidth: 500,
              width: "90vw",
              padding: "2.2rem 2rem 2rem 2rem",
              position: "relative",
              display: "flex",
              gap: "1.5rem",
              alignItems: "flex-start",
            }}
            onClick={e => e.stopPropagation()}
          >
            <Image src={imageUrl3} alt="Pisang Kepok" width={90} height={90} style={{ borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
            <div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: 12 }}>{title3}</h2>
              <p style={{ color: "#374151", fontSize: "1.08rem", whiteSpace: "pre-line" }}>{content3}</p>
            </div>
            <button
              onClick={() => setShowModal(null)}
              style={{ position: "absolute", top: 12, right: 12, background: "#f3f4f6", border: "none", borderRadius: 8, padding: 4, cursor: "pointer" }}
              title="Tutup"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </section>
  );
} 