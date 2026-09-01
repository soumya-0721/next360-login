'use client';

import { User, AttendanceRecord, Leave } from '@/lib/types';
import { getUserPhoto, getRoleBadgeClass, todayKey } from '@/lib/utils';
import { Users, UserCheck, UserX, Stethoscope, Umbrella } from 'lucide-react';

interface TeamOverviewProps {
  users: User[];
  records: AttendanceRecord[];
  leaves: Leave[];
  onSave: () => void;
}

export default function TeamOverview({ users, records, leaves, onSave }: TeamOverviewProps) {
  const today = todayKey();
  const employees = users.filter((u) => u.role !== 'CEO');

  const todayRecords = records.filter((r) => r.date === today);
  const todayLeaves = leaves.filter((l) => l.date === today);

  function getStatus(empId: string): string {
    const leave = todayLeaves.find((l) => l.user_id === empId);
    if (leave) return leave.type;
    const record = todayRecords.find((r) => r.user_id === empId);
    if (record) return record.status;
    return 'none';
  }

  const presentCount = todayRecords.filter((r) => r.status === 'present').length;
  const absentCount = todayRecords.filter((r) => r.status === 'absent').length;
  const sickCount = todayLeaves.filter((l) => l.type === 'sick').length;
  const casualCount = todayLeaves.filter((l) => l.type === 'casual').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <UserCheck className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <div className="text-xl font-bold text-green-600">{presentCount}</div>
            <div className="text-xs text-gray-500">Present</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <UserX className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <div className="text-xl font-bold text-red-600">{absentCount}</div>
            <div className="text-xs text-gray-500">Absent</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Stethoscope className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="text-xl font-bold text-amber-600">{sickCount}</div>
            <div className="text-xs text-gray-500">Sick</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Umbrella className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="text-xl font-bold text-blue-600">{casualCount}</div>
            <div className="text-xs text-gray-500">Casual</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b">
          <h3 className="font-semibold text-gray-800">Today&apos;s Team Status</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Employee</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => {
                const status = getStatus(emp.id);
                return (
                  <tr key={emp.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={getUserPhoto(emp.email)} alt="" className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{emp.name}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${getRoleBadgeClass(emp.role)}`}>
                            {emp.role}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {status === 'present' && (
                        <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">Present</span>
                      )}
                      {status === 'absent' && (
                        <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded-full">Absent</span>
                      )}
                      {status === 'sick' && (
                        <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-1 rounded-full">Sick Leave</span>
                      )}
                      {status === 'casual' && (
                        <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full">Casual Leave</span>
                      )}
                      {status === 'none' && (
                        <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Not Marked</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onSave()}
                          className={`p-1.5 rounded-lg text-xs font-medium transition ${
                            status === 'present' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'
                          }`}
                          title="Mark Present"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onSave()}
                          className={`p-1.5 rounded-lg text-xs font-medium transition ${
                            status === 'absent' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'
                          }`}
                          title="Mark Absent"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onSave()}
                          className={`p-1.5 rounded-lg text-xs font-medium transition ${
                            status === 'sick' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                          }`}
                          title="Mark Sick"
                        >
                          <Stethoscope className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onSave()}
                          className={`p-1.5 rounded-lg text-xs font-medium transition ${
                            status === 'casual' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                          }`}
                          title="Mark Casual"
                        >
                          <Umbrella className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
