import Link from 'next/link';
import { createClient } from '@/app/_lib/supabase/server';
import { ymd } from '@/app/_lib/admFormat';
import type { Breed, DogListRow, DogListItem, DogStatus } from '@/app/_model/admin';
import { BreedBar, ColorDot } from '@/app/(admin)/_components/Marks';
import { PUBLIC_BUCKET, publicPhotoUrl } from '@/app/_lib/supabase/storage';
import { SearchBox } from './SearchBox';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ q?: string; breed?: string; g?: string }> };

const GROUPS = [
  { key: 'dam', label: '♀ 母犬' },
  { key: 'sire', label: '♂ 種雄犬' },
  { key: 'retired', label: '退役' },
] as const;

export default async function DogsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = (sp.q ?? '').trim();
  const breed = sp.breed ?? 'all';
  const group = (GROUPS.find((g) => g.key === sp.g)?.key ?? 'dam') as (typeof GROUPS)[number]['key'];

  const supabase = await createClient();

  let query = supabase
    .from('dogs')
    .select(
      `id, name, sex, breed_code, birthday, weight_kg, microchip,
       color_code, coat_type_code, status, is_external,
       breeds ( code, name, hex ),
       coat_colors ( code, name, hex, hex2 )`,
    )
    .is('deleted_at', null)
    .eq('is_external', false);

  if (group === 'dam') query = query.eq('sex', '♀').in('status', ['在籍', '預託']);
  if (group === 'sire') query = query.eq('sex', '♂').in('status', ['在籍', '預託']);
  if (group === 'retired') query = query.eq('status', '退役' satisfies DogStatus);

  if (breed !== 'all') query = query.eq('breed_code', breed);

  if (q) {
    // 現場ではチップ番号の下4桁で照合する。名前と番号のどちらでも引けるようにする。
    const digits = q.replace(/\D/g, '');
    const conds = [`name.ilike.%${q}%`];
    if (digits) conds.push(`microchip.ilike.%${digits}%`);
    query = query.or(conds.join(','));
  }

  const [{ data: dogsRaw, error }, { data: breedsRaw }, { data: summaryRaw }, { data: photoRaw }] =
    await Promise.all([
      query.order('name'),
      supabase.from('breeds').select('code, name, hex').order('code'),
      supabase.from('v_dam_summary').select('dog_id, litter_count, last_birth_date, next_mating_month'),
      // 一覧のサムネイル。公開バケットのものだけ使う。
      // 非公開は署名URLが必要で、一覧で何十件も署名すると重くなる。
      supabase
        .from('dog_photos')
        .select('dog_id, path, sort_order')
        .eq('bucket', PUBLIC_BUCKET)
        .order('sort_order'),
    ]);

  const dogs = (dogsRaw ?? []) as unknown as DogListRow[];
  const breeds = (breedsRaw ?? []) as Breed[];
  type Summary = {
    dog_id: string;
    litter_count: number | null;
    last_birth_date: string | null;
    next_mating_month: string | null;
  };
  const summary = new Map<string, Summary>(
    ((summaryRaw ?? []) as unknown as Summary[]).map((s) => [s.dog_id, s]),
  );

  // 犬ごとの1枚目だけ拾う
  const thumb = new Map<string, string>();
  for (const p of (photoRaw ?? []) as { dog_id: string; path: string }[]) {
    if (!thumb.has(p.dog_id)) thumb.set(p.dog_id, publicPhotoUrl(p.path));
  }

  const items: DogListItem[] = dogs.map((d) => {
    const s = summary.get(d.id);
    return {
      ...d,
      litter_count: s?.litter_count ?? 0,
      last_birth_date: s?.last_birth_date ?? null,
      next_mating_month: s?.next_mating_month ?? null,
    };
  });

  // 出産回数の多い順。よく開く犬が上に来る。
  items.sort((a, b) => b.litter_count - a.litter_count || a.name.localeCompare(b.name, 'ja'));

  const breedCounts = new Map<string, number>();
  for (const d of dogs) breedCounts.set(d.breed_code, (breedCounts.get(d.breed_code) ?? 0) + 1);

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-adm-rule bg-adm-surface px-4 pb-2.5 pt-3">
        <h1 className="text-[17px] font-bold tracking-tight">犬</h1>
        <p className="num text-[11.5px] text-adm-muted">{items.length}頭</p>
      </header>

      <div className="flex flex-col gap-2 px-4 pt-2.5">
        <SearchBox initial={q} />

        <Chips
          items={[
            { key: 'all', label: 'すべて' },
            ...breeds.map((b) => ({ key: b.code, label: `${b.code} ${breedCounts.get(b.code) ?? 0}` })),
          ]}
          active={breed}
          param="breed"
          keep={{ q, g: group }}
        />

        <Chips
          items={GROUPS.map((g) => ({ key: g.key, label: g.label }))}
          active={group}
          param="g"
          keep={{ q, breed }}
        />
      </div>

      <div className="px-4 pt-3.5">
        {error ? (
          <p className="rounded-xl border border-adm-rule bg-adm-surface px-3.5 py-3 text-[13px] text-adm-danger">
            読み込めませんでした。通信を確認してもう一度お試しください。
          </p>
        ) : items.length === 0 ? (
          <p className="rounded-xl border border-adm-rule bg-adm-surface px-3.5 py-3 text-[12.5px] text-adm-muted">
            {q ? `「${q}」に一致する犬はいません` : '該当なし'}
          </p>
        ) : (
          <ul className="overflow-hidden rounded-xl border border-adm-rule bg-adm-surface">
            {items.map((d) => (
              <li key={d.id} className="border-b border-adm-rule last:border-b-0">
                <Link
                  href={`/admin/dogs/${d.id}`}
                  className="tap flex items-center gap-3 px-3.5 py-2.5 active:bg-adm-paper"
                >
                  <BreedBar hex={d.breeds?.hex} label={d.breeds?.name} />
                  {thumb.has(d.id) ? (
                    // 写真が入っている犬は顔を出す。台帳が「うちの子たちの一覧」に見える。
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumb.get(d.id)}
                      alt=""
                      className="h-[38px] w-[38px] shrink-0 rounded-full border border-adm-rule bg-adm-paper object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <ColorDot
                      hex={d.coat_colors?.hex}
                      hex2={d.coat_colors?.hex2}
                      label={d.coat_colors?.name}
                    />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-medium">
                      {d.name}
                      {d.status === '退役' && (
                        <span className="ml-1.5 align-middle text-[11px] font-normal text-adm-muted">退役</span>
                      )}
                    </span>
                    <span className="num block truncate text-[11.5px] text-adm-muted">
                      {q && d.microchip && matchesDigits(q, d.microchip)
                        ? highlightTail(d.microchip, q)
                        : `${ymd(d.birthday)}${d.weight_kg ? `　${d.weight_kg}kg` : ''}`}
                    </span>
                  </span>
                  {d.sex === '♀' && d.litter_count > 0 && (
                    <span className="shrink-0 text-right">
                      <span className="num block text-[13px]">{d.litter_count}回</span>
                      <span className="num block text-[11px] text-adm-muted">{ymd(d.last_birth_date)}</span>
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="h-6" />
    </>
  );
}

function matchesDigits(q: string, chipNo: string) {
  const d = q.replace(/\D/g, '');
  return d.length > 0 && chipNo.includes(d);
}

/** 一致した部分が末尾に見えるよう、下4桁まわりを切り出して見せる */
function highlightTail(chipNo: string, q: string) {
  const d = q.replace(/\D/g, '');
  const at = chipNo.indexOf(d);
  if (at < 0) return chipNo;
  const head = chipNo.slice(Math.max(0, at - 6), at);
  return `…${head} ${d}`;
}

function Chips({
  items,
  active,
  param,
  keep,
}: {
  items: { key: string; label: string }[];
  active: string;
  param: string;
  keep: Record<string, string>;
}) {
  return (
    <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {items.map((it) => {
        const params = new URLSearchParams();
        for (const [k, v] of Object.entries(keep)) if (v && v !== 'all') params.set(k, v);
        if (it.key !== 'all') params.set(param, it.key);
        const on = active === it.key;
        return (
          <Link
            key={it.key}
            href={`/admin/dogs${params.size ? `?${params}` : ''}`}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[12.5px] leading-6 ${
              on
                ? 'border-adm-action bg-adm-action font-medium text-white'
                : 'border-adm-rule bg-adm-surface text-adm-muted'
            }`}
          >
            {it.label}
          </Link>
        );
      })}
    </div>
  );
}
