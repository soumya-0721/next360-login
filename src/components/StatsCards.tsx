'use client';

import { UserCheck, UserX, Stethoscope, CalendarOff } from 'lucide-react';
import { AttendanceRecord } from '@/lib/types';

interface StatsCardsProps {
  records: AttendanceRecord[];
}

export default function StatsCards({ records }: StatsCardsProps) {
  const present = records.filter((r) => r.status === 'present').length;
  const absent = records.filter((r) => r.status === 'absent').length;
  const sick = 0;
  const casual = 0;

  const cards = [
    {
      label: 'Present',
      count: present,
      icon: UserCheck,
      bg: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      countColor: 'text-green-700',
    },
    {
      label: 'Absent',
      count: absent,
      icon: UserX,
      bg: 'bg-red-50',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      countColor: 'text-red-700',
    },
    {
      label: 'Sick Leave',
      count: sick,
      icon: Stethoscope,
      bg: 'bg-amber-50',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      countColor: 'text-amber-700',
    },
    {
      label: 'Casual Leave',
      count: casual,
      icon: CalendarOff,
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      countColor: 'text-blue-700',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${card.bg} rounded-xl p-5 border border-gray-100 transition-transform hover:scale-[1.02]`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`${card.iconBg} p-2.5 rounded-lg`}>
              <card.icon className={`w-5 h-5 ${card.iconColor}`} />
            </div>
          </div>
          <p className={`text-3xl font-bold ${card.countColor}`}>{card.count}</p>
          <p className="text-sm text-gray-500 mt-1">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
