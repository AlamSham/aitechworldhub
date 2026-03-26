import type { Metadata } from 'next';
import './globals.css';
import Header from '../src/components/public/Header';
import Footer from '../src/components/public/Footer';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  title: {
    default: 'AITechWorldHub — China vs USA AI & Tech War Intelligence',
    template: '%s | AITechWorldHub',
  },
  description:
    'Daily intelligence on the China vs USA tech war, AI tools, and practical productivity guides. Stay ahead with expert analysis on the global AI race.',
  keywords: [
    'China vs USA AI',
    'tech war',
    'AI tools',
    'artificial intelligence',
    'DeepSeek',
    'ChatGPT',
    'productivity',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'AITechWorldHub',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google AdSense — Uncomment and add your real publisher ID after AdSense approval
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXX"
          crossOrigin="anonymous"
        />
        */}
      </head>
      <body suppressHydrationWarning>
        <Header />
        <div className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
