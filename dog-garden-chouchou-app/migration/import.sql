-- ============================================================
-- CSV → Supabase 投入スクリプト
--
-- 手順:
--   1. Supabase の Table Editor → Import data from CSV で
--      下記の staging テーブルへ 4つのCSVを取り込む
--   2. このファイルの「投入」以降を SQL Editor で実行する
--   3. verify_import.sql で検証する
--
-- 名前→UUIDの解決はここで行う。CSV側は名前のまま持っている。
-- ============================================================

-- ── staging テーブル（すべてテキストで受ける） ──────────────
drop table if exists stg_partners, stg_dogs, stg_litters, stg_vaccinations;

create table stg_partners (
  name text, contact_name text, license_no text
);

create table stg_dogs (
  breed_code text, sex text, name text, birthday text,
  color text, color_code text, coat_type_code text,
  weight_kg text, microchip text, genes text, breeder_note text,
  is_self_bred text, is_external text, breeder_name text, supplier_name text,
  acquired_on text, status text, note text
);

create table stg_litters (
  dam_name text, sire_name text, birth_date text,
  gestation_days text, method text,
  male_count text, female_count text, stillborn_count text, note text
);

create table stg_vaccinations (
  dog_name text, kind text, dosed_on text
);

-- ★ ここで CSV を取り込む（Table Editor の Import data from CSV）

-- ============================================================
-- 投入
-- ============================================================
begin;

-- 1) 相手先
insert into partners (name, contact_name, license_no)
select distinct on (nullif(trim(name), ''))
       trim(name), nullif(trim(contact_name), ''), nullif(trim(license_no), '')
from stg_partners
where nullif(trim(name), '') is not null
order by nullif(trim(name), '')
on conflict do nothing;

-- 2) 犬
insert into dogs (
  breed_code, sex, name, birthday, color, color_code, coat_type_code,
  weight_kg, microchip, genes, breeder_note, is_self_bred, is_external,
  breeder_id, supplier_id, acquired_on, status, note
)
select
  s.breed_code,
  s.sex,
  trim(s.name),
  nullif(s.birthday, '')::date,
  nullif(s.color, ''),
  nullif(s.color_code, ''),
  nullif(s.coat_type_code, ''),
  nullif(s.weight_kg, '')::numeric,
  -- 数字以外を除いた15桁のみ採用。それ以外は NULL にして要確認へ回す
  case when nullif(s.microchip, '') ~ '^[0-9]{15}$' then s.microchip end,
  -- 「PRA・DM-vwd」のような区切りを配列にする
  case when nullif(s.genes, '') is null then null
       else regexp_split_to_array(regexp_replace(s.genes, '\s*[・,／/]\s*', ',', 'g'), ',')
  end,
  nullif(s.breeder_note, ''),
  coalesce(lower(s.is_self_bred) = 'true', false),
  coalesce(lower(s.is_external)  = 'true', false),
  pb.id,
  ps.id,
  nullif(s.acquired_on, '')::date,
  coalesce(nullif(s.status, ''), '在籍')::dog_status,
  nullif(s.note, '')
from stg_dogs s
left join partners pb on pb.name = nullif(trim(s.breeder_name), '')
left join partners ps on ps.name = nullif(trim(s.supplier_name), '')
where nullif(trim(s.name), '') is not null;

-- 3) 出産記録（母・父を名前で解決）
insert into litters (
  dam_id, sire_id, birth_date, gestation_days, method,
  male_count, female_count, stillborn_count, note
)
select
  dam.id,
  sire.id,
  s.birth_date::date,
  nullif(s.gestation_days, '')::int,
  nullif(s.method, '')::delivery_method,
  coalesce(nullif(s.male_count, '')::int, 0),
  coalesce(nullif(s.female_count, '')::int, 0),
  coalesce(nullif(s.stillborn_count, '')::int, 0),
  nullif(s.note, '')
from stg_litters s
join dogs dam       on dam.name  = trim(s.dam_name)  and dam.sex = '♀'
left join dogs sire on sire.name = nullif(trim(s.sire_name), '') and sire.sex = '♂'
where nullif(s.birth_date, '') is not null
on conflict do nothing;   -- (dam_id, birth_date) の一意制約で重複を弾く

-- 4) ワクチン
insert into vaccinations (dog_id, kind, dosed_on)
select d.id, s.kind, s.dosed_on::date
from stg_vaccinations s
join dogs d on d.name = trim(s.dog_name)
where nullif(s.dosed_on, '') is not null;

commit;

-- ============================================================
-- 後片付け（検証が終わってから実行する）
-- ============================================================
-- drop table stg_partners, stg_dogs, stg_litters, stg_vaccinations;
