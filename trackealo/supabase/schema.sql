-- ═══════════════════════════════════════════
-- ExpenseTracker — Supabase Schema
-- ═══════════════════════════════════════════

-- 1. User Settings (categorías, cotización USD)
create table if not exists user_settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  categories jsonb default '["Comida","Transporte","Entretenimiento","Salud","Educación","Ropa","Gimnasio","Servicios","Alquiler","Otros"]'::jsonb,
  budgets jsonb default '{}'::jsonb,
  usd_rate numeric default 1200,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Transactions
create table if not exists transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('expense', 'income')),
  description text not null,
  amount numeric not null,
  currency text not null default 'ARS' check (currency in ('ARS', 'USD')),
  category text not null default 'Otros',
  date date not null,
  created_at timestamptz default now()
);

-- 3. Installments
create table if not exists installments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  description text not null,
  total_amount numeric not null,
  total integer not null,
  monthly numeric not null,
  currency text not null default 'ARS' check (currency in ('ARS', 'USD')),
  category text not null default 'Otros',
  start_date date not null,
  created_at timestamptz default now()
);

-- 4. Goals
create table if not exists goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  emoji text default '🎯',
  target_amount numeric not null,
  current_amount numeric default 0,
  currency text not null default 'ARS' check (currency in ('ARS', 'USD')),
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════
-- Row Level Security (RLS)
-- Cada usuario solo ve sus propios datos
-- ═══════════════════════════════════════════

alter table user_settings enable row level security;
alter table transactions enable row level security;
alter table installments enable row level security;
alter table goals enable row level security;

-- User Settings policies
create policy "Users can view own settings"
  on user_settings for select using (auth.uid() = user_id);
create policy "Users can insert own settings"
  on user_settings for insert with check (auth.uid() = user_id);
create policy "Users can update own settings"
  on user_settings for update using (auth.uid() = user_id);

-- Transactions policies
create policy "Users can view own transactions"
  on transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions"
  on transactions for insert with check (auth.uid() = user_id);
create policy "Users can update own transactions"
  on transactions for update using (auth.uid() = user_id);
create policy "Users can delete own transactions"
  on transactions for delete using (auth.uid() = user_id);

-- Installments policies
create policy "Users can view own installments"
  on installments for select using (auth.uid() = user_id);
create policy "Users can insert own installments"
  on installments for insert with check (auth.uid() = user_id);
create policy "Users can update own installments"
  on installments for update using (auth.uid() = user_id);
create policy "Users can delete own installments"
  on installments for delete using (auth.uid() = user_id);

-- Goals policies
create policy "Users can view own goals"
  on goals for select using (auth.uid() = user_id);
create policy "Users can insert own goals"
  on goals for insert with check (auth.uid() = user_id);
create policy "Users can update own goals"
  on goals for update using (auth.uid() = user_id);
create policy "Users can delete own goals"
  on goals for delete using (auth.uid() = user_id);

-- ═══════════════════════════════════════════
-- Function: auto-create user_settings on signup
-- ═══════════════════════════════════════════

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_settings (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ═══════════════════════════════════════════
-- Indexes for performance
-- ═══════════════════════════════════════════

create index if not exists idx_transactions_user_id on transactions(user_id);
create index if not exists idx_transactions_date on transactions(user_id, date);
create index if not exists idx_installments_user_id on installments(user_id);
create index if not exists idx_goals_user_id on goals(user_id);
