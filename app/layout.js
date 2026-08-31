import "./globals.css";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "FindBack | Campus Lost & Found", template: "%s | FindBack" },
  description: "A simple, secure way to report, match, and recover lost belongings.",
  openGraph: {
    title: "FindBack | Report. Match. Reunite.",
    description: "A safer campus hub for reporting, matching, and recovering lost belongings.",
    images: [{ url: "/og.png", width: 1536, height: 944, alt: "FindBack — Report. Match. Reunite." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FindBack | Report. Match. Reunite.",
    description: "A safer campus hub for reporting, matching, and recovering lost belongings.",
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
