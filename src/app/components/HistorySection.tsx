// src/app/components/HistorySection.tsx

"use client";

import React, { useState, useEffect } from "react";
import { FiClock, FiZap, FiRefreshCw, FiTrash2, FiX } from "react-icons/fi";
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
    case "Kering": return { background: "#fef2f2", color: "#b91c1c" };
    case "Sedang": return { background: "#fffbeb", color: "#b45309" };
    case "Basah": return { background: "#f0fdf4", color: "#15803d" };
    case "Gambar Bukan Pisang": return { background: "#f1f5f9", color: "#475569" };
    default: return { background: "#f1f5f9", color: "#475569" };
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

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const baseUrl = apiUrl.replace('/api', '');
  
  // Tampilkan semua jika di halaman history, atau 3 jika di halaman utama
  const displayedHistory = isFullPage ? history : history.slice(0, 3);

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus riwayat ini?')) return;
    try {
      const res = await fetch(`${apiUrl}/history/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus data');
      setHistory(prevHistory => prevHistory.filter(item => item.id !== id));
    } catch (err) {
      alert('Gagal menghapus riwayat.');
    }
  };

  const getDrynessLevelText = (classification: string) => {
    switch (classification) {
      case "Basah": return "60–80%";
      case "Sedang": return "30–60%";
      case "Kering": return "0–30%";
      default: return classification;
    }
  };

  return (
    <>
      <section id="history" style={{ padding: "5rem 2.5rem", background: "#ffffff" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "2.8rem", fontWeight: 800, color: "#1a202c", marginBottom: "1rem" }}>
            Riwayat Analisis
          </h2>
          
          {loading && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <FiRefreshCw size={32} className="spinner" style={{ margin: '0 auto 0.5rem auto' }} />
              <p>Memuat riwayat...</p>
            </div>
          )}

          {error && (
            <div style={{ marginTop: "1rem", padding: "0.75rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", color: "#b91c1c", fontSize: "0.9rem" }}>
              {error}
            </div>
          )}

          {!loading && !error && displayedHistory.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              <FiClock size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
              <p style={{ fontSize: '1.1rem', margin: 0 }}>Belum ada riwayat analisis</p>
              <p style={{ fontSize: '0.9rem', margin: '0.5rem 0 0 0', opacity: 0.7 }}>Mulai dengan mengupload gambar pisang</p>
            </div>
          )}

          {!loading && !error && displayedHistory.length > 0 && (
            <div style={{ display: 'grid', gap: '1.5rem', marginTop: '2rem' }}>
              {displayedHistory.map((item) => (
                <div key={item.id} style={{ 
                  background: '#fff', 
                  borderRadius: '16px', 
                  padding: '1.5rem', 
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  {/* Gambar */}
                  <div style={{ flexShrink: 0 }}>
                    <Image 
                      src={`${baseUrl}/uploads/${item.filename}`} 
                      alt={item.filename}
                      width={80} 
                      height={80} 
                      style={{ borderRadius: '12px', objectFit: 'cover' }}
                      unoptimized
                    />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1a202c', margin: 0 }}>
                        {item.filename}
                      </h3>
                      <span style={{ 
                        ...getBadgeColor(item.classification), 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '9999px', 
                        fontSize: '0.85rem', 
                        fontWeight: 600 
                      }}>
                        {getDrynessLevelText(item.classification)}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0.25rem 0' }}>
                      Keyakinan: <strong>{item.accuracy}%</strong>
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                      {item.created_at}
                    </p>
                  </div>

                  {/* Tombol Hapus */}
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      borderRadius: '50%',
                      transition: 'background 0.2s'
                    }}
                    title="Hapus riwayat"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Tombol Refresh */}
          {!loading && (
            <button 
              onClick={fetchHistory}
              style={{
                marginTop: '2rem',
                background: '#fbbf24',
                color: '#422006',
                fontWeight: 600,
                border: 'none',
                borderRadius: '10px',
                padding: '0.7rem 1.5rem',
                cursor: 'pointer',
                fontSize: '1rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <FiRefreshCw size={18} />
              Refresh History
            </button>
          )}

          {/* Tombol Lihat Semua (hanya jika bukan full page) */}
          {!isFullPage && history.length > 3 && (
            <button 
              onClick={() => router.push('/history')}
              style={{
                marginTop: '1rem',
                background: '#4f46e5',
                color: 'white',
                fontWeight: 600,
                border: 'none',
                borderRadius: '10px',
                padding: '0.7rem 1.5rem',
                cursor: 'pointer',
                fontSize: '1rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <FiClock size={18} />
              Lihat Semua Riwayat
            </button>
          )}
        </div>
      </section>

      {/* Modal untuk tampilan penuh */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Semua Riwayat</h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '50%'
                }}
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              {history.map((item) => (
                <div key={item.id} style={{ 
                  background: '#f8fafc', 
                  borderRadius: '12px', 
                  padding: '1rem', 
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <Image 
                    src={`${baseUrl}/uploads/${item.filename}`} 
                    alt={item.filename}
                    width={60} 
                    height={60} 
                    style={{ borderRadius: '8px', objectFit: 'cover' }}
                    unoptimized
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600 }}>{item.filename}</span>
                      <span style={{ 
                        ...getBadgeColor(item.classification), 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '9999px', 
                        fontSize: '0.8rem' 
                      }}>
                        {getDrynessLevelText(item.classification)}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
                      Keyakinan: {item.accuracy}% • {item.created_at}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}