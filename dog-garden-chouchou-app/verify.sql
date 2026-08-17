-- ============================================================
-- 状態確認クエリ（何度実行しても安全。読み取りのみ）
-- Supabase の SQL Editor に貼って実行してください。
-- すべて「期待値」と一致していればOKです。
-- ============================================================
select 'テーブル数' as 項目, count(*)::text as 現在, '11' as 期待値
from pg_tables where schemaname='public'
union all
select 'ビュー数', count(*)::text, '6' from pg_views where schemaname='public'
union all
select '関数数', count(*)::text, '4'
from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public'
union all
select 'RLSポリシー数', count(*)::text, '15' from pg_policies where schemaname='public'
union all
select 'RLS無効のテーブル', coalesce(string_agg(relname, ', '), 'なし'), 'なし'
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relkind='r' and not c.relrowsecurity
union all
select 'security_invoker未設定のビュー', coalesce(string_agg(c.relname, ', '), 'なし'), 'なし'
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relkind='v'
  and coalesce((select option_value from pg_options_to_table(c.reloptions)
                where option_name='security_invoker'),'off')='off'
union all
select 'search_path未設定の関数', coalesce(string_agg(p.proname, ', '), 'なし'), 'なし'
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proconfig is null
union all
select 'anonが読める内部ビュー', coalesce(string_agg(c.relname, ', '), 'なし'), 'なし'
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relkind='v'
  and c.relname <> 'v_public_puppies'
  and has_table_privilege('anon', c.oid, 'SELECT')
union all
select 'anonがv_public_puppiesを読めるか',
       has_table_privilege('anon','public.v_public_puppies','SELECT')::text, 'true'
union all
select '不足している外部キー索引', coalesce(string_agg(idx, ', '), 'なし'), 'なし'
from (
  select i.idx from (values
    ('dogs_breeder_id_idx'),('dogs_supplier_id_idx'),('dogs_color_code_idx'),
    ('dogs_coat_type_code_idx'),('dogs_ribbon_code_idx'),
    ('litters_sire_id_idx'),('sales_customer_id_idx')
  ) i(idx)
  where not exists (select 1 from pg_indexes p
                    where p.schemaname='public' and p.indexname = i.idx)
) t;
