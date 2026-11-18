import { Link } from 'react-router-dom';

export default function NotFound({ what = 'page' }) {
  return (
    <section className="page">
      <div className="wrap narrow">
        <h1 className="page-title">That {what} doesn’t exist</h1>
        <p className="page-lead">The link may be old, or the {what} may have been renamed.</p>
        <Link className="btn btn-ink" to="/">
          Go to the home page
        </Link>
      </div>
    </section>
  );
}
