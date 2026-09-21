-- 仔犬ページに動画を1本だけ任意で載せる。
-- 写真（dog_photos）とは別枠。1頭1本なので dogs に列を1つ持たせる。

-- 1. 動画の保存先パス（dogs-video バケット内）。空なら動画なし
alter table dogs add column if not exists video_path text;

-- 2. 動画用の公開バケット。写真の dogs-public は画像専用・10MBのため分ける。
--    50MB は Supabase 無料プランの1ファイル上限に合わせている。
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('dogs-video', 'dogs-video', true, 52428800,
        array['video/mp4', 'video/quicktime', 'video/webm'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 書き込みはスタッフのみ（読み取りは public バケットなので誰でも可）
drop policy if exists dogs_video_staff_write on storage.objects;
create policy dogs_video_staff_write on storage.objects
  for all to authenticated
  using (bucket_id = 'dogs-video' and private.is_staff())
  with check (bucket_id = 'dogs-video' and private.is_staff());

-- 3. 公開ビューに動画を足す（列は末尾に追加。既存列の並びは変えない）
create or replace view v_public_puppies as
 SELECT d.id,
    d.name,
    d.sex,
    d.birthday,
    d.status,
    b.name AS breed_name,
    b.explanation AS breed_explanation,
    cc.name AS color_name,
    ct.name AS coat_type_name,
    d.weight_kg,
    d.expected_weight_kg,
    d.expected_height_cm,
    d.list_price,
    d.public_message,
    d.created_at,
    COALESCE(( SELECT jsonb_agg(jsonb_build_object('path', p.path, 'width', p.width, 'height', p.height) ORDER BY p.sort_order, p.created_at) AS jsonb_agg
           FROM dog_photos p
          WHERE p.dog_id = d.id AND p.bucket = 'dogs-public'::text), '[]'::jsonb) AS photos,
        CASE
            WHEN dam.id IS NULL THEN NULL::jsonb
            ELSE jsonb_build_object('id', dam.id, 'name', dam.name, 'sex', dam.sex, 'breed', dam_b.name, 'birthday', dam.birthday, 'color', dam_cc.name, 'weight', dam.weight_kg, 'photo', ( SELECT jsonb_build_object('path', p.path, 'width', p.width, 'height', p.height) AS jsonb_build_object
               FROM dog_photos p
              WHERE p.dog_id = dam.id AND p.bucket = 'dogs-public'::text
              ORDER BY p.sort_order
             LIMIT 1))
        END AS mother,
        CASE
            WHEN sire.id IS NULL THEN NULL::jsonb
            ELSE jsonb_build_object('id', sire.id, 'name', sire.name, 'sex', sire.sex, 'breed', sire_b.name, 'birthday', sire.birthday, 'color', sire_cc.name, 'weight', sire.weight_kg, 'photo', ( SELECT jsonb_build_object('path', p.path, 'width', p.width, 'height', p.height) AS jsonb_build_object
               FROM dog_photos p
              WHERE p.dog_id = sire.id AND p.bucket = 'dogs-public'::text
              ORDER BY p.sort_order
             LIMIT 1))
        END AS father,
    d.video_path
   FROM dogs d
     JOIN breeds b ON b.code = d.breed_code
     LEFT JOIN coat_colors cc ON cc.code = d.color_code
     LEFT JOIN coat_types ct ON ct.code = d.coat_type_code
     LEFT JOIN dogs dam ON dam.id = d.dam_id AND dam.deleted_at IS NULL
     LEFT JOIN breeds dam_b ON dam_b.code = dam.breed_code
     LEFT JOIN coat_colors dam_cc ON dam_cc.code = dam.color_code
     LEFT JOIN dogs sire ON sire.id = d.sire_id AND sire.deleted_at IS NULL
     LEFT JOIN breeds sire_b ON sire_b.code = sire.breed_code
     LEFT JOIN coat_colors sire_cc ON sire_cc.code = sire.color_code
  WHERE d.deleted_at IS NULL AND d.is_external = false AND d.is_published = true AND (d.status = ANY (ARRAY['在舎'::dog_status, '商談中'::dog_status, '売約'::dog_status]));

alter view v_public_puppies set (security_invoker = off);
grant select on v_public_puppies to anon, authenticated;
