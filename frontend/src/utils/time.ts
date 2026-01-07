
const NPT_OFFSET_MS = 5.75 * 60 * 60 * 1000;


export function toNepalTime(utcDate: string): Date {
  return new Date(new Date(utcDate).getTime() + NPT_OFFSET_MS);
}


export function localToUTC(localDate: string): string {
  const date = new Date(localDate);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();
}


export function utcToLocalInput(utcDate: string): string {
  const date = new Date(utcDate);
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}


export function getElectionPhase(
  start: string,
  end: string
): "Upcoming" | "Ongoing" | "Past" {
  const startNPT = toNepalTime(start);
  const endNPT = toNepalTime(end);
  const nowNPT = toNepalTime(new Date().toISOString());

  if (nowNPT < startNPT) return "Upcoming";
  if (nowNPT >= startNPT && nowNPT <= endNPT) return "Ongoing";
  return "Past";
}


export function formatNepalDate(utcDate: string): string {
  const date = toNepalTime(utcDate);

  return date.toLocaleString("en-NP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
