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
    const lines = markdown.split('\n');
    const extracted: Heading[] = [];
    for (const line of lines) {
      const match = line.match(/^(#{2,3})\s+(.+)/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-');
        extracted.push({ id, text, level });
      }
    }
    setHeadings(extracted);
  }, [markdown]);

  if (headings.length < 3) return null;

  return (
    <nav className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Table of Contents</h4>
      <ul className="space-y-1.5">
        {headings.map((h, i) => (
          <li key={i} style={{ paddingLeft: `${(h.level - 2) * 12}px` }}>
            <span className="block text-sm text-slate-600 transition hover:text-indigo-600 cursor-default">
              {h.text}
            </span>
          </li>
        ))}
      </ul>
    </nav>
  );
}
