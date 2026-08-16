import type { FaqBlock } from "@/app/_model/faq";

/** 回答本文（見出し・段落・箇条書き・締めの囲み）をレンダリングする */
export const AnswerBlocks = ({ blocks }: { blocks: FaqBlock[] }) => (
  <div className="measure-560 mx-auto flex flex-col gap-4 text-left">
    {blocks.map((block, index) => {
      const key = `${block.type}-${index}`;

      if (block.type === "heading") {
        return (
          <h4
            key={key}
            className={`flex items-start gap-2 font-jp text-[15px] font-extrabold leading-[1.6] text-ink-light md:text-[17px] ${
              index === 0 ? "" : "mt-2"
            }`}
          >
            {block.emoji && (
              <span aria-hidden className="shrink-0">
                {block.emoji}
              </span>
            )}
            {block.text}
          </h4>
        );
      }

      if (block.type === "list") {
        return (
          <ul key={key} className="flex flex-col gap-1.5">
            {block.items.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 font-jp text-[14px] leading-[1.9] text-ink-light md:text-[16px]"
              >
                <span
                  aria-hidden
                  className="mt-[0.7em] block h-[6px] w-[6px] shrink-0 rounded-full bg-pink"
                />
                {item}
              </li>
            ))}
          </ul>
        );
      }

      if (block.type === "note") {
        return (
          <div key={key} className="mt-2 flex flex-col gap-2 rounded-[10px] bg-beige px-5 py-5">
            {block.texts.map((text, textIndex) => (
              <p
                key={text}
                className="flex items-start gap-2 whitespace-pre-line font-jp text-[14px] leading-[1.9] text-ink-light md:text-[16px]"
              >
                {textIndex === 0 && block.emoji && (
                  <span aria-hidden className="shrink-0">
                    {block.emoji}
                  </span>
                )}
                {text}
              </p>
            ))}
          </div>
        );
      }

      return (
        <p
          key={key}
          className="whitespace-pre-line font-jp text-[14px] leading-[1.9] text-ink-light md:text-[16px]"
        >
          {block.text}
        </p>
      );
    })}
  </div>
);

export default AnswerBlocks;
