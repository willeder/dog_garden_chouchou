-- ============================================================
-- 全消去して作り直したいときだけ実行する
-- ⚠ public スキーマのデータがすべて消えます。運用開始後は絶対に実行しないこと。
-- 実行後に schema.sql を頭から流し直してください。
-- ============================================================
drop schema public cascade;
create schema public;

-- Supabase の既定権限を復元する
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all   on schema public to postgres, service_role;

alter default privileges in schema public grant all on tables    to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to postgres, anon, authenticated, service_role;
