/** ブリーダーからのメッセージ（ran の breederMessage.tsx 相当） */
export const BreederMessage = ({ message }: { message: string }) => (
  <div className="measure-700 rounded-[30px] bg-white px-6 py-10 shadow-pop md:px-[50px] md:py-12">
    <h2 className="font-jp text-[16px] font-extrabold leading-[1.6] text-ink-light md:text-[18px]">
      ブリーダーからのメッセージ
    </h2>
    <p className="mt-2 whitespace-pre-line font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]">
      {message}
    </p>
  </div>
);

export default BreederMessage;
