import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LayoutWrapper, Header } from "@/components";
import { AuthProvider } from "@/context/AuthContext";
import { UIProvider } from "@/context/UIContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OpenFare - Bus Booking System",
  description: "Modern bus booking platform built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <UIProvider>
            <LayoutWrapper>
              <Header />
              <main className="pt-16">
                {children}
              </main>
            </LayoutWrapper>
          </UIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}