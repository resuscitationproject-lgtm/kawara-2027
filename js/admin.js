// GitHub Pages serves the encrypted proposal. The decryption key exists only in memory.
const decoder = new TextDecoder();
const encoder = new TextEncoder();
const bytes = (value) => Uint8Array.from(atob(value), (ch) => ch.charCodeAt(0));

export async function unlockProposal(id, password) {
  const response = await fetch(
    new URL("../assets/proposal.json", import.meta.url),
    { cache: "no-store" },
  );
  if (!response.ok)
    throw new Error(
      "見積もりデータを読み込めません。通信状況を確認してください。",
    );
  const { salt, iv, ciphertext } = await response.json();
  const material = await crypto.subtle.importKey(
    "raw",
    encoder.encode(JSON.stringify([id.trim(), password])),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", iterations: 600000, salt: bytes(salt) },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"],
  );
  let clear;
  try {
    clear = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: bytes(iv) },
      key,
      bytes(ciphertext),
    );
  } catch {
    throw new Error("IDまたはパスワードが違います。");
  }
  return JSON.parse(decoder.decode(clear));
}
