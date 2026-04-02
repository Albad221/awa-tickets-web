import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AWA Tickets — Portail Organisateur",
  description: "Créez et gérez vos événements, suivez les ventes et recevez vos paiements.",
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
