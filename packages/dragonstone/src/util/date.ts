export function daysAgoOnFormatYYYYMMDD(n: number, now: Date) {
  now.setDate(now.getDate() - n);
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
}
