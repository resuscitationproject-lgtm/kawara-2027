// Names are proposal examples. Array order matches the compiled image target indices.
const names = [
  [
    "香春岳",
    "金辺川",
    "採銅所の里山",
    "五徳の山道",
    "山の展望所",
    "川辺の散歩道",
    "田園の小径",
    "竹林の道",
    "峠の休憩所",
    "里の広場",
  ],
  [
    "香春神社",
    "採銅所駅",
    "古道の道しるべ",
    "蔵のある町並み",
    "石橋",
    "歴史の小径",
    "里の石碑",
    "古い駅舎",
    "門前の通り",
    "まちの資料室",
  ],
  [
    "道の駅 香春",
    "里山の食堂",
    "まちのパン屋",
    "季節の直売所",
    "峠の茶屋",
    "うどん処",
    "小さな喫茶店",
    "和菓子の店",
    "食の工房",
    "まちの台所",
  ],
  [
    "香春駅",
    "まちの案内所",
    "工芸のアトリエ",
    "窯元の工房",
    "手仕事の店",
    "まちなか広場",
    "交流館",
    "道の駅の休憩所",
    "里の体験工房",
    "まちの展示室",
  ],
];
export const themes = [
  { name: "自然", icon: "mountain", color: "#407568" },
  { name: "歴史", icon: "shrine", color: "#a6533c" },
  { name: "グルメ", icon: "bowl", color: "#987126" },
  { name: "まち歩き", icon: "train", color: "#526e84" },
];
export const spots = Array.from({ length: 40 }, (_, i) => {
  const theme = i % 4,
    num = String(i + 1).padStart(2, "0");
  return {
    id: "kw-" + num,
    num,
    name: names[theme][Math.floor(i / 4)],
    theme,
    targetIndex: i,
    card: "assets/cards/" + num + ".png",
  };
});
export const eventId = "kawara-2027-estimate-demo";
