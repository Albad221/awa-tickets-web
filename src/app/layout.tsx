import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AWA Tickets",
  description: "Catalogue public, parcours d'achat test et portail organisateur pour AWA Tickets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
