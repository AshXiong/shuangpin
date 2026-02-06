<script setup lang="ts">
import SingleMode from "../components/SingleMode.vue";
import {
  followMap,
  followKeys,
  leadKeys,
  progressiveKeys,
} from "../utils/pinyin";
import { useStore } from "../store";
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { getHanziOf } from "../utils/hanzi";

const store = useStore();
const { currentProgressiveIndex } = storeToRefs(store);
interface PinyinItem {
  lead: string;
  follow: string;
  full: string;
}

interface WeightedPinyin extends PinyinItem {
  characters: string[];
  weight: number;
}
const hanziList = computed((): string[] => {
  const index = currentProgressiveIndex.value;
  if (index < 0) return [];

  const activeKeys: string[] = progressiveKeys.slice(0, index + 1);
  const latestKey = progressiveKeys[index];

  const activeLeads = new Set<string>(
    activeKeys.filter((k) => leadKeys.includes(k)),
  );
  activeLeads.add("");

  const activeFollows = activeKeys.filter((k) => followKeys.includes(k));

  const allPinyin: WeightedPinyin[] = activeFollows.flatMap((fKey) => {
    const list: PinyinItem[] = followMap.get(fKey) ?? [];
    return list
      .filter((p) => activeLeads.has(p.lead))
      .map((p) => ({
        ...p,
        characters: getHanziOf(p.full),
        weight: 1, 
      }))
      .filter((p) => p.characters.length > 0);
  });

  const currentItems = allPinyin.filter(
    (p) => p.lead === latestKey || p.follow === latestKey,
  );
  const oldItems = allPinyin.filter(
    (p) => p.lead !== latestKey && p.follow !== latestKey,
  );

  const BASE_COUNT_PER_PINYIN = 4;

  const oldPool: string[] = [];
  oldItems.forEach((item) => {
    for (let i = 0; i < BASE_COUNT_PER_PINYIN; i++) {
      oldPool.push(item.characters[i % item.characters.length]);
    }
  });
  const newPool: string[] = [];
  if (currentItems.length > 0) {
    const targetNewCount =
      oldPool.length > 0
        ? oldPool.length
        : currentItems.length * BASE_COUNT_PER_PINYIN;

    for (let i = 0; i < targetNewCount; i++) {
      const item = currentItems[i % currentItems.length];
      newPool.push(
        item.characters[
          Math.floor(i / currentItems.length) % item.characters.length
        ],
      );
    }
  }

  return [...oldPool, ...newPool];
});
</script>

<template>
  <single-mode :hanzi-list="hanziList" mode="Progressive" />
</template>
