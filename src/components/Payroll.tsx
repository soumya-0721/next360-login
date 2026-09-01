'use client';

import { useState } from 'react';
import { DollarSign, Printer, TrendingUp, TrendingDown } from 'lucide-react';
import type { User, AttendanceRecord, Leave, Salary } from '@/lib/types';
import { getUserPhoto, getRoleBadgeClass, getMonthsList, getDaysInMonth, isWeekday } from '@/lib/utils';

interface PayrollProps {
  users: User[];
  records: AttendanceRecord[];
  leaves: Leave[];
  salaries: Salary[];
  onSave: () => void;
}

export default function Payroll({ users, records, leaves, salaries, onSave }: PayrollProps) {
  const months = getMonthsList(12);
  const [selectedMonth, setSelectedMonth] = useState(months[0].value);
  const [editingSalary, setEditingSalary] = useState<Record<string, number>>({});

  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = parseInt(yearStr);
  const month = parseInt(monthStr);
  const daysInMonth = getDaysInMonth(year, month);

  let workingDays = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    if (isWeekday(year, month, d)) workingDays++;
  }

  const employees = users.filter((u) => u.role !== 'CEO');

  const payrollData = employees.map((emp) => {
    const empRecords = records.filter((r) => r.user_id === emp.id && r.date.startsWith(selectedMonth));
    const empLeaves = leaves.filter((l) => l.user_id === emp.id && l.date.startsWith(selectedMonth));
    const salary = salaries.find((s) => s.user_id === emp.id)?.monthly_salary || 0;

    const present = empRecords.filter((r) => r.status === 'present').length;
    const absent = empRecords.filter((r) => r.status === 'absent').length;
    const sick = empLeaves.filter((l) => l.type === 'sick').length;
    const casual = empLeaves.filter((l) => l.type === 'casual').length;
    const totalLeaves = sick + casual;
    const netDays = present + sick * 0.5;
    const earned = workingDays > 0 ? (salary / workingDays) * netDays : 0;
    const deduction = workingDays > 0 ? (salary / workingDays) * absent : 0;
    const netPay = earned - deduction;

    return { emp, present, absent, totalLeaves, sick, workingDays, salary, netDays, earned, deduction, netPay };
  });

  const totalPayroll = payrollData.reduce((acc, d) => acc + d.netPay, 0);
  const totalEarned = payrollData.reduce((acc, d) => acc + d.earned, 0);
  const totalDeduction = payrollData.reduce((acc, d) => acc + d.deduction, 0);
  const totalSalaryBudget = payrollData.reduce((acc, d) => acc + d.salary, 0);

  function handleSalaryChange(empId: string, val: string) {
    const num = parseInt(val) || 0;
    setEditingSalary({ ...editingSalary, [empId]: num });
  }

  function saveSalary(empId: string) {
    const val = editingSalary[empId];
    if (val !== undefined) {
      onSave();
      setEditingSalary((prev) => {
        const next = { ...prev };
        delete next[empId];
        return next;
      });
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-bold text-gray-800">Payroll</h2>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <button onClick={handlePrint} className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition">
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Total Budget</div>
          <div className="text-xl font-bold text-gray-800 mt-1">${totalSalaryBudget.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500 flex items-center gap-1"><TrendingUp className="w-4 h-4 text-green-500" /> Total Earned</div>
          <div className="text-xl font-bold text-green-600 mt-1">${totalEarned.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500 flex items-center gap-1"><TrendingDown className="w-4 h-4 text-red-500" /> Total Deductions</div>
          <div className="text-xl font-bold text-red-600 mt-1">${totalDeduction.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Net Payroll</div>
          <div className="text-xl font-bold text-green-700 mt-1">${totalPayroll.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
                <th className="text-left px-3 py-3 font-semibold text-gray-600">Role</th>
                <th className="text-center px-3 py-3 font-semibold text-gray-600">Working</th>
                <th className="text-center px-3 py-3 font-semibold text-gray-600">Present</th>
                <th className="text-center px-3 py-3 font-semibold text-gray-600">Absent</th>
                <th className="text-center px-3 py-3 font-semibold text-gray-600">Leaves</th>
                <th className="text-center px-3 py-3 font-semibold text-gray-600">Net Days</th>
                <th className="text-right px-3 py-3 font-semibold text-gray-600">Salary</th>
                <th className="text-right px-3 py-3 font-semibold text-gray-600">Earned</th>
                <th className="text-right px-3 py-3 font-semibold text-gray-600">Deduction</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-800">Net Pay</th>
              </tr>
            </thead>
            <tbody>
              {payrollData.map((row) => (
                <tr key={row.emp.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <img src={getUserPhoto(row.emp.email)} alt="" className="w-7 h-7 rounded-full object-cover" />
                      <span className="font-medium text-gray-800">{row.emp.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${getRoleBadgeClass(row.emp.role)}`}>
                      {row.emp.role}
                    </span>
                  </td>
                  <td className="text-center px-3 py-3 text-gray-600">{row.workingDays}</td>
                  <td className="text-center px-3 py-3 text-green-600 font-medium">{row.present}</td>
                  <td className="text-center px-3 py-3 text-red-600 font-medium">{row.absent}</td>
                  <td className="text-center px-3 py-3 text-amber-600 font-medium">{row.totalLeaves}</td>
                  <td className="text-center px-3 py-3 font-medium text-gray-800">{row.netDays.toFixed(1)}</td>
                  <td className="text-right px-3 py-3">
                    {editingSalary[row.emp.id] !== undefined ? (
                      <input
                        type="number"
                        value={editingSalary[row.emp.id]}
                        onChange={(e) => handleSalaryChange(row.emp.id, e.target.value)}
                        onBlur={() => saveSalary(row.emp.id)}
                        onKeyDown={(e) => e.key === 'Enter' && saveSalary(row.emp.id)}
                        className="w-24 text-right px-2 py-1 border border-green-300 rounded text-sm focus:ring-2 focus:ring-green-500"
                        autoFocus
                      />
                    ) : (
                      <button
                        onClick={() => setEditingSalary({ ...editingSalary, [row.emp.id]: row.salary })}
                        className="text-gray-700 hover:text-green-600 transition cursor-pointer"
                      >
                        ${row.salary.toLocaleString()}
                      </button>
                    )}
                  </td>
                  <td className="text-right px-3 py-3 text-green-600 font-medium">
                    ${row.earned.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td className="text-right px-3 py-3 text-red-600 font-medium">
                    ${row.deduction.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td className="text-right px-4 py-3 font-bold text-gray-800">
                    ${row.netPay.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
