-- Customers
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  full_name text not null,
  phone text,
  email text,
  address text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.customers to authenticated;
grant all on public.customers to service_role;
alter table public.customers enable row level security;
create policy "Customers read own record" on public.customers for select to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "Customers insert own record" on public.customers for insert to authenticated
  with check (auth.uid() = user_id);
create policy "Customers update own record" on public.customers for update to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

-- Services
create table public.services (
  id uuid primary key default gen_random_uuid(),
  service_name text not null,
  description text not null default '',
  price numeric(10,2) not null default 0,
  image text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.services to anon;
grant select, insert, update, delete on public.services to authenticated;
grant all on public.services to service_role;
alter table public.services enable row level security;
create policy "Active services are publicly readable" on public.services for select to anon, authenticated
  using (active or public.has_role(auth.uid(), 'admin'));
create policy "Admins can insert services" on public.services for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins can update services" on public.services for update to authenticated
  using (public.has_role(auth.uid(), 'admin'));
create policy "Admins can delete services" on public.services for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Bookings
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  service text not null,
  booking_date date not null,
  booking_time time not null,
  status text not null default 'pending' check (status in ('pending','confirmed','rejected','completed','cancelled')),
  notes text,
  reference_photo text,
  created_at timestamptz not null default now()
);
create unique index bookings_no_double_booking on public.bookings (booking_date, booking_time)
  where status in ('pending','confirmed');
grant select, insert, update on public.bookings to authenticated;
grant all on public.bookings to service_role;
alter table public.bookings enable row level security;
create policy "Customers read own bookings" on public.bookings for select to authenticated
  using (exists (select 1 from public.customers c where c.id = customer_id and c.user_id = auth.uid()) or public.has_role(auth.uid(), 'admin'));
create policy "Customers create own bookings" on public.bookings for insert to authenticated
  with check (exists (select 1 from public.customers c where c.id = customer_id and c.user_id = auth.uid()));
create policy "Customers cancel own pending bookings" on public.bookings for update to authenticated
  using (exists (select 1 from public.customers c where c.id = customer_id and c.user_id = auth.uid()) or public.has_role(auth.uid(), 'admin'));

-- Orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  service text not null,
  amount numeric(10,2) not null default 0,
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  order_status text not null default 'new' check (order_status in ('new','in_progress','delivered','cancelled')),
  created_at timestamptz not null default now()
);
grant select, insert, update on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "Customers read own orders" on public.orders for select to authenticated
  using (exists (select 1 from public.customers c where c.id = customer_id and c.user_id = auth.uid()) or public.has_role(auth.uid(), 'admin'));
create policy "Admins can insert orders" on public.orders for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins can update orders" on public.orders for update to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Contact messages
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  message text not null,
  created_at timestamptz not null default now()
);
grant insert on public.contact_messages to anon;
grant select, insert on public.contact_messages to authenticated;
grant all on public.contact_messages to service_role;
alter table public.contact_messages enable row level security;
create policy "Anyone can send a message" on public.contact_messages for insert to anon, authenticated
  with check (true);
create policy "Admins can read messages" on public.contact_messages for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Assign the customer ('user') role to every new signup
create or replace function public.handle_new_user_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles(user_id, role) values (NEW.id, 'user') on conflict do nothing;
  return NEW;
end;
$$;
create trigger on_auth_user_created_role
  after insert on auth.users
  for each row execute function public.handle_new_user_role();

-- Storage policies: customer-uploads (own folder), service-images (admin write)
create policy "Customers upload to own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'customer-uploads' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Customers read own uploads" on storage.objects for select to authenticated
  using (bucket_id = 'customer-uploads' and ((storage.foldername(name))[1] = auth.uid()::text or public.has_role(auth.uid(), 'admin')));
create policy "Customers delete own uploads" on storage.objects for delete to authenticated
  using (bucket_id = 'customer-uploads' and ((storage.foldername(name))[1] = auth.uid()::text or public.has_role(auth.uid(), 'admin')));
create policy "Admins manage service images" on storage.objects for insert to authenticated
  with check (bucket_id = 'service-images' and public.has_role(auth.uid(), 'admin'));
create policy "Admins update service images" on storage.objects for update to authenticated
  using (bucket_id = 'service-images' and public.has_role(auth.uid(), 'admin'));
create policy "Admins delete service images" on storage.objects for delete to authenticated
  using (bucket_id = 'service-images' and public.has_role(auth.uid(), 'admin'));
create policy "Service images are readable" on storage.objects for select to authenticated
  using (bucket_id = 'service-images');