<template>
	<view class="page">

		<!-- 自定义导航栏 -->
		<view class="navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="navbar-inner">
				<view class="brand-wrap">
					<text class="brand">少不起</text>
				</view>
				<view class="nav-right">
					<view class="nav-btn" @tap="toSearch">
						<text class="nav-icon">🔍</text>
					</view>
					<view class="nav-btn" @tap="toNotify">
						<text class="nav-icon">🔔</text>
						<view class="red-dot" />
					</view>
				</view>
			</view>
		</view>

		<scroll-view class="main-scroll" scroll-y :show-scrollbar="false">

			<!-- ① 个人状态卡 -->
			<view class="dashboard-card">
				<view class="dc-greeting">
					<text class="dc-hi">早上好，林晓珊 👋</text>
					<text class="dc-date">3月 · 本月还剩 20 天</text>
				</view>
				<view class="dc-stats">
					<view class="dc-stat-item">
						<text class="dc-stat-val red">¥168.50</text>
						<text class="dc-stat-label">本月已烧</text>
					</view>
					<view class="dc-stat-div" />
					<view class="dc-stat-item">
						<text class="dc-stat-val">Claude</text>
						<text class="dc-stat-label">最爱模型</text>
					</view>
					<view class="dc-stat-div" />
					<view class="dc-stat-item">
						<text class="dc-stat-val purple">4.7k</text>
						<text class="dc-stat-label">获共鸣</text>
					</view>
				</view>
				<!-- 月度进度条 -->
				<view class="dc-progress-wrap">
					<view class="dc-progress-bar">
						<view class="dc-progress-fill" style="width: 56%" />
					</view>
					<text class="dc-progress-tip">已花 56% · 月预算 ¥300</text>
				</view>
				<!-- 快速记录 -->
				<view class="dc-log-btn" @tap="toPublish">
					<text class="dc-log-icon">🔥</text>
					<text class="dc-log-text">记录今日烧榜</text>
					<text class="dc-log-arrow">→</text>
				</view>
			</view>

			<!-- ② 烧榜今日快报 -->
			<view class="section-head">
				<text class="sh-title">烧榜今日快报</text>
				<text class="sh-more" @tap="toCommunity">查看排行 ›</text>
			</view>
			<view class="leaderboard-preview">
				<view
					v-for="(item, index) in topBurns"
					:key="item.id"
					class="lb-row"
					@tap="toPost(item.id)"
				>
					<view class="lb-rank" :class="['rank-' + (index + 1)]">
						<text class="lb-rank-text">{{ index + 1 }}</text>
					</view>
					<view class="lb-av" :style="{ background: item.color }">
						<text class="lb-av-t">{{ item.author[0] }}</text>
					</view>
					<view class="lb-info">
						<text class="lb-author">{{ item.author }}</text>
						<view class="lb-model-badge" :style="{ background: item.modelBg }">
							<text class="lb-model-text">{{ item.model }}</text>
						</view>
					</view>
					<text class="lb-cost">{{ item.cost }}</text>
					<text class="lb-mood">{{ item.moodEmoji }}</text>
				</view>
			</view>

			<!-- ③ 推荐 Skill -->
			<view class="section-head">
				<text class="sh-title">为你推荐的 Skill</text>
				<text class="sh-more" @tap="toSkillTab">全部 ›</text>
			</view>
			<scroll-view class="skill-scroll" scroll-x :show-scrollbar="false">
				<view class="skill-row">
					<view
						v-for="skill in recommendedSkills"
						:key="skill.id"
						class="skill-mini"
						@tap="toSkill(skill.id)"
					>
						<view class="sm-icon-wrap">
							<text class="sm-icon">{{ skill.icon }}</text>
						</view>
						<text class="sm-title">{{ skill.title }}</text>
						<text class="sm-desc line-2">{{ skill.desc }}</text>
						<view class="sm-foot">
							<text class="sm-usage">{{ skill.usage }} 人用过</text>
							<view class="sm-use-btn" @tap.stop="useSkill(skill)">
								<text class="sm-use-text">使用</text>
							</view>
						</view>
					</view>
				</view>
			</scroll-view>

			<!-- ④ 关注的人 -->
			<view class="section-head">
				<text class="sh-title">关注的人在烧</text>
				<text class="sh-more">更多 ›</text>
			</view>
			<view class="following-feed">
				<view
					v-for="item in followingFeed"
					:key="item.id"
					class="ff-card"
					@tap="toPost(item.id)"
				>
					<view class="ff-head">
						<view class="ff-av" :style="{ background: item.color }">
							<text class="ff-av-t">{{ item.author[0] }}</text>
						</view>
						<view class="ff-meta">
							<text class="ff-author">{{ item.author }}</text>
							<text class="ff-time">{{ item.time }}</text>
						</view>
						<view class="ff-model-badge" :style="{ background: item.modelBg }">
							<view class="ff-dot" :style="{ background: item.modelDot }" />
							<text class="ff-model">{{ item.model }}</text>
						</view>
					</view>
					<view class="ff-data">
						<text class="ff-cost">{{ item.cost }}</text>
						<text class="ff-sep">·</text>
						<text class="ff-tokens">{{ item.tokens }}</text>
						<view class="ff-mood-tag" :style="{ color: item.moodColor }">
							<text>{{ item.mood }}</text>
						</view>
					</view>
					<text class="ff-content line-2">{{ item.content }}</text>
					<view class="ff-foot">
						<text class="ff-act">♥ {{ item.likes }}</text>
						<text class="ff-act">😭 {{ item.resonates }}</text>
						<text class="ff-act">💬 {{ item.comments }}</text>
					</view>
				</view>
			</view>

			<view class="feed-bottom" />
		</scroll-view>

		<tab-bar current="/pages/index/index" />
	</view>
</template>

<script setup lang="ts">
	import { useSysInfoStore } from '@/stores'

	const sysInfo = useSysInfoStore()
	const statusBarHeight = computed(() => (sysInfo.systemInfo as any).statusBarHeight || 44)

	const topBurns = ref([
		{ id: 'b1', author: '张晴', color: '#D97706', model: 'Claude Opus', modelBg: 'rgba(124,58,237,0.1)', cost: '¥312.00', moodEmoji: '🔥' },
		{ id: 'b2', author: '高远', color: '#7C3AED', model: 'Claude Opus', modelBg: 'rgba(124,58,237,0.1)', cost: '¥178.50', moodEmoji: '😭' },
		{ id: 'b3', author: '王建明', color: '#0891B2', model: 'GPT-4o', modelBg: 'rgba(16,185,129,0.1)', cost: '¥89.20', moodEmoji: '😐' }
	])

	const recommendedSkills = ref([
		{ id: 's1', icon: '💰', title: 'Token 省钱大法', desc: '用最少 token 拿最好输出，平均节省 40%', usage: '4.7k' },
		{ id: 's2', icon: '🔥', title: '烧榜 Prompt 模板', desc: '一次搞定减少无效 token 消耗', usage: '6.1k' },
		{ id: 's3', icon: '📊', title: 'AI 账单分析助手', desc: '上传账单截图，找出最贵的用法', usage: '3.2k' },
		{ id: 's4', icon: '✍️', title: '万能文案生成器', desc: '30 秒输出 3 套方案，格式全覆盖', usage: '2.3k' }
	])

	const followingFeed = ref([
		{
			id: 'f1', author: '陈佳慧', color: '#059669', time: '1小时前',
			model: 'GPT-4o', modelBg: 'rgba(16,185,129,0.1)', modelDot: '#10B981',
			cost: '¥18.40', tokens: '320k tokens',
			mood: '后悔了😭', moodColor: '#EF4444',
			content: '用 AI 帮我把 3000 字周报压缩到 500 字，领导说"写得不错，下次多写点细节"。我人傻了。',
			likes: 1203, resonates: 892, comments: 312
		},
		{
			id: 'f2', author: '刘明远', color: '#DC2626', time: '3小时前',
			model: 'DeepSeek', modelBg: 'rgba(245,158,11,0.1)', modelDot: '#F59E0B',
			cost: '¥2.30', tokens: '1,230k tokens',
			mood: '值了✓', moodColor: '#059669',
			content: '换 DeepSeek 用了一周，效果差不多，但便宜了 80%。感觉发现了新大陆，赶紧分享。',
			likes: 2341, resonates: 1203, comments: 445
		}
	])

	const useSkill = (_item: any) => {
		uni.showToast({ title: '已复制 Skill 内容', icon: 'success' })
	}

	const toPost = (id: string) => {
		uni.navigateTo({ url: `/pages/detail/post?id=${id}` })
	}

	const toSkill = (id: string) => {
		uni.navigateTo({ url: `/pages/detail/skill?id=${id}` })
	}

	const toSearch = () => {
		uni.navigateTo({ url: '/pages/search/index' })
	}

	const toPublish = () => {
		uni.switchTab({ url: '/pages/publish/index' })
	}

	const toCommunity = () => {
		uni.switchTab({ url: '/pages/community/index' })
	}

	const toSkillTab = () => {
		uni.switchTab({ url: '/pages/skill/index' })
	}

	const toNotify = () => {
		uni.showToast({ title: '暂无新通知', icon: 'none' })
	}
</script>

<style lang="scss" scoped>
	.page {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: #F7F8FA;
	}

	/* 导航栏 */
	.navbar {
		background: #fff;
		flex-shrink: 0;
		box-shadow: 0 1rpx 0 #F3F4F6;

		.navbar-inner {
			height: 88rpx;
			padding: 0 28rpx;
			display: flex;
			align-items: center;
			justify-content: space-between;
		}

		.brand { font-size: 40rpx; font-weight: 900; color: #1A1A2E; }

		.nav-right { display: flex; align-items: center; }

		.nav-btn {
			position: relative;
			width: 72rpx;
			height: 72rpx;
			display: flex;
			align-items: center;
			justify-content: center;

			.nav-icon { font-size: 38rpx; }

			.red-dot {
				position: absolute;
				top: 10rpx;
				right: 10rpx;
				width: 14rpx;
				height: 14rpx;
				border-radius: 50%;
				background: #EF4444;
				border: 2rpx solid #fff;
			}
		}
	}

	.main-scroll { flex: 1; overflow: hidden; }

	/* ① 个人状态卡 */
	.dashboard-card {
		margin: 20rpx 24rpx 0;
		background: linear-gradient(150deg, #1E1B4B 0%, #3B1F6B 100%);
		border-radius: 24rpx;
		padding: 28rpx;

		.dc-greeting {
			margin-bottom: 24rpx;

			.dc-hi {
				display: block;
				font-size: 30rpx;
				font-weight: 700;
				color: #fff;
				margin-bottom: 6rpx;
			}

			.dc-date { font-size: 22rpx; color: rgba(255,255,255,0.5); }
		}

		.dc-stats {
			display: flex;
			align-items: center;
			background: rgba(255,255,255,0.08);
			border-radius: 16rpx;
			padding: 18rpx 0;
			margin-bottom: 20rpx;

			.dc-stat-item {
				flex: 1;
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 4rpx;

				.dc-stat-val {
					font-size: 30rpx;
					font-weight: 700;
					color: #fff;

					&.red { color: #FCA5A5; }
					&.purple { color: #C4B5FD; }
				}

				.dc-stat-label { font-size: 20rpx; color: rgba(255,255,255,0.5); }
			}

			.dc-stat-div {
				width: 1rpx;
				height: 40rpx;
				background: rgba(255,255,255,0.15);
			}
		}

		/* 进度条 */
		.dc-progress-wrap {
			margin-bottom: 20rpx;

			.dc-progress-bar {
				height: 8rpx;
				background: rgba(255,255,255,0.15);
				border-radius: 4rpx;
				overflow: hidden;
				margin-bottom: 8rpx;

				.dc-progress-fill {
					height: 100%;
					background: linear-gradient(90deg, #FBBF24, #EF4444);
					border-radius: 4rpx;
				}
			}

			.dc-progress-tip { font-size: 21rpx; color: rgba(255,255,255,0.5); }
		}

		/* 快速记录按钮 */
		.dc-log-btn {
			display: flex;
			align-items: center;
			gap: 12rpx;
			background: rgba(239,68,68,0.25);
			border: 1rpx solid rgba(239,68,68,0.4);
			border-radius: 14rpx;
			padding: 18rpx 20rpx;

			.dc-log-icon { font-size: 28rpx; }

			.dc-log-text {
				flex: 1;
				font-size: 26rpx;
				color: #FCA5A5;
				font-weight: 600;
			}

			.dc-log-arrow { font-size: 26rpx; color: rgba(255,255,255,0.4); }
		}
	}

	/* section 标题行 */
	.section-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 28rpx 24rpx 12rpx;

		.sh-title { font-size: 28rpx; font-weight: 700; color: #1A1A2E; }
		.sh-more { font-size: 24rpx; color: #9CA3AF; }
	}

	/* ② 烧榜快报 */
	.leaderboard-preview {
		margin: 0 24rpx;
		background: #fff;
		border-radius: 20rpx;
		overflow: hidden;
		box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.05);

		.lb-row {
			display: flex;
			align-items: center;
			gap: 16rpx;
			padding: 18rpx 20rpx;
			border-bottom: 1rpx solid #F9FAFB;

			&:last-child { border-bottom: none; }

			.lb-rank {
				width: 40rpx;
				height: 40rpx;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				flex-shrink: 0;
				background: #F3F4F6;

				.lb-rank-text { font-size: 22rpx; font-weight: 700; color: #9CA3AF; }

				&.rank-1 { background: #FBBF24; .lb-rank-text { color: #fff; } }
				&.rank-2 { background: #9CA3AF; .lb-rank-text { color: #fff; } }
				&.rank-3 { background: #CD7C54; .lb-rank-text { color: #fff; } }
			}

			.lb-av {
				width: 60rpx;
				height: 60rpx;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				flex-shrink: 0;

				.lb-av-t { font-size: 24rpx; color: #fff; font-weight: 700; }
			}

			.lb-info {
				flex: 1;
				display: flex;
				flex-direction: column;
				gap: 6rpx;

				.lb-author { font-size: 26rpx; font-weight: 600; color: #1A1A2E; }

				.lb-model-badge {
					display: inline-flex;
					align-self: flex-start;
					padding: 2rpx 10rpx;
					border-radius: 10rpx;

					.lb-model-text { font-size: 19rpx; color: #6B7280; }
				}
			}

			.lb-cost {
				font-size: 32rpx;
				font-weight: 800;
				color: #EF4444;
				letter-spacing: -1rpx;
			}

			.lb-mood { font-size: 28rpx; }
		}
	}

	/* ③ 推荐 Skill */
	.skill-scroll {
		width: 100%;

		.skill-row {
			display: flex;
			gap: 16rpx;
			padding: 0 24rpx 4rpx;
			width: max-content;
		}
	}

	.skill-mini {
		width: 260rpx;
		background: #fff;
		border-radius: 20rpx;
		padding: 20rpx;
		flex-shrink: 0;
		box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
		border: 1rpx solid #F0F0FD;

		.sm-icon-wrap {
			width: 72rpx;
			height: 72rpx;
			background: #F0F0FD;
			border-radius: 16rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-bottom: 14rpx;

			.sm-icon { font-size: 36rpx; }
		}

		.sm-title {
			display: block;
			font-size: 26rpx;
			font-weight: 700;
			color: #1A1A2E;
			margin-bottom: 8rpx;
		}

		.sm-desc {
			font-size: 22rpx;
			color: #9CA3AF;
			line-height: 1.5;
			margin-bottom: 16rpx;
		}

		.sm-foot {
			display: flex;
			align-items: center;
			justify-content: space-between;

			.sm-usage { font-size: 21rpx; color: #C4C9D4; }

			.sm-use-btn {
				background: #5B5BD6;
				padding: 8rpx 20rpx;
				border-radius: 20rpx;

				.sm-use-text { font-size: 20rpx; color: #fff; font-weight: 600; }
			}
		}
	}

	/* ④ 关注的人 */
	.following-feed {
		padding: 0 24rpx;
		display: flex;
		flex-direction: column;
		gap: 12rpx;

		.ff-card {
			background: #fff;
			border-radius: 20rpx;
			padding: 20rpx;
			box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);

			.ff-head {
				display: flex;
				align-items: center;
				gap: 12rpx;
				margin-bottom: 14rpx;

				.ff-av {
					width: 60rpx;
					height: 60rpx;
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;
					flex-shrink: 0;

					.ff-av-t { font-size: 22rpx; color: #fff; font-weight: 700; }
				}

				.ff-meta {
					flex: 1;

					.ff-author { display: block; font-size: 26rpx; font-weight: 600; color: #1A1A2E; }
					.ff-time { font-size: 21rpx; color: #9CA3AF; }
				}

				.ff-model-badge {
					display: flex;
					align-items: center;
					gap: 6rpx;
					padding: 5rpx 14rpx;
					border-radius: 20rpx;

					.ff-dot { width: 10rpx; height: 10rpx; border-radius: 50%; flex-shrink: 0; }
					.ff-model { font-size: 20rpx; color: #374151; }
				}
			}

			.ff-data {
				display: flex;
				align-items: center;
				gap: 10rpx;
				margin-bottom: 12rpx;

				.ff-cost { font-size: 32rpx; font-weight: 800; color: #EF4444; }
				.ff-sep { font-size: 22rpx; color: #E5E7EB; }
				.ff-tokens { font-size: 22rpx; color: #F59E0B; font-weight: 600; }

				.ff-mood-tag {
					margin-left: auto;
					font-size: 21rpx;
					font-weight: 600;
				}
			}

			.ff-content {
				display: block;
				font-size: 25rpx;
				color: #374151;
				line-height: 1.65;
				margin-bottom: 14rpx;
			}

			.ff-foot {
				display: flex;
				gap: 24rpx;
				padding-top: 12rpx;
				border-top: 1rpx solid #F9FAFB;

				.ff-act { font-size: 22rpx; color: #9CA3AF; }
			}
		}
	}

	.feed-bottom { height: 160rpx; }

	.line-2 {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
	}
</style>
