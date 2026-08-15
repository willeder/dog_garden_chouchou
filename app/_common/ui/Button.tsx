import Link from "next/link";
import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  /** green = #C7E7C8 / greenDark = #AAC5AB / pink = #F0D0D8 */
  variant?: "green" | "greenDark" | "pink";
  /** 英字（Poller One）か日本語（M PLUS 1p ExtraBold）か */
  font?: "en" | "jp";
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
};

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  green: "bg-green",
  greenDark: "bg-green-dark",
  pink: "bg-pink",
};

/**
 * Figma共通ボタン: padding 11px 31px / radius 5px / shadow 2px 2px 0 rgba(0,0,0,.2)
 */
export const Button = ({
  children,
  href,
  variant = "green",
  font = "en",
  type = "button",
  disabled = false,
  onClick,
  className = "",
}: ButtonProps) => {
  const base = [
    "inline-flex items-center justify-center gap-[5px] rounded-[5px] px-[31px] py-[11px]",
    "shadow-btn transition-opacity",
    disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:opacity-80",
    variantStyles[variant],
    font === "en"
      ? "font-en text-[16px] leading-none text-white"
      : "font-jp text-[14px] font-extrabold leading-[1.6] text-white",
    className,
  ].join(" ");

  if (href && !disabled) {
    // 外部リンクは新しいタブで開く（dog_breeder_ran の Button と同じ挙動）
    if (href.startsWith("http")) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={base}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={base}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={base} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;
