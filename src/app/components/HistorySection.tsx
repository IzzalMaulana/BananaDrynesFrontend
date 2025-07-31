// src/app/components/HistorySection.tsx

"use client";

import React, { useState } from "react";
import { FiClock, FiZap, FiRefreshCw, FiX, FiTrash2 } from "react-icons/fi";
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

function formatTanggalIndo(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const baseUrl = apiUrl.replace('/api', '');
  
  const displayedHistory = isFullPage ? history : history.slice(0, 5);

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

  return (
    <section id="history" style={{ padding: "5rem 2.5rem", background: "#ffffff" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontSize: "2.8rem", fontWeight: 800, color: "#1a202c", marginBottom: "1rem" }}>
          Riwayat Analisis
        </h2>
        {!isFullPage && <p style={{ fontSize: "1.1rem", color: "#64748b", maxWidth: "600px", margin: "0 auto 2.5rem auto" }}>
          Lihat kembali semua hasil deteksi yang pernah Anda lakukan.
        </p>}
        <button onClick={fetchHistory} disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#fbbf24', color: '#422006', fontWeight: 600, border: 'none', borderRadius: '10px', padding: '0.7rem 1.5rem', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '2.5rem' }}>
          <FiRefreshCw size={18} className={loading ? 'spinner' : ''} />
          {loading ? 'Memuat...' : 'Refresh History'}
        </button>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {loading && history.length === 0 ? (
            <p>Memuat data history...</p>
          ) : error ? (
            <p style={{ color: "#b91c1c" }}>{error}</p>
          ) : history.length === 0 ? (
            <p>Belum ada riwayat analisis.</p>
          ) : (
            displayedHistory.map((item) => (
              <div key={item.id} style={{ background: `rgba(255, 255, 255, 0.8)`, border: "1px solid #e2e8f0", borderRadius: "16px", padding: "1.5rem 2rem", display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap", textAlign: "left" }}>
                <div style={{ flexShrink: 0 }}>
                  <Image src={`${baseUrl}/uploads/${item.filename}`} alt={`Gambar ${item.filename}`} width={80} height={80} style={{ borderRadius: "12px", objectFit: "cover" }} unoptimized />
                </div>
                <div style={{ flex: "1 1 300px" }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span style={{ ...getBadgeColor(item.classification), padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600 }}>{item.classification}</span>
                    <span style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><FiZap size={14} /> {item.accuracy}% Akurasi</span>
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#64748b", display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiClock size={14} /> {formatTanggalIndo(item.created_at)}</div>
                  <div style={{ fontSize: "0.9rem", color: "#64748b", marginTop: 8 }}>
                    <b>Nama File:</b> {item.filename} <br/>
                    <b>Tingkat Kekeringan:</b> { item.classification === 'Basah' ? '60–80%' : item.classification === 'Sedang' ? '30–60%' : item.classification === 'Kering' ? '0–30%' : '-' }
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
                    <button onClick={() => handleDelete(item.id)} title="Hapus Riwayat" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', display: 'flex' }}>
                        <FiTrash2 size={20} />
                    </button>
                </div>
              </div>
            ))
          )}
          {!isFullPage && history.length > 5 && (
            <button onClick={() => router.push('/history')} style={{ margin: '2rem auto 0 auto', display: 'block', background: '#fbbf24', color: '#422006', fontWeight: 600, border: 'none', borderRadius: '10px', padding: '0.7rem 1.5rem', cursor: 'pointer' }}>
              Lihat Semua Riwayat
            </button>
          )}
        </div>
      </div>
      <style>{`.spinner { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </section>
  );
}