export function generateToken(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function generateSessionId(token: string): string {
  return `sess_${Date.now()}_${token.slice(0, 8)}`;
}

export function detectDevice() {
  if (typeof window === 'undefined') {
    return { type: 'laptop', os: 'Unknown', browser: 'Unknown', screen: '0x0', userAgent: '' };
  }
  const ua = navigator.userAgent;
  const isMobile =
    /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
    window.innerWidth < 768;

  let os = 'Other';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Mac OS/i.test(ua)) os = 'macOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  let browser = 'Other';
  if (/Chrome/i.test(ua) && !/Edge|OPR/i.test(ua)) browser = 'Chrome';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Edge/i.test(ua)) browser = 'Edge';
  else if (/OPR|Opera/i.test(ua)) browser = 'Opera';

  return {
    type: isMobile ? 'mobile' : 'laptop',
    os,
    browser,
    screen: `${window.screen.width}x${window.screen.height}`,
    userAgent: ua,
  };
}

export function todayKey(): string {
  const now = new Date();
  return (
    now.getFullYear() +
    '-' +
    String(now.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(now.getDate()).padStart(2, '0')
  );
}

export function formatTime(date: Date = new Date()): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export function formatDateTime(date: Date = new Date()): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatDateFull(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export async function hashPassword(pass: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pass);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer), (b) => b.toString(16).padStart(2, '0')).join('');
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function getUserPhoto(email: string): string {
  const photos: Record<string, string> = {
    'samhithreddy@gmail.com': '/images/ceo.png',
    'shivaganesh@gmail.com': '/images/logo.png',
    'soumya@gmail.com': '/images/soumya.png',
    'manaswini@gmail.com': '/images/manaswini.jpeg',
    'srinitha@gmail.com': '/images/srinitha.png',
    'ashwanth@gmail.com': '/images/ashwanth.png',
  };
  return photos[email] || '/images/logo.png';
}

export function getRoleBadgeClass(role: string): string {
  if (role === 'CEO') return 'bg-purple-100 text-purple-800';
  if (role === 'CTO') return 'bg-blue-100 text-blue-800';
  return 'bg-green-100 text-green-800';
}

export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return months[month - 1] || '';
}

export function getMonthsList(count: number = 6): { value: string; label: string }[] {
  const result: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = `${getMonthName(d.getMonth() + 1)} ${d.getFullYear()}`;
    result.push({ value, label });
  }
  return result;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function isWeekday(year: number, month: number, day: number): boolean {
  const d = new Date(year, month - 1, day);
  const dow = d.getDay();
  return dow !== 0 && dow !== 6;
}
