import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "Voyager — Plan Your Next Adventure",
  description:
    "AI-powered travel planning with personalized recommendations, collaborative itineraries, and social reviews.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/20`}
      >
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
        <Toaster richColors theme="dark" />
      </body>
    </html>
  );
}
