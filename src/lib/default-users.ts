import { hashPassword } from './utils';

export interface DefaultUser {
  name: string;
  email: string;
  password: string;
  role: 'CEO' | 'CTO' | 'Employee';
}

export const DEFAULT_USERS: DefaultUser[] = [
  { name: 'Samhith Reddy', email: 'samhithreddy@gmail.com', password: 'samhith101', role: 'CEO' },
  { name: 'Shivaganesh', email: 'shivaganesh@gmail.com', password: 'shiva102', role: 'CTO' },
  { name: 'Soumya', email: 'soumya@gmail.com', password: 'soumya103', role: 'Employee' },
  { name: 'Manaswini', email: 'manaswini@gmail.com', password: 'manaswini104', role: 'Employee' },
  { name: 'Ashwanth', email: 'ashwanth@gmail.com', password: 'ashwanth105', role: 'Employee' },
  { name: 'Srinitha', email: 'srinitha@gmail.com', password: 'srinitha106', role: 'Employee' },
];

export const BIRTHDAYS_MAP: Record<string, { month: number; day: number }> = {
  'Samhith Reddy': { month: 6, day: 12 },
  'Shivaganesh': { month: 3, day: 22 },
  'Soumya': { month: 2, day: 7 },
  'Manaswini': { month: 1, day: 24 },
  'Ashwanth': { month: 5, day: 18 },
  'Srinitha': { month: 10, day: 6 },
};

export async function getDefaultUsersWithHashes() {
  return Promise.all(
    DEFAULT_USERS.map(async (u) => ({
      ...u,
      password_hash: await hashPassword(u.password),
    }))
  );
}
