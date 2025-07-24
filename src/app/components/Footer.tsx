// src/components/Footer.tsx

"use client";

import React, { useState, useEffect } from "react"; // 1. Impor useState dan useEffect
import { FiGithub, FiLinkedin, FiTwitter } from "react-icons/fi";

const footerStyle: React.CSSProperties = {
  background: "#111827",
  color: "#9ca3af",
  padding: "4rem 2.5rem 2rem 2.5rem",
};

const linkStyle: React.CSSProperties = {
  color: "#d1d5db",
  textDecoration: "none",
  transition: "color 0.2s ease",
};

const linkHoverColor = "#fbbf24";

// Komponen link terpisah untuk mengelola state-nya sendiri
const NavLink = ({ href, children }: { href: string, children: React.ReactNode }) => {
  const [isHovered, setIsHovered] = useState(false);
  const finalLinkStyle = { ...linkStyle, color: isHovered ? linkHoverColor : linkStyle.color };
  return <a href={href} style={finalLinkStyle} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>{children}</a>;
};

const SocialLink = ({ href, children, label }: { href: string, children: React.ReactNode, label: string }) => {
    const [isHovered, setIsHovered] = useState(false);
    const finalSocialStyle = { ...linkStyle, color: isHovered ? linkHoverColor : linkStyle.color };
    return <a href={href} target="_blank" rel="noopener noreferrer" style={finalSocialStyle} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} aria-label={label}>{children}</a>;
}

export default function Footer() {
  // 2. Gunakan useState dan useEffect untuk mendapatkan tahun
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    // useEffect hanya berjalan di client, memastikan tidak ada mismatch
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer style={footerStyle}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "2.5rem",
            marginBottom: "3rem",
          }}
        >
          {/* Kolom 1: Tentang Aplikasi */}
          <div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#ffffff", marginBottom: "1rem" }}>
              Dryness Banana Detector
            </h3>
            <p style={{ lineHeight: 1.7, fontSize: '0.9rem' }}>
              Sebuah proyek untuk menganalisis kualitas pisang menggunakan teknologi AI, memberikan hasil yang cepat dan akurat.
            </p>
          </div>

          {/* Kolom 2: Link Navigasi */}
          <div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#ffffff", marginBottom: "1rem" }}>
              Navigasi
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <li><NavLink href="#home">Home</NavLink></li>
              <li><NavLink href="#history">Riwayat</NavLink></li>
              <li><NavLink href="#about">Tentang</NavLink></li>
            </ul>
          </div>

          {/* Kolom 3: Media Sosial */}
          <div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#ffffff", marginBottom: "1rem" }}>
              Tetap Terhubung
            </h3>
            <div style={{ display: "flex", gap: "1.5rem" }}>
                <SocialLink href="https://github.com" label="GitHub"><FiGithub size={24} /></SocialLink>
                <SocialLink href="https://linkedin.com" label="LinkedIn"><FiLinkedin size={24} /></SocialLink>
                <SocialLink href="https://twitter.com" label="Twitter"><FiTwitter size={24} /></SocialLink>
            </div>
          </div>
        </div>

        {/* Garis Pemisah & Copyright */}
        <div style={{ borderTop: "1px solid #374151", paddingTop: "2rem", textAlign: "center", fontSize: '0.9rem' }}>
          <p>
            {/* 3. Gunakan state 'year' di sini */}
            &copy; {year} Dryness Banana Detector. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}