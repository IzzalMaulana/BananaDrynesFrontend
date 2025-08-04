// src/app/history/page.tsx

"use client";

import React, { useState, useEffect } from 'react';
import Navbar from "../components/Navbar";
import HistorySection from "../components/HistorySection";
import Footer from "../components/Footer";

// Tipe data untuk item history
interface HistoryItem {
  id: number;
  filename: string;
  classification: string;
  accuracy: number;
  drynessLevel: number;
  created_at: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${apiUrl}/history`);
      if (!res.ok) throw new Error('Gagal mengambil data history');
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      setHistoryError('Gagal mengambil data history');
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <main style={{ background: "#fafafa", minHeight: "100vh" }}>
      <Navbar />
      <HistorySection 
        history={history} 
        loading={historyLoading} 
        error={historyError} 
        fetchHistory={fetchHistory} 
        setHistory={setHistory}
        isFullPage={true}
      />
      <Footer />
    </main>
  );
}