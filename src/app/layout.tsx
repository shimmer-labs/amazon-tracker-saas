import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Toaster from '@/components/Toaster'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Amazon Tracker - Monitor Competitor Prices & Buy Box",
  description: "Track Amazon competitor prices, Buy Box winners, and sales rank changes automatically. Get email alerts when prices drop. Perfect for Amazon sellers.",
  keywords: "amazon price tracker, competitor tracking, buy box monitor, amazon seller tools, price monitoring",
  openGraph: {
    title: "Amazon Tracker - Monitor Competitor Prices",
    description: "Track competitor prices and Buy Box changes on Amazon automatically",
    url: "https://theamazontracker.com",
    siteName: "Amazon Tracker",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Amazon Tracker - Monitor Competitor Prices",
    description: "Track competitor prices and Buy Box changes on Amazon automatically",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}