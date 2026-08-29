import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/shared/AuthProvider";
import { ToastProvider } from "@/components/shared/Toast";
import Navbar from "@/components/shared/Navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sabz Chaon",
  description:
    "Turning trees planted into trees that survive. NGOs run plantation campaigns, volunteers become tree guardians, and AI monitors tree health.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
