// src/app/components/HistorySection.tsx

"use client";

import React, { useState } from "react";
import { FiClock, FiZap, FiRefreshCw, FiTrash2 } from "react-icons/fi";
import Image from "next/image";
import { useRouter } from 'next/navigation'; // Import useRouter

// Tipe data dan fungsi helper (getBadgeColor, formatTanggalIndo) tetap sama...
interface HistoryItem {
  id: number;
  filename: string;
  classification: string;
  accuracy: number;
  drynessLevel: number;
  created_at: string;
}
const getBadgeColor = (result: string) => { /* ...kode Anda... */ };
function formatTanggalIndo(dateString: string) { /* ...kode Anda... */ }


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
  const router = useRouter(); // Inisialisasi router

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const baseUrl = apiUrl.replace('/api', '');
  
  // Tampilkan semua jika di halaman history, atau 5 jika di halaman utama
  const displayedHistory = isFullPage ? history : history.slice(0, 3); // Tampilkan 3 saja di home

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
        {/* ... (sisa kode JSX untuk menampilkan list tidak perlu diubah) ... */}
        {/* Cukup pastikan Anda menggunakan variabel 'displayedHistory' untuk .map() */}
        
        {/* ... (di dalam .map()... pastikan tombol hapus memanggil handleDelete(item.id)) ... */}
        
        {/* TOMBOL "LIHAT SEMUA RIWAYAT" */}
        {!isFullPage && history.length > 3 && (
          <button 
            onClick={() => router.push('/history')}
            style={{ 
              marginTop: '2rem', 
              background: '#fbbf24', color: '#422006', fontWeight: 600, 
              border: 'none', borderRadius: '10px', padding: '0.7rem 1.5rem', 
              cursor: 'pointer', fontSize: '1rem' 
            }}
          >
            Lihat Semua Riwayat
          </button>
        )}
      </div>
    </section>
  );
}