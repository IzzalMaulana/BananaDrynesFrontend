// src/app/page.tsx

"use client";

import React, { useState, useEffect } from 'react';
import HomeSection from './components/HomeSection';
import HistorySection from './components/HistorySection';
import AboutSection from './components/AboutSection';
import BananaFactsSection from './components/BananaFactsSection';
import Footer from './components/Footer';
import Navbar from './components/Navbar';

// Tipe data untuk item history
interface HistoryItem {
  id: number;
  filename: string;
  classification: string;
  accuracy: number;
  drynessLevel: number;
  created_at: string;
}

export default function Home() {
  // State dan fungsi history dikelola di sini
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/history`;
      const res = await fetch(apiUrl);
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
    <main>
      <Navbar />
      {/* Kirim fungsi fetchHistory sebagai properti onUploadSuccess */}
      <HomeSection onUploadSuccess={fetchHistory} />
      
      {/* Kirim data history dan fungsi lainnya sebagai props */}
      <HistorySection 
        history={history} 
        loading={historyLoading} 
        error={historyError}
        fetchHistory={fetchHistory}
        setHistory={setHistory}
      />
      
      <AboutSection />
      <BananaFactsSection />
      <Footer />
    </main>
  );
}