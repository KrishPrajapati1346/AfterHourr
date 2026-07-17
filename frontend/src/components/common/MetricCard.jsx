import { HiArrowUp } from 'react-icons/hi';

export default function MetricCard({ label, value, trend, icon }) {
  return (
    <div className="card-minimal p-6 flex flex-col justify-between h-[140px] group hover:border-[var(--ink)] transition-colors">
      <div className="flex justify-between items-start">
        <p className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-muted)] group-hover:text-[var(--ink)] transition-colors">{label}</p>
        <div className="text-[var(--ink-muted)] group-hover:text-[var(--ink)] transition-colors">
          {icon}
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <span className="font-semibold text-4xl tracking-tighter text-[var(--ink)]">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {trend && (
          <div className="flex items-center gap-1 text-[11px] font-medium text-[var(--ink-muted)] mb-1">
            <HiArrowUp className="w-3 h-3" />
            <span>{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
}
