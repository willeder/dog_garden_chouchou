import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/app/_lib/supabase/server';
import { ymd, ym, chip, ageLabel, todayJst } from '@/app/_lib/admFormat';
import type { DogDetail, LitterRow, VaccinationRow, VaccineDueRow } from '@/app/_model/admin';
import { BreedChip, ColorDot } from '@/app/(admin)/_components/Marks';
import { PhotoManager, type PhotoItem } from './PhotoManager';
import { PRIVATE_BUCKET, PUBLIC_BUCKET, publicPhotoUrl } from '@/app/_lib/supabase/storage';

export const dynamic = 'force-dynamic';

const TABS = ['基本', '写真', '出産', '血統', 'ワクチン'] as const;
type Tab = (typeof TABS)[number];

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
};

export default async function DogPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const tab: Tab = (TABS as readonly string[]).includes(sp.t ?? '') ? (sp.t as Tab) : '基本';

  const supabase = await createClient();

  const { data: dogRaw } = await supabase
    .from('dogs')
    .select(
      `id, name, sex, breed_code, birthday, weight_kg, microchip, color, color_code,
       coat_type_code, status, is_external, genes, breeder_note, is_self_bred,
       acquired_on, died_on, note, sire_id, dam_id, is_published,
       breeds ( code, name, hex ),
       coat_colors ( code, name, hex, hex2 ),
       coat_types ( code, name ),
       breeder:partners!dogs_breeder_id_fkey ( name, contact_name, license_no ),
       supplier:partners!dogs_supplier_id_fkey ( name, contact_name, license_no )`,
    )
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  if (!dogRaw) notFound();
  const dog = dogRaw as unknown as DogDetail;

  const [{ data: littersRaw }, { data: vaccRaw }, { data: dueRaw }, { data: photoRaw }] = await Promise.all([
    supabase
      .from('v_litters')
      .select('id, birth_date, sire_id, sire_name, gestation_days, method, male_count, female_count, stillborn_count, note, checkup_date, is_mix')
      .eq('dam_id', id)
      .is('deleted_at', null)
      .order('birth_date', { ascending: false }),
    supabase
      .from('vaccinations')
      .select('id, kind, dosed_on, note')
      .eq('dog_id', id)
      .order('dosed_on', { ascending: false }),
    supabase.from('v_vaccine_due').select('kind, last_dosed_on, next_due_on').eq('dog_id', id),
    supabase
      .from('dog_photos')
      .select('id, bucket, path, width, height, sort_order')
      .eq('dog_id', id)
      .order('sort_order')
      .order('created_at'),
  ]);

  const litters = (littersRaw ?? []) as LitterRow[];
  const vaccinations = (vaccRaw ?? []) as VaccinationRow[];
  const due = (dueRaw ?? []) as VaccineDueRow[];

  type PhotoRow = Omit<PhotoItem, 'url'>;
  const photoRows = (photoRaw ?? []) as PhotoRow[];
  const publicPhotos: PhotoItem[] = photoRows
    .filter((p) => p.bucket === PUBLIC_BUCKET)
    .map((p) => ({ ...p, url: publicPhotoUrl(p.path) }));

  // 非公開バケットは公開URLが無いので、表示用に短命の署名URLを作る
  const privateRows = photoRows.filter((p) => p.bucket === PRIVATE_BUCKET);
  const signed = privateRows.length
    ? await supabase.storage
        .from(PRIVATE_BUCKET)
        .createSignedUrls(privateRows.map((p) => p.path), 60 * 30)
    : { data: [] as { signedUrl: string }[] };
  const privatePhotos: PhotoItem[] = privateRows.map((p, i) => ({
    ...p,
    url: signed.data?.[i]?.signedUrl ?? '',
  }));

  const mainPhoto = publicPhotos[0] ?? privatePhotos[0];

  /**
   * 血統。父と母を実際に引いてくる。
   * 名前・犬種・毛色・遺伝子までここで見えないと、次の交配を決められない。
   */
  const parentIds = [dog.sire_id, dog.dam_id].filter(Boolean) as string[];
  const { data: parentRaw } = parentIds.length
    ? await supabase
        .from('dogs')
        .select(
          `id, name, sex, breed_code, birthday, weight_kg, genes, dam_id, sire_id, is_external, status,
           breeds ( name, hex ), coat_colors ( name, hex, hex2 ), coat_types ( name )`,
        )
        .in('id', parentIds)
        .is('deleted_at', null)
    : { data: [] as unknown[] };

  const parents = new Map<string, Kin>(((parentRaw ?? []) as unknown as Kin[]).map((k) => [k.id, k]));
  const sire = dog.sire_id ? parents.get(dog.sire_id) ?? null : null;
  const dam = dog.dam_id ? parents.get(dog.dam_id) ?? null : null;

  // 祖父母は名前だけ出す。ここまで出せば「同じ血が濃くないか」の判断はできる
  const grandIds = [sire?.sire_id, sire?.dam_id, dam?.sire_id, dam?.dam_id].filter(Boolean) as string[];
  const { data: grandRaw } = grandIds.length
    ? await supabase.from('dogs').select('id, name').in('id', grandIds).is('deleted_at', null)
    : { data: [] as { id: string; name: string }[] };
  const grand = new Map<string, string>(
    ((grandRaw ?? []) as { id: string; name: string }[]).map((g) => [g.id, g.name]),
  );

  // 親の顔写真（サイト用の1枚目）
  const { data: parentPhotoRaw } = parentIds.length
    ? await supabase
        .from('dog_photos')
        .select('dog_id, path, sort_order')
        .in('dog_id', parentIds)
        .eq('bucket', PUBLIC_BUCKET)
        .order('sort_order')
    : { data: [] as { dog_id: string; path: string }[] };
  const parentPhoto = new Map<string, string>();
  for (const p of (parentPhotoRaw ?? []) as { dog_id: string; path: string }[]) {
    if (!parentPhoto.has(p.dog_id)) parentPhoto.set(p.dog_id, publicPhotoUrl(p.path));
  }

  const totalPups = litters.reduce((n, l) => n + l.male_count + l.female_count, 0);
  const nextMating = litters[0]
    ? shiftMonthIso(litters[0].birth_date, 5)
    : null;

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center gap-2.5 border-b border-adm-rule bg-adm-surface px-3 pb-2.5 pt-3">
        <Link
          href="/admin/dogs"
          aria-label="犬一覧へ戻る"
          className="tap flex w-[38px] items-center justify-center rounded-lg border border-adm-rule text-[15px] text-adm-muted"
        >
          ‹
        </Link>
        <h1 className="min-w-0 flex-1 truncate text-[17px] font-bold tracking-tight">{dog.name}</h1>
        <Link
          href={`/admin/dogs/${id}/edit`}
          className="tap flex shrink-0 items-center rounded-lg border border-adm-rule px-3 text-[13px] font-medium text-adm-action"
        >
          編集
        </Link>
      </header>

      <div className="border-b border-adm-rule bg-adm-surface px-4 pt-3.5">
        <div className="flex items-start gap-3">
          {mainPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mainPhoto.url}
              alt={`${dog.name} の写真`}
              className="h-14 w-14 shrink-0 rounded-full border border-adm-rule bg-adm-paper object-cover"
            />
          ) : (
            <ColorDot
              hex={dog.coat_colors?.hex}
              hex2={dog.coat_colors?.hex2}
              label={dog.coat_colors?.name}
              size={56}
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[21px] font-bold leading-tight">{dog.name}</p>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-adm-muted">
              <BreedChip code={dog.breed_code} hex={dog.breeds?.hex} />
              <span>{dog.breeds?.name} {dog.sex}</span>
              <span className="num">{ymd(dog.birthday)}</span>
              <span>{ageLabel(dog.birthday, todayJst())}</span>
            </p>
            <p className="num mt-1 text-[12px] text-adm-muted">{chip(dog.microchip)}</p>
          </div>
        </div>

        <dl className="mt-3.5 flex border-t border-adm-rule">
          <Stat v={dog.sex === '♀' && litters.length > 0 ? String(litters.length) : '—'} k="出産" />
          <Stat v={dog.sex === '♀' && litters.length > 0 ? String(totalPups) : '—'} k="産子" />
          <Stat v={dog.weight_kg ? String(dog.weight_kg) : '—'} k="体重kg" />
          <Stat v={nextMating ? ym(nextMating).replace(/^\d+年/, '') : '—'} k="交配可" />
        </dl>

        <nav className="grid grid-cols-5 border-t border-adm-rule">
          {TABS.map((t) => (
            <Link
              key={t}
              href={`/admin/dogs/${id}?t=${encodeURIComponent(t)}`}
              scroll={false}
              className={`tap flex items-center justify-center border-b-2 pb-2 pt-2.5 text-[13px] ${
                t === tab ? 'border-adm-action font-bold text-adm-action' : 'border-transparent text-adm-muted'
              }`}
            >
              {t}
            </Link>
          ))}
        </nav>
      </div>

      {tab === '基本' && <BasicTab dog={dog} />}
      {tab === '写真' && (
        <PhotoManager
          dogId={dog.id}
          dogName={dog.name}
          publicPhotos={publicPhotos}
          privatePhotos={privatePhotos}
        />
      )}
      {tab === '出産' && <LittersTab litters={litters} sex={dog.sex} />}
      {tab === '出産' && dog.sex === '♀' && (
        <div className="fixed inset-x-0 bottom-[58px] z-20 mx-auto max-w-2xl px-4 pb-3">
          <Link
            href={`/admin/litters/new?dam=${dog.id}`}
            className="tap flex items-center justify-center rounded-xl bg-adm-action px-4 py-3.5 text-[14.5px] font-bold text-white shadow-lg"
          >
            ＋ 出産を記録
          </Link>
        </div>
      )}
      {tab === '血統' && <PedigreeTab dog={dog} sire={sire} dam={dam} grand={grand} photo={parentPhoto} />}
      {tab === 'ワクチン' && <VaccineTab rows={vaccinations} due={due} dogId={id} />}

      <div className="h-6" />
    </>
  );
}

function Stat({ v, k }: { v: string; k: string }) {
  return (
    <div className="flex-1 border-r border-adm-rule px-1 py-2.5 text-center last:border-r-0">
      <dd className="num text-[17px] font-bold leading-tight">{v}</dd>
      <dt className="mt-0.5 text-[10.5px] text-adm-muted">{k}</dt>
    </div>
  );
}

/* ───────── 基本 ───────── */

function BasicTab({ dog }: { dog: DogDetail }) {
  const coat = dog.coat_types?.name;
  const colorLabel = dog.coat_colors?.name
    ? `${dog.coat_colors.name}${coat ? `・${coat}` : ''}`
    : dog.color || '未登録';

  return (
    <>
      <Section title="基本">
        <Dl
          rows={[
            ['犬種', dog.breeds?.name ?? dog.breed_code, 'ja'],
            ['性別', dog.sex, 'num'],
            ['誕生日', ymd(dog.birthday), 'num'],
            ['体重', dog.weight_kg ? `${dog.weight_kg} kg` : '—', 'num'],
            ['毛色・毛質', colorLabel, 'ja'],
            ['マイクロチップ', chip(dog.microchip), 'num'],
            ['遺伝子検査', dog.genes?.join('・') || '—', 'ja'],
            ['状態', dog.status, 'ja'],
          ]}
        />
      </Section>

      {(['在舎', '商談中', '売約'] as string[]).includes(dog.status) && (
        <Section title="公式サイト">
          <Link
            href={`/admin/dogs/${dog.id}/publish`}
            className="tap flex items-center justify-between gap-3 rounded-xl border border-adm-rule bg-adm-surface px-3.5 py-3 active:bg-adm-paper"
          >
            <span className="text-[13.5px] font-medium">サイト公開の設定</span>
            <span className="shrink-0 text-[13px] text-adm-muted">
              <span className={dog.is_published ? 'font-bold text-adm-action' : ''}>
                {dog.is_published ? '公開中' : '出していません'}
              </span>
              <span className="ml-1.5">›</span>
            </span>
          </Link>
        </Section>
      )}

      <Section title="帳簿の項目" note="法令">
        <Dl
          rows={[
            [
              '繁殖者',
              dog.is_self_bred
                ? '自家繁殖'
                : dog.breeder
                  ? `${dog.breeder.name}${dog.breeder.contact_name ? `（${dog.breeder.contact_name}）` : ''}`
                  : MISSING,
              'ja',
            ],
            ['繁殖者の登録番号', dog.is_self_bred ? '—' : dog.breeder?.license_no || MISSING, 'num'],
            ['入手先', dog.is_self_bred ? '—' : dog.supplier?.name || MISSING, 'ja'],
            ['所有した日', dog.acquired_on ? ymd(dog.acquired_on) : MISSING, 'num'],
            ['死亡した日', dog.died_on ? ymd(dog.died_on) : '—', 'num'],
          ]}
        />
        <p className="mt-2.5 rounded-xl border border-adm-rule bg-adm-hint px-3 py-2.5 text-[11.5px] leading-relaxed text-adm-muted">
          <b className="text-adm-ink">「未入力」は動物愛護管理法の帳簿に必要な項目です。</b>
          自家繁殖の犬は誕生日が所有日として自動で入ります。仕入れた犬は現行台帳に取得日の記録がないため、
          購入時の書類から補ってください。
        </p>
      </Section>

      {dog.note && (
        <Section title="メモ">
          <p className="rounded-xl border border-adm-rule bg-adm-surface px-3.5 py-3 text-[13px] leading-relaxed">
            {dog.note}
          </p>
        </Section>
      )}
    </>
  );
}

const MISSING = '未入力';

/* ───────── 出産 ───────── */

function LittersTab({ litters, sex }: { litters: LitterRow[]; sex: string }) {
  if (sex === '♂') {
    return (
      <Section title="出産">
        <Empty>種雄犬には出産記録がありません。相手の母犬のカルテに残ります。</Empty>
      </Section>
    );
  }
  if (litters.length === 0) {
    return (
      <Section title="出産">
        <Empty>まだ記録がありません。</Empty>
      </Section>
    );
  }

  const n = litters.length;

  return (
    <div className="px-4 pt-3.5">
      <ol className="ml-1.5">
        {litters.map((l, i) => (
          <li
            key={l.id}
            className={`relative border-l-2 pb-3.5 pl-6 ${i === n - 1 ? 'border-transparent' : 'border-adm-rule'}`}
          >
            <span
              className={`absolute -left-[7px] top-1 h-3 w-3 rounded-full border-2 bg-adm-surface ${
                i === 0 ? 'border-adm-action' : 'border-[#B9BDB6]'
              }`}
            />
            <p className="num text-[14px] font-bold leading-tight">
              {ymd(l.birth_date)}
              <span className="ml-2 rounded border border-adm-rule bg-adm-paper px-1.5 py-px align-middle text-[10.5px] font-normal text-adm-muted">
                {n - i}回目
              </span>
            </p>

            <div className="mt-1.5 rounded-xl border border-adm-rule bg-adm-surface px-3 py-2.5">
              <Kv k="父">
                {l.sire_name ? (
                  l.sire_id ? (
                    <Link href={`/admin/dogs/${l.sire_id}`} className="text-adm-action underline underline-offset-2">
                      {l.sire_name}
                    </Link>
                  ) : (
                    l.sire_name
                  )
                ) : (
                  <span className="text-adm-muted">未登録</span>
                )}
                {l.is_mix && <Tag>ミックス</Tag>}
              </Kv>
              <Kv k="妊娠日数">{l.gestation_days ? `${l.gestation_days}日` : '—'}</Kv>
              <Kv k="分娩">{l.method ?? <span className="text-adm-muted">未記入</span>}</Kv>

              <div className="mt-2 flex flex-wrap gap-1.5">
                <Pup>♂ {l.male_count}</Pup>
                <Pup>♀ {l.female_count}</Pup>
                {l.stillborn_count > 0 && <Pup dead>死産 {l.stillborn_count}</Pup>}
              </div>

              {(l.note || l.checkup_date) && (
                <p className="num mt-2 border-t border-adm-rule pt-2 text-[11.5px] text-adm-muted">
                  {l.note && <span className="font-adm">{l.note}</span>}
                  {l.note && l.checkup_date && <span>　／　</span>}
                  {l.checkup_date && <span>仔犬検診 {ymd(l.checkup_date)}</span>}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ───────── 血統 ───────── */

type Kin = {
  id: string;
  name: string;
  sex: string;
  breed_code: string;
  birthday: string | null;
  weight_kg: number | null;
  genes: string[] | null;
  dam_id: string | null;
  sire_id: string | null;
  is_external: boolean;
  status: string;
  breeds: { name: string; hex: string } | null;
  coat_colors: { name: string; hex: string; hex2: string | null } | null;
  coat_types: { name: string } | null;
};

function PedigreeTab({
  dog,
  sire,
  dam,
  grand,
  photo,
}: {
  dog: DogDetail;
  sire: Kin | null;
  dam: Kin | null;
  grand: Map<string, string>;
  photo: Map<string, string>;
}) {
  // 父と母の犬種が違えばミックス。交配の記録と表示を合わせる
  const isMix = sire && dam ? sire.breed_code !== dam.breed_code : null;

  return (
    <>
      <Section title="両親">
        {sire || dam ? (
          <div className="space-y-2">
            <KinCard role="父" kin={sire} grand={grand} photo={photo} />
            <KinCard role="母" kin={dam} grand={grand} photo={photo} />
            {isMix !== null && (
              <p className="rounded-xl border border-adm-rule bg-adm-hint px-3 py-2.5 text-[11.5px] leading-relaxed text-adm-muted">
                {isMix ? (
                  <>
                    <b className="text-adm-ink">父と母の犬種が違います（ミックス）。</b>
                    サイトに出すときは犬種の表記にご注意ください。
                  </>
                ) : (
                  <>父と母は同じ犬種です（{sire?.breeds?.name ?? sire?.breed_code}）。</>
                )}
              </p>
            )}
          </div>
        ) : (
          <Empty>この犬の父母はまだ紐付いていません。</Empty>
        )}
      </Section>

      {dog.breeder_note && (
        <Section title="現行台帳の記載">
          <p className="rounded-xl border border-adm-rule bg-adm-surface px-3.5 py-3 text-[14px] leading-relaxed">
            {dog.breeder_note}
          </p>
          <p className="mt-2.5 rounded-xl border border-adm-rule bg-adm-hint px-3 py-2.5 text-[11.5px] leading-relaxed text-adm-muted">
            現行台帳の血統は「母・父」を1つの欄に書いた文字列で、犬舎にいない犬も多く含まれます。
            <b className="text-adm-ink">推測で紐付けると血統が誤るため、原文のまま残しています。</b>
          </p>
        </Section>
      )}
    </>
  );
}

/** 父または母の1枚。押すとその犬のカルテへ移る */
function KinCard({
  role,
  kin,
  grand,
  photo,
}: {
  role: '父' | '母';
  kin: Kin | null;
  grand: Map<string, string>;
  photo: Map<string, string>;
}) {
  if (!kin) {
    return (
      <div className="rounded-xl border border-dashed border-adm-rule bg-adm-surface px-3.5 py-3">
        <p className="text-[12.5px] text-adm-muted">
          <b className="text-adm-ink">{role}</b> は登録されていません。
        </p>
      </div>
    );
  }

  const url = photo.get(kin.id);
  const gSire = kin.sire_id ? grand.get(kin.sire_id) : null;
  const gDam = kin.dam_id ? grand.get(kin.dam_id) : null;

  return (
    <Link
      href={`/admin/dogs/${kin.id}`}
      className="tap block rounded-xl border border-adm-rule bg-adm-surface px-3.5 py-3 active:bg-adm-paper"
    >
      <div className="flex items-start gap-3">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={`${kin.name} の写真`}
            className="h-12 w-12 shrink-0 rounded-full border border-adm-rule bg-adm-paper object-cover"
          />
        ) : (
          <ColorDot
            hex={kin.coat_colors?.hex}
            hex2={kin.coat_colors?.hex2}
            label={kin.coat_colors?.name}
            size={48}
          />
        )}

        <div className="min-w-0 flex-1">
          <p className="flex items-baseline gap-2">
            <span className="shrink-0 rounded bg-adm-hint px-1.5 py-px text-[10.5px] font-bold text-adm-muted">
              {role}
            </span>
            <span className="truncate text-[15px] font-bold text-adm-action">{kin.name}</span>
            {kin.is_external && (
              <span className="shrink-0 rounded border border-adm-rule px-1.5 py-px text-[10px] text-adm-muted">
                外部
              </span>
            )}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11.5px] text-adm-muted">
            <BreedChip code={kin.breed_code} hex={kin.breeds?.hex} />
            <span>{kin.breeds?.name}</span>
            <span className="num">{ymd(kin.birthday)}</span>
          </p>
        </div>
        <span className="shrink-0 self-center text-[15px] text-adm-muted">›</span>
      </div>

      <dl className="mt-2 border-t border-adm-rule pt-2">
        <Kv k="毛色">
          {[kin.coat_colors?.name, kin.coat_types?.name].filter(Boolean).join('・') || '未登録'}
        </Kv>
        <Kv k="体重">{kin.weight_kg ? `${kin.weight_kg} kg` : '—'}</Kv>
        <Kv k="遺伝子検査">{kin.genes?.join('・') || '—'}</Kv>
        <Kv k="この犬の父母">
          {gSire || gDam ? `${gSire ?? '—'} / ${gDam ?? '—'}` : <span className="text-adm-muted">未登録</span>}
        </Kv>
      </dl>
    </Link>
  );
}

/* ───────── ワクチン ───────── */

function VaccineTab({
  rows,
  due,
  dogId,
}: {
  rows: VaccinationRow[];
  due: VaccineDueRow[];
  dogId: string;
}) {
  const kinds = ['混合', '狂犬病'];
  return (
    <>
      <Section title="次回の予定">
        <ul className="overflow-hidden rounded-xl border border-adm-rule bg-adm-surface">
          {kinds.map((k) => {
            const d = due.find((x) => x.kind === k);
            return (
              <li key={k} className="flex items-center justify-between gap-3 border-b border-adm-rule px-3.5 py-2.5 last:border-b-0">
                <span className="text-[13px]">{k}</span>
                <span className="text-right">
                  <span className="num block text-[13px]">
                    {d?.next_due_on ? ymd(d.next_due_on) : '記録なし'}
                  </span>
                  {d?.last_dosed_on && (
                    <span className="num block text-[11px] text-adm-muted">前回 {ymd(d.last_dosed_on)}</span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section title="記録する">
        <Link
          href={`/admin/vaccinations/new?dog=${dogId}`}
          className="tap flex items-center justify-center rounded-xl border border-adm-rule bg-adm-surface px-4 py-3 text-[14px] font-medium text-adm-action"
        >
          ＋ 接種を記録する
        </Link>
        <p className="mt-2 text-[11.5px] leading-relaxed text-adm-muted">
          この子が選ばれた状態で開きます。同じ日にほかの犬も打った場合は、その画面でまとめて選べます。
        </p>
      </Section>

      <Section title="接種の記録" note={`${rows.length}件`}>
        {rows.length === 0 ? (
          <Empty>記録がありません。</Empty>
        ) : (
          <ul className="overflow-hidden rounded-xl border border-adm-rule bg-adm-surface">
            {rows.map((v) => (
              <li key={v.id} className="flex items-center justify-between gap-3 border-b border-adm-rule px-3.5 py-2.5 last:border-b-0">
                <span className="text-[13px]">{v.kind}</span>
                <span className="num text-[13px]">{ymd(v.dosed_on)}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}

/* ───────── 共通 ───────── */

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="px-4 pt-3.5">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h2 className="text-[13px] font-bold tracking-wide">{title}</h2>
        {note && <span className="num text-[12px] text-adm-muted">{note}</span>}
      </div>
      {children}
    </section>
  );
}

function Dl({ rows }: { rows: [string, string, 'ja' | 'num'][] }) {
  return (
    <dl className="overflow-hidden rounded-xl border border-adm-rule bg-adm-surface">
      {rows.map(([k, v, kind]) => (
        <div key={k} className="flex items-baseline justify-between gap-3 border-b border-adm-rule px-3.5 py-2.5 last:border-b-0">
          <dt className="shrink-0 text-[13px] text-adm-muted">{k}</dt>
          <dd
            className={`break-all text-right text-[13px] ${kind === 'num' ? 'num' : ''} ${
              v === MISSING ? 'text-adm-danger' : ''
            }`}
          >
            {v}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Kv({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-0.5">
      <span className="text-[12.5px] text-adm-muted">{k}</span>
      <span className="num text-right text-[13px]">{children}</span>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-1.5 rounded border border-adm-rule bg-adm-paper px-1.5 py-px font-adm text-[10.5px] text-adm-muted">
      {children}
    </span>
  );
}

function Pup({ children, dead }: { children: React.ReactNode; dead?: boolean }) {
  return (
    <span
      className={`num rounded-md border px-2.5 py-0.5 text-[12px] ${
        dead ? 'border-[#E3C9C7] bg-adm-paper text-adm-danger' : 'border-adm-rule bg-adm-paper'
      }`}
    >
      {children}
    </span>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-adm-rule bg-adm-surface px-3.5 py-3 text-[12.5px] leading-relaxed text-adm-muted">
      {children}
    </p>
  );
}

function shiftMonthIso(dateIso: string, addMonths: number): string {
  const [y, m] = dateIso.split('-').map(Number);
  const total = y * 12 + (m - 1) + addMonths;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}-01`;
}
