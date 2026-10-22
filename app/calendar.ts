type CalendarEvent = { name: string; description: string; iso: string };
const timestamp = (date: Date) =>
  date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
const escapeText = (value: string) =>
  value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
export function buildCalendar(events: CalendarEvent[], now = new Date()) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Komal and Harsh//Wedding Invitation//EN",
    "CALSCALE:GREGORIAN",
    ...events.flatMap((e) => [
      "BEGIN:VEVENT",
      `UID:${e.name.toLowerCase()}-2026@komal-harsh-wedding`,
      `DTSTAMP:${timestamp(now)}`,
      `DTSTART:${timestamp(new Date(e.iso))}`,
      `SUMMARY:${escapeText("Komal & Harsh - " + e.name)}`,
      `LOCATION:${escapeText("Golden Blossom Imperial Resort, Lucknow")}`,
      `DESCRIPTION:${escapeText(e.description)}`,
      "END:VEVENT",
    ]),
    "END:VCALENDAR",
  ];
  return (
    lines
      .map((line) => line.match(/.{1,74}/g)?.join("\r\n ") || "")
      .join("\r\n") + "\r\n"
  );
}
