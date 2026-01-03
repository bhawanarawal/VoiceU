// utils/time.ts
export function getElectionPhase(
  start: string,
  end: string
): "Upcoming" | "Ongoing" | "Past" {
  const nptOffset = 5.75 * 60 * 60 * 1000; // +5:45 hours in ms

  // Convert UTC strings to NPT
  const startNPT = new Date(new Date(start).getTime() + nptOffset);
  const endNPT = new Date(new Date(end).getTime() + nptOffset);

  // Convert current time to NPT
  const now = new Date(new Date().getTime() + nptOffset);

  if (now < startNPT) return "Upcoming";
  if (now >= startNPT && now <= endNPT) return "Ongoing";
  return "Past";
}
