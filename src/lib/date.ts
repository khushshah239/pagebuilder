const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Parses ISO fields directly (no Date construction) to avoid hydration mismatch.
export function formatPublishedDateTime(value: string | undefined): string {
  if (!value) return "";
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?([+-]\d{2}:\d{2}|Z)?/.exec(
      value
    );
  if (!match) return "";
  const [, year, month, day, hours, minutes, offset] = match;
  const monthLabel = MONTHS[Number(month) - 1];
  if (!monthLabel) return "";
  const timezone = offset === "+05:30" ? " IST" : "";
  return `${monthLabel} ${day}, ${year} ${hours}:${minutes}${timezone}`;
}
