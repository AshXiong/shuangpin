<script setup lang="ts">
/**
 * 导入组件、工具函数、Store 以及 Vue 相关 API
 */
import SingleMode from "../components/SingleMode.vue"; // 引入单机模式展示组件
import {
  followMap,
  followKeys,
  leadKeys,
  progressiveKeys,
} from "../utils/pinyin"; // 引入拼音映射表和对应的键名列表
import { useStore } from "../store"; // 引入 Pinia 状态管理
import { computed } from "vue"; // 引入计算属性
import { storeToRefs } from "pinia"; // 引入 Pinia 的解构响应式工具

import { getHanziOf } from "../utils/hanzi";
// 1. 初始化 store 并通过 storeToRefs 保持 currentProgressiveIndex 的响应式
const store = useStore();
const { currentProgressiveIndex } = storeToRefs(store);
interface PinyinItem {
  lead: string; // 声母
  follow: string; // 韵母
  full: string; // 完整带调拼音
}

interface WeightedPinyin extends PinyinItem {
  characters: string[];
  weight: number;
}

/**
 * 改进后的计算属性
 */
const hanziList = computed((): string[] => {
  const index = currentProgressiveIndex.value;
  if (index < 0) return [];

  // 1. 获取当前进度的 Key 列表
  const activeKeys: string[] = progressiveKeys.slice(0, index + 1);
  const latestKey = progressiveKeys[index]; // 当前最新学习的字母

  // 2. 准备声母校验集
  const activeLeads = new Set<string>(
    activeKeys.filter((k) => leadKeys.includes(k)),
  );
  activeLeads.add("");

  // 3. 筛选出所有符合条件的拼音并计算权重
  const activeFollows = activeKeys.filter((k) => followKeys.includes(k));

  const pinyinData: WeightedPinyin[] = activeFollows.flatMap((fKey) => {
    const list: PinyinItem[] = followMap.get(fKey) ?? [];

    return list
      .filter((p) => activeLeads.has(p.lead))
      .map((p) => {
        const chars = getHanziOf(p.full);
        // 动态计算权重：如果是当前关卡新学的字母，权重设为 3，否则为 1
        const isNew = p.lead === latestKey || p.follow === latestKey;
        return {
          ...p,
          characters: chars,
          weight: isNew ? 3 : 1,
        };
      })
      .filter((p) => p.characters.length > 0); // 过滤无汉字的拼音
  });

  // 4. 平衡化处理：保证每个拼音产出的汉字数量相对均衡
  const FINAL_LIST: string[] = [];
  const BASE_COUNT_PER_PINYIN = 4; // 每个拼音的基础出题数

  pinyinData.forEach((item) => {
    // 最终出题数 = 基础数 * 权重
    const targetCount = BASE_COUNT_PER_PINYIN * item.weight;

    for (let i = 0; i < targetCount; i++) {
      // 使用取模运算符 (%) 循环获取汉字，解决“汉字少”导致的概率问题
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

<style lang="less">
/* 此处可添加组件特有的样式 */
</style>
