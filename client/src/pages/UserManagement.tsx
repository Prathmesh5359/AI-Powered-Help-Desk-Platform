import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { apiFetch } from '../api/client';
import { Users, UserPlus, Shield, Trash2, Edit3, Key, AlertCircle } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'AGENT'>('AGENT');
  const [creating, setCreating] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<{ users: User[] }>('/users');
      setUsers(res.users);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');

    try {
      await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
      });
      setName('');
      setEmail('');
      setPassword('');
      setRole('AGENT');
      setShowModal(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to create agent');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (id: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}?`)) return;

    try {
      await apiFetch(`/users/${id}`, { method: 'DELETE' });
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            User & Agent Management
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
              {users.length} users
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage support agent access and admin privileges.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          Add Support Agent
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="p-6 rounded-2xl glass-card space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/60 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Assigned Tickets</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-slate-100 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 text-blue-400 font-bold flex items-center justify-center text-xs">
                        {u.name.charAt(0)}
                      </div>
                      {u.name}
                    </td>
                    <td className="px-4 py-3.5 text-slate-300">{u.email}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-md border ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {u.role === 'ADMIN' && <Shield className="w-3 h-3" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 font-mono">
                      {u._count?.assignedTickets || 0} tickets
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-2xl glass-panel space-y-4">
            <h3 className="font-bold text-slate-100 text-base">Create New Agent</h3>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jane Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="jane@helpdesk.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'ADMIN' | 'AGENT')}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="AGENT">Support Agent</option>
                  <option value="ADMIN">System Admin</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30"
                >
                  {creating ? 'Creating...' : 'Create Agent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
