import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Layers, Globe, Shield, ExternalLink, Loader2, CheckCircle } from 'lucide-react';
import { formatDate, formatAddress } from '../../utils/format';
import { CHAIN_ID, CHAIN_NAME, RPC_URL } from '../../config/constants';

export const BlockchainMonitor: React.FC = () => {
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/transactions')
      .then((res) => setTxs(res.data.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Blockchain Ledger Activity</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time transaction log from the local Hardhat consensus network
        </p>
      </div>

      {/* Network Overview Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[10px] text-slate-400 block uppercase font-semibold">Active Blockchain</span>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5 mt-1">
            <Globe className="w-4 h-4 text-blue-600" />
            {CHAIN_NAME} (Chain ID: {CHAIN_ID})
          </h3>
          <p className="text-[11px] text-slate-500 font-mono mt-1">{RPC_URL}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[10px] text-slate-400 block uppercase font-semibold">Consensus Mechanism</span>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5 mt-1">
            <Shield className="w-4 h-4 text-blue-600" />
            Proof of Authority / Local EVM
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Solidity ^0.8.24 (Paris target)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[10px] text-slate-400 block uppercase font-semibold">Smart Contract Modules</span>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5 mt-1">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            4 Modular Contracts Active
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Registry, Records, Access, Audit</p>
        </div>
      </div>

      {/* Transactions Table Card */}
      <Card title="Recent On-Chain Transactions" subtitle="Transactions broadcast to local Hardhat node">
        {loading ? (
          <div className="py-12 flex justify-center items-center text-xs text-slate-400 gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
            Querying blockchain transactions...
          </div>
        ) : txs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No on-chain transactions recorded in this session yet. Upload a record or approve an access request to generate transactions.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Event Type</th>
                  <th className="pb-3">Actor Address</th>
                  <th className="pb-3 font-mono">Transaction Hash</th>
                  <th className="pb-3 font-mono">Reference UUID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {txs.map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 text-slate-500">{formatDate(t.created_at)}</td>
                    <td className="py-3">
                      <StatusBadge status={t.event_type} />
                    </td>
                    <td className="py-3 font-mono font-medium text-slate-700">
                      {formatAddress(t.actor_address || '')}
                    </td>
                    <td className="py-3 font-mono text-teal-700 font-semibold text-[11px]">
                      <span className="flex items-center gap-1">
                        {t.tx_hash ? `${t.tx_hash.slice(0, 16)}...${t.tx_hash.slice(-8)}` : '0x...'}
                        <ExternalLink className="w-3 h-3 text-teal-600" />
                      </span>
                    </td>
                    <td className="py-3 font-mono text-slate-400 text-[11px]">
                      {t.record_uuid || t.request_uuid || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

