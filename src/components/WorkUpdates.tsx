'use client';

import { useState } from 'react';
import { User, Task, TaskItem } from '@/lib/types';
import { todayKey } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Plus, Trash2, Send } from 'lucide-react';

interface WorkUpdatesProps {
  currentUser: User;
  tasks: Task[];
  onSave: () => void;
}

const STATUS_OPTIONS: { value: TaskItem['status']; label: string }[] = [
  { value: 'completed', label: 'Completed' },
  { value: 'partial', label: 'Partial' },
  { value: 'not-started', label: 'Not Started' },
  { value: 'blocked', label: 'Blocked' },
];

function createEmptyTask(): TaskItem {
  return { title: '', planned: '', completed: '', blockers: '', status: 'not-started' };
}

export default function WorkUpdates({ currentUser, tasks, onSave }: WorkUpdatesProps) {
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [taskRows, setTaskRows] = useState<TaskItem[]>([createEmptyTask()]);
  const [submitting, setSubmitting] = useState(false);

  const existingTasks = tasks.filter((t) => t.user_id === currentUser.id && t.date === selectedDate);

  function addRow() {
    setTaskRows([...taskRows, createEmptyTask()]);
  }

  function removeRow(index: number) {
    if (taskRows.length <= 1) return;
    setTaskRows(taskRows.filter((_, i) => i !== index));
  }

  function updateRow(index: number, field: keyof TaskItem, value: string) {
    const updated = [...taskRows];
    updated[index] = { ...updated[index], [field]: value };
    setTaskRows(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validTasks = taskRows.filter((t) => t.title.trim());
    if (validTasks.length === 0) return;

    setSubmitting(true);
    const supabase = createClient();

    const { error } = await supabase.from('tasks').insert({
      user_id: currentUser.id,
      date: selectedDate,
      tasks: validTasks,
      reviewed: false,
      review_comment: '',
      reviewed_by: '',
    });

    if (!error) {
      setTaskRows([createEmptyTask()]);
      onSave();
    }
    setSubmitting(false);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <h3 className="text-lg font-semibold text-gray-800">Work Updates</h3>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-600">Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-3">
            {taskRows.map((row, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-400 uppercase">Task {idx + 1}</span>
                  {taskRows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(idx)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <input
                    type="text"
                    placeholder="Task title"
                    value={row.title}
                    onChange={(e) => updateRow(idx, 'title', e.target.value)}
                    className="lg:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Planned"
                    value={row.planned}
                    onChange={(e) => updateRow(idx, 'planned', e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Completed"
                    value={row.completed}
                    onChange={(e) => updateRow(idx, 'completed', e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
                  />
                  <select
                    value={row.status}
                    onChange={(e) => updateRow(idx, 'status', e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  placeholder="Blockers (if any)"
                  value={row.blockers}
                  onChange={(e) => updateRow(idx, 'blockers', e.target.value)}
                  className="w-full mt-3 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button
              type="button"
              onClick={addRow}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Submitting...' : 'Submit Updates'}
            </button>
          </div>
        </form>
      </div>

      {existingTasks.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">Submitted Tasks</h3>
          </div>
          <div className="p-5 space-y-3">
            {existingTasks.map((task) =>
              task.tasks.map((t, i) => (
                <div key={`${task.id}-${i}`} className="flex items-start gap-4 bg-gray-50 rounded-lg p-4">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{t.title}</p>
                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                      <span>Planned: {t.planned || '—'}</span>
                      <span>Completed: {t.completed || '—'}</span>
                      {t.blockers && <span className="text-red-500">Blockers: {t.blockers}</span>}
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold whitespace-nowrap ${
                    t.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : t.status === 'partial'
                      ? 'bg-amber-100 text-amber-800'
                      : t.status === 'blocked'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {STATUS_OPTIONS.find((o) => o.value === t.status)?.label || t.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
