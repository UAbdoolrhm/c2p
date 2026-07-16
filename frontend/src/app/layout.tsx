import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "C2PSpeak - Grading Public Speaking",
  description: "Evaluate public speaking presentations in real time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-brand-blue text-white min-h-screen">
        <nav className="w-full bg-brand-hover text-white p-4 shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <img src="/logo.png" alt="C2P Tech Hub Logo" className="h-8 bg-white rounded p-1" />
              <h1 className="text-xl font-bold tracking-tight">C2PSpeak</h1>
            </div>
            <div className="space-x-4">
              <a href="/dashboard" className="hover:text-blue-200 transition-colors font-medium">Dashboard</a>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
