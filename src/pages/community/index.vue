<template>
	<view class="page">

		<!-- 搜索栏 -->
		<view class="search-row" @tap="toSearch">
			<view class="search-box">
				<text class="search-icon">🔍</text>
				<text class="search-ph">搜索用量、模型、吐槽...</text>
			</view>
		</view>

		<!-- 模型 / 心情 标签横划 -->
		<scroll-view scroll-x class="tags-scroll" :show-scrollbar="false">
			<view class="tags-inner">
				<view
					v-for="tag in TAGS"
					:key="tag.key"
					class="tag-pill"
					:class="{ active: activeTag === tag.key }"
					@tap="activeTag = tag.key"
				>
					<text v-if="tag.dot" class="tag-dot" :style="{ background: tag.dot }" />
					<text class="tag-text">{{ tag.label }}</text>
				</view>
			</view>
		</scroll-view>

		<!-- 排序行 -->
		<view class="sort-row">
			<view
				v-for="s in SORT_MODES"
				:key="s"
				class="sort-item"
				:class="{ active: sortMode === s }"
				@tap="sortMode = s"
			>
				<text class="sort-text">{{ s }}</text>
			</view>
			<view class="sort-right">
				<text class="total-tip">今日共燃烧 <text class="total-num">¥48,203</text></text>
			</view>
		</view>

		<!-- 消费记录卡片流 -->
		<scroll-view class="list-scroll" scroll-y :show-scrollbar="false">
			<view class="list-inner">

				<view
					v-for="post in posts"
					:key="post.id"
					class="burn-card"
					@tap="toPost(post.id)"
				>
					<!-- 卡片头部：作者 + 模型 badge -->
					<view class="card-head">
						<view class="av" :style="{ background: post.color }">
							<text class="av-t">{{ post.author[0] }}</text>
						</view>
						<view class="head-meta">
							<view class="head-top">
								<text class="author-name">{{ post.author }}</text>
								<view class="model-badge" :style="{ background: post.modelColor + '18', borderColor: post.modelColor + '40' }">
									<view class="model-dot" :style="{ background: post.modelColor }" />
									<text class="model-name" :style="{ color: post.modelColor }">{{ post.model }}</text>
								</view>
							</view>
							<text class="post-time">{{ post.time }}</text>
						</view>
						<text class="more-btn">···</text>
					</view>

					<!-- 核心数据：大数字展示 -->
					<view class="burn-data-block">
						<view class="data-left">
							<text class="data-label">💰 花费</text>
							<text class="data-num cost-num">{{ post.cost }}</text>
						</view>
						<view class="data-divider" />
						<view class="data-right">
							<text class="data-label">📊 Token</text>
							<text class="data-num token-num">{{ post.tokens }}</text>
						</view>
					</view>

					<!-- 用途描述 -->
					<text class="burn-content line-3">{{ post.content }}</text>

					<!-- 心情标签 -->
					<view class="mood-row">
						<view
							class="mood-tag"
							:class="{ 'mood-active': post.mood === m.key }"
							:style="post.mood === m.key ? { background: m.color + '15', borderColor: m.color + '60', color: m.color } : {}"
							v-for="m in MOODS"
							:key="m.key"
							@tap.stop="setMood(post, m.key)"
						>
							<text class="mood-text">{{ m.label }}</text>
						</view>
					</view>

					<!-- 底部互动 -->
					<view class="card-foot">
						<view class="act" @tap.stop="like(post)">
							<text :class="['act-ico', { liked: post.liked }]">♥</text>
							<text class="act-n">{{ post.likes }}</text>
						</view>
						<view class="act">
							<text class="act-ico">💬</text>
							<text class="act-n">{{ post.comments }}</text>
						</view>
						<view class="act resonate-act" :class="{ resonated: post.resonated }" @tap.stop="resonate(post)">
							<text class="act-ico resonate-ico">😭</text>
							<text class="act-resonate-text">{{ post.resonated ? '我也是' : '我也是' }}</text>
							<text class="act-n">{{ post.resonates }}</text>
						</view>
						<view class="act share-act" @tap.stop>
							<text class="act-ico">↗</text>
						</view>
					</view>
				</view>

			</view>
			<view class="list-bottom" />
		</scroll-view>

	</view>
</template>

<script setup lang="ts">
	const TAGS = [
		{ key: 'all', label: '全部', dot: '' },
		{ key: 'claude', label: 'Claude', dot: '#7C3AED' },
		{ key: 'gpt4o', label: 'GPT-4o', dot: '#10B981' },
		{ key: 'gemini', label: 'Gemini', dot: '#2563EB' },
		{ key: 'deepseek', label: 'DeepSeek', dot: '#F59E0B' },
		{ key: 'worth', label: '值了 ✓', dot: '' },
		{ key: 'regret', label: '后悔了 😭', dot: '' },
		{ key: 'broke', label: '月底穷了 💸', dot: '' },
		{ key: 'hooked', label: '上瘾了 🔥', dot: '' }
	]

	const SORT_MODES = ['最新', '烧得最多', '最值']

	const MOODS = [
		{ key: 'worth', label: '值了 ✓', color: '#10B981' },
		{ key: 'ok', label: '还行 😐', color: '#6B7280' },
		{ key: 'regret', label: '后悔了 😭', color: '#EF4444' },
		{ key: 'hooked', label: '上瘾了 🔥', color: '#F59E0B' }
	]

	const activeTag = ref('all')
	const sortMode = ref('最新')

	const posts = ref([
		{
			id: 'p1', author: '林晓珊', color: '#7C3AED', time: '今天 14:32',
			model: 'Claude Opus', modelColor: '#7C3AED',
			cost: '¥128.50', tokens: '2,340,000',
			content: '帮甲方改了7版 PPT，最后还是用了最开始那版。钱花了，但经验攒了，学到了什么叫"甲方的想法只有甲方知道"。',
			mood: 'worth',
			likes: 284, comments: 47, resonates: 163, liked: false, resonated: false
		},
		{
			id: 'p2', author: '王建明', color: '#0891B2', time: '今天 11:08',
			model: 'GPT-4o', modelColor: '#10B981',
			cost: '¥56.20', tokens: '890,000',
			content: '写了一篇技术文档，反复让它改格式改措辞，改了12轮。最后发现直接把要求写清楚第一轮就出来了。这课交得值。',
			mood: 'ok',
			likes: 156, comments: 23, resonates: 89, liked: true, resonated: false
		},
		{
			id: 'p3', author: '张晴', color: '#D97706', time: '今天 09:45',
			model: 'Claude Sonnet', modelColor: '#7C3AED',
			cost: '¥312.00', tokens: '5,680,000',
			content: '月初说好只花100块，结果今天是月底，账单来了。我没有任何话说，只能继续充值。',
			mood: 'hooked',
			likes: 891, comments: 234, resonates: 567, liked: false, resonated: true
		},
		{
			id: 'p4', author: '陈佳慧', color: '#059669', time: '昨天 23:17',
			model: 'GPT-4o', modelColor: '#10B981',
			cost: '¥18.40', tokens: '320,000',
			content: '用 AI 帮我把3000字的周报压缩到500字，领导说"写得不错，下次多写点细节"。我人傻了。',
			mood: 'regret',
			likes: 1203, comments: 312, resonates: 892, liked: false, resonated: false
		},
		{
			id: 'p5', author: '刘明远', color: '#DC2626', time: '昨天 20:33',
			model: 'DeepSeek', modelColor: '#F59E0B',
			cost: '¥2.30', tokens: '1,230,000',
			content: '换 DeepSeek 用了一周，效果差不多，但便宜了80%。感觉自己发现了新大陆，赶紧分享给大家。这才叫少不起！',
			mood: 'worth',
			likes: 2341, comments: 445, resonates: 1203, liked: false, resonated: false
		},
		{
			id: 'p6', author: '苏晓月', color: '#2563EB', time: '前天',
			model: 'Gemini 1.5 Pro', modelColor: '#2563EB',
			cost: '¥0.00', tokens: '480,000',
			content: 'Google 免费额度快用完了，但还没用完这个月的量。感觉白嫖到了就是赚到。疯狂用中。',
			mood: 'worth',
			likes: 445, comments: 78, resonates: 234, liked: false, resonated: false
		},
		{
			id: 'p7', author: '高远', color: '#7C3AED', time: '3天前',
			model: 'Claude Opus', modelColor: '#7C3AED',
			cost: '¥890.00', tokens: '16,200,000',
			content: '这个月 API 费用出来了。老板问这是什么钱，我说是"云计算费用"。他信了。我不敢再看账单了。',
			mood: 'regret',
			likes: 3201, comments: 678, resonates: 2103, liked: true, resonated: false
		}
	])

	const like = (item: any) => {
		item.liked = !item.liked
		item.likes += item.liked ? 1 : -1
	}

	const resonate = (item: any) => {
		item.resonated = !item.resonated
		item.resonates += item.resonated ? 1 : -1
	}

	const setMood = (item: any, mood: string) => {
		item.mood = item.mood === mood ? '' : mood
	}

	const toPost = (id: string) => {
		uni.navigateTo({ url: `/pages/detail/post?id=${id}` })
	}

	const toSearch = () => {
		uni.navigateTo({ url: '/pages/search/index' })
	}
</script>

<style lang="scss" scoped>
	.page {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: #F7F8FA;
	}

	/* 搜索栏 */
	.search-row {
		padding: 16rpx 24rpx 12rpx;
		background: #fff;
		flex-shrink: 0;

		.search-box {
			background: #F3F4F6;
			border-radius: 20rpx;
			padding: 16rpx 24rpx;
			display: flex;
			align-items: center;
			gap: 12rpx;

			.search-icon { font-size: 28rpx; }
			.search-ph { font-size: 26rpx; color: #9CA3AF; }
		}
	}

	/* 标签横划 */
	.tags-scroll {
		background: #fff;
		flex-shrink: 0;

		.tags-inner {
			display: flex;
			flex-wrap: nowrap;
			width: max-content;
			padding: 10rpx 20rpx 14rpx;
			gap: 10rpx;
		}

		.tag-pill {
			display: inline-flex;
			align-items: center;
			gap: 8rpx;
			padding: 10rpx 22rpx;
			border-radius: 40rpx;
			background: #F3F4F6;
			flex-shrink: 0;
			white-space: nowrap;

			.tag-dot {
				width: 12rpx;
				height: 12rpx;
				border-radius: 50%;
				flex-shrink: 0;
			}

			.tag-text {
				font-size: 24rpx;
				color: #6B7280;
				white-space: nowrap;
			}

			&.active {
				background: #5B5BD6;
				.tag-text { color: #fff; font-weight: 600; }
				.tag-dot { border: 2rpx solid rgba(255,255,255,0.6); }
			}
		}
	}

	/* 排序行 */
	.sort-row {
		display: flex;
		align-items: center;
		gap: 4rpx;
		padding: 14rpx 24rpx;
		background: #fff;
		border-bottom: 1rpx solid #F3F4F6;
		flex-shrink: 0;

		.sort-item {
			padding: 8rpx 16rpx;
			border-radius: 12rpx;

			.sort-text {
				font-size: 24rpx;
				color: #9CA3AF;
			}

			&.active {
				background: rgba(91, 91, 214, 0.08);
				.sort-text { color: #5B5BD6; font-weight: 600; }
			}
		}

		.sort-right {
			margin-left: auto;

			.total-tip {
				font-size: 22rpx;
				color: #9CA3AF;

				.total-num {
					color: #EF4444;
					font-weight: 700;
				}
			}
		}
	}

	/* 列表 */
	.list-scroll {
		flex: 1;
		overflow: hidden;

		.list-inner {
			padding: 16rpx 20rpx 0;
			display: flex;
			flex-direction: column;
			gap: 16rpx;
		}

		.list-bottom { height: 40rpx; }
	}

	/* 消费记录卡片 */
	.burn-card {
		background: #fff;
		border-radius: 20rpx;
		padding: 24rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);

		/* 卡片头部 */
		.card-head {
			display: flex;
			align-items: center;
			gap: 14rpx;
			margin-bottom: 20rpx;

			.av {
				width: 72rpx;
				height: 72rpx;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				flex-shrink: 0;

				.av-t { font-size: 28rpx; color: #fff; font-weight: 700; }
			}

			.head-meta {
				flex: 1;
				display: flex;
				flex-direction: column;
				gap: 6rpx;

				.head-top {
					display: flex;
					align-items: center;
					gap: 10rpx;
					flex-wrap: wrap;

					.author-name {
						font-size: 28rpx;
						font-weight: 700;
						color: #1A1A2E;
					}

					.model-badge {
						display: inline-flex;
						align-items: center;
						gap: 6rpx;
						padding: 4rpx 12rpx;
						border-radius: 20rpx;
						border: 1rpx solid;

						.model-dot {
							width: 10rpx;
							height: 10rpx;
							border-radius: 50%;
							flex-shrink: 0;
						}

						.model-name {
							font-size: 20rpx;
							font-weight: 600;
							white-space: nowrap;
						}
					}
				}

				.post-time {
					font-size: 22rpx;
					color: #9CA3AF;
				}
			}

			.more-btn {
				font-size: 32rpx;
				color: #C4C9D4;
				letter-spacing: 2rpx;
			}
		}

		/* 核心数据展示区 */
		.burn-data-block {
			display: flex;
			align-items: center;
			background: linear-gradient(135deg, #FFF7F0 0%, #FFF1F0 100%);
			border: 1rpx solid #FFE4D6;
			border-radius: 16rpx;
			padding: 20rpx 0;
			margin-bottom: 20rpx;

			.data-left,
			.data-right {
				flex: 1;
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 6rpx;

				.data-label {
					font-size: 22rpx;
					color: #9CA3AF;
				}

				.data-num {
					font-size: 40rpx;
					font-weight: 800;
					letter-spacing: -1rpx;
				}

				.cost-num { color: #EF4444; }
				.token-num { color: #F59E0B; }
			}

			.data-divider {
				width: 1rpx;
				height: 64rpx;
				background: #FFD6C8;
			}
		}

		/* 用途描述 */
		.burn-content {
			font-size: 28rpx;
			color: #374151;
			line-height: 1.7;
			margin-bottom: 18rpx;
		}

		/* 心情标签 */
		.mood-row {
			display: flex;
			flex-wrap: wrap;
			gap: 10rpx;
			margin-bottom: 18rpx;

			.mood-tag {
				display: inline-flex;
				align-items: center;
				padding: 8rpx 20rpx;
				border-radius: 30rpx;
				border: 1rpx solid #E5E7EB;
				background: #F9FAFB;

				.mood-text {
					font-size: 22rpx;
					color: #9CA3AF;
					white-space: nowrap;
				}

				&.mood-active .mood-text {
					font-weight: 600;
				}
			}
		}

		/* 底部互动栏 */
		.card-foot {
			display: flex;
			align-items: center;
			gap: 8rpx;
			padding-top: 16rpx;
			border-top: 1rpx solid #F3F4F6;

			.act {
				display: flex;
				align-items: center;
				gap: 6rpx;
				padding: 6rpx 10rpx;

				.act-ico {
					font-size: 28rpx;
					color: #C4C9D4;

					&.liked { color: #EF4444; }
				}

				.act-n { font-size: 22rpx; color: #9CA3AF; }
			}

			.resonate-act {
				background: #F9FAFB;
				border-radius: 20rpx;
				padding: 8rpx 16rpx;
				border: 1rpx solid #E5E7EB;

				.resonate-ico { font-size: 24rpx; }

				.act-resonate-text {
					font-size: 22rpx;
					color: #6B7280;
					margin: 0 4rpx;
				}

				&.resonated {
					background: rgba(239, 68, 68, 0.06);
					border-color: rgba(239, 68, 68, 0.3);

					.act-resonate-text { color: #EF4444; }
					.act-n { color: #EF4444; }
				}
			}

			.share-act {
				margin-left: auto;
				.act-ico { font-size: 28rpx; color: #C4C9D4; }
			}
		}
	}
</style>
