import { spots, eventId } from "./spots.js";
import { storageKey, createEmptyProgress, addStamp } from "./stamp-store.js";
const key = storageKey(eventId),
  ids = new Set(spots.map((s) => s.id));
const isoDate = (value) =>
  typeof value === "string" &&
  /^\d{4}-\d\d-\d\dT/.test(value) &&
  Number.isFinite(Date.parse(value));
export function validate(value) {
  if (
    !value ||
    value.eventId !== eventId ||
    value.version !== 1 ||
    !value.stamps ||
    typeof value.stamps !== "object" ||
    Array.isArray(value.stamps)
  )
    throw Error("このデモのバージョン1のバックアップを選んでください。");
  for (const [id, time] of Object.entries(value.stamps)) {
    if (!ids.has(id) || !isoDate(time))
      throw Error("未登録のスポット、または無効な取得日時が含まれています。");
  }
  return value;
}
export function read() {
  const raw = localStorage.getItem(key);
  return raw === null
    ? createEmptyProgress(eventId)
    : validate(JSON.parse(raw));
}
async function change(operation) {
  const update = () => {
    const progress = read();
    const result = operation(progress);
    localStorage.setItem(key, JSON.stringify(result.next));
    return result.message;
  };
  return navigator.locks ? navigator.locks.request(key, update) : update();
}
export function collect(id) {
  if (!ids.has(id)) throw Error("スポットが見つかりません。");
  return change((p) => ({
    next: addStamp(p, id),
    message: p.stamps[id] ? "取得済みです" : "スタンプを取得しました！",
  }));
}
export function restore(data) {
  validate(data);
  return change((p) => {
    const stamps = { ...data.stamps, ...p.stamps };
    return {
      next: { ...p, stamps, updatedAt: new Date().toISOString() },
      message:
        Object.keys(stamps).length -
        Object.keys(p.stamps).length +
        "件を追加しました。",
    };
  });
}
export function backup() {
  return { ...read(), backedUpAt: new Date().toISOString() };
}
