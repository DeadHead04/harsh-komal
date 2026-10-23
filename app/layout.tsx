import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(process.env.RENDER_EXTERNAL_URL || "http://localhost:10000"),
  title: "Komal & Harsh — Wedding Invitation · 25 & 26 November 2026",
  description:
    "With love, the Dewani and Gurnani families invite you to celebrate Komal & Harsh, 25–26 November 2026 at Golden Blossom Imperial Resort, Lucknow. #kompletelyharsh",
  openGraph: {
    title: "Komal & Harsh · #kompletelyharsh",
    description:
      "25 & 26 November 2026 · Golden Blossom Imperial Resort, Lucknow",
    images: ["/assets/share-v5.jpg"],
    type: "website",
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
