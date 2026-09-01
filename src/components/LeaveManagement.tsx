'use client';

import { useState } from 'react';
import { User, Leave } from '@/lib/types';
import { todayKey, getRoleBadgeClass } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Send, CheckCircle, XCircle, MessageSquare } from 'lucide-react';

interface LeaveManagementProps {
  currentUser: User;
  leaves: Leave[];
  users: User[];
  onSave: () => void;
}

export default function LeaveManagement({ currentUser, leaves, users, onSave }: LeaveManagementProps) {
  const [date, setDate] = useState(todayKey());
  const [type, setType] = useState<'sick' | 'casual'>('sick');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState('');

  const isManager = currentUser.role === 'CEO' || currentUser.role === 'CTO';
  const userLeaves = isManager ? leaves : leaves.filter((l) => l.user_id === currentUser.id);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) return;
    setSubmitting(true);

    const supabase = createClient();
    const { error } = await supabase.from('leaves').insert({
      user_id: currentUser.id,
      date,
      type,
      reason: reason.trim(),
      marked_by: currentUser.id,
      approval_status: 'pending',
      approval_comment: '',
      approved_by: '',
      approval_date: '',
    });

    if (!error) {
      setReason('');
      setDate(todayKey());
      onSave();
    }
    setSubmitting(false);
  }

  async function handleApprove(leaveId: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from('leaves')
      .update({
        approval_status: 'approved',
        approved_by: currentUser.id,
        approval_date: new Date().toISOString(),
      })
      .eq('id', leaveId);

    if (!error) onSave();
  }

  async function handleReject(leaveId: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from('leaves')
      .update({
        approval_status: 'rejected',
        approval_comment: rejectComment.trim(),
        approved_by: currentUser.id,
        approval_date: new Date().toISOString(),
      })
      .eq('id', leaveId);

    if (!error) {
      setShowRejectModal(null);
      setRejectComment('');
      onSave();
    }
  }

  function getUserName(userId: string): string {
    const user = users.find((u) => u.id === userId);
    return user?.name || 'Unknown';
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Request Leave</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'sick' | 'casual')}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
              >
                <option value="sick">Sick Leave</option>
                <option value="casual">Casual Leave</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={3}
              placeholder="Enter reason for leave..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors text-sm"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Leave Requests</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                {isManager && (
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                )}
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                {isManager && (
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {userLeaves.map((leave) => {
                const statusClass =
                  leave.approval_status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : leave.approval_status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800';

                return (
                  <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                    {isManager && (
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-gray-800">{getUserName(leave.user_id)}</p>
                      </td>
                    )}
                    <td className="px-5 py-3.5 text-sm text-gray-600">{leave.date}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        leave.type === 'sick' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {leave.type === 'sick' ? 'Sick' : 'Casual'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600 max-w-xs truncate">{leave.reason}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${statusClass}`}>
                        {leave.approval_status.charAt(0).toUpperCase() + leave.approval_status.slice(1)}
                      </span>
                      {leave.approval_comment && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                          <MessageSquare className="w-3 h-3" />
                          {leave.approval_comment}
                        </div>
                      )}
                    </td>
                    {isManager && (
                      <td className="px-5 py-3.5">
                        {leave.approval_status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApprove(leave.id)}
                              className="p-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setShowRejectModal(leave.id)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
              {userLeaves.length === 0 && (
                <tr>
                  <td colSpan={isManager ? 6 : 5} className="px-5 py-8 text-center text-gray-400 text-sm">
                    No leave requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showRejectModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowRejectModal(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Reject Leave Request</h3>
              <textarea
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder="Enter rejection reason..."
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none mb-4"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => { setShowRejectModal(null); setRejectComment(''); }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(showRejectModal)}
                  className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
