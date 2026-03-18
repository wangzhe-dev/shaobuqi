<template>
  <view class="page">
    <skill-feed />
  </view>
</template>

<script setup lang="ts">
import SkillFeed from '@/components/skill-feed/index.vue'
</script>

<style lang="scss" scoped>
.page {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
