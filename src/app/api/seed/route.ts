import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { DEFAULT_USERS, BIRTHDAYS_MAP } from '@/lib/default-users';

async function hashPasswordServer(pass: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pass);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer), (b) =>
    b.toString(16).padStart(2, '0')
  ).join('');
}

const PROFILES: Record<string, { phone: string; department: string; designation: string; joined_date: string }> = {
  'samhithreddy@gmail.com': { phone: '8008253003', department: 'Management', designation: 'CEO', joined_date: '22 June' },
  'shivaganesh@gmail.com': { phone: '9515054926', department: 'Engineering', designation: 'CTO', joined_date: '22 June' },
  'soumya@gmail.com': { phone: '9133585827', department: 'Engineering', designation: 'Developer', joined_date: '22 June' },
  'manaswini@gmail.com': { phone: '9550697355', department: 'Design', designation: 'Designer', joined_date: '22 June' },
  'ashwanth@gmail.com': { phone: '8328644994', department: 'Engineering', designation: 'Developer', joined_date: '22 June' },
  'srinitha@gmail.com': { phone: '9515921471', department: 'HR', designation: 'HR Executive', joined_date: '22 June' },
};

const SALARIES: Record<string, number> = {
  'samhithreddy@gmail.com': 150000,
  'shivaganesh@gmail.com': 120000,
  'soumya@gmail.com': 60000,
  'manaswini@gmail.com': 55000,
  'harshitha@gmail.com': 50000,
  'ashwanth@gmail.com': 55000,
  'srinitha@gmail.com': 50000,
};

export async function GET() {
  try {
    const supabase = await createServerSupabase();

    const { data: existingUsers } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json({
        message: 'Users already seeded',
        count: existingUsers.length,
      });
    }

    const usersToInsert = await Promise.all(
      DEFAULT_USERS.map(async (u) => ({
        id: crypto.randomUUID(),
        name: u.name,
        email: u.email,
        password_hash: await hashPasswordServer(u.password),
        role: u.role,
        photo_url: `/images/${u.name.toLowerCase().replace(/\s+/g, '')}.png`,
      }))
    );

    const { error: usersError } = await supabase.from('users').insert(usersToInsert);
    if (usersError) {
      return NextResponse.json(
        { error: 'Failed to insert users: ' + usersError.message },
        { status: 500 }
      );
    }

    const profilesToInsert = usersToInsert.map((u) => ({
      id: crypto.randomUUID(),
      user_id: u.id,
      phone: PROFILES[u.email]?.phone || '',
      department: PROFILES[u.email]?.department || 'General',
      designation: PROFILES[u.email]?.designation || 'Employee',
      joined_date: PROFILES[u.email]?.joined_date || '2023-01-01',
    }));

    await supabase.from('profiles').insert(profilesToInsert);

    const salariesToInsert = usersToInsert.map((u) => ({
      id: crypto.randomUUID(),
      user_id: u.id,
      monthly_salary: SALARIES[u.email] || 50000,
    }));

    await supabase.from('salary').insert(salariesToInsert);

    const birthdaysToInsert = usersToInsert
      .map((u) => {
        const bd = BIRTHDAYS_MAP[u.name];
        if (!bd) return null;
        return {
          id: crypto.randomUUID(),
          user_id: u.id,
          month: bd.month,
          day: bd.day,
        };
      })
      .filter((b): b is { id: string; user_id: string; month: number; day: number } => b !== null);

    if (birthdaysToInsert.length > 0) {
      await supabase.from('birthdays').insert(birthdaysToInsert);
    }

    return NextResponse.json({
      message: 'Seed completed successfully',
      count: usersToInsert.length,
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
