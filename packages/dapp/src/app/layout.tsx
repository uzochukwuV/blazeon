import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "SF Mono", "Menlo", "Consolas", "monospace"],
});

export const metadata: Metadata = {
  title: "FluxVault | Programmable Bitcoin Cash Vaults",
  description: "Advanced smart contract vaults for Bitcoin Cash. Multi-sig, time-locks, spending limits, token-gating, and more. Built for BCH Blaze 2025 Hackathon.",
  keywords: ["Bitcoin Cash", "BCH", "Smart Contracts", "Vault", "Multi-sig", "DeFi", "CashScript"],
  authors: [{ name: "FluxVault Team" }],
  openGraph: {
    title: "FluxVault | Programmable Bitcoin Cash Vaults",
    description: "Advanced smart contract vaults for Bitcoin Cash with multi-sig, time-locks, and token-gating.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FluxVault | Programmable Bitcoin Cash Vaults",
    description: "Advanced smart contract vaults for Bitcoin Cash with multi-sig, time-locks, and token-gating.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <div className="noise-overlay" />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
