create sequence if not exists public.ticket_no_seq;

create or replace function public.assign_ticket_no()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  n bigint;
begin
  if new.ticket_no is null or btrim(new.ticket_no) = '' then
    n := nextval('public.ticket_no_seq');
    new.ticket_no := 'BSM-' || lpad(n::text, greatest(4, char_length(n::text)), '0');
  end if;
  return new;
end;
$$;

drop trigger if exists orders_assign_ticket_no on public.orders;
create trigger orders_assign_ticket_no
before insert on public.orders
for each row
execute function public.assign_ticket_no();

do $$
declare
  r record;
  n bigint;
begin
  for r in
    select id from public.orders
    where ticket_no is null or btrim(ticket_no) = ''
    order by id
  loop
    n := nextval('public.ticket_no_seq');
    update public.orders
      set ticket_no = 'BSM-' || lpad(n::text, greatest(4, char_length(n::text)), '0')
      where id = r.id;
  end loop;
end $$;

alter table public.orders alter column ticket_no set not null;

revoke all on function public.assign_ticket_no() from public, anon, authenticated;
revoke all on sequence public.ticket_no_seq from anon, authenticated;
grant usage, select on sequence public.ticket_no_seq to service_role;
