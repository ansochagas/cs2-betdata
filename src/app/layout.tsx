import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { SessionProvider } from "@/components/SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "CS2 BETDATA | Inteligencia para apostas em CS2",
  description:
    "Algoritmos avancados e estatisticas em tempo real para apostar com confianca no cenario competitivo de CS2.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
