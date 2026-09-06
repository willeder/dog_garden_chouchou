'use client';

import { useState } from 'react';
import { FormSection, Row, Segment, Toggle } from '@/app/(admin)/_components/Form';
import { BreedChip } from '@/app/(admin)/_components/Marks';
import { DogForm, type Master, type PartnerOption } from '../[id]/edit/DogForm';
import { EMPTY_DOG, validateNewDog, type DogEditInput } from '../[id]/edit/shared';
import { createDog } from './actions';

export type BreedOption = { code: string; name: string; hex: string };

/**
 * 犬の新規登録。
 *
 * 編集画面の DogForm をそのまま使い、登録時にしか無い「犬種」と
 * 「外交配の種雄犬か」をこの画面で持つ。犬種は登録後に変えられないため、
 * 編集の入力には含めていない（間違えたら作り直す）。
 */
export function NewDogForm({
  breeds,
  colors,
  coatTypes,
  ribbons,
  partners,
  initialExternal,
}: {
  breeds: BreedOption[];
  colors: Master[];
  coatTypes: Master[];
  ribbons: Master[];
  partners: PartnerOption[];
  initialExternal: boolean;
}) {
  const [breedCode, setBreedCode] = useState(breeds.length === 1 ? breeds[0].code : '');
  const [external, setExternal] = useState(initialExternal);
  const breed = breeds.find((b) => b.code === breedCode);

  // 外交配の種雄犬は♂で、自舎の所有ではない
  const initial: DogEditInput = external ? { ...EMPTY_DOG, sex: '♂', is_self_bred: false } : EMPTY_DOG;

  return (
    <DogForm
      // 外交配の切替で性別・帳簿の初期値が変わるので、フォームを作り直す
      key={external ? 'external' : 'own'}
      breedName={breed?.name ?? '犬種を選んでください'}
      initial={initial}
      colors={colors}
      coatTypes={coatTypes}
      ribbons={ribbons}
      partners={partners}
      canChangeSex={!external}
      sexLockReason="外交配の相手は種雄犬（♂）です"
      showLedger={!external}
      saveLabel="登録する"
      onSave={async (f) => {
        const input = { ...f, breed_code: breedCode, is_external: external };
        const bad = validateNewDog(input);
        if (bad) return { ok: false, message: bad.message, field: bad.field };
        return createDog(input);
      }}
      head={
        <>
          <FormSection
            title="犬種"
            help="犬種は登録したあとで変えられません。血統・ミックス判定・サイトの説明文に関わるため、間違えたときは登録を作り直します。"
          >
            <Row label="犬種" required>
              <Segment
                label="犬種"
                value={breedCode}
                onChange={setBreedCode}
                options={breeds.map((b) => ({ value: b.code, label: b.code }))}
              />
              {breed && (
                <p className="mt-2 flex items-center gap-2 text-[12.5px] text-adm-muted">
                  <BreedChip code={breed.code} hex={breed.hex} />
                  <span>{breed.name}</span>
                </p>
              )}
            </Row>
          </FormSection>

          <FormSection
            title="どの犬ですか"
            help={
              external ? (
                <>
                  <b className="text-adm-ink">他犬舎の種雄犬として登録します。</b>
                  自舎の所有ではないので帳簿・定期報告には載らず、サイトにも出ません。
                  出産記録の「父」として選べるようになります。
                </>
              ) : (
                <>
                  <b className="text-adm-ink">この犬舎の犬として登録します。</b>
                  仕入れ・譲受で迎えた親犬はこちらです。状態は「在籍」のままで構いません。
                  この犬舎で産まれた子は、ここではなく出産記録から登録します。
                </>
              )
            }
          >
            <Toggle
              id="is_external"
              checked={external}
              onChange={setExternal}
              label="外交配の種雄犬"
              note="他犬舎から借りる父犬。自舎の所有ではない"
            />
          </FormSection>
        </>
      }
    />
  );
}
