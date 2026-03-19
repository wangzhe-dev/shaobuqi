<template>
	<view class="page">
		<scroll-view
			class="scrl"
			scroll-y
			:show-scrollbar="false"
			:scroll-into-view="scrollIntoView"
			scroll-with-animation
		>

			<!-- 作者行 -->
			<view class="author-row">
				<view class="av" :style="{ background: post.authorColor }">
					<text class="av-t">{{ post.author[0] }}</text>
				</view>
				<view class="author-info">
					<view class="name-row">
						<text class="author-name">{{ post.author }}</text>
						<view class="model-tag" :style="{ background: post.modelColor + '18' }">
							<view class="model-dot" :style="{ background: post.modelColor }" />
							<text class="model-n" :style="{ color: post.modelColor }">{{ post.model }}</text>
						</view>
					</view>
					<text class="post-time">{{ post.time }}</text>
				</view>
				<view class="follow-btn" :class="{ on: isFollowing }" @tap="toggleFollow">
					<text class="follow-t">{{ isFollowing ? '已关注' : '+ 关注' }}</text>
				</view>
				<view class="more-btn" @tap="showAuthorMore">
					<uni-icons type="more-filled" size="18" color="#D1D5DB" />
				</view>
			</view>

			<!-- 正文 -->
			<text class="body-text">{{ post.content }}</text>

			<!-- 图片九宫格 -->
			<view
				v-if="post.images && post.images.length"
				class="img-grid"
				:class="`gi-${post.images.length >= 3 ? (post.images.length > 3 ? 'many' : 3) : post.images.length}`"
			>
				<image
					v-for="(src, i) in post.images.slice(0, 9)" :key="i"
					:src="src" class="gi-img" mode="aspectFill"
					@tap="previewImg(post.images, i)"
				/>
			</view>

			<!-- 消耗数据卡 -->
			<view class="burn-card">
				<view class="burn-hd">
					<view class="burn-hd-left">
						<uni-icons type="fire-filled" size="15" color="#E45C1A" />
						<text class="burn-hd-t">这次燃烧</text>
					</view>
					<text class="burn-hd-time">{{ post.time }}</text>
				</view>
				<view class="burn-nums">
					<view class="burn-num-item">
						<text class="burn-cost">{{ post.cost }}</text>
						<text class="burn-unit">元</text>
					</view>
					<view class="burn-num-sep" />
					<view class="burn-num-item">
						<text class="burn-tok">{{ post.tokens }}</text>
						<text class="burn-unit">tokens</text>
					</view>
				</view>
				<view class="burn-meta-row">
					<view class="burn-meta-item">
						<text class="bm-dot" :style="{ color: post.modelColor }">●</text>
						<text class="bm-t">{{ post.model }}</text>
					</view>
					<text class="bm-sep">·</text>
					<text class="bm-t">{{ post.duration }}</text>
					<text class="bm-sep">·</text>
					<text class="bm-t">{{ post.rounds }} 轮对话</text>
				</view>
			</view>

			<!-- 感受 Chips -->
			<view class="rxn-section">
				<view class="rxn-header">
					<text class="rxn-label">这次觉得</text>
				</view>
				<view class="rxn-row">
					<view
						v-for="r in reactions" :key="r.key"
						class="rxn-chip" :class="{ on: post.mood === r.key }"
						:style="post.mood === r.key
							? { background: r.bgColor, borderColor: r.borderColor }
							: {}"
						@tap="setMood(r.key)"
					>
						<text class="rxn-em">{{ r.emoji }}</text>
						<text class="rxn-t" :style="post.mood === r.key ? { color: r.activeColor } : {}">{{ r.text }}</text>
					</view>
				</view>
			</view>

			<view class="h-divider" style="margin-top: 8rpx;" />

			<!-- 互动统计（点数字滚动到评论区） -->
			<view class="stat-row">
				<view class="stat-item" @tap="toggleLike">
					<text class="stat-n" :style="isLiked ? { color: '#C84634' } : {}">{{ post.likes }}</text>
					<text class="stat-l">点赞</text>
				</view>
				<view class="stat-bar" />
				<view class="stat-item" @tap="toggleResonate">
					<text class="stat-n" :style="isResonated ? { color: '#FF7A45' } : {}">{{ post.resonates }}</text>
					<text class="stat-l">我也是</text>
				</view>
				<view class="stat-bar" />
				<view class="stat-item" @tap="scrollToComments">
					<text class="stat-n">{{ post.comments }}</text>
					<text class="stat-l">评论</text>
				</view>
			</view>

			<view class="h-divider" />

			<!-- 评论区 -->
			<view id="section-comments" class="comments">
				<text class="cmt-title">评论 {{ post.comments }}</text>

				<view v-for="c in comments" :key="c.id" class="cmt-item">
					<view class="cmt-av" :style="{ background: c.color }">
						<text class="cmt-av-t">{{ c.user[0] }}</text>
					</view>
					<view class="cmt-body">
						<view class="cmt-hd">
							<text class="cmt-name">{{ c.user }}</text>
							<view v-if="c.model" class="cmt-model">
								<text class="cmt-model-t">{{ c.model }}</text>
							</view>
							<text class="cmt-time">{{ c.time }}</text>
						</view>
						<view v-if="c.cost" class="cmt-burn">
							<text class="cmt-burn-cost">{{ c.cost }}</text>
							<text class="cmt-burn-sep">·</text>
							<text class="cmt-burn-tok">{{ c.tokens }}</text>
						</view>
						<text class="cmt-txt">{{ c.content }}</text>
						<view class="cmt-acts">
							<view class="cmt-like" @tap="likeComment(c)">
								<uni-icons
									:type="c.liked ? 'heart-filled' : 'heart'"
									size="14"
									:color="c.liked ? '#C84634' : 'rgba(0,0,0,0.25)'"
								/>
								<text class="cmt-like-n">{{ c.likes }}</text>
							</view>
							<text class="cmt-reply" @tap="replyComment(c)">回复</text>
						</view>
					</view>
				</view>

				<!-- 加载更多 / 结束态 -->
				<view v-if="loadingMore" class="load-state">
					<text class="load-state-t">加载中…</text>
				</view>
				<view v-else-if="noMoreComments" class="load-end">
					<view class="load-end-line" />
					<text class="load-end-t">已展示全部评论</text>
					<view class="load-end-line" />
				</view>
				<view v-else class="load-more" @tap="loadMoreComments">
					<text class="load-more-t">查看更多评论 ›</text>
				</view>
			</view>

			<view class="scroll-gap" />
		</scroll-view>

		<!-- 底部固定栏 -->
		<view class="btm-bar">
			<view class="cmt-input-fake" @tap="openCmtPanel()">
				<uni-icons type="chat" size="16" color="rgba(0,0,0,0.30)" />
				<text class="cmt-ph">说点什么，或者晒出你的用量...</text>
			</view>
			<view class="btm-acts">
				<view class="btm-act" @tap="toggleLike">
					<uni-icons
						:type="isLiked ? 'heart-filled' : 'heart'"
						size="18"
						:color="isLiked ? '#C84634' : 'rgba(0,0,0,0.40)'"
					/>
					<text class="btm-act-n" :style="isLiked ? { color: '#C84634' } : {}">{{ post.likes }}</text>
				</view>
				<view class="btm-act meoo" :class="{ on: isResonated }" @tap="toggleResonate">
					<uni-icons type="hand-up" size="16" :color="isResonated ? '#FF7A45' : 'rgba(0,0,0,0.40)'" />
					<text class="meoo-t" :style="isResonated ? { color: '#FF7A45' } : {}">我也是</text>
				</view>
				<view class="btm-act" @tap="share">
					<uni-icons type="redo" size="18" color="rgba(0,0,0,0.40)" />
				</view>
			</view>
		</view>

		<!-- 评论输入浮层 -->
		<view v-if="showCmtPanel" class="cmt-overlay" @tap.self="closeCmtPanel">
			<view class="cmt-panel">
				<!-- 回复目标提示 -->
				<view v-if="replyTarget" class="reply-hint">
					<text class="reply-hint-t">回复 {{ replyTarget.user }}</text>
					<text class="reply-hint-x" @tap="replyTarget = null">×</text>
				</view>
				<textarea
					class="cmt-ta"
					v-model="cmtText"
					:focus="showCmtPanel"
					:placeholder="replyTarget ? `回复 @${replyTarget.user}...` : '说点什么，或者晒出你的用量...'"
					placeholder-class="cmt-ta-ph"
					:maxlength="300"
					auto-height
					:adjust-position="true"
				/>
				<view class="cmt-panel-foot">
					<text class="cmt-char">{{ cmtText.length }}/300</text>
					<view class="cmt-send" :class="{ on: cmtText.trim().length > 0 }" @tap="submitComment">
						<text class="cmt-send-t">发送</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { nextTick } from 'vue'

const isLiked       = ref(false)
const isResonated   = ref(false)
const isFollowing   = ref(false)
const scrollIntoView = ref('')
const showCmtPanel  = ref(false)
const cmtText       = ref('')
const replyTarget   = ref<any>(null)
const loadingMore   = ref(false)
const noMoreComments = ref(false)

const reactions = [
	{ key: 'worth',    emoji: '✅', text: '值了',  activeColor: '#2F8A57', bgColor: 'rgba(47,138,87,0.10)',  borderColor: 'rgba(47,138,87,0.28)'  },
	{ key: 'ok',       emoji: '🤔', text: '还行',  activeColor: '#5B5BD6', bgColor: 'rgba(91,91,214,0.10)',  borderColor: 'rgba(91,91,214,0.28)'  },
	{ key: 'regret',   emoji: '😬', text: '后悔了', activeColor: '#E45C1A', bgColor: 'rgba(228,92,26,0.10)', borderColor: 'rgba(228,92,26,0.28)'  },
	{ key: 'addicted', emoji: '🔥', text: '上瘾了', activeColor: '#FF7A45', bgColor: 'rgba(255,122,69,0.10)', borderColor: 'rgba(255,122,69,0.28)' },
]

const post = reactive({
	id: 'p1',
	author: '林晓珊',
	authorColor: '#D6943A',
	time: '今天 14:32',
	model: 'Claude Opus',
	modelColor: '#D6943A',
	cost: '¥128.50',
	tokens: '2,340,000',
	duration: '约 3 小时',
	rounds: 47,
	content: `帮甲方改了 7 版 PPT，最后还是用了最开始那版。

中间经历了：加颜色→去颜色→换字体→改排版→加图→去图→回到原版。

钱花了，但经验攒了——我学到了什么叫"甲方的想法只有甲方知道"。下次我先让 AI 帮我生成 10 版，让甲方自己选，省得我来回改。

顺便一提，Claude Opus 的审美真的不错，配色建议每次都比我强。`,
	images: [
		'https://picsum.photos/seed/ppt1/600/400',
		'https://picsum.photos/seed/ppt2/600/400',
	],
	mood: 'worth',
	likes: 284,
	comments: 47,
	resonates: 163,
})

const comments = ref([
	{
		id: 'c1', user: '王建明', color: '#9A6530', time: '1小时前',
		model: 'GPT-4o', cost: '¥89.20', tokens: '1,560,000 tokens',
		content: '我也是！帮客户改方案，来回改了9版，最后客户说"就用第一版吧"。我直接关电脑了。',
		likes: 67, liked: false,
	},
	{
		id: 'c2', user: '张晴', color: '#7B5B3C', time: '2小时前',
		model: null, cost: null, tokens: null,
		content: '所以现在我的策略是第一版故意做差，让甲方改，然后第三版放出精品。成功率提升了80%。',
		likes: 124, liked: true,
	},
	{
		id: 'c3', user: '陈佳慧', color: '#2F8A57', time: '3小时前',
		model: 'Claude Sonnet', cost: '¥34.80', tokens: '640,000 tokens',
		content: '¥128 的课程费，比很多付费课便宜，而且是实战学的。算值了。',
		likes: 89, liked: false,
	},
	{
		id: 'c4', user: '刘明远', color: '#9A2F28', time: '昨天',
		model: null, cost: null, tokens: null,
		content: '甲方确实只有甲方自己知道自己想要什么，而且他们自己也不知道。AI 来了也没用。',
		likes: 201, liked: false,
	},
])

// 分页备用评论
const extraComments = [
	{
		id: 'c5', user: '吴设计', color: '#7C3AED', time: '昨天 23:11',
		model: 'Claude Sonnet', cost: '¥22.10', tokens: '380,000 tokens',
		content: 'PPT 的本质是说服工具不是设计作品。AI 懂审美但不懂人心，这课值。',
		likes: 93, liked: false,
	},
	{
		id: 'c6', user: '孙产品', color: '#059669', time: '2天前',
		model: null, cost: null, tokens: null,
		content: '建议下次直接问甲方：用3个词描述你理想的效果。然后让AI先出10版供选，省得来回改。',
		likes: 156, liked: false,
	},
	{
		id: 'c7', user: '赵运营', color: '#D6943A', time: '3天前',
		model: 'GPT-4.1', cost: '¥15.40', tokens: '260,000 tokens',
		content: '这就是为什么我现在每次接需求必须先做需求确认文档，让对方签字再动手。AI 再强也要管预期。',
		likes: 78, liked: false,
	},
]

onLoad(() => {
	uni.setNavigationBarTitle({ title: '消耗详情' })
})

/* ── 互动 ── */
const setMood      = (key: string) => { post.mood = post.mood === key ? '' : key }
const toggleLike   = () => { isLiked.value = !isLiked.value;   post.likes     += isLiked.value     ? 1 : -1 }
const toggleResonate = () => { isResonated.value = !isResonated.value; post.resonates += isResonated.value ? 1 : -1 }
const toggleFollow = () => { isFollowing.value = !isFollowing.value }
const likeComment  = (c: any) => { c.liked = !c.liked; c.likes += c.liked ? 1 : -1 }

/* ── 滚动到评论 ── */
const scrollToComments = () => {
	scrollIntoView.value = ''
	nextTick(() => { scrollIntoView.value = 'section-comments' })
}

/* ── 评论输入面板 ── */
const openCmtPanel = (target?: any) => {
	replyTarget.value = target ?? null
	cmtText.value     = ''
	showCmtPanel.value = true
}

const closeCmtPanel = () => {
	showCmtPanel.value = false
	replyTarget.value  = null
	cmtText.value      = ''
}

const submitComment = () => {
	const text = cmtText.value.trim()
	if (!text) return
	const prefix = replyTarget.value ? `回复 @${replyTarget.value.user}：` : ''
	comments.value.unshift({
		id:      `c${Date.now()}`,
		user:    '我',
		color:   '#5B5BD6',
		time:    '刚刚',
		model:   null,
		cost:    null,
		tokens:  null,
		content: prefix + text,
		likes:   0,
		liked:   false,
	})
	post.comments++
	closeCmtPanel()
	uni.showToast({ title: '评论成功', icon: 'success' })
}

const replyComment = (c: any) => {
	scrollToComments()
	openCmtPanel(c)
}

/* ── 加载更多评论 ── */
const loadMoreComments = async () => {
	if (loadingMore.value || noMoreComments.value) return
	loadingMore.value = true
	await new Promise(r => setTimeout(r, 800))
	const batch = extraComments.splice(0, 3)
	if (batch.length > 0) {
		comments.value.push(...batch)
	}
	if (extraComments.length === 0) {
		noMoreComments.value = true
	}
	loadingMore.value = false
}

/* ── 作者更多菜单 ── */
const showAuthorMore = () => {
	uni.showActionSheet({
		itemList: ['不感兴趣', '复制链接', '举报该内容'],
		success: ({ tapIndex }) => {
			if (tapIndex === 0) {
				uni.showToast({ title: '已屏蔽该内容', icon: 'none' })
				setTimeout(() => uni.navigateBack(), 800)
			} else if (tapIndex === 1) {
				uni.setClipboardData({ data: `https://shaobuqi.app/post/${post.id}` })
			} else {
				uni.showToast({ title: '举报已提交，感谢反馈', icon: 'none' })
			}
		},
	})
}

const share      = () => uni.showShareMenu({ withShareTicket: true })
const previewImg = (images: string[], current: number) =>
	uni.previewImage({ urls: images, current: images[current] })
</script>

<style lang="scss" scoped>
.page {
	display: flex;
	flex-direction: column;
	height: 100%;
	background: #FFFFFF;
	font-family: 'PingFang SC', 'Hiragino Sans GB', sans-serif;
	overflow: hidden;
	position: relative;
}

.scrl { flex: 1; overflow: hidden; min-height: 0; }

/* ── 作者行 ── */
.author-row {
	display: flex;
	align-items: center;
	gap: 16rpx;
	padding: 24rpx 20rpx 20rpx 28rpx;
}

.av {
	width: 72rpx; height: 72rpx; border-radius: 50%;
	display: flex; align-items: center; justify-content: center; flex-shrink: 0;
	.av-t { font-size: 26rpx; color: #fff; font-weight: 800; }
}

.author-info { flex: 1; display: flex; flex-direction: column; gap: 6rpx; }

.name-row { display: flex; align-items: center; gap: 10rpx; }

.author-name { font-size: 30rpx; font-weight: 700; color: #1A1A2E; }

.model-tag {
	display: flex; align-items: center; gap: 6rpx;
	border-radius: 100rpx; padding: 4rpx 12rpx;
	flex-shrink: 0;
	.model-dot { width: 8rpx; height: 8rpx; border-radius: 50%; flex-shrink: 0; }
	.model-n { font-size: 18rpx; font-weight: 600; }
}

.post-time { font-size: 22rpx; color: #9CA3AF; }

.follow-btn {
	border: 2rpx solid rgba(228,92,26,0.45);
	border-radius: 100rpx; padding: 12rpx 28rpx; flex-shrink: 0;
	.follow-t { font-size: 24rpx; color: #E45C1A; font-weight: 600; }
	&.on { border-color: rgba(0,0,0,0.09); .follow-t { color: rgba(0,0,0,0.35); } }
}

.more-btn { padding: 8rpx; flex-shrink: 0; }

/* ── 正文 ── */
.body-text {
	display: block;
	font-size: 30rpx; color: #374151; line-height: 1.80;
	padding: 4rpx 28rpx 24rpx;
}

/* ── 图片九宫格 ── */
.img-grid {
	display: flex; flex-wrap: wrap; margin-bottom: 24rpx;
	&.gi-1 .gi-img { width: 100%; height: 380rpx; }
	&.gi-2 { gap: 4rpx; padding: 0 28rpx;
		.gi-img { width: calc(50% - 2rpx); height: 260rpx; border-radius: 12rpx; }
	}
	&.gi-3, &.gi-many { gap: 4rpx; padding: 0 28rpx;
		.gi-img { width: calc(33.33% - 3rpx); height: 210rpx; border-radius: 10rpx; }
	}
}

/* ── 消耗数据卡 ── */
.burn-card {
	margin: 0 28rpx 24rpx;
	background: rgba(228,92,26,0.04);
	border: 1rpx solid rgba(228,92,26,0.12);
	border-radius: 24rpx;
	padding: 24rpx;
	position: relative; overflow: hidden;

	&::before {
		content: ''; position: absolute;
		left: 0; top: 0; bottom: 0; width: 6rpx;
		background: linear-gradient(180deg, #FF7A45, #E45C1A);
		border-radius: 24rpx 0 0 24rpx;
	}
}

.burn-hd {
	display: flex; align-items: center; justify-content: space-between; margin-bottom: 20rpx;
	.burn-hd-left { display: flex; align-items: center; gap: 8rpx; }
	.burn-hd-t    { font-size: 24rpx; font-weight: 700; color: #E45C1A; }
	.burn-hd-time { font-size: 20rpx; color: #9CA3AF; }
}

.burn-nums { display: flex; align-items: center; margin-bottom: 16rpx; }

.burn-num-item { flex: 1; display: flex; align-items: baseline; gap: 6rpx; }

.burn-cost { font-size: 52rpx; font-weight: 900; color: #E45C1A; letter-spacing: -1rpx; font-variant-numeric: tabular-nums; }
.burn-tok  { font-size: 40rpx; font-weight: 800; color: #D6943A; letter-spacing: -1rpx; font-variant-numeric: tabular-nums; }
.burn-unit { font-size: 20rpx; color: rgba(0,0,0,0.40); padding-bottom: 4rpx; }

.burn-num-sep { width: 1rpx; height: 56rpx; background: rgba(228,92,26,0.15); margin: 0 24rpx; flex-shrink: 0; }

.burn-meta-row { display: flex; align-items: center; gap: 8rpx; flex-wrap: wrap; }
.burn-meta-item { display: flex; align-items: center; gap: 6rpx; }
.bm-dot { font-size: 14rpx; }
.bm-t   { font-size: 22rpx; color: rgba(0,0,0,0.55); font-weight: 500; }
.bm-sep { font-size: 20rpx; color: rgba(0,0,0,0.20); }

/* ── 感受 Chips ── */
.rxn-section {
	padding: 20rpx 28rpx 24rpx;
}

.rxn-header { margin-bottom: 14rpx; }
.rxn-label  { font-size: 24rpx; color: rgba(0,0,0,0.40); font-weight: 500; }
.rxn-row    { display: flex; gap: 10rpx; flex-wrap: wrap; }

.rxn-chip {
	display: flex; align-items: center; gap: 6rpx;
	padding: 12rpx 20rpx; border-radius: 100rpx;
	background: rgba(0,0,0,0.04); border: 1rpx solid transparent;
	.rxn-em { font-size: 30rpx; line-height: 1; }
	.rxn-t  { font-size: 24rpx; color: rgba(0,0,0,0.45); font-weight: 600; }
	&.on .rxn-t { font-weight: 700; }
}

/* ── 分隔线 ── */
.h-divider { height: 1rpx; background: rgba(0,0,0,0.06); margin: 0 28rpx; }

/* ── 互动统计 ── */
.stat-row { display: flex; align-items: center; padding: 24rpx 0; }

.stat-item {
	flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4rpx;
	padding: 4rpx 0; border-radius: 16rpx;
	&:active { background: rgba(0,0,0,0.04); }
	.stat-n { font-size: 36rpx; font-weight: 800; color: #1A1A2E; transition: color 0.15s; }
	.stat-l { font-size: 22rpx; color: #9CA3AF; }
}

.stat-bar { width: 1rpx; height: 48rpx; background: rgba(0,0,0,0.07); }

/* ── 评论区 ── */
.comments { padding: 24rpx 28rpx; }

.cmt-title {
	display: block; font-size: 28rpx; font-weight: 700; color: #1A1A2E;
	margin-bottom: 24rpx; padding-bottom: 16rpx;
	border-bottom: 1rpx solid rgba(0,0,0,0.05);
}

.cmt-item { display: flex; gap: 16rpx; margin-bottom: 28rpx; }

.cmt-av {
	width: 64rpx; height: 64rpx; border-radius: 50%;
	display: flex; align-items: center; justify-content: center; flex-shrink: 0;
	.cmt-av-t { font-size: 22rpx; color: #fff; font-weight: 700; }
}

.cmt-body { flex: 1; }

.cmt-hd {
	display: flex; align-items: center; gap: 10rpx; flex-wrap: wrap; margin-bottom: 8rpx;
	.cmt-name { font-size: 26rpx; font-weight: 700; color: #1A1A2E; }
	.cmt-time { font-size: 20rpx; color: #9CA3AF; margin-left: auto; }
}

.cmt-model {
	background: rgba(94,115,138,0.10); padding: 3rpx 12rpx; border-radius: 10rpx;
	.cmt-model-t { font-size: 18rpx; color: #5E738A; }
}

.cmt-burn {
	display: inline-flex; align-items: center; gap: 8rpx;
	background: rgba(228,92,26,0.07); border-radius: 10rpx; padding: 6rpx 14rpx; margin-bottom: 10rpx;
	.cmt-burn-cost { font-size: 22rpx; font-weight: 700; color: #C84634; }
	.cmt-burn-sep  { font-size: 18rpx; color: rgba(0,0,0,0.20); }
	.cmt-burn-tok  { font-size: 22rpx; color: #E45C1A; }
}

.cmt-txt {
	display: block; font-size: 26rpx; color: rgba(0,0,0,0.65);
	line-height: 1.65; margin-bottom: 12rpx;
}

.cmt-acts {
	display: flex; align-items: center; gap: 24rpx;
	.cmt-like { display: flex; align-items: center; gap: 6rpx;
		.cmt-like-n { font-size: 22rpx; color: rgba(0,0,0,0.35); }
	}
	.cmt-reply { font-size: 22rpx; color: rgba(0,0,0,0.35); }
}

.load-more {
	text-align: center; padding: 12rpx 0 4rpx;
	.load-more-t { font-size: 24rpx; color: #E45C1A; }
}

.load-state {
	text-align: center; padding: 12rpx 0;
	.load-state-t { font-size: 24rpx; color: #9CA3AF; }
}

.load-end {
	display: flex; align-items: center; gap: 20rpx; padding: 12rpx 0 4rpx;
	.load-end-line { flex: 1; height: 1rpx; background: #E5E7EB; }
	.load-end-t    { font-size: 22rpx; color: #D1D5DB; white-space: nowrap; }
}

/* btm-bar 约 96rpx 内容 + 16rpx top padding + safe area */
.scroll-gap { height: calc(160rpx + env(safe-area-inset-bottom)); }

/* ── 底部固定栏 ── */
.btm-bar {
	position: fixed; left: 0; right: 0; bottom: 0;
	z-index: 100;
	background: #FFFFFF;
	border-top: 1rpx solid rgba(0,0,0,0.07);
	padding: 16rpx 20rpx calc(16rpx + env(safe-area-inset-bottom));
	display: flex; align-items: center; gap: 12rpx;
}

.cmt-input-fake {
	flex: 1; background: rgba(0,0,0,0.06); border-radius: 100rpx;
	padding: 16rpx 20rpx; display: flex; align-items: center; gap: 10rpx;
	.cmt-ph { font-size: 20rpx; color: rgba(0,0,0,0.28); flex: 1; }
}

.btm-acts { display: flex; align-items: center; gap: 4rpx; }

.btm-act {
	display: flex; align-items: center; gap: 6rpx; padding: 10rpx 12rpx;
	.btm-act-n { font-size: 20rpx; color: rgba(0,0,0,0.40); }
}

.meoo {
	background: rgba(0,0,0,0.05); border-radius: 100rpx;
	border: 1rpx solid rgba(0,0,0,0.08); padding: 10rpx 18rpx;
	.meoo-t { font-size: 22rpx; color: rgba(0,0,0,0.50); font-weight: 600; }
	&.on {
		background: rgba(255,122,69,0.08); border-color: rgba(255,122,69,0.25);
		.meoo-t { color: #FF7A45; }
	}
}

/* ── 评论输入浮层 ── */
.cmt-overlay {
	position: fixed;
	top: 0; left: 0; right: 0; bottom: 0;
	background: rgba(0,0,0,0.40);
	display: flex; flex-direction: column; justify-content: flex-end;
	z-index: 200;
}

.cmt-panel {
	background: #FFFFFF;
	border-radius: 28rpx 28rpx 0 0;
	padding: 24rpx 28rpx calc(28rpx + env(safe-area-inset-bottom));
}

.reply-hint {
	display: flex; align-items: center; justify-content: space-between;
	background: rgba(91,91,214,0.06); border-radius: 12rpx;
	padding: 12rpx 16rpx; margin-bottom: 16rpx;
	.reply-hint-t { font-size: 24rpx; color: #5B5BD6; font-weight: 600; }
	.reply-hint-x { font-size: 32rpx; color: rgba(0,0,0,0.30); line-height: 1; padding: 0 4rpx; }
}

.cmt-ta {
	width: 100%; min-height: 120rpx; max-height: 240rpx;
	font-size: 28rpx; color: #1A1A2E; line-height: 1.6;
	background: transparent;
	box-sizing: border-box;
}

/* placeholder 样式（mini-program 通过 placeholder-class 生效） */
.cmt-ta-ph { color: rgba(0,0,0,0.28); font-size: 28rpx; }

.cmt-panel-foot {
	display: flex; align-items: center; justify-content: space-between;
	margin-top: 16rpx; padding-top: 16rpx;
	border-top: 1rpx solid rgba(0,0,0,0.06);
}

.cmt-char { font-size: 22rpx; color: #9CA3AF; }

.cmt-send {
	height: 64rpx; padding: 0 32rpx; border-radius: 100rpx;
	background: rgba(91,91,214,0.15);
	display: flex; align-items: center; justify-content: center;
	.cmt-send-t { font-size: 26rpx; font-weight: 700; color: rgba(91,91,214,0.40); }
	&.on {
		background: #5B5BD6;
		.cmt-send-t { color: #FFFFFF; }
	}
}
</style>
