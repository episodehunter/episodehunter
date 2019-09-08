export function unixTimestamp() {
  return (Date.now() / 1000) | 0;
}

export function createDateString(date: Date) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function daysAgoOnFormatYYYYMMDD(n: number, now = new Date()) {
  now.setDate(now.getDate() - n);
  return createDateString(now);
}
