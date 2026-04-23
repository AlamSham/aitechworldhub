type FaqItem = {
  question: string;
  answer: string;
};

type Props = {
  title?: string;
  intro?: string;
  items: FaqItem[];
  includeSchema?: boolean;
};

export default function SeoFaqSection({
  title = 'Frequently Asked Questions',
  intro,
  items,
  includeSchema = false,
}: Props) {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5 sm:rounded-3xl sm:p-8">
      {includeSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      ) : null}

      <div className="max-w-3xl">
        <h2 className="font-display text-2xl font-bold text-slate-900">{title}</h2>
        {intro ? <p className="mt-2 text-sm text-slate-500">{intro}</p> : null}
      </div>

      <div className="mt-6 grid gap-3">
        {items.map((item) => (
          <details
            key={item.question}
            className="group rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 transition open:bg-white"
          >
            <summary className="cursor-pointer list-none pr-8 text-sm font-semibold text-slate-900 marker:hidden">
              {item.question}
            </summary>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
