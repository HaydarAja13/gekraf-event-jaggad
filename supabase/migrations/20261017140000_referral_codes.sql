create table public.referral_codes (
  id bigint generated always as identity primary key,
  name text not null,
  code text not null,
  discount_amount integer not null,
  created_at timestamptz not null default now(),
  constraint referral_codes_name_not_blank check (length(btrim(name)) > 0),
  constraint referral_codes_code_shape check (code ~ '^[A-Z0-9][A-Z0-9-]{1,23}$'),
  constraint referral_codes_discount_positive check (discount_amount > 0),
  constraint referral_codes_code_unique unique (code)
);

alter table public.orders
  add column referral_code_id bigint references public.referral_codes (id),
  add column referral_name text,
  add column referral_code text,
  add column discount_amount integer not null default 0,
  add constraint orders_discount_nonnegative check (discount_amount >= 0);

create index orders_referral_code_id_idx on public.orders (referral_code_id);

alter table public.referral_codes enable row level security;

revoke all on public.referral_codes from anon, authenticated;
grant select, insert, update, delete on public.referral_codes to service_role;
grant usage, select on sequence public.referral_codes_id_seq to service_role;

drop function if exists public.place_order(text, text, text, text, text, text, text, text, bigint, text, jsonb);

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
  plans jsonb,
  referral_code text default ''
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
  normalized text;
  ref_id bigint;
  ref_name text;
  ref_code text;
  configured integer;
  list_amount bigint;
  applied integer := 0;
  payable bigint;
  stored_amount text;
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

  normalized := upper(regexp_replace(coalesce(referral_code, ''), '\s', '', 'g'));
  if normalized <> '' then
    select r.id, r.name, r.code, r.discount_amount
      into ref_id, ref_name, ref_code, configured
    from public.referral_codes r
    where r.code = normalized;
    if ref_id is null then
      raise exception 'referral';
    end if;
    list_amount := coalesce(nullif(regexp_replace(amount, '[^0-9]', '', 'g'), '')::bigint, 0);
    applied := least(configured, list_amount)::integer;
    payable := list_amount - applied;
    stored_amount := 'Rp ' || reverse(regexp_replace(reverse(payable::text), '(\d{3})(?=\d)', '\1.', 'g'));
  else
    stored_amount := amount;
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
    plan_name, amount, payment_account_id, proof_path, customer_id,
    referral_code_id, referral_name, referral_code, discount_amount
  ) values (
    full_name, lower(email), whatsapp, institution, job_title, address,
    plan_name, stored_amount, payment_account_id, proof_path, customer_id,
    ref_id, ref_name, ref_code, applied
  );
end;
$$;

revoke all on function public.place_order(text, text, text, text, text, text, text, text, bigint, text, jsonb, text) from public, anon, authenticated;
grant execute on function public.place_order(text, text, text, text, text, text, text, text, bigint, text, jsonb, text) to service_role;

notify pgrst, 'reload schema';
