// src/app/components/HomeSection.tsx

"use client";

import React, { useState, useRef } from "react";
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

  const handleReset = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    if (resultImagePreviewRef.current) URL.revokeObjectURL(resultImagePreviewRef.current);
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processImageFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://bananadrynes.my.id';
      const response = await fetch(`${apiUrl}/predict`, { method: 'POST', body: formData });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Server error: ' + response.status }));
          throw new Error(errorData.error || `Error ${response.status}`);
        }
        
        const data = await response.json();
      if (data.error) throw new Error(data.error);

      setResult(data);
      setImagePreview(null); // Clear preview from upload card
      setImageFile(null); // Clear file from upload card
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Gagal menganalisis gambar');
        setResult(null);
      } finally {
        setIsLoading(false);
      }
  };

  const getBadgeColor = (classification: string) => {
    switch (classification.toLowerCase()) {
      case "basah":
      case "wet":
        return "#10b981";
      case "sedang":
      case "medium":
        return "#f59e0b";
      case "kering":
      case "dry":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getDrynessLevelText = (classification: string) => {
    switch (classification.toLowerCase()) {
      case "basah":
      case "wet":
        return "Basah";
      case "sedang":
      case "medium":
        return "Sedang";
      case "kering":
      case "dry":
        return "Kering";
      default:
        return classification;
    }
  };

  const getWaterContent = (classification: string) => {
    switch (classification.toLowerCase()) {
      case "basah":
      case "wet":
        return "60–80%";
      case "sedang":
      case "medium":
        return "30–60%";
      case "kering":
      case "dry":
        return "0–30%";
      default:
        return "N/A";
    }
  };

  const getRecommendations = (classification: string): string[] => {
    const recommendations: Record<string, string[]> = {
      "Basah": [
        "Kadar air masih tinggi. Lanjutkan proses pengeringan.",
        "Sempurna untuk diolah menjadi adonan kue pisang. Untuk membuatnya kering, butuh waktu penjemuran lebih lama."
      ],
      "Sedang": [
        "Hampir kering. Lanjutkan pengeringan untuk hasil yang lebih renyah.",
        "Sudah setengah jalan! Cocok untuk pisang sale yang masih kenyal. Jemur sedikit lebih lama jika Anda ingin lebih garing.",
        "Tekstur saat ini ideal untuk dijadikan isian roti atau topping. Untuk daya simpan maksimal, lanjutkan pengeringan."
      ],
      "Kering": [
        "Sempurna! Tingkat kekeringan ideal telah tercapai. Segera simpan dalam wadah kedap udara untuk menjaga kerenyahannya.",
        "Hasil terbaik! Pisang Anda siap dinikmati atau dijual. Pastikan disimpan di tempat sejuk dan kering."
      ]
    };

    const normalizedClassification = getDrynessLevelText(classification);
    return recommendations[normalizedClassification] || recommendations["Sedang"];
  };

  return (
    <section style={{ 
      padding: "2rem", 
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center"
    }}>
      {/* Header Section */}
      <div style={{ 
        textAlign: "center", 
        marginBottom: "3rem",
        color: "white"
      }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          gap: "1rem",
          marginBottom: "1rem"
        }}>
          <Image 
            src="/assets/images/pisang_home.png" 
            alt="Banana Icon" 
            width={60} 
            height={60}
            style={{ borderRadius: "50%" }}
          />
          <h1 style={{ 
            fontSize: "2.5rem", 
            fontWeight: "bold",
            margin: 0
          }}>
            Banana Dryness Detector
          </h1>
        </div>
        <p style={{ 
          fontSize: "1.2rem", 
          opacity: 0.9,
          maxWidth: "600px",
          margin: "0 auto"
        }}>
          Deteksi tingkat kekeringan pisang dengan teknologi AI canggih. 
          Upload gambar pisang dan dapatkan analisis akurat dalam hitungan detik.
        </p>
      </div>

      {/* Main Content */}
      <div className="home-flex-row" style={{ 
        display: "flex", 
        gap: "2rem", 
        maxWidth: "1200px", 
        width: "100%",
        alignItems: "flex-start"
      }}>
        {/* Upload Card */}
        <div className="home-card" style={{ 
          background: "white", 
          borderRadius: "20px", 
          padding: "2rem", 
          flex: 1,
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          minHeight: "400px"
        }}>
          <h2 style={{ 
            fontSize: "1.5rem", 
            fontWeight: "bold", 
            marginBottom: "1.5rem",
            color: "#1f2937"
          }}>
            Unggah Gambar
          </h2>
          
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => galleryInputRef.current?.click()}
            style={{
              border: "2px dashed #d1d5db",
              borderRadius: "15px",
              padding: "3rem 2rem",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
              backgroundColor: "#f9fafb",
              marginBottom: "1.5rem"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#3b82f6";
              e.currentTarget.style.backgroundColor = "#eff6ff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#d1d5db";
              e.currentTarget.style.backgroundColor = "#f9fafb";
            }}
          >
            <FiUploadCloud style={{ fontSize: "3rem", color: "#6b7280", marginBottom: "1rem" }} />
            <p style={{ fontSize: "1.1rem", color: "#374151", marginBottom: "0.5rem" }}>
              Drag & drop gambar di sini
            </p>
            <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
              atau klik untuk memilih file
            </p>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
          </div>

          {imagePreview && (
            <div style={{ position: "relative", marginBottom: "1.5rem" }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                  borderRadius: "10px"
                }}
              />
              <button
                onClick={() => {
                  URL.revokeObjectURL(imagePreview);
                  setImagePreview(null);
                  setImageFile(null);
                }}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  background: "rgba(0,0,0,0.7)",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <FiX />
              </button>
            </div>
          )}

          <button
            onClick={handleIdentify}
            disabled={!imageFile || isLoading}
            style={{
              width: "100%",
              padding: "1rem",
              background: imageFile ? "#3b82f6" : "#d1d5db",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "1.1rem",
              fontWeight: "bold",
              cursor: imageFile ? "pointer" : "not-allowed",
              transition: "all 0.3s ease"
            }}
          >
            {isLoading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                <FiLoader className="spinner" />
                Menganalisis...
              </div>
            ) : (
              "Identifikasi"
            )}
          </button>

          {error && (
            <div style={{ 
              marginTop: "1rem", 
              padding: "1rem", 
              background: "#fef2f2", 
              color: "#dc2626", 
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              <FiAlertCircle />
              {error}
            </div>
          )}
          </div>

        {/* Result Card */}
        <div className="home-card" style={{ 
          background: "white", 
          borderRadius: "20px", 
          padding: "2rem", 
          flex: 1,
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          minHeight: "400px"
        }}>
          <h2 style={{ 
            fontSize: "1.5rem", 
            fontWeight: "bold", 
            marginBottom: "1.5rem",
            color: "#1f2937"
          }}>
            Hasil Analisis
          </h2>

          <div style={{ minHeight: "300px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            {isLoading ? (
              <div style={{ textAlign: "center" }}>
                <FiLoader className="spinner" style={{ fontSize: "3rem", color: "#3b82f6" }} />
                <p style={{ marginTop: "1rem", color: "#6b7280" }}>Menganalisis gambar...</p>
              </div>
            ) : result ? (
              <div>
                {resultImagePreview && (
                  <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
                    <img
                      src={resultImagePreview}
                      alt="Analyzed"
                  style={{ 
                        width: "100%",
                        maxWidth: "300px",
                        height: "200px",
                        objectFit: "cover",
                        borderRadius: "10px"
                      }}
                    />
                  </div>
                )}

                <div style={{ marginBottom: "1.5rem" }}>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "1rem",
                    marginBottom: "1rem"
                  }}>
                    <span style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "20px",
                      color: "white",
                      fontWeight: "bold",
                      backgroundColor: getBadgeColor(result.classification)
                    }}>
                      {getDrynessLevelText(result.classification)}
                    </span>
                    <span style={{ color: "#6b7280" }}>
                      Akurasi: {result.accuracy.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div style={{ marginBottom: "1rem" }}>
                    <p style={{ color: "#374151", marginBottom: "0.5rem" }}>
                      <strong>Kadar Air:</strong> {getWaterContent(result.classification)}
                    </p>
                    <p style={{ color: "#374151", marginBottom: "0.5rem" }}>
                      <strong>File:</strong> {result.filename}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => router.push('/history')}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    cursor: "pointer",
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    gap: "0.5rem"
                  }}
                >
                  <FiClock />
                  Lihat History
                </button>
              </div>
            ) : (
              <div style={{ textAlign: "center", color: "#6b7280" }}>
                <FiUploadCloud style={{ fontSize: "3rem", marginBottom: "1rem" }} />
                <p>Hasil analisis akan muncul di sini</p>
                </div>
              )}
            </div>
              </div>
                  </div>

      {/* Recommendation Card - Only show when there's a result */}
      {result && (
        <div style={{ 
          maxWidth: "1200px", 
          width: "100%", 
          marginTop: "2rem"
        }}>
          <div className="home-card" style={{ 
            background: "white", 
            borderRadius: "20px", 
            padding: "2rem", 
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            border: "2px solid #e5e7eb"
          }}>
            <h2 style={{ 
              fontSize: "1.5rem", 
              fontWeight: "bold", 
              marginBottom: "1.5rem",
              color: "#1f2937",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              <span style={{ 
                padding: "0.5rem 1rem",
                borderRadius: "20px",
                color: "white",
                fontWeight: "bold",
                backgroundColor: getBadgeColor(result.classification),
                fontSize: "0.9rem"
              }}>
                {getDrynessLevelText(result.classification)}
                      </span>
              Rekomendasi
            </h2>

            <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              gap: "1rem"
            }}>
              {getRecommendations(result.classification).map((recommendation: string, index: number) => (
                <div key={index} style={{
                  background: "#f8fafc",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  border: "1px solid #e2e8f0",
                  position: "relative"
                }}>
                  <div style={{
                    position: "absolute",
                    top: "1rem",
                    right: "1rem",
                    background: "#3b82f6",
                    color: "white",
                    borderRadius: "50%",
                    width: "24px",
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8rem",
                    fontWeight: "bold"
                  }}>
                    {index + 1}
                  </div>
                  <p style={{
                    fontSize: "1.1rem",
                    color: "#374151",
                    lineHeight: "1.6",
                    margin: 0,
                    paddingRight: "2rem"
                  }}>
                    {recommendation}
                  </p>
                </div>
              ))}
              </div>

            <div style={{
              marginTop: "1.5rem",
              padding: "1rem",
              background: "#f0f9ff",
              borderRadius: "10px",
              border: "1px solid #bae6fd"
            }}>
              <p style={{
                fontSize: "0.9rem",
                color: "#0369a1",
                margin: 0,
                fontStyle: "italic"
              }}>
                💡 <strong>Tips:</strong> Rekomendasi ini disesuaikan dengan tingkat kekeringan pisang Anda. 
                Ikuti saran untuk hasil terbaik dalam pengolahan dan penyimpanan.
              </p>
            </div>
          </div>
        </div>
      )}
      </section>
  );
}