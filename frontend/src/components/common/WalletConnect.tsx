import React from 'react';
import { useWallet } from '../../hooks/useWallet';
import { formatAddress } from '../../utils/format';
import { Wallet, LogOut, Loader2, AlertCircle } from 'lucide-react';
import { CHAIN_ID, CHAIN_NAME } from '../../config/constants';

export const WalletConnect: React.FC = () => {
  const { address, chainId, isConnected, isConnecting, connectWallet, disconnectWallet, error } = useWallet();

  const isCorrectNetwork = chainId === CHAIN_ID;

  if (isConnecting) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 rounded-lg text-sm font-medium"
      >
        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        Connecting...
      </button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        {!isCorrectNetwork && (
          <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs rounded-lg font-medium">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            Switch to {CHAIN_NAME}
          </span>
        )}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          {formatAddress(address)}
        </div>
        <button
          onClick={disconnectWallet}
          title="Disconnect wallet"
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end">
      <button
        onClick={connectWallet}
        className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium shadow-sm transition"
      >
        <Wallet className="w-4 h-4 text-cyan-400" />
        Connect Wallet
      </button>
      {error && <span className="text-xs text-rose-500 mt-1 max-w-xs text-right truncate">{error}</span>}
    </div>
  );
};

