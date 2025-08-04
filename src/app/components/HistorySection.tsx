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

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const baseUrl = apiUrl.replace('/api', '');
  
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
                  border: '1px solid #e2e8f0'
                }}>
                  {/* Header dengan nama file dan tombol hapus */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '1rem',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid #e2e8f0'
                  }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1a202c', margin: 0 }}>
                      📁 {item.filename}
                    </h3>
                    <button
                      onClick={() => deleteHistory(item.id)}
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

                  {/* Konten utama */}
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                    {/* Gambar */}
                    <div style={{ flexShrink: 0 }}>
                      <Image
                        src={`${baseUrl}/uploads/${item.filename}`} 
                        alt={item.filename}
                        width={120}
                        height={120}
                        style={{ borderRadius: '12px', objectFit: 'cover' }}
                        unoptimized
                      />
                    </div>

                    {/* Informasi detail */}
                    <div style={{ flex: 1, display: 'grid', gap: '0.75rem' }}>
                      {/* Tingkat Kekeringan */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500, minWidth: '120px' }}>
                          �� Tingkat Kekeringan:
                        </span>
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

                      {/* Kadar Air */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500, minWidth: '120px' }}>
                          💧 Kadar Air:
                        </span>
                        <span style={{
                          background: '#f0f9ff',
                          color: '#0369a1',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.85rem',
                          fontWeight: 600
                        }}>
                          {getWaterContent(item.classification)}
                        </span>
                      </div>

                      {/* Akurasi */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500, minWidth: '120px' }}>
                          🎯 Akurasi:
                        </span>
                        <span style={{
                          background: '#f0fdf4',
                          color: '#15803d',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.85rem',
                          fontWeight: 600
                        }}>
                          {item.accuracy}%
                        </span>
                      </div>

                      {/* Tanggal Upload */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500, minWidth: '120px' }}>
                          📅 Tanggal Upload:
                        </span>
                        <span style={{
                          background: '#fef3c7',
                          color: '#92400e',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.85rem',
                          fontWeight: 500
                        }}>
                          {item.created_at}
                        </span>
                      </div>
                    </div>
                  </div>
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
                  border: '1px solid #e2e8f0'
                }}>
                  {/* Header */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '0.75rem',
                    paddingBottom: '0.5rem',
                    borderBottom: '1px solid #e2e8f0'
                  }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>📁 {item.filename}</span>
                    <span style={{ 
                      ...getBadgeColor(item.classification), 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '9999px', 
                      fontSize: '0.8rem' 
                    }}>
                      {getDrynessLevelText(item.classification)}
                    </span>
                  </div>

                  {/* Konten */}
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <Image 
                      src={`${baseUrl}/uploads/${item.filename}`} 
                      alt={item.filename}
                      width={80} 
                      height={80} 
                      style={{ borderRadius: '8px', objectFit: 'cover' }}
                      unoptimized
                    />
                    <div style={{ flex: 1, display: 'grid', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>�� Kadar Air:</span>
                        <span style={{ fontWeight: 600, color: '#0369a1' }}>{getWaterContent(item.classification)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>🎯 Akurasi:</span>
                        <span style={{ fontWeight: 600, color: '#15803d' }}>{item.accuracy}%</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>📅 Upload:</span>
                        <span style={{ fontWeight: 500, color: '#92400e', fontSize: '0.8rem' }}>{item.created_at}</span>
                      </div>
                    </div>
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