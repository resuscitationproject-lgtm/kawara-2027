import { unlockProposal } from "./admin.js";
import { spots, themes } from "./spots.js";
import { icon } from "./icons.js";
import { read, collectWithMilestone, backup, restore } from "./progress.js?v=milestones-1";
const main = document.querySelector("main"),
  dialog = document.querySelector("dialog"),
  body = document.querySelector("#detail-body");
const getPage = () => location.hash.slice(1) || "home";
let filter = "全て",
  plan =
    new URLSearchParams(location.search).get("plan") === "plain"
      ? "plain"
      : "ar";
try {
  if (!location.search)
    plan = sessionStorage.getItem("kawara-plan") === "plain" ? "plain" : "ar";
} catch {}
let stamps = {},
  readError = false;
const notice =
  "取得したスタンプは、ご利用のスマートフォンのブラウザ内に保存されます。ブラウザのデータ削除で記録が失われる場合があります。バックアップは同じ端末・ブラウザでの復元用です。機種変更時は引き継げない場合があります。";
function load() {
  try {
    stamps = read().stamps;
    readError = false;
  } catch {
    stamps = {};
    readError = true;
  }
}
function seal(s) {
  const theme = themes[s.theme];
  return (
    '<span class="seal seal-' +
    s.theme +
    '" style="--ink:' +
    theme.color +
    '"><small>KAWARA</small>' +
    icon(theme.icon) +
    "<b>香 春 町</b></span>"
  );
}
function grid(list) {
  return (
    '<div class="grid">' +
    list
      .map(
        (s) =>
          '<button class="spot" data-spot="' +
          s.id +
          '"><span class="spotno">No. ' +
          s.num +
          "</span>" +
          seal(s) +
          "<strong>" +
          s.name +
          '</strong><span class="state ' +
          (stamps[s.id] ? "acquired" : "") +
          '">' +
          (stamps[s.id] ? "✓ 取得済み" : "未取得") +
          "</span></button>",
      )
      .join("") +
    "</div>"
  );
}
function progress() {
  const count = Object.keys(stamps).length,
    pct = Math.round(((100 * count) / spots.length) * 10) / 10;
  return (
    '<section class="ticket"><div class="ticket-icon">' +
    icon("stamp") +
    '</div><div class="ticket-label"><small>MY PASSPORT</small><h2>わたしの記録</h2></div><div class="ticket-numbers"><b>' +
    count +
    '</b><span> / 40 個</span></div><div class="meter"><div><span>' +
    (count === 40 ? "全スポット達成！" : "達成率") +
    "</span><b>" +
    pct +
    '%</b></div><progress max="40" value="' +
    count +
    '">' +
    pct +
    "%</progress></div></section>" +
    (count >= 5 ? `<div class="milestone-links">${Array.from({length: Math.floor(count / 5)}, (_, index) => (index + 1) * 5).map((n) => `<a class="textlink" href="#${n === 40 ? "complete" : "reward-" + n}">${n === 40 ? "コンプリート画面" : n + "個達成の特典"}</a>`).join("")}</div>` : "")
  );
}
function title(eng, jp) {
  return (
    '<div class="section-heading"><small>' +
    eng +
    "</small><h1>" +
    jp +
    "</h1></div>"
  );
}
function home() {
  return (
    '<section class="hero"><div class="hero-text"><span class="place">' +
    icon("pin") +
    '福岡県 田川郡 香春町</span><h1>香春町<span>デジタルスタンプラリー</span></h1><p>山の景色も、まちの味も。<br>香春をめぐって、旅のスタンプを集めよう。</p><a class="button primary" href="#scan">' +
    icon("camera") +
    'スタンプを集める</a></div><span class="hero-caption">KAWARA, FUKUOKA</span></section><div class="eventline"><span>' +
    icon("date") +
    "開催期間　3か月間（開始日未定）</span><span>" +
    icon("pin") +
    "全40スポット（仮）</span></div>" +
    progress() +
    '<section><div class="section-head"><div><small>STAMP COLLECTION</small><h2>スタンプ帳</h2></div><a class="textlink" href="#book">全40件を見る</a></div>' +
    grid(spots.slice(0, 4)) +
    "</section>"
  );
}
function book() {
  const subset = spots.filter(
    (s) =>
      filter === "全て" ||
      (filter === "取得済み" ? stamps[s.id] : !stamps[s.id]),
  );
  return (
    title("STAMP COLLECTION", "スタンプ帳") +
    progress() +
    '<div class="filters">' +
    ["全て", "取得済み", "未取得"]
      .map(
        (f) =>
          '<button aria-pressed="' +
          (filter === f) +
          '" data-filter="' +
          f +
          '">' +
          f +
          "</button>",
      )
      .join("") +
    "</div>" +
    (subset.length
      ? grid(subset)
      : '<p class="panel">該当するスタンプはまだありません。</p>') +
    '<p class="note">掲載する40スポットは見積もり用の仮設定です。</p>'
  );
}
function plans(prices) {
  const modes = [
    ["ar", "① AR表示付き", "画像を認識すると、3Dのえんぴつが現れます。"],
    [
      "plain",
      "② 画像認識のみ",
      "画像を認識すると、すぐにスタンプを取得します。",
    ],
  ];
  const choices = modes.map(([id, label, description]) => {
    const price = prices
      ? `<span>${Number(prices[id]).toLocaleString("ja-JP")}円（税別）</span>`
      : "";
    return `<label class="plan"><input type="radio" name="plan" value="${id}" ${id === plan ? "checked" : ""}><strong>${label}</strong>${price}<p>${description}</p></label>`;
  });
  return `<fieldset><legend>体験するプラン</legend><div class="plan-grid">${choices.join("")}</div></fieldset>`;
}
function scan() {
  return (
    title("STAMP CAMERA", "スタンプを集める") +
    '<section class="panel">' +
    plans() +
    '<h2>試作用カードを読み取る</h2><p>別の画面か紙に掲示画像を表示し、スマートフォンのカメラを向けてください。</p><div class="actions"><a href="camera.html?plan=' +
    plan +
    '" id="camera" class="button primary">' +
    icon("camera") +
    'カメラを起動</a><a class="button" href="#cards">掲示画像を開く</a></div></section><section class="panel"><h2>カメラなしで操作を体験</h2><p>試したいスポットを選ぶと、取得結果とスタンプ帳への反映を確認できます。ここでの取得もデモの記録に加わります。</p><label class="field">体験するスポット<select id="sample">' +
    options() +
    '</select></label><button class="button" id="try">' +
    icon("stamp") +
    "取得を体験する</button></section>"
  );
}
function options() {
  return spots
    .map(
      (s) =>
        '<option value="' + s.id + '">' + s.num + "　" + s.name + "</option>",
    )
    .join("");
}
let proposal = null;
function escapeText(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
function demo() {
  if (!proposal) {
    return (
      title("ADMIN LOGIN", "管理者ログイン") +
      `
      <form id="admin-login" method="post" class="panel login-panel">
        <p>見積もりを開くには、管理用のIDとパスワードを入力してください。</p>
        <label class="field">管理用ID<input required name="username" autocomplete="username" autocapitalize="none" spellcheck="false"></label>
        <label class="field">パスワード<input required type="password" name="password" autocomplete="current-password"></label>
        <button class="button primary" type="submit">ログイン</button>
        <p id="login-status" role="status"></p>
      </form>`
    );
  }
  return (
    title("ADMIN", "管理画面") +
    `
    <section class="panel"><h2>${escapeText(proposal.heading)}</h2><p>${escapeText(proposal.intro)}</p>
      ${plans(proposal.prices)}
      <div class="actions"><a class="button primary" href="#scan">選んだプランを体験</a><a class="button" href="#cards">掲示画像を見る</a></div>
    </section>
    <section class="panel"><h2>見積もりの前提</h2><p>AR表示付きと画像認識のみの2パターンでご提案します。スタンプ画像・認識用画像は発注者からご提供いただきます。</p><p>独自ドメインをご希望の場合は、別途打ち合わせのうえお見積もりします。</p><p>5個ごとの特典内容、景品の受け取り方法、事務局による復元と管理者認証の運用は、別途協議します。</p></section>
    <button id="admin-logout" class="button">ログアウト</button>`
  );
}
function guide() {
  return (
    title("RALLY GUIDE", "遊び方") +
    '<section class="panel"><ol class="steps"><li><b>カメラを起動</b><p>「スタンプを集める」からプランを選び、ブラウザのカメラ利用を許可します。</p></li><li><b>掲示画像を画面に収める</b><p>画像全体にピントを合わせます。プラン①では掲示画像に3Dモデルが重なります。</p></li><li><b>スタンプ帳を開く</b><p>取得は各スポット1回。同じ端末・ブラウザで続きから楽しめます。</p></li></ol><a class="button primary" href="#scan">' +
    icon("camera") +
    'スタンプを集める</a></section><section class="panel"><h2>記録について</h2><p>' +
    notice +
    '</p><p>アカウント登録は不要です。カメラ映像は端末内で処理します。</p><a class="textlink" href="#data">記録のバックアップ・復元</a></section>'
  );
}
function data() {
  return (
    title("PASSPORT BACKUP", "記録のバックアップ・復元") +
    '<section class="panel"><h2>記録をファイルに保存</h2><p>' +
    notice +
    '</p><button class="button primary" id="export">' +
    icon("save") +
    "JSONを保存（" +
    Object.keys(stamps).length +
    '件）</button><p id="export-status" role="status"></p></section><section class="panel"><h2>バックアップから復元</h2><p>同じ端末・ブラウザで保存したバージョン2のJSONを選ぶと、現在の記録を維持して未取得分を追加します。以前のバージョン1のファイルは読み込めません。機種変更などでお困りの場合は運営窓口にご相談ください。</p><label class="field">バックアップファイル<input type="file" accept=".json,application/json" id="import"></label><p role="status" aria-live="polite" id="feedback"></p></section>'
  );
}
function cards() {
  return (
    title("TEST CARDS", "試作用の掲示画像") +
    '<section class="panel card-sheet"><label class="field">スポットを選択<select id="card-select">' +
    options() +
    '</select></label><figure><img id="target-image" src="' +
    spots[0].card +
    '" alt="画像認識用の試作カード"><figcaption id="caption">01　香春岳</figcaption></figure><div class="actions"><button class="button" id="print">このカードを印刷</button><a href="#scan" class="textlink">スタンプ取得に戻る</a></div></section>'
  );
}
function reward() {
  const milestone = Number(getPage().slice(7));
  if (!Number.isInteger(milestone) || milestone < 5 || milestone > 35 || milestone % 5 || Object.keys(stamps).length < milestone)
    return title("REWARD", "特典") + '<section class="panel"><p>まだ達成していません。</p><a class="button" href="#book">スタンプ帳を見る</a></section>';
  return title("REWARD", `${milestone}個達成！`) + `<section class="panel reward-panel"><div class="reward-icon">${icon("stamp")}</div><h2>おめでとうございます！</h2><p>スタンプを${milestone}個集めました。</p><p>特典内容は今後決定します。</p><a class="button primary" href="#book">スタンプ帳を見る</a></section>`;
}
function complete() {
  if (Object.keys(stamps).length < 40) return title("COMPLETE", "コンプリート") + '<section class="panel"><p>40個集めると、この画面を表示できます。</p><a class="button" href="#book">スタンプ帳を見る</a></section>';
  return title("COMPLETE", "コンプリート！") + `<section class="panel reward-panel"><div class="reward-icon">${icon("stamp")}</div><h2>40個のスタンプを達成！</h2><p>香春町を巡っていただき、ありがとうございます。</p><p>この画面を観光協会事務局でご提示ください。景品をお受け取りいただけます。</p><h2>記録をバックアップしましょう</h2><p>大切なスタンプ記録を守るため、バックアップの保存をおすすめします。</p><button class="button primary" id="export">${icon("save")}バックアップを保存</button><p id="export-status" role="status"></p><a class="textlink" href="#book">スタンプ帳を見る</a></section>`;
}
const pages = { home, book, scan, demo, guide, data, cards, complete };
function render() {
  if (dialog.open) dialog.close();
  load();
  const requested = getPage();
  const page = /^reward-\d+$/.test(requested) ? "reward" : Object.hasOwn(pages, requested) ? requested : "home";
  main.innerHTML =
    (readError
      ? '<p role="alert">端末の記録を読み込めません。ブラウザの保存設定や既存データを確認してください。</p>'
      : "") + (page === "reward" ? reward() : pages[page]());
  document.querySelectorAll("header a").forEach((a) => {
    if (a.hash === "#" + page) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
}
function show(html) {
  body.innerHTML = html;
  dialog.showModal();
}
document.querySelector(".brand-icon").innerHTML = icon("mountain");
document.querySelector(".close").onclick = () => dialog.close();
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) dialog.close();
});
main.addEventListener("submit", async (event) => {
  const form = event.target;
  if (form.id !== "admin-login") return;
  event.preventDefault();
  const submit = form.querySelector("button");
  if (submit.disabled) return;
  submit.disabled = true;
  const status = form.querySelector("#login-status");
  status.textContent = "確認しています…";
  try {
    const data = await unlockProposal(
      form.elements.username.value,
      form.elements.password.value,
    );
    if (!form.isConnected || getPage() !== "demo") return;
    proposal = data;
    form.reset();
    render();
    main.focus();
  } catch (error) {
    status.textContent =
      error.message === "IDまたはパスワードが違います。"
        ? error.message
        : "見積もりを開けません。通信状況を確認して再度お試しください。";
    form.elements.password.value = "";
    form.elements.password.focus();
  } finally {
    submit.disabled = false;
  }
});
main.addEventListener("click", async (e) => {
  const button = e.target.closest("button");
  if (!button) return;
  if (button.id === "admin-logout") {
    proposal = null;
    render();
    main.querySelector("[name=username]").focus();
    return;
  }
  if (button.dataset.spot) {
    const s = spots.find((s) => s.id === button.dataset.spot);
    show(
      seal(s) +
        '<p class="meta">No. ' +
        s.num +
        "　" +
        themes[s.theme].name +
        " ／ 仮スポット</p><h2>" +
        s.name +
        "</h2><p>" +
        (stamps[s.id]
          ? "取得日　" + new Date(stamps[s.id]).toLocaleDateString("ja-JP")
          : "このスタンプは未取得です。") +
        '</p><a class="button primary" href="#scan">スタンプを集める</a>',
    );
  }
  if (button.dataset.filter) {
    filter = button.dataset.filter;
    render();
    main.querySelector('[aria-pressed="true"]').focus();
  }
  if (button.id === "try") {
    const s = spots.find(
      (s) => s.id === document.querySelector("#sample").value,
    );
    button.disabled = true;
    try {
      const result = await collectWithMilestone(s.id);
      if (result.milestone) {
        location.hash = result.milestone === 40 ? "complete" : `reward-${result.milestone}`;
        return;
      }
      show(
        seal(s) +
          '<p class="meta">操作体験 ／ No. ' +
          s.num +
          "</p><h2>" +
          result.message +
          "</h2><p>" +
          s.name +
          '</p><a class="button primary" href="#book">' +
          icon("book") +
          "スタンプ帳を見る</a>",
      );
    } catch {
      show(
        "<h2>記録できませんでした</h2><p>ブラウザの保存設定と空き容量を確認してください。</p>",
      );
    } finally {
      button.disabled = false;
    }
  }
  if (button.id === "print") window.print();
  if (button.id === "export") {
    button.disabled = true;
    try {
      const data = await backup();
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download =
        "kawara-demo-" + new Date().toISOString().slice(0, 10) + ".json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch {
      const status = document.querySelector("#export-status");
      if (status) status.textContent = "バックアップを作成できませんでした。ブラウザの保存設定を確認してください。";
    } finally {
      button.disabled = false;
    }
  }
});
main.addEventListener("change", async (e) => {
  if (e.target.name === "plan") {
    plan = e.target.value;
    try {
      sessionStorage.setItem("kawara-plan", plan);
    } catch {}
    const link = document.querySelector("#camera");
    if (link) link.href = "camera.html?plan=" + plan;
  }
  if (e.target.id === "card-select") {
    const s = spots.find((s) => s.id === e.target.value);
    document.querySelector("#target-image").src = s.card;
    document.querySelector("#caption").textContent = s.num + "　" + s.name;
  }
  if (e.target.id === "import" && e.target.files.length) {
    const file = e.target.files[0];
    let msg;
    try {
      if (file.size > 262144) throw Error("ファイルが大きすぎます。");
      msg = await restore(JSON.parse(await file.text()));
      render();
    } catch (err) {
      msg =
        err instanceof SyntaxError
          ? "JSONファイルの形式を確認してください。"
          : err.message;
    }
    const out = document.querySelector("#feedback");
    if (out) out.textContent = msg;
    e.target.value = "";
  }
});
window.addEventListener("hashchange", () => {
  render();
  window.scrollTo(0, 0);
  main.focus({ preventScroll: true });
});
window.addEventListener("pagehide", () => {
  proposal = null;
  if (getPage() === "demo") render();
});
window.addEventListener("pageshow", render);
window.addEventListener("storage", () => {
  if (["home", "book", "data"].includes(getPage())) render();
});
render();
