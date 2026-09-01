'use client';

import { useState } from 'react';
import { Settings, UserPlus, Trash2, Save, Monitor, Smartphone, LogOut, Shield } from 'lucide-react';
import type { User, Profile, Salary, Birthday, Session } from '@/lib/types';
import { getUserPhoto, getRoleBadgeClass, hashPassword } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface SettingsPanelProps {
  currentUser: User;
  users: User[];
  profiles: Profile[];
  salaries: Salary[];
  birthdays: Birthday[];
  sessions: Session[];
  onSave: () => void;
}

interface MemberForm {
  name: string;
  email: string;
  password: string;
  role: 'CEO' | 'CTO' | 'Employee';
  phone: string;
  department: string;
  designation: string;
  salary: number;
  birthday: string;
}

const EMPTY_FORM: MemberForm = {
  name: '',
  email: '',
  password: '',
  role: 'Employee',
  phone: '',
  department: '',
  designation: '',
  salary: 0,
  birthday: '',
};

export default function SettingsPanel({ currentUser, users, profiles, salaries, birthdays, sessions, onSave }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<'members' | 'sessions'>('members');
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<MemberForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);

  const userMap = new Map(users.map((u) => [u.id, u]));
  const activeSessions = sessions.filter((s) => s.status === 'active');

  function startAdd() {
    setAdding(true);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function startEdit(userId: string) {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    const profile = profiles.find((p) => p.user_id === userId);
    const salary = salaries.find((s) => s.user_id === userId);
    const birthday = birthdays.find((b) => b.user_id === userId);
    setEditingId(userId);
    setAdding(false);
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      phone: profile?.phone || '',
      department: profile?.department || '',
      designation: profile?.designation || '',
      salary: salary?.monthly_salary || 0,
      birthday: birthday ? `${String(birthday.month).padStart(2, '0')}-${String(birthday.day).padStart(2, '0')}` : '',
    });
  }

  async function handleSave() {
    const supabase = createClient();
    if (adding) {
      const passwordHash = form.password ? await hashPassword(form.password) : '';
      const { data: newUser, error } = await supabase.from('users').insert({
        name: form.name, email: form.email, password_hash: passwordHash, role: form.role,
      }).select().single();
      if (!error && newUser) {
        await supabase.from('profiles').insert({ user_id: newUser.id, phone: form.phone, department: form.department, designation: form.designation, joined_date: '2024-01-01' });
        await supabase.from('salary').insert({ user_id: newUser.id, monthly_salary: form.salary });
        if (form.birthday) {
          const [m, d] = form.birthday.split('-').map(Number);
          await supabase.from('birthdays').insert({ user_id: newUser.id, month: m, day: d });
        }
      }
    } else if (editingId) {
      if (form.password) {
        const passwordHash = await hashPassword(form.password);
        await supabase.from('users').update({ name: form.name, role: form.role, password_hash: passwordHash }).eq('id', editingId);
      } else {
        await supabase.from('users').update({ name: form.name, role: form.role }).eq('id', editingId);
      }
      await supabase.from('profiles').upsert({ user_id: editingId, phone: form.phone, department: form.department, designation: form.designation, joined_date: '2024-01-01' }, { onConflict: 'user_id' });
      await supabase.from('salary').upsert({ user_id: editingId, monthly_salary: form.salary }, { onConflict: 'user_id' });
      if (form.birthday) {
        const [m, d] = form.birthday.split('-').map(Number);
        await supabase.from('birthdays').upsert({ user_id: editingId, month: m, day: d }, { onConflict: 'user_id' });
      }
    }
    setAdding(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    onSave();
  }

  async function handleRemove(userId: string) {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    const supabase = createClient();
    await supabase.from('users').delete().eq('id', userId);
    onSave();
  }

  async function handleRevokeSession(sessionId: string) {
    const supabase = createClient();
    await supabase.from('sessions').update({ status: 'revoked' }).eq('id', sessionId);
    onSave();
  }

  function getDeviceIcon(type: string) {
    return type === 'mobile' ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />;
  }

  const sessionsByUser = activeSessions.reduce<Record<string, Session[]>>((acc, s) => {
    if (!acc[s.user_id]) acc[s.user_id] = [];
    acc[s.user_id].push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="w-5 h-5 text-green-600" />
        <h2 className="text-lg font-bold text-gray-800">Settings</h2>
      </div>

      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'members' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Member Management
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'sessions' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Active Sessions ({activeSessions.length})
        </button>
      </div>

      {activeTab === 'members' && (
        <>
          {!adding && !editingId && (
            <button
              onClick={startAdd}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
            >
              <UserPlus className="w-4 h-4" />
              Add Member
            </button>
          )}

          {(adding || editingId) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h3 className="font-semibold text-gray-800">{adding ? 'Add New Member' : 'Edit Member'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{adding ? 'Password' : 'New Password (leave blank to keep)'}</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value as User['role'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="CEO">CEO</option>
                    <option value="CTO">CTO</option>
                    <option value="Employee">Employee</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
                  <input
                    type="text"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Designation</label>
                  <input
                    type="text"
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Monthly Salary</label>
                  <input
                    type="number"
                    value={form.salary || ''}
                    onChange={(e) => setForm({ ...form, salary: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Birthday (MM-DD)</label>
                  <input
                    type="text"
                    placeholder="MM-DD"
                    value={form.birthday}
                    onChange={(e) => setForm({ ...form, birthday: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSave} className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition">
                  <Save className="w-4 h-4" />
                  {adding ? 'Add Member' : 'Save Changes'}
                </button>
                <button
                  onClick={() => { setAdding(false); setEditingId(null); setForm(EMPTY_FORM); }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {users.map((user) => {
              const profile = profiles.find((p) => p.user_id === user.id);
              const salary = salaries.find((s) => s.user_id === user.id);
              const bday = birthdays.find((b) => b.user_id === user.id);
              return (
                <div key={user.id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <img src={getUserPhoto(user.email)} alt="" className="w-10 h-10 rounded-full object-cover" />
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{user.name}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${getRoleBadgeClass(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-gray-500">
                    <p>{user.email}</p>
                    {profile?.phone && <p>{profile.phone}</p>}
                    {profile?.department && <p>{profile.department} &middot; {profile.designation}</p>}
                    {salary && <p className="font-medium text-gray-700">${salary.monthly_salary.toLocaleString()}/mo</p>}
                    {bday && <p>Birthday: {bday.month}/{bday.day}</p>}
                  </div>
                  <div className="flex gap-2 pt-1 border-t border-gray-100">
                    <button
                      onClick={() => startEdit(user.id)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    {user.id !== currentUser.id && (
                      <button
                        onClick={() => handleRemove(user.id)}
                        className="flex items-center justify-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeTab === 'sessions' && (
        <div className="space-y-4">
          {Object.keys(sessionsByUser).length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Shield className="w-12 h-12 mx-auto mb-3" />
              <p>No active sessions</p>
            </div>
          ) : (
            Object.entries(sessionsByUser).map(([userId, userSessions]) => {
              const user = userMap.get(userId);
              if (!user) return null;
              return (
                <div key={userId} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b flex items-center gap-3">
                    <img src={getUserPhoto(user.email)} alt="" className="w-7 h-7 rounded-full object-cover" />
                    <span className="font-semibold text-gray-800 text-sm">{user.name}</span>
                    <span className="text-xs text-gray-400">({userSessions.length} session{userSessions.length !== 1 ? 's' : ''})</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {userSessions.map((session) => (
                      <div key={session.id} className="px-4 py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-1.5 bg-gray-100 rounded-lg text-gray-500">
                            {getDeviceIcon(session.device.type)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-gray-800">
                              {session.device.type} &middot; {session.device.os} &middot; {session.device.browser}
                            </p>
                            <p className="text-xs text-gray-400">
                              Screen: {session.device.screen}
                            </p>
                            <p className="text-xs text-gray-400">
                              Login: {session.login_time} &middot; Last Active: {session.last_active}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRevokeSession(session.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 transition shrink-0"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Revoke
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
