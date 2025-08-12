// src/app/components/HomeSection.tsx

"use client";

import React, { useState, useRef, useCallback } from "react";
import { FiUploadCloud, FiArrowRight, FiLoader, FiRefreshCw, FiAlertCircle, FiX, FiClock, FiInfo, FiCamera, FiImage } from "react-icons/fi";
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
  recommendation?: string; // Jadikan opsional
};

export default function HomeSection({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [resultImagePreview, setResultImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showRecommendationModal, setShowRecommendationModal] = useState<boolean>(false);

  const handleReset = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setImageFile(null);
    setResultImagePreview(null);
    setResult(null);
    setError(null);
    setIsLoading(false);
    setCameraError(null);
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const startCamera = async () => {
    // Akses kamera memerlukan koneksi HTTPS di production
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      setCameraError('Akses kamera memerlukan koneksi aman (HTTPS).');
      setShowCamera(true); // Tampilkan modal kamera untuk menunjukkan error
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError('Browser Anda tidak mendukung akses kamera.');
        setShowCamera(true);
        return;
    }
    
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setCameraStream(stream);
      setShowCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError("Izin kamera ditolak atau tidak ada kamera ditemukan.");
      setShowCamera(true);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera_photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        processImageFile(file);
        stopCamera();
      }
    }, 'image/jpeg', 0.9);
  };

  const processImageFile = (file: File) => {
    handleReset();
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setImageFile(file);
  };

  const handleGalleryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  const triggerGalleryInput = () => galleryInputRef.current?.click();

  const handleIdentify = async () => {
    if (!imageFile) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    setResultImagePreview(imagePreview);

    const formData = new FormData();
    formData.append('image', imageFile);
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/predict`;
      const response = await fetch(apiUrl, { method: 'POST', body: formData });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      setImagePreview(null);
      setImageFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menganalisis gambar');
      setResult(null);
    } finally {
      setIsLoading(false);
      onUploadSuccess();
    }
  };

  const getBadgeColor = (classification: string) => {
    // ... implementasi getBadgeColor ...
  };
  
  return (
    <>
      <style>{animationStyles}</style>
      <input type="file" ref={galleryInputRef} onChange={handleGalleryImageChange} style={{ display: "none" }} accept="image/*" />
      <section id="home" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "5rem 2.5rem", background: "linear-gradient(135deg, #f0fdfa 0%, #dcfce7 100%)" }}>
        <div style={{ display: "flex", flexDirection: 'column', gap: '2.5rem', alignItems: "center", width: '100%', maxWidth: '1200px' }}>
          
          {/* ... (bagian judul dan deskripsi bisa Anda copy dari kode lama) ... */}

          <div style={{ display: "flex", justifyContent: "center", gap: "2.5rem", flexWrap: "wrap", width: "100%" }}>
            {/* Card Unggah Gambar */}
            <div style={{ background: "#fff", borderRadius: "20px", boxShadow: "0 8px 32px 0 rgba(0,0,0,0.08)", padding: "2.5rem", flex: 1, minWidth: '350px' }}>
              <h3 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "1.5rem" }}>Unggah Gambar</h3>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
                <button onClick={triggerGalleryInput} style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: 'none', background: '#4f46e5', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <FiImage /> Galeri
                </button>
                <button onClick={startCamera} style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: 'none', background: '#f59e0b', color: '#422006', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <FiCamera /> Kamera
                </button>
              </div>
              <div onClick={triggerGalleryInput} onDrop={handleDrop} onDragOver={handleDragOver} style={{ border: '2px dashed #d1d9e2', borderRadius: '12px', padding: '2rem', textAlign: 'center', cursor: 'pointer', minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {imagePreview ? (
                  <div style={{ position: 'relative' }}>
                    <Image src={imagePreview} alt="Preview" width={180} height={180} style={{ objectFit: 'cover', borderRadius: '12px' }}/>
                    <button onClick={(e) => { e.stopPropagation(); handleReset(); }} style={{ position: 'absolute', top: 4, right: 4, background: 'white', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiX size={18} color="#b91c1c" /></button>
                  </div>
                ) : <p>Seret & lepas atau pilih file</p>}
              </div>
              {imageFile && !isLoading && (
                <button onClick={handleIdentify} style={{ width: '100%', marginTop: '1.5rem', background: '#10b981', color: 'white', fontWeight: 600, border: 'none', borderRadius: '10px', padding: '0.9rem', fontSize: '1.1rem', cursor: 'pointer' }}>Identifikasi</button>
              )}
              {error && <div style={{ marginTop: "1rem", padding: "0.75rem", background: "#fef2f2", borderRadius: "8px", color: "#b91c1c", display: "flex", alignItems: "center", gap: "0.5rem" }}><FiAlertCircle size={16} />{error}</div>}
            </div>

            {/* Card Hasil Analisis & Rekomendasi */}
            <div style={{ background: "#fff", borderRadius: "20px", boxShadow: "0 8px 32px 0 rgba(0,0,0,0.08)", padding: "2.5rem", flex: 1, minWidth: '350px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.75rem", fontWeight: 700, margin: 0 }}>Hasil Analisis</h3>
                {(result || isLoading) && <button onClick={handleReset}><FiRefreshCw /></button>}
              </div>
              <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "1rem", minHeight: "300px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {isLoading ? (
                  <div><FiLoader className="spinner" /><p>Menganalisis...</p></div>
                ) : result ? (
                  <div style={{ textAlign: 'center', width: '100%' }}>
                    {resultImagePreview && <Image src={resultImagePreview} alt="Hasil" width={200} height={200} style={{ borderRadius: '12px', marginBottom: '1rem' }} />}
                    <p>Klasifikasi: <span style={{ ...getBadgeColor(result.classification), padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 'bold' }}>{result.classification}</span></p>
                    <p>Keyakinan: {result.accuracy}%</p>
                    {result.recommendation && <p><strong>Rekomendasi:</strong> {result.recommendation}</p>}
                    <button onClick={() => router.push('/history')} style={{ marginTop: '1rem' }}>Lihat History</button>
                  </div>
                ) : (
                  <p>Hasil deteksi akan muncul di sini.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal Kamera */}
      {showCamera && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '1rem', borderRadius: '15px' }}>
            {cameraError ? (
              <div>
                <p style={{color: 'red'}}>{cameraError}</p>
                <button onClick={stopCamera}>Tutup</button>
              </div>
            ) : (
              <>
                <video ref={videoRef} style={{ width: '100%', maxWidth: '500px', borderRadius: '10px' }}/>
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-around' }}>
                  <button onClick={takePhoto}>Ambil Foto</button>
                  <button onClick={stopCamera}>Batal</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}