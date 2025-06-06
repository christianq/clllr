import type { Metadata } from "next";
import { Geist, Geist_Mono, VT323 } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./components/ConvexClientProvider";
import { DM_Sans } from "next/font/google";
import MediaQueryDebug from "./components/MediaQueryDebug";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-dm-sans" });

const vt323 = VT323({ variable: "--font-vt323", subsets: ["latin"], weight: ["400"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="p:domain_verify" content="6c4dc38174aed8ad92356615993618c2" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dmSans.className} ${vt323.variable} font-dm-sans antialiased`}
      >
        <ConvexClientProvider>
        {children}
        <MediaQueryDebug />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
