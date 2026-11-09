/**
 * Date shown on the right of history lists (대화 기록, 지난 문제): today's items show the time (14:05),
 * older ones the date (11월 9일) — like a messenger.
 */
export function listDate(at: number, now = new Date()) {
  const d = new Date(at);
  if (d.toDateString() === now.toDateString()) {
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}
