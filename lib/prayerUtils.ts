// Generate Hijri Date (With dynamic offset from Supabase)
// We default to -1 as it usually matches the local Kerala moon sighting
export const getHijriDate = (offsetDays: number = -1) => {
  try {
    const date = new Date();
    // Offset for local moon sighting
    date.setDate(date.getDate() + offsetDays);

    const formatter = new Intl.DateTimeFormat('en-TN-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    return formatter.format(date);
  } catch (e) {
    return "1446 Hijri"; // Fallback if browser doesn't support Intl
  }
};