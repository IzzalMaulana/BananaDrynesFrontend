// src/app/components/HistorySection.tsx

"use client";

import React, { useState, useEffect } from "react";
import { FiClock, FiZap, FiRefreshCw, FiTrash2, FiX, FiLoader, FiAlertCircle } from "react-icons/fi";
import Image from "next/image";
import { useRouter } from 'next/navigation';

interface HistoryItem {
  id: number;
  filename: string;
  classification: string;
  accuracy: number;
  drynessLevel: number;
  created_at: string;
}

const getBadgeColor = (classification: string) => {
  switch (classification) {
    case "Kering":
    case "kering":
    case "DRY":
    case "dry":
      return { background: "#fef2f2", color: "#b91c1c" };
    case "Sedang":
    case "sedang":
    case "MEDIUM":
    case "medium":
      return { background: "#fffbeb", color: "#b45309" };
    case "Basah":
    case "basah":
    case "WET":
    case "wet":
      return { background: "#f0fdf4", color: "#15803d" };
    case "Gambar Bukan Pisang":
    case "gambar bukan pisang":
    case "NOT_BANANA":
    case "not_banana":
      return { background: "#f1f5f9", color: "#475569" };
    default:
      return { background: "#f1f5f9", color: "#475569" };
  }
};

function formatTanggalIndo(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function HistorySection({ 
  history, 
  loading, 
  error, 
  fetchHistory, 
  setHistory,
  isFullPage = false 
}: { 
  history: HistoryItem[], 
  loading: boolean, 
  error: string | null,
  fetchHistory: () => void,
  setHistory: React.Dispatch<React.SetStateAction<HistoryItem[]>>,
  isFullPage?: boolean
}) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const apiUrl = 'http://bananadrynes.my.id';
  const baseUrl = apiUrl;
  
  // Tampilkan semua jika di halaman history, atau 3 jika di halaman utama
  const displayedHistory = isFullPage ? history : history.slice(0, 3);

  const deleteHistory = async (id: number) => {
    console.log(`Attempting to delete history ID: ${id}`);
    console.log(`API URL: ${apiUrl}/history/${id}`);
    
    if (confirm('Apakah Anda yakin ingin menghapus riwayat ini?')) {
      try {
        const response = await fetch(`${apiUrl}/history/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        console.log(`Response status: ${response.status}`);
        
        if (response.ok) {
          const result = await response.json();
          console.log('Delete successful:', result);
          // Refresh history list
          fetchHistory();
          alert('History berhasil dihapus!');
        } else {
          const error = await response.json();
          console.error('Delete failed:', error);
          alert('Error: ' + error.error);
        }
      } catch (error) {
        console.error('Error deleting history:', error);
        alert('Gagal menghapus history - Network error');
      }
    }
  };



  const getDrynessLevelText = (classification: string) => {
    switch (classification) {
      case "Basah":
      case "basah":
      case "WET":
      case "wet":
        return "Basah";
      case "Sedang":
      case "sedang":
      case "MEDIUM":
      case "medium":
        return "Sedang";
      case "Kering":
      case "kering":
      case "DRY":
      case "dry":
        return "Kering";
      case "Gambar Bukan Pisang":
      case "gambar bukan pisang":
      case "NOT_BANANA":
      case "not_banana":
        return "Bukan Pisang";
      default: 
        return classification; // Tampilkan nilai asli jika tidak cocok
    }
  };

  const getWaterContent = (classification: string) => {
    switch (classification) {
      case "Basah":
      case "basah":
      case "WET":
      case "wet":
        return "60–80%";
      case "Sedang":
      case "sedang":
      case "MEDIUM":
      case "medium":
        return "30–60%";
      case "Kering":
      case "kering":
      case "DRY":
      case "dry":
        return "0–30%";
      case "Gambar Bukan Pisang":
      case "gambar bukan pisang":
      case "NOT_BANANA":
      case "not_banana":
        return "N/A";
      default: 
        return "N/A";
    }
  };

  return (
    <>
    <section id="history" style={{ padding: "5rem 2.5rem", background: "#ffffff" }}>
      {/* Header Section */}
      <div style={{ 
        textAlign: "center", 
        marginBottom: "4rem",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "3rem 2rem",
        borderRadius: "20px",
        color: "white"
      }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          gap: "1rem",
          marginBottom: "1rem"
        }}>
          <FiClock style={{ fontSize: "2.5rem" }} />
          <h1 style={{ 
            fontSize: "2.5rem", 
            fontWeight: "bold",
            margin: 0
          }}>
            Riwayat Analisis
          </h1>
        </div>
        <p style={{ 
          fontSize: "1.2rem", 
          opacity: 0.9,
          maxWidth: "600px",
          margin: "0 auto"
        }}>
          Lihat semua hasil analisis kekeringan pisang yang telah dilakukan. 
          Data tersimpan dengan aman dan dapat diakses kapan saja.
        </p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <FiLoader className="spinner" style={{ fontSize: "3rem", color: "#3b82f6" }} />
            <p style={{ marginTop: "1rem", color: "#6b7280" }}>Memuat riwayat...</p>
          </div>
        ) : error ? (
          <div style={{ 
            textAlign: "center", 
            padding: "3rem",
            background: "#fef2f2",
            borderRadius: "15px",
            color: "#dc2626"
          }}>
            <FiAlertCircle style={{ fontSize: "3rem", marginBottom: "1rem" }} />
            <p>{error}</p>
          </div>
        ) : displayedHistory.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "3rem",
            background: "#f9fafb",
            borderRadius: "15px",
            color: "#6b7280"
          }}>
            <FiClock style={{ fontSize: "3rem", marginBottom: "1rem" }} />
            <p>Belum ada riwayat analisis</p>
            <button
              onClick={() => router.push('/')}
              style={{
                marginTop: "1rem",
                padding: "0.75rem 1.5rem",
                background: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "1rem"
              }}
            >
              Mulai Analisis
            </button>
          </div>
        ) : (
          <>
            {/* History Cards */}
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", 
              gap: "2rem",
              marginBottom: "2rem"
            }}>
              {displayedHistory.map((item) => (
                <div key={item.id} style={{
                  background: "white",
                  borderRadius: "15px",
                  padding: "1.5rem",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  border: "1px solid #e5e7eb",
                  position: "relative"
                }}>
                  {/* Delete Button */}
                  <button
                    onClick={() => deleteHistory(item.id)}
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: "rgba(239, 68, 68, 0.1)",
                      color: "#ef4444",
                      border: "none",
                      borderRadius: "50%",
                      width: "32px",
                      height: "32px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                    }}
                  >
                    <FiTrash2 size={16} />
                  </button>

                  {/* Image */}
                  <div style={{ marginBottom: "1rem", textAlign: "center" }}>
                    <Image
                      src={`${baseUrl}/uploads/${item.filename}`}
                      alt={item.filename}
                      width={300}
                      height={200}
                      style={{
                        borderRadius: "10px",
                        objectFit: "cover",
                        width: "100%",
                        height: "200px"
                      }}
                      unoptimized
                    />
                  </div>

                  {/* File Info */}
                  <div style={{ marginBottom: "1rem" }}>
                    <p style={{ 
                      fontSize: "0.9rem", 
                      color: "#6b7280", 
                      marginBottom: "0.5rem",
                      wordBreak: "break-word"
                    }}>
                      <strong>File:</strong> {item.filename}
                    </p>
                  </div>

                  {/* Classification Badge */}
                  <div style={{ marginBottom: "1rem" }}>
                    <span style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "20px",
                      fontSize: "0.9rem",
                      fontWeight: "bold",
                      ...getBadgeColor(item.classification)
                    }}>
                      {getDrynessLevelText(item.classification)}
                    </span>
                  </div>

                  {/* Details */}
                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "1fr 1fr", 
                    gap: "1rem",
                    marginBottom: "1rem"
                  }}>
                    <div>
                      <p style={{ fontSize: "0.9rem", color: "#6b7280", marginBottom: "0.25rem" }}>
                        Kadar Air
                      </p>
                      <p style={{ fontSize: "1rem", fontWeight: "bold", color: "#1f2937" }}>
                        {getWaterContent(item.classification)}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: "0.9rem", color: "#6b7280", marginBottom: "0.25rem" }}>
                        Akurasi
                      </p>
                      <p style={{ fontSize: "1rem", fontWeight: "bold", color: "#1f2937" }}>
                        {item.accuracy.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Date */}
                  <div style={{ 
                    borderTop: "1px solid #e5e7eb", 
                    paddingTop: "1rem",
                    textAlign: "center"
                  }}>
                    <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
                      {formatTanggalIndo(item.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Show More Button (only if not full page) */}
            {!isFullPage && history.length > 3 && (
              <div style={{ textAlign: "center", marginTop: "2rem" }}>
                <button
                  onClick={() => setShowModal(true)}
                  style={{
                    padding: "1rem 2rem",
                    background: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    margin: "0 auto"
                  }}
                >
                  <FiRefreshCw />
                  Lihat Selengkapnya ({history.length} total)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>

    {/* Modal for Full History */}
    {showModal && (
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "2rem"
      }}
      onClick={() => setShowModal(false)}
      >
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "2rem",
          maxWidth: "90vw",
          maxHeight: "90vh",
          overflow: "auto",
          position: "relative"
        }}
        onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
            borderBottom: "1px solid #e5e7eb",
            paddingBottom: "1rem"
          }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>
              Semua Riwayat Analisis
            </h2>
            <button
              onClick={() => setShowModal(false)}
              style={{
                background: "none",
                border: "none",
                fontSize: "1.5rem",
                cursor: "pointer",
                color: "#6b7280"
              }}
            >
              <FiX />
            </button>
          </div>

          {/* Modal Content */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
            gap: "1.5rem"
          }}>
            {history.map((item) => (
              <div key={item.id} style={{
                background: "#f9fafb",
                borderRadius: "12px",
                padding: "1rem",
                border: "1px solid #e5e7eb",
                position: "relative"
              }}>
                {/* Delete Button */}
                <button
                  onClick={() => deleteHistory(item.id)}
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    background: "rgba(239, 68, 68, 0.1)",
                    color: "#ef4444",
                    border: "none",
                    borderRadius: "50%",
                    width: "28px",
                    height: "28px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8rem"
                  }}
                >
                  <FiTrash2 size={14} />
                </button>

                {/* Image */}
                <div style={{ marginBottom: "0.75rem", textAlign: "center" }}>
                  <Image
                    src={`${baseUrl}/uploads/${item.filename}`}
                    alt={item.filename}
                    width={250}
                    height={150}
                    style={{
                      borderRadius: "8px",
                      objectFit: "cover",
                      width: "100%",
                      height: "150px"
                    }}
                    unoptimized
                  />
                </div>

                {/* File Info */}
                <p style={{ 
                  fontSize: "0.8rem", 
                  color: "#6b7280", 
                  marginBottom: "0.5rem",
                  wordBreak: "break-word"
                }}>
                  {item.filename}
                </p>

                {/* Classification */}
                <div style={{ marginBottom: "0.5rem" }}>
                  <span style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "12px",
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    ...getBadgeColor(item.classification)
                  }}>
                    {getDrynessLevelText(item.classification)}
                  </span>
                </div>

                {/* Details */}
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "1fr 1fr", 
                  gap: "0.5rem",
                  fontSize: "0.8rem"
                }}>
                  <div>
                    <span style={{ color: "#6b7280" }}>Air: </span>
                    <span style={{ fontWeight: "bold" }}>
                      {getWaterContent(item.classification)}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "#6b7280" }}>Akurasi: </span>
                    <span style={{ fontWeight: "bold" }}>
                      {item.accuracy.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Date */}
                <p style={{ 
                  fontSize: "0.75rem", 
                  color: "#6b7280",
                  marginTop: "0.5rem",
                  textAlign: "center"
                }}>
                  {formatTanggalIndo(item.created_at)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
    </>
  );
}