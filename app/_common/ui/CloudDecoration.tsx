import Image from "next/image";

/** 下層ページ上部の雲の装飾（Figma: 146×76 を左上と右下に配置） */
export const CloudDecoration = () => (
  <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden>
    <Image
      src="/assets/cloud-white.svg"
      alt=""
      width={146}
      height={76}
      className="absolute left-[4%] top-[30px]"
    />
    <Image
      src="/assets/cloud-white.svg"
      alt=""
      width={146}
      height={76}
      className="absolute left-[81%] top-[113px]"
    />
  </div>
);

export default CloudDecoration;
