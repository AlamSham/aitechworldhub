import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Terms and Conditions for AITechWorldHub.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsPage() {
  const lastUpdated = "March 25, 2026";

  return (
    <main className="mx-auto max-w-3xl py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm">
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">Terms & Conditions</h1>
        <p className="text-sm text-slate-400 mb-8">Last Updated: {lastUpdated}</p>
        
        <article className="prose prose-slate max-w-none text-slate-600 space-y-6">
          <p>
            Welcome to AITechWorldHub! These terms and conditions outline the rules and regulations for the use of our Website.
          </p>
          <p>
            By accessing this website we assume you accept these terms and conditions. Do not continue to use AITechWorldHub if you do not agree to take all of the terms and conditions stated on this page.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-6 mb-3">1. Cookies</h2>
          <p>
            We employ the use of cookies. By accessing AITechWorldHub, you agreed to use cookies in agreement with the AITechWorldHub's Privacy Policy.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-6 mb-3">2. License</h2>
          <p>
            Unless otherwise stated, AITechWorldHub and/or its licensors own the intellectual property rights for all material on AITechWorldHub. All intellectual property rights are reserved. You may access this from AITechWorldHub for your own personal use subjected to restrictions set in these terms and conditions.
          </p>
          <p>You must not:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Republish material from AITechWorldHub</li>
            <li>Sell, rent or sub-license material from AITechWorldHub</li>
            <li>Reproduce, duplicate or copy material from AITechWorldHub</li>
            <li>Redistribute content from AITechWorldHub</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 mt-6 mb-3">3. User Comments</h2>
          <p>
            Parts of this website offer an opportunity for users to post and exchange opinions and information in certain areas of the website. AITechWorldHub does not filter, edit, publish or review Comments prior to their presence on the website. Comments do not reflect the views and opinions of AITechWorldHub, its agents and/or affiliates.
          </p>
          <p>
            To the extent permitted by applicable laws, AITechWorldHub shall not be liable for the Comments or for any liability, damages or expenses caused and/or suffered as a result of any use of and/or posting of and/or appearance of the Comments on this website.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-6 mb-3">4. Disclaimer of Accuracy</h2>
          <p>
            While we strive to provide accurate and up-to-date information, some content is generated or curated algorithmically. We do not warrant the completeness or accuracy of the information published on this website; nor do we commit to ensuring that the website remains available or that the material on the website is kept up to date.
          </p>
        </article>
      </div>
    </main>
  );
}
