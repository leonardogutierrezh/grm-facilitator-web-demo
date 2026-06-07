const MONTHS_FR = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
];

export function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d)) return "";
  const day = String(d.getDate()).padStart(2, "0");
  return `${day}-${MONTHS_FR[d.getMonth()]}-${d.getFullYear()}`;
}

export function daysSince(value) {
  if (!value) return 0;
  const d = new Date(value);
  if (isNaN(d)) return 0;
  const diff = Date.now() - d.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

// Resolve a possibly-nested field to an id.
export function idOf(v) {
  if (v == null) return null;
  if (typeof v === "object") return v.id ?? null;
  return v;
}

export function statusColor(status) {
  if (!status || typeof status !== "object") return "#707070";
  if (status.rejected_status) return "#ef6a78";
  if (status.final_status) return "#24c38b";
  if (status.open_status || status.initial_status) return "#f5ba74";
  return "#24c38b";
}
