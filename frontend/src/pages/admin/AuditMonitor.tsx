import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { History, Search, Filter, ExternalLink, Loader2 } from 'lucide-react';
import { formatDate, formatAddress } from '../../utils/format';

export const AuditMonitor: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventFilter, setEventFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/api/audit')
      .then((res) => setLogs(res.data.data?.logs || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter((l) => {
    const matchesEvent = eventFilter === 'all' || l.event_type === eventFilter;
    const matchesSearch =
      (l.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.actor_wallet || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.event_type || '').toLowerCase().includes(search.toLowerCase());
    return matchesEvent && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Security & Audit Monitor</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Comprehensive tamper-evident activity log across off-chain services and smart contract events
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail by description or actor address..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-teal-500"
          />
        </div>
        <select
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-teal-500 font-medium text-slate-700"
        >
          <option value="all">All Event Types</option>
          <option value="RECORD_CREATED">Record Created</option>
          <option value="RECORD_ACCESSED">Record Accessed</option>
          <option value="ACCESS_REQUESTED">Access Requested</option>
          <option value="ACCESS_APPROVED">Access Approved</option>
          <option value="ACCESS_REJECTED">Access Rejected</option>
          <option value="ACCESS_REVOKED">Access Revoked</option>
          <option value="DOCUMENT_VERIFIED">Document Verified</option>
        </select>
      </div>

      <Card>
        {loading ? (
          <div className="py-12 flex justify-center items-center text-xs text-slate-400 gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
            Loading system audit logs...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No audit events found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Event Type</th>
                  <th className="pb-3">Actor</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3 font-mono">Blockchain Tx Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 text-slate-500">{formatDate(log.created_at)}</td>
                    <td className="py-3">
                      <StatusBadge status={log.event_type} />
                    </td>
                    <td className="py-3 font-medium text-slate-700">
                      {log.actor_wallet ? formatAddress(log.actor_wallet) : 'Admin / System'}
                      {log.actor_role && (
                        <span className="ml-1.5 px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded uppercase font-mono">
                          {log.actor_role}
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-slate-600">{log.description || 'Activity recorded'}</td>
                    <td className="py-3 font-mono text-slate-400 text-[11px]">
                      {log.blockchain_tx_hash ? (
                        <span className="text-teal-700 flex items-center gap-1 font-semibold">
                          {formatAddress(log.blockchain_tx_hash)}
                          <ExternalLink className="w-3 h-3 text-teal-600" />
                        </span>
                      ) : (
                        <span className="text-slate-300">Off-chain DB</span>
                      )}
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

