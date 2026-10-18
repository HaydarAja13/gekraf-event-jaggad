const TZ = "Asia/Jakarta";

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

/** Calendar parts of an instant as seen in Jakarta, whatever the server clock says. */
function parts(now: Date) {
  const format = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => Number(format.find((part) => part.type === type)?.value ?? 0);
  const day = get("day");
  const month = get("month");
  const year = get("year");
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return { day, month, year, weekday, hour: get("hour") };
}

/** "Kamis, 17 Oktober 2026" */
export function todayLine(now = new Date()) {
  const { day, month, year, weekday } = parts(now);
  return `${DAYS[weekday]}, ${day} ${MONTHS[(month - 1) % 12]} ${year}`;
}

/** "Selamat pagi" / "siang" / "sore" / "malam", Jakarta time. */
export function greeting(now = new Date()) {
  const { hour } = parts(now);
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

/** "17 Oktober 2026" */
export function longDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const { day, month, year } = parts(date);
  return `${day} ${MONTHS[(month - 1) % 12]} ${year}`;
}

/** "17 Okt 2026" for dense table cells. */
export function shortDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const { day, month, year } = parts(date);
  return `${day} ${MONTHS_SHORT[(month - 1) % 12]} ${year}`;
}

/** "22:14" in Jakarta time. */
export function timeOfDay(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

/** "16/10/2026 23:42" — day, month, year, hour, minute. */
export function orderStamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
    .format(date)
    .replace(",", "");
}
