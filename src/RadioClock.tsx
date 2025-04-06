import { Suspense, use, useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/ja";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("ja");

type DayOfWeek =
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

interface TimeData {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  seconds: number;
  milliSeconds: number;
  dateTime: string;
  date: string;
  time: string;
  timeZone: string;
  dayOfWeek: DayOfWeek;
  dstActive: boolean;
}

async function fetchNow(): Promise<Dayjs> {
  const baseUrl = "https://timeapi.io/api/time/current/zone";

  const query = new URLSearchParams({
    timeZone: "Asia/Tokyo",
  });

  const response = await fetch(`${baseUrl}?${query}`);
  const data: TimeData = await response.json();

  const dateTime = dayjs()
    .year(data.year)
    .month(data.month - 1) // month is 0-indexed in dayjs
    .date(data.day)
    .hour(data.hour)
    .minute(data.minute)
    .second(data.seconds)
    .millisecond(data.milliSeconds)
    .tz(data.timeZone);

  return dateTime;
}

function LoadingDisplay() {
  return (
    <>
      <p className="display-1" style={{ fontSize: "20em" }}>
        --:--:--
      </p>
      <p className="display-6 text-muted">現在時刻を取得しています...</p>
    </>
  );
}

function RadioClockDisplay({ nowPromise }: { nowPromise: Promise<Dayjs> }) {
  const [now, setNow] = useState<Dayjs>(use(nowPromise));

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(() => now?.add(1, "second"));
    }, 1000);

    return () => clearInterval(interval);
  }, [now]);

  return (
    <>
      <p className="display-1 fw-bold" style={{ fontSize: "20em" }}>
        {now.format("HH:mm:ss")}
      </p>
      <p className="display-6 text-muted">{now.format("YYYY年M月D日(ddd)")}</p>
    </>
  );
}

function RadioClock() {
  const [nowPromise, setNowPromise] = useState<Promise<Dayjs>>(fetchNow());

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="text-center">
        <Suspense fallback={<LoadingDisplay />}>
          <RadioClockDisplay nowPromise={nowPromise} />
        </Suspense>

        <button
          onClick={() => setNowPromise(fetchNow())}
          className="btn btn-primary"
        >
          現在時刻を取得
        </button>
      </div>
    </div>
  );
}

export default RadioClock;
