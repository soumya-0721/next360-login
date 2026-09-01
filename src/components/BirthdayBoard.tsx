'use client';

import { Cake, Gift, PartyPopper } from 'lucide-react';
import type { User, Birthday } from '@/lib/types';
import { getUserPhoto, getRoleBadgeClass } from '@/lib/utils';

interface BirthdayBoardProps {
  users: User[];
  birthdays: Birthday[];
}

function getNextBirthday(month: number, day: number): Date {
  const now = new Date();
  const thisYear = new Date(now.getFullYear(), month - 1, day);
  if (thisYear < now) {
    return new Date(now.getFullYear() + 1, month - 1, day);
  }
  return thisYear;
}

function getDaysUntil(month: number, day: number): number {
  const now = new Date();
  const next = getNextBirthday(month, day);
  const diff = next.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function isToday(month: number, day: number): boolean {
  const now = new Date();
  return now.getMonth() + 1 === month && now.getDate() === day;
}

function formatDate(month: number, day: number): string {
  const d = new Date(2024, month - 1, day);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

const MONTH_NAMES = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function BirthdayBoard({ users, birthdays }: BirthdayBoardProps) {
  const userMap = new Map(users.map((u) => [u.id, u]));

  const enriched = birthdays
    .map((b) => {
      const user = userMap.get(b.user_id);
      if (!user) return null;
      const daysUntil = getDaysUntil(b.month, b.day);
      const today = isToday(b.month, b.day);
      return { ...b, user, daysUntil, today, nextDate: getNextBirthday(b.month, b.day) };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  const upcoming = enriched.find((e) => e.daysUntil > 0 && e.daysUntil <= 7);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/20 rounded-xl">
            <Cake className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold">Next Birthday</h3>
        </div>
        {upcoming ? (
          <div className="flex items-center gap-4">
            <img src={getUserPhoto(upcoming.user.email)} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-white/40" />
            <div>
              <p className="text-xl font-bold">{upcoming.user.name}</p>
              <p className="text-green-100 text-sm">{formatDate(upcoming.month, upcoming.day)} &middot; {upcoming.daysUntil} day{upcoming.daysUntil !== 1 ? 's' : ''} away</p>
              <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getRoleBadgeClass(upcoming.user.role)}`}>
                {upcoming.user.role}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-green-100">No upcoming birthdays in the next 7 days</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {enriched.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-xl border p-4 transition-all hover:shadow-md ${
              item.today
                ? 'border-green-400 ring-2 ring-green-200 animate-pulse'
                : item.daysUntil <= 7
                ? 'border-amber-300 bg-amber-50/50'
                : 'border-gray-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src={getUserPhoto(item.user.email)} alt="" className="w-12 h-12 rounded-full object-cover" />
                {item.today && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <PartyPopper className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-800 truncate">{item.user.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeClass(item.user.role)}`}>
                  {item.user.role}
                </span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {MONTH_NAMES[item.month]} {item.day}
              </span>
              {item.today ? (
                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Gift className="w-3 h-3" />
                  Today!
                </span>
              ) : item.daysUntil <= 7 ? (
                <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                  {item.daysUntil}d away
                </span>
              ) : (
                <span className="text-xs text-gray-400">{item.daysUntil}d away</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
