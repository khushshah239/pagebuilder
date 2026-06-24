const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * Format a CDS published timestamp (e.g. `2026-03-07T11:23:40.570+05:30`) into a
 * readable date-time like `Mar 07, 2026 11:23 IST`.
 *
 * Parses the ISO string's own fields directly (no `Date` construction), so the
 * output is identical on server and client — no timezone shift, no hydration
 * mismatch. The `IST` label is derived from the `+05:30` offset; other offsets
 * are shown without a label. Returns "" for missing/unparseable input.
 */
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
