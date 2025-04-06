import { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

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

function RadioClock() {
  const [now, setNow] = useState<Dayjs>();

  const fetchDateTime = async () => {
    const baseUrl = "https://timeapi.io/api/time/current/zone"

    const query = new URLSearchParams({
      timeZone: "Asia/Tokyo"
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

    setNow(() => dateTime);
  };

  useEffect(() => {
    fetchDateTime();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(() => now?.add(1, "second"));
    }, 1000);

    return () => clearInterval(interval);
  }, [now]);

  return (
    <>
      <p>{now?.format("HH:MM:ss")}</p>
      <p>{now?.format("YYYY年M月D日(dddd)")}</p>

      <button onClick={fetchDateTime}>現在時刻を取得</button>
    </>
  );
}

export default RadioClock;
