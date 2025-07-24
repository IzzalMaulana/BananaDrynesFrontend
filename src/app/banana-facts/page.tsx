import React from "react";

const articles = [
  {
    title: "Manfaat Pisang untuk Kesehatan",
    content: "Pisang kaya akan vitamin dan mineral yang baik untuk tubuh, seperti kalium, vitamin B6, dan vitamin C."
  },
  {
    title: "Fakta Unik Tentang Pisang",
    content: "Tahukah kamu bahwa pisang sebenarnya adalah berry? Dan pohon pisang bukanlah pohon, melainkan tanaman herba terbesar di dunia!"
  }
  // Tambahkan artikel lain di sini
];

export default function BananaFactsPage() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem" }}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "2rem" }}>Banana Facts</h1>
      {articles.map((article, idx) => (
        <div key={idx} style={{ marginBottom: "2rem", padding: "1.5rem", background: "#f9fafb", borderRadius: "12px" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 600 }}>{article.title}</h2>
          <p style={{ marginTop: "0.75rem", color: "#374151" }}>{article.content}</p>
        </div>
      ))}
    </div>
  );
} 