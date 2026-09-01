'use client';

import { useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import type { Notification } from '@/lib/types';

interface NotificationsProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export default function Notifications({ notifications, onMarkRead, onMarkAllRead }: NotificationsProps) {
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-green-50 transition"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-80 bg-white rounded-xl shadow-xl border border-gray-200 max-h-96 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              {unread > 0 && (
                <button
                  onClick={onMarkAllRead}
                  className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>
            <div className="overflow-y-auto max-h-80">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm">No notifications</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => onMarkRead(n.id)}
                    className={`px-4 py-3 border-b last:border-0 cursor-pointer hover:bg-gray-50 transition ${
                      !n.read ? 'bg-green-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {!n.read && <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800">{n.comment}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {n.from_name} ({n.from_role}) &middot; {n.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
