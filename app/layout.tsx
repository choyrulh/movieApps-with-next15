import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/components/ui/navbar";
import ReactQueryProvider from "@/lib/ReactQueryProvider";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { SupportModal } from "@/components/SupportModal";

// import PageTransition from "@/components/PageTransition";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "SlashVerse",
    template: "%s | SlashVerse",
  },
  description: "Movie app by Slash",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-green-100 tracking-tight`}
      >
        <ReactQueryProvider>
          <AuthProvider>
            <Navbar />
            {/*<PageTransition>*/}
            {children}
            <Toaster />
            <SupportModal />

            {/*</PageTransition>*/}
            <Footer />
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
