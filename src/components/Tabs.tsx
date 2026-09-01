'use client';

import {
  CalendarCheck,
  Calendar,
  CalendarOff,
  ClipboardList,
  CheckSquare,
  User,
  BarChart3,
  Cake,
  MessageSquare,
  FileCheck,
  Users,
  DollarSign,
  Camera,
  Settings,
} from 'lucide-react';
import { UserRole } from '@/lib/types';

interface TabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: UserRole;
}

interface TabDef {
  key: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const TABS: TabDef[] = [
  { key: 'today', label: 'Today', icon: CalendarCheck, roles: ['CEO', 'CTO', 'Employee'] },
  { key: 'monthly', label: 'Monthly', icon: Calendar, roles: ['CEO', 'CTO', 'Employee'] },
  { key: 'leave', label: 'Leave', icon: CalendarOff, roles: ['CEO', 'CTO', 'Employee'] },
  { key: 'work', label: 'Work Updates', icon: ClipboardList, roles: ['CEO', 'CTO', 'Employee'] },
  { key: 'approvals', label: 'Approvals', icon: CheckSquare, roles: ['CEO', 'CTO', 'Employee'] },
  { key: 'profile', label: 'Profile', icon: User, roles: ['CEO', 'CTO', 'Employee'] },
  { key: 'charts', label: 'Charts', icon: BarChart3, roles: ['CEO', 'CTO', 'Employee'] },
  { key: 'birthdays', label: 'Birthdays', icon: Cake, roles: ['CEO', 'CTO', 'Employee'] },
  { key: 'chat', label: 'Chat', icon: MessageSquare, roles: ['CEO', 'CTO', 'Employee'] },
  { key: 'review', label: 'Review', icon: FileCheck, roles: ['CEO', 'CTO'] },
  { key: 'team', label: 'Team', icon: Users, roles: ['CEO', 'CTO'] },
  { key: 'payroll', label: 'Payroll', icon: DollarSign, roles: ['CEO', 'CTO'] },
  { key: 'selfies', label: 'Selfies', icon: Camera, roles: ['CEO', 'CTO'] },
  { key: 'settings', label: 'Settings', icon: Settings, roles: ['CEO'] },
];

export default function Tabs({ activeTab, onTabChange, userRole }: TabsProps) {
  const visibleTabs = TABS.filter((tab) => tab.roles.includes(userRole));

  return (
    <div className="bg-white rounded-xl shadow-sm p-1.5 overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {visibleTabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
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
  );
}
