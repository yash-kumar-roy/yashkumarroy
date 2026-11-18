import { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

marked.setOptions({ gfm: true, breaks: false });

/** Renders Markdown (blog posts, project write-ups) as sanitised HTML. */
export default function Markdown({ source = '', className = 'prose' }) {
  const html = useMemo(() => DOMPurify.sanitize(marked.parse(source || '')), [source]);
  // eslint-disable-next-line react/no-danger
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
