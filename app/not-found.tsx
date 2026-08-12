import SectionHeading from "@/app/_common/ui/SectionHeading";
import Button from "@/app/_common/ui/Button";

export default function NotFound() {
  return (
    <section className="bg-blue py-24">
      <div className="mx-auto flex max-w-[1024px] flex-col items-center gap-6 px-5">
        <SectionHeading en="404" ja="ページが見つかりません" />
        <p className="measure-560 text-center font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]">
          お探しのページは移動または削除された可能性があります。
        </p>
        <Button href="/" variant="green">
          HOME
        </Button>
      </div>
    </section>
  );
}
