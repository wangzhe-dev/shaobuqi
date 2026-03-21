<template>
  <view class="page">

    <!-- ── Header ── -->
    <uni-nav-bar
      status-bar
      :border="true"
      background-color="#F7F8FA"
      left-width="0"
      right-width="0"
    >
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
    </uni-nav-bar>

    <!-- ── FAB：记一笔（仅消耗记录 Tab 可见）── -->
    <view v-if="activeTab === 0" class="fab" @tap="toCreateRecord">
      <uni-icons type="compose" size="22" color="#fff" />
    </view>

    <!-- ── 左右滑动内容区 ── -->
    <swiper
      class="tab-swiper"
      :current="activeTab"
      :disable-touch="activeTab === 1"
      :duration="280"
      @change="onSwiperChange"
    >
      <swiper-item class="tab-pane">
        <feed-post />
      </swiper-item>
      <swiper-item class="tab-pane">
        <skill-feed @edge-swipe="onSkillEdgeSwipe" />
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
const feedTabs  = ['消耗', 'Skill']

const switchTab      = (i: number)  => { activeTab.value = i }
const onSwiperChange = (e: any)     => { activeTab.value = e.detail.current }
const toCreateRecord = ()           => uni.navigateTo({ url: '/pages/publish/record' })
const onSkillEdgeSwipe = (dir: 'left' | 'right') => {
  if (dir === 'left')  activeTab.value = Math.min(feedTabs.length - 1, activeTab.value + 1)
  else                 activeTab.value = Math.max(0, activeTab.value - 1)
}
</script>

<style lang="scss" scoped>
.page {
  height: 100%;
  background: #F2F3F7;
  display: flex;
  flex-direction: column;
}

/* ── Tab Strip（放入 uni-nav-bar 默认 slot）── */
.tab-strip {
  position: relative;
  display: flex;
  width: 100%;
  padding-bottom: 2rpx;

  .tab-item {
    width: 148rpx;
    display: flex;
    justify-content: center;
    padding: 0 0 18rpx;

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

/* ── FAB ── */
.fab {
  position: fixed;
  right: 40rpx;
  bottom: calc(130rpx + env(safe-area-inset-bottom));
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: #FF7A45;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 28rpx rgba(255, 122, 69, 0.45);
  z-index: 100;
  &:active { opacity: 0.85; }
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
