export type UserRole = 'CEO' | 'CTO' | 'Employee';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  photo_url: string;
}

export interface Profile {
  id: string;
  user_id: string;
  phone: string;
  department: string;
  designation: string;
  joined_date: string;
}

export interface AttendanceRecord {
  id: string;
  user_id: string;
  date: string;
  check_in: string;
  check_out: string;
  status: 'present' | 'absent';
  admin_marked: boolean;
}

export interface Leave {
  id: string;
  user_id: string;
  date: string;
  type: 'sick' | 'casual';
  reason: string;
  marked_by: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  approval_comment: string;
  approved_by: string;
  approval_date: string;
}

export interface TaskItem {
  title: string;
  planned: string;
  completed: string;
  blockers: string;
  status: 'completed' | 'partial' | 'not-started' | 'blocked';
}

export interface Task {
  id: string;
  user_id: string;
  date: string;
  tasks: TaskItem[];
  reviewed: boolean;
  review_comment: string;
  reviewed_by: string;
}

export interface WorkUpdate {
  id: string;
  user_id: string;
  date: string;
  content: string;
  submitted: boolean;
  reviewed: boolean;
  comment: string;
  reviewed_by: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  date: string;
  from_name: string;
  from_role: string;
  comment: string;
  read: boolean;
  time: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  text: string;
  time: string;
  type: 'message' | 'announcement';
  file_name?: string;
  file_type?: string;
  file_url?: string;
}

export interface Expense {
  id: string;
  user_id: string;
  date: string;
  amount: number;
  category: 'Travel' | 'Food' | 'Office Supplies' | 'Communication' | 'Other';
  description: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  approval_comment: string;
  approved_by: string;
  approval_date: string;
}

export interface Document {
  id: string;
  user_id: string;
  title: string;
  type: 'Report' | 'Proposal' | 'Invoice' | 'Letter' | 'Other';
  description: string;
  file_name?: string;
  file_type?: string;
  file_url?: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  approval_comment: string;
  approved_by: string;
  approval_date: string;
}

export interface Selfie {
  id: string;
  user_id: string;
  type: 'login' | 'logout' | 'checkin' | 'checkout';
  image_url: string;
  timestamp: number;
  date: string;
  time: string;
  geo?: { lat: string; lng: string; address: string };
}

export interface Salary {
  id: string;
  user_id: string;
  monthly_salary: number;
}

export interface Birthday {
  id: string;
  user_id: string;
  month: number;
  day: number;
}

export interface Session {
  id: string;
  user_id: string;
  session_id: string;
  token: string;
  device: {
    type: string;
    os: string;
    browser: string;
    screen: string;
    userAgent: string;
  };
  login_time: string;
  last_active: string;
  status: 'active' | 'revoked';
}

export interface DeviceInfo {
  type: string;
  os: string;
  browser: string;
  screen: string;
  userAgent: string;
}
