<script setup lang="ts">
/**
 * 导入组件、工具函数、Store 以及 Vue 相关 API
 */
import SingleMode from '../components/SingleMode.vue'; // 引入单机模式展示组件
import { progressiveKeys,followMap } from '../utils/pinyin' // 引入拼音映射表和对应的键名列表
import { useStore } from '../store'                  // 引入 Pinia 状态管理
import { computed } from 'vue';                      // 引入计算属性
import { storeToRefs } from 'pinia';                 // 引入 Pinia 的解构响应式工具

import { getHanziOf } from '../utils/hanzi';
// 1. 初始化 store 并通过 storeToRefs 保持 currentProgressiveIndex 的响应式
const store = useStore()
const { currentProgressiveIndex } = storeToRefs(store)

/**
 * 计算属性：followList
 * 根据当前的索引 (currentFollowIndex) 从拼音映射表中获取待练习的拼音数据
 */
const followList = computed(() => {
  // 越界检查：如果索引无效，则返回空数组
  if (currentProgressiveIndex.value < 0 || currentProgressiveIndex.value >= progressiveKeys.length) {
    return []
  }

  // 根据当前键名从 Map 中获取拼音列表，若无匹配则返回空数组
  return followMap.get(progressiveKeys[currentProgressiveIndex.value]) ?? []
})

/**
 * 计算属性：hanziList
 * 将获取到的拼音列表 (followList) 转化为对应的汉字数组
 */
const hanziList = computed(() => {
  // 1. 获取所有匹配的汉字并拍平
  const allHanzi = followList.value.flatMap(cur => {
    // 确保 cur.full 存在，且 getHanziByPinyin 始终返回数组
    return getHanziOf(cur.full) || [];
  });

  // 2. 去重（使用 Set 效率最高）
  const uniqueHanzi = [...new Set(allHanzi)];

  // 3. 截取前 500 个
  return uniqueHanzi.slice(0, 500);
});


</script>

<template>
  <single-mode
    :hanzi-list="hanziList"
    mode="Progressive"
  />
</template>

<style lang="less">
/* 此处可添加组件特有的样式 */
</style>