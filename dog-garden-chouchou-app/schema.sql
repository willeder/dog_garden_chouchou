-- ============================================================
-- Dog Garden Chouchou 犬舎管理アプリ スキーマ v2
-- 実行順序を守ること（dogs と litters は相互参照するため）
-- ============================================================

-- ── 0. 拡張 ────────────────────────────────
create extension if not exists "pgcrypto";   -- gen_random_uuid()

-- ── 1. マスタ ──────────────────────────────
create table breeds (
  code text primary key,
  name text not null,
  hex  text not null              -- 犬一覧の左端の縦バー色
);
insert into breeds (code, name, hex) values
  ('TP','トイプードル','#C98A2E'), ('ML','マルチーズ','#8A93A0'),
  ('CI','チワワ','#8B5E3C'),       ('BFR','ビションフリーゼ','#5E7C6B'),
  ('PO','ポメラニアン','#D9A441');

-- 毛質（ロング／スムース）。現行台帳の「黒L」「茶S」の L / S にあたる。
-- 毛色とは別の軸なので必ず分けて持つ。
create table coat_types (
  code text primary key,
  name text not null
);
insert into coat_types (code, name) values
  ('L','ロングコート'), ('S','スムースコート');

create table coat_colors (
  code text primary key,          -- AP, RD, BK, CR, FN, BKT, W, CHLT, MERLE …
  name text not null,             -- アプリコット、レッド、ブラック …
  hex  text not null,             -- 丸バッジの塗り色
  hex2 text,                      -- 2色毛（ブラックタン等）の2色目。単色なら NULL
  sort_order int not null default 100
);
insert into coat_colors (code, name, hex, hex2, sort_order) values
  ('AP','アプリコット','#E8C39E',null,10),
  ('RD','レッド','#B5622F',null,20),
  ('CR','クリーム','#EBDCC0',null,30),
  ('FN','フォーン','#C8A472',null,40),
  ('W','ホワイト','#F7F5F0',null,50),
  ('BK','ブラック','#2B2B2B',null,60),
  ('BKT','ブラックタン','#2B2B2B','#9A6B3A',70),
  ('CHLT','チョコレート','#5B3A29',null,80),
  ('MERLE','マール','#8E8C86','#4A4844',90),
  ('BKW','ブラックホワイト','#2B2B2B','#F7F5F0',95),
  ('CHLTW','チョコホワイト','#5B3A29','#F7F5F0',85);

create table ribbon_colors (
  code text primary key,
  name text not null,
  hex  text not null
);
insert into ribbon_colors (code, name, hex) values
  ('RED','赤','#C0392B'), ('BLUE','青','#2E6DA4'), ('YELLOW','黄','#D8A62B'),
  ('GREEN','緑','#3E8E5A'), ('WHITE','白','#FFFFFF'), ('PINK','ピンク','#D98BA6');

create table partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,             -- シャルム、エンジェルクラウン、ゴールデンハウス 等
  contact_name text,              -- 古賀瞳、縄田あゆみ、田中 等
  license_no text,                -- 【法令】繁殖者／販売元の動物取扱業登録番号
  phone text,
  note text,
  deleted_at timestamptz,
  created_at timestamptz default now()
);

create table customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text, email text, address text, note text,
  deleted_at timestamptz,
  created_at timestamptz default now()
);

-- ── 2. 犬（繁殖犬・仔犬を統合） ──────────────
create type dog_status as enum (
  '在舎',      -- 自家で生まれ、販売前
  '商談中',
  '売約',
  '引渡済',
  '在籍',      -- 繁殖犬として在籍（自家保留はここへ変更するだけ）
  '退役',
  '預託',
  '死亡'
);

create table dogs (
  id uuid primary key default gen_random_uuid(),
  breed_code     text not null references breeds(code),
  sex            text not null check (sex in ('♂','♀')),
  name           text not null,
  birthday       date,

  color          text,                                     -- 台帳の原文を保持
  color_code     text references coat_colors(code),         -- 正規化した毛色
  coat_type_code text references coat_types(code),          -- 毛質（L / S）
  ribbon_code    text references ribbon_colors(code),       -- 実際に着けている紐の色
  weight_kg      numeric(4,1),

  sire_id        uuid references dogs(id),                  -- 父（自己参照）
  dam_id         uuid references dogs(id),                  -- 母（自己参照）

  -- マイクロチップは数字のみ15桁で保存する。表示時に整形し、検索は下4桁で行う。
  microchip      text unique check (microchip ~ '^[0-9]{15}$'),
  genes          text[],                                    -- {PRA, DM, vWD1, グリコーゲン}
  breeder_note   text,                                      -- 「クッキー・サンダー」等の旧表記を原文保持
  note           text,                                      -- 自由メモ。移行時の保留事項もここへ
  is_self_bred   boolean not null default false,
  breeder_id     uuid references partners(id),   -- 繁殖者（法令の記載項目）
  supplier_id    uuid references partners(id),   -- 仕入れ元（入手先）

  -- 【法令】犬猫等販売業者の帳簿に必要な項目
  acquired_on    date,                                      -- 所有した日
  died_on        date,                                      -- 死亡した日
  death_cause    text,                                      -- 死亡の原因

  status         dog_status not null default '在籍',
  -- 外部の種雄犬（他犬舎から借りた父）。自舎の所有ではないので
  -- 【法令】帳簿・定期報告からは除外する。交配記録の父としてだけ使う。
  is_external    boolean not null default false,
  photo_path     text,                                      -- 非公開バケット
  public_photo_path text,                                   -- 公開バケット

  is_published   boolean not null default false,            -- 公式サイトに出すか
  deleted_at     timestamptz,                               -- 【法令】5年保存のため物理削除しない
  updated_by     uuid,                                      -- 監査。auth.users(id)
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint dogs_death_consistency
    check ((status = '死亡') = (died_on is not null))
);

create index on dogs (breed_code, sex, status);
create index on dogs (microchip);
create index on dogs (dam_id);
create index on dogs (sire_id);
create index on dogs (is_published) where deleted_at is null;
-- 外部キーには覆いインデックスを付ける（親行の更新・削除時の全走査を防ぐ）
create index on dogs (breeder_id);
create index on dogs (supplier_id);
create index on dogs (color_code);
create index on dogs (coat_type_code);
create index on dogs (ribbon_code);

-- ── 3. 出産記録 ────────────────────────────
create type delivery_method as enum ('自然','帝王切開','後帝');

create table litters (
  id uuid primary key default gen_random_uuid(),
  dam_id          uuid not null references dogs(id) on delete restrict,
  sire_id         uuid references dogs(id) on delete restrict,
  birth_date      date not null,
  gestation_days  int check (gestation_days between 50 and 75),
  method          delivery_method,
  male_count      int not null default 0 check (male_count >= 0),
  female_count    int not null default 0 check (female_count >= 0),
  stillborn_count int not null default 0 check (stillborn_count >= 0),
  note            text,
  checkup_date    date generated always as (birth_date + 49) stored,  -- 仔犬検診（7週）
  deleted_at      timestamptz,
  updated_by      uuid,
  created_at      timestamptz not null default now()
);

create index on litters (dam_id, birth_date desc);
create index on litters (sire_id);
-- 同一母犬・同一出産日の重複を検出しやすくする（移行時の事故対策）
create unique index litters_dam_birth_uniq
  on litters (dam_id, birth_date) where deleted_at is null;

-- ── 4. 相互参照の解決 ───────────────────────
alter table dogs add column litter_id uuid references litters(id) on delete restrict;
create index on dogs (litter_id);

-- ── 5. ワクチン（接種日のみ記録。回数は件数から算出） ──
-- 【法令】5年保存のため cascade ではなく restrict
create table vaccinations (
  id uuid primary key default gen_random_uuid(),
  dog_id   uuid not null references dogs(id) on delete restrict,
  kind     text not null check (kind in ('混合','狂犬病')),
  dosed_on date not null,
  note     text,
  updated_by uuid,
  created_at timestamptz not null default now()
);

create index on vaccinations (dog_id, kind, dosed_on);

-- ── 6. 販売（帳簿項目を含む） ────────────────
create table sales (
  id uuid primary key default gen_random_uuid(),
  dog_id        uuid not null references dogs(id) on delete restrict,
  customer_id   uuid references customers(id),
  price         int,
  handover_date date,
  -- 【法令】帳簿の記載項目
  staff_name          text,                        -- 販売担当者名
  explained_in_person boolean not null default false, -- 対面説明等の実施
  explained_on        date,
  compliance_checked  boolean not null default false, -- 引渡し先が関係法令違反でないことの確認
  note          text,
  deleted_at    timestamptz,
  updated_by    uuid,
  created_at    timestamptz not null default now()
);

create index on sales (dog_id);
create index on sales (customer_id);
create index on sales (handover_date);

-- ── 7. ビュー：計算値はここで持つ（入力させない） ──
create view v_litters as
select
  l.*,
  -- 旧「Ⅿ」表記の代替。父が未登録のときは判定不能なので NULL を返す（false にしない）
  case when l.sire_id is null then null
       else (dam.breed_code is distinct from sire.breed_code) end as is_mix,
  dam.name  as dam_name,
  sire.name as sire_name
from litters l
join dogs dam       on dam.id  = l.dam_id
left join dogs sire on sire.id = l.sire_id
where l.deleted_at is null;

create view v_dam_summary as
select
  d.id as dog_id,
  count(l.id)       as litter_count,
  max(l.birth_date) as last_birth_date,
  (date_trunc('month', max(l.birth_date) + interval '5 months'))::date as next_mating_month
from dogs d
left join litters l on l.dam_id = d.id and l.deleted_at is null
where d.sex = '♀' and d.deleted_at is null
group by d.id;

create view v_vaccination_counts as
select dog_id,
       count(*) filter (where kind = '混合')   as combo_count,
       count(*) filter (where kind = '狂犬病') as rabies_count,
       max(dosed_on) filter (where kind = '混合')   as last_combo_on,
       max(dosed_on) filter (where kind = '狂犬病') as last_rabies_on
from vaccinations
group by dog_id;

-- 公開してよい列だけを露出するビュー。
-- マイクロチップ・仕入れ元・顧客・帳簿項目は絶対に含めない。
create view v_public_puppies as
select
  d.id, d.name, d.sex, d.birthday, d.status,
  b.name  as breed_name,
  cc.name as color_name,
  ct.name as coat_type_name,
  d.weight_kg,
  d.public_photo_path
from dogs d
join breeds b            on b.code  = d.breed_code
left join coat_colors cc on cc.code = d.color_code
left join coat_types  ct on ct.code = d.coat_type_code
where d.deleted_at is null
  and d.is_published = true
  and d.status in ('在舎','商談中');

-- 【法令】定期報告（毎年4/1〜5/30提出・前年度4/1〜3/31が対象）
--   ① 期首所有数 ＋ ② 増加 － ③ 販売譲渡死亡 ＝ ④ 期末所有数
create or replace function fn_annual_report(fy int)
returns table (
  breed_code text, breed_name text,
  opening_count bigint, acquired_count bigint,
  sold_count bigint, died_count bigint, closing_count bigint
) language sql stable as $$
  with period as (
    select make_date(fy, 4, 1) as fy_start, make_date(fy + 1, 3, 31) as fy_end
  ),
  owned as (
    select d.*,
           coalesce(d.acquired_on, d.birthday) as owned_from,
           (select min(s.handover_date) from sales s
             where s.dog_id = d.id and s.deleted_at is null) as handed_on
    from dogs d
    where d.deleted_at is null
      and d.is_external = false      -- 外部の種雄犬は自舎の所有ではない
  )
  select
    b.code, b.name,
    count(*) filter (
      where o.owned_from < p.fy_start
        and (o.handed_on is null or o.handed_on >= p.fy_start)
        and (o.died_on   is null or o.died_on   >= p.fy_start)),
    count(*) filter (where o.owned_from between p.fy_start and p.fy_end),
    count(*) filter (where o.handed_on between p.fy_start and p.fy_end),
    count(*) filter (where o.died_on   between p.fy_start and p.fy_end),
    count(*) filter (
      where o.owned_from <= p.fy_end
        and (o.handed_on is null or o.handed_on > p.fy_end)
        and (o.died_on   is null or o.died_on   > p.fy_end))
  from breeds b
  cross join period p
  left join owned o on o.breed_code = b.code
  group by b.code, b.name, p.fy_start, p.fy_end
  order by b.code;
$$;

-- 【法令】帳簿の出力（個体ごと13項目・5年保存）
create view v_ledger as
select
  d.id,
  b.name                      as "品種等の名称",
  d.name                      as "個体の名前",
  d.birthday                  as "生年月日",
  d.sex                       as "性別",
  d.microchip                 as "マイクロチップ番号",
  case when d.is_self_bred then '自家繁殖' else pb.name end as "繁殖者の氏名",
  pb.license_no               as "繁殖者の登録番号",
  d.acquired_on               as "所有した日",
  ps.name                     as "入手先",
  s.handover_date             as "販売・引渡しの日",
  c.name                      as "販売・引渡し先",
  s.compliance_checked        as "引渡し先の法令違反確認",
  s.staff_name                as "販売担当者名",
  s.explained_in_person       as "対面説明等の実施",
  s.explained_on              as "対面説明の実施日",
  d.died_on                   as "死亡した日",
  d.death_cause               as "死亡の原因",
  d.created_at, d.updated_at
from dogs d
join breeds b             on b.code = d.breed_code
left join partners pb     on pb.id = d.breeder_id
left join partners ps     on ps.id = d.supplier_id
left join lateral (
  select * from sales s2
  where s2.dog_id = d.id and s2.deleted_at is null
  order by s2.handover_date desc nulls last limit 1
) s on true
left join customers c     on c.id = s.customer_id
where d.deleted_at is null
  and d.is_external = false;         -- 外部の種雄犬は帳簿の対象外

-- ── 8. 更新日時の自動更新 ───────────────────
create or replace function fn_touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger dogs_touch before update on dogs
  for each row execute function fn_touch_updated_at();

-- ── 9. 血統ツリー（3世代・循環参照ガード付き） ──
create or replace function fn_pedigree(root uuid, max_gen int default 3)
returns table (id uuid, name text, sex text, breed_code text, gen int, path uuid[])
language sql stable as $$
  with recursive t as (
    select d.id, d.name, d.sex, d.breed_code, 0 as gen, array[d.id] as path
    from dogs d where d.id = root
    union all
    select p.id, p.name, p.sex, p.breed_code, t.gen + 1, t.path || p.id
    from t
    join dogs c on c.id = t.id
    join dogs p on p.id in (c.sire_id, c.dam_id)
    where t.gen < max_gen
      and not (p.id = any(t.path))       -- 循環参照ガード
  )
  select id, name, sex, breed_code, gen, path from t;
$$;

-- ── 10. RLS ────────────────────────────────
alter table dogs          enable row level security;
alter table litters       enable row level security;
alter table vaccinations  enable row level security;
alter table sales         enable row level security;
alter table partners      enable row level security;
alter table customers     enable row level security;
alter table breeds        enable row level security;
alter table coat_colors   enable row level security;
alter table coat_types    enable row level security;
alter table ribbon_colors enable row level security;

-- ── 使える人の名簿 ──────────────────────
-- Supabase Auth はサインアップを開けていれば誰でも authenticated になれる。
-- 「ログインできる」＝「見てよい」ではないので、許可した人をここに明示し、
-- すべてのポリシーをこの名簿に紐づける。名簿の追加はSQLエディタからのみ。
create table app_users (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  email        text,
  display_name text,
  is_active    boolean not null default true,
  note         text,
  created_at   timestamptz not null default now()
);
alter table app_users enable row level security;
create policy app_users_read_self on app_users
  for select to authenticated using (user_id = auth.uid());
revoke all on app_users from anon;

-- 判定関数。app_users 自身の RLS に阻まれないよう security definer。
-- public に置くと /rest/v1/rpc から直接呼べるため、公開されない private スキーマに置く。
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create function private.is_staff()
returns boolean
language sql stable security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.app_users where user_id = auth.uid() and is_active
  );
$$;
revoke all on function private.is_staff() from public, anon;
grant execute on function private.is_staff() to authenticated;

-- 名簿に載っている担当者だけが全件読み書きできる
create policy staff_all on dogs          for all to authenticated using (private.is_staff()) with check (private.is_staff());
create policy staff_all on litters       for all to authenticated using (private.is_staff()) with check (private.is_staff());
create policy staff_all on vaccinations  for all to authenticated using (private.is_staff()) with check (private.is_staff());
create policy staff_all on sales         for all to authenticated using (private.is_staff()) with check (private.is_staff());
create policy staff_all on partners      for all to authenticated using (private.is_staff()) with check (private.is_staff());
create policy staff_all on customers     for all to authenticated using (private.is_staff()) with check (private.is_staff());
create policy staff_all on breeds        for all to authenticated using (private.is_staff()) with check (private.is_staff());
create policy staff_all on coat_colors   for all to authenticated using (private.is_staff()) with check (private.is_staff());
create policy staff_all on coat_types    for all to authenticated using (private.is_staff()) with check (private.is_staff());
create policy staff_all on ribbon_colors for all to authenticated using (private.is_staff()) with check (private.is_staff());

-- 匿名（公式サイト）は公開フラグの立った在舎・商談中のみ読める。
-- 読み出しは必ず v_public_puppies 経由にすること。
create policy anon_read_published on dogs
  for select to anon
  using (deleted_at is null and is_published = true and status in ('在舎','商談中'));

-- 表示に必要なマスタのみ匿名に開放
create policy anon_read on breeds        for select to anon using (true);
create policy anon_read on coat_colors   for select to anon using (true);
create policy anon_read on coat_types    for select to anon using (true);

-- ── 11. アラート（ワクチン次回予定・交配・仔犬検診） ──
-- 通知は送らない。「今月の対象」を一覧表示するためだけに使う。

-- ワクチンの接種間隔。運用が変わっても設定画面から直せるようテーブルで持つ。
create table vaccine_schedules (
  kind            text primary key check (kind in ('混合','狂犬病')),
  interval_months int  not null check (interval_months > 0),
  note            text
);
insert into vaccine_schedules (kind, interval_months, note) values
  ('混合',   12, '前回接種日から12ヶ月後を次回予定日とする'),
  ('狂犬病', 12, '前回接種日から12ヶ月後を次回予定日とする');

alter table vaccine_schedules enable row level security;
create policy staff_all on vaccine_schedules for all to authenticated using (private.is_staff()) with check (private.is_staff());

-- 犬×ワクチン種別ごとの最終接種日と次回予定日。
-- 引渡済・死亡の個体は自舎の管理対象外なので除外する。
create view v_vaccine_due as
select
  d.id as dog_id, d.name as dog_name, d.breed_code, s.kind,
  max(v.dosed_on) as last_dosed_on,
  (max(v.dosed_on) + make_interval(months => s.interval_months))::date as next_due_on
from dogs d
cross join vaccine_schedules s
left join vaccinations v on v.dog_id = d.id and v.kind = s.kind
where d.deleted_at is null
  and d.status not in ('引渡済','死亡')
group by d.id, d.name, d.breed_code, s.kind, s.interval_months;

-- 指定月の対象犬を返す。target_month は月初の日付を渡す（例: '2026-08-01'）。
-- include_unvaccinated=false（既定）では「一度も接種記録が無い個体」を含めない。
-- 移行直後は未接種が大量に出て当月の対象が埋もれるため、別画面で扱う。
create or replace function fn_monthly_alerts(
  target_month date,
  include_unvaccinated boolean default false
)
returns table (
  category   text,
  dog_id     uuid,
  dog_name   text,
  breed_code text,
  due_on     date,
  detail     text
) language sql stable as $$
  with m as (
    select date_trunc('month', target_month)::date as m_start,
           (date_trunc('month', target_month) + interval '1 month - 1 day')::date as m_end
  )
  -- 混合／狂犬病ワクチンの次回予定が当月、または当月より前で未接種のまま
  select
    case vd.kind when '混合' then '混合ワクチン' else '狂犬病ワクチン' end,
    vd.dog_id, vd.dog_name, vd.breed_code, vd.next_due_on,
    case when vd.next_due_on < (select m_start from m) then '期限超過' else null end
  from v_vaccine_due vd, m
  where vd.next_due_on is not null and vd.next_due_on <= m.m_end

  union all
  -- 一度も接種記録が無い個体（既定では含めない）
  select '未接種', vd.dog_id, vd.dog_name, vd.breed_code, null,
         case vd.kind when '混合' then '混合ワクチンの記録なし' else '狂犬病ワクチンの記録なし' end
  from v_vaccine_due vd
  where include_unvaccinated and vd.last_dosed_on is null

  union all
  -- 交配できる時期（最新出産日 + 5ヶ月の月初）が当月
  select '交配可能', s.dog_id, d.name, d.breed_code, s.next_mating_month, null
  from v_dam_summary s
  join dogs d on d.id = s.dog_id, m
  where s.next_mating_month between m.m_start and m.m_end
    and d.status in ('在籍','預託')

  union all
  -- 仔犬検診（出産日 + 49日）が当月
  select '仔犬検診', l.dam_id, d.name, d.breed_code, l.checkup_date,
         to_char(l.birth_date, 'YYYY/MM/DD') || ' 生まれの腹'
  from litters l
  join dogs d on d.id = l.dam_id, m
  where l.deleted_at is null
    and l.checkup_date between m.m_start and m.m_end

  order by 1, 5 nulls last, 3;
$$;


-- ── 12. ビューと関数のセキュリティ強化（Supabase では必須） ──
-- PostgreSQL 15+ のビューは既定で SECURITY DEFINER 相当となり、
-- 閲覧者ではなく作成者の権限で動くため RLS を迂回してしまう。
-- Supabase のセキュリティ診断でも ERROR として検出される。
alter view v_litters            set (security_invoker = on);
alter view v_dam_summary        set (security_invoker = on);
alter view v_vaccination_counts set (security_invoker = on);
alter view v_public_puppies     set (security_invoker = on);
alter view v_ledger             set (security_invoker = on);
alter view v_vaccine_due        set (security_invoker = on);

-- Supabase は public スキーマの全テーブル・ビューに anon/authenticated の
-- 権限を自動付与する。内部ビューは匿名から明示的に剥奪すること。
-- （剥奪しないと v_ledger からマイクロチップ・顧客名・価格が公開キーで読める）
revoke all on v_litters            from anon;
revoke all on v_dam_summary        from anon;
revoke all on v_vaccination_counts from anon;
revoke all on v_ledger             from anon;
revoke all on v_vaccine_due        from anon;

revoke all    on v_public_puppies from anon;
grant  select on v_public_puppies to   anon;

revoke insert, update, delete, truncate, references, trigger
  on v_litters, v_dam_summary, v_vaccination_counts,
     v_public_puppies, v_ledger, v_vaccine_due
  from authenticated;

-- 関数の search_path を固定する（検索パス乗っ取りの防止）
alter function fn_touch_updated_at()            set search_path = public, pg_temp;
alter function fn_pedigree(uuid, int)           set search_path = public, pg_temp;
alter function fn_annual_report(int)            set search_path = public, pg_temp;
alter function fn_monthly_alerts(date, boolean) set search_path = public, pg_temp;

revoke execute on function fn_pedigree(uuid, int)           from anon;
revoke execute on function fn_annual_report(int)            from anon;
revoke execute on function fn_monthly_alerts(date, boolean) from anon;

-- ── 11. Storage ────────────────────────────
-- バケットはSupabaseの画面で作る。設定とポリシーはここで固定する。
--   dogs-private … 犬舎の内部写真・書類。名簿の担当者だけ
--   dogs-public  … 公式サイトに載せる仔犬の写真。閲覧は誰でも可
update storage.buckets
   set public = true, file_size_limit = 10485760,
       allowed_mime_types = array['image/jpeg','image/png','image/webp','image/avif']
 where id = 'dogs-public';

update storage.buckets
   set public = false, file_size_limit = 26214400,
       allowed_mime_types = array['image/jpeg','image/png','image/webp','image/avif','image/heic','application/pdf']
 where id = 'dogs-private';

-- ポリシーが1つも無いと、ログインしていてもアップロードすらできない
create policy dogs_private_staff on storage.objects
  for all to authenticated
  using      (bucket_id = 'dogs-private' and private.is_staff())
  with check (bucket_id = 'dogs-private' and private.is_staff());

create policy dogs_public_staff_write on storage.objects
  for all to authenticated
  using      (bucket_id = 'dogs-public' and private.is_staff())
  with check (bucket_id = 'dogs-public' and private.is_staff());

create policy dogs_public_anon_read on storage.objects
  for select to anon using (bucket_id = 'dogs-public');


-- ============================================================
-- 12. 公式サイトとの連携（2026-08-17 追加）
-- ============================================================

-- 犬種の補足説明（サイトの仔犬詳細で犬種の下に出る文章）
alter table breeds add column if not exists explanation text;

-- 仔犬の公開項目。いずれも「サイトに出す用」で、帳簿とは無関係。
alter table dogs add column if not exists list_price         integer;
alter table dogs add column if not exists expected_weight_kg numeric(4,1);
alter table dogs add column if not exists expected_height_cm numeric(4,1);
alter table dogs add column if not exists public_message     text;

comment on column dogs.list_price is
  '公式サイトに出す価格。売れた実績価格は sales.price（非公開）で別管理する';

-- 写真。1頭に複数枚、1枚目がメイン。
-- 幅・高さを持つのはサイト側の Image 表示でレイアウトシフトを防ぐため。
create table if not exists dog_photos (
  id         uuid primary key default gen_random_uuid(),
  dog_id     uuid not null references dogs(id) on delete cascade,
  bucket     text not null default 'dogs-public'
               check (bucket in ('dogs-public','dogs-private')),
  path       text not null,
  width      integer not null,
  height     integer not null,
  sort_order integer not null default 0,
  caption    text,
  created_at timestamptz not null default now()
);
create index if not exists dog_photos_dog_idx on dog_photos (dog_id, sort_order);

alter table dog_photos enable row level security;
create policy staff_all on dog_photos for all to authenticated
  using (private.is_staff()) with check (private.is_staff());
revoke all on dog_photos from anon;

-- ── 【重要】匿名は dogs を直接読めない ──────────────
--
-- RLS は「行」を絞るが「列」は絞らない。公開フラグを立てた仔犬の行を
-- 匿名に見せると、その行の全列（マイクロチップ・所有日など）が読める。
-- 実際に GET /rest/v1/dogs?select=microchip が匿名キーで通ることを確認済み。
-- したがってテーブルへの権限そのものを外し、公開はビュー1本に限定する。
revoke all on dogs from anon;

-- 公開ページが読む唯一のビュー。定義者権限で動かす（呼び出し元は dogs を読めないため）。
-- 列を足すときは「サイトに出してよいか」を必ず確認すること。
drop view if exists v_public_puppies;
create view v_public_puppies as
select
  d.id, d.name, d.sex, d.birthday, d.status,
  b.name as breed_name, b.explanation as breed_explanation,
  cc.name as color_name, ct.name as coat_type_name,
  d.weight_kg, d.expected_weight_kg, d.expected_height_cm,
  d.list_price, d.public_message, d.created_at,
  coalesce((select jsonb_agg(jsonb_build_object(
              'path', p.path, 'width', p.width, 'height', p.height)
            order by p.sort_order, p.created_at)
     from dog_photos p where p.dog_id = d.id and p.bucket = 'dogs-public'),
    '[]'::jsonb) as photos,
  case when dam.id is null then null else jsonb_build_object(
    'id', dam.id, 'name', dam.name, 'sex', dam.sex, 'breed', dam_b.name,
    'birthday', dam.birthday, 'color', dam_cc.name, 'weight', dam.weight_kg,
    'photo', (select jsonb_build_object('path', p.path, 'width', p.width, 'height', p.height)
              from dog_photos p where p.dog_id = dam.id and p.bucket='dogs-public'
              order by p.sort_order limit 1)) end as mother,
  case when sire.id is null then null else jsonb_build_object(
    'id', sire.id, 'name', sire.name, 'sex', sire.sex, 'breed', sire_b.name,
    'birthday', sire.birthday, 'color', sire_cc.name, 'weight', sire.weight_kg,
    'photo', (select jsonb_build_object('path', p.path, 'width', p.width, 'height', p.height)
              from dog_photos p where p.dog_id = sire.id and p.bucket='dogs-public'
              order by p.sort_order limit 1)) end as father
from dogs d
join breeds b            on b.code  = d.breed_code
left join coat_colors cc on cc.code = d.color_code
left join coat_types  ct on ct.code = d.coat_type_code
left join dogs dam       on dam.id  = d.dam_id  and dam.deleted_at is null
left join breeds dam_b   on dam_b.code = dam.breed_code
left join coat_colors dam_cc on dam_cc.code = dam.color_code
left join dogs sire      on sire.id = d.sire_id and sire.deleted_at is null
left join breeds sire_b  on sire_b.code = sire.breed_code
left join coat_colors sire_cc on sire_cc.code = sire.color_code
where d.deleted_at is null
  and d.is_external = false
  and d.is_published = true
  and d.status in ('在舎','商談中','売約');

alter view v_public_puppies set (security_invoker = off);
grant select on v_public_puppies to anon, authenticated;
