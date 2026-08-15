import { staffDaySchedule } from "./staffDayData";

/** スタッフの1日（ran の staffDay 相当） */
export const StaffDay = () => (
  <div className="measure-700 rounded-[30px] bg-white px-6 py-10 shadow-pop md:px-[50px] md:py-12">
    <h2 className="font-jp text-[18px] font-extrabold leading-[1.6] text-ink-light md:text-[20px]">
      スタッフの1日
    </h2>
    <p className="mt-1 font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]">
      仔犬の健康と幸せを支えるために、毎日ていねいなケアを行っています。
    </p>

    <ol className="mt-6 flex flex-col">
      {staffDaySchedule.map((item, index) => (
        <li key={item.time} className="flex gap-4">
          {/* 時刻とタイムライン */}
          <div className="flex w-[64px] shrink-0 flex-col items-center">
            <span className="font-en text-[14px] leading-none text-ink-light">{item.time}</span>
            <span aria-hidden className="mt-1 block h-[10px] w-[10px] rounded-full bg-pink" />
            {index < staffDaySchedule.length - 1 && (
              <span aria-hidden className="w-[2px] flex-1 bg-pink" />
            )}
          </div>

          <ul className="flex flex-1 flex-col gap-1 pb-6">
            {item.tasks.map((task) => (
              <li
                key={task}
                className="rounded-[10px] bg-beige px-4 py-2 font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]"
              >
                {task}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  </div>
);

export default StaffDay;
