-- =====================================================================
-- Stave — security self-check. Run in the Supabase SQL editor AFTER schema.sql.
-- It creates two throw-away users inside a transaction, checks that each can
-- only see their own data and that anonymous access sees nothing, then rolls
-- everything back. Expected output: a single row  "ALL CHECKS PASSED".
-- =====================================================================
begin;

insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls_a@students.stave.invalid', '{"username":"rls_check_a"}', now(), now()),
  ('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls_b@students.stave.invalid', '{"username":"rls_check_b"}', now(), now());

-- the signup trigger must have created both profiles
do $$ begin
  if (select count(*) from public.profiles where username in ('rls_check_a','rls_check_b')) <> 2 then
    raise exception 'FAIL: signup trigger did not create profiles';
  end if;
end $$;

-- act as student A
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}', true);
insert into public.progress (user_id, data) values ('00000000-0000-0000-0000-0000000000a1', '{"xp":10}');

do $$ begin
  -- A may not write B's progress
  begin
    insert into public.progress (user_id, data) values ('00000000-0000-0000-0000-0000000000b2', '{"xp":999}');
    raise exception 'FAIL: A wrote B''s progress';
  exception when insufficient_privilege or check_violation then null;
    when others then if sqlerrm like 'FAIL%' then raise; end if;
  end;
  if (select count(*) from public.profiles) <> 1 then raise exception 'FAIL: A can see other profiles'; end if;
  if (select count(*) from public.progress) <> 1 then raise exception 'FAIL: A sees wrong progress rows'; end if;
end $$;

-- A cannot rename themself
do $$ begin
  begin
    update public.profiles set username = 'hacker' where id = '00000000-0000-0000-0000-0000000000a1';
    raise exception 'FAIL: username was changeable';
  exception when insufficient_privilege then null;
    when others then if sqlerrm like 'FAIL%' then raise; end if;
  end;
end $$;

-- act as student B
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b2","role":"authenticated"}', true);
do $$ begin
  if (select count(*) from public.progress) <> 0 then raise exception 'FAIL: B can read A''s progress'; end if;
  update public.progress set data = '{"xp":0}' where user_id = '00000000-0000-0000-0000-0000000000a1';
end $$;

-- act as anonymous
reset role;
set local role anon;
do $$ begin
  begin
    perform 1 from public.progress;
    raise exception 'FAIL: anon can read progress';
  exception when insufficient_privilege then null;
    when others then if sqlerrm like 'FAIL%' then raise; end if;
  end;
  if public.username_available('rls_check_a') then raise exception 'FAIL: username check wrong'; end if;
end $$;

reset role;
do $$ begin
  if (select data->>'xp' from public.progress where user_id = '00000000-0000-0000-0000-0000000000a1') <> '10' then
    raise exception 'FAIL: B modified A''s progress';
  end if;
end $$;

select 'ALL CHECKS PASSED' as result;
rollback;
