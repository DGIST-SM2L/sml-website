-- Cache free ipapi.co lookups so visitor logging does not call ipapi.co on every hit.
-- Run this once in the SML Supabase project.

create table if not exists public.ip_geo_cache (
  ip text not null,
  provider text not null default 'ipapi.co',
  geo jsonb not null,
  fetched_at timestamptz not null default now(),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (ip, provider)
);

create index if not exists ip_geo_cache_expires_at_idx
  on public.ip_geo_cache (expires_at);

alter table public.ip_geo_cache enable row level security;

-- No public policies are needed. The website API writes/reads this table with the
-- Supabase service-role key from server-side environment variables only.
