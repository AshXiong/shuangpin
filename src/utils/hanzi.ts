import pinyinData from './pinyin-hanzi.json';

const pinyinDict = pinyinData as Record<string, string>;

const charToPinyinMap: Record<string, string[]> = {};
for (const [pinyin, hanziGroup] of Object.entries(pinyinDict)) {
  for (const char of hanziGroup) {
    if (!charToPinyinMap[char]) charToPinyinMap[char] = [];
    charToPinyinMap[char].push(pinyin);
  }
}

export const allHanziList = Object.values(pinyinDict).join('').split('');

export function getHanziOf(pinyin: string): string[] {
  return pinyinDict[pinyin.toLowerCase()]?.split('') || [];
}

export function getPinyinOf(hanzi: string): string[] {
  return charToPinyinMap[hanzi?.[0]] || [];
}

export function isValidHanzi(char: string): boolean {
  return char in charToPinyinMap;
}

export function isValidPinyin(pinyin: string): boolean {
  return pinyin.toLowerCase() in pinyinDict;
}