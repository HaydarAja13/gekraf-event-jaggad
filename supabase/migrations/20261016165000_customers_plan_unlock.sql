create table public.customers (
  id bigint generated always as identity primary key,
  full_name text not null,
  email text not null,
  whatsapp text not null,
  institution text not null,
  job_title text not null,
  address text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customers_email_unique unique (email)
);

alter table public.orders
  add column if not exists customer_id bigint references public.customers (id);

create index if not exists orders_customer_id_idx on public.orders (customer_id);

alter table public.customers enable row level security;

revoke all on public.customers from anon, authenticated;
grant select, insert, update, delete on public.customers to service_role;
grant usage, select on sequence public.customers_id_seq to service_role;

drop function if exists public.place_order(text, text, text, text, text, text, text, text, bigint, text, integer);

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
  plans jsonb
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  customer_id bigint;
  plan_index integer := -1;
  plan_slots integer;
  used integer;
  prev jsonb;
  prev_name text;
  prev_slots integer;
  prev_used integer;
  i integer;
begin
  perform pg_advisory_xact_lock(hashtext(coalesce(plan_name, '')));

  if not exists (select 1 from public.payment_accounts where id = payment_account_id) then
    raise exception 'account';
  end if;

  if plans is null or jsonb_typeof(plans) <> 'array' then
    raise exception 'plans';
  end if;

  for i in 0 .. jsonb_array_length(plans) - 1 loop
    if plans -> i ->> 'name' = plan_name then
      plan_index := i;
      plan_slots := coalesce((plans -> i ->> 'slots')::integer, -1);
      exit;
    end if;
  end loop;

  if plan_index < 0 then
    raise exception 'plan';
  end if;

  for i in 0 .. plan_index - 1 loop
    prev := plans -> i;
    prev_name := prev ->> 'name';
    prev_slots := coalesce((prev ->> 'slots')::integer, -1);
    select count(*) into prev_used
    from public.orders
    where orders.plan_name = prev_name
      and status <> 'rejected';
    if prev_slots < 0 or prev_used < prev_slots then
      raise exception 'locked';
    end if;
  end loop;

  select count(*) into used
  from public.orders
  where orders.plan_name = place_order.plan_name
    and status <> 'rejected';

  if plan_slots < 0 or used >= plan_slots then
    raise exception 'slot';
  end if;

  insert into public.customers (full_name, email, whatsapp, institution, job_title, address, updated_at)
  values (full_name, lower(email), whatsapp, institution, job_title, address, now())
  on conflict (email) do update set
    full_name = excluded.full_name,
    whatsapp = excluded.whatsapp,
    institution = excluded.institution,
    job_title = excluded.job_title,
    address = excluded.address,
    updated_at = now()
  returning id into customer_id;

  insert into public.orders (
    full_name, email, whatsapp, institution, job_title, address,
    plan_name, amount, payment_account_id, proof_path, customer_id
  ) values (
    full_name, lower(email), whatsapp, institution, job_title, address,
    plan_name, amount, payment_account_id, proof_path, customer_id
  );
end;
$$;

revoke all on function public.place_order(text, text, text, text, text, text, text, text, bigint, text, jsonb) from public, anon, authenticated;
grant execute on function public.place_order(text, text, text, text, text, text, text, text, bigint, text, jsonb) to service_role;
