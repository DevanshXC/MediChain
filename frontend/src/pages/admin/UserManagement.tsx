import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Users, Search, Filter, Ban, Loader2, CheckCircle } from 'lucide-react';
import { formatDate, formatAddress } from '../../utils/format';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/users');
      setUsers(res.data.data?.users || []);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSuspend = async (userId: number) => {
    if (!confirm('Are you sure you want to suspend this user?')) return;
    try {
      await api.post('/api/admin/suspend-user', { userId });
      fetchUsers();
    } catch (err: any) {
      alert('Action failed: ' + (err?.response?.data?.error || err.message));
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch = (u.wallet_address || '').toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Platform User Management</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Directory of registered Web3 wallets, role assignments, and account statuses
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Ethereum wallet address (0x...)..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-teal-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-teal-500 font-medium text-slate-700"
        >
          <option value="all">All Roles</option>
          <option value="patient">Patients</option>
          <option value="doctor">Doctors</option>
          <option value="hospital">Hospitals</option>
          <option value="admin">Administrators</option>
        </select>
      </div>

      <Card>
        {loading ? (
          <div className="py-12 flex justify-center items-center text-xs text-slate-400 gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
            Loading user directory...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                  <th className="pb-3">User ID</th>
                  <th className="pb-3">Wallet Address</th>
                  <th className="pb-3">Assigned Role</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Registered At</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 font-mono text-slate-400">#{u.id}</td>
                    <td className="py-3 font-mono font-medium text-slate-800">
                      {formatAddress(u.wallet_address)}
                    </td>
                    <td className="py-3 capitalize">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="py-3 text-slate-500">{formatDate(u.created_at)}</td>
                    <td className="py-3 text-right">
                      {u.role !== 'admin' && u.status !== 'suspended' && (
                        <button
                          onClick={() => handleSuspend(u.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-lg text-xs font-semibold transition"
                          title="Suspend account"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          Suspend
                        </button>
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

