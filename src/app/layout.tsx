import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Mencari",
    template: "%s · Mencari",
  },
  description:
    "Track your job applications, stay organized, land your first role.",
  keywords: ["job tracker", "job applications", "fresh graduate", "job search"],
  authors: [{ name: "Mencari" }],
  metadataBase: new URL("https://mencari.vercel.app"),
  openGraph: {
    title: "Mencari",
    description:
      "Track your job applications, stay organized, land your first role.",
    siteName: "Mencari",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground flex flex-col">
        {children}
        <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-black/40 dark:text-white/40 whitespace-nowrap">
          ⟡ ── made by{" "}
          <span className="text-black/60 dark:text-white/60">KAIEL</span> ── ⟡
        </p>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
