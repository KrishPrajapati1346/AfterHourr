const statusConfig = {
  pending: { label: 'Awaiting Driver', color: 'bg-amber-100 text-amber-800' },
  matched: { label: 'Driver Assigned', color: 'bg-blue-100 text-blue-800' },
  picked_up: { label: 'In Transit', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  expired: { label: 'Expired', color: 'bg-gray-100 text-gray-800' }
};

export default function StatusBadge({ status }) {
  const c = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${c.color}`}>
      {c.label}
    </span>
  );
}
