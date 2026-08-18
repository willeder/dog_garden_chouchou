import Link from 'next/link';
import { createClient } from '@/app/_lib/supabase/server';
import { ymd, ageLabel, todayJst } from '@/app/_lib/admFormat';
import type { DogStatus } from '@/app/_model/admin';
import { BreedBar, ColorDot } from '@/app/(admin)/_components/Marks';
import { PUBLIC_BUCKET, publicPhotoUrl } from '@/app/_lib/supabase/storage';
import { LitterActions } from './LitterActions';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ s?: string }> };

/**
 * 仔犬一覧。
 *
 * puppies テーブルは作らない。dogs のうち litter_id が入っているものが仔犬。
 * 同じ腹をまとめて出すのは、現場で「あの腹の子」という単位で扱うため。
 */
const FILTERS = [
  { key: 'active', label: '販売前', statuses: ['在舎', '商談中', '売約'] as DogStatus[] },
  { key: '在舎', label: '在舎', statuses: ['在舎'] as DogStatus[] },
  { key: '商談中', label: '商談中', statuses: ['商談中'] as DogStatus[] },
  { key: '売約', label: '売約', statuses: ['売約'] as DogStatus[] },
  { key: '引渡済', label: '引渡済', statuses: ['引渡済'] as DogStatus[] },
] as const;

type Row = {
  id: string;
  name: string;
  sex: string;
  breed_code: string;
  birthday: string | null;
  weight_kg: number | null;
  status: DogStatus;
  is_published: boolean;
  litter_id: string | null;
  ribbon_code: string | null;
  breeds: { name: string; hex: string } | null;
  coat_colors: { name: string; hex: string; hex2: string | null } | null;
  ribbon_colors: { name: string; hex: string } | null;
};

export default async function PuppiesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const filter = FILTERS.find((f) => f.key === sp.s) ?? FILTERS[0];

  const supabase = await createClient();

  const [{ data: rowsRaw }, { data: photoRaw }] = await Promise.all([
    supabase
      .from('dogs')
      .select(
        `id, name, sex, breed_code, birthday, weight_kg, status, is_published,
         litter_id, ribbon_code,
         breeds ( name, hex ),
         coat_colors ( name, hex, hex2 ),
         ribbon_colors ( name, hex )`,
      )
      .is('deleted_at', null)
      .not('litter_id', 'is', null)
      .in('status', filter.statuses)
      .order('birthday', { ascending: false })
      .order('name'),
    supabase.from('dog_photos').select('dog_id, path, sort_order').eq('bucket', PUBLIC_BUCKET).order('sort_order'),
  ]);

  const rows = (rowsRaw ?? []) as unknown as Row[];

  const thumb = new Map<string, string>();
  for (const p of (photoRaw ?? []) as { dog_id: string; path: string }[]) {
    if (!thumb.has(p.dog_id)) thumb.set(p.dog_id, publicPhotoUrl(p.path));
  }

  // 腹の情報（母犬名と出産日）をまとめて引く
  const litterIds = [...new Set(rows.map((r) => r.litter_id).filter(Boolean))] as string[];
  const litters = litterIds.length
    ? (
        await supabase
          .from('v_litters')
          .select('id, dam_id, dam_name, birth_date')
          .in('id', litterIds)
      ).data ?? []
    : [];
  type L = { id: string; dam_id: string; dam_name: string; birth_date: string };
  const litterMap = new Map<string, L>((litters as unknown as L[]).map((l) => [l.id, l]));

  // 腹ごとにまとめ、新しい腹を上に
  const groups = new Map<string, Row[]>();
  for (const r of rows) {
    const k = r.litter_id ?? 'none';
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(r);
  }
  const ordered = [...groups.entries()].sort((a, b) => {
    const ba = litterMap.get(a[0])?.birth_date ?? '';
    const bb = litterMap.get(b[0])?.birth_date ?? '';
    return bb.localeCompare(ba);
  });

  // 引渡済の絞り込みで足しても、その子は「在舎」なので画面に出ず混乱する。
  // 在舎が含まれる絞り込みのときだけ追加ボタンを出す。
  const canAdd = filter.key === 'active' || filter.key === '在舎';

  const today = todayJst();
  const publishedCount = rows.filter((r) => r.is_published).length;

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-adm-rule bg-adm-surface px-4 pb-2.5 pt-3">
        <h1 className="text-[17px] font-bold tracking-tight">仔犬</h1>
        <p className="num text-[11.5px] text-adm-muted">
          {rows.length}頭　うちサイト公開 {publishedCount}頭
        </p>
      </header>

      <div className="-mx-0 flex gap-1.5 overflow-x-auto px-4 pt-2.5 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === 'active' ? '/admin/puppies' : `/admin/puppies?s=${encodeURIComponent(f.key)}`}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[12.5px] leading-6 ${
              f.key === filter.key
                ? 'border-adm-action bg-adm-action font-medium text-white'
                : 'border-adm-rule bg-adm-surface text-adm-muted'
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {ordered.length === 0 ? (
        <div className="mx-4 mt-3.5 rounded-xl border border-adm-rule bg-adm-surface px-3.5 py-3.5">
          <p className="text-[12.5px] leading-relaxed text-adm-muted">
            該当する仔犬がいません。仔犬は「出産を記録」から登録します。
            母犬・出産日・♂♀の頭数を入れると、頭数ぶんの仔犬が仮の名前で作られます。
          </p>
          <Link
            href="/admin/litters/new"
            className="tap mt-3 flex items-center justify-center rounded-xl bg-adm-action px-4 py-3 text-[14px] font-bold text-white"
          >
            ＋ 出産を記録する
          </Link>
        </div>
      ) : (
        ordered.map(([litterId, pups]) => {
          const l = litterMap.get(litterId);
          return (
            <section key={litterId} className="px-4 pt-3.5">
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-[13px] font-bold tracking-wide">
                  {l ? (
                    <Link href={`/admin/dogs/${l.dam_id}?t=${encodeURIComponent('出産')}`} className="text-adm-action">
                      {l.dam_name}
                    </Link>
                  ) : (
                    '腹の情報なし'
                  )}
                  {l && <span className="num ml-2 font-normal text-adm-muted">{ymd(l.birth_date)}</span>}
                </h2>
                <span className="num text-[12px] text-adm-muted">
                  {pups.length}頭{l && `　${ageLabel(l.birth_date, today)}`}
                </span>
              </div>

              <ul className="overflow-hidden rounded-xl border border-adm-rule bg-adm-surface">
                {pups.map((p) => (
                  <li key={p.id} className="border-b border-adm-rule last:border-b-0">
                    <Link
                      href={`/admin/dogs/${p.id}`}
                      className="tap flex items-center gap-3 px-3.5 py-2.5 active:bg-adm-paper"
                    >
                      <BreedBar hex={p.breeds?.hex} label={p.breeds?.name} />
                      {thumb.has(p.id) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumb.get(p.id)}
                          alt=""
                          className="h-[38px] w-[38px] shrink-0 rounded-full border border-adm-rule bg-adm-paper object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <RibbonDot
                          colorHex={p.coat_colors?.hex}
                          colorHex2={p.coat_colors?.hex2}
                          ribbonHex={p.ribbon_colors?.hex}
                          label={[p.coat_colors?.name, p.ribbon_colors?.name && `紐${p.ribbon_colors.name}`]
                            .filter(Boolean)
                            .join('・')}
                        />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-medium">
                          {p.name}
                          {/* 仮名は末尾が「♂1」のように性別を含む。二重に出さない */}
                          {!p.name.includes(p.sex) && (
                            <span className="num ml-1.5 text-[12px] font-normal text-adm-muted">{p.sex}</span>
                          )}
                        </span>
                        <span className="block truncate text-[11.5px] text-adm-muted">
                          {[
                            p.coat_colors?.name,
                            p.ribbon_colors?.name && `紐 ${p.ribbon_colors.name}`,
                            p.weight_kg && `${p.weight_kg}kg`,
                          ]
                            .filter(Boolean)
                            .join('　') || '未登録'}
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block text-[12px]">{p.status}</span>
                        {p.is_published && (
                          <span className="block text-[10.5px] text-adm-action">サイト公開中</span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              {canAdd && l && <LitterActions litterId={litterId} damName={l.dam_name} />}
            </section>
          );
        })
      )}

      {ordered.length > 0 && (
        <p className="px-4 pb-2 pt-6 text-[11.5px] leading-relaxed text-adm-muted">
          名前を押すとカルテが開きます。写真が入っている子は顔が出ます。
          写真が無い子は毛色の丸と紐の色で見分けます。
        </p>
      )}

      {/* 固定ボタンに隠れるぶんの余白 */}
      <div className="h-24" />
      <div className="fixed inset-x-0 bottom-[58px] z-20 mx-auto max-w-2xl px-4 pb-3">
        <Link
          href="/admin/litters/new"
          className="tap flex items-center justify-center rounded-xl bg-adm-action px-4 py-3.5 text-[14.5px] font-bold text-white shadow-lg"
        >
          ＋ 出産を記録して仔犬を登録
        </Link>
      </div>
    </>
  );
}

/**
 * 毛色の丸に、紐の色を外周の輪として重ねる。
 * 同じ腹は毛色が似るので、紐で見分けるのが現場のやり方。
 */
function RibbonDot({
  colorHex,
  colorHex2,
  ribbonHex,
  label,
}: {
  colorHex?: string | null;
  colorHex2?: string | null;
  ribbonHex?: string | null;
  label?: string;
}) {
  if (!ribbonHex) return <ColorDot hex={colorHex} hex2={colorHex2} label={label} />;
  return (
    <span
      className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full"
      style={{ background: ribbonHex }}
      role="img"
      aria-label={label}
    >
      <ColorDot hex={colorHex} hex2={colorHex2} size={28} />
    </span>
  );
}
