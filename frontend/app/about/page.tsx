import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn more about AITechWorldHub and our mission to decode the global AI race.',
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm">
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-6">About Us</h1>
        <article className="prose prose-slate max-w-none text-slate-600">
          <p className="mb-4">
            Welcome to <strong>AITechWorldHub</strong>. We are a dedicated platform focused on analyzing, curating, and reporting on the evolving technological landscape, with a primary focus on the AI and technology race between the United States and China.
          </p>
          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Our Mission</h2>
          <p className="mb-4">
            Our mission is to cut through the noise and provide professionals, students, researchers, and founders with actionable intelligence on artificial intelligence tools, policies, and market dynamics. We aim to help our readers:
          </p>
          <ul className="list-disc pl-5 mb-6 space-y-2">
            <li>Discover the latest AI tools from both US and Chinese ecosystems.</li>
            <li>Understand the geopolitical impact of technology export controls and policies.</li>
            <li>Leverage AI for everyday productivity, job searching, and business growth.</li>
          </ul>
          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Our Approach</h2>
          <p className="mb-4">
            We utilize an AI-augmented editorial pipeline that aggregates technical news from the most reliable sources in the industry. Our editorial system synthesizes complex developments into accessible, highly focused articles that prioritize practical takeaways over hype.
          </p>
          <p>
            Whether you are comparing the latest foundational models or trying to understand hardware supply chains, AITechWorldHub is your daily briefing for the global tech war.
          </p>
        </article>
      </div>
    </main>
  );
}
