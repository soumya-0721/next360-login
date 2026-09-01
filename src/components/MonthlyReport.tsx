'use client';

import { User, AttendanceRecord, Leave } from '@/lib/types';
import { getRoleBadgeClass, getDaysInMonth, isWeekday } from '@/lib/utils';

interface MonthlyReportProps {
  users: User[];
  records: AttendanceRecord[];
  leaves: Leave[];
  monthKey: string;
  currentUser: User;
}

export default function MonthlyReport({ users, records, leaves, monthKey, currentUser }: MonthlyReportProps) {
  const [year, month] = monthKey.split('-').map(Number);
  const totalWeekdays = Array.from({ length: getDaysInMonth(year, month) }, (_, i) => i + 1)
    .filter((d) => isWeekday(year, month, d)).length;

  function getUserStats(userId: string) {
    const monthRecords = records.filter((r) => r.user_id === userId && r.date.startsWith(monthKey));
    const monthLeaves = leaves.filter((l) => l.user_id === userId && l.date.startsWith(monthKey));

    const present = monthRecords.filter((r) => r.status === 'present').length;
    const absent = monthRecords.filter((r) => r.status === 'absent').length;
    const sick = monthLeaves.filter((l) => l.type === 'sick').length;
    const casual = monthLeaves.filter((l) => l.type === 'casual').length;
    const daysTracked = present + absent + sick + casual;

    return { present, absent, sick, casual, daysTracked };
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">Monthly Attendance Report</h3>
      </div>

      <div className="px-5 py-3 bg-green-50 border-b border-green-100">
        <p className="text-sm text-green-700 font-medium">
          Total Weekdays: {totalWeekdays}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Present</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Absent</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sick</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Casual</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Days Tracked</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((user) => {
              const stats = getUserStats(user.id);
              return (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-800">{user.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleBadgeClass(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-semibold text-sm">
                      {stats.present}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-700 font-semibold text-sm">
                      {stats.absent}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-semibold text-sm">
                      {stats.sick}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                      {stats.casual}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="text-sm font-medium text-gray-600">
                      {stats.daysTracked}
                    </span>
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-gray-400 text-sm">
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
