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

async function fetchNow(timeZone: string): Promise<Dayjs> {
  const baseUrl = "https://timeapi.io/api/time/current/zone";
  const query = new URLSearchParams({ timeZone });

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

function LoadingDisplay({ timeZoneName }: { timeZoneName?: string }) {
  return (
    <>
      <p className="display-1" style={{ fontSize: "20em" }}>
        --:--:--
      </p>
      <p className="display-6 text-muted">
        {timeZoneName}の現在時刻を取得しています...
      </p>
    </>
  );
}

function RadioClockDisplay({ nowPromise }: { nowPromise: Promise<Dayjs> }) {
  const [now, setNow] = useState<Dayjs>(use(nowPromise));

  useEffect(() => {
    nowPromise.then((newNow) => {
      setNow(() => newNow);
    });
  }, [nowPromise]);

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
  const [timeZone, setTimeZone] = useState<string>("Asia/Tokyo");
  const [timeZoneName, setTimeZoneName] = useState<string>("東京");

  const [nowPromise, setNowPromise] = useState<Promise<Dayjs>>(
    fetchNow(timeZone)
  );

  const handleTimeZone = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeZone(() => e.target.value);
    setTimeZoneName(() => e.target.selectedOptions[0].text);
    setNowPromise(() => fetchNow(e.target.value));
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center min-vh-100"
      style={{ fontFamily: "Noto Sans Mono" }}
    >
      <div className="text-center">
        <Suspense fallback={<LoadingDisplay timeZoneName={timeZoneName} />}>
          <RadioClockDisplay nowPromise={nowPromise} />
        </Suspense>

        <select
          className="form-select mb-3 w-25 mx-auto"
          defaultValue={timeZone}
          onChange={handleTimeZone}
        >
          <option disabled>タイムゾーンを選択</option>
          <option value="Asia/Tokyo">東京</option>
          <option value="America/New_York">ニューヨーク</option>
          <option value="Europe/London">ロンドン</option>
          <option value="Europe/Paris">パリ</option>
          <option value="Asia/Shanghai">上海</option>
          <option value="Asia/Singapore">シンガポール</option>
          <option value="Asia/Hong_Kong">香港</option>
          <option value="Asia/Seoul">ソウル</option>
          <option value="Asia/Bangkok">バンコク</option>
          <option value="Asia/Dubai">ドバイ</option>
          <option value="Australia/Sydney">シドニー</option>
          <option value="America/Los_Angeles">ロサンゼルス</option>
          <option value="America/Chicago">シカゴ</option>
        </select>

        <button
          onClick={() => setNowPromise(() => fetchNow(timeZone))}
          className="btn btn-primary"
        >
          現在時刻を取得
        </button>
      </div>
    </div>
  );
}

export default RadioClock;
