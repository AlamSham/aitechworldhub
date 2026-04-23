import { Metadata } from 'next';
import ContactForm from '../../src/components/public/ContactForm';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aitechworldhub.com';
const CONTACT_EMAIL = 'g03551158@gmail.com';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the AITechWorldHub team.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Us | AITechWorldHub',
    description: 'Get in touch with the AITechWorldHub team.',
    url: `${SITE_URL}/contact`,
  },
  twitter: {
    card: 'summary',
    title: 'Contact Us | AITechWorldHub',
    description: 'Get in touch with the AITechWorldHub team.',
  },
};

export default function ContactPage() {
  const contactPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact AITechWorldHub',
    url: `${SITE_URL}/contact`,
    description: 'Contact the AITechWorldHub editorial team.',
    mainEntity: {
      '@type': 'Organization',
      name: 'AITechWorldHub',
      email: CONTACT_EMAIL,
      url: SITE_URL,
    },
  };

  return (
    <main className="mx-auto max-w-2xl py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }}
      />
      <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm">
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">Contact Us</h1>
        <p className="text-slate-500 mb-8">We would love to hear from you. Please fill out the form below.</p>
        
        <ContactForm />

        <div className="mt-10 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">
          <p>Or email us directly at: <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-slate-900 hover:underline">{CONTACT_EMAIL}</a></p>
        </div>
      </div>
    </main>
  );
}
