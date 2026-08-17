-- ============================================================
-- 投入後の検証。すべて「0件」または期待値と一致すればOK。
-- 読み取りのみなので何度実行しても安全。
-- ============================================================

-- ── 1. 件数照合 ─────────────────────────────
select '① 件数照合' as 区分, breed_code || ' ' || sex as 項目,
       count(*)::text as 現在,
       case breed_code || ' ' || sex
         when 'TP ♀' then '11' when 'ML ♀' then '14'
         when 'CI ♀' then '26' when 'BFR ♀' then '4'
         when 'TP ♂' then '6（うち外交配1）'  when 'ML ♂' then '6（うち外交配1）'
         when 'CI ♂' then '16' when 'BFR ♂' then '2（うち外交配1）' when 'PO ♂' then '1'
         else '（台帳と突き合わせる）' end as 期待値
from dogs where deleted_at is null
group by breed_code, sex

union all
select '① 件数照合', '犬 合計', count(*)::text, '86（うち外交配の♂3）' from dogs where deleted_at is null
union all
select '① 件数照合', '出産記録', count(*)::text, '91' from litters where deleted_at is null
union all
select '① 件数照合', '産子数 合計（♂＋♀）',
       coalesce(sum(male_count + female_count), 0)::text, '—' from litters where deleted_at is null
union all
select '① 件数照合', '死産 合計', coalesce(sum(stillborn_count), 0)::text, '—'
from litters where deleted_at is null
union all
select '① 件数照合', 'ワクチン記録', count(*)::text, '142' from vaccinations

-- ── 2. 取りこぼしの検出（すべて0件が期待値） ──
union all
select '② 取りこぼし', 'CSVにあるが投入できなかった出産記録',
       (select count(*)::text from stg_litters s
        where nullif(s.birth_date,'') is not null
          and not exists (select 1 from dogs d where d.name = trim(s.dam_name) and d.sex='♀')),
       '0'
union all
select '② 取りこぼし', '父の名前があるのに解決できなかった出産記録',
       (select count(*)::text from stg_litters s
        where nullif(trim(s.sire_name),'') is not null
          and not exists (select 1 from dogs d where d.name = trim(s.sire_name) and d.sex='♂')),
       '0'
union all
select '② 取りこぼし', 'CSVにあるが投入できなかったワクチン',
       (select count(*)::text from stg_vaccinations s
        where nullif(s.dosed_on,'') is not null
          and not exists (select 1 from dogs d where d.name = trim(s.dog_name))),
       '0'
union all
select '② 取りこぼし', '重複で弾かれた出産記録',
       ((select count(*) from stg_litters where nullif(birth_date,'') is not null)
        - (select count(*) from litters))::text,
       '0（review.csvの重複件数と一致すればOK）'

-- ── 3. データ品質（法令・要件） ─────────────
union all
select '③ データ品質', 'マイクロチップが未登録の犬',
       (select count(*)::text from dogs where microchip is null and deleted_at is null),
       '0（移行直後は5＝つばさ・プラダ（退役）・外交配3頭）'
union all
select '③ データ品質', '所有日が空の犬（法令の帳簿項目）',
       (select count(*)::text from dogs where acquired_on is null and deleted_at is null),
       '0（移行直後は44。仕入れた犬と外交配の♂は台帳に取得日が無いため手入力が必要）'
union all
select '③ データ品質', '誕生日が空の犬',
       (select count(*)::text from dogs where birthday is null and deleted_at is null),
       '0（移行直後は3＝外交配の♂。他犬舎の犬なので誕生日は不明）'
union all
select '③ データ品質', '毛色が正規化されていない犬',
       (select count(*)::text from dogs
        where color is not null and color <> '' and color_code is null and deleted_at is null), '0'
union all
select '③ データ品質', '分娩方法が空の出産記録',
       (select count(*)::text from litters where method is null and deleted_at is null),
       '0（移行直後は1＝テテ 2023-08-31。出産日が誤りとのことで確認待ち）'
union all
select '④ 法令', '外交配の♂が帳簿に出ていないこと',
       (select count(*)::text from v_ledger l
        where exists (select 1 from dogs d where d.id = l.id and d.is_external)), '0'
union all
select '④ 法令', '外交配として登録した♂',
       (select count(*)::text from dogs where is_external and deleted_at is null), '3'
union all
select '③ データ品質', '同名の犬',
       (select coalesce(count(*),0)::text from
         (select name from dogs where deleted_at is null group by name having count(*) > 1) t), '0'
order by 1, 2;


-- ── 4. 計算値が正しく出るか（目視） ────────────
-- 出産履歴のある母犬の上位10頭
select d.name as 母犬, d.breed_code as 犬種,
       s.litter_count as 出産回数, s.last_birth_date as 最新出産日,
       s.next_mating_month as 次回交配可能月
from v_dam_summary s join dogs d on d.id = s.dog_id
where s.litter_count > 0
order by s.last_birth_date desc nulls last
limit 10;

-- 仔犬検診日（出産日+49日）が正しいか
select dam_name as 母犬, birth_date as 出産日, checkup_date as 仔犬検診,
       (checkup_date - birth_date) as 日数差
from v_litters order by birth_date desc limit 5;

-- ミックス判定（父が未登録なら NULL になること）
select dam_name as 母, sire_name as 父, is_mix as ミックス判定, count(*) over () as 全件
from v_litters where is_mix is distinct from false limit 20;

-- 毛色・毛質の分布
select coalesce(cc.name, '（未正規化）') as 毛色,
       coalesce(ct.name, '（なし）')     as 毛質,
       count(*) as 頭数
from dogs d
left join coat_colors cc on cc.code = d.color_code
left join coat_types  ct on ct.code = d.coat_type_code
where d.deleted_at is null
group by 1, 2 order by 3 desc;
