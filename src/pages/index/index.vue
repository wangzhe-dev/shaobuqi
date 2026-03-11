<template>
	<view class="page">

		<!-- 自定义导航栏 -->
		<view class="navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="navbar-inner">
				<view class="brand-wrap">
					<text class="brand">少不起</text>
					<view class="live-dot" />
				</view>
				<view class="nav-right">
					<view class="nav-btn" @tap="toSearch">
						<text class="nav-sym">🔍</text>
					</view>
					<view class="nav-btn" @tap="toNotify">
						<text class="nav-sym">🔔</text>
						<view class="red-dot" />
					</view>
				</view>
			</view>
		</view>

		<!-- 可滚动主体 -->
		<scroll-view class="main-scroll" scroll-y :show-scrollbar="false">

			<!-- ① 今日燃烧 Banner -->
			<view class="burn-banner">
				<view class="banner-left">
					<text class="banner-label">🔥 今日全站已燃烧</text>
					<text class="banner-amount">¥<text class="banner-num">284,920</text></text>
					<text class="banner-sub">共 <text class="banner-sub-hl">12,483</text> 人参与记录</text>
				</view>
				<view class="banner-right">
					<view class="log-btn" @tap="toPublish">
						<text class="log-btn-text">+ 记录今日</text>
					</view>
				</view>
			</view>

			<!-- ② 模型热度横滑 -->
			<view class="section-head">
				<text class="section-title">模型烧榜</text>
				<text class="section-more">更多 ›</text>
			</view>
			<scroll-view class="model-scroll" scroll-x :show-scrollbar="false">
				<view class="model-row">
					<view
						v-for="m in models"
						:key="m.name"
						class="model-card"
						:style="{ background: m.bg }"
						@tap="filterByModel(m.name)"
					>
						<text class="model-emoji">{{ m.emoji }}</text>
						<text class="model-name">{{ m.name }}</text>
						<text class="model-trend">{{ m.trend }}</text>
						<text class="model-avg">均消 {{ m.avg }}</text>
					</view>
				</view>
			</scroll-view>

			<!-- ③ Feed Tabs -->
			<view class="feed-tabs">
				<view
					v-for="tab in TABS"
					:key="tab"
					class="ftab"
					:class="{ active: cur === tab }"
					@tap="cur = tab"
				>
					<text class="ftab-text">{{ tab }}</text>
					<view v-if="cur === tab" class="ftab-bar" />
				</view>
				<view class="ftab-spacer" />
				<view class="ftab-filter" @tap="showFilter">
					<text class="ftab-filter-text">筛选</text>
				</view>
			</view>

			<!-- ④ 信息流 -->
			<view class="feed-list">
				<view v-for="item in feed" :key="item.id" class="feed-item">

					<!-- ===== Burn 记录卡片 ===== -->
					<view v-if="item.type === 'burn'" class="burn-card" @tap="toPost(item.id)">

						<!-- 头部：作者 + 模型标签 + 时间 -->
						<view class="bc-head">
							<view class="av" :style="{ background: item.color }">
								<text class="av-t">{{ item.author[0] }}</text>
							</view>
							<view class="bc-meta">
								<view class="bc-meta-top">
									<text class="bc-author">{{ item.author }}</text>
									<view class="model-badge" :style="{ background: item.modelBg }">
										<view class="model-dot" :style="{ background: item.modelDot }" />
										<text class="model-badge-text">{{ item.model }}</text>
									</view>
								</view>
								<text class="bc-time">{{ item.time }}</text>
							</view>
							<text class="bc-more">···</text>
						</view>

						<!-- 核心数据行：¥ + tokens -->
						<view class="bc-data">
							<view class="bc-cost-block">
								<text class="bc-cost-label">花了</text>
								<text class="bc-cost">¥{{ item.cost }}</text>
							</view>
							<view class="bc-divider" />
							<view class="bc-tokens-block">
								<text class="bc-tokens-label">消耗</text>
								<text class="bc-tokens">{{ item.tokens }}</text>
							</view>
							<view class="bc-mood-badge" :style="{ background: item.moodBg, color: item.moodColor }">
								<text class="bc-mood-text">{{ item.mood }}</text>
							</view>
						</view>

						<!-- 内容文字 -->
						<text class="bc-content line-2">{{ item.content }}</text>

						<!-- 标签行 -->
						<view class="bc-tags">
							<text v-for="tag in item.tags" :key="tag" class="bc-tag">#{{ tag }}</text>
						</view>

						<!-- 底部操作 -->
						<view class="bc-foot">
							<view class="bc-act" @tap.stop="like(item)">
								<text class="bc-act-ico" :class="{ liked: item.liked }">♥</text>
								<text class="bc-act-n">{{ item.likes }}</text>
							</view>
							<view class="bc-act">
								<text class="bc-act-ico">💬</text>
								<text class="bc-act-n">{{ item.comments }}</text>
							</view>
							<view class="resonate-pill" @tap.stop="resonate(item)">
								<text class="resonate-pill-text">😭 我也是 {{ item.resonates }}</text>
							</view>
						</view>

					</view>

					<!-- ===== Skill 推荐卡片 ===== -->
					<view v-else-if="item.type === 'skill'" class="skill-card" @tap="toSkill(item.id)">
						<view class="sc-left">
							<view class="sc-icon-wrap">
								<text class="sc-icon">{{ item.icon }}</text>
							</view>
						</view>
						<view class="sc-info">
							<view class="sc-head">
								<text class="sc-title">{{ item.title }}</text>
								<view v-if="item.featured" class="sc-badge">精选</view>
							</view>
							<text class="sc-desc line-2">{{ item.desc }}</text>
							<view class="sc-foot">
								<view class="sc-tags">
									<text v-for="tag in item.tags" :key="tag" class="sc-tag">{{ tag }}</text>
								</view>
								<text class="sc-usage">{{ item.usage }} 人用过</text>
							</view>
						</view>
						<view class="sc-use-btn" @tap.stop="useSkill(item)">
							<text class="sc-use-text">使用</text>
						</view>
					</view>

				</view>

				<view class="feed-bottom" />
			</view>

		</scroll-view>

	</view>
</template>

<script setup lang="ts">
	import { useSysInfoStore } from '@/stores'

	const sysInfo = useSysInfoStore()
	const statusBarHeight = computed(() => (sysInfo.systemInfo as any).statusBarHeight || 44)

	const TABS = ['精选', '关注', '最新', '烧得最多']
	const cur = ref('精选')

	const models = ref([
		{ name: 'Claude', emoji: '🟣', trend: '🔥 今日最热', avg: '¥18', bg: 'linear-gradient(135deg,#EDE9FE,#DDD6FE)' },
		{ name: 'GPT-4o', emoji: '🟢', trend: '📈 用量+24%', avg: '¥22', bg: 'linear-gradient(135deg,#DCFCE7,#BBF7D0)' },
		{ name: 'DeepSeek', emoji: '🔵', trend: '💰 最省钱', avg: '¥2', bg: 'linear-gradient(135deg,#DBEAFE,#BFDBFE)' },
		{ name: 'Gemini', emoji: '🔴', trend: '⭐ 新晋热门', avg: '¥8', bg: 'linear-gradient(135deg,#FEF3C7,#FDE68A)' },
		{ name: 'Grok', emoji: '⚫', trend: '🚀 增长最快', avg: '¥12', bg: 'linear-gradient(135deg,#F3F4F6,#E5E7EB)' }
	])

	const feed = ref([
		{
			type: 'burn', id: 'b1', author: '林晓珊', color: '#7C3AED', time: '2小时前',
			model: 'Claude', modelBg: 'rgba(124,58,237,0.1)', modelDot: '#7C3AED',
			cost: '38.50', tokens: '120k tokens',
			mood: '值了✓', moodBg: 'rgba(16,185,129,0.1)', moodColor: '#059669',
			content: '用 Claude 做了一份完整竞品分析报告，从资料整理到输出。比请助理便宜 10 倍，速度快 10 倍，真的值。',
			tags: ['竞品分析', '效率'], likes: 238, comments: 47, resonates: 156, liked: false
		},
		{
			type: 'burn', id: 'b2', author: '王建明', color: '#0891B2', time: '4小时前',
			model: 'GPT-4o', modelBg: 'rgba(16,185,129,0.1)', modelDot: '#10B981',
			cost: '312', tokens: '↑ 多平台合计',
			mood: '月底穷了💸', moodBg: 'rgba(239,68,68,0.1)', moodColor: '#EF4444',
			content: '月底账单：GPT-4o $42、Claude $28、Gemini $8，合计将近 600 块人民币。我这叫"AI 订阅穷三代"，有同感的来。',
			tags: ['月底算账', '多平台'], likes: 956, comments: 134, resonates: 821, liked: true
		},
		{
			type: 'skill', id: 's1', icon: '💰', featured: true,
			title: 'Token 省钱大法',
			desc: '用最少的 token 数拿到最好的输出结果，分场景给出提示词压缩技巧，平均节省 40%',
			tags: ['省钱', '提示词'], usage: '4.7k', author: '省钱达人阿明', color: '#5B5BD6'
		},
		{
			type: 'burn', id: 'b3', author: '张晴', color: '#D97706', time: '6小时前',
			model: 'Claude', modelBg: 'rgba(124,58,237,0.1)', modelDot: '#7C3AED',
			cost: '52.00', tokens: '200k tokens',
			mood: '后悔了😭', moodBg: 'rgba(239,68,68,0.1)', moodColor: '#EF4444',
			content: '改了 8 轮方案，单次任务消耗 200k tokens，¥52 没了。最后客户说"还是用第一版吧"。我 TM……有懂的吗？',
			tags: ['打工人', '血泪教训'], likes: 1287, comments: 267, resonates: 1043, liked: false
		},
		{
			type: 'burn', id: 'b4', author: '陈佳慧', color: '#059669', time: '昨天',
			model: 'DeepSeek', modelBg: 'rgba(37,99,235,0.1)', modelDot: '#2563EB',
			cost: '18.00', tokens: '580k tokens',
			mood: '值了✓', moodBg: 'rgba(16,185,129,0.1)', moodColor: '#059669',
			content: '切换 DeepSeek 一个月，写代码+文档总花费 ¥18，比 GPT-4o 省了 70%，效果差一点但完全能接受。附上账单对比截图。',
			tags: ['DeepSeek', '省钱攻略'], likes: 467, comments: 54, resonates: 389, liked: false
		},
		{
			type: 'skill', id: 's2', icon: '📊', featured: false,
			title: 'AI 账单分析助手',
			desc: '上传 OpenAI / Claude / Gemini 账单截图，分析消费结构，找出最贵的用法并给出优化建议',
			tags: ['账单', '省钱'], usage: '3.2k', author: '数据控小周', color: '#7C3AED'
		},
		{
			type: 'burn', id: 'b5', author: '刘明远', color: '#DC2626', time: '昨天',
			model: 'GPT-4o', modelBg: 'rgba(16,185,129,0.1)', modelDot: '#10B981',
			cost: '89.00', tokens: '340k tokens',
			mood: '上瘾了🔥', moodBg: 'rgba(245,158,11,0.1)', moodColor: '#D97706',
			content: '同一套代码任务测了 GPT-4o、Claude Sonnet、DeepSeek-V3。结论有点反直觉——最便宜的不一定最省钱，详情点进来。',
			tags: ['横向对比', '开发者'], likes: 892, comments: 167, resonates: 634, liked: false
		}
	])

	const like = (item: any) => {
		item.liked = !item.liked
		item.likes += item.liked ? 1 : -1
	}

	const resonate = (item: any) => {
		item.resonates += 1
		uni.showToast({ title: '已共鸣', icon: 'none', duration: 1000 })
	}

	const useSkill = (_item: any) => {
		uni.showToast({ title: '已复制 Skill 内容', icon: 'success' })
	}

	const filterByModel = (name: string) => {
		uni.showToast({ title: `筛选：${name}`, icon: 'none', duration: 800 })
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

	const showFilter = () => {
		uni.showToast({ title: '筛选功能开发中', icon: 'none' })
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

	/* ====== 导航栏 ====== */
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

		.brand-wrap {
			display: flex;
			align-items: center;
			gap: 10rpx;

			.brand {
				font-size: 40rpx;
				font-weight: 900;
				color: #1A1A2E;
				letter-spacing: -1rpx;
			}

			.live-dot {
				width: 14rpx;
				height: 14rpx;
				border-radius: 50%;
				background: #EF4444;
				margin-bottom: 16rpx;
			}
		}

		.nav-right {
			display: flex;
			align-items: center;
		}

		.nav-btn {
			position: relative;
			width: 72rpx;
			height: 72rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			border-radius: 50%;

			.nav-sym { font-size: 38rpx; }

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

	/* ====== 主滚动区 ====== */
	.main-scroll {
		flex: 1;
		overflow: hidden;
	}

	/* ====== ① 今日燃烧 Banner ====== */
	.burn-banner {
		margin: 20rpx 24rpx 0;
		background: linear-gradient(135deg, #1E1B4B 0%, #4C1D95 100%);
		border-radius: 24rpx;
		padding: 28rpx 24rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;

		.banner-left {
			display: flex;
			flex-direction: column;
			gap: 6rpx;

			.banner-label {
				font-size: 22rpx;
				color: rgba(255,255,255,0.7);
			}

			.banner-amount {
				font-size: 26rpx;
				color: rgba(255,255,255,0.9);
				font-weight: 500;

				.banner-num {
					font-size: 48rpx;
					font-weight: 900;
					color: #FBBF24;
					letter-spacing: -1rpx;
				}
			}

			.banner-sub {
				font-size: 22rpx;
				color: rgba(255,255,255,0.5);

				.banner-sub-hl {
					color: rgba(255,255,255,0.8);
					font-weight: 600;
				}
			}
		}

		.log-btn {
			background: rgba(255,255,255,0.15);
			border: 1rpx solid rgba(255,255,255,0.3);
			border-radius: 40rpx;
			padding: 18rpx 28rpx;
			backdrop-filter: blur(8px);

			.log-btn-text {
				font-size: 26rpx;
				color: #fff;
				font-weight: 600;
			}
		}
	}

	/* ====== ② 模型热度 ====== */
	.section-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 28rpx 24rpx 12rpx;

		.section-title {
			font-size: 28rpx;
			font-weight: 700;
			color: #1A1A2E;
		}

		.section-more {
			font-size: 24rpx;
			color: #9CA3AF;
		}
	}

	.model-scroll {
		width: 100%;

		.model-row {
			display: flex;
			padding: 0 24rpx 4rpx;
			gap: 16rpx;
			width: max-content;
		}
	}

	.model-card {
		width: 200rpx;
		border-radius: 20rpx;
		padding: 20rpx 18rpx;
		display: flex;
		flex-direction: column;
		gap: 6rpx;
		flex-shrink: 0;

		.model-emoji {
			font-size: 32rpx;
		}

		.model-name {
			font-size: 26rpx;
			font-weight: 700;
			color: #1A1A2E;
			margin-top: 4rpx;
		}

		.model-trend {
			font-size: 21rpx;
			color: #6B7280;
		}

		.model-avg {
			font-size: 22rpx;
			color: #374151;
			font-weight: 600;
			margin-top: 4rpx;
		}
	}

	/* ====== ③ Feed Tabs ====== */
	.feed-tabs {
		display: flex;
		align-items: center;
		background: #fff;
		padding: 0 20rpx;
		border-bottom: 1rpx solid #F3F4F6;
		margin-top: 20rpx;

		.ftab {
			position: relative;
			padding: 20rpx 14rpx 18rpx;

			.ftab-text {
				font-size: 27rpx;
				color: #9CA3AF;
			}

			&.active .ftab-text {
				color: #1A1A2E;
				font-weight: 700;
			}

			.ftab-bar {
				position: absolute;
				bottom: 0;
				left: 50%;
				transform: translateX(-50%);
				width: 28rpx;
				height: 4rpx;
				border-radius: 2rpx;
				background: #5B5BD6;
			}
		}

		.ftab-spacer { flex: 1; }

		.ftab-filter {
			padding: 12rpx 20rpx;
			background: #F3F4F6;
			border-radius: 20rpx;

			.ftab-filter-text {
				font-size: 24rpx;
				color: #6B7280;
			}
		}
	}

	/* ====== ④ 信息流 ====== */
	.feed-list {
		padding: 16rpx 24rpx 0;
	}

	.feed-item {
		margin-bottom: 16rpx;
	}

	.feed-bottom {
		height: 40rpx;
	}

	/* ====== Burn 记录卡片 ====== */
	.burn-card {
		background: #fff;
		border-radius: 20rpx;
		padding: 24rpx;
		box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.05);

		/* 头部 */
		.bc-head {
			display: flex;
			align-items: center;
			margin-bottom: 18rpx;

			.av {
				width: 68rpx;
				height: 68rpx;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				margin-right: 16rpx;
				flex-shrink: 0;

				.av-t {
					font-size: 26rpx;
					color: #fff;
					font-weight: 700;
				}
			}

			.bc-meta {
				flex: 1;
				display: flex;
				flex-direction: column;
				gap: 6rpx;

				.bc-meta-top {
					display: flex;
					align-items: center;
					gap: 12rpx;

					.bc-author {
						font-size: 28rpx;
						font-weight: 600;
						color: #1A1A2E;
					}

					.model-badge {
						display: flex;
						align-items: center;
						gap: 6rpx;
						padding: 4rpx 12rpx;
						border-radius: 20rpx;

						.model-dot {
							width: 12rpx;
							height: 12rpx;
							border-radius: 50%;
							flex-shrink: 0;
						}

						.model-badge-text {
							font-size: 20rpx;
							color: #374151;
							font-weight: 500;
						}
					}
				}

				.bc-time {
					font-size: 22rpx;
					color: #9CA3AF;
				}
			}

			.bc-more {
				font-size: 34rpx;
				color: #9CA3AF;
				letter-spacing: 2rpx;
			}
		}

		/* 核心数据行 */
		.bc-data {
			display: flex;
			align-items: center;
			gap: 0;
			background: #FFF8F5;
			border-radius: 16rpx;
			padding: 18rpx 20rpx;
			margin-bottom: 18rpx;

			.bc-cost-block {
				display: flex;
				flex-direction: column;
				gap: 2rpx;

				.bc-cost-label {
					font-size: 20rpx;
					color: #9CA3AF;
				}

				.bc-cost {
					font-size: 40rpx;
					font-weight: 900;
					color: #EF4444;
					letter-spacing: -1rpx;
				}
			}

			.bc-divider {
				width: 1rpx;
				height: 48rpx;
				background: #E5E7EB;
				margin: 0 20rpx;
			}

			.bc-tokens-block {
				display: flex;
				flex-direction: column;
				gap: 2rpx;
				flex: 1;

				.bc-tokens-label {
					font-size: 20rpx;
					color: #9CA3AF;
				}

				.bc-tokens {
					font-size: 28rpx;
					font-weight: 700;
					color: #F59E0B;
				}
			}

			.bc-mood-badge {
				padding: 8rpx 18rpx;
				border-radius: 20rpx;
				flex-shrink: 0;

				.bc-mood-text {
					font-size: 22rpx;
					font-weight: 500;
				}
			}
		}

		/* 内容文字 */
		.bc-content {
			font-size: 26rpx;
			color: #374151;
			line-height: 1.65;
			margin-bottom: 14rpx;
			display: block;
		}

		/* 标签 */
		.bc-tags {
			display: flex;
			flex-wrap: wrap;
			gap: 10rpx;
			margin-bottom: 18rpx;

			.bc-tag {
				font-size: 22rpx;
				color: #5B5BD6;
			}
		}

		/* 底部操作 */
		.bc-foot {
			display: flex;
			align-items: center;
			gap: 28rpx;
			padding-top: 16rpx;
			border-top: 1rpx solid #F3F4F6;

			.bc-act {
				display: flex;
				align-items: center;
				gap: 8rpx;

				.bc-act-ico {
					font-size: 28rpx;
					color: #C4C9D4;

					&.liked { color: #EF4444; }
				}

				.bc-act-n {
					font-size: 24rpx;
					color: #9CA3AF;
				}
			}

			.resonate-pill {
				margin-left: auto;
				background: rgba(239,68,68,0.08);
				border-radius: 30rpx;
				padding: 8rpx 20rpx;

				.resonate-pill-text {
					font-size: 22rpx;
					color: #EF4444;
					font-weight: 500;
				}
			}
		}
	}

	/* ====== Skill 推荐卡片 ====== */
	.skill-card {
		background: #F0F0FD;
		border: 1rpx solid #DDD6FE;
		border-radius: 20rpx;
		padding: 20rpx;
		display: flex;
		align-items: center;
		gap: 16rpx;

		.sc-left {
			.sc-icon-wrap {
				width: 80rpx;
				height: 80rpx;
				background: #fff;
				border-radius: 18rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				flex-shrink: 0;
				box-shadow: 0 2rpx 8rpx rgba(91,91,214,0.12);

				.sc-icon { font-size: 40rpx; }
			}
		}

		.sc-info {
			flex: 1;
			display: flex;
			flex-direction: column;
			gap: 6rpx;
			overflow: hidden;

			.sc-head {
				display: flex;
				align-items: center;
				gap: 10rpx;

				.sc-title {
					font-size: 28rpx;
					font-weight: 700;
					color: #1A1A2E;
				}

				.sc-badge {
					font-size: 18rpx;
					color: #FF7A45;
					background: rgba(255,122,69,0.1);
					padding: 2rpx 10rpx;
					border-radius: 10rpx;
					flex-shrink: 0;
				}
			}

			.sc-desc {
				font-size: 23rpx;
				color: #6B7280;
				line-height: 1.5;
			}

			.sc-foot {
				display: flex;
				align-items: center;
				justify-content: space-between;

				.sc-tags {
					display: flex;
					gap: 8rpx;

					.sc-tag {
						font-size: 20rpx;
						color: #5B5BD6;
						background: rgba(91,91,214,0.1);
						padding: 3rpx 12rpx;
						border-radius: 10rpx;
					}
				}

				.sc-usage {
					font-size: 21rpx;
					color: #9CA3AF;
				}
			}
		}

		.sc-use-btn {
			background: #5B5BD6;
			padding: 14rpx 26rpx;
			border-radius: 30rpx;
			flex-shrink: 0;

			.sc-use-text {
				font-size: 24rpx;
				color: #fff;
				font-weight: 600;
			}
		}
	}

	/* 多行省略 */
	.line-2 {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
	}
</style>
