-- Central TechX - sistema de pedidos
-- Cole este arquivo no SQL Editor do Supabase.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text unique not null,
  customer_id uuid not null references auth.users(id) on delete cascade,
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  product_id text not null,
  product_name text not null,
  product_price numeric(12,2) not null,
  status text not null default 'preparo'
    check (status in ('preparo', 'caminho', 'entregue')),
  payment_status text not null default 'pendente'
    check (payment_status in ('pendente', 'pago')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.generate_order_code()
returns trigger
language plpgsql
as $$
begin
  if new.order_code is null or new.order_code = '' then
    new.order_code :=
      'CTX-' || to_char(now(), 'YYYY') || '-' ||
      upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  end if;
  return new;
end;
$$;

drop trigger if exists set_order_code on public.orders;
create trigger set_order_code
before insert on public.orders
for each row execute function public.generate_order_code();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.orders enable row level security;

drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read"
on public.profiles for select
to authenticated
using (id = auth.uid());

drop policy if exists "customers read own orders" on public.orders;
create policy "customers read own orders"
on public.orders for select
to authenticated
using (customer_id = auth.uid() or public.is_admin());

drop policy if exists "customers create own orders" on public.orders;
create policy "customers create own orders"
on public.orders for insert
to authenticated
with check (customer_id = auth.uid());

drop policy if exists "admins update orders" on public.orders;
create policy "admins update orders"
on public.orders for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins delete orders" on public.orders;
create policy "admins delete orders"
on public.orders for delete
to authenticated
using (public.is_admin());

-- Depois de criar sua conta de administrador no Authentication > Users,
-- substitua o UUID abaixo e execute:
-- insert into public.profiles (id, role)
-- values ('SEU-UUID-AQUI', 'admin')
-- on conflict (id) do update set role = 'admin';

-- IMPORTANTE:
-- No Supabase, Authentication > Providers, habilite Anonymous Sign-Ins
-- para que clientes possam criar pedidos sem precisar criar conta.
