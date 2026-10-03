import "./globals.css";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "Findmatch | Your campus, connected", template: "%s | Findmatch" },
  description: "Find what you lost. Return what you found. Your campus lost-and-found hub with possible matches and secure ownership verification.",
  openGraph: {
    title: "Findmatch | Your campus, connected",
    description: "A little less lost. A lot more connected. Find your way back with Findmatch.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Findmatch — Find what you lost. Return what you found." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Findmatch | Your campus, connected",
    description: "Find what you lost. Return what you found. Your campus, connected.",
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
