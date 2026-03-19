export function formatDisplayDate(dateString: string) {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  if (!year || !month || !day) return dateString;
  return `${day}/${month}/${year}`;
}

export function sanitizeRefNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 6);
  if (!digits) return "001";
  return digits.padStart(3, "0");
}

export function buildReferenceCode(refNumber: string) {
  return `PMJ5753-${sanitizeRefNumber(refNumber)}`;
}

export function isMobileDevice() {
  if (typeof window === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}