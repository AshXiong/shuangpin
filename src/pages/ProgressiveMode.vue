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

  const pinyinData: WeightedPinyin[] = activeFollows.flatMap((fKey) => {
    const list: PinyinItem[] = followMap.get(fKey) ?? [];

    return list
      .filter((p) => activeLeads.has(p.lead))
      .map((p) => {
        const chars = getHanziOf(p.full);
        const isNew = p.lead === latestKey || p.follow === latestKey;
        return {
          ...p,
          characters: chars,
          weight: isNew ? 3 : 1,
        };
      })
      .filter((p) => p.characters.length > 0);
  });

  const FINAL_LIST: string[] = [];
  const BASE_COUNT_PER_PINYIN = 4;

  pinyinData.forEach((item) => {
    const targetCount = BASE_COUNT_PER_PINYIN * item.weight;

    for (let i = 0; i < targetCount; i++) {
      const charIndex = i % item.characters.length;
      FINAL_LIST.push(item.characters[charIndex]);
    }
  });

  return FINAL_LIST;
});
</script>

<template>
  <single-mode :hanzi-list="hanziList" mode="Progressive" />
</template>
