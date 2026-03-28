-- ============================================
-- Reflectify: Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- 1. Activities table
create table if not exists public.activities (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  date text not null, -- YYYY-MM-DD format
  created_at timestamptz default now() not null
);

-- 2. Journal entries table
create table if not exists public.journal_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  category text not null check (category in ('Mindset', 'Emosi', 'Spiritual', 'Sosial', 'Skill')),
  created_at timestamptz default now() not null
);

-- 3. Daily ratings table
create table if not exists public.daily_ratings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date text not null, -- YYYY-MM-DD format
  mood integer not null check (mood >= 1 and mood <= 5),
  focus integer not null check (focus >= 1 and focus <= 5),
  unique (user_id, date)
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS on all tables
alter table public.activities enable row level security;
alter table public.journal_entries enable row level security;
alter table public.daily_ratings enable row level security;

-- Activities: users can only access their own rows
create policy "Users can view own activities"
  on public.activities for select
  using (auth.uid() = user_id);

create policy "Users can insert own activities"
  on public.activities for insert
  with check (auth.uid() = user_id);

create policy "Users can update own activities"
  on public.activities for update
  using (auth.uid() = user_id);

create policy "Users can delete own activities"
  on public.activities for delete
  using (auth.uid() = user_id);

-- Journal entries: users can only access their own rows
create policy "Users can view own journal entries"
  on public.journal_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert own journal entries"
  on public.journal_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update own journal entries"
  on public.journal_entries for update
  using (auth.uid() = user_id);

create policy "Users can delete own journal entries"
  on public.journal_entries for delete
  using (auth.uid() = user_id);

-- Daily ratings: users can only access their own rows
create policy "Users can view own daily ratings"
  on public.daily_ratings for select
  using (auth.uid() = user_id);

create policy "Users can insert own daily ratings"
  on public.daily_ratings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own daily ratings"
  on public.daily_ratings for update
  using (auth.uid() = user_id);

create policy "Users can delete own daily ratings"
  on public.daily_ratings for delete
  using (auth.uid() = user_id);

-- ============================================
-- Indexes for performance
-- ============================================

create index if not exists idx_activities_user_date on public.activities(user_id, date);
create index if not exists idx_journal_entries_user on public.journal_entries(user_id, created_at desc);
create index if not exists idx_daily_ratings_user_date on public.daily_ratings(user_id, date);

-- ============================================
-- Enable Realtime for activities table
-- ============================================
alter publication supabase_realtime add table public.activities;
alter publication supabase_realtime add table public.journal_entries;
