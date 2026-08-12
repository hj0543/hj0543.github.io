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
    <div className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center px-4">
      <time
        className="flex flex-col items-center justify-center gap-2 whitespace-nowrap text-center font-light tabular-nums [text-shadow:0_2px_24px_var(--scene-text-shadow)] sm:gap-3"
        dateTime={now?.toISOString()}
        aria-label={dateTime?.label ?? "현재 날짜와 시간을 불러오는 중"}
      >
        <span className="text-xl tracking-[0.12em] text-ink/45 sm:text-3xl">
          {dateTime?.date ?? "0000.00.00"}
        </span>
        <span className="text-5xl font-medium tracking-[-0.05em] text-ink/30 sm:text-7xl lg:text-8xl">
          {dateTime?.time ?? "00:00"}
        </span>
      </time>
    </div>
  );
}
