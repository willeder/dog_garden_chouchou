/**
 * ブリーダーからのメッセージ。
 * 内側に囲みを置き、長文でもカードが伸びすぎないよう高さ上限＋スクロールにする
 * （dog_breeder_ran の breederMessage.tsx と同じ扱い）。
 */
export const BreederMessage = ({ message }: { message: string }) => (
  <div className="max-h-[25.25rem] overflow-y-auto rounded-[10px] border border-pink bg-beige p-4">
    <p className="whitespace-pre-line font-jp text-[14px] font-medium leading-[1.9] text-ink-light md:text-[15px]">
      {message}
    </p>
  </div>
);

export default BreederMessage;
