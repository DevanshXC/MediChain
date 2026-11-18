import React from 'react';
import { useWallet } from '../../hooks/useWallet';
import { CHAIN_ID, CHAIN_NAME } from '../../config/constants';
import { Globe, AlertTriangle } from 'lucide-react';

export const NetworkIndicator: React.FC = () => {
  const { chainId, isConnected } = useWallet();

  if (!isConnected) return null;

  const isLocal = chainId === CHAIN_ID;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
        isLocal
          ? 'bg-blue-50 text-blue-800 border-blue-200'
          : 'bg-amber-50 text-amber-800 border-amber-200'
      }`}
    >
      {isLocal ? (
        <>
          <Globe className="w-3.5 h-3.5 text-blue-600" />
          <span>{CHAIN_NAME} ({CHAIN_ID})</span>
        </>
      ) : (
        <>
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>Chain {chainId || 'Unknown'} (Requires {CHAIN_ID})</span>
        </>
      )}
    </div>
  );
};

