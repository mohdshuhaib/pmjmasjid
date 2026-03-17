export const applyOffset = (timeStr: string, offsetMins: number) => {
  if (!timeStr) return null;
  const match = timeStr.match(/^(\d{2}):(\d{2})/);
  if (!match) return null;

  const date = new Date();
  date.setHours(parseInt(match[1]), parseInt(match[2]), 0, 0);
  date.setMinutes(date.getMinutes() + (offsetMins || 0));

  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};

export const convertTo12Hour = (timeStr: string | null) => {
  if (!timeStr) return "N/A";
  const match = timeStr.match(/^(\d{2}):(\d{2})/);
  if (!match) return "N/A";

  const hour = parseInt(match[1]);
  const min = parseInt(match[2]);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;

  return `${hour12.toString().padStart(2, "0")}:${min
    .toString()
    .padStart(2, "0")} ${period}`;
};

export const calculateJamaat = (adjustedTimeStr: string | null, offsetMins: number) => {
  if (!adjustedTimeStr) return "N/A";
  const jamaat24 = applyOffset(adjustedTimeStr, offsetMins);
  return convertTo12Hour(jamaat24);
};

export const parseTimeToDate = (time24: string, dayOffset = 0) => {
  const [h, m] = time24.split(":").map(Number);
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(h, m, 0, 0);
  return d;
};