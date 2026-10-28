import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="wrap" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 16 }}>
      <p className="tag">Error 404</p>
      <h1>This page is not here.</h1>
      <p className="lead">The link may be broken, or the post may have moved.</p>
      <div className="btns" style={{ justifyContent: 'center' }}>
        <Link className="btn solid" href="/">Go to home</Link>
      </div>
    </div>
  );
}
