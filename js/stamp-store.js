// Event-scoped storage and first-acquisition semantics from manmaru-ar/js/stamp-store.js.
const STORAGE_PREFIX = "kitakyushu-itclub:ar-stamps";

export function storageKey(eventId) {
  return `${STORAGE_PREFIX}:${eventId}`;
}

export function createEmptyProgress(eventId) {
  return { version: 1, eventId, stamps: {}, updatedAt: null };
}

export function addStamp(progress, pointId, now = new Date().toISOString()) {
  return {
    ...progress,
    stamps: { ...progress.stamps, [pointId]: progress.stamps[pointId] || now },
    updatedAt: now,
  };
}
