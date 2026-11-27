const DEVICE_KEY = "kitakyushu-itclub:device-id";
const SIGN_KEY = "kawara2027:backup-sign:v2";
const encoder = new TextEncoder();
const hex = (bytes) => Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

export function getDeviceId() {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : hex(crypto.getRandomValues(new Uint8Array(16)));
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export function adoptDeviceId(id) {
  localStorage.setItem(DEVICE_KEY, id);
}

export async function getFingerprint() {
  const screenSize = [screen.width, screen.height].sort((a, b) => a - b);
  let renderer = "";
  try {
    const gl = document.createElement("canvas").getContext("webgl");
    const extension = gl?.getExtension("WEBGL_debug_renderer_info");
    renderer = gl ? gl.getParameter(extension ? extension.UNMASKED_RENDERER_WEBGL : gl.RENDERER) || "" : "";
  } catch { /* WebGL can be unavailable. */ }
  const attributes = [navigator.userAgent.replace(/[0-9._]/g, ""), ...screenSize,
    window.devicePixelRatio, navigator.hardwareConcurrency, navigator.maxTouchPoints,
    Intl.DateTimeFormat().resolvedOptions().timeZone, renderer];
  return hex(new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(attributes.join("|")))));
}

function canonical(data) {
  return JSON.stringify([data.version, data.eventId, Object.entries(data.stamps).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0),
    data.updatedAt, data.backedUpAt, data.device.id, data.device.fp]);
}

async function signingKey() {
  return crypto.subtle.importKey("raw", encoder.encode(SIGN_KEY), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function sign(data) {
  return hex(new Uint8Array(await crypto.subtle.sign("HMAC", await signingKey(), encoder.encode(canonical(data)))));
}

export async function verify(data) {
  if (typeof data.sig !== "string" || !/^[0-9a-f]{64}$/.test(data.sig)) return false;
  const signature = Uint8Array.from(data.sig.match(/../g), (pair) => parseInt(pair, 16));
  return crypto.subtle.verify("HMAC", await signingKey(), signature, encoder.encode(canonical(data)));
}
