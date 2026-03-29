import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: 'Disclaimer policy for AITechWorldHub.',
  alternates: {
    canonical: '/disclaimer',
  },
};

export default function DisclaimerPage() {
  return (
    <main className="mx-auto max-w-3xl py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm">
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-6">Disclaimer</h1>
        
        <article className="prose prose-slate max-w-none text-slate-600 space-y-6">
          <p>
            The information contained on the AITechWorldHub website (the "Service") is for general information purposes only.
          </p>
          
          <p>
            AITechWorldHub assumes no responsibility for errors or omissions in the contents on the Service. Our content is partially curated and generated using Artificial Intelligence (AI) algorithms from public technical sources. While we strive to maintain editorial quality, users should independently verify critical technical assertions or policy claims.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-6 mb-3">External Links Disclaimer</h2>
          <p>
            The AITechWorldHub website may contain links to external websites that are not provided or maintained by or in any way affiliated with AITechWorldHub. Please note that AITechWorldHub does not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-6 mb-3">Advertising and Affiliate Disclaimer</h2>
          <p>
            This website uses third-party advertising networks, such as Google AdSense, to serve ads. These companies may use aggregated information (not including your name, address, email address, or telephone number) about your visits to this and other Web sites in order to provide advertisements about goods and services of interest to you.
          </p>
          <p>
            AITechWorldHub may also participate in affiliate marketing and may allow affiliate links to be included on some of our pages. This means that we may earn a commission if/when you click on or make purchases via affiliate links.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-6 mb-3">Technical Advice Disclaimer</h2>
          <p>
            The technology, policy, and AI-related information provided by AITechWorldHub is for educational and informational purposes only. It should not be construed as professional technical, legal, or financial advice. Implementation of any software, scripts, or architectural advice found on this site is done entirely at your own risk.
          </p>
        </article>
      </div>
    </main>
  );
}
