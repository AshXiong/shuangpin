<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useStore } from "../store";
import { useProgressiveLogic } from "../utils/useProgressiveLogic";
import SingleMode from "../components/SingleMode.vue";
import { progressiveKeys } from "../utils/pinyin";

const CONFIG = {
  TARGET_ACCURACY: 0.95,
  TARGET_COUNT: 20,
  TARGET_SPEED: 35,
};

const getTargetCount = (index: number) => {
  const PREVIEW_SIZE = 10;
  const MIN_TRAINING_SIZE = 15;
  const difficultyBonus = Math.floor(index / 3) * 5;
  return PREVIEW_SIZE + MIN_TRAINING_SIZE + difficultyBonus;
};

const store = useStore();
const { currentProgressiveIndex } = storeToRefs(store);
const singleModeRef = ref();

const { hanziList, getNextChar } = useProgressiveLogic(currentProgressiveIndex);

const isPerformanceMet = (stats: {
  accuracy: number;
  speed: number;
  count: number;
}) => {
  const targetCount = getTargetCount(currentProgressiveIndex.value);
  const currentKey = progressiveKeys[currentProgressiveIndex.value];
  const keyStat = latestKeysAccuracy.value.find(
    (item) => item.key === currentKey,
  );
  const isKeyMastered = keyStat
    ? keyStat.accuracy >= CONFIG.TARGET_ACCURACY
    : false;

  return (
    stats.accuracy >= CONFIG.TARGET_ACCURACY &&
    isKeyMastered &&
    stats.speed >= CONFIG.TARGET_SPEED &&
    stats.count >= targetCount
  );
};

function onStageComplete(stats: {
  accuracy: number;
  speed: number;
  count: number;
}) {
  if (isPerformanceMet(stats)) {
    currentProgressiveIndex.value++;
    singleModeRef.value?.resetStats();
  }
}

const latestKeysAccuracy = ref<{ key: string; accuracy: number }[]>([]);
function onProgressUpdate(data: { key: string; accuracy: number }[]) {
  latestKeysAccuracy.value = data;
}
</script>

<template>
  <single-mode
    ref="singleModeRef"
    :hanzi-list="hanziList"
    :next-char="getNextChar"
    mode="Progressive"
    @stage-complete="onStageComplete"
    @progress-update="onProgressUpdate"
  />
</template>
