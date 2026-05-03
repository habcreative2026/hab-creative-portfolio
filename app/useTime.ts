"use client";

import { useEffect, useState } from "react";

export function useTime(timeZone: string) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();

const formatted = new Intl.DateTimeFormat("en-US", {
  timeZone: Intl.supportedValuesOf("timeZone").includes(timeZone)
    ? timeZone
    : "Asia/Ho_Chi_Minh",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
}).format(now);

      setTime(formatted);
    };

    update();
    const interval = setInterval(update, 1000 * 3); // update mỗi 30s

    return () => clearInterval(interval);
  }, [timeZone]);

  return time;
}