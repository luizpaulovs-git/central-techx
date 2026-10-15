-- Central TechX: tabela do catálogo de produtos.
-- Execute este script no Supabase > SQL Editor, usando o projeto correto.

create table if not exists public.products (
  id text primary key,
  name text not null,
  category text not null default 'COMPUTADOR',
  description text not null default '',
  processor text not null default 'Não informado',
  gpu text not null default 'Não informado',
  ram text not null default 'Não informado',
  storage text not null default 'Não informado',
  price numeric(12,2) not null default 0 check (price >= 0),
  image text not null default 'pcs/techx-start.png',
  stock boolean not null default false,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;

-- A função verifica a função do utilizador sem expor a tabela de perfis ao público.
create or replace function public.centraltechx_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.centraltechx_is_admin() from public;
grant execute on function public.centraltechx_is_admin() to authenticated;

drop policy if exists "Products are publicly readable" on public.products;
create policy "Products are publicly readable"
  on public.products for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
  on public.products for insert
  to authenticated
  with check (public.centraltechx_is_admin());

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
  on public.products for update
  to authenticated
  using (public.centraltechx_is_admin())
  with check (public.centraltechx_is_admin());

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
  on public.products for delete
  to authenticated
  using (public.centraltechx_is_admin());

-- Cadastro inicial dos quatro PCs atuais. Não sobrescreve edições já feitas.
insert into public.products
  (id, name, category, description, processor, gpu, ram, storage, price, image, stock, featured)
values
  ('techx-start', 'PC Start', 'PC DE ENTRADA', 'Ideal para estudos, trabalho e uso diário.', 'Intel I5 3470', 'Intel HD Graphics 2500', '8GB DDR3', 'SSD 120GB', 799.90, 'pcs/techx-start.png', false, false),
  ('techx-gamer', 'PC Médio', 'PC INTERMEDIÁRIO', 'Performance e custo-benefício para seus jogos.', 'Ryzen 5 2600', 'RX 550 4GB', '16GB DDR4', 'SSD 480GB', 1999.90, 'pcs/techx-gamer.png', false, false),
  ('techx-pro', 'PC Pro', 'PC GAMER', 'Alto desempenho para jogos e criação de conteúdo.', 'Ryzen 5 5600', 'RTX 3050 6GB', '16GB DDR4', 'SSD NVMe 256GB', 3199.90, 'pcs/techx-pro.png', false, false),
  ('techx-extreme', 'PC Extreme', 'ALTO DESEMPENHO', 'Para quem exige o máximo de desempenho.', 'Ryzen 7 7700', 'RTX 4060 8GB', '32GB DDR5', 'SSD NVMe 512GB', 5499.90, 'pcs/techx-extreme.png', false, false)
on conflict (id) do nothing;
