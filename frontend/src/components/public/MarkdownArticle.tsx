import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

type Props = {
  content: string;
};

export default function MarkdownArticle({ content }: Props) {
  return (
    <article className="article-markdown rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: 'wrap' }]
        ]}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
