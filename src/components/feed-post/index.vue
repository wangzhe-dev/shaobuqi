<template>
  <view class="root">

    <scroll-view
      class="scroll"
      scroll-y
      :show-scrollbar="false"
      refresher-enabled
      refresher-default-style="black"
      :refresher-triggered="refreshing"
      lower-threshold="100"
      @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore"
    >
      <view class="feed-wrap">
        <view v-for="item in posts" :key="item.id" class="post-card" @tap="toPost(item.id)">

          <!-- 作者行 -->
          <view class="pc-hd">
            <view class="pc-av" :style="{ background: item.authorColor }" @tap.stop="toAuthor(item.authorId)">
              <text class="pc-av-t">{{ item.author[0] }}</text>
            </view>
            <view class="pc-info" @tap.stop="toAuthor(item.authorId)">
              <view class="pc-name-row">
                <text class="pc-name">{{ item.author }}</text>
                <view class="pc-model">
                  <view class="pc-dot" />
                  <text class="pc-model-t">{{ item.model }}</text>
                </view>
              </view>
              <text class="pc-time">{{ item.time }}</text>
            </view>
            <view class="pc-more" @tap.stop="showMore(item)">
              <uni-icons type="more-filled" size="18" color="#D1D5DB" />
            </view>
          </view>

          <!-- 正文 -->
          <text class="pc-body">{{ item.content }}</text>

          <!-- 图片九宫格 -->
          <view
            v-if="item.images && item.images.length"
            class="pc-imgs"
            :class="`gi-${item.images.length >= 3 ? (item.images.length > 3 ? 'many' : 3) : item.images.length}`"
          >
            <image
              v-for="(src, i) in item.images.slice(0, 9)" :key="i"
              :src="src" class="pc-img" mode="aspectFill"
              @tap.stop="previewImg(item.images, i)"
            />
          </view>

          <!-- 花费 + 感受 -->
          <view class="pc-meta-row">
            <view class="pc-spend">
              <text class="pc-cost">¥{{ item.cost }}</text>
              <text class="pc-cost-sep">·</text>
              <text class="pc-tok">{{ item.tokens }} tokens</text>
            </view>
            <view
              class="pc-rxn-pill"
              :class="{ 'rxn-active': item.myReaction }"
              :style="item.myReaction
                ? { background: reactions.find(r => r.key === item.myReaction)?.bgColor,
                    color: reactions.find(r => r.key === item.myReaction)?.activeColor }
                : {}"
              @tap.stop="showReactions(item)"
            >
              <text class="pc-rxn-t">
                {{ item.myReaction ? reactions.find(r => r.key === item.myReaction)?.text : '感受' }}
              </text>
              <uni-icons type="bottom" size="10"
                :color="item.myReaction ? reactions.find(r => r.key === item.myReaction)?.activeColor : '#9CA3AF'" />
            </view>
          </view>

          <!-- 操作栏 -->
          <view class="pc-acts">
            <view class="pc-meoo" :class="{ 'meoo-on': item.myMeoo }" @tap.stop="toggleMeoo(item)">
              <uni-icons type="hand-up" size="13" :color="item.myMeoo ? '#FF7A45' : '#6B7280'" />
              <text class="pc-meoo-t" :style="item.myMeoo ? { color: '#FF7A45' } : {}">我也是</text>
              <text class="pc-meoo-n">{{ item.meoo }}</text>
            </view>
            <view class="pc-act-grp">
              <view class="pc-act" @tap.stop="toggleLike(item)">
                <uni-icons :type="item.liked ? 'heart-filled' : 'heart'" size="15" :color="item.liked ? '#E45C1A' : '#9CA3AF'" />
                <text class="pc-act-n" :style="item.liked ? { color: '#E45C1A' } : {}">{{ item.likes }}</text>
              </view>
              <view class="pc-act" @tap.stop="toPost(item.id)">
                <uni-icons type="chat" size="15" color="#9CA3AF" />
                <text class="pc-act-n">{{ item.comments }}</text>
              </view>
              <view class="pc-act" @tap.stop="sharePost(item)">
                <uni-icons type="redo" size="15" color="#9CA3AF" />
              </view>
            </view>
          </view>

        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="!loading && !refreshing && posts.length === 0" class="empty-state">
        <text class="empty-txt">还没有人分享消耗记录</text>
        <text class="empty-sub">快来第一个分享吧</text>
      </view>

      <!-- 底部加载状态 -->
      <view class="load-footer">
        <view v-if="loading" class="load-ing">
          <text class="load-txt">加载中…</text>
        </view>
        <view v-else-if="noMore && posts.length > 0" class="no-more">
          <view class="no-more-line" />
          <text class="no-more-txt">没有更多了</text>
          <view class="no-more-line" />
        </view>
      </view>

      <view class="feed-bottom" />
    </scroll-view>

    <!-- 情绪反应弹层（在 scroll-view 外，fixed 定位才正确） -->
    <view v-if="rxnTarget" class="rxn-mask" @tap="rxnTarget = null">
      <view class="rxn-sheet" @tap.stop>
        <text class="rxn-sheet-title">这次花得...</text>
        <view class="rxn-options">
          <view
            v-for="r in reactions" :key="r.key"
            class="rxn-opt"
            :class="{ 'rxn-opt-on': rxnTarget.myReaction === r.key }"
            :style="rxnTarget.myReaction === r.key ? { background: r.bgColor, borderColor: r.borderColor } : {}"
            @tap="pickReaction(r.key)"
          >
            <text class="rxn-opt-emoji">{{ r.emoji }}</text>
            <text class="rxn-opt-t" :style="rxnTarget.myReaction === r.key ? { color: r.activeColor } : {}">{{ r.text }}</text>
          </view>
        </view>
      </view>
    </view>

  </view>
</template>

<script setup lang="ts">
import { getFeed, likeFeedPost, meooFeedPost, unlikeFeedPost, unmeooFeedPost, updateFeedReaction } from '@/api/feed'
import type { FeedItem, FeedReaction } from '@/api/feed'
import { useUserStore } from '@/stores'

const reactions = [
  { key: 'worth',    emoji: '✅', text: '值了',  activeColor: '#2F8A57', bgColor: 'rgba(47,138,87,0.09)',  borderColor: 'rgba(47,138,87,0.22)'  },
  { key: 'ok',       emoji: '🤔', text: '还行',  activeColor: '#5B5BD6', bgColor: 'rgba(91,91,214,0.09)',  borderColor: 'rgba(91,91,214,0.22)'  },
  { key: 'regret',   emoji: '😬', text: '后悔了', activeColor: '#E45C1A', bgColor: 'rgba(228,92,26,0.09)', borderColor: 'rgba(228,92,26,0.22)'  },
  { key: 'addicted', emoji: '🔥', text: '上瘾了', activeColor: '#FF7A45', bgColor: 'rgba(255,122,69,0.09)',borderColor: 'rgba(255,122,69,0.22)' },
]

// ── 数据格式化工具 ──
const formatTime = (isoStr: string): string => {
  const now = Date.now()
  const ts = new Date(isoStr).getTime()
  const diff = now - ts
  if (diff < 60_000) return '刚刚'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}分钟前`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}小时前`
  if (diff < 172_800_000) return '昨天'
  const d = new Date(isoStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

const formatCost = (amount: string | null, currency: string): string => {
  if (!amount) return '0.00'
  const n = parseFloat(amount)
  if (isNaN(n)) return '0.00'
  if (currency === 'CNY') return n.toFixed(2)
  // 外币转显示（USD → CNY 估算，或直接显示美元符号）
  return `$${n.toFixed(4)}`
}

const formatTokens = (total: number | null): string => {
  if (!total) return '0'
  if (total >= 1_000_000) return `${(total / 1_000_000).toFixed(1)}M`
  if (total >= 1_000) return `${(total / 1_000).toFixed(1)}K`
  return String(total)
}

// 默认头像色阶（当 displayColor 为 null 时）
const FALLBACK_COLORS = ['#5B5BD6', '#7C3AED', '#0891B2', '#059669', '#D6943A', '#C84634']
const fallbackColor = (userId: number) => FALLBACK_COLORS[userId % FALLBACK_COLORS.length]

interface PostItem {
  id: number
  author: string
  authorId: number
  authorColor: string
  model: string
  time: string
  content: string
  images: string[]
  cost: string
  tokens: string
  likes: number
  comments: number
  meoo: number
  liked: boolean
  myMeoo: boolean
  myReaction: string
}

const userStore = useUserStore()

const ensureLogin = () => {
  if (userStore.token) return true

  uni.showToast({ title: '请先登录', icon: 'none' })
  setTimeout(() => {
    uni.navigateTo({ url: '/pages/login/index' })
  }, 300)
  return false
}

const mapApiPost = (item: FeedItem): PostItem => ({
  id: item.id,
  author: item.user.nickname,
  authorId: item.user.id,
  authorColor: item.user.displayColor || fallbackColor(item.user.id),
  model: item.modelName,
  time: formatTime(item.createdAt),
  content: item.noteText,
  images: item.images,
  cost: formatCost(item.costAmount, item.currency),
  tokens: formatTokens(item.totalTokens),
  likes: item.likes ?? 0,
  comments: item.comments ?? 0,
  meoo: item.meoo ?? 0,
  liked: !!item.liked,
  myMeoo: !!item.myMeoo,
  myReaction: item.reaction || '',
})

// ── 状态 ──
const posts = ref<PostItem[]>([])
const refreshing = ref(false)
const loading = ref(false)
const noMore = ref(false)
const page = ref(1)

// ── 数据加载 ──
const loadPage = async (pageNum: number) => {
  const res = await getFeed({ page: pageNum, pageSize: 20 })
  return res
}

const onRefresh = async () => {
  refreshing.value = true
  try {
    const res = await loadPage(1)
    posts.value = res.list.map(mapApiPost)
    page.value = 1
    noMore.value = res.pagination.page >= res.pagination.totalPages
  } catch (err) {
    // 之前是静默失败，调试时难定位，这里保留列表并给出明确提示
    console.error('[feed-post] refresh failed:', err)
    uni.showToast({ title: '动态加载失败', icon: 'none' })
  } finally {
    refreshing.value = false
  }
}

const onLoadMore = async () => {
  if (loading.value || noMore.value) return
  loading.value = true
  try {
    const nextPage = page.value + 1
    const res = await loadPage(nextPage)
    posts.value.push(...res.list.map(mapApiPost))
    page.value = nextPage
    noMore.value = nextPage >= res.pagination.totalPages
  } catch (err) {
    console.error('[feed-post] load more failed:', err)
    uni.showToast({ title: '加载更多失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// 首次加载
onMounted(onRefresh)

// ── 情绪反应 ──
const rxnTarget = ref<PostItem | null>(null)
const showReactions = (item: PostItem) => { rxnTarget.value = item }
const pickReaction = async (key: string) => {
  const target = rxnTarget.value
  if (!target) return

  if (!ensureLogin()) {
    rxnTarget.value = null
    return
  }

  const prevReaction = target.myReaction
  const nextReaction = prevReaction === key ? '' : key
  target.myReaction = nextReaction
  rxnTarget.value = null

  try {
    const result = await updateFeedReaction(target.id, (nextReaction || null) as FeedReaction | null)
    target.myReaction = result.reaction || ''
  } catch (err) {
    console.error('[feed-post] update reaction failed:', err)
    target.myReaction = prevReaction
  }
}

// ── 互动 ──
const toggleLike = async (item: PostItem) => {
  if (!ensureLogin()) return

  const prevLiked = item.liked
  const prevLikes = item.likes

  item.liked = !prevLiked
  item.likes += item.liked ? 1 : -1

  try {
    const res = item.liked ? await likeFeedPost(item.id) : await unlikeFeedPost(item.id)
    item.liked = !!res.liked
    item.likes = res.likes ?? 0
  } catch (err) {
    console.error('[feed-post] toggle like failed:', err)
    item.liked = prevLiked
    item.likes = prevLikes
  }
}

const toggleMeoo = async (item: PostItem) => {
  if (!ensureLogin()) return

  const prevMyMeoo = item.myMeoo
  const prevMeoo = item.meoo

  item.myMeoo = !prevMyMeoo
  item.meoo += item.myMeoo ? 1 : -1

  try {
    const res = item.myMeoo ? await meooFeedPost(item.id) : await unmeooFeedPost(item.id)
    item.myMeoo = !!res.myMeoo
    item.meoo = res.meoo ?? 0
  } catch (err) {
    console.error('[feed-post] toggle meoo failed:', err)
    item.myMeoo = prevMyMeoo
    item.meoo = prevMeoo
  }
}
const previewImg = (images: string[], current: number) => uni.previewImage({ urls: images, current: images[current] })
const sharePost  = (_item: PostItem) => uni.showShareMenu({ withShareTicket: true })

const showMore = (item: PostItem) => {
  uni.showActionSheet({
    itemList: ['不感兴趣', '举报', '复制链接'],
    success: ({ tapIndex }) => {
      if (tapIndex === 0) {
        const idx = posts.value.findIndex(p => p.id === item.id)
        if (idx !== -1) posts.value.splice(idx, 1)
        uni.showToast({ title: '已屏蔽', icon: 'none' })
      } else if (tapIndex === 1) {
        uni.showToast({ title: '举报已提交', icon: 'none' })
      } else {
        uni.setClipboardData({ data: `https://shaobuqi.app/post/${item.id}` })
      }
    },
  })
}

const toPost   = (id: number) => uni.navigateTo({ url: `/pages/detail/post?id=${id}` })
const toAuthor = (id: number) => uni.navigateTo({ url: `/pages/author/index?id=${id}` })
</script>

<style lang="scss" scoped>
.root {
  height: 100%;
  position: relative;
  background: #F7F8FA;
}

.scroll {
  height: 100%;
}

.feed-wrap {
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

/* ── Post card ── */
.post-card {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
}

.pc-hd {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx 24rpx 0;

  .pc-av {
    width: 72rpx; height: 72rpx;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    .pc-av-t { font-size: 26rpx; color: #fff; font-weight: 800; }
  }

  .pc-info {
    flex: 1;
    .pc-name-row { display: flex; align-items: center; gap: 10rpx; margin-bottom: 6rpx; }
    .pc-name { font-size: 30rpx; font-weight: 700; color: #1A1A2E; }
    .pc-model {
      display: flex; align-items: center; gap: 6rpx;
      background: rgba(47,138,87,0.08); border-radius: 100rpx; padding: 3rpx 10rpx;
      .pc-dot { width: 8rpx; height: 8rpx; border-radius: 50%; background: #2F8A57; }
      .pc-model-t { font-size: 18rpx; color: #2F8A57; font-weight: 500; }
    }
    .pc-time { font-size: 20rpx; color: #9CA3AF; }
  }
  .pc-more { padding: 8rpx; }
}

.pc-body {
  display: block;
  font-size: 29rpx; color: #374151; line-height: 1.75;
  padding: 16rpx 24rpx 0;
}

.pc-imgs {
  display: flex; flex-wrap: wrap; margin-top: 16rpx;
  .pc-img { object-fit: cover; }
  &.gi-1 .pc-img { width: 100%; height: 360rpx; }
  &.gi-2 { gap: 4rpx; padding: 0 24rpx;
    .pc-img { width: calc(50% - 2rpx); height: 240rpx; border-radius: 12rpx; }
  }
  &.gi-3, &.gi-many { gap: 4rpx; padding: 0 24rpx;
    .pc-img { width: calc(33.33% - 3rpx); height: 200rpx; border-radius: 10rpx; }
  }
}

.pc-meta-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16rpx 24rpx 0; gap: 16rpx;

  .pc-spend {
    display: flex; align-items: baseline; gap: 8rpx;
    .pc-cost { font-size: 32rpx; font-weight: 800; color: #E45C1A; font-variant-numeric: tabular-nums; }
    .pc-cost-sep { font-size: 22rpx; color: #D1D5DB; }
    .pc-tok { font-size: 22rpx; color: #9CA3AF; }
  }

  .pc-rxn-pill {
    display: flex; align-items: center; gap: 6rpx;
    background: rgba(0,0,0,0.04); border-radius: 100rpx; padding: 8rpx 16rpx;
    .pc-rxn-t { font-size: 22rpx; color: #9CA3AF; font-weight: 500; }
    &.rxn-active .pc-rxn-t { font-weight: 600; }
  }
}

.pc-acts {
  display: flex; align-items: center;
  padding: 14rpx 16rpx 18rpx 20rpx;
  margin-top: 14rpx;
  border-top: 1rpx solid rgba(0,0,0,0.05);

  .pc-meoo {
    display: flex; align-items: center; gap: 6rpx;
    background: rgba(0,0,0,0.04); border-radius: 100rpx; padding: 10rpx 20rpx;
    .pc-meoo-t { font-size: 22rpx; color: #6B7280; font-weight: 600; }
    .pc-meoo-n { font-size: 22rpx; color: #9CA3AF; }
    &.meoo-on { background: rgba(255,122,69,0.08); }
  }
  .pc-act-grp { flex: 1; display: flex; align-items: center; justify-content: flex-end; gap: 4rpx; }
  .pc-act {
    display: flex; align-items: center; gap: 6rpx; padding: 10rpx 14rpx;
    .pc-act-n { font-size: 24rpx; color: #9CA3AF; }
  }
}

/* ── 空状态 ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 40rpx;
  gap: 16rpx;

  .empty-txt { font-size: 30rpx; color: #6B7280; font-weight: 600; }
  .empty-sub { font-size: 24rpx; color: #9CA3AF; }
}

/* ── 加载状态 ── */
.load-footer {
  display: flex;
  justify-content: center;
  padding: 20rpx 0 12rpx;

  .load-txt { font-size: 24rpx; color: #9CA3AF; }

  .no-more {
    display: flex; align-items: center; gap: 20rpx;
    .no-more-line { flex: 1; max-width: 80rpx; height: 1rpx; background: #E5E7EB; }
    .no-more-txt { font-size: 22rpx; color: #D1D5DB; white-space: nowrap; }
  }
}

.feed-bottom {
  height: calc(160rpx + env(safe-area-inset-bottom));
}

/* ── 情绪反应弹层 ── */
.rxn-mask {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0,0,0,0.35);
  display: flex; align-items: flex-end;
  z-index: 999;

  .rxn-sheet {
    width: 100%; background: #fff;
    border-radius: 28rpx 28rpx 0 0;
    padding: 32rpx 32rpx calc(40rpx + env(safe-area-inset-bottom));

    .rxn-sheet-title {
      display: block; font-size: 26rpx; font-weight: 700;
      color: #6B7280; text-align: center; margin-bottom: 28rpx;
    }

    .rxn-options {
      display: flex; gap: 16rpx;

      .rxn-opt {
        flex: 1; display: flex; flex-direction: column; align-items: center;
        gap: 10rpx; background: rgba(0,0,0,0.04);
        border: 2rpx solid transparent; border-radius: 20rpx; padding: 20rpx 0;
        .rxn-opt-emoji { font-size: 40rpx; }
        .rxn-opt-t { font-size: 22rpx; color: #6B7280; font-weight: 600; }
        &.rxn-opt-on { border-color: currentColor; }
      }
    }
  }
}

/* 低版本微信 WebView 对 flex gap 支持不完整，做一层 margin 降级 */
@supports not (gap: 1px) {
  .feed-wrap > * + * { margin-top: 20rpx; }

  .pc-hd > * + * { margin-left: 16rpx; }
  .pc-name-row > * + * { margin-left: 10rpx; }
  .pc-model > * + * { margin-left: 6rpx; }

  .pc-meta-row > * + * { margin-left: 16rpx; }
  .pc-spend > * + * { margin-left: 8rpx; }
  .pc-rxn-pill > * + * { margin-left: 6rpx; }

  .pc-meoo > * + * { margin-left: 6rpx; }
  .pc-act-grp > * + * { margin-left: 4rpx; }
  .pc-act > * + * { margin-left: 6rpx; }

  .no-more > * + * { margin-left: 20rpx; }
  .rxn-options > * + * { margin-left: 16rpx; }
  .rxn-opt > * + * { margin-top: 10rpx; }
}
</style>
