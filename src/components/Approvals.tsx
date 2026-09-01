'use client';

import { useState } from 'react';
import { User, Leave, Expense, Document } from '@/lib/types';
import { todayKey, getRoleBadgeClass } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import {
  CheckCircle,
  XCircle,
  FileText,
  Receipt,
  FileCheck,
  Send,
  Upload,
  MessageSquare,
} from 'lucide-react';

interface ApprovalsProps {
  currentUser: User;
  leaves: Leave[];
  expenses: Expense[];
  documents: Document[];
  users: User[];
  onSave: () => void;
}

type SubTab = 'leaves' | 'expenses' | 'documents';

const EXPENSE_CATEGORIES: Expense['category'][] = ['Travel', 'Food', 'Office Supplies', 'Communication', 'Other'];
const DOC_TYPES: Document['type'][] = ['Report', 'Proposal', 'Invoice', 'Letter', 'Other'];

export default function Approvals({ currentUser, leaves, expenses, documents, users, onSave }: ApprovalsProps) {
  const [subTab, setSubTab] = useState<SubTab>('leaves');
  const [showRejectModal, setShowRejectModal] = useState<{ id: string; type: string } | null>(null);
  const [rejectComment, setRejectComment] = useState('');

  const isManager = currentUser.role === 'CEO' || currentUser.role === 'CTO';

  const subTabs: { key: SubTab; label: string; icon: React.ElementType }[] = [
    { key: 'leaves', label: 'Leaves', icon: FileCheck },
    { key: 'expenses', label: 'Expenses', icon: Receipt },
    { key: 'documents', label: 'Documents', icon: FileText },
  ];

  const pendingLeaves = isManager ? leaves.filter((l) => l.approval_status === 'pending') : [];
  const pendingExpenses = isManager ? expenses.filter((e) => e.approval_status === 'pending') : [];
  const pendingDocs = isManager ? documents.filter((d) => d.approval_status === 'pending') : [];

  function getUserName(userId: string): string {
    return users.find((u) => u.id === userId)?.name || 'Unknown';
  }

  async function handleApprove(type: string, id: string) {
    const supabase = createClient();
    const table = type === 'leave' ? 'leaves' : type === 'expense' ? 'expenses' : 'documents';
    const { error } = await supabase
      .from(table)
      .update({
        approval_status: 'approved',
        approved_by: currentUser.id,
        approval_date: new Date().toISOString(),
      })
      .eq('id', id);

    if (!error) onSave();
  }

  async function handleReject(type: string, id: string) {
    const supabase = createClient();
    const table = type === 'leave' ? 'leaves' : type === 'expense' ? 'expenses' : 'documents';
    const { error } = await supabase
      .from(table)
      .update({
        approval_status: 'rejected',
        approval_comment: rejectComment.trim(),
        approved_by: currentUser.id,
        approval_date: new Date().toISOString(),
      })
      .eq('id', id);

    if (!error) {
      setShowRejectModal(null);
      setRejectComment('');
      onSave();
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-1.5 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {subTabs.map((tab) => {
            const isActive = subTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setSubTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {subTab === 'leaves' && (
        isManager ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">
                Pending Leave Approvals
                <span className="ml-2 text-sm font-normal text-gray-400">({pendingLeaves.length})</span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Employee</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Reason</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pendingLeaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-800">{getUserName(leave.user_id)}</td>
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
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove('leave', leave.id)}
                            className="p-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowRejectModal({ id: leave.id, type: 'leave' })}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {pendingLeaves.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400 text-sm">No pending leave requests.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400 text-sm">
            Your leave requests will appear here for manager review.
          </div>
        )
      )}

      {subTab === 'expenses' && (
        <div className="space-y-6">
          {!isManager && <ExpenseForm currentUser={currentUser} onSave={onSave} />}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">
                {isManager ? 'Pending Expense Approvals' : 'My Expenses'}
                <span className="ml-2 text-sm font-normal text-gray-400">
                  ({isManager ? pendingExpenses.length : expenses.filter((e) => e.user_id === currentUser.id).length})
                </span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    {isManager && <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Employee</th>}
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    {isManager && <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(isManager ? expenses : expenses.filter((e) => e.user_id === currentUser.id)).map((exp) => (
                    <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
                      {isManager && <td className="px-5 py-3.5 font-medium text-gray-800">{getUserName(exp.user_id)}</td>}
                      <td className="px-5 py-3.5 text-sm text-gray-600">{exp.date}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-gray-800">${exp.amount.toFixed(2)}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-gray-100 text-gray-700">
                          {exp.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600 max-w-xs truncate">{exp.description}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          exp.approval_status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : exp.approval_status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {exp.approval_status.charAt(0).toUpperCase() + exp.approval_status.slice(1)}
                        </span>
                        {exp.approval_comment && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                            <MessageSquare className="w-3 h-3" />
                            {exp.approval_comment}
                          </div>
                        )}
                      </td>
                      {isManager && (
                        <td className="px-5 py-3.5">
                          {exp.approval_status === 'pending' && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleApprove('expense', exp.id)}
                                className="p-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setShowRejectModal({ id: exp.id, type: 'expense' })}
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                  {(isManager ? expenses : expenses.filter((e) => e.user_id === currentUser.id)).length === 0 && (
                    <tr><td colSpan={isManager ? 7 : 6} className="px-5 py-8 text-center text-gray-400 text-sm">No expense records found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {subTab === 'documents' && (
        <div className="space-y-6">
          {!isManager && <DocumentForm currentUser={currentUser} onSave={onSave} />}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">
                {isManager ? 'Pending Document Approvals' : 'My Documents'}
                <span className="ml-2 text-sm font-normal text-gray-400">
                  ({isManager ? pendingDocs.length : documents.filter((d) => d.user_id === currentUser.id).length})
                </span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    {isManager && <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Employee</th>}
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Title</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">File</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    {isManager && <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(isManager ? documents : documents.filter((d) => d.user_id === currentUser.id)).map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                      {isManager && <td className="px-5 py-3.5 font-medium text-gray-800">{getUserName(doc.user_id)}</td>}
                      <td className="px-5 py-3.5 text-sm font-medium text-gray-800">{doc.title}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-purple-100 text-purple-800">
                          {doc.type}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600 max-w-xs truncate">{doc.description}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">
                        {doc.file_name || '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          doc.approval_status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : doc.approval_status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {doc.approval_status.charAt(0).toUpperCase() + doc.approval_status.slice(1)}
                        </span>
                        {doc.approval_comment && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                            <MessageSquare className="w-3 h-3" />
                            {doc.approval_comment}
                          </div>
                        )}
                      </td>
                      {isManager && (
                        <td className="px-5 py-3.5">
                          {doc.approval_status === 'pending' && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleApprove('document', doc.id)}
                                className="p-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setShowRejectModal({ id: doc.id, type: 'document' })}
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                  {(isManager ? documents : documents.filter((d) => d.user_id === currentUser.id)).length === 0 && (
                    <tr><td colSpan={isManager ? 7 : 6} className="px-5 py-8 text-center text-gray-400 text-sm">No document records found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowRejectModal(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Reject Submission</h3>
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
                  onClick={() => handleReject(showRejectModal.type, showRejectModal.id)}
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

function ExpenseForm({ currentUser, onSave }: { currentUser: User; onSave: () => void }) {
  const [date, setDate] = useState(todayKey());
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Expense['category']>('Travel');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0 || !description.trim()) return;

    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from('expenses').insert({
      user_id: currentUser.id,
      date,
      amount: amountNum,
      category,
      description: description.trim(),
      approval_status: 'pending',
      approval_comment: '',
      approved_by: '',
      approval_date: '',
    });

    if (!error) {
      setAmount('');
      setDescription('');
      setDate(todayKey());
      onSave();
    }
    setSubmitting(false);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Submit Expense</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder="0.00"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Expense['category'])}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={2}
            placeholder="Describe the expense..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors text-sm"
        >
          <Send className="w-4 h-4" />
          {submitting ? 'Submitting...' : 'Submit Expense'}
        </button>
      </form>
    </div>
  );
}

function DocumentForm({ currentUser, onSave }: { currentUser: User; onSave: () => void }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<Document['type']>('Report');
  const [description, setDescription] = useState('');
  const [fileName, setFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from('documents').insert({
      user_id: currentUser.id,
      title: title.trim(),
      type,
      description: description.trim(),
      file_name: fileName || undefined,
      file_type: fileName ? fileName.split('.').pop() : undefined,
      approval_status: 'pending',
      approval_comment: '',
      approved_by: '',
      approval_date: '',
    });

    if (!error) {
      setTitle('');
      setDescription('');
      setFileName('');
      onSave();
    }
    setSubmitting(false);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Submit Document</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Document title"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as Document['type'])}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
            >
              {DOC_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={2}
            placeholder="Describe the document..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">File (optional)</label>
          <label className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <Upload className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">{fileName || 'Choose file...'}</span>
            <input type="file" onChange={handleFileChange} className="hidden" />
          </label>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors text-sm"
        >
          <Send className="w-4 h-4" />
          {submitting ? 'Submitting...' : 'Submit Document'}
        </button>
      </form>
    </div>
  );
}
