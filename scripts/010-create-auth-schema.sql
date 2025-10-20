-- Create user profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- User preferences
  radius_miles integer default 25,
  home_zip text,
  age_focus text check (age_focus in ('toddler', 'child', 'teen', 'adult', 'all')),
  
  -- Favorites (array of event/venue IDs)
  favorites text[] default array[]::text[]
);

-- Enable RLS
alter table public.profiles enable row level security;

-- RLS Policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can delete their own profile"
  on public.profiles for delete
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, radius_miles, home_zip, age_focus)
  values (
    new.id,
    new.email,
    coalesce((new.raw_user_meta_data ->> 'radius_miles')::integer, 25),
    coalesce(new.raw_user_meta_data ->> 'home_zip', null),
    coalesce(new.raw_user_meta_data ->> 'age_focus', 'all')
  )
  on conflict (id) do nothing;
  
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Create indexes for performance
create index if not exists profiles_email_idx on public.profiles(email);
create index if not exists profiles_favorites_idx on public.profiles using gin(favorites);
