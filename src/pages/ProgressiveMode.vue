<script setup lang="ts">
import SingleMode from "../components/SingleMode.vue";
import {
  followMap,
  followKeys,
  leadKeys,
  progressiveKeys,
} from "../utils/pinyin";
import { useStore } from "../store";
import { ref, computed, watch } from "vue";
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

function shuffle<T>(array: T[]): T[] {
  const res = [...array];
  for (let i = res.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [res[i], res[j]] = [res[j], res[i]];
  }
  return res;
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

  const newPool: string[] = [];
  currentItems.forEach((item) => {
    newPool.push(...item.characters.slice(0, 2));
  });

  const oldPool: string[] = [];
  oldItems.forEach((item) => {
    oldPool.push(...item.characters.slice(0, 2));
  });

  const shuffledNew = shuffle(newPool);
  const header = shuffledNew.slice(0, 10);

  const remaining = shuffle([...shuffledNew.slice(10), ...oldPool]);

  return [...header, ...remaining];
});

const currentIndex = ref(0);

const getNextChar = () => {
  const list = hanziList.value;
  if (list.length === 0) return "";
  const char = list[currentIndex.value];
  currentIndex.value++;
  if (currentIndex.value >= list.length) {
    currentIndex.value = list.length > 10 ? 10 : 0;
  }

  return char;
};
watch(currentProgressiveIndex, () => {
  currentIndex.value = 0;
});

const TARGET_ACCURACY = 0.95;
const TARGET_COUNT = 20;
const TARGET_SPEED = 35;

function handleValidInput(
  isValid: boolean,
  currentStats: { accuracy: number; speed: number; count: number },
) {
  if (
    currentStats.accuracy >= TARGET_ACCURACY &&
    currentStats.speed >= TARGET_SPEED &&
    currentStats.count >= TARGET_COUNT &&
    store.currentProgressiveIndex < progressiveKeys.length - 1
  ) {
    store.currentProgressiveIndex++;
    return true;
  }
  return false;
}

const singleModeRef = ref();

function onStageComplete(stats: {
  accuracy: number;
  speed: number;
  count: number;
}) {
  const isLeveledUp = handleValidInput(true, stats);
  if (isLeveledUp) {
    singleModeRef.value?.resetStats();
  }
}
</script>

<template>
  <single-mode
    ref="singleModeRef"
    :hanzi-list="hanziList"
    :next-char="getNextChar"
    mode="Progressive"
    @stage-complete="onStageComplete"
  />
</template>
