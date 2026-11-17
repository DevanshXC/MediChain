import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { WalletConnect } from '../common/WalletConnect';
import { NetworkIndicator } from '../common/NetworkIndicator';
import { NotificationCenter } from './NotificationCenter';
import { StatusBadge } from '../common/StatusBadge';

export const TopBar: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between z-10 shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
          {user?.role ? `${user.role} Portal` : 'Portal'}
        </span>
        {user?.status && (
          <StatusBadge status={user.status} />
        )}
      </div>

      <div className="flex items-center gap-4">
        <NetworkIndicator />
        <div className="h-5 w-px bg-slate-200"></div>
        <NotificationCenter />
        <div className="h-5 w-px bg-slate-200"></div>
        <WalletConnect />
      </div>
    </header>
  );
};

