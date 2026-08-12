import Image from "next/image";
import Link from "next/link";
import { kennelInfo } from "@/app/_data/kennelInfo";

type LogoProps = {
  /** ロゴの表示幅（px）。高さはアスペクト比 262:58 で自動計算される */
  className?: string;
  /** trueならリンクにしない（フッターなど） */
  asPlainImage?: boolean;
};

const image = (
  <Image
    src="/assets/logo.svg"
    alt={`${kennelInfo.nameEn} ロゴ`}
    width={262}
    height={58}
    priority
    className="h-auto w-full"
  />
);

export const Logo = ({ className = "w-[180px] md:w-[262px]", asPlainImage }: LogoProps) => {
  if (asPlainImage) return <div className={className}>{image}</div>;

  return (
    <Link href="/" className={`block ${className}`} aria-label={`${kennelInfo.name} トップページ`}>
      {image}
    </Link>
  );
};

export default Logo;
