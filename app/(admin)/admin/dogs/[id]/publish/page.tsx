import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/app/_lib/supabase/server';
import { PUBLIC_BUCKET } from '@/app/_lib/supabase/storage';
import { PublishForm, type Check } from './PublishForm';
import { PUBLISHABLE_STATUSES, type PublishInput } from './shared';
import type { DogStatus } from '@/app/_model/admin';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

type DogRow = {
  id: string;
  name: string;
  status: DogStatus;
  is_external: boolean;
  birthday: string | null;
  color_code: string | null;
  weight_kg: number | null;
  is_published: boolean;
  list_price: number | null;
  expected_weight_kg: number | null;
  expected_height_cm: number | null;
  public_message: string | null;
};

export default async function PublishPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: dogRaw } = await supabase
    .from('dogs')
    .select(
      `id, name, status, is_external, birthday, color_code, weight_kg,
       is_published, list_price, expected_weight_kg, expected_height_cm, public_message`,
    )
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  if (!dogRaw) notFound();
  const dog = dogRaw as unknown as DogRow;

  const { count: photoCount } = await supabase
    .from('dog_photos')
    .select('id', { count: 'exact', head: true })
    .eq('dog_id', id)
    .eq('bucket', PUBLIC_BUCKET);

  const photos = photoCount ?? 0;
  const statusOk = (PUBLISHABLE_STATUSES as readonly string[]).includes(dog.status);

  /**
   * 公開の条件は v_public_puppies が持っている。
   * ここはその条件を人の言葉に置き換えたもの。ビューを変えたらここも変えること。
   */
  const checks: Check[] = [
    {
      label: '「サイト用」の写真がある',
      ok: photos > 0,
      blocking: true,
      detail: photos > 0 ? `${photos}枚` : '写真がないと一覧に何も出ません',
      fixHref: `/admin/dogs/${id}?t=${encodeURIComponent('写真')}`,
      fixLabel: '写真へ',
    },
    {
      label: '状態が「在舎」「商談中」「売約」のどれか',
      ok: statusOk,
      blocking: true,
      detail: `いまは「${dog.status}」`,
      fixHref: `/admin/dogs/${id}/edit`,
      fixLabel: '編集へ',
    },
    {
      label: '誕生日が入っている',
      ok: !!dog.birthday,
      blocking: true,
      detail: dog.birthday ? undefined : 'サイトで月齢を出すために必要です',
      fixHref: `/admin/dogs/${id}/edit`,
      fixLabel: '編集へ',
    },
    {
      label: '外部の種雄犬ではない',
      ok: !dog.is_external,
      blocking: true,
      detail: dog.is_external ? '外部の犬はサイトに出せません' : undefined,
    },
    {
      label: '毛色が入っている',
      ok: !!dog.color_code,
      blocking: false,
      detail: dog.color_code ? undefined : '空欄だと毛色の欄が出ません',
      fixHref: `/admin/dogs/${id}/edit`,
      fixLabel: '編集へ',
    },
    {
      label: 'いまの体重が入っている',
      ok: dog.weight_kg !== null,
      blocking: false,
      detail: dog.weight_kg !== null ? `${dog.weight_kg}kg` : '空欄だと体重の欄が出ません',
      fixHref: `/admin/dogs/${id}/edit`,
      fixLabel: '編集へ',
    },
    {
      label: '価格が入っている',
      ok: dog.list_price !== null,
      blocking: false,
      detail: dog.list_price !== null ? `${dog.list_price.toLocaleString('ja-JP')}円` : '空欄のときは「応相談」の扱いです',
    },
    {
      label: 'この子の紹介が書いてある',
      ok: !!dog.public_message,
      blocking: false,
      detail: dog.public_message ? undefined : '性格が分かる文があると問い合わせにつながります',
    },
  ];

  const initial: PublishInput = {
    is_published: dog.is_published,
    list_price: dog.list_price === null ? '' : String(dog.list_price),
    expected_weight_kg: dog.expected_weight_kg === null ? '' : String(dog.expected_weight_kg),
    expected_height_cm: dog.expected_height_cm === null ? '' : String(dog.expected_height_cm),
    public_message: dog.public_message ?? '',
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center gap-2.5 border-b border-adm-rule bg-adm-surface px-3 pb-2.5 pt-3">
        <Link
          href={`/admin/dogs/${id}`}
          aria-label="やめて戻る"
          className="tap flex w-[38px] items-center justify-center rounded-lg border border-adm-rule text-[15px] text-adm-muted"
        >
          ‹
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-[17px] font-bold tracking-tight">{dog.name} のサイト公開</h1>
          <p className="text-[11.5px] text-adm-muted">
            {dog.is_published ? '公開中' : '出していません'}・保存を押すまで変わりません
          </p>
        </div>
      </header>

      <PublishForm
        dogId={id}
        dogName={dog.name}
        initial={initial}
        checks={checks}
        publicPath={`/puppies/${id}`}
      />
    </>
  );
}
