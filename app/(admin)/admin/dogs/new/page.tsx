import Link from 'next/link';
import { createClient } from '@/app/_lib/supabase/server';
import type { Master, PartnerOption } from '../[id]/edit/DogForm';
import { NewDogForm, type BreedOption } from './NewDogForm';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ external?: string }> };

/**
 * 犬の新規登録（/admin/dogs/new）。
 *
 * 仔犬は出産記録から作るので、ここで登録するのは
 * 外から迎えた親犬と、外交配の相手になる他犬舎の種雄犬。
 * ?external=1 で開くと外交配の種雄犬として始まる（出産記録の画面から呼ぶ想定）。
 */
export default async function NewDogPage({ searchParams }: Props) {
  const sp = await searchParams;
  const supabase = await createClient();

  const [{ data: breeds }, { data: colors }, { data: coatTypes }, { data: ribbons }, { data: partners }] =
    await Promise.all([
      supabase.from('breeds').select('code, name, hex').order('code'),
      supabase.from('coat_colors').select('code, name, hex, hex2').order('name'),
      supabase.from('coat_types').select('code, name').order('code'),
      supabase.from('ribbon_colors').select('code, name, hex').order('code'),
      supabase.from('partners').select('id, name, license_no').is('deleted_at', null).order('name'),
    ]);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center gap-2.5 border-b border-adm-rule bg-adm-surface px-3 pb-2.5 pt-3">
        <Link
          href="/admin/dogs"
          aria-label="やめて戻る"
          className="tap flex w-[38px] items-center justify-center rounded-lg border border-adm-rule text-[15px] text-adm-muted"
        >
          ‹
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-[17px] font-bold tracking-tight">犬を登録</h1>
          <p className="text-[11.5px] text-adm-muted">外から迎えた親犬・外交配の種雄犬</p>
        </div>
      </header>

      <NewDogForm
        breeds={(breeds ?? []) as BreedOption[]}
        colors={(colors ?? []) as Master[]}
        coatTypes={(coatTypes ?? []) as Master[]}
        ribbons={(ribbons ?? []) as Master[]}
        partners={(partners ?? []) as PartnerOption[]}
        initialExternal={sp.external === '1'}
      />
    </>
  );
}
