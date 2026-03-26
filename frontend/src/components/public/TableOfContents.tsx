'use client';

import { useEffect, useState } from 'react';

type Heading = {
  id: string;
  text: string;
  level: number;
};

export default function TableOfContents({ markdown }: { markdown: string }) {
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.article-markdown h2, .article-markdown h3'));
    const extracted: Heading[] = nodes
      .filter((node) => node.id)
      .map((node) => ({
        id: node.id,
        text: node.textContent?.trim() || '',
        level: node.tagName.toLowerCase() === 'h2' ? 2 : 3
      }));
    setHeadings(extracted);
  }, [markdown]);

  if (headings.length < 3) return null;

  return (
    <nav className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Table of Contents</h4>
      <ul className="space-y-1.5">
        {headings.map((h, i) => (
          <li key={i} style={{ paddingLeft: `${(h.level - 2) * 12}px` }}>
            <a href={`#${h.id}`} className="block text-sm text-slate-600 transition hover:text-indigo-600">
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
