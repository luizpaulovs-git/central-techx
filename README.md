# Central TechX

Site em React + TypeScript + Vite.

## Sistema de pedidos

A primeira versão do sistema inclui:

- aba **Pedidos** para o cliente;
- criação de pedido ao finalizar a compra de um PC;
- status inicial **Pedido em preparo**;
- acompanhamento **Pedido em preparo → A caminho → Entregue**;
- pagamento marcado como **Pendente — na entrega**;
- painel **Admin** com login;
- alteração de status e pagamento somente por administradores;
- Supabase para autenticação e banco de dados.

## Configuração local

1. Instale o Node.js.
2. No terminal do VS Code, rode:

```bash
npm install
```

3. Crie um projeto no Supabase.
4. No SQL Editor do Supabase, execute `supabase/schema.sql`.
5. Em Authentication, habilite **Anonymous Sign-Ins**.
6. Crie uma conta de administrador em Authentication > Users.
7. Pegue o UUID dessa conta e execute no SQL Editor:

```sql
insert into public.profiles (id, role)
values ('SEU-UUID-AQUI', 'admin')
on conflict (id) do update set role = 'admin';
```

8. Copie `.env.example` para `.env.local` e preencha:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON
```

9. Rode:

```bash
npm run dev
```

## GitHub Pages

O frontend continua sendo um projeto Vite hospedado no GitHub Pages. O Supabase fica responsável somente pelos dados, autenticação e pedidos.

**Nunca coloque a chave `service_role` do Supabase no frontend.** O site deve usar apenas a chave pública `anon`.
