import { BREED_FALLBACK_HEX, COLOR_FALLBACK_HEX } from '@/app/_model/admin';

/**
 * 犬種は「縦バー」、毛色は「丸」。
 * 形を変えることで意味の違いを伝える。
 * 同じ形で画面ごとに意味が変わると必ず混乱するので、この対応は崩さないこと。
 */

export function BreedBar({ hex, label }: { hex?: string | null; label?: string }) {
  return (
    <span
      className="w-1 shrink-0 self-stretch rounded-full"
      style={{ background: hex || BREED_FALLBACK_HEX }}
      role="img"
      aria-label={label ? `犬種 ${label}` : undefined}
    />
  );
}

export function ColorDot({
  hex,
  hex2,
  label,
  size = 38,
}: {
  hex?: string | null;
  hex2?: string | null;
  label?: string | null;
  size?: number;
}) {
  const a = hex || COLOR_FALLBACK_HEX;
  // 2色毛は上下で塗り分ける。ブラックタンとブラックを見分けられるように。
  const bg = hex2 ? `linear-gradient(160deg, ${a} 0 52%, ${hex2} 52% 100%)` : a;
  return (
    <span
      className="shrink-0 rounded-full border border-adm-rule"
      style={{ width: size, height: size, background: bg }}
      role="img"
      aria-label={label ? `毛色 ${label}` : '毛色 未登録'}
    />
  );
}

export function BreedChip({ code, hex }: { code: string; hex?: string | null }) {
  return (
    <span
      className="num rounded px-1.5 py-px text-[10px] font-bold tracking-wide text-white"
      style={{ background: hex || BREED_FALLBACK_HEX }}
    >
      {code}
    </span>
  );
}
