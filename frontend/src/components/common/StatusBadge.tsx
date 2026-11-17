import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant, className = '' }) => {
  const getVariant = () => {
    if (variant) return variant;
    const s = (status || '').toLowerCase();
    if (['approved', 'verified', 'active', 'completed', 'true', '1'].includes(s)) return 'success';
    if (['pending', 'in_progress', 'requested'].includes(s)) return 'warning';
    if (['rejected', 'revoked', 'tampered', 'suspended', 'error', 'failed', 'false'].includes(s)) return 'error';
    if (['info', 'diagnosis', 'prescription'].includes(s)) return 'info';
    return 'default';
  };

  const v = getVariant();

  const styles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    error: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    default: 'bg-slate-100 text-slate-700 border-slate-200',
  }[v];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {status ? status.toUpperCase().replace('_', ' ') : 'UNKNOWN'}
    </span>
  );
};

