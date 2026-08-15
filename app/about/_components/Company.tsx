import { kennelInfo } from "@/app/_data/kennelInfo";

const orDash = (value?: string) => (value && value.trim() !== "" ? value : "―");

/** 犬舎概要（ran の company 相当） */
export const Company = () => {
  const fullAddress =
    kennelInfo.postalCode && kennelInfo.address
      ? `〒${kennelInfo.postalCode} ${kennelInfo.address}`
      : kennelInfo.address;

  const rows: { label: string; value: string }[] = [
    { label: "犬舎名", value: kennelInfo.name },
    { label: "設立年度", value: orDash(kennelInfo.establishedYear) },
    { label: "所在地", value: orDash(fullAddress) },
    { label: "代表者", value: kennelInfo.breeder },
    { label: "事業内容", value: orDash(kennelInfo.businessContent) },
  ];

  const accessRows = [
    { label: "最寄り駅", value: kennelInfo.access.station },
    { label: "駐車場", value: kennelInfo.access.parking },
  ].filter((row) => row.value && row.value.trim() !== "");

  return (
    <div className="measure-700 rounded-[30px] bg-white px-6 py-10 shadow-pop md:px-[50px] md:py-12">
      <h2 className="font-jp text-[18px] font-extrabold leading-[1.6] text-ink-light md:text-[20px]">
        犬舎概要
      </h2>

      <dl className="mt-6 flex flex-col">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex flex-col gap-1 border-b border-pink py-3 last:border-b-0 sm:flex-row sm:gap-4"
          >
            <dt className="w-[110px] shrink-0 font-jp text-[14px] font-extrabold leading-[1.6] text-ink-light">
              {row.label}
            </dt>
            <dd className="flex-1 font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      {accessRows.length > 0 && (
        <>
          <h3 className="mt-8 font-jp text-[16px] font-extrabold leading-[1.6] text-ink-light md:text-[18px]">
            アクセス
          </h3>
          <dl className="mt-2 flex flex-col">
            {accessRows.map((row) => (
              <div
                key={row.label}
                className="flex flex-col gap-1 border-b border-pink py-3 last:border-b-0 sm:flex-row sm:gap-4"
              >
                <dt className="w-[110px] shrink-0 font-jp text-[14px] font-extrabold leading-[1.6] text-ink-light">
                  {row.label}
                </dt>
                <dd className="flex-1 font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </div>
  );
};

export default Company;
