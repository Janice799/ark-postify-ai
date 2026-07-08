import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Postify AI - Global SNS Creator",
  description: "Create viral English posts for X, LinkedIn, and Instagram instantly with AI.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Dancing+Script:wght@400..700&family=Gaegu:wght@300;400;700&family=Gamja+Flower&family=Gowun+Dodum&family=Hi+Melody&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Nanum+Myeongjo:wght@400;700;800&family=Noto+Sans+KR:wght@100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Poor+Story&family=Roboto+Mono:ital,wght@0,100..700;1,100..700&family=Single+Day&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
