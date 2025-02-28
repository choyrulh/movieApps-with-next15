import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/components/ui/navbar";
import ReactQueryProvider from "@/lib/ReactQueryProvider";
import Footer from "@/components/Footer";
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
  title: "SlashMovie ",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-900 text-gray-100 tracking-tight`}
      >
        <Navbar />
        <ReactQueryProvider>
          {/*<PageTransition>*/}
            {children}
          {/*</PageTransition>*/}
        </ReactQueryProvider>
        <Footer />
      </body>
    </html>
  );
}
