<script setup lang="ts">
/** * 导入组件与依赖
 */
import SingleMode from "../components/SingleMode.vue"; // 引入展示模式组件
import { followMap, followKeys } from "../utils/pinyin"; // 引入拼音映射表和对应的键名列表
import { useStore } from "../store"; // 引入 Pinia store
import { computed } from "vue";
import { storeToRefs } from "pinia"; // 用于保持 store 状态的响应性
import { getHanziOf } from "../utils/hanzi"; 
// 1. 初始化 Store
const store = useStore();
// 使用 storeToRefs 确保从 store 解构出的 currentFollowIndex 依然具有响应性
const { currentFollowIndex } = storeToRefs(store);

/**
 * 2. 计算当前选中的拼音列表 (followList)
 * 根据 store 中的 currentFollowIndex 从 followKeys 找到对应的键，
 * 然后从 followMap 中获取与之关联的拼音数据数组。
 */
const followList = computed(() => {
  // 中间过程 1: 索引值
  console.log("--- Step 1: Current Index ---", currentFollowIndex.value);

  if (
    currentFollowIndex.value < 0 ||
    currentFollowIndex.value >= followKeys.length
  ) {
    return [];
  }

  // 中间过程 2: 找到对应的 Key (例如 'a')
  const key = followKeys[currentFollowIndex.value];
  console.log("--- Step 2: Key from followKeys ---", key);

  const result = followMap.get(key) ?? [];

  // 中间过程 3: 获取拼音对象数组
  console.log("--- Step 3: Pinyin objects (followList) ---", result);

  return result;
});

/**
 * 3. 计算最终的汉字列表 (hanziList)
 * 将上面得到的拼音对象数组转换为纯汉字字符串数组。
 */
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
  <single-mode :hanzi-list="hanziList" mode="Follow" />
</template>

<style lang="less">
/* 这里目前没有样式，如有需要可在下方添加 Less 样式 */
</style>
