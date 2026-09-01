'use client';

import { useState } from 'react';
import { ClipboardCheck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import type { User, Task, WorkUpdate, TaskItem } from '@/lib/types';
import { getUserPhoto, getRoleBadgeClass, todayKey } from '@/lib/utils';

interface ReviewPanelProps {
  currentUser: User;
  tasks: Task[];
  workUpdates: WorkUpdate[];
  users: User[];
  onSave: (type: 'task' | 'workUpdate', id: string, data: { reviewed: boolean; review_comment: string }) => void;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  completed: { label: 'Completed', bg: 'bg-green-100', text: 'text-green-700', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  partial: { label: 'Partial', bg: 'bg-amber-100', text: 'text-amber-700', icon: <Clock className="w-3.5 h-3.5" /> },
  'not-started': { label: 'Not Started', bg: 'bg-gray-100', text: 'text-gray-600', icon: <AlertCircle className="w-3.5 h-3.5" /> },
  blocked: { label: 'Blocked', bg: 'bg-red-100', text: 'text-red-700', icon: <AlertCircle className="w-3.5 h-3.5" /> },
};

export default function ReviewPanel({ currentUser, tasks, workUpdates, users, onSave }: ReviewPanelProps) {
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [comments, setComments] = useState<Record<string, string>>({});

  const employees = users.filter((u) => u.role !== 'CEO');

  const dayTasks = tasks.filter((t) => t.date === selectedDate);
  const dayUpdates = workUpdates.filter((w) => w.date === selectedDate);

  const availableDates = Array.from(new Set([...tasks.map((t) => t.date), ...workUpdates.map((w) => w.date)]))
    .sort((d1, d2) => d2.localeCompare(d1))
    .slice(0, 30);

  function handleReview(type: 'task' | 'workUpdate', id: string) {
    const comment = comments[`${type}-${id}`] || '';
    onSave(type, id, { reviewed: true, review_comment: comment });
    setComments((prev) => {
      const next = { ...prev };
      delete next[`${type}-${id}`];
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-bold text-gray-800">Review Updates</h2>
        </div>
        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          {availableDates.length === 0 && <option value={todayKey()}>Today</option>}
          {availableDates.map((d) => (
            <option key={d} value={d}>
              {new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
            </option>
          ))}
        </select>
      </div>

      {employees.map((emp) => {
        const empTasks = dayTasks.filter((t) => t.user_id === emp.id);
        const empUpdate = dayUpdates.find((w) => w.user_id === emp.id);
        if (empTasks.length === 0 && !empUpdate) return null;

        return (
          <div key={emp.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b flex items-center gap-3">
              <img src={getUserPhoto(emp.email)} alt="" className="w-8 h-8 rounded-full object-cover" />
              <span className="font-semibold text-gray-800">{emp.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getRoleBadgeClass(emp.role)}`}>
                {emp.role}
              </span>
              {empTasks.length > 0 && empTasks[0].reviewed && (
                <span className="ml-auto text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Reviewed</span>
              )}
            </div>

            <div className="p-4 space-y-4">
              {empTasks.map((task) => (
                <div key={task.id} className="space-y-2">
                  {task.tasks.map((item: TaskItem, idx: number) => {
                    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG['not-started'];
                    return (
                      <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">{item.title}</p>
                            <div className="mt-1 grid grid-cols-3 gap-2 text-xs text-gray-500">
                              <div>
                                <span className="font-medium text-gray-600">Planned: </span>
                                {item.planned}
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">Completed: </span>
                                {item.completed}
                              </div>
                              {item.blockers && (
                                <div>
                                  <span className="font-medium text-red-600">Blockers: </span>
                                  {item.blockers}
                                </div>
                              )}
                            </div>
                          </div>
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${cfg.bg} ${cfg.text}`}>
                            {cfg.icon}
                            {cfg.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {empTasks.map((task) => (
                    <div key={`review-${task.id}`} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={task.reviewed ? task.review_comment : 'Add review comment...'}
                        value={comments[`task-${task.id}`] || ''}
                        onChange={(e) => setComments({ ...comments, [`task-${task.id}`]: e.target.value })}
                        disabled={task.reviewed}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
                      />
                      {!task.reviewed && (
                        <button
                          onClick={() => handleReview('task', task.id)}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
                        >
                          Review
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ))}

              {empUpdate && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-800 mb-1">Work Update</p>
                  <p className="text-sm text-blue-700">{empUpdate.content}</p>
                  {empUpdate.reviewed ? (
                    <p className="text-xs text-green-600 mt-2">Reviewed: {empUpdate.comment}</p>
                  ) : (
                    <div className="flex items-center gap-2 mt-3">
                      <input
                        type="text"
                        placeholder="Add review comment..."
                        value={comments[`workUpdate-${empUpdate.id}`] || ''}
                        onChange={(e) => setComments({ ...comments, [`workUpdate-${empUpdate.id}`]: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                      <button
                        onClick={() => handleReview('workUpdate', empUpdate.id)}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
                      >
                        Review
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {employees.every((emp) => !dayTasks.some((t) => t.user_id === emp.id) && !dayUpdates.some((w) => w.user_id === emp.id)) && (
        <div className="text-center py-12 text-gray-400">
          <ClipboardCheck className="w-12 h-12 mx-auto mb-3" />
          <p>No updates for this date</p>
        </div>
      )}
    </div>
  );
}
