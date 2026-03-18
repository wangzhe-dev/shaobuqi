<template>
  <view class="page">

    <!-- ── Header ── -->
    <view class="header">
      <view class="tab-strip">
        <view
          v-for="(t, i) in feedTabs" :key="t"
          class="tab-item" :class="{ active: activeTab === i }"
          @tap="switchTab(i)"
        >
          <text class="tab-text">{{ t }}</text>
        </view>
        <view class="tab-ind-wrap" :style="{ transform: `translateX(${activeTab * 100}%)` }">
          <view class="tab-ind-bar" />
        </view>
      </view>
    </view>

    <!-- ── 左右滑动内容区 ── -->
    <swiper
      class="tab-swiper"
      :current="activeTab"
      :duration="280"
      @change="onSwiperChange"
    >
      <swiper-item class="tab-pane">
        <feed-post />
      </swiper-item>
      <swiper-item class="tab-pane">
        <skill-feed />
      </swiper-item>
    </swiper>

  </view>
</template>

<script setup lang="ts">
import FeedPost from '@/components/feed-post/index.vue'
import SkillFeed from '@/components/skill-feed/index.vue'
import { getCurrentInstance } from 'vue'

const instance = getCurrentInstance()
onShow(() => {
  // #ifdef MP-WEIXIN
  ;(uni as any).getTabBar(instance?.proxy)?.setData({ selected: 0 })
  // #endif
})

const activeTab = ref(0)
const feedTabs  = ['消耗记录', 'Skill']

const switchTab      = (i: number)  => { activeTab.value = i }
const onSwiperChange = (e: any)     => { activeTab.value = e.detail.current }
</script>

<style lang="scss" scoped>
.page {
  height: 100%;
  background: #F2F3F7;
  display: flex;
  flex-direction: column;
}

/* ── Header ── */
.header {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #F7F8FA;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
}

.tab-strip {
  position: relative;
  display: flex;
  padding-bottom: 2rpx;

  .tab-item {
    width: 148rpx;
    display: flex;
    justify-content: center;
    padding: 24rpx 0 18rpx;

    .tab-text {
      font-size: 28rpx;
      color: #9CA3AF;
      font-weight: 500;
      transition: color 0.2s;
    }

    &.active .tab-text {
      color: #1A1A2E;
      font-weight: 700;
      font-size: 30rpx;
    }
  }

  .tab-ind-wrap {
    position: absolute;
    bottom: 0; left: 0;
    width: 148rpx;
    display: flex;
    justify-content: center;
    transition: transform 0.28s cubic-bezier(0.34, 1.2, 0.64, 1);

    .tab-ind-bar {
      width: 36rpx;
      height: 4rpx;
      background: #FF7A45;
      border-radius: 2rpx;
    }
  }
}

.hd-search {
  margin-left: auto;
  width: 64rpx; height: 64rpx;
  display: flex; align-items: center; justify-content: center;
}

/* ── Swiper ── */
.tab-swiper {
  flex: 1;
  height: 0; /* flex:1 + height:0 撑满剩余空间 */
}

.tab-pane {
  height: 100%;
}
</style>
