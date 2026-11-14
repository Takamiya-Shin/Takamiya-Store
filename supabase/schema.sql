-- Takamiya Store — Skema Pelengkap Supabase (profiles, orders, payment_settings)
-- Tabel 'products' Anda (50 produk dengan kolom id, name, price, category, image_url) sudah ada
-- dan dibaca otomatis oleh website. Jalankan skrip ini di SQL Editor Supabase untuk melengkapi
-- tabel 'profiles', 'orders', dan 'payment_settings'.

create extension if not exists "pgcrypto";

-- Pastikan RLS aktif & publik dapat membaca tabel products Anda yang sudah ada
alter table if exists public.products enable row level security;

drop policy if exists "Publik dapat membaca katalog produk" on public.products;
create policy "Publik dapat membaca katalog produk"
  on public.products for select
  using (true);

-- 1. Tabel Profiles (Sinkron dengan auth.users Supabase)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "User melihat profil sendiri" on public.profiles;
create policy "User melihat profil sendiri"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "User memperbarui nama profil sendiri" on public.profiles;
create policy "User memperbarui nama profil sendiri"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

drop policy if exists "User mendaftarkan profil sendiri" on public.profiles;
create policy "User mendaftarkan profil sendiri"
  on public.profiles for insert
  with check (auth.uid() = id and role = 'user');

drop policy if exists "Admin melihat seluruh profil" on public.profiles;
create policy "Admin melihat seluruh profil"
  on public.profiles for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Trigger otomatis membuat profil saat user baru mendaftar lewat Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    lower(new.email),
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Tabel Orders (Terhubung ke tabel profiles & tabel products Anda)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  invoice_code text not null unique,
  user_id uuid not null references public.profiles(id) on delete restrict,
  game_id text not null,
  game_name text not null,
  product_id bigint not null references public.products(id),
  product_name text not null,
  price integer not null check (price > 0),
  target_account_id text not null,
  target_server_id text,
  target_nickname text not null,
  payment_method text not null check (payment_method in ('DANA', 'QRIS')),
  status text not null default 'Pending' check (status in ('Pending', 'Sukses', 'Gagal')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;

drop policy if exists "User melihat riwayat transaksi sendiri" on public.orders;
create policy "User melihat riwayat transaksi sendiri"
  on public.orders for select
  using (auth.uid() = user_id);

drop policy if exists "User membuat pesanan untuk akun sendiri" on public.orders;
create policy "User membuat pesanan untuk akun sendiri"
  on public.orders for insert
  with check (auth.uid() = user_id and status = 'Pending');

drop policy if exists "Admin mengelola seluruh pesanan" on public.orders;
create policy "Admin mengelola seluruh pesanan"
  on public.orders for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- 3. Tabel Pengaturan Pembayaran (DANA & QRIS)
create table if not exists public.payment_settings (
  id integer primary key default 1 check (id = 1),
  dana_number text not null,
  dana_holder text not null,
  qris_merchant_name text not null,
  qris_nmid text not null,
  qris_image_url text,
  updated_at timestamptz not null default now()
);

alter table public.payment_settings enable row level security;

drop policy if exists "Publik membaca pengaturan pembayaran" on public.payment_settings;
create policy "Publik membaca pengaturan pembayaran"
  on public.payment_settings for select
  using (true);

drop policy if exists "Hanya Admin mengubah pengaturan pembayaran" on public.payment_settings;
create policy "Hanya Admin mengubah pengaturan pembayaran"
  on public.payment_settings for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

insert into public.payment_settings (id, dana_number, dana_holder, qris_merchant_name, qris_nmid, qris_image_url)
values (1, '0857-9912-4480', 'Takamiya Store ID', 'TAKAMIYA STORE', 'ID1020261113880', null)
on conflict (id) do nothing;
