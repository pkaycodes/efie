-- Efie shared listings schema for Supabase.
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

create table if not exists public.listings (
  id text primary key,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  type text not null,
  price integer not null check (price > 0),
  period text not null check (period in ('month', 'night')),
  area text not null,
  city text not null,
  region text not null,
  landmark text not null default '',
  lat double precision,
  lng double precision,
  bedrooms integer not null default 1,
  bathrooms integer not null default 1,
  size_sqm integer not null default 1,
  furnishing text not null,
  amenities text[] not null default '{}',
  description text not null,
  photos text[] not null default '{}',
  landlord jsonb not null,
  featured boolean not null default false,
  verified boolean not null default false,
  available_now boolean not null default true,
  available_from text,
  deposit_months integer,
  utilities_included boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists listings_created_at_idx
  on public.listings (created_at desc);

create index if not exists listings_owner_id_idx
  on public.listings (owner_id);

create table if not exists public.saved_listings (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  listing_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

alter table public.listings enable row level security;
alter table public.saved_listings enable row level security;

drop policy if exists "Listings are readable by everyone" on public.listings;
create policy "Listings are readable by everyone"
  on public.listings for select
  using (true);

drop policy if exists "Signed-in visitors can post listings" on public.listings;
create policy "Signed-in visitors can post listings"
  on public.listings for insert
  to authenticated
  with check (owner_id = auth.uid());

drop policy if exists "Owners can update their listings" on public.listings;
create policy "Owners can update their listings"
  on public.listings for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "Owners can delete their listings" on public.listings;
create policy "Owners can delete their listings"
  on public.listings for delete
  to authenticated
  using (owner_id = auth.uid());

drop policy if exists "Visitors can read their saved rentals" on public.saved_listings;
create policy "Visitors can read their saved rentals"
  on public.saved_listings for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Visitors can save rentals" on public.saved_listings;
create policy "Visitors can save rentals"
  on public.saved_listings for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Visitors can remove saved rentals" on public.saved_listings;
create policy "Visitors can remove saved rentals"
  on public.saved_listings for delete
  to authenticated
  using (user_id = auth.uid());

-- When a landlord deletes a listing, clear it from every visitor's shortlist.
create or replace function public.remove_saved_for_listing()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.saved_listings where listing_id = old.id;
  return old;
end;
$$;

drop trigger if exists listings_remove_saved on public.listings;
create trigger listings_remove_saved
  after delete on public.listings
  for each row execute function public.remove_saved_for_listing();

-- Public photo bucket. Files are uploaded under a folder named after the
-- visitor's anonymous user id, so people can only replace their own photos.
insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "Listing photos are public" on storage.objects;
create policy "Listing photos are public"
  on storage.objects for select
  using (bucket_id = 'listing-photos');

drop policy if exists "Visitors can upload their own listing photos" on storage.objects;
create policy "Visitors can upload their own listing photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Visitors can delete their own listing photos" on storage.objects;
create policy "Visitors can delete their own listing photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
