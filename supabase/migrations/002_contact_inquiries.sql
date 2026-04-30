-- Contact inquiries from prospective tenants (landing page CTA form)
create table if not exists contact_inquiries (
  id          uuid primary key default gen_random_uuid(),
  name        text,
  email       text not null,
  created_at  timestamptz not null default now()
);

alter table contact_inquiries enable row level security;

-- Anyone (including anonymous) can submit an inquiry
create policy "Anyone can submit contact inquiry"
  on contact_inquiries for insert
  with check (true);

-- Only admins can read inquiries
create policy "Admins can read all inquiries"
  on contact_inquiries for select
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
