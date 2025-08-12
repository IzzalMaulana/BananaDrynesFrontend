// src/app/components/HomeSection.tsx

"use client";

import React, { useState, useRef, useEffect } from "react";
import { FiArrowRight, FiLoader, FiRefreshCw, FiAlertCircle, FiX, FiClock, FiInfo, FiCamera, FiImage } from "react-icons/fi";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [resultImagePreview, setResultImagePreview] = useState<string | null>(null);
  const resultImagePreviewRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  
  // State untuk kamera
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    setCameraError(null);
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  // Fungsi untuk mengakses kamera
  const startCamera = async () => {
    try {
      setCameraError(null);
      
      // Cek apakah browser mendukung getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser Anda tidak mendukung akses kamera. Gunakan browser modern seperti Chrome, Firefox, atau Safari.');
      }
      
      // Cek apakah berjalan di HTTPS (diperlukan untuk akses kamera)
      const isLocalhost = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' ||
                         window.location.hostname === '0.0.0.0' ||
                         window.location.hostname.includes('localhost') ||
                         window.location.hostname.includes('127.0.0.1');
      
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      // Skip HTTPS check untuk development mode
      if (window.location.protocol !== 'https:' && !isLocalhost && !isDevelopment) {
        throw new Error('Akses kamera memerlukan koneksi HTTPS. Silakan gunakan upload dari galeri.');
      }
      
      const constraints = {
        video: { 
          facingMode: 'environment', // Gunakan kamera belakang jika tersedia
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      setCameraStream(stream);
      setShowCamera(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Tunggu video siap
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(e => {
              console.warn('Video play failed:', e);
            });
          }
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      
      let errorMessage = 'Tidak dapat mengakses kamera.';
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Izin kamera ditolak. Silakan izinkan akses kamera di browser Anda.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'Tidak ada kamera yang ditemukan. Pastikan perangkat Anda memiliki kamera.';
        } else if (err.name === 'NotSupportedError') {
          errorMessage = 'Browser Anda tidak mendukung akses kamera. Gunakan browser modern.';
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'Kamera sedang digunakan oleh aplikasi lain. Tutup aplikasi lain yang menggunakan kamera.';
        } else if (err.name === 'OverconstrainedError') {
          errorMessage = 'Kamera tidak mendukung resolusi yang diminta. Silakan coba lagi.';
        } else {
          errorMessage = err.message || 'Terjadi kesalahan saat mengakses kamera.';
        }
      }
      
      setCameraError(errorMessage);
    }
  };

  // Fungsi untuk menghentikan kamera
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
    setCameraError(null);
  };

  // Fungsi untuk mengambil foto dari kamera
  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Set canvas size sesuai dengan video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Gambar frame video ke canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Konversi canvas ke blob
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera_photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        processImageFile(file);
        stopCamera(); // Tutup kamera setelah mengambil foto
      }
    }, 'image/jpeg', 0.8);
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
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/predict`;
     
  const response = await fetch(apiUrl, {
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

  // Fungsi untuk mendapatkan rekomendasi berdasarkan klasifikasi
  const getRecommendations = (classification: string): string[] => {
    const recommendations: Record<string, string[]> = {
      "Basah": [
        "Adonan Kue & Roti: Sempurna untuk bahan utama membuat Banana Bread, Muffin Pisang, atau Pancake Pisang karena kelembutannya akan menyatu dengan adonan.",
        "Minuman Segar: Pilihan ideal untuk dibuat Smoothies atau Jus Pisang karena mudah hancur dan memberikan tekstur kental alami.",
        "Gorengan Klasik: Bahan terbaik untuk membuat Pisang Goreng, Pisang Nugget, atau Pisang Molen yang lumer di dalam.",
        "Hidangan Penutup Tradisional: Sangat cocok untuk dimasak menjadi Kolak Pisang atau Pisang Ijo, di mana pisang direbus dan tekstur lembutnya sangat disukai.",
        "Makanan Bayi: Mudah dilumatkan menjadi bubur sebagai MPASI (Makanan Pendamping ASI) yang alami dan bergizi."
      ],
      "Sedang": [
        "Sale Pisang Kenyal: Ini adalah bentuk paling ideal untuk produk Sale Pisang yang tidak renyah, melainkan kenyal dan legit saat digigit.",
        "Isian Roti & Kue: Sangat baik untuk dijadikan isian roti pisang, bolen, atau kue Nagasari. Pisang tidak akan terlalu benyek dan tetap memberikan potongan yang terasa.",
        "Campuran Granola & Sereal: Potong kecil-kecil dan campurkan ke dalam granola, muesli, atau sereal sarapan untuk memberikan rasa manis dan tekstur kenyal.",
        "Energy Bar Buatan Sendiri: Teksturnya yang padat dan kenyal menjadikannya bahan pengikat yang sempurna untuk membuat energy bar sehat bersama oat dan kacang-kacangan.",
        "Topping Oatmeal & Yogurt: Menjadi topping yang lezat dan bergizi untuk semangkuk oatmeal hangat atau yogurt."
      ],
      "Kering": [
        "Keripik Pisang Renyah: Bentuk olahan paling populer. Pisang yang sudah kering akan menghasilkan keripik pisang yang garing dan tidak mudah melempem.",
        "Tepung Pisang (Banana Flour): Giling pisang yang sudah sangat kering hingga menjadi bubuk halus. Tepung Pisang ini adalah alternatif tepung bebas gluten (gluten-free) yang sehat untuk membuat kue, biskuit, atau pancake.",
        "Taburan (Garnish) & Dekorasi Kue: Hancurkan pisang kering menjadi remah-remah untuk taburan di atas es krim, kue tart, atau donat untuk memberikan rasa manis dan tekstur renyah.",
        "Bahan Baku Cokelat & Permen: Potongan kecil pisang kering bisa dicampurkan ke dalam adonan cokelat batangan atau permen untuk menambah variasi rasa dan tekstur.",
        "Infused Tea: Potongan kecil pisang kering dapat digunakan untuk memberikan aroma dan rasa manis alami pada seduhan teh."
      ],
      "Gambar Bukan Pisang": [
        "Pastikan gambar yang diupload adalah pisang",
        "Gunakan pencahayaan yang baik saat foto",
        "Hindari gambar yang blur atau tidak jelas",
        "Pastikan pisang terlihat jelas dalam frame"
      ]
    };
    
    const normalizedClassification = classification;
    return recommendations[normalizedClassification] || recommendations["Sedang"];
  };

  const [showRecommendationModal, setShowRecommendationModal] = useState<boolean>(false);

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
                Pilih gambar pisang dari galeri atau ambil foto dengan kamera (maksimal 10MB).
              </p>
              
              {/* Tombol Upload Options */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
                <button
                  onClick={triggerGalleryInput}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '0.75rem 1.5rem',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    transition: 'all 0.2s ease',
                    minWidth: '140px',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                  }}
                >
                  <FiImage size={18} />
                  Galeri
                </button>
                <button
                  onClick={startCamera}
                  style={{
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                    color: '#422006',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '0.75rem 1.5rem',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)',
                    transition: 'all 0.2s ease',
                    minWidth: '140px',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(251, 191, 36, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(251, 191, 36, 0.3)';
                  }}
                >
                  <FiCamera size={18} />
                  Kamera
                </button>
              </div>

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
                    <Image src={imagePreview} alt="Preview" width={180} height={180} style={{ borderRadius: 12, margin: '0 auto', display: 'block', width: 180, height: 'auto' }} />
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
                     
                      {/* Tombol Lihat History */}
                      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                        <button
                          onClick={() => setShowRecommendationModal(true)}
                          style={{
                            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                            color: '#422006',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '0.75rem 1.5rem',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)',
                            transition: 'all 0.2s ease',
                            minWidth: '160px',
                            justifyContent: 'center'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(251, 191, 36, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(251, 191, 36, 0.3)';
                          }}
                        >
                          <FiInfo size={18} />
                          Lihat Rekomendasi
                        </button>
                        <button
                          onClick={() => router.push('/history')}
                          style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '0.75rem 1.5rem',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                            transition: 'all 0.2s ease',
                            minWidth: '160px',
                            justifyContent: 'center'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                          }}
                        >
                          <FiClock size={18} />
                          Lihat History
                        </button>
                      </div>
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

          {/* Card Rekomendasi - REMOVED */}
        </div>
      </section>

      {/* Modal Rekomendasi */}
      {showRecommendationModal && result && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}
        onClick={() => setShowRecommendationModal(false)}
        >
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            borderRadius: '20px',
            padding: '2.5rem',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative',
            border: '2px solid #fbbf24',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem',
              borderBottom: '2px solid #fbbf24',
              paddingBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <FiInfo size={32} color="#d97706" />
                <h2 style={{ 
                  fontSize: '2rem', 
                  fontWeight: 'bold', 
                  color: '#92400e',
                  margin: 0
                }}>
                  Rekomendasi Olahan
                </h2>
              </div>
              <button
                onClick={() => setShowRecommendationModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.8)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  color: '#92400e',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.8)';
                }}
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Badge Klasifikasi */}
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '2rem',
              padding: '1rem',
              background: 'rgba(255,255,255,0.6)',
              borderRadius: '15px',
              border: '1px solid #fbbf24'
            }}>
              <p style={{ fontSize: '1.1rem', color: '#78350f', marginBottom: '0.5rem' }}>
                Klasifikasi Pisang Anda:
              </p>
              <span style={{
                ...getBadgeColor(result.classification),
                padding: '0.5rem 1.5rem',
                borderRadius: '25px',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                display: 'inline-block'
              }}>
                {result.classification}
              </span>
            </div>

            {/* Daftar Rekomendasi */}
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              {getRecommendations(result.classification).map((recommendation, index) => (
                <div key={index} style={{
                  background: 'rgba(255,255,255,0.8)',
                  borderRadius: '15px',
                  padding: '1.5rem',
                  marginBottom: '1rem',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: '#fbbf24',
                    color: '#422006',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}>
                    {index + 1}
                  </div>
                  <p style={{
                    fontSize: '1.1rem',
                    color: '#78350f',
                    lineHeight: '1.7',
                    margin: 0,
                    paddingRight: '3rem'
                  }}>
                    {recommendation}
                  </p>
                </div>
              ))}
            </div>

            {/* Footer Modal */}
            <div style={{
              marginTop: '2rem',
              padding: '1rem',
              background: 'rgba(255,255,255,0.6)',
              borderRadius: '10px',
              border: '1px solid #fbbf24',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '0.9rem',
                color: '#92400e',
                margin: 0,
                fontStyle: 'italic'
              }}>
                💡 <strong>Tips:</strong> Rekomendasi ini disesuaikan dengan tingkat kekeringan pisang Anda. 
                Ikuti saran untuk hasil terbaik dalam pengolahan dan penyimpanan.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Kamera */}
      {showCamera && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#1a202c',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '90vw',
            maxHeight: '90vh',
            position: 'relative',
            border: '2px solid #fbbf24',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            {/* Header Modal */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              borderBottom: '2px solid #fbbf24',
              paddingBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <FiCamera size={32} color="#fbbf24" />
                <h2 style={{ 
                  fontSize: '1.8rem', 
                  fontWeight: 'bold', 
                  color: '#fbbf24',
                  margin: 0
                }}>
                  Ambil Foto Pisang
                </h2>
              </div>
              <button
                onClick={stopCamera}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  color: '#fbbf24',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }}
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Video Preview */}
            <div style={{
              position: 'relative',
              borderRadius: '15px',
              overflow: 'hidden',
              marginBottom: '1.5rem',
              background: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px'
            }}>
              {cameraError ? (
                <div style={{
                  textAlign: 'center',
                  color: '#fbbf24',
                  padding: '2rem'
                }}>
                  <FiAlertCircle size={48} style={{ marginBottom: '1rem' }} />
                  <p style={{ fontSize: '1.1rem', margin: '0.5rem 0', fontWeight: '600' }}>
                    {cameraError}
                  </p>
                  <p style={{ fontSize: '0.9rem', color: '#a0aec0', marginBottom: '1.5rem' }}>
                    Anda masih dapat menggunakan fitur upload dari galeri untuk menganalisis gambar pisang.
                  </p>
                  <div style={{
                    background: 'rgba(251, 191, 36, 0.1)',
                    borderRadius: '10px',
                    padding: '1rem',
                    border: '1px solid rgba(251, 191, 36, 0.3)',
                    marginTop: '1rem'
                  }}>
                    <p style={{ fontSize: '0.85rem', color: '#fbbf24', margin: 0 }}>
                      💡 <strong>Tips:</strong> Pastikan Anda menggunakan browser modern (Chrome, Firefox, Safari) dan memberikan izin kamera saat diminta.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '400px',
                      borderRadius: '15px'
                    }}
                  />
                  <canvas
                    ref={canvasRef}
                    style={{ display: 'none' }}
                  />
                </>
              )}
            </div>

            {/* Tombol Kontrol */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={stopCamera}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fbbf24',
                  border: '2px solid #fbbf24',
                  borderRadius: '12px',
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  minWidth: '120px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }}
              >
                Batal
              </button>
              
              {cameraError && (
                <button
                  onClick={() => {
                    stopCamera();
                    triggerGalleryInput();
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '0.75rem 1.5rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    transition: 'all 0.2s ease',
                    minWidth: '160px',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                  }}
                >
                  <FiImage size={18} />
                  Upload dari Galeri
                </button>
              )}
              
              {!cameraError && (
                <button
                  onClick={takePhoto}
                  style={{
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                    color: '#422006',
                    border: 'none',
                    borderRadius: '50%',
                    width: '80px',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(251, 191, 36, 0.4)',
                    transition: 'all 0.2s ease',
                    fontSize: '2rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.boxShadow = '0 6px 25px rgba(251, 191, 36, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(251, 191, 36, 0.4)';
                  }}
                >
                  📸
                </button>
              )}
            </div>

            {/* Instruksi */}
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: 'rgba(251, 191, 36, 0.1)',
              borderRadius: '10px',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '0.9rem',
                color: '#fbbf24',
                margin: 0,
                fontStyle: 'italic'
              }}>
                📱 <strong>Tips:</strong> Pastikan pisang terlihat jelas dalam frame dan pencahayaan cukup baik untuk hasil analisis yang akurat.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}