import type { Status } from "@/app/_model/puppy";

const styles: Record<Status, string> = {
  商談中: "bg-negotiating",
  成約済み: "bg-sold",
};

/** Figma には無いが ran と同じ区分。カード・詳細の写真左上に重ねる */
export const StatusBadge = ({ status }: { status: Status }) => (
  <span
    className={`absolute left-0 top-0 z-20 rounded-br-[10px] px-4 py-[6px] font-jp text-[12px] font-extrabold leading-[1.6] text-white ${styles[status]}`}
  >
    {status}
  </span>
);

export default StatusBadge;
