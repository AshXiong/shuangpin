<script setup lang="ts">
import Keyboard from "../components/Keyboard.vue";
import Hanzi from "../components/Hanzi.vue";
import Pinyin from "../components/Pinyin.vue";
import TypeSummary from "../components/TypeSummary.vue";
import MenuList from "../components/MenuList.vue";

import {
  onActivated,
  onDeactivated,
  ref,
  watchEffect,
  watchPostEffect,
  computed,
} from "vue";
import { matchSpToPinyin } from "../utils/keyboard";
import { useStore } from "../store";
import { getPinyinOf } from "../utils/hanzi";
import { TypingSummary } from "../utils/summary";
import { followKeys, leadKeys, progressiveKeys } from "../utils/pinyin";
import { randInt } from "../utils/number";

export interface SingleModeProps {
  nextChar?: () => string;
  hanziList?: string[];
  onValidInput?: (result: boolean) => void;
  mode?: "Lead" | "Follow" | "Progressive";
}

function getNextChar() {
  if (!props.mode) {
    return props.nextChar?.() ?? "";
  }
  return props.hanziList?.[randInt(props.hanziList?.length)] ?? "";
}

const pinyin = ref<string[]>([]);

const store = useStore();
const props = defineProps<SingleModeProps>();
// 在 const props = defineProps<SingleModeProps>(); 之后添加
console.log("📦 [Step 1: Props Received] 接收到的原始题库:", props.hanziList);
console.log("🎮 [Current Mode]:", props.mode);

const hanziSeq = ref(new Array(4).fill(0).map(() => getNextChar()));
console.log("🎞️ [Step 3: Initial Queue] 初始展示队列:", [...hanziSeq.value]);
const isValid = ref(false);

const summary = ref(new TypingSummary());

const keys = {
  Lead: leadKeys,
  Follow: followKeys,
  Progressive: progressiveKeys,
  "": [] as string[],
}[props.mode ?? ""];

const progresses = computed(() =>
  keys.map((v) => {
    return {
      key: v,
      progress: store.getProgress(v),
    };
  }),
);

const listMenuItems = computed(() => {
  return progresses.value.map(
    (v) =>
      `${v.key.toUpperCase()} ${(store.getAccuracy(v.key) * 100).toFixed(2)}%`,
  );
});

const menuIndex = computed(() => {
  switch (props.mode) {
    case "Lead":
      return store.currentLeadIndex;
    case "Follow":
      return store.currentFollowIndex;
    case "Progressive":
      return store.currentProgressiveIndex;
    default:
      return -1;
  }
});

function onMenuChange(i: number) {
  if (props.mode === "Lead") {
    store.currentLeadIndex = i;
  } else if (props.mode === "Follow") {
    store.currentFollowIndex = i;
  } else if (props.mode === "Progressive") {
    store.currentProgressiveIndex = i;
  }
}

function onKeyPressed() {
  summary.value.onKeyPressed();
}

onActivated(() => {
  document.addEventListener("keypress", onKeyPressed);
});

onDeactivated(() => {
  document.removeEventListener("keypress", onKeyPressed);
});

const answer = computed(() => {
  const pys = getPinyinOf(hanziSeq.value.at(-1) ?? "");
  return pys.at(0) ?? "";
});

const hints = computed(() => {
  return (store.mode().py2sp.get(answer.value) ?? "").split("");
});

function onSeq([lead, follow]: [string?, string?]) {
  const res = matchSpToPinyin(
    store.mode(),
    lead as Char,
    follow as Char,
    answer.value,
  );

  pinyin.value = [res.lead, res.follow].filter((v) => !!v) as string[];

  if (!!lead && !!follow) {
    props.onValidInput?.(res.valid);
    store.updateProgressOnValid(res.lead, res.follow, res.valid);
    summary.value.onValid(res.valid);
    if (res.valid) {
      pinyin.value = [];
    }
  }

  isValid.value = res.valid;
  return res.valid;
}

const localCount = ref(0); // 记录当前关卡打对了多少个字

watchPostEffect(() => {
  if (isValid.value) {
    localCount.value++;
    console.log("✅ [Correct!] 输入正确，准备更新队列...");
    setTimeout(() => {
      const newChar = getNextChar();
      const oldChar = hanziSeq.value.at(-1); // 即将被移出的字

      hanziSeq.value.unshift(newChar);
      hanziSeq.value.pop();

      console.log(`🔄 [Queue Update] 移出: ${oldChar}, 补入: ${newChar}`);
      console.log("🆕 [Current Queue]:", [...hanziSeq.value]);

      isValid.value = false;
    }, 100);
  }
});

// 设定阈值
const TARGET_ACCURACY = 0.95;
const TARGET_COUNT = 20;
const TARGET_SPEED = 30; // 速度达到 30 KPM (汉字/分钟)

watchEffect(() => {
  const s = summary.value;

  // 判断逻辑：正确率达标 AND 速度达标 AND 练习数量达标 AND 还有下一项
  if (
    s.accuracy >= TARGET_ACCURACY &&
    s.hanziPerMinutes >= TARGET_SPEED && // 新增速度指标判断
    localCount.value >= TARGET_COUNT &&
    menuIndex.value < listMenuItems.value.length - 1
  ) {
    console.log(
      `🎯 达成目标！(正确率:${(s.accuracy * 100).toFixed(1)}%, 速度:${s.hanziPerMinutes})`,
    );

    const nextIndex = menuIndex.value + 1;

    // 执行切换
    onMenuChange(nextIndex);

    // 重置当前关卡的计数和统计数据，确保下一关重新开始计算
    localCount.value = 0;
    summary.value = new TypingSummary();
  }
});
</script>

<template>
  <div class="home-page">
    <div class="single-menu">
      <menu-list
        :items="listMenuItems"
        :index="menuIndex"
        @menu-change="onMenuChange"
      />
    </div>

    <div class="input-area">
      <Pinyin :chars="pinyin" />
    </div>

    <div class="hanzi-list">
      <Hanzi :hanzi-seq="[...hanziSeq]" />
    </div>

    <div class="single-keyboard">
      <Keyboard :valid-seq="onSeq" :hints="hints" />
    </div>

    <div class="summary">
      <TypeSummary
        :speed="summary.hanziPerMinutes"
        :accuracy="summary.accuracy"
        :avgpress="summary.pressPerHanzi"
      />
    </div>
  </div>
</template>

<style lang="less">
@import "../styles/color.less";
@import "../styles/var.less";

.home-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;

  .single-menu {
    position: absolute;
    top: 0;
    left: 100px;
    z-index: 10;
  }

  .single-keyboard {
    position: relative;
    z-index: 1;
  }
  .input-area {
    margin-bottom: 32px;
    height: 160px;
    display: flex;
    align-items: center;

    @media (max-width: 576px) {
      margin-top: 30vh;
    }
  }

  .summary {
    position: absolute;
    right: var(--app-padding);
    bottom: var(--app-padding);

    @media (max-width: 576px) {
      top: 36px;
    }
  }

  .hanzi-list {
    position: absolute;
    top: var(--app-padding);
    right: var(--app-padding);

    @media (max-width: 576px) {
      top: 120px;
    }
  }

  @media (max-width: 576px) {
    .single-keyboard {
      position: absolute;
      bottom: 1em;
    }
  }
}
</style>
