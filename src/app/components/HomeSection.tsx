"use client";

import React, { useState, useRef, useEffect } from "react";
import { FiUploadCloud, FiArrowRight, FiLoader, FiRefreshCw, FiAlertCircle, FiX } from "react-icons/fi";
import Image from "next/image";

// Animasi CSS
const animationStyles = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .spinner { animation: spin 1s linear infinite; }
`;

const cardStyle: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(0, 0, 0, 0.05)",
  borderRadius: "20px",
  padding: "2.5rem",
  width: "100%",
  boxShadow: "0 8px 32px 0 rgba(0,0,0,0.08)",
  textAlign: "center",
  flex: "1 1 350px", 
};

type AnalysisResult = {
  classification: string;
  accuracy: number;
  drynessLevel: number;
  is_banana?: boolean;
};

type HistoryItem = {
  id: number;
  filename: string;
  classification: string;
  accuracy: number;
  drynessLevel: number;
  is_banana: boolean;
  created_at: string;
};

export default function HomeSection() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null); // <-- simpan file
  const [resultImagePreview, setResultImagePreview] = useState<string | null>(null); // <-- baru
  const resultImagePreviewRef = useRef<string | null>(null); // <-- baru
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setHistoryLoading(true);
      setHistoryError(null);
      try {
        const res = await fetch('http://localhost:5000/history');
        if (!res.ok) throw new Error('Gagal mengambil data history');
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        setHistoryError('Gagal mengambil data history');
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, [result]); // refresh history setiap ada hasil baru

  const handleReset = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    if (resultImagePreviewRef.current) {
      URL.revokeObjectURL(resultImagePreviewRef.current);
      resultImagePreviewRef.current = null;
    }
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
      // Validasi ukuran file (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("Ukuran file terlalu besar. Maksimal 10MB.");
        return;
      }
      // Validasi tipe file
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

  const handleGalleryImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processImageFile(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      processImageFile(event.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const triggerGalleryInput = () => galleryInputRef.current?.click();

  const handleIdentify = async () => {
    if (!imageFile) return;
    setIsLoading(true);
    setResult(null);
    setError(null);
    setResultImagePreview(imagePreview); // simpan preview untuk hasil analisis
    resultImagePreviewRef.current = imagePreview; // simpan ref untuk revoke nanti
    const formData = new FormData();
    formData.append('image', imageFile);
    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setResult({
        classification: data.classification,
        accuracy: Math.round(data.accuracy * 10) / 10,
        drynessLevel: data.drynessLevel,
        is_banana: data.is_banana
      });
      // Setelah identifikasi, hapus preview dan file dari card unggah gambar
      setImagePreview(null);
      setImageFile(null);
      // JANGAN revokeObjectURL di sini!
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Gagal menganalisis gambar');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getBadgeColor = (classification: string) => {
    switch (classification) {
      case "Kering": return { background: "#fef2f2", color: "#b91c1c" };
      case "Sedang": return { background: "#fffbeb", color: "#b45309" };
      case "Basah": return { background: "#f0fdf4", color: "#15803d" };
      case "Gambar Bukan Pisang": return { background: "#f1f5f9", color: "#475569" };
      default: return { background: "#f1f5f9", color: "#475569" };
    }
  };

  const getConfidenceColor = (accuracy: number) => {
    if (accuracy >= 80) return "#15803d"; // Green
    if (accuracy >= 60) return "#b45309"; // Orange
    return "#b91c1c"; // Red
  };

  return (
    <>
      <style>{animationStyles}</style>

      <input type="file" ref={galleryInputRef} onChange={handleGalleryImageChange} style={{ display: "none" }} accept="image/*" />

      <section id="home" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "5rem 2.5rem", background: "linear-gradient(135deg, #f0fdfa 0%, #dcfce7 100%)", overflow: "hidden" }}>
        <style>{`
          .home-flex-row {
            display: flex;
            flex-direction: row;
            align-items: stretch;
            gap: 2.5rem;
            flex-wrap: wrap;
            max-width: 1200px;
            width: 100%;
          }
          @media (max-width: 900px) {
            .home-flex-row {
              flex-direction: column !important;
              gap: 1.5rem !important;
              align-items: stretch !important;
            }
            .home-card {
              width: 100% !important;
              margin-bottom: 16px !important;
              padding: 1.2rem !important;
              box-sizing: border-box !important;
            }
            .home-card h3 {
              font-size: 1.3rem !important;
              margin-bottom: 1rem !important;
            }
            .home-card p {
              font-size: 1rem !important;
              margin-bottom: 1.2rem !important;
            }
          }
        `}</style>
        <div className="home-flex-row">

          {/* Judul & Deskripsi + Gambar Pisang */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", alignItems: "center", gap: "3rem", width: "100%" }}>
            <div className="fade-in-up" style={{ opacity: 0, animationDelay: "0.2s" }}>
              <h1 style={{ fontSize: "3.8rem", fontWeight: 800, color: "#1a202c", lineHeight: 1.15, letterSpacing: "-2.5px" }}>
                Analisis Kekeringan Pisang dengan AI
              </h1>
              <p style={{ fontSize: "1.2rem", color: "#4a5568", margin: "1.5rem 0 2.5rem 0" }}>
                Dapatkan data akurat tentang tingkat kekeringan pisang Anda secara instan menggunakan teknologi AI terdepan.
              </p>
              <button onClick={() => document.getElementById('upload-card')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: "#fbbf24", color: "#422006", fontWeight: 600, border: "none", borderRadius: "12px", padding: "1rem 2rem", fontSize: "1.1rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.75rem", transition: "all 0.3s ease", boxShadow: "0 4px 20px rgba(251, 191, 36, 0.3)" }}>
                Mulai Deteksi Sekarang <FiArrowRight />
              </button>
            </div>

            <div className="fade-in-up" style={{ opacity: 0, animationDelay: "0.4s", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px" }}>
              <div style={{ position: "absolute", width: "100%", height: "100%", maxWidth: "400px", maxHeight: "400px", background: "linear-gradient(135deg, #fbbf24 0%, #ffe066 100%)", borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%", opacity: 0.8, filter: "blur(10px)", animation: "blobMorph 8s ease-in-out infinite alternate" }}></div>
              <style>{`@keyframes blobMorph { 0% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; } 100% { border-radius: 58% 42% 43% 57% / 43% 52% 48% 57%; transform: rotate(15deg); } }`}</style>
              <Image src="/assets/images/pisang_home.png" alt="Pisang yang dianalisis" width={400} height={400} priority={true} style={{ position: "relative", zIndex: 2, width: "100%", height: "auto", maxWidth: "380px", filter: "drop-shadow(0 20px 25px rgba(0,0,0,0.2))", transform: "rotate(-10deg)" }} />
            </div>
          </div>

          {/* Dua Card Sejajar */}
          <div id="upload-card" className="fade-in-up" style={{ opacity: 0, animationDelay: "0.6s", display: "flex", justifyContent: "center", gap: "2.5rem", flexWrap: "wrap", width: "100%" }}>
            {/* Card Unggah Gambar */}
            <div className="home-card" style={{ background: "#fff", borderRadius: "20px", boxShadow: "0 8px 32px 0 rgba(0,0,0,0.08)", padding: "2.5rem", flex: 1, marginBottom: 24, height: "100%" }}>
              <h3 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#2d3748", marginBottom: "1.5rem" }}>
                Unggah Gambar
              </h3>
              <p style={{ color: "#666", marginBottom: "2rem", minHeight: "40px", fontSize: "1.1rem" }}>
                Pilih gambar pisang dari galeri Anda (maksimal 10MB).
              </p>
              {/* Drag and Drop Area */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                style={{
                  border: '2px dashed #d1d9e2',
                  borderRadius: '12px',
                  padding: '2rem',
                  textAlign: 'center',
                  background: '#f9fafb',
                  marginBottom: '1.5rem',
                  cursor: 'pointer',
                  color: '#64748b',
                  fontSize: '1.1rem',
                  transition: 'border 0.2s',
                  position: 'relative',
                  minHeight: 180
                }}
                title="Drag & drop gambar di sini"
                onClick={triggerGalleryInput}
              >
                {imagePreview ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img src={imagePreview} alt="Preview" style={{ maxWidth: 180, maxHeight: 180, borderRadius: 12, margin: '0 auto', display: 'block', width: 180, height: 'auto' }} />
                    <button
                      onClick={e => { e.stopPropagation(); handleReset(); }}
                      style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        background: 'rgba(255,255,255,0.85)',
                        border: 'none',
                        borderRadius: '50%',
                        width: 28,
                        height: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                        zIndex: 2
                      }}
                      title="Hapus gambar"
                      type="button"
                    >
                      <FiX size={18} color="#b91c1c" />
                    </button>
                  </div>
                ) : (
                  <>Seret & lepas gambar di sini atau klik untuk memilih file</>
                )}
              </div>
              <input type="file" ref={galleryInputRef} onChange={handleGalleryImageChange} style={{ display: "none" }} accept="image/*" />
              {/* Tombol Identifikasi */}
              {imagePreview && !isLoading && (
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'center' }}>
                  <button
                    onClick={handleIdentify}
                    style={{ background: '#fbbf24', color: '#422006', fontWeight: 600, border: 'none', borderRadius: '10px', padding: '0.7rem 1.5rem', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(251, 191, 36, 0.10)', transition: 'all 0.2s' }}
                  >
                    Identifikasi
                  </button>
                </div>
              )}
              {error && (
                <div style={{ marginTop: "1rem", padding: "0.75rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", color: "#b91c1c", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FiAlertCircle size={16} />
                  {error}
                </div>
              )}
            </div>

            {/* Card Hasil Analisis */}
            <div className="home-card" style={{ background: "#fff", borderRadius: "20px", boxShadow: "0 8px 32px 0 rgba(0,0,0,0.08)", padding: "2.5rem", flex: 1, marginBottom: 24, height: "100%" }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#2d3748", margin: 0 }}>
                  Hasil Analisis
                </h3>
                {(resultImagePreview || isLoading) && (
                  <button onClick={handleReset} title="Ulangi Analisis" style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', transition: 'color 0.2s' }}>
                    <FiRefreshCw size={20} />
                  </button>
                )}
              </div>
              <div style={{ background: "#e9edf1", borderRadius: "12px", padding: "1rem", minHeight: "182px", display: "flex", alignItems: "center", justifyContent: "center", border: "2px dashed #d1d9e2" }}>
                {isLoading ? (
                  <div style={{ textAlign: 'center', color: '#4a5568' }}>
                    <FiLoader size={32} className="spinner" style={{ margin: '0 auto 0.5rem auto' }} />
                    <p style={{ fontWeight: 500 }}>Menganalisis Gambar...</p>
                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Mohon tunggu sebentar</p>
                  </div>
                ) : resultImagePreview && result ? (
                  <div style={{ width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Image src={resultImagePreview} alt="Preview" width={360} height={360} style={{ borderRadius: '20px', objectFit: 'cover', width: 360, height: 'auto', boxShadow: '0 4px 24px rgba(0,0,0,0.12)', marginBottom: '1.5rem' }} />
                    <div style={{ width: '100%', maxWidth: 400, margin: '0 auto' }}>
                      <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '0.5rem', textAlign: 'center' }}>Klasifikasi:</p>
                      <span style={{ ...getBadgeColor(result.classification), padding: '0.4rem 1.1rem', borderRadius: '9999px', fontSize: '1.25rem', fontWeight: 700, display: 'inline-block', marginBottom: '1.2rem' }}>
                        {result.classification}
                      </span>
                      <div style={{ borderTop: '1px solid #d1d9e2', marginTop: '0.7rem', paddingTop: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.1rem', color: '#4a5568', fontWeight: 500 }}>Keyakinan</span>
                        <span style={{ fontSize: '1.25rem', color: result.accuracy >= 80 ? '#15803d' : result.accuracy >= 60 ? '#b45309' : '#b91c1c', fontWeight: 700 }}>{result.accuracy}%</span>
                      </div>
                      {result.classification === "Gambar Bukan Pisang" && (
                        <div style={{ marginTop: '1.5rem', padding: '0.8rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                          <p style={{ fontSize: '1rem', color: '#64748b', margin: 0 }}>
                            Silakan upload gambar pisang yang lebih jelas
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p style={{ color: "#718096", fontStyle: "italic" }}>
                    Hasil deteksi akan muncul di sini.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

     
    </>
  );
}