<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useStore } from "../store";
import { progressiveKeys } from "../utils/pinyin";
import { useProgressiveLogic } from "../utils/useProgressiveLogic";
import SingleMode from "../components/SingleMode.vue";

const CONFIG = {
  TARGET_ACCURACY: 0.95,
  TARGET_COUNT: 20,
  TARGET_SPEED: 35,
};

const store = useStore();
const { currentProgressiveIndex } = storeToRefs(store);
const singleModeRef = ref();

const { hanziList, getNextChar } = useProgressiveLogic(currentProgressiveIndex);

function onStageComplete(stats: {
  accuracy: number;
  speed: number;
  count: number;
}) {
  const canLevelUp =
    stats.accuracy >= CONFIG.TARGET_ACCURACY &&
    stats.speed >= CONFIG.TARGET_SPEED &&
    stats.count >= CONFIG.TARGET_COUNT &&
    currentProgressiveIndex.value < progressiveKeys.length - 1;

  if (canLevelUp) {
    currentProgressiveIndex.value++;
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
