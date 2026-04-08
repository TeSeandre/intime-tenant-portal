-- ============================================================
-- IN TIME REALTY — Initial Schema
-- Run: npx supabase db push
-- ============================================================

-- ── profiles (extends Supabase auth.users) ──────────────────
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null check (role in ('tenant', 'admin')),
  tenant_id   uuid,
  full_name   text,
  phone       text,
  created_at  timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Admins can read all profiles"
  on profiles for select
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ── units ────────────────────────────────────────────────────
create table if not exists units (
  id           uuid primary key default gen_random_uuid(),
  address      text not null,
  unit_number  text,
  bedrooms     int,
  bathrooms    numeric(3,1),
  rent_amount  numeric(10,2) not null,
  status       text not null default 'vacant' check (status in ('occupied','vacant','maintenance')),
  created_at   timestamptz not null default now()
);

alter table units enable row level security;

create policy "Tenants can read their own unit"
  on units for select
  using (
    exists (
      select 1 from tenants t
      where t.unit_id = units.id and t.id = auth.uid()
    )
  );

create policy "Admins have full access to units"
  on units for all
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ── tenants ──────────────────────────────────────────────────
create table if not exists tenants (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  email       text not null,
  phone       text,
  unit_id     uuid references units(id),
  lease_id    uuid,
  created_at  timestamptz not null default now()
);

alter table tenants enable row level security;

create policy "Tenants can read their own record"
  on tenants for select
  using (auth.uid() = id);

create policy "Tenants can update their own record"
  on tenants for update
  using (auth.uid() = id);

create policy "Admins have full access to tenants"
  on tenants for all
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ── leases ───────────────────────────────────────────────────
create table if not exists leases (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references tenants(id) on delete cascade,
  unit_id          uuid not null references units(id),
  start_date       date not null,
  end_date         date not null,
  pdf_url          text,
  signed_at        timestamptz,
  signature_data   text,
  created_at       timestamptz not null default now(),
  created_by       uuid references auth.users(id)
);

alter table leases enable row level security;

create policy "Tenants can read own lease"
  on leases for select
  using (tenant_id = auth.uid());

create policy "Admins have full access to leases"
  on leases for all
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ── payments ─────────────────────────────────────────────────
create table if not exists payments (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references tenants(id) on delete cascade,
  amount        numeric(10,2) not null,
  due_date      date,
  paid_date     date,
  method        text default 'zelle',
  status        text not null default 'pending'
                  check (status in ('pending','confirmed','late','rejected')),
  reference_note text,
  confirmed_by  uuid references auth.users(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table payments enable row level security;

create policy "Tenants can read own payments"
  on payments for select
  using (tenant_id = auth.uid());

create policy "Tenants can insert own payments"
  on payments for insert
  with check (tenant_id = auth.uid());

create policy "Admins have full access to payments"
  on payments for all
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ── charges ──────────────────────────────────────────────────
create table if not exists charges (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  type        text not null check (type in ('rent','late_fee','deposit','other')),
  amount      numeric(10,2) not null,
  date        date not null default current_date,
  notes       text,
  created_by  uuid references auth.users(id),
  created_at  timestamptz not null default now()
);

alter table charges enable row level security;

create policy "Tenants can read own charges"
  on charges for select
  using (tenant_id = auth.uid());

create policy "Admins have full access to charges"
  on charges for all
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ── maintenance ──────────────────────────────────────────────
create table if not exists maintenance (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references tenants(id) on delete cascade,
  unit_id      uuid not null references units(id),
  category     text not null check (
                 category in ('Plumbing','Electrical','HVAC','Appliance','Structural','Pest','Other')
               ),
  description  text not null,
  priority     text not null default 'Medium'
                 check (priority in ('Low','Medium','High','Emergency')),
  status       text not null default 'open'
                 check (status in ('open','in_progress','resolved','closed')),
  photo_urls   text[] default '{}',
  created_at   timestamptz not null default now(),
  resolved_at  timestamptz,
  updated_by   uuid references auth.users(id)
);

alter table maintenance enable row level security;

create policy "Tenants can read own tickets"
  on maintenance for select
  using (tenant_id = auth.uid());

create policy "Tenants can insert own tickets"
  on maintenance for insert
  with check (tenant_id = auth.uid());

create policy "Tenants can update own open tickets"
  on maintenance for update
  using (tenant_id = auth.uid() and status not in ('resolved','closed'));

create policy "Admins have full access to maintenance"
  on maintenance for all
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ── messages ─────────────────────────────────────────────────
create table if not exists messages (
  id           uuid primary key default gen_random_uuid(),
  sender_id    uuid not null references auth.users(id),
  recipient_id uuid not null references auth.users(id),
  thread_id    uuid not null,
  body         text not null,
  attachment_url text,
  read_at      timestamptz,
  created_at   timestamptz not null default now()
);

alter table messages enable row level security;

create policy "Users can read messages in their threads"
  on messages for select
  using (sender_id = auth.uid() or recipient_id = auth.uid());

create policy "Users can send messages"
  on messages for insert
  with check (sender_id = auth.uid());

create policy "Recipients can mark as read"
  on messages for update
  using (recipient_id = auth.uid());

-- ── announcements ────────────────────────────────────────────
create table if not exists announcements (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  body        text not null,
  target      text not null default 'all',
  created_by  uuid not null references auth.users(id),
  created_at  timestamptz not null default now()
);

alter table announcements enable row level security;

create policy "Tenants can read announcements for their unit or all"
  on announcements for select
  using (
    target = 'all'
    or target = (
      select t.unit_id::text from tenants t where t.id = auth.uid()
    )
    or exists (
      select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Admins can manage announcements"
  on announcements for all
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ── realtime ─────────────────────────────────────────────────
-- Enable realtime for messages and maintenance
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table maintenance;
alter publication supabase_realtime add table payments;
