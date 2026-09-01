-- Next360 Dashboard - Supabase Schema
-- Run this SQL in the Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  name text not null,
  role text not null default 'Employee' check (role in ('CEO', 'CTO', 'Employee')),
  password_hash text not null,
  photo_url text default '/images/logo.png',
  created_at timestamptz default now()
);

-- Profiles table
create table if not exists profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade unique,
  phone text default '',
  department text default '',
  designation text default '',
  joined_date text default ''
);

-- Attendance records
create table if not exists attendance (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  date text not null,
  check_in text default '',
  check_out text default '',
  status text default 'absent' check (status in ('present', 'absent')),
  admin_marked boolean default false,
  unique(user_id, date)
);

-- Leaves
create table if not exists leaves (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  date text not null,
  type text not null check (type in ('sick', 'casual')),
  reason text default '',
  marked_by text default '',
  approval_status text default 'pending' check (approval_status in ('pending', 'approved', 'rejected')),
  approval_comment text default '',
  approved_by text default '',
  approval_date text default ''
);

-- Tasks
create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  date text not null,
  tasks jsonb default '[]',
  reviewed boolean default false,
  review_comment text default '',
  reviewed_by text default '',
  unique(user_id, date)
);

-- Work updates (legacy)
create table if not exists work_updates (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  date text not null,
  content text default '',
  submitted boolean default false,
  reviewed boolean default false,
  comment text default '',
  reviewed_by text default ''
);

-- Notifications
create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  type text not null,
  date text default '',
  from_name text default '',
  from_role text default '',
  comment text default '',
  read boolean default false,
  time text default ''
);

-- Chat messages
create table if not exists chat_messages (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  text text default '',
  time text default '',
  type text default 'message' check (type in ('message', 'announcement')),
  file_name text default '',
  file_type text default '',
  file_url text default '',
  created_at timestamptz default now()
);

-- Expenses
create table if not exists expenses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  date text not null,
  amount numeric default 0,
  category text default 'Other',
  description text default '',
  approval_status text default 'pending' check (approval_status in ('pending', 'approved', 'rejected')),
  approval_comment text default '',
  approved_by text default '',
  approval_date text default ''
);

-- Documents
create table if not exists documents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  title text default '',
  type text default 'Other',
  description text default '',
  file_name text default '',
  file_type text default '',
  file_url text default '',
  approval_status text default 'pending' check (approval_status in ('pending', 'approved', 'rejected')),
  approval_comment text default '',
  approved_by text default '',
  approval_date text default ''
);

-- Selfies
create table if not exists selfies (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  type text not null check (type in ('login', 'logout', 'checkin', 'checkout')),
  image_url text default '',
  timestamp bigint default 0,
  date text default '',
  time text default '',
  geo jsonb
);

-- Salary
create table if not exists salary (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade unique,
  monthly_salary numeric default 0
);

-- Birthdays
create table if not exists birthdays (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade unique,
  month int default 1,
  day int default 1
);

-- Sessions
create table if not exists sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  session_id text not null,
  token text not null,
  device jsonb default '{}',
  login_time timestamptz default now(),
  last_active timestamptz default now(),
  status text default 'active' check (status in ('active', 'revoked'))
);

-- Create storage buckets
insert into storage.buckets (id, name, public) values ('selfies', 'selfies', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('chat-files', 'chat-files', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('documents', 'documents', true) on conflict do nothing;

-- RLS policies
alter table users enable row level security;
alter table profiles enable row level security;
alter table attendance enable row level security;
alter table leaves enable row level security;
alter table tasks enable row level security;
alter table work_updates enable row level security;
alter table notifications enable row level security;
alter table chat_messages enable row level security;
alter table expenses enable row level security;
alter table documents enable row level security;
alter table selfies enable row level security;
alter table salary enable row level security;
alter table birthdays enable row level security;
alter table sessions enable row level security;

-- Allow public read access for users (needed for login)
create policy "Allow public read users" on users for select using (true);
create policy "Allow authenticated insert users" on users for insert with check (true);
create policy "Allow authenticated update users" on users for update using (true);

-- Allow authenticated access to all tables
create policy "Authenticated full access" on profiles for all using (auth.role() = 'authenticated');
create policy "Authenticated full access" on attendance for all using (auth.role() = 'authenticated');
create policy "Authenticated full access" on leaves for all using (auth.role() = 'authenticated');
create policy "Authenticated full access" on tasks for all using (auth.role() = 'authenticated');
create policy "Authenticated full access" on work_updates for all using (auth.role() = 'authenticated');
create policy "Authenticated full access" on notifications for all using (auth.role() = 'authenticated');
create policy "Authenticated full access" on chat_messages for all using (auth.role() = 'authenticated');
create policy "Authenticated full access" on expenses for all using (auth.role() = 'authenticated');
create policy "Authenticated full access" on documents for all using (auth.role() = 'authenticated');
create policy "Authenticated full access" on selfies for all using (auth.role() = 'authenticated');
create policy "Authenticated full access" on salary for all using (auth.role() = 'authenticated');
create policy "Authenticated full access" on birthdays for all using (auth.role() = 'authenticated');
create policy "Authenticated full access" on sessions for all using (auth.role() = 'authenticated');

-- Allow anon access for login flow (before auth)
create policy "Anon read users" on users for select using (true);
create policy "Anon insert users" on users for insert with check (true);
create policy "Anon update users" on users for update using (true);
create policy "Anon full access" on profiles for all using (true);
create policy "Anon full access" on attendance for all using (true);
create policy "Anon full access" on leaves for all using (true);
create policy "Anon full access" on tasks for all using (true);
create policy "Anon full access" on work_updates for all using (true);
create policy "Anon full access" on notifications for all using (true);
create policy "Anon full access" on chat_messages for all using (true);
create policy "Anon full access" on expenses for all using (true);
create policy "Anon full access" on documents for all using (true);
create policy "Anon full access" on selfies for all using (true);
create policy "Anon full access" on salary for all using (true);
create policy "Anon full access" on birthdays for all using (true);
create policy "Anon full access" on sessions for all using (true);

-- Seed default users (password hashes will be set via the app)
-- Run the seed script after the app initializes
