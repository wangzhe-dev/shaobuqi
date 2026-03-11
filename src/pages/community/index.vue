<template>
	<view class="page">

		<!-- 顶部：时间筛选 + 总量 -->
		<view class="top-bar">
			<view class="period-tabs">
				<uni-segmented-control
					:current="periodIndex"
					:values="PERIODS"
					style-type="button"
					active-color="#5B5BD6"
					in-active-color="#EEF2FF"
					@clickItem="onPeriodChange"
				/>
			</view>
			<view class="top-total">
				<text class="total-label">{{ period }}共燃</text>
				<text class="total-val">¥{{ currentTotal }}</text>
			</view>
		</view>

		<!-- 模型筛选 -->
		<scroll-view scroll-x class="model-filter-scroll" :show-scrollbar="false">
			<view class="model-filter-row">
				<view
					v-for="m in MODEL_FILTERS"
					:key="m.key"
					class="mf-pill"
					:class="{ active: modelFilter === m.key }"
					@tap="modelFilter = m.key"
				>
					<view v-if="m.dot" class="mf-dot" :style="{ background: m.dot }" />
					<text class="mf-text">{{ m.label }}</text>
				</view>
			</view>
		</scroll-view>

		<scroll-view class="list-scroll" scroll-y :show-scrollbar="false">

			<!-- 🏆 TOP 3 奖台 -->
			<view class="podium-section">
				<text class="podium-title">🏆 今日烧榜 TOP 3</text>
				<view class="podium">
					<!-- 亚军 #2 -->
					<view class="podium-item podium-2" @tap="toPost(podiumData[1].id)">
						<view class="podium-av" :style="{ background: podiumData[1].color }">
							<text class="podium-av-t">{{ podiumData[1].author[0] }}</text>
						</view>
						<text class="podium-name">{{ podiumData[1].author }}</text>
						<text class="podium-cost p2-cost">{{ podiumData[1].cost }}</text>
						<view class="podium-block p2-block">
							<text class="podium-medal">🥈</text>
							<text class="podium-rank-label"># 2</text>
						</view>
					</view>

					<!-- 冠军 #1 -->
					<view class="podium-item podium-1" @tap="toPost(podiumData[0].id)">
						<view class="crown">👑</view>
						<view class="podium-av podium-av-lg" :style="{ background: podiumData[0].color }">
							<text class="podium-av-t">{{ podiumData[0].author[0] }}</text>
						</view>
						<text class="podium-name">{{ podiumData[0].author }}</text>
						<text class="podium-cost p1-cost">{{ podiumData[0].cost }}</text>
						<view class="podium-block p1-block">
							<text class="podium-medal">🥇</text>
							<text class="podium-rank-label"># 1</text>
						</view>
					</view>

					<!-- 季军 #3 -->
					<view class="podium-item podium-3" @tap="toPost(podiumData[2].id)">
						<view class="podium-av" :style="{ background: podiumData[2].color }">
							<text class="podium-av-t">{{ podiumData[2].author[0] }}</text>
						</view>
						<text class="podium-name">{{ podiumData[2].author }}</text>
						<text class="podium-cost p3-cost">{{ podiumData[2].cost }}</text>
						<view class="podium-block p3-block">
							<text class="podium-medal">🥉</text>
							<text class="podium-rank-label"># 3</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 排行榜列表 #4 以下 -->
			<view class="rank-list">
				<view
					v-for="(item, index) in rankList"
					:key="item.id"
					class="rank-row"
					@tap="toPost(item.id)"
				>
					<!-- 排名 -->
					<text class="rr-rank">#{{ index + 4 }}</text>

					<!-- 头像 -->
					<view class="rr-av" :style="{ background: item.color }">
						<text class="rr-av-t">{{ item.author[0] }}</text>
					</view>

					<!-- 信息 -->
					<view class="rr-info">
						<view class="rr-top">
							<text class="rr-author">{{ item.author }}</text>
							<view class="rr-model-badge" :style="{ background: item.modelBg }">
								<view class="rr-dot" :style="{ background: item.modelDot }" />
								<text class="rr-model">{{ item.model }}</text>
							</view>
						</view>
						<text class="rr-content line-1">{{ item.content }}</text>
					</view>

					<!-- 花费 + 心情 -->
					<view class="rr-right">
						<text class="rr-cost">{{ item.cost }}</text>
						<text class="rr-mood">{{ item.mood }}</text>
					</view>
				</view>
			</view>

			<!-- 分割线 -->
			<view class="list-divider">
				<text class="divider-text">· 以上为今日 TOP 10 ·</text>
			</view>

			<!-- 全部记录流 -->
			<view class="section-label">
				<text class="sl-text">全部记录</text>
				<view class="sl-sort">
					<uni-segmented-control
						:current="sortModeIndex"
						:values="SORT_MODES"
						style-type="button"
						active-color="#5B5BD6"
						in-active-color="#F3F4F6"
						@clickItem="onSortModeChange"
					/>
				</view>
			</view>

			<view class="full-feed">
				<view
					v-for="post in posts"
					:key="post.id"
					class="burn-card"
					@tap="toPost(post.id)"
				>
					<view class="bc-head">
						<view class="bc-av" :style="{ background: post.color }">
							<text class="bc-av-t">{{ post.author[0] }}</text>
						</view>
						<view class="bc-meta">
							<view class="bc-top">
								<text class="bc-author">{{ post.author }}</text>
								<view class="bc-model-badge" :style="{ background: post.modelBg, borderColor: post.modelBg }">
									<view class="bc-dot" :style="{ background: post.modelDot }" />
									<text class="bc-model">{{ post.model }}</text>
								</view>
							</view>
							<text class="bc-time">{{ post.time }}</text>
						</view>
						<text class="bc-more">···</text>
					</view>

					<view class="bc-data">
						<view class="bc-data-left">
							<text class="bc-data-label">💰 花费</text>
							<text class="bc-cost">{{ post.cost }}</text>
						</view>
						<view class="bc-data-div" />
						<view class="bc-data-right">
							<text class="bc-data-label">📊 Token</text>
							<text class="bc-tokens">{{ post.tokens }}</text>
						</view>
					</view>

					<text class="bc-content line-3">{{ post.content }}</text>

					<view class="bc-mood-row">
						<view
							v-for="m in MOODS"
							:key="m.key"
							class="bc-mood-tag"
							:class="{ active: post.mood === m.key }"
							:style="post.mood === m.key ? { background: m.color + '15', borderColor: m.color + '50', color: m.color } : {}"
							@tap.stop="setMood(post, m.key)"
						>
							<text class="bc-mood-text">{{ m.label }}</text>
						</view>
					</view>

					<view class="bc-foot">
						<view class="bc-act" @tap.stop="like(post)">
							<text class="bc-act-ico" :class="{ liked: post.liked }">♥</text>
							<text class="bc-act-n">{{ post.likes }}</text>
						</view>
						<view class="bc-act">
							<text class="bc-act-ico">💬</text>
							<text class="bc-act-n">{{ post.comments }}</text>
						</view>
						<view class="bc-resonate" :class="{ resonated: post.resonated }" @tap.stop="resonate(post)">
							<text class="bc-resonate-ico">😭</text>
							<text class="bc-resonate-text">我也是</text>
							<text class="bc-act-n">{{ post.resonates }}</text>
						</view>
						<view class="bc-share" @tap.stop>
							<text class="bc-act-ico">↗</text>
						</view>
					</view>
				</view>
			</view>

			<view class="list-bottom" />
		</scroll-view>

		<tab-bar current="/pages/community/index" />
	</view>
</template>

<script setup lang="ts">
	const PERIODS = ['今日', '本周', '本月']
	const MODEL_FILTERS = [
		{ key: 'all', label: '全部', dot: '' },
		{ key: 'claude', label: 'Claude', dot: '#7C3AED' },
		{ key: 'gpt4o', label: 'GPT-4o', dot: '#10B981' },
		{ key: 'gemini', label: 'Gemini', dot: '#2563EB' },
		{ key: 'deepseek', label: 'DeepSeek', dot: '#F59E0B' },
		{ key: 'grok', label: 'Grok', dot: '#374151' }
	]
	const SORT_MODES = ['烧得最多', '最新', '最值']
	const MOODS = [
		{ key: 'worth', label: '值了 ✓', color: '#10B981' },
		{ key: 'ok', label: '还行 😐', color: '#6B7280' },
		{ key: 'regret', label: '后悔了 😭', color: '#EF4444' },
		{ key: 'hooked', label: '上瘾了 🔥', color: '#F59E0B' }
	]

	const period = ref('今日')
	const modelFilter = ref('all')
	const sortMode = ref('烧得最多')
	const periodIndex = computed(() => {
		const currentIndex = PERIODS.findIndex((item) => item === period.value)
		return currentIndex === -1 ? 0 : currentIndex
	})
	const sortModeIndex = computed(() => {
		const currentIndex = SORT_MODES.findIndex((item) => item === sortMode.value)
		return currentIndex === -1 ? 0 : currentIndex
	})

	const totalMap: Record<string, string> = { '今日': '48,203', '本周': '284,920', '本月': '1,203,480' }
	const currentTotal = computed(() => totalMap[period.value])

	const podiumData = ref([
		{ id: 'p3', author: '张晴', color: '#D97706', cost: '¥312.00', mood: '🔥' },
		{ id: 'p7', author: '高远', color: '#7C3AED', cost: '¥178.50', mood: '😭' },
		{ id: 'p1', author: '林晓珊', color: '#7C3AED', cost: '¥128.50', mood: '✓' }
	])

	const rankList = ref([
		{
			id: 'r4', author: '苏晓月', color: '#2563EB',
			model: 'GPT-4o', modelBg: 'rgba(16,185,129,0.1)', modelDot: '#10B981',
			cost: '¥89.20', mood: '😐',
			content: '月底了，账单来了，GPT-4o $42、Claude $28、Gemini $8'
		},
		{
			id: 'r5', author: '王建明', color: '#0891B2',
			model: 'Claude Sonnet', modelBg: 'rgba(124,58,237,0.1)', modelDot: '#7C3AED',
			cost: '¥56.20', mood: '✓',
			content: '写技术文档反复改格式，改了12轮，最后发现把要求写清楚第一轮就出来了'
		},
		{
			id: 'r6', author: '陈佳慧', color: '#059669',
			model: 'GPT-4o', modelBg: 'rgba(16,185,129,0.1)', modelDot: '#10B981',
			cost: '¥18.40', mood: '😭',
			content: 'AI帮我把3000字周报压缩到500字，领导说下次多写点细节'
		},
		{
			id: 'r7', author: '刘明远', color: '#DC2626',
			model: 'DeepSeek', modelBg: 'rgba(245,158,11,0.1)', modelDot: '#F59E0B',
			cost: '¥2.30', mood: '✓',
			content: '换DeepSeek用了一周，效果差不多，便宜了80%，感觉发现了新大陆'
		}
	])

	const posts = ref([
		{
			id: 'p1', author: '林晓珊', color: '#7C3AED', time: '今天 14:32',
			model: 'Claude Opus', modelBg: 'rgba(124,58,237,0.08)', modelDot: '#7C3AED',
			cost: '¥128.50', tokens: '2,340,000',
			content: '帮甲方改了7版 PPT，最后还是用了最开始那版。钱花了，但经验攒了，学到了什么叫"甲方的想法只有甲方知道"。',
			mood: 'worth', likes: 284, comments: 47, resonates: 163, liked: false, resonated: false
		},
		{
			id: 'p2', author: '王建明', color: '#0891B2', time: '今天 11:08',
			model: 'GPT-4o', modelBg: 'rgba(16,185,129,0.08)', modelDot: '#10B981',
			cost: '¥56.20', tokens: '890,000',
			content: '写了一篇技术文档，反复让它改格式改措辞，改了12轮。最后发现直接把要求写清楚第一轮就出来了。这课交得值。',
			mood: 'ok', likes: 156, comments: 23, resonates: 89, liked: true, resonated: false
		},
		{
			id: 'p4', author: '陈佳慧', color: '#059669', time: '昨天 23:17',
			model: 'GPT-4o', modelBg: 'rgba(16,185,129,0.08)', modelDot: '#10B981',
			cost: '¥18.40', tokens: '320,000',
			content: '用 AI 帮我把3000字的周报压缩到500字，领导说"写得不错，下次多写点细节"。我人傻了。',
			mood: 'regret', likes: 1203, comments: 312, resonates: 892, liked: false, resonated: false
		},
		{
			id: 'p5', author: '刘明远', color: '#DC2626', time: '昨天 20:33',
			model: 'DeepSeek', modelBg: 'rgba(245,158,11,0.08)', modelDot: '#F59E0B',
			cost: '¥2.30', tokens: '1,230,000',
			content: '换 DeepSeek 用了一周，效果差不多，但便宜了80%。感觉自己发现了新大陆，赶紧分享给大家。这才叫少不起！',
			mood: 'worth', likes: 2341, comments: 445, resonates: 1203, liked: false, resonated: false
		},
		{
			id: 'p6', author: '苏晓月', color: '#2563EB', time: '前天',
			model: 'Gemini 1.5 Pro', modelBg: 'rgba(37,99,235,0.08)', modelDot: '#2563EB',
			cost: '¥0.00', tokens: '480,000',
			content: 'Google 免费额度快用完了，但还没用完这个月的量。感觉白嫖到了就是赚到。疯狂用中。',
			mood: 'worth', likes: 445, comments: 78, resonates: 234, liked: false, resonated: false
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

	const onPeriodChange = (e: { currentIndex: number }) => {
		period.value = PERIODS[e.currentIndex] ?? PERIODS[0]
	}

	const onSortModeChange = (e: { currentIndex: number }) => {
		sortMode.value = SORT_MODES[e.currentIndex] ?? SORT_MODES[0]
	}
</script>

<style lang="scss" scoped>
	.page {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: #F7F8FA;
	}

	/* 顶部时间筛选 */
	.top-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 14rpx 24rpx;
		background: #fff;
		border-bottom: 1rpx solid #F3F4F6;
		flex-shrink: 0;

		.period-tabs {
			width: 320rpx;

			:deep(.segmented-control) {
				height: 56rpx;
				border-radius: 16rpx;
				overflow: hidden;
			}

			:deep(.segmented-control__item) {
				border-radius: 12rpx;
			}

			:deep(.segmented-control__text) {
				font-size: 24rpx;
			}

			:deep(.segmented-control__item--button) {
				border-color: #EEF2FF !important;
			}
		}

		.top-total {
			display: flex;
			flex-direction: column;
			align-items: flex-end;

			.total-label { font-size: 20rpx; color: #9CA3AF; }
			.total-val { font-size: 28rpx; font-weight: 800; color: #EF4444; }
		}
	}

	/* 模型筛选 */
	.model-filter-scroll {
		background: #fff;
		flex-shrink: 0;

		.model-filter-row {
			display: flex;
			padding: 10rpx 20rpx 14rpx;
			gap: 10rpx;
			width: max-content;
		}
	}

	.mf-pill {
		display: inline-flex;
		align-items: center;
		gap: 7rpx;
		padding: 8rpx 20rpx;
		border-radius: 30rpx;
		background: #F3F4F6;
		flex-shrink: 0;

		.mf-dot { width: 12rpx; height: 12rpx; border-radius: 50%; flex-shrink: 0; }
		.mf-text { font-size: 24rpx; color: #6B7280; white-space: nowrap; }

		&.active {
			background: #1A1A2E;
			.mf-text { color: #fff; font-weight: 600; }
		}
	}

	.list-scroll { flex: 1; overflow: hidden; }

	/* 奖台区域 */
	.podium-section {
		background: linear-gradient(180deg, #1E1B4B 0%, #F7F8FA 100%);
		padding: 24rpx 24rpx 0;

		.podium-title {
			display: block;
			font-size: 26rpx;
			font-weight: 700;
			color: rgba(255,255,255,0.9);
			margin-bottom: 24rpx;
			text-align: center;
		}
	}

	.podium {
		display: flex;
		align-items: flex-end;
		justify-content: center;
		gap: 0;

		.podium-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 6rpx;
			flex: 1;

			.crown { font-size: 32rpx; margin-bottom: 4rpx; }

			.podium-av {
				width: 80rpx;
				height: 80rpx;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				border: 3rpx solid rgba(255,255,255,0.4);

				.podium-av-t { font-size: 30rpx; color: #fff; font-weight: 700; }

				&.podium-av-lg {
					width: 96rpx;
					height: 96rpx;
					border-color: #FBBF24;
					box-shadow: 0 0 0 4rpx rgba(251,191,36,0.3);
				}
			}

			.podium-name { font-size: 22rpx; color: rgba(255,255,255,0.85); font-weight: 600; }

			.podium-cost {
				font-weight: 800;
				letter-spacing: -1rpx;

				&.p1-cost { font-size: 34rpx; color: #FBBF24; }
				&.p2-cost { font-size: 28rpx; color: #E5E7EB; }
				&.p3-cost { font-size: 26rpx; color: #CD7C54; }
			}

			.podium-block {
				width: 100%;
				display: flex;
				flex-direction: column;
				align-items: center;
				padding: 16rpx 0 12rpx;
				border-radius: 16rpx 16rpx 0 0;
				gap: 4rpx;

				.podium-medal { font-size: 28rpx; }
				.podium-rank-label { font-size: 20rpx; font-weight: 700; }

				&.p1-block { background: rgba(251,191,36,0.2); height: 130rpx; .podium-rank-label { color: #FBBF24; } }
				&.p2-block { background: rgba(229,231,235,0.15); height: 96rpx; .podium-rank-label { color: #E5E7EB; } }
				&.p3-block { background: rgba(205,124,84,0.15); height: 72rpx; .podium-rank-label { color: #CD7C54; } }
			}
		}
	}

	/* 排行榜列表 */
	.rank-list {
		background: #fff;
		margin: 0 0 16rpx;
		padding: 0 20rpx;

		.rank-row {
			display: flex;
			align-items: center;
			gap: 14rpx;
			padding: 16rpx 0;
			border-bottom: 1rpx solid #F9FAFB;

			&:last-child { border-bottom: none; }

			.rr-rank {
				font-size: 22rpx;
				font-weight: 700;
				color: #D1D5DB;
				width: 48rpx;
				text-align: center;
				flex-shrink: 0;
			}

			.rr-av {
				width: 56rpx;
				height: 56rpx;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				flex-shrink: 0;

				.rr-av-t { font-size: 22rpx; color: #fff; font-weight: 700; }
			}

			.rr-info {
				flex: 1;
				overflow: hidden;

				.rr-top {
					display: flex;
					align-items: center;
					gap: 8rpx;
					margin-bottom: 5rpx;

					.rr-author { font-size: 26rpx; font-weight: 600; color: #1A1A2E; }

					.rr-model-badge {
						display: flex;
						align-items: center;
						gap: 5rpx;
						padding: 2rpx 10rpx;
						border-radius: 10rpx;

						.rr-dot { width: 10rpx; height: 10rpx; border-radius: 50%; flex-shrink: 0; }
						.rr-model { font-size: 19rpx; color: #6B7280; }
					}
				}

				.rr-content { font-size: 22rpx; color: #9CA3AF; }
			}

			.rr-right {
				display: flex;
				flex-direction: column;
				align-items: flex-end;
				gap: 4rpx;
				flex-shrink: 0;

				.rr-cost { font-size: 28rpx; font-weight: 800; color: #EF4444; }
				.rr-mood { font-size: 24rpx; }
			}
		}
	}

	/* 分割线 */
	.list-divider {
		padding: 16rpx 0;
		display: flex;
		justify-content: center;

		.divider-text { font-size: 22rpx; color: #C4C9D4; }
	}

	/* 全部记录 */
	.section-label {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8rpx 24rpx 12rpx;

		.sl-text { font-size: 26rpx; font-weight: 700; color: #1A1A2E; }

		.sl-sort {
			width: 304rpx;

			:deep(.segmented-control) {
				height: 52rpx;
				border-radius: 14rpx;
				overflow: hidden;
			}

			:deep(.segmented-control__text) {
				font-size: 22rpx;
			}

			:deep(.segmented-control__item--button) {
				border-color: #F3F4F6 !important;
			}
		}
	}

	.full-feed {
		padding: 0 20rpx;
		display: flex;
		flex-direction: column;
		gap: 12rpx;
	}

	/* Burn 卡片 */
	.burn-card {
		background: #fff;
		border-radius: 20rpx;
		padding: 20rpx;
		box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);

		.bc-head {
			display: flex;
			align-items: center;
			gap: 12rpx;
			margin-bottom: 16rpx;

			.bc-av {
				width: 64rpx;
				height: 64rpx;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				flex-shrink: 0;

				.bc-av-t { font-size: 24rpx; color: #fff; font-weight: 700; }
			}

			.bc-meta {
				flex: 1;
				display: flex;
				flex-direction: column;
				gap: 5rpx;

				.bc-top {
					display: flex;
					align-items: center;
					gap: 10rpx;

					.bc-author { font-size: 26rpx; font-weight: 700; color: #1A1A2E; }

					.bc-model-badge {
						display: flex;
						align-items: center;
						gap: 5rpx;
						padding: 3rpx 10rpx;
						border-radius: 10rpx;

						.bc-dot { width: 10rpx; height: 10rpx; border-radius: 50%; flex-shrink: 0; }
						.bc-model { font-size: 19rpx; color: #6B7280; }
					}
				}

				.bc-time { font-size: 21rpx; color: #9CA3AF; }
			}

			.bc-more { font-size: 32rpx; color: #C4C9D4; letter-spacing: 2rpx; }
		}

		.bc-data {
			display: flex;
			align-items: center;
			background: linear-gradient(135deg, #FFF7F0, #FFF1F0);
			border: 1rpx solid #FFE4D6;
			border-radius: 14rpx;
			padding: 16rpx 0;
			margin-bottom: 16rpx;

			.bc-data-left, .bc-data-right {
				flex: 1;
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 4rpx;

				.bc-data-label { font-size: 21rpx; color: #9CA3AF; }
			}

			.bc-cost { font-size: 38rpx; font-weight: 800; color: #EF4444; letter-spacing: -1rpx; }
			.bc-tokens { font-size: 26rpx; font-weight: 700; color: #F59E0B; }

			.bc-data-div { width: 1rpx; height: 56rpx; background: #FFD6C8; }
		}

		.bc-content {
			font-size: 26rpx;
			color: #374151;
			line-height: 1.65;
			margin-bottom: 14rpx;
			display: block;
		}

		.bc-mood-row {
			display: flex;
			flex-wrap: wrap;
			gap: 8rpx;
			margin-bottom: 14rpx;

			.bc-mood-tag {
				padding: 7rpx 18rpx;
				border-radius: 24rpx;
				border: 1rpx solid #E5E7EB;
				background: #F9FAFB;

				.bc-mood-text { font-size: 21rpx; color: #9CA3AF; white-space: nowrap; }

				&.active .bc-mood-text { font-weight: 600; }
			}
		}

		.bc-foot {
			display: flex;
			align-items: center;
			gap: 6rpx;
			padding-top: 14rpx;
			border-top: 1rpx solid #F3F4F6;

			.bc-act {
				display: flex;
				align-items: center;
				gap: 6rpx;
				padding: 6rpx 10rpx;

				.bc-act-ico { font-size: 26rpx; color: #C4C9D4; &.liked { color: #EF4444; } }
				.bc-act-n { font-size: 21rpx; color: #9CA3AF; }
			}

			.bc-resonate {
				display: flex;
				align-items: center;
				gap: 6rpx;
				background: #F9FAFB;
				border: 1rpx solid #E5E7EB;
				border-radius: 20rpx;
				padding: 7rpx 14rpx;

				.bc-resonate-ico { font-size: 22rpx; }
				.bc-resonate-text { font-size: 21rpx; color: #6B7280; }
				.bc-act-n { font-size: 21rpx; color: #9CA3AF; }

				&.resonated {
					background: rgba(239,68,68,0.06);
					border-color: rgba(239,68,68,0.25);
					.bc-resonate-text, .bc-act-n { color: #EF4444; }
				}
			}

			.bc-share { margin-left: auto; padding: 6rpx 10rpx; .bc-act-ico { font-size: 26rpx; color: #C4C9D4; } }
		}
	}

	.list-bottom { height: 160rpx; }

	.line-1 { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
	.line-3 {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		overflow: hidden;
	}
</style>
