-- ============================================================
-- IN TIME REALTY — Security Hardening
-- ============================================================

-- CRIT-01: Prevent role escalation — trigger blocks any UPDATE that changes role
create or replace function prevent_role_change()
returns trigger language plpgsql security definer as $$
begin
  if new.role != old.role then
    raise exception 'role cannot be changed';
  end if;
  return new;
end;
$$;
drop trigger if exists no_role_change on profiles;
create trigger no_role_change
  before update on profiles
  for each row execute function prevent_role_change();

-- CRIT-02: Tenant lease signing was silently failing (no UPDATE policy existed)
create policy "Tenants can sign their own unsigned lease"
  on leases for update
  using (tenant_id = auth.uid() and signed_at is null)
  with check (tenant_id = auth.uid());

-- CRIT-04: reviews table with full RLS (idempotent — safe to run if table already exists)
create table if not exists reviews (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  unit_label   text,
  quote        text not null check (length(quote) >= 20 and length(quote) <= 400),
  rating       int  not null check (rating between 1 and 5),
  approved     boolean not null default false,
  created_at   timestamptz not null default now()
);
alter table reviews enable row level security;
drop policy if exists "Anyone can read approved reviews" on reviews;
create policy "Anyone can read approved reviews"
  on reviews for select using (approved = true);
drop policy if exists "Tenants can submit review" on reviews;
create policy "Tenants can submit review"
  on reviews for insert
  with check (tenant_id = auth.uid() and approved = false);
drop policy if exists "Admins can manage reviews" on reviews;
create policy "Admins can manage reviews"
  on reviews for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- HIGH-01: Prevent tenants from self-closing maintenance tickets via direct API call
drop policy if exists "Tenants can update own open tickets" on maintenance;
create policy "Tenants can update own open tickets"
  on maintenance for update
  using  (tenant_id = auth.uid() and status = 'open')
  with check (tenant_id = auth.uid() and status = 'open');

-- HIGH-02: Prevent message recipients from overwriting body/sender/thread
-- Trigger enforces immutability of fields RLS WITH CHECK can't compare (OLD vs NEW)
create or replace function prevent_message_tampering()
returns trigger language plpgsql security definer as $$
begin
  if new.body         != old.body         or
     new.sender_id    != old.sender_id    or
     new.recipient_id != old.recipient_id or
     new.thread_id    != old.thread_id    then
    raise exception 'Cannot modify message content or parties';
  end if;
  return new;
end;
$$;
drop trigger if exists message_immutable_fields on messages;
create trigger message_immutable_fields
  before update on messages
  for each row execute function prevent_message_tampering();

drop policy if exists "Recipients can mark as read" on messages;
create policy "Recipients can mark as read"
  on messages for update
  using  (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

-- MED-04: Tenant inbox was broken — tenants need to see admin profiles to start a thread
drop policy if exists "Users can read own profile" on profiles;
create policy "Users can read own profile or admin profiles"
  on profiles for select
  using (auth.uid() = id or role = 'admin');

-- MED-07: Announcement target must be 'all' or a valid UUID string
alter table announcements drop constraint if exists announcements_target_check;
alter table announcements
  add constraint announcements_target_check check (
    target = 'all'
    or target ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  );

-- HIGH-05: Prevent contact inquiry spam — one submission per email per day
create unique index if not exists contact_inquiries_email_day
  on contact_inquiries (lower(email), date_trunc('day', created_at at time zone 'utc'));

-- CRIT-03: Storage bucket RLS
-- !! MANUAL STEP REQUIRED !!
-- In Supabase dashboard → Storage → documents → toggle Public OFF
-- The policies below then control authenticated access:

drop policy if exists "Authenticated users can upload documents" on storage.objects;
create policy "Authenticated users can upload documents"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'documents');

drop policy if exists "Admins can read all documents" on storage.objects;
create policy "Admins can read all documents"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'documents'
    and exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "Tenants can read lease documents" on storage.objects;
create policy "Tenants can read lease documents"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = 'leases'
    and exists (
      select 1 from leases l
      where l.tenant_id = auth.uid()
      and   name like 'leases/' || l.id::text || '%'
    )
  );

drop policy if exists "Tenants can read maintenance photos" on storage.objects;
create policy "Tenants can read maintenance photos"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = 'maintenance'
    and exists (select 1 from profiles p where p.id = auth.uid())
  );
