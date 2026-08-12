"use client";

import { useEffect, useState } from "react";

function getDateTimeParts(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");

  return {
    date: `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
    label: `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${date.getHours()}시 ${pad(date.getMinutes())}분`,
  };
}

export default function LiveDateTime() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const update = () => setNow(new Date());
    let intervalId: number | undefined;

    update();
    const timeoutId = window.setTimeout(() => {
      update();
      intervalId = window.setInterval(update, 60_000);
    }, 60_000 - (Date.now() % 60_000) + 50);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId !== undefined) window.clearInterval(intervalId);
    };
  }, []);

  const dateTime = now ? getDateTimeParts(now) : null;

  return (
    <div className="pointer-events-none fixed right-4 top-24 z-30 rounded-2xl border border-white/10 bg-[#0b0714]/35 px-3.5 py-2.5 text-right shadow-[0_12px_36px_rgba(0,0,0,0.18)] backdrop-blur-md sm:right-8 sm:top-8 sm:px-4 sm:py-3">
      <p className="text-[9px] font-medium tracking-[0.22em] text-white/45 sm:text-[10px]">
        LOCAL TIME
      </p>
      <time
        className="mt-1 flex items-baseline justify-end gap-2 tabular-nums text-white/90"
        dateTime={now?.toISOString()}
        aria-label={dateTime?.label ?? "현재 날짜와 시간을 불러오는 중"}
      >
        <span className="text-[10px] tracking-[0.08em] text-white/60 sm:text-xs">
          {dateTime?.date ?? "0000.00.00"}
        </span>
        <span className="text-base font-semibold tracking-[-0.04em] sm:text-xl">
          {dateTime?.time ?? "00:00"}
        </span>
      </time>
    </div>
  );
}
