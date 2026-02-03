import pinyinData from './pinyin-hanzi.json';

const pinyinDict = pinyinData as Record<string, string>;

// 提前构建反向索引，用于“汉字查拼音”和“有效性检查”
const charToPinyinMap: Record<string, string[]> = {};
for (const [pinyin, hanziGroup] of Object.entries(pinyinDict)) {
  for (const char of hanziGroup) {
    if (!charToPinyinMap[char]) charToPinyinMap[char] = [];
    charToPinyinMap[char].push(pinyin);
  }
}

// 导出所有汉字组成的数组（用于随机抽题）
export const allHanziList = Object.values(pinyinDict).join('').split('');

/** 拼音查汉字 */
export function getHanziOf(pinyin: string): string[] {
  return pinyinDict[pinyin.toLowerCase()]?.split('') || [];
}

/** 汉字查拼音 */
export function getPinyinOf(hanzi: string): string[] {
  return charToPinyinMap[hanzi?.[0]] || [];
}

/** 检查是否是库中存在的有效汉字 */
export function isValidHanzi(char: string): boolean {
  return char in charToPinyinMap;
}

/** 检查拼音是否存在 */
export function isValidPinyin(pinyin: string): boolean {
  return pinyin.toLowerCase() in pinyinDict;
}