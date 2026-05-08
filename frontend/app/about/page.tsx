import { Metadata } from 'next';
import SeoFaqSection from '../../src/components/public/SeoFaqSection';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aitechworldhub.com';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn more about AITechWorldHub and our mission to decode the global AI race.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Us | AITechWorldHub',
    description: 'Learn more about AITechWorldHub and our mission to decode the global AI race.',
    url: `${SITE_URL}/about`,
  },
  twitter: {
    card: 'summary',
    title: 'About Us | AITechWorldHub',
    description: 'Learn more about AITechWorldHub and our mission to decode the global AI race.',
  },
};

export default function AboutPage() {
  const aboutPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About AITechWorldHub',
    url: `${SITE_URL}/about`,
    description: 'Learn more about AITechWorldHub and our mission to decode the global AI race.',
    isPartOf: {
      '@type': 'WebSite',
      name: 'AITechWorldHub',
      url: SITE_URL,
    },
  };

  return (
    <main className="mx-auto max-w-3xl py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema) }}
      />
      <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm">
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-6">About Us</h1>
        <article className="prose prose-slate max-w-none text-slate-600">
          <p className="mb-4 text-lg leading-relaxed">
            Welcome to <strong>AITechWorldHub</strong>. We are a dedicated platform focused on analyzing, curating, and reporting on the evolving technological landscape, with a primary focus on the AI and technology race between the United States and China.
          </p>
          
          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Our Mission</h2>
          <p className="mb-4">
            Our mission is to cut through the noise and provide professionals, students, researchers, and founders with actionable intelligence on artificial intelligence tools, policies, and market dynamics. We aim to help our readers:
          </p>
          <ul className="list-disc pl-5 mb-6 space-y-2">
            <li>Discover the latest AI tools from both US and Chinese ecosystems.</li>
            <li>Understand the geopolitical impact of technology export controls and policies.</li>
            <li>Leverage AI for everyday productivity, job searching, and business growth.</li>
            <li>Stay informed about breakthrough AI research and model releases.</li>
            <li>Navigate the complex landscape of AI regulations and compliance.</li>
          </ul>
          
          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Our Approach</h2>
          <p className="mb-4">
            We utilize an AI-augmented editorial pipeline that aggregates technical news from the most reliable sources in the industry. Our editorial system synthesizes complex developments into accessible, highly focused articles that prioritize practical takeaways over hype.
          </p>
          <p className="mb-4">
            Whether you are comparing the latest foundational models or trying to understand hardware supply chains, AITechWorldHub is your daily briefing for the global tech war.
          </p>
          
          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">What We Cover</h2>
          <div className="grid gap-4 sm:grid-cols-2 mb-6">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="font-bold text-slate-900 mb-2">🤖 AI Tools & Products</h3>
              <p className="text-sm">In-depth reviews and comparisons of ChatGPT, Claude, Gemini, and emerging AI tools from global markets.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="font-bold text-slate-900 mb-2">🏭 AI Infrastructure</h3>
              <p className="text-sm">Coverage of GPU supply chains, data centers, chip manufacturing, and compute infrastructure.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="font-bold text-slate-900 mb-2">📜 Policy & Regulation</h3>
              <p className="text-sm">Analysis of AI regulations, export controls, and policy developments affecting the tech industry.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="font-bold text-slate-900 mb-2">🌍 Global AI Race</h3>
              <p className="text-sm">Strategic insights into US-China AI competition, including DeepSeek, Qwen, and other developments.</p>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Our Editorial Standards</h2>
          <p className="mb-4">
            Every article published on AITechWorldHub adheres to strict editorial standards:
          </p>
          <ul className="list-disc pl-5 mb-6 space-y-2">
            <li><strong>Source Transparency:</strong> We cite primary sources and provide references for verification.</li>
            <li><strong>Factual Accuracy:</strong> All claims are fact-checked against multiple reliable sources.</li>
            <li><strong>Practical Value:</strong> We focus on actionable insights rather than speculation.</li>
            <li><strong>Timeliness:</strong> Breaking developments are covered within hours of announcement.</li>
            <li><strong>Objectivity:</strong> We maintain editorial independence and avoid promotional content.</li>
          </ul>
          
          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Who We Serve</h2>
          <p className="mb-4">
            AITechWorldHub is designed for:
          </p>
          <ul className="list-disc pl-5 mb-6 space-y-2">
            <li><strong>Tech Professionals:</strong> Engineers, developers, and product managers tracking AI tools and infrastructure.</li>
            <li><strong>Business Leaders:</strong> Executives and founders evaluating AI adoption strategies.</li>
            <li><strong>Researchers & Students:</strong> Academics following AI research breakthroughs and model releases.</li>
            <li><strong>Policy Analysts:</strong> Professionals monitoring AI regulations and geopolitical developments.</li>
            <li><strong>Investors:</strong> VCs and analysts tracking AI market trends and company developments.</li>
          </ul>
          
          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Contact Us</h2>
          <p className="mb-4">
            Have questions, feedback, or story tips? We'd love to hear from you. Visit our <a href="/contact" className="text-indigo-600 hover:text-indigo-700 font-semibold">contact page</a> to get in touch with our editorial team.
          </p>
          <p>
            For partnership inquiries or advertising opportunities, please reach out through our contact form with details about your proposal.
          </p>
        </article>
      </div>

      <div className="mt-8">
        <SeoFaqSection
          title="About Our Editorial Process"
          intro="This section helps readers quickly understand how the site works and adds extra semantic clarity for search engines."
          items={[
            {
              question: 'What makes AITechWorldHub different from generic AI news aggregators?',
              answer:
                'The site is designed around practical AI outcomes for professionals, not just headline repetition. We aim to filter developments into usable context, especially around tools, infrastructure, and policy impact.',
            },
            {
              question: 'Does AITechWorldHub cover only one country?',
              answer:
                'No. The site primarily serves US and UK readers, while also tracking global developments when they affect AI tools, enterprise adoption, chip supply, or policy competition.',
            },
            {
              question: 'Why is source transparency important on this site?',
              answer:
                'Source transparency makes articles more trustworthy for readers and helps reinforce topical credibility. That is why published article pages now surface references more clearly.',
            },
          ]}
        />
      </div>
    </main>
  );
}
