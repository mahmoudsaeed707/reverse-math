import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reverse Math — How fast can you flip your attention?",
  description: "A fast reflex math game: an arrow tells you to read a number backwards before you solve the equation.",
  other: {
    monetag: "a1af52c5120ae9cf8a478b76e61bd949",
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
      <body className="min-h-full flex flex-col">
        {children}
        <Script
          id="monetag-vignette"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html:
              "(function(s){s.dataset.zone='11389991',s.src='https://n6wxm.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))",
          }}
        />
      </body>
    </html>
  );
}
