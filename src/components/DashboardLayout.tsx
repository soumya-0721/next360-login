'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import {
  User,
  AttendanceRecord,
  Leave,
  Task,
  Notification,
  Expense,
  Document,
  Selfie,
  Salary,
  Profile,
  ChatMessage,
  WorkUpdate,
  Session,
  Birthday,
} from '@/lib/types';
import {
  todayKey,
  formatTime,
  formatDateFull,
  getGreeting,
  getUserPhoto,
  getRoleBadgeClass,
} from '@/lib/utils';
import { Bell, LogOut, Clock } from 'lucide-react';
import StatsCards from './StatsCards';
import CheckInOut from './CheckInOut';
import TodayAttendance from './TodayAttendance';
import Tabs from './Tabs';
import MonthlyReport from './MonthlyReport';
import LeaveManagement from './LeaveManagement';
import WorkUpdates from './WorkUpdates';
import Approvals from './Approvals';
import ProfilePanel from './ProfilePanel';
import ProductivityCharts from './ProductivityCharts';
import BirthdayBoard from './BirthdayBoard';
import TeamChat from './TeamChat';
import ReviewPanel from './ReviewPanel';
import TeamOverview from './TeamOverview';
import Payroll from './Payroll';
import SelfiesGallery from './SelfiesGallery';
import SettingsPanel from './SettingsPanel';
import SelfieModal from './SelfieModal';
import Toast from './Toast';

interface ToastMsg {
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function DashboardLayout() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workUpdates, setWorkUpdates] = useState<WorkUpdate[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selfies, setSelfies] = useState<Selfie[]>([]);
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [activeTab, setActiveTab] = useState('today');
  const [clock, setClock] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSelfieModal, setShowSelfieModal] = useState(false);
  const [selfieType, setSelfieType] = useState<'checkin' | 'checkout'>('checkin');
  const [toast, setToast] = useState<ToastMsg | null>(null);
  const [monthKey, setMonthKey] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const showToast = useCallback((message: string, type: ToastMsg['type'] = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  }, []);

  const fetchData = useCallback(async (user: User) => {
    const supabase = createClient();
    try {
      const [
        usersRes,
        recordsRes,
        leavesRes,
        tasksRes,
        workRes,
        expensesRes,
        docsRes,
        notifsRes,
        salariesRes,
        selfiesRes,
        profilesRes,
        chatRes,
        sessionsRes,
        birthdaysRes,
      ] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('attendance').select('*'),
        supabase.from('leaves').select('*'),
        supabase.from('tasks').select('*'),
        supabase.from('work_updates').select('*'),
        supabase.from('expenses').select('*'),
        supabase.from('documents').select('*'),
        supabase.from('notifications').select('*').eq('user_id', user.id).order('id', { ascending: false }),
        supabase.from('salary').select('*'),
        supabase.from('selfies').select('*').order('timestamp', { ascending: false }),
        supabase.from('profiles').select('*'),
        supabase.from('chat_messages').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('sessions').select('*'),
        supabase.from('birthdays').select('*'),
      ]);

      if (usersRes.data) setUsers(usersRes.data as User[]);
      if (recordsRes.data) setRecords(recordsRes.data as AttendanceRecord[]);
      if (leavesRes.data) setLeaves(leavesRes.data as Leave[]);
      if (tasksRes.data) setTasks(tasksRes.data as Task[]);
      if (workRes.data) setWorkUpdates(workRes.data as WorkUpdate[]);
      if (expensesRes.data) setExpenses(expensesRes.data as Expense[]);
      if (docsRes.data) setDocuments(docsRes.data as Document[]);
      if (notifsRes.data) setNotifications(notifsRes.data as Notification[]);
      if (salariesRes.data) setSalaries(salariesRes.data as Salary[]);
      if (selfiesRes.data) setSelfies(selfiesRes.data as Selfie[]);
      if (profilesRes.data) setProfiles(profilesRes.data as Profile[]);
      if (chatRes.data) setChatMessages(chatRes.data as ChatMessage[]);
      if (sessionsRes.data) setSessions(sessionsRes.data as Session[]);
      if (birthdaysRes.data) setBirthdays(birthdaysRes.data as Birthday[]);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('currentUser');
    if (!stored) {
      router.push('/');
      return;
    }
    const raw = JSON.parse(stored);
    const user: User = {
      id: raw.id,
      name: raw.name,
      email: raw.email,
      role: raw.role,
      password_hash: '',
      photo_url: getUserPhoto(raw.email),
    };
    setCurrentUser(user);
    fetchData(user);
  }, [router, fetchData]);

  useEffect(() => {
    const interval = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const today = todayKey();
  const todayRecords = records.filter((r) => r.date === today);
  const todayLeaves = leaves.filter((l) => l.date === today);
  const todayRecord = records.find(
    (r) => r.user_id === currentUser?.id && r.date === today
  );
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleCheckIn = () => {
    setSelfieType('checkin');
    setShowSelfieModal(true);
  };

  const handleCheckOut = () => {
    setSelfieType('checkout');
    setShowSelfieModal(true);
  };

  const handleSelfieConfirm = async (imageData: string, geo?: { lat: string; lng: string; address: string }) => {
    if (!currentUser) return;
    const supabase = createClient();
    const now = new Date();
    const timeStr = formatTime(now);

    const { error: selfieError } = await supabase.from('selfies').insert({
      user_id: currentUser.id,
      type: selfieType,
      image_url: imageData,
      timestamp: now.getTime(),
      date: today,
      time: timeStr,
      geo: geo || null,
    });
    if (selfieError) console.error('Selfie save error:', selfieError);

    if (selfieType === 'checkin') {
      const { error } = await supabase.from('attendance').upsert(
        { user_id: currentUser.id, date: today, check_in: timeStr, check_out: '', status: 'present', admin_marked: false },
        { onConflict: 'user_id,date' }
      );
      if (!error) {
        showToast('Checked In', 'success');
        fetchData(currentUser);
        const supabase2 = createClient();
        const { data: admins } = await supabase2.from('users').select('*').in('role', ['CEO', 'CTO']);
        if (admins) {
          for (const admin of admins) {
            await supabase2.from('notifications').insert({
              user_id: admin.id, type: 'employee_login', date: today,
              from_name: currentUser.name, from_role: currentUser.role,
              comment: `${currentUser.name} checked in at ${timeStr}`, read: false, time: timeStr,
            });
          }
        }
      }
    } else {
      if (todayRecord) {
        const { error } = await supabase
          .from('attendance')
          .update({ check_out: timeStr })
          .eq('id', todayRecord.id);
        if (!error) {
          showToast('Checked Out', 'success');
          fetchData(currentUser);
        }
      }
    }
  };

  const handleLogout = async () => {
    if (currentUser) {
      const supabase = createClient();
      const logoutTime = formatTime(new Date());
      if (todayRecord && todayRecord.check_in && !todayRecord.check_out) {
        await supabase.from('attendance').update({ check_out: logoutTime }).eq('id', todayRecord.id);
      }
      const { data: admins } = await supabase.from('users').select('*').in('role', ['CEO', 'CTO']);
      if (admins && currentUser.role !== 'CEO') {
        for (const admin of admins) {
          await supabase.from('notifications').insert({
            user_id: admin.id, type: 'employee_logout', date: today,
            from_name: currentUser.name, from_role: currentUser.role,
            comment: `${currentUser.name} logged out at ${logoutTime}`, read: false, time: logoutTime,
          });
        }
      }
      await supabase.from('sessions').update({ status: 'revoked' }).eq('user_id', currentUser.id).eq('status', 'active');
    }
    localStorage.removeItem('currentUser');
    router.push('/');
  };

  const handleMarkAllRead = async () => {
    if (!currentUser) return;
    const supabase = createClient();
    await supabase.from('notifications').update({ read: true }).eq('user_id', currentUser.id).eq('read', false);
    fetchData(currentUser);
  };

  const canSeeAll = currentUser?.role === 'CEO' || currentUser?.role === 'CTO';

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Image src="/images/logo.png" alt="Logo" width={36} height={36} className="rounded-full" />
              <h1 className="text-xl font-bold text-green-700">Next360</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span className="font-mono">{formatTime(clock)}</span>
              </div>
              <div className="relative">
                <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 text-gray-500 hover:text-green-600 transition-colors">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                      <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800">Notifications</h3>
                        <button onClick={handleMarkAllRead} className="text-xs text-green-600 hover:text-green-700">Mark all read</button>
                      </div>
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-400 text-sm">No notifications</div>
                      ) : (
                        notifications.slice(0, 20).map((n) => (
                          <div key={n.id} className={`p-3 border-b border-gray-50 ${!n.read ? 'bg-green-50 border-l-2 border-l-green-500' : ''}`}>
                            <p className="text-sm text-gray-700">{n.comment || n.type}</p>
                            <p className="text-xs text-gray-400 mt-1">{n.time} · {n.from_name}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Image src={getUserPhoto(currentUser.email)} alt={currentUser.name} width={32} height={32} className="rounded-full" />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-700">{currentUser.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleBadgeClass(currentUser.role)}`}>{currentUser.role}</span>
                </div>
              </div>
              <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Logout">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">{getGreeting()}, {currentUser.name.split(' ')[0]}!</h2>
              <p className="text-green-100 mt-1">{formatDateFull(clock)}</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-mono font-bold">{formatTime(clock)}</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs activeTab={activeTab} onTabChange={setActiveTab} userRole={currentUser.role} />

        <div className="mt-6">
          {activeTab === 'today' && (
            <div className="space-y-6">
              <StatsCards records={todayRecords} />
              <CheckInOut todayRecord={todayRecord} onCheckIn={handleCheckIn} onCheckOut={handleCheckOut} />
              <TodayAttendance users={users} records={todayRecords} leaves={todayLeaves} currentUser={currentUser} />
            </div>
          )}

          {activeTab === 'monthly' && (
            <MonthlyReport users={users} records={records} leaves={leaves} monthKey={monthKey} currentUser={currentUser} />
          )}

          {activeTab === 'leave' && (
            <LeaveManagement currentUser={currentUser} leaves={leaves} users={users} onSave={() => fetchData(currentUser)} />
          )}

          {activeTab === 'work' && (
            <WorkUpdates currentUser={currentUser} tasks={tasks} onSave={() => fetchData(currentUser)} />
          )}

          {activeTab === 'approvals' && (
            <Approvals currentUser={currentUser} leaves={leaves} expenses={expenses} documents={documents} users={users} onSave={() => fetchData(currentUser)} />
          )}

          {activeTab === 'profile' && (
            <ProfilePanel currentUser={currentUser} users={users} records={records} leaves={leaves} tasks={tasks} profiles={profiles} onSave={() => fetchData(currentUser)} />
          )}

          {activeTab === 'charts' && (
            <ProductivityCharts users={users} records={records} leaves={leaves} currentUser={currentUser} />
          )}

          {activeTab === 'birthdays' && (
            <BirthdayBoard users={users} birthdays={birthdays} />
          )}

          {activeTab === 'chat' && (
            <TeamChat currentUser={currentUser} users={users} messages={chatMessages} onSend={() => fetchData(currentUser)} />
          )}

          {activeTab === 'review' && canSeeAll && (
            <ReviewPanel currentUser={currentUser} tasks={tasks} workUpdates={workUpdates} users={users} onSave={() => fetchData(currentUser)} />
          )}

          {activeTab === 'team' && canSeeAll && (
            <TeamOverview users={users} records={records} leaves={leaves} onSave={() => fetchData(currentUser)} />
          )}

          {activeTab === 'payroll' && canSeeAll && (
            <Payroll users={users} records={records} leaves={leaves} salaries={salaries} onSave={() => fetchData(currentUser)} />
          )}

          {activeTab === 'selfies' && canSeeAll && (
            <SelfiesGallery selfies={selfies} users={users} />
          )}

          {activeTab === 'settings' && currentUser.role === 'CEO' && (
            <SettingsPanel currentUser={currentUser} users={users} profiles={profiles} salaries={salaries} birthdays={birthdays} sessions={sessions} onSave={() => fetchData(currentUser)} />
          )}
        </div>
      </main>

      <SelfieModal
        isOpen={showSelfieModal}
        type={selfieType}
        onConfirm={handleSelfieConfirm}
        onCancel={() => setShowSelfieModal(false)}
      />
    </div>
  );
}
