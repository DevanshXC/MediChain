import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-3">
        {icon || <Inbox className="w-6 h-6" />}
      </div>
      <h4 className="text-sm font-semibold text-slate-800 mb-1">{title}</h4>
      {description && <p className="text-xs text-slate-500 max-w-sm mb-4">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
};

