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

      <!-- 底部加载状态 -->
      <view class="load-footer">
        <view v-if="loading" class="load-ing">
          <text class="load-txt">加载中…</text>
        </view>
        <view v-else-if="noMore" class="no-more">
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
const reactions = [
  { key: 'worth',    emoji: '✅', text: '值了',  activeColor: '#2F8A57', bgColor: 'rgba(47,138,87,0.09)',  borderColor: 'rgba(47,138,87,0.22)'  },
  { key: 'ok',       emoji: '🤔', text: '还行',  activeColor: '#5B5BD6', bgColor: 'rgba(91,91,214,0.09)',  borderColor: 'rgba(91,91,214,0.22)'  },
  { key: 'regret',   emoji: '😬', text: '后悔了', activeColor: '#E45C1A', bgColor: 'rgba(228,92,26,0.09)', borderColor: 'rgba(228,92,26,0.22)'  },
  { key: 'addicted', emoji: '🔥', text: '上瘾了', activeColor: '#FF7A45', bgColor: 'rgba(255,122,69,0.09)',borderColor: 'rgba(255,122,69,0.22)' },
]

const initialPosts = [
  {
    id: 'p1', author: '张代码', authorId: 'u1', authorColor: '#5B5BD6',
    model: 'Claude Sonnet', time: '10分钟前',
    content: '用 Claude 帮我把一个 3000 行的老项目重构成 TypeScript，顺便补了单测，效果超出预期。Cursor + Claude 的组合真的很香，就是 token 烧得有点猛 😅',
    cost: '18.60', tokens: '28,400', likes: 142, comments: 37, meoo: 56,
    liked: false, myMeoo: false, myReaction: '',
    images: [
      'https://picsum.photos/seed/code1/600/400',
      'https://picsum.photos/seed/code2/600/400',
      'https://picsum.photos/seed/code3/600/400',
    ],
  },
  {
    id: 'p2', author: '王建明', authorId: 'u3', authorColor: '#D6943A',
    model: 'GPT-4o', time: '今天 11:08',
    content: '写了一篇技术文档，反复让它改格式改措辞，改了12轮。最后发现直接把要求写清楚第一轮就出来了。这课交得值。',
    cost: '56.20', tokens: '890,000', likes: 156, comments: 23, meoo: 89,
    liked: false, myMeoo: false, myReaction: '',
    images: [],
  },
  {
    id: 'p3', author: '陈省钱', authorId: 'u4', authorColor: '#2F8A57',
    model: 'Claude Haiku', time: '1小时前',
    content: '分享一个省钱心得：把翻译任务切到 Haiku，准确率几乎一样，token 只花 1/5。用 Sonnet 翻译真的是在交智商税。',
    cost: '0.40', tokens: '8,000', likes: 256, comments: 68, meoo: 203,
    liked: false, myMeoo: false, myReaction: '',
    images: ['https://picsum.photos/seed/save1/800/500'],
  },
  {
    id: 'p4', author: '王爆款', authorId: 'u6', authorColor: '#C84634',
    model: 'Claude Sonnet', time: '2小时前',
    content: '今天测了一个 Agent 工作流：自动读取竞品信息 → 生成对比报告 → 转化为 PPT 大纲，跑了 3 次才稳定，前两次各种幻觉。但稳定之后真的可以一键跑，值得那些 token。',
    cost: '56.20', tokens: '890,000', likes: 311, comments: 94, meoo: 189,
    liked: false, myMeoo: false, myReaction: '',
    images: [
      'https://picsum.photos/seed/agent1/600/400',
      'https://picsum.photos/seed/agent2/600/400',
    ],
  },
]

const morePosts: Record<number, any[]> = {
  2: [
    {
      id: 'p5', author: '林产品', authorId: 'u7', authorColor: '#7C3AED',
      model: 'Claude Opus', time: '昨天',
      content: '用 Claude Opus 写了份完整的 PRD，结构清晰逻辑自洽，但是 token 花了快 200k。这钱花得有点心疼但是确实省了我一个下午。',
      cost: '12.30', tokens: '198,000', likes: 89, comments: 14, meoo: 42,
      liked: false, myMeoo: false, myReaction: '',
      images: ['https://picsum.photos/seed/prd1/600/400'],
    },
    {
      id: 'p6', author: '黄数据', authorId: 'u8', authorColor: '#0891B2',
      model: 'GPT-4.1', time: '昨天 18:22',
      content: '用 GPT 分析了一份 5000 行的用户行为数据，输出了竞品分析和增长建议，然后让它帮我做成了 Notion 页面，前后不到 20 分钟。',
      cost: '8.80', tokens: '142,000', likes: 203, comments: 31, meoo: 76,
      liked: false, myMeoo: false, myReaction: '',
      images: [],
    },
    {
      id: 'p7', author: '余前端', authorId: 'u9', authorColor: '#059669',
      model: 'Claude Sonnet', time: '2天前',
      content: '把 Figma 截图丢进去直接生成了可跑的 Vue 组件，只改了 10 行。这才是 AI 应该做的事情，不是帮我解释代码。',
      cost: '3.20', tokens: '48,000', likes: 445, comments: 57, meoo: 188,
      liked: false, myMeoo: false, myReaction: '',
      images: [
        'https://picsum.photos/seed/figma1/600/400',
        'https://picsum.photos/seed/figma2/600/400',
      ],
    },
  ],
  3: [],
}

const posts = ref([...initialPosts])
const refreshing = ref(false)
const loading = ref(false)
const noMore = ref(false)
const page = ref(2)

const onRefresh = async () => {
  refreshing.value = true
  await new Promise(r => setTimeout(r, 1200))
  posts.value = initialPosts.map(p => ({ ...p, liked: false, myMeoo: false, myReaction: '' }))
  page.value = 2
  noMore.value = false
  refreshing.value = false
}

const onLoadMore = async () => {
  if (loading.value || noMore.value) return
  loading.value = true
  await new Promise(r => setTimeout(r, 800))
  const next = morePosts[page.value] ?? []
  if (next.length === 0) {
    noMore.value = true
  } else {
    posts.value.push(...next)
    page.value++
  }
  loading.value = false
}

// ── 情绪反应 ──
const rxnTarget = ref<any>(null)
const showReactions = (item: any) => { rxnTarget.value = item }
const pickReaction = (key: string) => {
  if (rxnTarget.value) rxnTarget.value.myReaction = rxnTarget.value.myReaction === key ? '' : key
  rxnTarget.value = null
}

// ── 互动 ──
const toggleLike = (item: any) => { item.liked = !item.liked; item.likes += item.liked ? 1 : -1 }
const toggleMeoo = (item: any) => { item.myMeoo = !item.myMeoo; item.meoo += item.myMeoo ? 1 : -1 }
const previewImg = (images: string[], current: number) => uni.previewImage({ urls: images, current: images[current] })
const sharePost  = (_item: any) => uni.showShareMenu({ withShareTicket: true })

const showMore = (item: any) => {
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

const toPost   = (id: string) => uni.navigateTo({ url: `/pages/detail/post?id=${id}` })
const toAuthor = (id: string) => uni.navigateTo({ url: `/pages/author/index?id=${id}` })
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
