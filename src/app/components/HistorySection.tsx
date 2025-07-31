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
    // ... (fungsi getBadgeColor tetap sama) ...
};
function formatTanggalIndo(dateString: string) {
    // ... (fungsi formatTanggalIndo tetap sama) ...
}

// Komponen sekarang menerima props dari induk
export default function HistorySection({ 
  history, 
  loading, 
  error, 
  fetchHistory, 
  setHistory,
  isFullPage = false // Prop opsional untuk halaman penuh
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
  
  // Tampilkan semua jika di halaman history, atau 5 jika di halaman utama
  const displayedHistory = isFullPage ? history : history.slice(0, 5);

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus riwayat ini?')) return;
    try {
      const res = await fetch(`${apiUrl}/history/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus data');
      // Update state di komponen induk melalui fungsi setHistory
      setHistory(prevHistory => prevHistory.filter(item => item.id !== id));
    } catch (err) {
      alert('Gagal menghapus riwayat.');
    }
  };

  // ... (sisa kode JSX Anda untuk menampilkan history tidak perlu diubah) ...
  // Pastikan tombol "Lihat Selengkapnya" diubah menjadi seperti ini jika di halaman utama:
  // {!isFullPage && history.length > 5 && ( <button onClick={() => router.push('/history')}>Lihat Semua</button> )}
}