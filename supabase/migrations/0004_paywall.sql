-- Make the product fully paid: new accounts start with 0 credits.
-- IMPORTANT: this only changes the default for NEW rows and the signup trigger.
-- It does NOT touch existing balances (no UPDATE), so paid credits are safe.

alter table public.profiles alter column credits set default 0;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, credits)
  values (new.id, new.email, 0)
  on conflict (id) do nothing;
  return new;
end;
$$;
