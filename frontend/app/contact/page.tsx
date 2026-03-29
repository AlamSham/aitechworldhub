import { Metadata } from 'next';
import ContactForm from '../../src/components/public/ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the AITechWorldHub team.',
  alternates: {
    canonical: '/contact',
  },
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-2xl py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm">
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">Contact Us</h1>
        <p className="text-slate-500 mb-8">We would love to hear from you. Please fill out the form below.</p>
        
        <ContactForm />

        <div className="mt-10 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">
          <p>Or email us directly at: <a href="mailto:g03551158@gmail.com" className="font-semibold text-slate-900 hover:underline">g03551158@gmail.com</a></p>
        </div>
      </div>
    </main>
  );
}
