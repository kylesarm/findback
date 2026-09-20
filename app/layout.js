import "./globals.css";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "FindMatch | Weighted Similarity Matching & Claim Verification", template: "%s | FindMatch" },
  description: "A web-based lost-and-found management system using Weighted Similarity Matching and Claim Verification.",
  openGraph: {
    title: "FindMatch | Weighted Similarity Matching & Claim Verification",
    description: "A safer campus hub using Weighted Similarity Matching and Claim Verification.",
    images: [{ url: "/og.png", width: 1671, height: 941, alt: "FindMatch — Weighted Similarity Matching and Claim Verification" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FindMatch | Weighted Similarity Matching & Claim Verification",
    description: "A safer campus hub using Weighted Similarity Matching and Claim Verification.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
