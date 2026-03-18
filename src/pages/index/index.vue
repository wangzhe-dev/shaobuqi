<template>
  <view class="page">
       <!-- Tab + 操作一行 -->
    <view class="header">
      <view class="ht-tab" :class="{ active: activeTab === i }" v-for="(t, i) in feedTabs" :key="t"
        @tap="activeTab = i">
        <text class="ht-text">{{ t }}</text>
      </view>
      <view class="header-spacer" />
      <view class="hd-btn" @tap="toSearch">
        <uni-icons type="search" size="22" color="#374151" />
      </view>
      <view class="hd-btn" @tap="toPublish">
        <uni-icons type="plusempty" size="22" color="#374151" />
      </view>
      <view class="hd-btn" style="position: relative;">
        <uni-icons type="notification" size="22" color="#374151" />
        <view class="red-dot" />
      </view>
    </view>
    <scroll-view class="main-scroll" scroll-y :show-scrollbar="false">
      <!-- 信息流 -->
      <view class="feed-wrap">
        <template v-for="item in feedItems" :key="item.id">

          <!-- 消耗记录 card -->
          <uni-card v-if="item.type === 'post'" :is-shadow="false" :border="false" padding="0" spacing="0"
            margin="0 0 16px 0" @click="toPost(item.id)">
            <!-- 作者行 -->
            <template v-slot:title>
              <view class="ch">
                <view class="ch-av" :style="{ background: item.authorColor }">
                  <text class="ch-av-t">{{ item.author[0] }}</text>
                </view>
                <view class="ch-meta">
                  <text class="ch-name">{{ item.author }}</text>
                  <view class="ch-sub">
                    <view class="ch-model">
                      <view class="ch-dot" />
                      <text class="ch-model-txt">{{ item.model }}</text>
                    </view>
                    <text class="ch-time">{{ item.time }}</text>
                  </view>
                </view>
                <uni-icons type="more-filled" size="18" color="#D1D5DB" />
              </view>
            </template>

            <!-- 账单核心 + 内容 + 反应 -->
            <view class="card-body">
              <!-- ¥ 花费是主角 -->
              <view class="bill">
                <view class="bill-left">
                  <text class="bill-spent-label">花了</text>
                  <text class="bill-cost">¥{{ item.cost }}</text>
                </view>
                <view class="bill-divider" />
                <view class="bill-right">
                  <uni-icons type="bars" size="14" color="#FF7A45" />
                  <text class="bill-token">{{ item.tokens }}</text>
                  <text class="bill-token-unit">tokens</text>
                </view>
              </view>

              <!-- 正文 -->
              <text class="card-content">{{ item.content }}</text>

              <!-- 情绪反应 -->
              <view class="reactions">
                <view class="reaction" :class="{ 'r-on': item.myReaction === r.key }" v-for="r in reactions"
                  :key="r.key" @tap.stop="item.myReaction = r.key">
                  <uni-icons :type="r.icon" size="13" :color="item.myReaction === r.key ? r.activeColor : '#9CA3AF'" />
                  <text class="r-text" :style="item.myReaction === r.key ? { color: r.activeColor } : {}">
                    {{ r.text }}
                  </text>
                </view>
              </view>
            </view>

            <!-- 底部操作栏 -->
            <template v-slot:actions>
              <view class="card-actions">
                <view class="ca" @tap.stop>
                  <uni-icons type="heart-filled" size="16" color="#D1D5DB" />
                  <text class="ca-val">{{ item.likes }}</text>
                </view>
                <view class="ca" @tap.stop>
                  <uni-icons type="chat" size="16" color="#D1D5DB" />
                  <text class="ca-val">{{ item.comments }}</text>
                </view>
                <view class="ca-meoo" @tap.stop>
                  <uni-icons type="hand-up" size="14" color="#6B7280" />
                  <text class="ca-meoo-text">我也是</text>
                  <text class="ca-meoo-val">{{ item.meoo }}</text>
                </view>
                <view class="ca" @tap.stop>
                  <uni-icons type="redo" size="16" color="#D1D5DB" />
                </view>
              </view>
            </template>
          </uni-card>

          <!-- Skill 推荐 card（穿插） -->
          <uni-card v-else-if="item.type === 'skill'" :is-shadow="false" :border="false" padding="0" spacing="0"
            margin="0 0 16px 0" @click="toSkill(item.id)">
            <view class="skill-card">
              <view class="sc-head">
                <view class="sc-badge">
                  <uni-icons type="bolt" size="12" color="#5B5BD6" />
                  <text class="sc-badge-text">SKILL 推荐</text>
                </view>
                <text class="sc-scene">{{ item.scene }}</text>
              </view>
              <text class="sc-title">{{ item.title }}</text>
              <text class="sc-summary">{{ item.summary }}</text>
              <view class="sc-metrics">
                <view class="sc-m">
                  <text class="sc-mval orange">{{ item.avgToken }}</text>
                  <text class="sc-mlabel">平均耗 token</text>
                </view>
                <view class="sc-mdiv" />
                <view class="sc-m">
                  <text class="sc-mval green">{{ item.successRate }}</text>
                  <text class="sc-mlabel">复现率</text>
                </view>
                <view class="sc-mdiv" />
                <view class="sc-m">
                  <text class="sc-mval">{{ item.copyCount }}</text>
                  <text class="sc-mlabel">已复制</text>
                </view>
              </view>
              <view class="sc-foot">
                <view class="sc-author">
                  <view class="sc-av" :style="{ background: item.authorColor }">
                    <text class="sc-av-t">{{ item.author[0] }}</text>
                  </view>
                  <text class="sc-author-name">{{ item.author }}</text>
                </view>
                <view class="sc-copy" @tap.stop="copySkill(item)">
                  <text class="sc-copy-text">复制 Skill</text>
                </view>
              </view>
            </view>
          </uni-card>

        </template>
      </view>

      <view class="feed-bottom" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { getCurrentInstance } from 'vue'

const instance = getCurrentInstance()
onShow(() => {
  ; (uni as any).getTabBar(instance?.proxy)?.setData({ selected: 0 })
})

const activeTab = ref(0)
const feedTabs = ['全部', '消耗记录', 'Skill']

const reactions = [
  { key: 'worth', icon: 'checkmarkempty', activeColor: '#2F8A57', text: '值了' },
  { key: 'ok', icon: 'info', activeColor: '#5B5BD6', text: '还行' },
  { key: 'regret', icon: 'closeempty', activeColor: '#9CA3AF', text: '后悔了' },
  { key: 'addicted', icon: 'fire-filled', activeColor: '#FF7A45', text: '上瘾了' },
]

const feedItems = ref([
  {
    id: 'p1', type: 'post',
    author: '张代码', authorColor: '#5B5BD6',
    model: 'Claude Sonnet', time: '10分钟前',
    content: '用 Claude 帮我把一个 3000 行的老项目重构成 TypeScript，顺便补了单测，效果超出预期。Cursor + Claude 的组合真的很香，就是 token 烧得有点猛 😅',
    cost: '18.60', tokens: '28,400',
    likes: '142', comments: '37', meoo: '56', myReaction: '',
  },
  {
    id: 's1', type: 'skill', scene: '编程',
    title: '前端 Bug 定位与修复助手',
    summary: '线上报错先定位根因再修复，附最小补丁和回归清单，平均节省 40% token',
    avgToken: '2.1k', successRate: '90%', copyCount: '7.6k',
    author: '周知行', authorColor: '#9A6530',
  },
  {
    id: 'p2', type: 'post',
    author: '王建明', authorColor: '#D6943A',
    model: 'GPT-4o', time: '今天 11:08',
    content: '写了一篇技术文档，反复让它改格式改措辞，改了12轮。最后发现直接把要求写清楚第一轮就出来了。这课交得值。',
    cost: '56.20', tokens: '890,000',
    likes: '156', comments: '23', meoo: '89', myReaction: '',
  },
  {
    id: 'p3', type: 'post',
    author: '陈省钱', authorColor: '#2F8A57',
    model: 'Claude Haiku', time: '1小时前',
    content: '分享一个省钱心得：把翻译任务切到 Haiku，准确率几乎一样，token 只花 1/5。用 Sonnet 翻译真的是在交智商税。',
    cost: '0.40', tokens: '8,000',
    likes: '256', comments: '68', meoo: '203', myReaction: '',
  },
  {
    id: 's2', type: 'skill', scene: '写作',
    title: '长文分段生成控制器',
    summary: '把长文任务拆成大纲→段落→整合三步，每步 token 可控，总耗比一次生成少 38%',
    avgToken: '3.2k', successRate: '87%', copyCount: '5.1k',
    author: '林晓峰', authorColor: '#D6943A',
  },
  {
    id: 'p4', type: 'post',
    author: '王爆款', authorColor: '#C84634',
    model: 'Claude Sonnet', time: '2小时前',
    content: '今天测了一个 Agent 工作流：自动读取竞品信息 → 生成对比报告 → 转化为 PPT 大纲，跑了 3 次才稳定，前两次各种幻觉。但稳定之后真的可以一键跑，值得那些 token。',
    cost: '56.20', tokens: '890,000',
    likes: '311', comments: '94', meoo: '189', myReaction: '',
  },
])

const copySkill = (_s: any) => uni.showToast({ title: '已复制 Skill', icon: 'success' })
const toPost = (id: string) => uni.navigateTo({ url: `/pages/detail/post?id=${id}` })
const toSkill = (id: string) => uni.navigateTo({ url: `/pages/detail/skill?id=${id}` })
const toPublish = () => uni.switchTab({ url: '/pages/publish/index' })
const toSearch = () => uni.navigateTo({ url: '/pages/search/index' })
</script>

<style lang="scss" scoped>
.page {
  height: 100%;
  background: #F2F3F7;
  display: flex;
  flex-direction: column;
}

.main-scroll {
  flex: 1;
  overflow: hidden;
}

/* ── Header：tab + 图标一行 ── */
.header {
  display: flex;
  align-items: center;
  background: #fff;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.07);
  padding: 0 8rpx 0 16rpx;

  .ht-tab {
    padding: 24rpx 16rpx 20rpx;
    position: relative;
    flex-shrink: 0;

    .ht-text {
      font-size: 28rpx;
      color: #9CA3AF;
      font-weight: 500;
    }

    &.active {
      .ht-text {
        color: #1A1A2E;
        font-weight: 700;
      }

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 16rpx;
        right: 16rpx;
        height: 4rpx;
        background: #FF7A45;
        border-radius: 2rpx;
      }
    }
  }

  .header-spacer {
    flex: 1;
  }

  .hd-btn {
    width: 64rpx;
    height: 64rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    .red-dot {
      position: absolute;
      top: 10rpx;
      right: 10rpx;
      width: 14rpx;
      height: 14rpx;
      border-radius: 50%;
      background: #FF7A45;
      border: 2rpx solid #fff;
    }
  }
}

/* ── Feed 容器 ── */
.feed-wrap {
  padding: 20rpx;
}

/* ── 作者行（uni-card title slot） ── */
.ch {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx 24rpx 0;

  .ch-av {
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    .ch-av-t {
      font-size: 26rpx;
      color: #fff;
      font-weight: 800;
    }
  }

  .ch-meta {
    flex: 1;

    .ch-name {
      display: block;
      font-size: 30rpx;
      font-weight: 700;
      color: #1A1A2E;
      margin-bottom: 6rpx;
    }

    .ch-sub {
      display: flex;
      align-items: center;
      gap: 12rpx;

      .ch-model {
        display: flex;
        align-items: center;
        gap: 6rpx;
        background: rgba(47, 138, 87, 0.08);
        border: 1rpx solid rgba(47, 138, 87, 0.18);
        border-radius: 100rpx;
        padding: 4rpx 12rpx;

        .ch-dot {
          width: 10rpx;
          height: 10rpx;
          border-radius: 50%;
          background: #2F8A57;
        }

        .ch-model-txt {
          font-size: 20rpx;
          color: #2F8A57;
          font-weight: 500;
        }
      }

      .ch-time {
        font-size: 20rpx;
        color: #9CA3AF;
      }
    }
  }
}

/* ── 账单卡正文区 ── */
.card-body {
  padding: 0 24rpx 8rpx;
}

/* 账单核心：¥ 是主角 */
.bill {
  display: flex;
  align-items: center;
  margin: 20rpx 0;
  background: rgba(255, 122, 69, 0.07);
  border-radius: 20rpx;
  overflow: hidden;
  border: 1rpx solid rgba(255, 122, 69, 0.12);

  .bill-left {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20rpx 12rpx;
    gap: 4rpx;

    .bill-spent-label {
      font-size: 20rpx;
      color: #9CA3AF;
    }

    .bill-cost {
      font-size: 48rpx;
      font-weight: 900;
      color: #E45C1A;
      letter-spacing: -1rpx;
      font-variant-numeric: tabular-nums;
    }
  }

  .bill-divider {
    width: 1rpx;
    height: 80rpx;
    background: rgba(255, 122, 69, 0.18);
    flex-shrink: 0;
  }

  .bill-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20rpx 12rpx;
    gap: 6rpx;

    .bill-token {
      font-size: 32rpx;
      font-weight: 800;
      color: #FF7A45;
      font-variant-numeric: tabular-nums;
    }

    .bill-token-unit {
      font-size: 20rpx;
      color: #9CA3AF;
    }
  }
}

/* 正文 */
.card-content {
  display: block;
  font-size: 29rpx;
  color: #374151;
  line-height: 1.75;
  margin-bottom: 20rpx;
}

/* 情绪反应 */
.reactions {
  display: flex;
  gap: 10rpx;
  margin-bottom: 4rpx;

  .reaction {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6rpx;
    background: rgba(0, 0, 0, 0.04);
    border: 1rpx solid transparent;
    border-radius: 100rpx;
    padding: 12rpx 0;

    .r-text {
      font-size: 20rpx;
      color: #9CA3AF;
      font-weight: 500;
    }

    &.r-on {
      background: rgba(255, 122, 69, 0.08);
      border-color: rgba(255, 122, 69, 0.2);
    }
  }
}

/* 底部操作 actions slot */
.card-actions {
  display: flex;
  align-items: center;
  padding: 14rpx 24rpx;
  border-top: 1rpx solid rgba(0, 0, 0, 0.05);
  gap: 0;

  .ca {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding-right: 28rpx;

    .ca-val {
      font-size: 24rpx;
      color: #9CA3AF;
    }
  }

  .ca-meoo {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    background: rgba(0, 0, 0, 0.04);
    border-radius: 100rpx;
    padding: 10rpx 0;
    margin: 0 16rpx 0 auto;

    .ca-meoo-text {
      font-size: 22rpx;
      color: #6B7280;
      font-weight: 600;
    }

    .ca-meoo-val {
      font-size: 22rpx;
      color: #9CA3AF;
    }
  }
}

/* ── Skill 卡 ── */
.skill-card {
  background: #F0F0FD;
  border-radius: 20rpx;
  border: 1rpx solid #DDD6FE;
  padding: 28rpx;

  .sc-head {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 16rpx;

    .sc-badge {
      display: flex;
      align-items: center;
      gap: 6rpx;
      background: rgba(91, 91, 214, 0.12);
      border-radius: 100rpx;
      padding: 6rpx 14rpx;

      .sc-badge-text {
        font-size: 18rpx;
        color: #5B5BD6;
        font-weight: 800;
        letter-spacing: 0.5rpx;
      }
    }

    .sc-scene {
      font-size: 20rpx;
      color: #9CA3AF;
    }
  }

  .sc-title {
    display: block;
    font-size: 30rpx;
    font-weight: 800;
    color: #1A1A2E;
    margin-bottom: 10rpx;
    line-height: 1.4;
  }

  .sc-summary {
    display: block;
    font-size: 24rpx;
    color: #6B7280;
    line-height: 1.65;
    margin-bottom: 24rpx;
  }

  .sc-metrics {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.65);
    border-radius: 16rpx;
    padding: 16rpx 0;
    margin-bottom: 24rpx;

    .sc-m {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4rpx;

      .sc-mval {
        font-size: 26rpx;
        font-weight: 800;
        color: #1A1A2E;
      }

      .sc-mval.orange {
        color: #FF7A45;
      }

      .sc-mval.green {
        color: #2F8A57;
      }

      .sc-mlabel {
        font-size: 18rpx;
        color: #9CA3AF;
      }
    }

    .sc-mdiv {
      width: 1rpx;
      height: 32rpx;
      background: rgba(0, 0, 0, 0.08);
    }
  }

  .sc-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .sc-author {
      display: flex;
      align-items: center;
      gap: 10rpx;

      .sc-av {
        width: 44rpx;
        height: 44rpx;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;

        .sc-av-t {
          font-size: 18rpx;
          color: #fff;
          font-weight: 700;
        }
      }

      .sc-author-name {
        font-size: 22rpx;
        color: #6B7280;
      }
    }

    .sc-copy {
      background: #5B5BD6;
      padding: 14rpx 32rpx;
      border-radius: 100rpx;
      box-shadow: 0 4rpx 16rpx rgba(91, 91, 214, 0.25);

      .sc-copy-text {
        font-size: 22rpx;
        color: #fff;
        font-weight: 700;
      }
    }
  }
}

.feed-bottom {
  height: calc(160rpx + env(safe-area-inset-bottom));
}
</style>
