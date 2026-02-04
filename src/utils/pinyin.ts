import { product } from "./number";

export const zeroLeadKeys = "a ai an ang ao e ei en eng er o ou".split(" ");
export const progressiveKeys = [
  // 第一关：最基础的开口呼
  "a",
  "o",
  "e",
  "b",
  "p",
  "m",
  "f", // 此时解锁：a, o, e, ba, bo, pa, po, ma, mo, me, fa, fo...

  // 第二关：舌尖中音与复韵母初探
  "d",
  "t",
  "n",
  "l",
  "ai",
  "ei",
  "ui", // 此时解锁：da, dai, dei, ta, tai, na, nai, nei, la, lai, lei...

  // 第三关：舌根音与圆唇/收尾音
  "g",
  "k",
  "h",
  "ao",
  "ou", // 此时解锁：ga, gao, gou, ka, kao, kou, ha, hao, hou...

  // 第四关：鼻韵母（最难点，放到中间巩固）
  "an",
  "en",
  "ang",
  "eng",

  // 第五关：舌尖前/后音（平翘舌）
  "z",
  "c",
  "s",
  "zh",
  "ch",
  "sh",
  "r",

  // 第六关：剩余的齐齿/撮口呼
  "j",
  "q",
  "x",
  "i",
  "u",
  "v", // 最后补全核心元音，引爆所有剩余组合

  // 第七关：复杂复韵母与特殊音
  "ie",
  "ue",
  "er",
];
export const leadKeys =
  "b p m f d t n l g k h j q x zh ch sh r z c s y w".split(" ");

export const singleFollowKeys = "a o e i u v".split(" ");

export const multiFollowKeys =
  "ai ei ao ou an en ang eng er ia ie iao iu ian in iang ing ua uo uai ui uan un uang ong ve ue iong".split(
    " ",
  );

export const followKeys = singleFollowKeys.concat(multiFollowKeys);

export const validCombines: Map<string, Pinyin> = new Map();
export const leadMap: Map<string, Pinyin[]> = new Map();
export const followMap: Map<string, Pinyin[]> = new Map();

import pinyinData from "./pinyin-hanzi.json";

// 强制转换类型方便后续判断
const pinyinDict = pinyinData as Record<string, string>;

product(leadKeys.concat(""), followKeys).forEach(([lead, follow]) => {
  const fullPinyin = lead + follow;

  const pinyin = {
    lead,
    follow,
    full: fullPinyin,
  };

  // 核心逻辑：判断组合后的拼音 key 是否存在于 JSON 中
  // 原：hanziMap.p2h.has(pinyin.full)
  if (fullPinyin in pinyinDict) {
    validCombines.set(fullPinyin, pinyin);

    if (!leadMap.has(lead)) leadMap.set(lead, []);
    if (!followMap.has(follow)) followMap.set(follow, []);

    leadMap.get(lead)?.push(pinyin);
    followMap.get(follow)?.push(pinyin);
  }
});

function pushMap<K, V>(m: Map<K, V[]>, k: K, v: V) {
  if (!m.has(k)) {
    m.set(k, []);
  }

  m.get(k)!.push(v);
}

validCombines.forEach((v) => {
  pushMap(leadMap, v.lead, v);
  pushMap(followMap, v.follow, v);
});

export const pinyinSummary = {
  leadCount: leadKeys.length,
  followCount: followKeys.length,
  singleFollowCount: singleFollowKeys.length,
  multiFollowCount: multiFollowKeys.length,
};

export function getCombineOf(p: Pinyin) {
  return p.lead + p.follow;
}
