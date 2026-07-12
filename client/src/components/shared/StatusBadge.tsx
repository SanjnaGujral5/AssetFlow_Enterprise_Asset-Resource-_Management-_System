import { AssetStatus } from "../../types";

const STATUS_CONFIG: Record<
  AssetStatus,
  { label: string; className: string }
> = {
  AVAILABLE: {
    label: "Available",
    className:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  },
  ALLOCATED: {
    label: "Allocated",
    className: "bg-blue-50 text-blue-700 ring-blue-600/20",
  },
  RESERVED: {
    label: "Reserved",
    className:
      "bg-purple-50 text-purple-700 ring-purple-600/20",
  },
  UNDER_MAINTENANCE: {
    label: "Maintenance",
    className: "bg-amber-50 text-amber-700 ring-amber-600/20",
  },
  LOST: {
    label: "Lost",
    className: "bg-red-50 text-red-700 ring-red-600/20",
  },
  RETIRED: {
    label: "Retired",
    className: "bg-slate-100 text-slate-600 ring-slate-500/20",
  },
  DISPOSED: {
    label: "Disposed",
    className: "bg-slate-100 text-slate-500 ring-slate-400/20",
  },
};

interface StatusBadgeProps {
  status: AssetStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    className: "bg-slate-100 text-slate-600 ring-slate-500/20",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${config.className}`}
    >
      {config.label}
    </span>
  );
}
