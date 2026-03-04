// prayerUtils.ts

import moment from "moment-hijri";

export const getHijriDate = (offsetDays: number = -1) => {
  try {
    // Apply local moon sighting offset
    const date = moment().add(offsetDays, "days");

    // Format: 14 Ramadan 1447 AH
    return date.format("iD iMMMM iYYYY [AH]");
  } catch (e) {
    return "1446 Hijri"; // Safe fallback
  }
};