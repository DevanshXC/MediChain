import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { History, Shield, ExternalLink, Loader2 } from 'lucide-react';
import { formatDate, formatAddress } from '../../utils/format';

export const AuditHistory: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const patientId = (user as any)?.patient_id || user?.id;

  useEffect(() => {
    if (patientId) {
      setLoading(true);
      api.get(`/api/audit/patient/${patientId}`)
        .then((res) => setLogs(res.data.data || []))
        .catch((err) => console.error('Failed to load audit trail', err))
        .finally(() => setLoading(false));
    }
  }, [patientId]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Patient Audit Trail</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Tamper-evident record of all document creations, access requests, consent grants, and verifications
        </p>
      </div>

      <Card>
        {loading ? (
          <div className="py-12 flex justify-center items-center text-xs text-slate-400 gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
            Loading audit events...
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No audit events recorded for your profile yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Action Event</th>
                  <th className="pb-3">Actor</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3 font-mono">Blockchain Tx</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 text-slate-500">{formatDate(log.created_at)}</td>
                    <td className="py-3">
                      <StatusBadge status={log.event_type} />
                    </td>
                    <td className="py-3 font-medium text-slate-700">
                      {log.actor_wallet ? formatAddress(log.actor_wallet) : 'System / Admin'}
                      {log.actor_role && (
                        <span className="ml-1.5 px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded uppercase">
                          {log.actor_role}
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-slate-600">{log.description || 'Activity logged'}</td>
                    <td className="py-3 font-mono text-slate-400 text-[11px]">
                      {log.blockchain_tx_hash ? (
                        <span className="text-teal-700 flex items-center gap-1">
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

