'use client';

import { User, AttendanceRecord, Leave } from '@/lib/types';
import { getRoleBadgeClass } from '@/lib/utils';

interface TodayAttendanceProps {
  users: User[];
  records: AttendanceRecord[];
  leaves: Leave[];
  currentUser: User;
}

export default function TodayAttendance({ users, records, leaves, currentUser }: TodayAttendanceProps) {
  function getStatus(userId: string): { label: string; class: string } {
    const record = records.find((r) => r.user_id === userId);
    const leave = leaves.find((l) => l.user_id === userId);

    if (leave) {
      if (leave.type === 'sick') {
        return { label: 'Sick Leave', class: 'bg-amber-100 text-amber-800' };
      }
      return { label: 'Casual Leave', class: 'bg-blue-100 text-blue-800' };
    }

    if (record?.status === 'present') {
      return { label: 'Present', class: 'bg-green-100 text-green-800' };
    }

    return { label: 'Absent', class: 'bg-red-100 text-red-800' };
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">Today&apos;s Attendance</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Check In</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Check Out</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((user) => {
              const record = records.find((r) => r.user_id === user.id);
              const status = getStatus(user.id);
              return (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getRoleBadgeClass(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600 font-mono">
                    {record?.check_in || '—'}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600 font-mono">
                    {record?.check_out || '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${status.class}`}>
                      {status.label}
                    </span>
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-gray-400 text-sm">
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
