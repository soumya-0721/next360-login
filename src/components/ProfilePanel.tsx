'use client';

import { useState } from 'react';
import { User, Mail, Phone, Building2, Briefcase, Calendar, Edit3, Save, X } from 'lucide-react';
import type { User as UserType, AttendanceRecord, Leave, Task, Profile } from '@/lib/types';
import { getUserPhoto, getRoleBadgeClass, todayKey } from '@/lib/utils';

interface ProfilePanelProps {
  currentUser: UserType;
  users: UserType[];
  records: AttendanceRecord[];
  leaves: Leave[];
  tasks: Task[];
  profiles: Profile[];
  onSave: () => void;
}

export default function ProfilePanel({ currentUser, users, records, leaves, tasks, profiles, onSave }: ProfilePanelProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser.id);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ phone: '', department: '', designation: '' });

  const isCeo = currentUser.role === 'CEO' || currentUser.role === 'CTO';
  const viewingUser = users.find((u) => u.id === selectedUserId) || currentUser;
  const profile = profiles.find((p) => p.user_id === viewingUser.id);
  const isSelf = viewingUser.id === currentUser.id;

  const now = new Date();
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const monthRecords = records.filter((r) => r.user_id === viewingUser.id && r.date.startsWith(monthStr));
  const monthLeaves = leaves.filter((l) => l.user_id === viewingUser.id && l.date.startsWith(monthStr));
  const monthTasks = tasks.filter((t) => t.user_id === viewingUser.id && t.date.startsWith(monthStr));

  const presentDays = monthRecords.filter((r) => r.status === 'present').length;
  const absentDays = monthRecords.filter((r) => r.status === 'absent').length;
  const sickDays = monthLeaves.filter((l) => l.type === 'sick').length;
  const casualDays = monthLeaves.filter((l) => l.type === 'casual').length;

  const totalTasks = monthTasks.reduce((acc, t) => acc + t.tasks.length, 0);
  const completedTasks = monthTasks.reduce((acc, t) => acc + t.tasks.filter((tk) => tk.status === 'completed').length, 0);
  const taskRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  function startEdit() {
    setForm({
      phone: profile?.phone || '',
      department: profile?.department || '',
      designation: profile?.designation || '',
    });
    setEditing(true);
  }

  function handleSave() {
    onSave();
    setEditing(false);
  }

  const employees = users.filter((u) => u.role !== 'CEO');

  return (
    <div className="space-y-6">
      {isCeo && !isSelf && (
        <div className="flex flex-wrap gap-2">
          {employees.map((u) => (
            <button
              key={u.id}
              onClick={() => { setSelectedUserId(u.id); setEditing(false); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                selectedUserId === u.id
                  ? 'bg-green-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-green-300'
              }`}
            >
              <img src={getUserPhoto(u.email)} alt="" className="w-5 h-5 rounded-full object-cover" />
              {u.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex flex-col items-center text-center">
            <img
              src={getUserPhoto(viewingUser.email)}
              alt={viewingUser.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-green-100"
            />
            <h2 className="mt-4 text-xl font-bold text-gray-800">{viewingUser.name}</h2>
            <span className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeClass(viewingUser.role)}`}>
              {viewingUser.role}
            </span>

            <div className="mt-6 w-full space-y-3 text-left">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-green-600" />
                <span>{viewingUser.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-green-600" />
                <span>{profile?.phone || '—'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Building2 className="w-4 h-4 text-green-600" />
                <span>{profile?.department || '—'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Briefcase className="w-4 h-4 text-green-600" />
                <span>{profile?.designation || '—'}</span>
              </div>
              {profile?.joined_date && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span>Joined {new Date(profile.joined_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              )}
            </div>

            {isSelf && (
              <div className="mt-6 w-full">
                {!editing ? (
                  <button onClick={startEdit} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition font-medium text-sm">
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Phone"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <input
                      type="text"
                      placeholder="Department"
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <input
                      type="text"
                      placeholder="Designation"
                      value={form.designation}
                      onChange={(e) => setForm({ ...form, designation: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <div className="flex gap-2">
                      <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium">
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                      <button onClick={() => setEditing(false)} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium">
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-2xl font-bold text-green-600">{presentDays}</div>
              <div className="text-sm text-gray-500 mt-1">Present Days</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-2xl font-bold text-red-500">{absentDays}</div>
              <div className="text-sm text-gray-500 mt-1">Absent Days</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-2xl font-bold text-amber-500">{sickDays + casualDays}</div>
              <div className="text-sm text-gray-500 mt-1">Leaves</div>
              <div className="text-xs text-gray-400 mt-0.5">Sick: {sickDays} / Casual: {casualDays}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-2xl font-bold text-blue-600">{taskRate}%</div>
              <div className="text-sm text-gray-500 mt-1">Task Completion</div>
              <div className="text-xs text-gray-400 mt-0.5">{completedTasks}/{totalTasks} tasks</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Attendance Summary - {now.toLocaleString('en-US', { month: 'long', year: 'numeric' })}</h3>
            <div className="space-y-3">
              {['present', 'absent'].map((status) => {
                const count = monthRecords.filter((r) => r.status === status).length;
                const total = monthRecords.length || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={status} className="flex items-center gap-4">
                    <span className="w-20 text-sm text-gray-600 capitalize">{status}</span>
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${status === 'present' ? 'bg-green-500' : 'bg-red-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-16 text-right text-sm font-medium text-gray-700">{count} days</span>
                  </div>
                );
              })}
              <div className="flex items-center gap-4">
                <span className="w-20 text-sm text-gray-600">Leaves</span>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all"
                    style={{ width: `${monthRecords.length ? Math.round((sickDays + casualDays) / monthRecords.length * 100) : 0}%` }}
                  />
                </div>
                <span className="w-16 text-right text-sm font-medium text-gray-700">{sickDays + casualDays} days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
