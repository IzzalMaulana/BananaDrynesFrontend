"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

// Objek style untuk kerapian kode
const navbarStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "1rem 2.5rem",
  background: "rgba(255, 255, 255, 0.85)",
  backdropFilter: "blur(12px)",
  borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
  position: "sticky",
  top: 0,
  zIndex: 10,
  boxShadow: "0 4px 16px 0 rgba(0,0,0,0.07)",
  transition: "all 0.3s cubic-bezier(.4,2,.6,1)",
};

const brandStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  fontWeight: "bold",
  fontSize: "1.5rem",
  color: "#111",
  letterSpacing: "-1px",
};

const navLinksStyle: React.CSSProperties = {
  display: "flex",
  gap: "2rem",
};

const linkStyle: React.CSSProperties = {
  textDecoration: "none",
  color: "#333",
  fontWeight: 500,
  position: "relative",
  padding: "0.25rem 0",
  transition: "color 0.2s cubic-bezier(.4,2,.6,1)",
  fontSize: "1.08rem",
  letterSpacing: "-0.5px",
  cursor: "pointer",
  background: "none",
  border: "none",
};

const activeLinkStyle: React.CSSProperties = {
  ...linkStyle,
  color: "#fbbf24", // kuning pisang
};

// Custom CSS for hover underline
const underlineStyle = `
  .nav-link {
    position: relative;
    overflow: hidden;
  }
  .nav-link::after {
    content: "";
    position: absolute;
    left: 0; right: 0; bottom: 0;
    height: 2px;
    background: linear-gradient(90deg, #fbbf24 60%, #ffe066 100%);
    transform: scaleX(0);
    transition: transform 0.3s cubic-bezier(.4,2,.6,1);
    border-radius: 2px;
  }
  .nav-link:hover::after, .nav-link:focus::after {
    transform: scaleX(1);
  }
  .nav-link[aria-current="true"]::after {
    transform: scaleX(1);
  }
  @media (max-width: 600px) {
    nav.navbar {
      flex-direction: column;
      align-items: flex-start;
      padding: 0.75rem 1rem;
      gap: 0.5rem;
    }
    .nav-links {
      gap: 1.2rem;
      width: 100%;
      margin-top: 0.5rem;
    }
    .brand {
      font-size: 1.15rem;
    }
  }
`;

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const sections = ["home", "history", "about", "banana-facts"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );
    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => {
      sections.forEach((id) => {
        const element = document.getElementById(id);
        if (element) observer.unobserve(element);
      });
    };
  }, []);

  return (
    <>
      <style>{underlineStyle}</style>
      <nav className="navbar" style={navbarStyle}>
        <div className="brand" style={brandStyle}>
          {/* Pastikan Anda memiliki ikon ini di folder /public */}
          <span>Dryness Banana</span>
        </div>
        <div className="nav-links" style={navLinksStyle}>
          <a
            href="#home"
            className="nav-link"
            style={activeSection === 'home' ? activeLinkStyle : linkStyle}
            aria-current={activeSection === 'home' ? 'true' : undefined}
          >
            Home
          </a>
          <a
            href="#history"
            className="nav-link"
            style={activeSection === 'history' ? activeLinkStyle : linkStyle}
            aria-current={activeSection === 'history' ? 'true' : undefined}
          >
            History
          </a>
          <a
            href="#about"
            className="nav-link"
            style={activeSection === 'about' ? activeLinkStyle : linkStyle}
            aria-current={activeSection === 'about' ? 'true' : undefined}
          >
            About
          </a>
          <a
            href="#banana-facts"
            className="nav-link"
            style={activeSection === 'banana-facts' ? activeLinkStyle : linkStyle}
            aria-current={activeSection === 'banana-facts' ? 'true' : undefined}
          >
            BananaFacts
          </a>
        </div>
      </nav>
    </>
  );
}