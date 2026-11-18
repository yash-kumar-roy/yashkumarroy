import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, formatDate } from '../lib/api.js';
import { useSite } from '../lib/SiteContext.jsx';
import Markdown from '../components/Markdown.jsx';
import NotFound from './NotFound.jsx';

export function BlogIndex() {
  const { posts } = useSite();
  return (
    <section className="page">
      <div className="wrap narrow">
        <h1 className="page-title">Writing</h1>
        <p className="page-lead">Notes on what I build and learn.</p>
        {posts.length === 0 ? (
          <p className="empty">No posts published yet.</p>
        ) : (
          <ul className="post-list">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link to={`/blog/${post.slug}`} className="post-row">
                  <time dateTime={post.publishedAt}>{formatDate(post.publishedAt || post.createdAt)}</time>
                  <span className="post-row-title">{post.title}</span>
                  {post.excerpt && <span className="post-row-excerpt">{post.excerpt}</span>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export function BlogPost() {
  const { slug } = useParams();
  const [state, setState] = useState({ loading: true, post: null });

  useEffect(() => {
    const ctrl = new AbortController();
    setState({ loading: true, post: null });
    api(`/api/blogs/${slug}`, { signal: ctrl.signal, auth: true })
      .then((r) => setState({ loading: false, post: r.data }))
      .catch((e) => e.name !== 'AbortError' && setState({ loading: false, post: null }));
    return () => ctrl.abort();
  }, [slug]);

  useEffect(() => {
    if (state.post) document.title = `${state.post.title} | Yash Kumar Roy`;
  }, [state.post]);

  if (state.loading) return <section className="page"><div className="wrap narrow"><p className="muted">Loading post…</p></div></section>;
  if (!state.post) return <NotFound what="post" />;

  const { post } = state;
  return (
    <article className="page">
      <div className="wrap narrow">
        <Link to="/blog" className="back-link">← All writing</Link>
        <header className="post-head">
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt || post.createdAt)}</time>
          <h1 className="page-title">{post.title}</h1>
          {!post.published && <p className="draft-flag">Draft, only visible to you</p>}
          {post.excerpt && <p className="page-lead">{post.excerpt}</p>}
        </header>
        {post.coverImage && <img className="post-cover" src={post.coverImage} alt="" />}
        <Markdown source={post.content} className="prose prose-article" />
        {post.tags?.length > 0 && (
          <ul className="tags post-tags">
            {post.tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
