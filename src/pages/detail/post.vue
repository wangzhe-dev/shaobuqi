<template>
	<view class="page">

		<scroll-view class="main-scroll" scroll-y :show-scrollbar="false">

			<!-- 作者信息行 -->
			<view class="author-section">
				<view class="av" :style="{ background: post.color }">
					<text class="av-t">{{ post.author[0] }}</text>
				</view>
				<view class="author-meta">
					<view class="author-top">
						<text class="author-name">{{ post.author }}</text>
						<view class="model-badge" :style="{ background: post.modelColor + '18', borderColor: post.modelColor + '50' }">
							<view class="model-dot" :style="{ background: post.modelColor }" />
							<text class="model-name" :style="{ color: post.modelColor }">{{ post.model }}</text>
						</view>
					</view>
					<text class="post-time">{{ post.time }}</text>
				</view>
				<view class="follow-btn" :class="{ following: isFollowing }" @tap="toggleFollow">
					<text class="follow-text">{{ isFollowing ? '已关注' : '+ 关注' }}</text>
				</view>
			</view>

			<!-- 核心数据大卡 -->
			<view class="burn-hero">
				<view class="burn-label-row">
					<view class="burn-label">
						<uni-icons type="fire-filled" size="15" color="#E45C1A" />
						<text class="burn-label-text">这次燃烧</text>
					</view>
					<text class="burn-date">{{ post.time }}</text>
				</view>
				<view class="burn-numbers">
					<view class="burn-num-item">
						<text class="burn-num-value cost">{{ post.cost }}</text>
						<text class="burn-num-desc">人民币花费</text>
					</view>
					<view class="burn-num-divider" />
					<view class="burn-num-item">
						<text class="burn-num-value token">{{ post.tokens }}</text>
						<text class="burn-num-desc">tokens 消耗</text>
					</view>
				</view>
				<view class="burn-meta-row">
					<view class="burn-meta-item">
						<uni-icons class="meta-icon" type="staff-filled" size="14" color="rgba(0,0,0,0.70)" />
						<text class="meta-text">{{ post.model }}</text>
					</view>
					<view class="burn-meta-item">
						<uni-icons class="meta-icon" type="reload" size="14" color="rgba(0,0,0,0.70)" />
						<text class="meta-text">{{ post.duration }}</text>
					</view>
					<view class="burn-meta-item">
						<uni-icons class="meta-icon" type="loop" size="14" color="rgba(0,0,0,0.70)" />
						<text class="meta-text">{{ post.rounds }} 轮对话</text>
					</view>
				</view>
			</view>

			<!-- 正文内容 -->
			<view class="content-section">
				<text class="content-text">{{ post.content }}</text>
			</view>

			<!-- 心情评价 -->
			<view class="mood-section">
				<text class="mood-label">这次觉得</text>
				<view class="mood-tags">
					<view
						v-for="m in MOODS"
						:key="m.key"
						class="mood-tag"
						:class="{ 'mood-active': post.mood === m.key }"
						:style="post.mood === m.key ? { background: m.color + '15', borderColor: m.color + '60' } : {}"
						@tap="setMood(m.key)"
					>
						<text class="mood-text" :style="post.mood === m.key ? { color: m.color } : {}">{{ m.label }}</text>
					</view>
				</view>
			</view>

			<!-- 互动数据 -->
			<view class="stat-row">
				<view class="stat-item">
					<text class="stat-n">{{ post.likes }}</text>
					<text class="stat-l">点赞</text>
				</view>
				<view class="stat-divider" />
				<view class="stat-item">
					<text class="stat-n">{{ post.resonates }}</text>
					<text class="stat-l">我也是</text>
				</view>
				<view class="stat-divider" />
				<view class="stat-item">
					<text class="stat-n">{{ post.comments }}</text>
					<text class="stat-l">评论</text>
				</view>
			</view>

			<!-- 评论区 -->
			<view class="comments-section">
				<text class="comments-title">评论 {{ post.comments }}</text>

				<view v-for="comment in comments" :key="comment.id" class="comment-item">
					<view class="cmt-av" :style="{ background: comment.color }">
						<text class="cmt-av-t">{{ comment.user[0] }}</text>
					</view>
					<view class="cmt-body">
						<view class="cmt-head">
							<text class="cmt-user">{{ comment.user }}</text>
							<view v-if="comment.model" class="cmt-model-badge">
								<text class="cmt-model-text">{{ comment.model }}</text>
							</view>
							<text class="cmt-time">{{ comment.time }}</text>
						</view>
						<!-- 如果评论者也有同类消费，展示出来 -->
						<view v-if="comment.cost" class="cmt-burn-info">
							<text class="cmt-burn-cost">{{ comment.cost }}</text>
							<text class="cmt-burn-sep">·</text>
							<text class="cmt-burn-tokens">{{ comment.tokens }}</text>
						</view>
						<text class="cmt-text">{{ comment.content }}</text>
						<view class="cmt-actions">
							<view class="cmt-like" @tap="likeComment(comment)">
								<uni-icons
									class="cmt-like-ico"
									:type="comment.liked ? 'heart-filled' : 'heart'"
									size="14"
									:color="comment.liked ? '#C84634' : 'rgba(0,0,0,0.25)'"
								/>
								<text class="cmt-like-n">{{ comment.likes }}</text>
							</view>
							<text class="cmt-reply-btn" @tap="replyComment(comment)">回复</text>
						</view>
					</view>
				</view>

				<view class="load-more" @tap="loadMore">
					<text class="load-more-text">查看全部 {{ post.comments }} 条评论 ›</text>
				</view>
			</view>

			<view class="scroll-bottom" />
		</scroll-view>

		<!-- 底部固定栏 -->
		<view class="fixed-bottom iphonex-p">
			<view class="comment-input" @tap="focusComment">
				<text class="input-ph">说点什么，或者晒出你的用量...</text>
			</view>
			<view class="bottom-acts">
				<view class="bact" @tap="toggleLike">
					<uni-icons
						class="bact-ico"
						:type="isLiked ? 'heart-filled' : 'heart'"
						size="18"
						:color="isLiked ? '#C84634' : 'rgba(0,0,0,0.40)'"
					/>
					<text class="bact-n">{{ post.likes }}</text>
				</view>
				<view class="bact resonate-bact" :class="{ resonated: isResonated }" @tap="toggleResonate">
					<uni-icons class="bact-ico" type="chatbubble-filled" size="18" :color="isResonated ? '#C84634' : 'rgba(0,0,0,0.40)'" />
					<text class="bact-resonate-text">我也是</text>
				</view>
				<view class="bact" @tap="share">
					<uni-icons class="bact-ico" type="paperplane" size="18" color="rgba(0,0,0,0.40)" />
				</view>
			</view>
		</view>

	</view>
</template>

<script setup lang="ts">
	const isLiked = ref(false)
	const isResonated = ref(false)
	const isFollowing = ref(false)

	const MOODS = [
		{ key: 'worth', label: '值了 ✓', color: '#2F8A57' },
		{ key: 'ok', label: '还行', color: '#666666' },
		{ key: 'regret', label: '后悔了', color: '#B53A2E' },
		{ key: 'hooked', label: '上瘾了', color: '#8C6741' }
	]

	const post = reactive({
		id: 'p1',
		author: '林晓珊',
		color: '#D6943A',
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
		mood: 'worth',
		likes: 284,
		comments: 47,
		resonates: 163
	})

	const comments = ref([
		{
			id: 'c1', user: '王建明', color: '#9A6530', time: '1小时前',
			model: 'GPT-4o',
			cost: '¥89.20', tokens: '1,560,000',
			content: '我也是！帮客户改方案，来回改了9版，最后客户说"就用第一版吧"。我直接关电脑了。',
			likes: 67, liked: false
		},
		{
			id: 'c2', user: '张晴', color: '#7B5B3C', time: '2小时前',
			model: null, cost: null, tokens: null,
			content: '所以现在我的策略是第一版故意做差，让甲方改，然后第三版放出精品。成功率提升了80%。',
			likes: 124, liked: true
		},
		{
			id: 'c3', user: '陈佳慧', color: '#2F8A57', time: '3小时前',
			model: 'Claude Sonnet',
			cost: '¥34.80', tokens: '640,000',
			content: '¥128 的课程费，比很多付费课便宜，而且是实战学的。算值了。',
			likes: 89, liked: false
		},
		{
			id: 'c4', user: '刘明远', color: '#9A2F28', time: '昨天',
			model: null, cost: null, tokens: null,
			content: '甲方确实只有甲方自己知道自己想要什么，而且他们自己也不知道。AI 来了也没用。',
			likes: 201, liked: false
		}
	])

	const setMood = (mood: string) => {
		post.mood = post.mood === mood ? '' : mood
	}

	const toggleLike = () => {
		isLiked.value = !isLiked.value
		post.likes += isLiked.value ? 1 : -1
	}

	const toggleResonate = () => {
		isResonated.value = !isResonated.value
		post.resonates += isResonated.value ? 1 : -1
	}

	const toggleFollow = () => {
		isFollowing.value = !isFollowing.value
	}

	const likeComment = (c: any) => {
		c.liked = !c.liked
		c.likes += c.liked ? 1 : -1
	}

	const replyComment = (_c: any) => {
		uni.showToast({ title: '回复功能开发中', icon: 'none' })
	}

	const loadMore = () => {
		uni.showToast({ title: '加载更多评论...', icon: 'none' })
	}

	const focusComment = () => {
		uni.showToast({ title: '评论功能开发中', icon: 'none' })
	}

	const share = () => {
		uni.showToast({ title: '分享功能开发中', icon: 'none' })
	}
</script>

<style lang="scss" scoped>
	.page {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: #FFFFFF;
	}

	.main-scroll {
		flex: 1;
		overflow: hidden;

		.scroll-bottom { height: 160rpx; }
	}

	/* 作者区 */
	.author-section {
		display: flex;
		align-items: center;
		gap: 16rpx;
		padding: 24rpx 28rpx;
		background: var(--card-bg);
		border-radius: 28rpx;
		margin: 16rpx 24rpx;
		box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.03);

		.av {
			width: 80rpx;
			height: 80rpx;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;

			.av-t { font-size: 30rpx; color: #fff; font-weight: 700; }
		}

		.author-meta {
			flex: 1;
			display: flex;
			flex-direction: column;
			gap: 8rpx;

			.author-top {
				display: flex;
				align-items: center;
				gap: 10rpx;
				flex-wrap: wrap;

				.author-name { font-size: 30rpx; font-weight: 700; color: #1A1A1A; }

				.model-badge {
					display: inline-flex;
					align-items: center;
					gap: 6rpx;
					padding: 4rpx 14rpx;
					border-radius: 20rpx;
					border: 1rpx solid;

					.model-dot { width: 10rpx; height: 10rpx; border-radius: 50%; flex-shrink: 0; }
					.model-name { font-size: 20rpx; font-weight: 600; }
				}
			}

			.post-time { font-size: 22rpx; color: rgba(0,0,0,0.40); }
		}

		.follow-btn {
			border: 2rpx solid rgba(228, 92, 26,0.5);
			border-radius: 40rpx;
			padding: 12rpx 28rpx;
			flex-shrink: 0;

			.follow-text { font-size: 24rpx; color: #E45C1A; font-weight: 600; }

			&.following {
				border-color: rgba(0,0,0,0.09);
				.follow-text { color: rgba(0,0,0,0.40); }
			}
		}
	}

	/* 核心数据 Hero */
	.burn-hero {
		margin: 0 24rpx 16rpx;
		background: var(--brand-gradient);
		border-radius: 28rpx;
		padding: 28rpx 28rpx 24rpx;
		position: relative;
		overflow: hidden;

		&::before {
			content: '';
			position: absolute;
			top: -40rpx;
			right: -40rpx;
			width: 250rpx;
			height: 250rpx;
			background: rgba(0,0,0,0.08);
			border-radius: 50%;
			filter: blur(40rpx);
			pointer-events: none;
		}

		.burn-label-row {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 24rpx;

			.burn-label {
				display: flex;
				align-items: center;
				gap: 6rpx;

				.burn-label-text {
					font-size: 26rpx;
					font-weight: 700;
					color: rgba(255,255,255,0.9);
				}
			}
			.burn-date { font-size: 22rpx; color: rgba(0,0,0,0.50); }
		}

		.burn-numbers {
			display: flex;
			align-items: center;
			margin-bottom: 24rpx;

			.burn-num-item {
				flex: 1;
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 8rpx;

				.burn-num-value {
					font-size: 56rpx;
					font-weight: 800;
					letter-spacing: -2rpx;

					&.cost { color: #D1A89A; }
					&.token { color: #C7A06A; }
				}

				.burn-num-desc { font-size: 22rpx; color: rgba(0,0,0,0.50); }
			}

			.burn-num-divider {
				width: 1rpx;
				height: 80rpx;
				background: rgba(0,0,0,0.10);
			}
		}

		.burn-meta-row {
			display: flex;
			gap: 0;

			.burn-meta-item {
				flex: 1;
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 6rpx;
				background: rgba(0,0,0,0.07);
				border-radius: 12rpx;
				padding: 10rpx 0;
				margin: 0 4rpx;

				.meta-icon {
					width: 20rpx;
					height: 20rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					flex-shrink: 0;
				}
				.meta-text { font-size: 20rpx; color: rgba(0,0,0,0.70); white-space: nowrap; }
			}
		}
	}

	/* 正文 */
	.content-section {
		background: var(--card-bg);
		border-radius: 28rpx;
		padding: 32rpx 28rpx;
		margin: 0 24rpx 16rpx;
		box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.03);

		.content-text {
			font-size: 30rpx;
			color: var(--text-color);
			line-height: 1.8;
		}
	}

	/* 心情评价 */
	.mood-section {
		background: var(--card-bg);
		border-radius: 28rpx;
		padding: 24rpx 28rpx;
		margin: 0 24rpx 16rpx;
		display: flex;
		align-items: center;
		gap: 20rpx;
		box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.03);

		.mood-label { font-size: 26rpx; color: rgba(0,0,0,0.40); flex-shrink: 0; }

		.mood-tags {
			display: flex;
			gap: 10rpx;
			flex-wrap: wrap;

			.mood-tag {
				padding: 10rpx 20rpx;
				border-radius: 30rpx;
				border: 1rpx solid rgba(0,0,0,0.08);
				background: rgba(0,0,0,0.04);

				.mood-text { font-size: 22rpx; color: rgba(0,0,0,0.40); white-space: nowrap; }

				&.mood-active .mood-text { font-weight: 600; }
			}
		}
	}

	/* 互动数据 */
	.stat-row {
		display: flex;
		align-items: center;
		background: var(--card-bg);
		border-radius: 28rpx;
		padding: 24rpx 0;
		margin: 0 24rpx 16rpx;
		box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.03);

		.stat-item {
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 4rpx;

			.stat-n { font-size: 34rpx; font-weight: 700; color: #1A1A1A; }
			.stat-l { font-size: 22rpx; color: rgba(0,0,0,0.40); }
		}

		.stat-divider { width: 1rpx; height: 48rpx; background: rgba(0,0,0,0.06); }
	}

	/* 评论区 */
	.comments-section {
		background: var(--card-bg);
		border-radius: 28rpx;
		padding: 32rpx 28rpx;
		margin: 0 24rpx;
		box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.03);

		.comments-title {
			display: block;
			font-size: 28rpx;
			font-weight: 700;
			color: #1A1A1A;
			margin-bottom: 24rpx;
			padding-bottom: 16rpx;
			border-bottom: 1rpx solid rgba(0,0,0,0.05);
		}

		.comment-item {
			display: flex;
			gap: 16rpx;
			margin-bottom: 28rpx;

			.cmt-av {
				width: 64rpx;
				height: 64rpx;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				flex-shrink: 0;

				.cmt-av-t { font-size: 24rpx; color: #fff; font-weight: 700; }
			}

			.cmt-body {
				flex: 1;

				.cmt-head {
					display: flex;
					align-items: center;
					gap: 10rpx;
					flex-wrap: wrap;
					margin-bottom: 8rpx;

					.cmt-user { font-size: 26rpx; font-weight: 700; color: #1A1A1A; }

					.cmt-model-badge {
						background: rgba(94, 115, 138,0.1);
						padding: 3rpx 12rpx;
						border-radius: 12rpx;

						.cmt-model-text { font-size: 20rpx; color: #5E738A; }
					}

					.cmt-time { font-size: 22rpx; color: rgba(0,0,0,0.40); margin-left: auto; }
				}

				/* 评论者晒自己的消费 */
				.cmt-burn-info {
					display: flex;
					align-items: center;
					gap: 8rpx;
					background: rgba(228, 92, 26,0.08);
					border-radius: 10rpx;
					padding: 8rpx 14rpx;
					margin-bottom: 10rpx;

					.cmt-burn-cost { font-size: 22rpx; font-weight: 700; color: #C84634; }
					.cmt-burn-sep { font-size: 20rpx; color: rgba(0,0,0,0.20); }
					.cmt-burn-tokens { font-size: 22rpx; color: #E45C1A; }
				}

				.cmt-text { font-size: 26rpx; color: rgba(0,0,0,0.60); line-height: 1.65; margin-bottom: 12rpx; }

				.cmt-actions {
					display: flex;
					align-items: center;
					gap: 24rpx;

					.cmt-like {
						display: flex;
						align-items: center;
						gap: 6rpx;

						.cmt-like-ico {
							width: 24rpx;
							height: 24rpx;
							display: flex;
							align-items: center;
							justify-content: center;
							flex-shrink: 0;
						}
						.cmt-like-n { font-size: 22rpx; color: rgba(0,0,0,0.40); }
					}

					.cmt-reply-btn { font-size: 22rpx; color: rgba(0,0,0,0.40); }
				}
			}
		}

		.load-more {
			text-align: center;
			padding: 16rpx 0 8rpx;

			.load-more-text { font-size: 24rpx; color: #E45C1A; }
		}
	}

	/* 底部固定栏 */
	.fixed-bottom {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: rgba(255,255,255,0.96);
		border-top: 1rpx solid rgba(0,0,0,0.05);
		backdrop-filter: blur(12px);
		padding: 16rpx 20rpx 0;
		display: flex;
		align-items: center;
		gap: 12rpx;

		.comment-input {
			flex: 1;
			background: rgba(0,0,0,0.06);
			border-radius: 40rpx;
			padding: 16rpx 24rpx;

			.input-ph { font-size: 24rpx; color: rgba(0,0,0,0.35); }
		}

		.bottom-acts {
			display: flex;
			align-items: center;
			gap: 4rpx;

			.bact {
				display: flex;
				align-items: center;
				gap: 6rpx;
				padding: 10rpx 12rpx;

				.bact-ico {
					width: 32rpx;
					height: 32rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					flex-shrink: 0;
				}
				.bact-n { font-size: 20rpx; color: rgba(0,0,0,0.40); }
			}

			.resonate-bact {
				background: rgba(0,0,0,0.05);
				border-radius: 30rpx;
				border: 1rpx solid rgba(0,0,0,0.08);
				padding: 10rpx 16rpx;

				.bact-resonate-text { font-size: 22rpx; color: rgba(0,0,0,0.50); }

				&.resonated {
					background: rgba(200, 70, 52, 0.06);
					border-color: rgba(200, 70, 52, 0.3);

					.bact-resonate-text { color: #C84634; }
				}
			}
		}
	}
</style>
