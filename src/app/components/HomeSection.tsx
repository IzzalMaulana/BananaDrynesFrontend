// src/app/components/HomeSection.tsx

"use client";

import React, { useState, useCallback, useRef } from "react";
import { FiUploadCloud, FiArrowRight, FiLoader, FiRefreshCw, FiAlertCircle, FiX, FiClock } from "react-icons/fi";
import Image from "next/image";
import { useRouter } from "next/navigation";

type AnalysisResult = {
  classification: string;
  accuracy: number;
  drynessLevel: number;
  filename: string;
  recommendation: string;
};

// Terima 'onUploadSuccess' dari komponen induk
export default function HomeSection({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [resultImagePreview, setResultImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleReset = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setImageFile(null);
    setResultImagePreview(null);
    setResult(null);
    setError(null);
    setIsLoading(false);
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const processImageFile = (file: File) => {
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        setError("Ukuran file terlalu besar. Maksimal 20MB.");
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError("File yang dipilih bukan gambar.");
        return;
      }
      handleReset();
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setImageFile(file);
    }
  };

  const handleIdentify = async () => {
    if (!imageFile) return;
    setIsLoading(true);
    setResult(null);
    setError(null);
    setResultImagePreview(imagePreview);

    const formData = new FormData();
    formData.append('image', imageFile);
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/predict`;
      const response = await fetch(apiUrl, { method: 'POST', body: formData });
      
      if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Server error: ' + response.status }));
          throw new Error(errorData.error || `Error ${response.status}`);
      }
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setResult(data);
      setImagePreview(null);
      setImageFile(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Gagal menganalisis gambar');
      setResult(null);
    } finally {
      setIsLoading(false);
      onUploadSuccess();
    }
  };

  const getBadgeColor = (classification: string) => {
    // ... implementasi getBadgeColor ...
  };
  
  // ... (fungsi handler lainnya seperti handleDrop, handleDragOver, dll.) ...

  return (
    <section /* ...props styling... */>
      <div /* ...layout utama... */>
        {/* Kolom Upload */}
        <div /* ...card upload... */>
          {/* ...isi card upload... */}
        </div>

        {/* Kolom Hasil & Rekomendasi */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
          {/* Card Hasil Analisis */}
          <div className="home-card" style={{ background: "#fff", borderRadius: "20px", /* ...styling lainnya... */ }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', /* ... */ }}>
              <h3>Hasil Analisis</h3>
              {(result || isLoading) && <button onClick={handleReset}><FiRefreshCw /></button>}
            </div>
            <div style={{ /* ...area konten hasil... */ }}>
              {isLoading ? (
                <div><FiLoader className="spinner" /><p>Menganalisis...</p></div>
              ) : result ? (
                <div>
                  {/* ...tampilan hasil klasifikasi & akurasi... */}
                </div>
              ) : (
                <p>Hasil deteksi akan muncul di sini.</p>
              )}
            </div>
          </div>

          {/* Card Rekomendasi (Hanya muncul jika ada hasil) */}
          {result && result.recommendation && (
            <div className="home-card" style={{ background: "#fff", borderRadius: "20px", /* ...styling lainnya... */ }}>
              <h3>Rekomendasi</h3>
              <p style={{ fontSize: "1.1rem", color: "#4a5568", lineHeight: 1.6 }}>
                {result.recommendation}
              </p>
              <button onClick={() => router.push('/history')} style={{ marginTop: '1rem', /* ...styling... */ }}>
                Lihat Semua Riwayat
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}