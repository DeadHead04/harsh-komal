import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(process.env.RENDER_EXTERNAL_URL || "https://harsh-komal.onrender.com"),
  title: "Komal & Harsh — Wedding Invitation · 25 & 26 November 2026",
  description:
    "With love, the Dewani and Gurnani families invite you to celebrate Komal & Harsh, 25–26 November 2026 at Golden Blossom Imperial Resort, Lucknow. #kompletelyharsh",
  openGraph: {
    title: "Komal & Harsh · #kompletelyharsh",
    description:
      "25 & 26 November 2026 · Golden Blossom Imperial Resort, Lucknow",
    images: [{ url: "/assets/share-v9.webp", width: 1200, height: 630, type: "image/webp", alt: "Komal and Harsh — wedding invitation, 25 & 26 November 2026, Lucknow" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Komal & Harsh · Wedding Invitation",
    description: "25 & 26 November 2026 · Lucknow · #kompletelyharsh",
    images: [{ url: "/assets/share-v9.webp", alt: "Komal and Harsh — wedding invitation" }],
  },
  icons: { icon: "/favicon.svg" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
