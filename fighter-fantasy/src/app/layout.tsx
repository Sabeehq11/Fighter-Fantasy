import type { Metadata } from "next";
import Navigation from "@/components/layout/Navigation";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fighter Fantasy - UFC Companion & Fantasy Platform",
  description: "Track UFC events, view fighter profiles, check rankings, and build your fantasy team to compete for glory.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-bg-primary">
        <AuthProvider>
          <Navigation />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
