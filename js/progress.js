import { spots, eventId } from "./spots.js";
import { storageKey, createEmptyProgress, addStamp } from "./stamp-store.js";
import { getDeviceId, adoptDeviceId, getFingerprint, sign, verify } from "./device.js";
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
export async function restore(data) {
  if (!data || data.version !== 2 || data.eventId !== eventId)
    throw Error("このイベントで保存したバックアップ（形式バージョン2）を選んでください。");
  if (!data.device || typeof data.device.id !== "string" || !data.device.id ||
      typeof data.device.fp !== "string" || !/^[0-9a-f]{64}$/.test(data.device.fp) || !isoDate(data.backedUpAt))
    throw Error("端末情報のないバックアップは読み込めません。");
  if (!data.stamps || typeof data.stamps !== "object" || Array.isArray(data.stamps) ||
      !(data.updatedAt === null || isoDate(data.updatedAt)) || !(await verify(data)))
    throw Error("バックアップの内容が変更されているため、読み込めません。");
  const imported = validate({ ...data, version: 1 });
  const importedCount = Object.keys(imported.stamps).length;
  const update = async () => {
    const oldId = getDeviceId();
    if (oldId !== data.device.id && await getFingerprint() !== data.device.fp)
      throw Error("別の端末で作成されたバックアップは読み込めません。機種変更などでお困りの場合は運営窓口にご相談ください。");
    const p = read();
    const stamps = { ...data.stamps, ...p.stamps };
    const currentCount = Object.keys(p.stamps).length;
    const totalCount = Object.keys(stamps).length;
    const addedCount = totalCount - currentCount;
    const unchangedCount = importedCount - addedCount;
    if (oldId !== data.device.id) adoptDeviceId(data.device.id);
    try {
      localStorage.setItem(key, JSON.stringify({ ...p, stamps, updatedAt: new Date().toISOString() }));
    } catch (error) {
      if (oldId !== data.device.id) adoptDeviceId(oldId);
      throw error;
    }
    return `バックアップを読み込みました。バックアップ ${importedCount}件のうち、${addedCount}件を追加しました。現在の記録は${totalCount}件です。${unchangedCount ? " 同じスタンプはすでに記録されています。" : ""}`;
  };
  return navigator.locks ? navigator.locks.request(key, update) : update();
}
export async function backup() {
  const data = { ...read(), version: 2, backedUpAt: new Date().toISOString(),
    device: { id: getDeviceId(), fp: await getFingerprint() } };
  data.sig = await sign(data);
  return data;
}
