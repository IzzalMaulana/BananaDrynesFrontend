// src/app/components/HomeSection.tsx

"use client";

import React, { useState, useCallback, useRef } from "react";
import { FiUploadCloud, FiArrowRight, FiLoader, FiRefreshCw, FiAlertCircle, FiX, FiClock } from "react-icons/fi";
import Image from "next/image";
import { useRouter } from "next/navigation";

const animationStyles = `
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .spinner { animation: spin 1s linear infinite; }
`;

type AnalysisResult = {
  classification: string;
  accuracy: number;
  drynessLevel: number;
  filename: string;
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
      if (file.size > 20 * 1024 * 1024) { // Batas 20MB
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

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => event.preventDefault();
  const triggerGalleryInput = () => galleryInputRef.current?.click();

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
      onUploadSuccess(); // Panggil fungsi dari induk untuk refresh history
    }
  };
  
  const getBadgeColor = (classification: string) => {
    switch (classification) {
      case "Kering": return { background: "#fef2f2", color: "#b91c1c" };
      case "Sedang": return { background: "#fffbeb", color: "#b45309" };
      case "Basah": return { background: "#f0fdf4", color: "#15803d" };
      default: return { background: "#f1f5f9", color: "#475569" };
    }
  };

  return (
    <>
      <style>{animationStyles}</style>
      <input type="file" ref={galleryInputRef} onChange={handleGalleryImageChange} style={{ display: "none" }} accept="image/*" />
      <section id="home" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "5rem 2.5rem", background: "linear-gradient(135deg, #f0fdfa 0%, #dcfce7 100%)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", alignItems: "start", gap: "3rem", width: "100%", maxWidth: "1200px" }}>
            
            {/* Kolom Upload */}
            <div style={{ background: "#fff", borderRadius: "20px", boxShadow: "0 8px 32px 0 rgba(0,0,0,0.08)", padding: "2.5rem" }}>
                <h3 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#2d3748", marginBottom: "1.5rem", textAlign: "center" }}>Unggah Gambar</h3>
                <div 
                    onClick={triggerGalleryInput} 
                    onDrop={handleDrop} 
                    onDragOver={handleDragOver}
                    style={{ border: '2px dashed #d1d9e2', borderRadius: '12px', padding: '2rem', textAlign: 'center', cursor: 'pointer', minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    {imagePreview ? (
                        <div style={{ position: 'relative' }}>
                            <Image src={imagePreview} alt="Preview" width={180} height={180} style={{ objectFit: 'cover', borderRadius: '12px' }} />
                            <button onClick={(e) => { e.stopPropagation(); handleReset(); }} style={{ position: 'absolute', top: 4, right: 4, background: 'white', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiX size={18} color="#b91c1c" /></button>
                        </div>
                    ) : <p>Seret & lepas gambar di sini atau klik untuk memilih file</p>}
                </div>
                {imageFile && !isLoading && (
                    <button onClick={handleIdentify} style={{ width: '100%', marginTop: '1.5rem', background: '#fbbf24', color: '#422006', fontWeight: 600, border: 'none', borderRadius: '10px', padding: '0.9rem', fontSize: '1.1rem', cursor: 'pointer' }}>Identifikasi</button>
                )}
                {error && <div style={{ marginTop: "1rem", padding: "0.75rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", color: "#b91c1c", display: "flex", alignItems: "center", gap: "0.5rem" }}><FiAlertCircle size={16} />{error}</div>}
            </div>

            {/* Kolom Hasil */}
            <div style={{ background: "#fff", borderRadius: "20px", boxShadow: "0 8px 32px 0 rgba(0,0,0,0.08)", padding: "2.5rem", minHeight: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "1.5rem" }}>
                    <h3 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#2d3748", margin: 0 }}>Hasil Analisis</h3>
                    {(result || isLoading) && <button onClick={handleReset} title="Ulangi Analisis" style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}><FiRefreshCw size={20} /></button>}
                </div>
                <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "1rem", minHeight: "300px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {isLoading ? (
                        <div style={{ textAlign: 'center' }}><FiLoader size={32} className="spinner" /><p>Menganalisis...</p></div>
                    ) : result ? (
                        <div style={{ textAlign: 'center', width: '100%' }}>
                            {resultImagePreview && <Image src={resultImagePreview} alt="Hasil" width={200} height={200} style={{ borderRadius: '12px', objectFit: 'cover', marginBottom: '1rem' }} />}
                            <p style={{ marginBottom: '0.5rem' }}>Klasifikasi:</p>
                            <span style={{ ...getBadgeColor(result.classification), padding: '0.4rem 1.1rem', borderRadius: '9999px', fontSize: '1.25rem', fontWeight: 700, display: 'inline-block', marginBottom: '1.2rem' }}>{result.classification}</span>
                            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.9rem', display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                <span>Keyakinan</span>
                                <span style={{ fontWeight: 700, color: getBadgeColor(result.classification).color }}>{result.accuracy}%</span>
                            </div>
                            
                            {/* === TOMBOL LIHAT HISTORY DITAMBAHKAN DI SINI === */}
                            <button
                                onClick={() => router.push('/history')}
                                style={{
                                    marginTop: '1.5rem',
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
                                Lihat History
                            </button>

                        </div>
                    ) : (
                        <p style={{ color: "#718096" }}>Hasil deteksi akan muncul di sini.</p>
                    )}
                </div>
            </div>
        </div>
      </section>
    </>
  );
}