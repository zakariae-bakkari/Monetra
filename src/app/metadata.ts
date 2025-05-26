import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Monetra - Personal Finance Management App",
  description: "Monetra helps you manage your personal finances, track expenses, monitor income, and achieve your financial goals with an easy-to-use dashboard.",
  keywords: ["personal finance", "expense tracker", "budget management", "financial planning", "wallet management"],
  authors: [{ name: "Monetra Team" }],
  creator: "Monetra",
  publisher: "Monetra",
  metadataBase: new URL("https://monetra.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://monetra.app",
    title: "Monetra - Personal Finance Management App",
    description: "Take control of your personal finances with Monetra's intuitive tracking and visualization tools.",
    siteName: "Monetra",
    images: [
      {
        url: "/public/dashboard.png",
        width: 1200,
        height: 630,
        alt: "Monetra Dashboard Screenshot",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Monetra - Personal Finance Management App",
    description: "Take control of your personal finances with Monetra's intuitive tracking and visualization tools.",
    images: ["/public/dashboard.png"],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/public/icon.png",
    apple: "/public/icon.png",
  },
};