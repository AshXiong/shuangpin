<script setup lang="ts">
/**
 * 导入组件、工具函数、Store 以及 Vue 相关 API
 */
import SingleMode from "../components/SingleMode.vue"; // 引入单机模式展示组件
import { followMap, followKeys, leadKeys,progressiveKeys } from "../utils/pinyin"; // 引入拼音映射表和对应的键名列表
import { useStore } from "../store"; // 引入 Pinia 状态管理
import { computed } from "vue"; // 引入计算属性
import { storeToRefs } from "pinia"; // 引入 Pinia 的解构响应式工具

import { getHanziOf } from "../utils/hanzi";
// 1. 初始化 store 并通过 storeToRefs 保持 currentProgressiveIndex 的响应式
const store = useStore();
const { currentProgressiveIndex } = storeToRefs(store);
/**
 * 计算属性：followList
 * 根据当前的索引 (currentFollowIndex) 从拼音映射表中获取待练习的拼音数据
 */
/**
 * 步骤一：根据当前进度索引，获取已激活的音节（键名）列表
 */
const activeKeys = computed(() => {
  // 越界检查
  if (currentProgressiveIndex.value < 0) {
    return [];
  }

  // 截取从 0 到当前索引的所有键名
  return progressiveKeys.slice(0, currentProgressiveIndex.value + 1);
});

/**
 * 步骤二：将音节（键名表）转换为对应的 Value 数据表
 * 目标：仅匹配 (当前已激活声母 + 当前已激活韵母) 的交集组合
 */

const followList = computed(() => {
  const index = currentProgressiveIndex.value;
  if (index < 0) return [];

  // 1. 获取当前进度激活的所有 Key
  const activeKeys = progressiveKeys.slice(0, index + 1);

  // 2. 建立已激活声母的 Set
  // 核心逻辑：除了包含 activeKeys 里的声母外，默认把 "" (空声母) 放入，
  // 这样只要韵母被激活，对应的零声母音节（如 "a"）就能出来。
  const activeLeads = new Set(activeKeys.filter((k) => leadKeys.includes(k)));
  activeLeads.add(""); // 允许空声母

  // 3. 获取已激活的韵母
  const activeFollows = activeKeys.filter((k) => followKeys.includes(k));

  // 4. 从 followMap 中提取组合，并双向校验
  return activeFollows.flatMap((fKey) => {
    const list = followMap.get(fKey) ?? [];

    // 只有当该组合的声母在已激活列表中，或者是空声母时才保留
    return list.filter((pinyin) => activeLeads.has(pinyin.lead));
  });
});

/**
 * 计算属性：hanziList
 * 将获取到的拼音列表 (followList) 转化为对应的汉字数组
 */
const hanziList = computed(() => {
  // 使用 flatMap 替代 reduce + concat
  // 它会自动遍历 leadList 并将 getHanziByPinyin 返回的数组“拍平”
  return followList.value.flatMap((cur) => getHanziOf(cur.full));
});
</script>

<template>
  <single-mode :hanzi-list="hanziList" mode="Progressive" />
</template>

<style lang="less">
/* 此处可添加组件特有的样式 */
</style>
