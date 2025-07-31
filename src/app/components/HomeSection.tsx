// src/app/components/HomeSection.tsx

"use client";

import React, { useState, useCallback, useRef } from "react";
import { FiUploadCloud, FiArrowRight, FiLoader, FiRefreshCw, FiAlertCircle, FiX, FiClock } from "react-icons/fi";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Terima 'onUploadSuccess' dari komponen induk
export default function HomeSection({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [resultImagePreview, setResultImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null); // Tipe bisa disesuaikan
  const [error, setError] = useState<string | null>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Semua state dan fungsi yang berhubungan dengan history dihapus dari sini

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
      if (file.size > 10 * 1024 * 1024) {
        setError("Ukuran file terlalu besar. Maksimal 10MB.");
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
          const errorData = await response.json().catch(() => ({ error: 'Server error' }));
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
      // Panggil fungsi ini untuk memberitahu induk agar refresh history
      onUploadSuccess();
    }
  };

  // ... (sisa kode JSX Anda untuk tampilan HomeSection tidak perlu diubah) ...
  // Anda bisa copy-paste sisa kode JSX dari file HomeSection lama Anda ke sini.
}