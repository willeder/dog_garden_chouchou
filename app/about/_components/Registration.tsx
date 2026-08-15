import { kennelInfo } from "@/app/_data/kennelInfo";

const orDash = (value?: string) => (value && value.trim() !== "" ? value : "―");

/**
 * 第一種動物取扱業の登録情報（ran の registration 相当）。
 * 動物愛護管理法により事業所での標識掲示・ウェブサイトでの表示が求められる項目。
 */
export const Registration = () => {
  const { animalBusiness } = kennelInfo;
  const address =
    kennelInfo.postalCode && kennelInfo.address
      ? `〒${kennelInfo.postalCode} ${kennelInfo.address}`
      : kennelInfo.address;

  const rows = [
    { label: "事業所名", value: orDash(animalBusiness.officeName || kennelInfo.name) },
    { label: "所在地", value: orDash(address) },
    { label: "氏名", value: orDash(kennelInfo.breeder) },
    { label: "種別", value: orDash(animalBusiness.type) },
    { label: "登録番号", value: orDash(animalBusiness.registrationNumber) },
    { label: "登録年月日", value: orDash(animalBusiness.registrationDate) },
    { label: "有効期限", value: orDash(animalBusiness.expirationDate) },
    { label: "動物取扱責任者", value: orDash(animalBusiness.animalHandler) },
  ];

  return (
    <div className="measure-700 rounded-[30px] bg-white px-6 py-10 shadow-pop md:px-[50px] md:py-12">
      <h2 className="font-jp text-[18px] font-extrabold leading-[1.6] text-ink-light md:text-[20px]">
        {animalBusiness.registrationType}
      </h2>

      <dl className="mt-6 flex flex-col">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex flex-col gap-1 border-b border-pink py-3 last:border-b-0 sm:flex-row sm:gap-4"
          >
            <dt className="w-[130px] shrink-0 font-jp text-[14px] font-extrabold leading-[1.6] text-ink-light">
              {row.label}
            </dt>
            <dd className="flex-1 font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

export default Registration;
