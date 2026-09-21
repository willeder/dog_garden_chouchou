-- 出産記録の♂♀の頭数を、登録された仔犬の数が超えないようにする。
-- 2026-09-21 仔犬一覧の「N頭を登録する」の再押下で同じ腹の仔犬が3重に作られた事故の再発防止。
-- 【適用順】アプリの addPuppy が「頭数を先に+1 → 仔犬を作る」順になった版を本番に出してから適用すること。
--           古い版（仔犬を先に作る）のままだと「＋男の子／＋女の子」が毎回弾かれる。

-- 仔犬側: 作る・性別を変える・腹を付け替える・取り消しを戻すとき
create or replace function fn_guard_litter_pups() returns trigger
language plpgsql as $$
declare
  lim int;
  n   int;
begin
  if new.litter_id is null or new.deleted_at is not null then
    return new;
  end if;

  -- 同じ腹への同時登録を直列にする
  select case when new.sex = '♂' then male_count else female_count end
    into lim
    from litters
   where id = new.litter_id and deleted_at is null
   for update;
  if lim is null then
    return new;
  end if;

  select count(*) into n
    from dogs
   where litter_id = new.litter_id
     and sex = new.sex
     and deleted_at is null
     and id <> new.id;

  if n + 1 > lim then
    raise exception '出産記録の%の頭数（%頭）を超えて仔犬は登録できません。頭数が違うときは出産記録を直してください。',
      new.sex, lim
      using errcode = 'check_violation';
  end if;
  return new;
end $$;

drop trigger if exists dogs_guard_litter_pups on dogs;
create trigger dogs_guard_litter_pups
  before insert or update of litter_id, sex, deleted_at on dogs
  for each row execute function fn_guard_litter_pups();

-- 出産記録側: 頭数を登録済みの仔犬より少なくできないようにする
create or replace function fn_guard_litter_counts() returns trigger
language plpgsql as $$
declare
  m int;
  f int;
begin
  if new.deleted_at is not null then
    return new;
  end if;
  select count(*) filter (where sex = '♂'), count(*) filter (where sex = '♀')
    into m, f
    from dogs
   where litter_id = new.id and deleted_at is null;
  if new.male_count < m or new.female_count < f then
    raise exception '登録済みの仔犬（♂%頭・♀%頭）より少ない頭数にはできません。先に仔犬を取り消してください。', m, f
      using errcode = 'check_violation';
  end if;
  return new;
end $$;

drop trigger if exists litters_guard_counts on litters;
create trigger litters_guard_counts
  before update of male_count, female_count, deleted_at on litters
  for each row execute function fn_guard_litter_counts();
