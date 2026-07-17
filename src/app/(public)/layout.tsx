import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
//@ts-ignore
import "../globals.css";
import Header from "./Header";
import Footer from "./Footer";
import { Toaster } from "react-hot-toast";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://acivagas.com.br"),
  title: {
    template: "%s | ACI Vagas",
    default: "ACI Vagas - Banco de Talentos e Portal de Empregos em Panambi",
  },
  description: "Banco de Talentos e Portal de Vagas da ACI Panambi. Encontre as melhores oportunidades de emprego em Panambi e região. Cadastre seu currículo e conecte-se com as maiores empresas locais.",
  keywords: ["vagas em panambi", "empregos panambi", "aci panambi", "trabalho panambi", "vagas rs"],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "ACI Vagas | Portal de Empregos",
    description: "O portal oficial de oportunidades e talentos de Panambi e região.",
    url: "https://acivagas.com.br",
    siteName: "ACI Vagas",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ACI Vagas Panambi",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Header />
      <div className="h-24 md:h-28" />
      {children}
      <Footer />
    </div>
  );
}
