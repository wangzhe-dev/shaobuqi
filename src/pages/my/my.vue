<template>
  <scroll-view class="page" scroll-y :show-scrollbar="false">

    <!-- ── Profile ── -->
    <view class="profile-card">
      <!-- 未登录 -->
      <view v-if="!isLoggedIn" class="pc-row pc-guest" @tap="goLogin">
        <view class="avatar-wrap">
          <view class="avatar avatar-guest">
            <uni-icons type="person" size="40" color="#C8CBD4" />
          </view>
        </view>
        <view class="pc-info">
          <text class="pc-name">登录 / 注册</text>
          <text class="pc-bio">登录后解锁全部功能</text>
          <view class="pc-tags">
            <text class="pc-tag pc-tag-cta">立即登录 →</text>
          </view>
        </view>
      </view>

      <!-- 已登录 -->
      <view v-else class="pc-row">
        <view class="avatar-wrap">
          <view class="avatar"><text class="avatar-t">{{ profile.name[0] || '我' }}</text></view>
          <view class="lv-badge">Lv.4</view>
        </view>
        <view class="pc-info">
          <text class="pc-name">{{ profile.name }}</text>
          <text class="pc-bio">{{ profile.bio }}</text>
          <view class="pc-tags">
            <text v-for="tag in profile.tags" :key="tag" class="pc-tag">{{ tag }}</text>
          </view>
        </view>
        <view class="edit-btn" @tap="editProfile">
          <uni-icons type="compose" size="17" color="#9CA3AF" />
        </view>
      </view>

      <view class="stats-bar" :class="{ 'stats-dim': !isLoggedIn }">
        <view class="stat-item">
          <text class="sv">{{ isLoggedIn ? profile.publishedSkillCount : '--' }}</text>
          <text class="sl">发布 Skill</text>
        </view>
        <view class="stat-div" />
        <view class="stat-item">
          <text class="sv orange">{{ isLoggedIn ? profile.totalCopyCount : '--' }}</text>
          <text class="sl">被复制</text>
        </view>
        <view class="stat-div" />
        <view class="stat-item">
          <text class="sv green">{{ isLoggedIn ? profile.avgSuccessRate : '--' }}</text>
          <text class="sl">平均复现率</text>
        </view>
      </view>
    </view>

    <!-- ── 我的数据中心 ── -->
    <view class="section">
      <view v-if="!isLoggedIn" class="guest-block" @tap="goLogin">
        <view class="gb-inner">
          <text class="gb-icon">📊</text>
          <text class="gb-text">登录后查看发布、收藏、点赞、复制记录</text>
          <view class="gb-btn">去登录</view>
        </view>
      </view>
      <view v-else class="data-entry-card">
        <view class="data-entry-item" @tap="toMyDataCenter('publish')">
          <view class="dei-icon dei-icon-publish">
            <uni-icons type="compose" size="18" color="#E45C1A" />
          </view>
          <view class="dei-main">
            <text class="dei-title">发布</text>
            <text class="dei-sub">我发布的 Skill</text>
          </view>
          <text class="dei-count">{{ dataSummary.published }}</text>
          <uni-icons type="right" size="13" color="#C8CBD4" />
        </view>
        <view class="data-entry-item" @tap="toMyDataCenter('favorite')">
          <view class="dei-icon dei-icon-favorite">
            <uni-icons type="heart" size="18" color="#5B5BD6" />
          </view>
          <view class="dei-main">
            <text class="dei-title">收藏</text>
            <text class="dei-sub">我收藏的 Skill</text>
          </view>
          <text class="dei-count">{{ dataSummary.favorite }}</text>
          <uni-icons type="right" size="13" color="#C8CBD4" />
        </view>
        <view class="data-entry-item" @tap="toMyDataCenter('like')">
          <view class="dei-icon dei-icon-like">
            <uni-icons type="chat" size="18" color="#2F8A57" />
          </view>
          <view class="dei-main">
            <text class="dei-title">点赞</text>
            <text class="dei-sub">我点赞的动态</text>
          </view>
          <text class="dei-count">{{ dataSummary.like }}</text>
          <uni-icons type="right" size="13" color="#C8CBD4" />
        </view>
        <view class="data-entry-item" @tap="toMyDataCenter('copy')">
          <view class="dei-icon dei-icon-copy">
            <uni-icons type="paperplane" size="18" color="#0B8B8C" />
          </view>
          <view class="dei-main">
            <text class="dei-title">复制</text>
            <text class="dei-sub">我复制过的 Skill</text>
          </view>
          <text class="dei-count">{{ dataSummary.copy }}</text>
          <uni-icons type="right" size="13" color="#C8CBD4" />
        </view>
      </view>
    </view>

    <!-- ── 设置 ── -->
    <view class="section">
      <view class="settings-card">
        <view class="settings-row" @tap="clearCache">
          <view class="settings-icon-box">
            <uni-icons type="trash" color="#9CA3AF" size="17" />
          </view>
          <text class="settings-label">清除缓存</text>
          <text class="settings-hint">{{ cacheSize }}</text>
          <uni-icons type="right" size="13" color="#C8CBD4" />
        </view>
        <view class="settings-row" @tap="showAbout">
          <view class="settings-icon-box">
            <uni-icons type="info-filled" color="#9CA3AF" size="17" />
          </view>
          <text class="settings-label">关于烧不起</text>
          <text class="settings-hint">v1.0.0</text>
          <uni-icons type="right" size="13" color="#C8CBD4" />
        </view>
        <view class="settings-row" @tap="toFeedback">
          <view class="settings-icon-box settings-icon-feedback">
            <uni-icons type="chat" color="#5B5BD6" size="17" />
          </view>
          <text class="settings-label">意见反馈</text>
          <uni-icons type="right" size="13" color="#C8CBD4" />
        </view>
        <view class="settings-row" @tap="showCoopPopup = true">
          <view class="settings-icon-box settings-icon-coop">
            <uni-icons type="heart" color="#FF7A45" size="17" />
          </view>
          <text class="settings-label">商务合作</text>
          <uni-icons type="right" size="13" color="#C8CBD4" />
        </view>
        <!-- 未登录：展示登录入口 -->
        <view v-if="!isLoggedIn" class="settings-row last login-row" @tap="goLogin">
          <view class="settings-icon-box settings-icon-login">
            <uni-icons type="person" color="#5B5BD6" size="17" />
          </view>
          <text class="settings-label login-label">登录 / 注册</text>
          <uni-icons type="right" size="13" color="#5B5BD6" />
        </view>
        <!-- 已登录：退出登录 -->
        <view v-else class="settings-row last logout-row" @tap="logoutConfirm">
          <view class="settings-icon-box">
            <uni-icons type="undo" color="#E45C1A" size="17" />
          </view>
          <text class="settings-label logout-label">退出登录</text>
          <uni-icons type="right" size="13" color="#EABAA7" />
        </view>
      </view>
    </view>

    <view class="page-bottom" />
  </scroll-view>

  <!-- ── 商务合作弹窗 ── -->
  <view v-if="showCoopPopup" class="popup-mask" @tap="showCoopPopup = false">
    <view class="popup-sheet" @tap.stop>
      <view class="popup-handle" />
      <text class="popup-title">商务合作</text>
      <text class="popup-subtitle">欢迎与我们合作，点击可一键复制</text>

      <view class="contact-list">
        <view class="contact-item" @tap="copyContact('1320100598@qq.com', '邮箱')">
          <view class="contact-icon-box contact-icon-email">
            <uni-icons class="contact-icon" type="email-filled" size="24" color="#5B5BD6" />
          </view>
          <view class="contact-info">
            <text class="contact-type">邮箱</text>
            <text class="contact-value">1320100598@qq.com</text>
          </view>
          <view class="copy-badge">复制</view>
        </view>

        <view class="contact-item" @tap="copyContact('13701085362', '手机号')">
          <view class="contact-icon-box contact-icon-phone">
            <uni-icons class="contact-icon" type="phone-filled" size="24" color="#2F8A57" />
          </view>
          <view class="contact-info">
            <text class="contact-type">手机</text>
            <text class="contact-value">13701085362</text>
          </view>
          <view class="copy-badge">复制</view>
        </view>

        <view class="contact-item" @tap="copyContact('wa1320100598', '微信号')">
          <view class="contact-icon-box contact-icon-wechat">
            <uni-icons class="contact-icon" type="weixin" size="24" color="#FF7A45" />
          </view>
          <view class="contact-info">
            <text class="contact-type">微信</text>
            <text class="contact-value">wa1320100598</text>
          </view>
          <view class="copy-badge">复制</view>
        </view>
      </view>

      <view class="popup-close-btn" @tap="showCoopPopup = false">
        <text class="popup-close-text">我知道了</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { getMyCopies, getMyFavorites, getMyLikes, getMyProfile } from '@/api/me'
import { useUserStore } from '@/stores'
import { getCurrentInstance } from 'vue'

const instance = getCurrentInstance()
onShow(() => {
  // #ifdef MP-WEIXIN
  uni.getTabBar(instance?.proxy)?.setData({ selected: 2 })
  // #endif
  loadMyData()
})
const userStore = useUserStore()
const isLoggedIn = computed(() => !!userStore.token)


const goLogin = () => {
  uni.navigateTo({ url: '/pages/login/index' })
}

const profile = reactive({
  name: '我',
  bio: '不断验证Skill，不断分享经验',
  tags: ['Skill'],
  publishedSkillCount: '0',
  totalCopyCount: '0',
  avgSuccessRate: '--'
})

const formatCount = (value: number | null | undefined) => {
  const n = Number(value ?? 0)
  if (!Number.isFinite(n) || n <= 0) return '0'
  if (n >= 10000) return `${(n / 1000).toFixed(1)}k`
  return `${Math.round(n)}`
}

const formatRate = (value: number | null | undefined) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '--'
  return `${Number(value).toFixed(0)}%`
}

const dataSummary = reactive({
  published: '--',
  favorite: '--',
  like: '--',
  copy: '--'
})

const loadMyData = async () => {
  if (!userStore.token) {
    dataSummary.published = '--'
    dataSummary.favorite = '--'
    dataSummary.like = '--'
    dataSummary.copy = '--'
    return
  }

  try {
    const me = await getMyProfile()
    profile.name = me?.nickname || '我'
    profile.bio = me?.bio || '不断验证Skill，不断分享经验'
    profile.tags = me?.bio ? ['创作者'] : ['Skill']
    profile.publishedSkillCount = formatCount(me?.publishedSkillCount)
    profile.totalCopyCount = formatCount(me?.totalCopyCount)
    profile.avgSuccessRate = formatRate(me?.avgSuccessRate)
    dataSummary.published = formatCount(me?.publishedSkillCount)
  } catch { }

  try {
    const favoriteData = await getMyFavorites({ page: 1, pageSize: 1 })
    dataSummary.favorite = formatCount(Number(favoriteData?.pagination?.total ?? 0))
  } catch { }

  try {
    const likeData = await getMyLikes({ page: 1, pageSize: 1 })
    dataSummary.like = formatCount(Number(likeData?.pagination?.total ?? 0))
  } catch { }

  try {
    const copyData = await getMyCopies({ page: 1, pageSize: 1 })
    dataSummary.copy = formatCount(Number(copyData?.pagination?.total ?? 0))
  } catch { }
}

const cacheSize = ref('计算中...')
onMounted(() => {
  uni.getStorageInfo({
    success: (res) => {
      const kb = res.currentSize
      cacheSize.value = kb < 1024 ? `${kb} KB` : `${(kb / 1024).toFixed(1)} MB`
    },
    fail: () => { cacheSize.value = '' }
  })
})

const editProfile = () => uni.showToast({ title: '编辑资料开发中', icon: 'none' })
const toFeedback = () => uni.navigateTo({ url: '/pages/feedback/index' })
const toMyDataCenter = (tab: 'publish' | 'favorite' | 'like' | 'copy') => {
  uni.navigateTo({ url: `/pages/my/data?tab=${tab}` })
}

const showCoopPopup = ref(false)
const copyContact = (text: string, label: string) => {
  showCoopPopup.value = false
  uni.setClipboardData({
    data: text,
    success: () => {
      uni.showToast({ title: `${label}已复制`, icon: 'success' })
    },
    fail: () => {
      uni.showToast({ title: '复制失败，请重试', icon: 'none' })
    }
  })
}

const clearCache = () => {
  uni.showModal({
    title: '清除缓存',
    content: '确定要清除本地缓存吗？',
    confirmColor: '#FF7A45',
    success: ({ confirm }) => {
      if (!confirm) return
      uni.clearStorageSync()
      cacheSize.value = '0 KB'
      uni.showToast({ title: '缓存已清除', icon: 'success' })
    }
  })
}

const showAbout = () => {
  uni.showModal({
    title: '烧不起',
    content: '版本 v1.0.0\n\n记录 AI 消耗，共享高效 Skill。\n\n© 2025 烧不起团队',
    showCancel: false,
    confirmText: '知道了',
    confirmColor: '#5B5BD6',
  })
}

const logoutConfirm = () => {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出当前账号吗？',
    confirmText: '退出',
    confirmColor: '#E45C1A',
    success: ({ confirm }) => {
      if (!confirm) return
      userStore.logout()
    }
  })
}
</script>

<style lang="scss" scoped>
.page {
  height: 100%;
  background: #F7F8FA;
}

/* ── Profile ── */
.profile-card {
  background: #FFFFFF;
  padding: 0 24rpx;
  padding-top: calc(constant(safe-area-inset-top) + 16rpx);
  padding-top: calc(env(safe-area-inset-top) + 16rpx);
  margin-bottom: 16rpx;

  .pc-row {
    display: flex;
    align-items: flex-start;
    gap: 20rpx;
    padding-bottom: 24rpx;
  }

  .pc-guest {
    align-items: center;
    cursor: pointer;

    &:active {
      opacity: 0.7;
    }
  }

  .avatar-wrap {
    position: relative;
    flex-shrink: 0;

    .avatar {
      width: 96rpx;
      height: 96rpx;
      border-radius: 50%;
      background: #5B5BD6;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 6rpx 20rpx rgba(91, 91, 214, 0.28);

      .avatar-t {
        font-size: 40rpx;
        color: #fff;
        font-weight: 800;
      }
    }

    .avatar-guest {
      background: #F3F4F6;
      box-shadow: none;
      border: 2rpx solid #E5E7EB;
    }

    .lv-badge {
      position: absolute;
      bottom: -4rpx;
      right: -6rpx;
      font-size: 17rpx;
      font-weight: 700;
      color: #FF7A45;
      background: #FFF5F0;
      border: 2rpx solid rgba(255, 122, 69, 0.28);
      padding: 2rpx 10rpx;
      border-radius: 100rpx;
    }
  }

  .pc-info {
    flex: 1;
    padding-top: 4rpx;
    min-width: 0;

    .pc-name {
      display: block;
      font-size: 34rpx;
      font-weight: 800;
      color: #1A1A2E;
      margin-bottom: 8rpx;
    }

    .pc-bio {
      display: block;
      font-size: 24rpx;
      color: #6B7280;
      line-height: 1.5;
      margin-bottom: 12rpx;
    }

    .pc-tags {
      display: flex;
      gap: 10rpx;

      .pc-tag {
        font-size: 18rpx;
        color: #5B5BD6;
        font-weight: 500;
        background: rgba(91, 91, 214, 0.08);
        padding: 4rpx 14rpx;
        border-radius: 8rpx;
      }

      .pc-tag-cta {
        color: #FF7A45;
        background: rgba(255, 122, 69, 0.1);
        font-weight: 600;
      }
    }
  }

  .edit-btn {
    width: 56rpx;
    height: 56rpx;
    border-radius: 16rpx;
    background: rgba(0, 0, 0, 0.04);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &:active {
      background: rgba(0, 0, 0, 0.08);
    }
  }
}

/* #ifdef H5 */
.profile-card {
  padding-top: calc(var(--h5-safe-area-inset-top, 0px) + 16rpx) !important;
}

/* #endif */

.stats-bar {
  display: flex;
  align-items: center;
  padding: 20rpx 0 24rpx;
  border-top: 1rpx solid rgba(0, 0, 0, 0.06);

  &.stats-dim {
    opacity: 0.35;
    pointer-events: none;
  }

  .stat-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6rpx;

    .sv {
      font-size: 32rpx;
      font-weight: 900;
      color: #1A1A2E;
    }

    .sv.orange {
      color: #FF7A45;
    }

    .sv.green {
      color: #2F8A57;
    }

    .sl {
      font-size: 20rpx;
      color: #9CA3AF;
    }
  }

  .stat-div {
    width: 1rpx;
    height: 36rpx;
    background: rgba(0, 0, 0, 0.06);
  }
}

/* ── 通用 section ── */
.section {
  padding: 0 24rpx 16rpx;
}



/* ── 未登录占位块 ── */
.guest-block {
  border-radius: 20rpx;
  background: #FFFFFF;
  border: 1rpx dashed #DDD6FE;

  &:active {
    background: #F8F8FF;
  }

  .gb-inner {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 28rpx 24rpx;
  }

  .gb-icon {
    font-size: 36rpx;
    flex-shrink: 0;
  }

  .gb-text {
    flex: 1;
    font-size: 26rpx;
    color: #9CA3AF;
  }

  .gb-btn {
    font-size: 24rpx;
    color: #5B5BD6;
    font-weight: 600;
    background: rgba(91, 91, 214, 0.08);
    padding: 8rpx 20rpx;
    border-radius: 100rpx;
    flex-shrink: 0;
  }
}

.data-entry-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  overflow: hidden;
}

.data-entry-item {
  display: flex;
  align-items: center;
  gap: 14rpx;
  padding: 24rpx 20rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: #F8F8FF;
  }
}

.dei-icon {
  width: 54rpx;
  height: 54rpx;
  border-radius: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dei-icon-publish {
  background: rgba(228, 92, 26, 0.12);
}

.dei-icon-favorite {
  background: rgba(91, 91, 214, 0.12);
}

.dei-icon-like {
  background: rgba(47, 138, 87, 0.12);
}

.dei-icon-copy {
  background: rgba(11, 139, 140, 0.12);
}

.dei-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.dei-title {
  font-size: 28rpx;
  color: #1A1A2E;
  font-weight: 600;
}

.dei-sub {
  font-size: 22rpx;
  color: #9CA3AF;
}

.dei-count {
  font-size: 26rpx;
  color: #6B7280;
  font-weight: 700;
  margin-right: 6rpx;
}

/* ── Skill 列表 ── */
.skill-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.skill-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 24rpx;

  &:active {
    background: #F8F8FF;
  }

  .sc-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12rpx;

    .scene-tag {
      font-size: 18rpx;
      color: #5B5BD6;
      font-weight: 500;
      background: rgba(91, 91, 214, 0.08);
      padding: 4rpx 12rpx;
      border-radius: 6rpx;
    }

    .sc-time {
      font-size: 20rpx;
      color: #9CA3AF;
    }
  }

  .sc-title {
    display: block;
    font-size: 28rpx;
    font-weight: 700;
    color: #1A1A2E;
    margin-bottom: 16rpx;
    line-height: 1.4;
  }

  .sc-stats {
    display: flex;
    align-items: center;
    gap: 10rpx;

    .sc-stat {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4rpx;
      padding: 12rpx 0;
      background: #F7F8FA;
      border-radius: 12rpx;

      .ss-val {
        font-size: 26rpx;
        font-weight: 700;
        color: #1A1A2E;
      }

      .ss-val.orange {
        color: #FF7A45;
      }

      .ss-val.green {
        color: #2F8A57;
      }

      .ss-val.blue {
        color: #5B5BD6;
      }

      .ss-lab {
        font-size: 18rpx;
        color: #9CA3AF;
      }
    }
  }
}

.list-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  overflow: hidden;
}

.line-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 22rpx 20rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: #F8F8FF;
  }
}

.item-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.item-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #1A1A2E;
}

.item-sub {
  font-size: 22rpx;
  color: #9CA3AF;
}

.item-meta {
  font-size: 22rpx;
  color: #6B7280;
}

.empty-row {
  display: flex;
  justify-content: center;
  padding: 28rpx 20rpx;
}

.empty-t {
  font-size: 24rpx;
  color: #9CA3AF;
}

/* ── 设置 ── */
.settings-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  overflow: hidden;
}

.settings-row {
  display: flex;
  align-items: center;
  gap: 14rpx;
  padding: 24rpx 20rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);

  &.last {
    border-bottom: none;
  }

  &:active {
    background: #F8F8FF;
  }

  .settings-icon-box {
    width: 52rpx;
    height: 52rpx;
    border-radius: 14rpx;
    background: rgba(0, 0, 0, 0.04);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .settings-icon-login {
    background: rgba(91, 91, 214, 0.08);
  }

  .settings-label {
    flex: 1;
    font-size: 28rpx;
    color: #1A1A2E;
    font-weight: 500;
  }

  .settings-hint {
    font-size: 24rpx;
    color: #9CA3AF;
    margin-right: 6rpx;
  }
}

.logout-row {
  background: rgba(228, 92, 26, 0.04);
}

.logout-label {
  color: #E45C1A !important;
  font-weight: 600;
}

.login-row {
  background: rgba(91, 91, 214, 0.03);
}

.login-label {
  color: #5B5BD6 !important;
  font-weight: 600;
}

.page-bottom {
  height: calc(80rpx + env(safe-area-inset-bottom));
}

/* ── 新增设置行图标 ── */
.settings-icon-feedback {
  background: rgba(91, 91, 214, 0.08) !important;
}

.settings-icon-coop {
  background: rgba(255, 122, 69, 0.08) !important;
}

/* ── 商务合作弹窗 ── */
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.popup-sheet {
  width: 100%;
  background: #FFFFFF;
  border-radius: 32rpx 32rpx 0 0;
  padding: 0 32rpx calc(40rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.popup-handle {
  width: 72rpx;
  height: 8rpx;
  background: #E5E7EB;
  border-radius: 100rpx;
  margin: 20rpx auto 32rpx;
}

.popup-title {
  display: block;
  font-size: 34rpx;
  font-weight: 800;
  color: #1A1A2E;
  text-align: center;
  margin-bottom: 8rpx;
}

.popup-subtitle {
  display: block;
  font-size: 24rpx;
  color: #9CA3AF;
  text-align: center;
  margin-bottom: 32rpx;
}

.contact-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx;
  background: #F7F8FA;
  border-radius: 20rpx;

  &:active {
    background: #F0F0FD;
  }
}

.contact-icon-box {
  width: 72rpx;
  height: 72rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.contact-icon-email {
  background: rgba(91, 91, 214, 0.1);
}

.contact-icon-phone {
  background: rgba(47, 138, 87, 0.1);
}

.contact-icon-wechat {
  background: rgba(255, 122, 69, 0.1);
}

.contact-icon {
  line-height: 1;
}

.contact-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.contact-type {
  font-size: 22rpx;
  color: #9CA3AF;
}

.contact-value {
  font-size: 28rpx;
  font-weight: 600;
  color: #1A1A2E;
}

.copy-badge {
  font-size: 22rpx;
  color: #5B5BD6;
  font-weight: 600;
  background: rgba(91, 91, 214, 0.08);
  padding: 8rpx 20rpx;
  border-radius: 100rpx;
  flex-shrink: 0;
}

.popup-close-btn {
  height: 88rpx;
  background: #F7F8FA;
  border-radius: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    background: #EDEEF0;
  }
}

.popup-close-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #6B7280;
}
</style>
