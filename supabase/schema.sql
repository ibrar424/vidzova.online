-- ============================================================
-- Vidzova Supabase Database Schema (Users & Download History)
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Users Profile Table (synced with Google Sign-In / Supabase Auth)
create table if not exists public.users (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  name text,
  avatar_url text,
  last_sign_in timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- 2. Download History Table
create table if not exists public.download_history (
  id uuid default gen_random_uuid() primary key,
  user_email text,
  platform text not null,
  title text not null,
  source_url text not null,
  thumbnail text,
  format_label text,
  duration_str text,
  created_at timestamp with time zone default now()
);

-- 3. Enable Row Level Security (RLS) with public anon access for seamless frontend sync
alter table public.users enable row level security;
alter table public.download_history enable row level security;

drop policy if exists "Allow public read/write on users" on public.users;
create policy "Allow public read/write on users"
  on public.users for all
  using (true)
  with check (true);

drop policy if exists "Allow public read/write on download_history" on public.download_history;
create policy "Allow public read/write on download_history"
  on public.download_history for all
  using (true)
  with check (true);
