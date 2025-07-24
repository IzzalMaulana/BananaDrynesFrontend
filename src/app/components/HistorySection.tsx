// src/components/HistorySection.tsx

"use client";

import React, { useState, useEffect } from "react";
import { FiClock, FiZap, FiRefreshCw, FiX } from "react-icons/fi";
import Image from "next/image";

// Tipe data history
interface HistoryItem {
  id: number;
  filename: string;
  classification: string;
  accuracy: number;
  drynessLevel: number;
  is_banana: boolean;
  created_at: string;
}

// Fungsi untuk menentukan warna badge berdasarkan hasil
const getBadgeColor = (result: string) => {
  switch (result) {
    case "Kering":
      return { background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca" };
    case "Sedang":
      return { background: "#fffbeb", color: "#b45309", border: "1px solid #fde68a" };
    case "Basah":
      return { background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" };
    case "Gambar Bukan Pisang":
      return { background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" };
    default:
      return { background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" };
  }
};

// Fungsi format tanggal Indonesia
function formatTanggalIndo(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function HistorySection() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const displayedHistory = history.slice(0, 5);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/history');
      if (!res.ok) throw new Error('Gagal mengambil data history');
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      setError('Gagal mengambil data history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <section id="history" style={{ padding: "5rem 2.5rem", background: "#ffffff" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
        <h2 style={{
            fontSize: "2.8rem",
            fontWeight: 800,
            color: "#1a202c",
            marginBottom: "1rem",
            letterSpacing: "-1.5px"
          }}
        >
          Riwayat Analisis
        </h2>
        <p style={{ fontSize: "1.1rem", color: "#64748b", maxWidth: "600px", margin: "0 auto 2.5rem auto" }}>
          Lihat kembali semua hasil deteksi yang pernah Anda lakukan. Setiap catatan tersimpan rapi untuk referensi Anda.
        </p>
        <button
          onClick={fetchHistory}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#fbbf24',
            color: '#422006',
            fontWeight: 600,
            border: 'none',
            borderRadius: '10px',
            padding: '0.7rem 1.5rem',
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '2.5rem',
            boxShadow: '0 2px 8px rgba(251, 191, 36, 0.10)',
            transition: 'all 0.2s',
            opacity: loading ? 0.7 : 1
          }}
        >
          <FiRefreshCw size={18} className={loading ? 'spinner' : ''} />
          {loading ? 'Memuat...' : 'Refresh History'}
        </button>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {loading && history.length === 0 ? (
            <div style={{ background: "#fff", padding: "2rem", borderRadius: 12, border: "1px dashed #e2e8f0" }}>
              <p style={{ color: "#64748b" }}>Memuat data history...</p>
            </div>
          ) : error ? (
            <div style={{ background: "#fff", padding: "2rem", borderRadius: 12, border: "1px dashed #e2e8f0" }}>
              <p style={{ color: "#b91c1c" }}>{error}</p>
            </div>
          ) : history.length === 0 ? (
            <div style={{ background: "#fff", padding: "2rem", borderRadius: 12, border: "1px dashed #e2e8f0" }}>
              <p style={{ color: "#64748b" }}>Belum ada riwayat analisis.</p>
            </div>
          ) : (
            displayedHistory.map((item, index) => (
              <div
                key={item.id}
                style={{
                  background: `rgba(255, 255, 255, 0.8)`,
                  border: "1px solid #e2e8f0",
                  borderRadius: "16px",
                  padding: "1.5rem 2rem",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
                  display: "flex",
                  alignItems: "center",
                  gap: "1.5rem",
                  flexWrap: "wrap",
                  textAlign: "left",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s forwards`,
                  opacity: 0,
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.08)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.05)";
                }}
              >
                {/* Thumbnail Gambar */}
                <div style={{ flexShrink: 0 }}>
                  <Image
                    src={`http://localhost:5000/uploads/${item.filename}`}
                    alt={`Gambar ${item.filename}`}
                    width={80}
                    height={80}
                    style={{ borderRadius: "12px", objectFit: "cover" }}
                    unoptimized
                  />
                </div>
                {/* Info Utama */}
                <div style={{ flex: "1 1 300px" }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span style={{
                        ...getBadgeColor(item.classification),
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}
                    >
                      {item.classification}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <FiZap size={14} /> {item.accuracy}% Akurasi
                    </span>
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#64748b", display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FiClock size={14} /> {item.created_at}
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#64748b", marginTop: 8 }}>
                    <b>Nama File:</b> {item.filename} <br/>
                    <b>Tingkat Kekeringan:</b> {
                      item.classification === 'Basah'
                        ? '60–80%'
                        : item.classification === 'Sedang'
                          ? '30–60%'
                          : item.classification === 'Kering'
                            ? '0–30%'
                            : '-'
                    } <br/>
                    <b>Pisang?</b> <span style={{ color: item.is_banana ? '#15803d' : '#b91c1c', fontWeight: 600 }}>{item.is_banana ? 'Ya' : 'Bukan'}</span>
                  </div>
                </div>
              </div>
            ))
          )}
          {history.length > 5 && (
            <button
              onClick={() => setShowModal(true)}
              style={{
                margin: '2rem auto 0 auto',
                display: 'block',
                background: '#fbbf24',
                color: '#422006',
                fontWeight: 600,
                border: 'none',
                borderRadius: '10px',
                padding: '0.7rem 1.5rem',
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(251, 191, 36, 0.10)',
                transition: 'all 0.2s',
              }}
            >
              Lihat Selengkapnya
            </button>
          )}
        </div>
        {/* Modal Popup History */}
        {showModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.25)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={() => setShowModal(false)}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: 18,
                maxWidth: 900,
                width: '95vw',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '2.5rem 2rem',
                position: 'relative',
              }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setShowModal(false)}
                style={{
                  position: 'absolute',
                  top: 18,
                  right: 18,
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  fontSize: 24,
                  cursor: 'pointer',
                  zIndex: 10,
                }}
                title="Tutup"
              >
                <FiX />
              </button>
              <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1a202c', textAlign: 'center' }}>Semua Riwayat Analisis</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {history.map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      background: `rgba(255, 255, 255, 0.8)`,
                      border: "1px solid #e2e8f0",
                      borderRadius: "16px",
                      padding: "1.5rem 2rem",
                      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
                      display: "flex",
                      alignItems: "center",
                      gap: "1.5rem",
                      flexWrap: "wrap",
                      textAlign: "left",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      animation: `fadeInUp 0.5s ease-out ${index * 0.1}s forwards`,
                      opacity: 0,
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "translateY(-5px)";
                      e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.08)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.05)";
                    }}
                  >
                    {/* Thumbnail Gambar */}
                    <div style={{ flexShrink: 0 }}>
                      <Image
                        src={`http://localhost:5000/uploads/${item.filename}`}
                        alt={`Gambar ${item.filename}`}
                        width={80}
                        height={80}
                        style={{ borderRadius: "12px", objectFit: "cover" }}
                        unoptimized
                      />
                    </div>
                    {/* Info Utama */}
                    <div style={{ flex: "1 1 300px" }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{
                            ...getBadgeColor(item.classification),
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.8rem',
                            fontWeight: 600
                          }}
                        >
                          {item.classification}
                        </span>
                        <span style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <FiZap size={14} /> {item.accuracy}% Akurasi
                        </span>
                      </div>
                      <div style={{ fontSize: "0.9rem", color: "#64748b", display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiClock size={14} /> {item.created_at}
                      </div>
                      <div style={{ fontSize: "0.9rem", color: "#64748b", marginTop: 8 }}>
                        <b>Nama File:</b> {item.filename} <br/>
                        <b>Tingkat Kekeringan:</b> {
                          item.classification === 'Basah'
                            ? '60–80%'
                            : item.classification === 'Sedang'
                              ? '30–60%'
                              : item.classification === 'Kering'
                                ? '0–30%'
                                : '-'
                        } <br/>
                        <b>Pisang?</b> <span style={{ color: item.is_banana ? '#15803d' : '#b91c1c', fontWeight: 600 }}>{item.is_banana ? 'Ya' : 'Bukan'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`.spinner { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </section>
  );
}