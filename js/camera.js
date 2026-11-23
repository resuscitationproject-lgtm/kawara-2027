import { spots } from "./spots.js";
import { collect } from "./progress.js";
const withAr = new URLSearchParams(location.search).get("plan") !== "plain";
const message = document.querySelector("#camera-status"),
  hint = document.querySelector("#hint"),
  frame = document.querySelector(".frame");
document.querySelector("#mode").textContent = withAr
  ? "プラン①　ARカメラ"
  : "プラン②　画像認識";
const stage = document.querySelector("#stage");
let lastSeen = null,
  sequence = 0,
  bootTimer;
function fail() {
  clearTimeout(bootTimer);
  frame.hidden = true;
  message.textContent = "カメラを開始できませんでした";
  hint.textContent =
    "HTTPS接続、カメラの許可、ブラウザのWebGL対応を確認し、「閉じる」からもう一度お試しください。";
}
function make(tag, attributes) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attributes))
    el.setAttribute(key, value);
  return el;
}
function start() {
  if (
    !window.AFRAME?.components["mindar-image"] ||
    !navigator.mediaDevices?.getUserMedia
  ) {
    fail();
    return;
  }
  const scene = make("a-scene", {
    embedded: "",
    "vr-mode-ui": "enabled:false",
    "device-orientation-permission-ui": "enabled:false",
    renderer: "antialias:true; colorManagement:true",
    "mindar-image":
      "imageTargetSrc: ./assets/targets.mind; autoStart:true; uiLoading:no; uiScanning:no; uiError:no; maxTrack:1; warmupTolerance:5; missTolerance:15; filterMinCF:0.001; filterBeta:1000",
  });
  scene.append(
    make("a-camera", {
      position: "0 0 0",
      "look-controls": "enabled:false",
      "wasd-controls": "enabled:false",
    }),
  );
  if (withAr) {
    scene.append(
      make("a-entity", { light: "type:ambient;intensity:1.4" }),
      make("a-entity", {
        light: "type:directional;intensity:1.7",
        position: "-1 2 3",
      }),
    );
  }
  for (const spot of spots) {
    const target = make("a-entity", {
      "mindar-image-target": "targetIndex:" + spot.targetIndex,
    });
    target.addEventListener("targetFound", async () => {
      const token = ++sequence;
      lastSeen = spot;
      frame.hidden = true;
      if (withAr && !target.firstElementChild) {
        const model = make("a-entity", {
          position: "0 -0.08 0.15",
          scale: "0.34 0.34 0.34",
          "gltf-model": "url(./assets/pencil.glb)",
        });
        model.addEventListener("model-error", () => {
          if (lastSeen === spot)
            hint.textContent =
              "3Dモデルを表示できませんでした。通信環境を確認してください。";
        });
        target.append(model);
      }
      hint.textContent = withAr
        ? "画像にカメラを向けたまま、3Dのえんぴつを見てみましょう。"
        : "別の掲示画像も読み取れます。";
      try {
        const result = await collect(spot.id);
        if (sequence === token) message.textContent = spot.name + "　" + result;
      } catch {
        if (sequence === token)
          message.textContent =
            "認識しましたが記録できません。ブラウザの保存設定を確認してください。";
      }
    });
    target.addEventListener("targetLost", () => {
      if (lastSeen === spot) {
        lastSeen = null;
        frame.hidden = false;
      }
    });
    scene.append(target);
  }
  scene.addEventListener("arError", fail);
  scene.addEventListener("arReady", () => {
    clearTimeout(bootTimer);
    message.textContent = "掲示画像にカメラを向けてください";
    hint.textContent = "カード全体を枠に収めて、少し待ちます。";
    frame.hidden = false;
  });
  stage.append(scene);
  bootTimer = setTimeout(() => {
    hint.textContent =
      "初回は認識データの読み込みに時間がかかります。開始されない場合は、カメラの許可と通信環境を確認してください。";
  }, 20000);
}
window.addEventListener("unhandledrejection", fail);
window.addEventListener("DOMContentLoaded", start, { once: true });
function stop() {
  for (const video of stage.querySelectorAll("video"))
    video.srcObject?.getTracks().forEach((t) => t.stop());
}
window.addEventListener("pagehide", stop);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stop();
    location.replace("./#scan");
  }
});
window.addEventListener("pageshow", (e) => {
  if (e.persisted) location.replace("./#scan");
});
