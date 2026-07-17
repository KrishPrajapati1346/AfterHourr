import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen grid-paper flex items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
      <div className="bg-[var(--surface)] border p-10 md:p-16 text-center shadow-[10px_10px_0_var(--border-strong)]" style={{ borderColor: 'var(--border-strong)' }}>
        <p className="eyebrow text-[var(--accent)]">Route not found</p>
        <h1 className="heading-xl text-[88px] md:text-[120px] mt-4" style={{ color: 'var(--ink)' }}>404</h1>
        <p className="text-[15px] mt-2" style={{ color: 'var(--ink-muted)' }}>This handoff is outside the network.</p>
        <Link to="/" className="btn btn-accent mt-8 inline-flex">Return to dispatch</Link>
      </div>
    </div>
  );
}
