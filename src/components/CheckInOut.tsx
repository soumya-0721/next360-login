'use client';

import { LogIn, LogOut } from 'lucide-react';
import { AttendanceRecord } from '@/lib/types';

interface CheckInOutProps {
  todayRecord: AttendanceRecord | undefined;
  onCheckIn: () => void;
  onCheckOut: () => void;
}

export default function CheckInOut({ todayRecord, onCheckIn, onCheckOut }: CheckInOutProps) {
  const isCheckedIn = !!todayRecord;
  const isCheckedOut = !!todayRecord?.check_out;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onCheckIn}
          disabled={isCheckedIn}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-lg transition-all ${
            isCheckedIn
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg active:scale-[0.98]'
          }`}
        >
          <LogIn className="w-5 h-5" />
          Check In
        </button>
        <button
          onClick={onCheckOut}
          disabled={!isCheckedIn || isCheckedOut}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-lg transition-all ${
            !isCheckedIn || isCheckedOut
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg active:scale-[0.98]'
          }`}
        >
          <LogOut className="w-5 h-5" />
          Check Out
        </button>
      </div>
      {isCheckedIn && !isCheckedOut && (
        <p className="text-sm text-green-600 mt-3 text-center">
          You checked in at {todayRecord.check_in}
        </p>
      )}
      {isCheckedOut && (
        <p className="text-sm text-gray-500 mt-3 text-center">
          Checked in at {todayRecord.check_in} &middot; Checked out at {todayRecord.check_out}
        </p>
      )}
    </div>
  );
}
