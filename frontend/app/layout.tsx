import type { Metadata } from 'next';
import './globals.css';
import Header from '../src/components/public/Header';
import Footer from '../src/components/public/Footer';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aitechworldhub.com';
const CONTACT_EMAIL = 'g03551158@gmail.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'AITechWorldHub — Latest Generative AI for US/UK Professionals',
    template: '%s | AITechWorldHub',
  },
  description:
    'Latest generative AI news, workflows, and practical guides for US/UK professionals. China vs US coverage is included as a focused sub-cluster.',
  keywords: [
    'generative AI',
    'AI workflows',
    'AI productivity',
    'US AI tools',
    'UK AI tools',
    'AI professionals',
    'China vs US AI',
  ],
  authors: [{ name: 'Shamshad' }],
  creator: 'Shamshad',
  publisher: 'AITechWorldHub',
  applicationName: 'AITechWorldHub',
  category: 'Technology',
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    siteName: 'AITechWorldHub',
    url: SITE_URL,
    title: 'AITechWorldHub — Latest Generative AI for US/UK Professionals',
    description:
      'Latest generative AI news, workflows, and practical guides for US/UK professionals.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AITechWorldHub',
    description: 'Latest generative AI insights for US/UK professionals.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AITechWorldHub',
    url: SITE_URL,
    email: CONTACT_EMAIL,
    description:
      'Latest generative AI intelligence for US/UK professionals with practical tools, workflows, and policy explainers.',
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AITechWorldHub',
    url: SITE_URL,
    publisher: {
      '@type': 'Organization',
      name: 'AITechWorldHub',
    },
    inLanguage: 'en',
    description:
      'Latest generative AI news, workflows, and practical guides for US/UK professionals.',
  };

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
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
