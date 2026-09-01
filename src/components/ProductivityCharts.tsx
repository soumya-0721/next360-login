'use client';

import type { User, AttendanceRecord, Leave } from '@/lib/types';
import { getUserPhoto } from '@/lib/utils';

interface ProductivityChartsProps {
  users: User[];
  records: AttendanceRecord[];
  leaves: Leave[];
  currentUser: User;
}

export default function ProductivityCharts({ users, records, leaves, currentUser }: ProductivityChartsProps) {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const monthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  const employees = users.filter((u) => u.role !== 'CEO');

  const last7Days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    last7Days.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }

  const attendanceTrend = last7Days.map((date) => {
    const dayRecords = records.filter((r) => r.date === date);
    const present = dayRecords.filter((r) => r.status === 'present').length;
    const d = new Date(date + 'T00:00:00');
    const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    return { date, label, present };
  });
  const maxPresent = Math.max(...attendanceTrend.map((d) => d.present), 1);

  const todayRecords = records.filter((r) => r.date === todayKey);
  const todayLeaves = leaves.filter((l) => l.date === todayKey);
  const presentCount = todayRecords.filter((r) => r.status === 'present').length;
  const absentCount = todayRecords.filter((r) => r.status === 'absent').length;
  const sickCount = todayLeaves.filter((l) => l.type === 'sick').length;
  const casualCount = todayLeaves.filter((l) => l.type === 'casual').length;
  const totalForPie = presentCount + absentCount + sickCount + casualCount || 1;

  const breakdownData = [
    { label: 'Present', count: presentCount, color: '#16a34a' },
    { label: 'Absent', count: absentCount, color: '#ef4444' },
    { label: 'Sick', count: sickCount, color: '#f59e0b' },
    { label: 'Casual', count: casualCount, color: '#3b82f6' },
  ];

  let accumulatedAngle = 0;
  const pieSegments = breakdownData.map((item) => {
    const angle = (item.count / totalForPie) * 360;
    const startAngle = accumulatedAngle;
    accumulatedAngle += angle;
    const endAngle = accumulatedAngle;
    return { ...item, startAngle, endAngle };
  });

  const monthRecords = records.filter((r) => r.date.startsWith(monthKey));
  const employeePerformance = employees.map((emp) => {
    const present = monthRecords.filter((r) => r.user_id === emp.id && r.status === 'present').length;
    return { user: emp, present };
  }).sort((a, b) => b.present - a.present);
  const maxEmpPresent = Math.max(...employeePerformance.map((d) => d.present), 1);

  const monthLeaves = leaves.filter((l) => l.date.startsWith(monthKey));
  const leaveDistribution = employees.map((emp) => {
    const count = monthLeaves.filter((l) => l.user_id === emp.id).length;
    return { user: emp, count };
  }).sort((a, b) => b.count - a.count);
  const maxLeaveCount = Math.max(...leaveDistribution.map((d) => d.count), 1);

  function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
  }

  function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Attendance Trend (Last 7 Days)</h3>
          <div className="space-y-3">
            {attendanceTrend.map((day) => (
              <div key={day.date} className="flex items-center gap-3">
                <span className="w-28 text-xs text-gray-500 shrink-0 text-right">{day.label}</span>
                <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded transition-all"
                    style={{ width: `${(day.present / maxPresent) * 100}%`, minWidth: day.present > 0 ? '8px' : '0' }}
                  />
                </div>
                <span className="w-8 text-xs font-medium text-gray-700 text-right">{day.present}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Attendance Breakdown (Today)</h3>
          <div className="flex items-center justify-center gap-8">
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {pieSegments.map((seg, i) => (
                  seg.count > 0 && (
                    <path
                      key={i}
                      d={describeArc(50, 50, 40, seg.startAngle, seg.endAngle)}
                      fill={seg.color}
                      className="transition-all"
                    />
                  )
                ))}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-800">{totalForPie > 1 ? totalForPie - 1 : 0}</div>
                  <div className="text-xs text-gray-500">employees</div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {breakdownData.map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-semibold text-gray-800">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Employee Performance (This Month)</h3>
          <div className="space-y-3">
            {employeePerformance.map((emp) => (
              <div key={emp.user.id} className="flex items-center gap-3">
                <img src={getUserPhoto(emp.user.email)} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                <span className="w-24 text-xs text-gray-600 truncate shrink-0">{emp.user.name}</span>
                <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded transition-all"
                    style={{ width: `${(emp.present / maxEmpPresent) * 100}%`, minWidth: emp.present > 0 ? '4px' : '0' }}
                  />
                </div>
                <span className="w-8 text-xs font-medium text-gray-700 text-right">{emp.present}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Leave Distribution (This Month)</h3>
          <div className="space-y-3">
            {leaveDistribution.map((emp) => (
              <div key={emp.user.id} className="flex items-center gap-3">
                <img src={getUserPhoto(emp.user.email)} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                <span className="w-24 text-xs text-gray-600 truncate shrink-0">{emp.user.name}</span>
                <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded transition-all"
                    style={{ width: `${(emp.count / maxLeaveCount) * 100}%`, minWidth: emp.count > 0 ? '4px' : '0' }}
                  />
                </div>
                <span className="w-8 text-xs font-medium text-gray-700 text-right">{emp.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
