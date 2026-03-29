import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for AITechWorldHub.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "March 25, 2026";

  return (
    <main className="mx-auto max-w-3xl py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm">
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-400 mb-8">Last Updated: {lastUpdated}</p>
        
        <article className="prose prose-slate max-w-none text-slate-600 space-y-6">
          <p>
            At AITechWorldHub, accessible from our website, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by AITechWorldHub and how we use it.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-6 mb-3">1. Information We Collect</h2>
          <p>
            The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.
          </p>
          <p>
            If you contact us directly, we may receive additional information about you such as your name, email address, phone number, the contents of the message and/or attachments you may send us, and any other information you may choose to provide.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-6 mb-3">2. How We Use Your Information</h2>
          <p>We use the information we collect in various ways, including to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Provide, operate, and maintain our website</li>
            <li>Improve, personalize, and expand our website</li>
            <li>Understand and analyze how you use our website</li>
            <li>Develop new products, services, features, and functionality</li>
            <li>Send you emails and newsletters</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 mt-6 mb-3">3. Log Files</h2>
          <p>
            AITechWorldHub follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services' analytics. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-6 mb-3">4. Cookies and Web Beacons</h2>
          <p>
            Like any other website, AITechWorldHub uses "cookies". These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-6 mb-3">5. Advertising Partners Privacy Policies</h2>
          <p>
            Third-party ad servers or ad networks uses technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on AITechWorldHub, which are sent directly to users' browser. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.
          </p>
          <p>
            Note that AITechWorldHub has no access to or control over these cookies that are used by third-party advertisers.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-6 mb-3">6. Consent</h2>
          <p>
            By using our website, you hereby consent to our Privacy Policy and agree to its terms.
          </p>
        </article>
      </div>
    </main>
  );
}
