import type { Metadata } from 'next';
import { Outfit, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const fontSans = Outfit({
  variable: '--font-sans',
  subsets: ['latin'],
});

const fontMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'VoyagerPulse - Advanced LinkedIn Content Analytics Platform',
  description: 'Track and analyze your LinkedIn posts, engagement rates, impressions, and reaction breakdowns securely using advanced analytics and key insights.',
  keywords: 'LinkedIn analytics, creator metrics, SaaS, content optimization, post tracking',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${fontSans.variable} ${fontMono.variable} font-sans min-h-screen bg-black antialiased flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
