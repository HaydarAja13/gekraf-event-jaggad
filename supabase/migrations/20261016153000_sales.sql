create table public.payment_accounts (
  id bigint generated always as identity primary key,
  bank_name text not null,
  account_name text not null,
  account_number text not null,
  created_at timestamptz not null default now()
);

create table public.orders (
  id bigint generated always as identity primary key,
  full_name text not null,
  email text not null,
  whatsapp text not null,
  institution text not null,
  job_title text not null,
  address text not null,
  plan_name text not null,
  amount text not null,
  payment_account_id bigint not null references public.payment_accounts (id),
  proof_path text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  ticket_no text unique,
  created_at timestamptz not null default now()
);

create index orders_plan_status_idx on public.orders (plan_name, status);

alter table public.payment_accounts enable row level security;
alter table public.orders enable row level security;

revoke all on public.payment_accounts from anon, authenticated;
revoke all on public.orders from anon, authenticated;

grant select, insert, update, delete on public.payment_accounts to service_role;
grant select, insert, update, delete on public.orders to service_role;
grant usage, select on sequence public.payment_accounts_id_seq to service_role;
grant usage, select on sequence public.orders_id_seq to service_role;

create function public.place_order(
  full_name text,
  email text,
  whatsapp text,
  institution text,
  job_title text,
  address text,
  plan_name text,
  amount text,
  payment_account_id bigint,
  proof_path text,
  slots integer
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  used integer;
begin
  perform pg_advisory_xact_lock(hashtext(plan_name));
  if not exists (select 1 from public.payment_accounts where id = payment_account_id) then
    raise exception 'account';
  end if;
  select count(*) into used
  from public.orders
  where orders.plan_name = place_order.plan_name
    and status <> 'rejected';
  if slots < 0 or used >= slots then
    raise exception 'slot';
  end if;
  insert into public.orders (
    full_name, email, whatsapp, institution, job_title, address,
    plan_name, amount, payment_account_id, proof_path
  ) values (
    full_name, email, whatsapp, institution, job_title, address,
    plan_name, amount, payment_account_id, proof_path
  );
end;
$$;

revoke all on function public.place_order(text, text, text, text, text, text, text, text, bigint, text, integer) from public, anon, authenticated;
grant execute on function public.place_order(text, text, text, text, text, text, text, text, bigint, text, integer) to service_role;
