<template>
	<view class="page">

		<!-- 顶部搜索+筛选栏 -->
		<view class="top-bar">
			<view class="search-wrap" @tap="toSearch">
				<uni-icons class="search-icon" type="search" size="16" color="rgba(0,0,0,0.45)" />
				<text class="search-ph">搜索 Skill / 场景 / 模型</text>
			</view>
			<view class="top-actions">
				<view class="action-btn" @tap="showFilter = true">
					<uni-icons class="action-icon" type="tune-filled" size="16" color="rgba(0,0,0,0.55)" />
					<text class="action-text">筛选</text>
				</view>
			</view>
		</view>

		<!-- 排序 Tab -->
		<scroll-view class="sort-tabs" scroll-x :show-scrollbar="false">
			<view class="sort-tab-row">
				<view
					v-for="tab in sortTabs"
					:key="tab.key"
					class="sort-tab"
					:class="{ active: activeSort === tab.key }"
					@tap="setSort(tab.key)"
				>
					<text class="sort-tab-text">{{ tab.label }}</text>
				</view>
			</view>
		</scroll-view>

		<!-- Skill 列表（单列高密度） -->
		<scroll-view class="skill-list-scroll" scroll-y :show-scrollbar="false">
			<view class="skill-list">
				<view
					v-for="skill in skills"
					:key="skill.id"
					class="skill-card"
					@tap="toSkill(skill.id)"
				>
					<!-- 状态标签行 -->
					<view class="sc-badge-row">
						<view v-if="skill.featured" class="sc-badge badge-gold">精选</view>
						<view v-if="skill.isNew" class="sc-badge badge-blue">新发布</view>
						<view v-if="skill.lowCost" class="sc-badge badge-green">低成本</view>
						<view v-if="skill.highConsume" class="sc-badge badge-red">高消耗</view>
						<view v-if="skill.stable" class="sc-badge badge-purple">输出稳定</view>
						<view class="sc-scene-tag">{{ skill.scene }}</view>
					</view>

					<!-- 标题 -->
					<text class="sc-title">{{ skill.title }}</text>

					<!-- 摘要 -->
					<text class="sc-summary">{{ skill.summary }}</text>

					<!-- 标签 -->
					<view class="sc-tags">
						<view v-for="tag in skill.tags.slice(0, 3)" :key="tag" class="sc-tag">
							<text class="sc-tag-text">{{ tag }}</text>
						</view>
					</view>

					<!-- Token & 模型信息 -->
					<view class="sc-meta-bar">
						<view class="sc-token">
							<uni-icons class="sc-token-icon" type="fire-filled" size="14" color="#E45C1A" />
							<text class="sc-token-val">{{ skill.avgToken }}</text>
							<text class="sc-token-unit">tokens</text>
						</view>
						<view class="sc-model-badge">
							<text class="sc-model-dot" :style="{ color: skill.modelColor }">●</text>
							<text class="sc-model-name">{{ skill.model }}</text>
						</view>
						<view class="sc-rate">
							<text class="sc-rate-val">{{ skill.successRate }}</text>
							<text class="sc-rate-label">复现率</text>
						</view>
					</view>

					<!-- 底部：数据 + 作者 + 复制按钮 -->
					<view class="sc-foot">
						<view class="sc-foot-left">
							<view class="sc-author">
								<view class="sc-av" :style="{ background: skill.authorColor }">
									<text class="sc-av-t">{{ skill.author[0] }}</text>
								</view>
								<text class="sc-author-name">{{ skill.author }}</text>
							</view>
							<view class="sc-counts">
								<text class="sc-count-item">{{ skill.copyCount }} 复制</text>
								<text class="sc-count-sep">·</text>
								<text class="sc-count-item">{{ skill.favoriteCount }} 收藏</text>
							</view>
						</view>
						<view class="sc-copy-btn" @tap.stop="copySkill(skill)">
							<text class="sc-copy-text">复制 Skill</text>
						</view>
					</view>
				</view>
			</view>

			<view class="list-bottom" />
		</scroll-view>

		<!-- 筛选 Bottom Sheet -->
		<view v-if="showFilter" class="overlay" @tap="showFilter = false" />
		<view v-if="showFilter" class="bottom-sheet">
			<view class="bs-handle" />
			<text class="bs-title">筛选</text>

			<text class="bs-section">场景</text>
			<view class="bs-chip-row">
				<view
					v-for="s in ['全部', '写作', '编程', '自媒体', '办公', '运营', '学习', '设计', '电商']"
					:key="s"
					class="bs-chip"
					:class="{ active: filterScene === s }"
					@tap="filterScene = s"
				>
					<text class="bs-chip-text">{{ s }}</text>
				</view>
			</view>

			<text class="bs-section">token 区间</text>
			<view class="bs-chip-row">
				<view
					v-for="t in ['全部', '< 1k', '1k~3k', '3k~8k', '> 8k']"
					:key="t"
					class="bs-chip"
					:class="{ active: filterToken === t }"
					@tap="filterToken = t"
				>
					<text class="bs-chip-text">{{ t }}</text>
				</view>
			</view>

			<text class="bs-section">复现率</text>
			<view class="bs-chip-row">
				<view
					v-for="r in ['全部', '> 90%', '> 80%', '> 70%']"
					:key="r"
					class="bs-chip"
					:class="{ active: filterRate === r }"
					@tap="filterRate = r"
				>
					<text class="bs-chip-text">{{ r }}</text>
				</view>
			</view>

			<view class="bs-actions">
				<view class="bs-reset" @tap="resetFilter">
					<text class="bs-reset-text">重置</text>
				</view>
				<view class="bs-confirm" @tap="showFilter = false">
					<text class="bs-confirm-text">确认筛选</text>
				</view>
			</view>
		</view>

	</view>
</template>

<script setup lang="ts">
	import { getCurrentInstance } from 'vue'

	const instance = getCurrentInstance()
	onShow(() => {
		uni.getTabBar(instance?.proxy)?.setData({ selected: 3 })
	})
	const showFilter = ref(false)
	const activeSort = ref('recommend')
	const filterScene = ref('全部')
	const filterToken = ref('全部')
	const filterRate = ref('全部')

	const sortTabs = [
		{ key: 'recommend', label: '推荐' },
		{ key: 'newest', label: '最新' },
		{ key: 'mostCopy', label: '复制最多' },
		{ key: 'lowestToken', label: 'token最低' },
		{ key: 'bestValue', label: '性价比最高' },
		{ key: 'highRate', label: '复现率最高' }
	]

	const setSort = (key: string) => {
		activeSort.value = key
	}

	const skills = ref([
		{
			id: 's1',
			title: 'PS 人像精修提示词（参数版）',
			summary: '把照片问题转成可直接操作的 PS 步骤与参数区间，适合人像和电商主图。',
			scene: '设计',
			tags: ['PS修图', '参数建议', '人像优化'],
			avgToken: '1.9k', model: 'GPT-4.1', modelColor: '#2F8A57',
			successRate: '93%', copyCount: '8.3k', favoriteCount: '2.1k',
			author: '阿泽修图', authorColor: '#D6943A',
			featured: true, isNew: true, lowCost: false, highConsume: false, stable: true
		},
		{
			id: 's2',
			title: '前端 Bug 定位与修复助手',
			summary: '先根因排序再给最小改动补丁，附带回归检查清单，适合线上快速救火。',
			scene: '编程',
			tags: ['Bug定位', '最小改动', '回归测试'],
			avgToken: '2.1k', model: 'Claude Sonnet', modelColor: '#C7A06A',
			successRate: '90%', copyCount: '7.6k', favoriteCount: '2.0k',
			author: '周知行', authorColor: '#9A6530',
			featured: true, isNew: false, lowCost: false, highConsume: false, stable: true
		},
		{
			id: 's3',
			title: '会议纪要行动项提取器',
			summary: '把会议原文拆成“决策+待办+负责人+截止日期”，方便团队直接执行。',
			scene: '办公',
			tags: ['会议纪要', '行动项', '项目管理'],
			avgToken: '1.1k', model: 'GPT-4o-mini', modelColor: '#2F8A57',
			successRate: '93%', copyCount: '6.9k', favoriteCount: '1.8k',
			author: '刘效率', authorColor: '#2F8A57',
			featured: false, isNew: true, lowCost: true, highConsume: false, stable: true
		},
		{
			id: 's4',
			title: '电商主图卖点文案生成器',
			summary: '生成高点击主图短文案和副标题，适合淘宝、拼多多、抖店场景。',
			scene: '电商',
			tags: ['主图文案', '卖点提炼', '电商转化'],
			avgToken: '1.5k', model: 'GPT-4.1', modelColor: '#2F8A57',
			successRate: '91%', copyCount: '5.9k', favoriteCount: '1.9k',
			author: '许稳稳', authorColor: '#D6943A',
			featured: true, isNew: false, lowCost: false, highConsume: false, stable: true
		},
		{
			id: 's5',
			title: '短视频口播脚本生成器',
			summary: '输出30~60秒口播稿，含开场钩子、中段观点和结尾互动引导。',
			scene: '自媒体',
			tags: ['口播脚本', '短视频', '内容创作'],
			avgToken: '1.8k', model: 'Claude Sonnet', modelColor: '#C7A06A',
			successRate: '89%', copyCount: '5.1k', favoriteCount: '1.6k',
			author: '王创作', authorColor: '#7B5B3C',
			featured: false, isNew: true, lowCost: false, highConsume: false, stable: false
		},
		{
			id: 's6',
			title: '英语口语陪练教练',
			summary: '按场景陪练口语，先纠错再给更自然表达，适合面试、旅行和商务沟通。',
			scene: '学习',
			tags: ['口语训练', '纠错改写', '英语学习'],
			avgToken: '1.6k', model: 'GPT-4o', modelColor: '#2F8A57',
			successRate: '88%', copyCount: '4.4k', favoriteCount: '1.3k',
			author: '陈可', authorColor: '#2F8A57',
			featured: false, isNew: false, lowCost: false, highConsume: false, stable: true
		}
	])

	const copySkill = (_skill: any) => {
		uni.showToast({ title: '已复制 Skill', icon: 'success' })
	}

	const toSkill = (id: string) => {
		uni.navigateTo({ url: `/pages/detail/skill?id=${id}` })
	}

	const toSearch = () => {
		uni.navigateTo({ url: '/pages/search/index' })
	}

	const resetFilter = () => {
		filterScene.value = '全部'
		filterToken.value = '全部'
		filterRate.value = '全部'
	}
</script>

<style lang="scss" scoped>
	.page {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: #FFFFFF;
	}

	/* 顶部 */
	.top-bar {
		display: flex;
		align-items: center;
		gap: 16rpx;
		padding: 16rpx 24rpx 12rpx;
		background: #FFFFFF;
		border-bottom: 1rpx solid rgba(0,0,0,0.05);

		.search-wrap {
			flex: 1;
			height: 72rpx;
			background: rgba(0,0,0,0.06);
			border-radius: 36rpx;
			border: 1rpx solid rgba(0,0,0,0.08);
			display: flex;
			align-items: center;
			gap: 10rpx;
			padding: 0 24rpx;

			.search-icon {
				width: 28rpx;
				height: 28rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				flex-shrink: 0;
			}
			.search-ph { font-size: 24rpx; color: rgba(0,0,0,0.30); }
		}

		.top-actions {
			.action-btn {
				height: 72rpx;
				background: rgba(0,0,0,0.06);
				border-radius: 20rpx;
				border: 1rpx solid rgba(0,0,0,0.08);
				display: flex;
				align-items: center;
				gap: 6rpx;
				padding: 0 22rpx;

				.action-icon {
					width: 24rpx;
					height: 24rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					flex-shrink: 0;
				}
				.action-text { font-size: 24rpx; color: rgba(0,0,0,0.70); font-weight: 500; }
			}
		}
	}

	/* 排序 Tab */
	.sort-tabs {
		flex-shrink: 0;
		background: #FFFFFF;
		border-bottom: 1rpx solid rgba(0,0,0,0.05);

		.sort-tab-row {
			display: flex;
			padding: 0 16rpx;
			gap: 4rpx;
			width: max-content;
		}

		.sort-tab {
			padding: 18rpx 20rpx;
			position: relative;
			flex-shrink: 0;

			.sort-tab-text { font-size: 24rpx; color: rgba(0,0,0,0.40); font-weight: 500; }

			&.active {
				.sort-tab-text { color: #E45C1A; font-weight: 700; }

				&::after {
					content: '';
					position: absolute;
					bottom: 0;
					left: 20rpx;
					right: 20rpx;
					height: 4rpx;
					background: #E45C1A;
					border-radius: 999rpx;
				}
			}
		}
	}

	/* Skill 列表 */
	.skill-list-scroll { flex: 1; overflow: hidden; }

	.skill-list {
		padding: 20rpx 24rpx 0;
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.skill-card {
		background: #FFFFFF;
		border-radius: 28rpx;
		border: 1rpx solid rgba(0,0,0,0.07);
		padding: 28rpx;

		&:active { background: #F5F7FA; }

		.sc-badge-row {
			display: flex;
			align-items: center;
			gap: 10rpx;
			margin-bottom: 18rpx;
			flex-wrap: wrap;

			.sc-badge {
				font-size: 18rpx;
				font-weight: 600;
				padding: 4rpx 14rpx;
				border-radius: 8rpx;

				&.badge-gold { color: #D6943A; background: rgba(214, 148, 58,0.12); }
				&.badge-blue { color: #5E738A; background: rgba(94, 115, 138,0.12); }
				&.badge-green { color: #2F8A57; background: rgba(47, 138, 87,0.12); }
				&.badge-red { color: #C84634; background: rgba(200, 70, 52,0.12); }
				&.badge-purple { color: #C7A06A; background: rgba(199, 160, 106,0.12); }
			}

			.sc-scene-tag {
				margin-left: auto;
				font-size: 20rpx;
				color: rgba(0,0,0,0.40);
				background: rgba(0,0,0,0.06);
				padding: 4rpx 14rpx;
				border-radius: 8rpx;
			}
		}

		.sc-title {
			display: block;
			font-size: 30rpx;
			font-weight: 800;
			color: #1A1A1A;
			margin-bottom: 12rpx;
			line-height: 1.35;
		}

		.sc-summary {
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
			overflow: hidden;
			font-size: 24rpx;
			color: rgba(0,0,0,0.50);
			line-height: 1.65;
			margin-bottom: 18rpx;
		}

		.sc-tags {
			display: flex;
			gap: 10rpx;
			margin-bottom: 20rpx;

			.sc-tag {
				background: rgba(0,0,0,0.05);
				padding: 6rpx 16rpx;
				border-radius: 8rpx;

				.sc-tag-text { font-size: 20rpx; color: rgba(0,0,0,0.50); }
			}
		}

		.sc-meta-bar {
			display: flex;
			align-items: center;
			gap: 24rpx;
			background: rgba(0,0,0,0.03);
			border-radius: 16rpx;
			padding: 16rpx 20rpx;
			margin-bottom: 20rpx;

			.sc-token {
				display: flex;
				align-items: center;
				gap: 6rpx;

				.sc-token-icon {
					width: 22rpx;
					height: 22rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					flex-shrink: 0;
				}
				.sc-token-val { font-size: 26rpx; font-weight: 800; color: #E45C1A; }
				.sc-token-unit { font-size: 18rpx; color: rgba(0,0,0,0.40); }
			}

			.sc-model-badge {
				display: flex;
				align-items: center;
				gap: 6rpx;

				.sc-model-dot { font-size: 16rpx; }
				.sc-model-name { font-size: 22rpx; color: rgba(0,0,0,0.6); font-weight: 500; }
			}

			.sc-rate {
				margin-left: auto;
				display: flex;
				align-items: baseline;
				gap: 4rpx;

				.sc-rate-val { font-size: 26rpx; font-weight: 700; color: #2F8A57; }
				.sc-rate-label { font-size: 18rpx; color: rgba(0,0,0,0.40); }
			}
		}

		.sc-foot {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 16rpx;

			.sc-foot-left {
				display: flex;
				flex-direction: column;
				gap: 8rpx;

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

						.sc-av-t { font-size: 18rpx; color: #fff; font-weight: 700; }
					}

					.sc-author-name { font-size: 22rpx; color: rgba(0,0,0,0.55); font-weight: 500; }
				}

				.sc-counts {
					display: flex;
					align-items: center;
					gap: 8rpx;

					.sc-count-item { font-size: 20rpx; color: rgba(0,0,0,0.40); }
					.sc-count-sep { font-size: 20rpx; color: rgba(0,0,0,0.20); }
				}
			}

			.sc-copy-btn {
				background: #E45C1A;
				padding: 16rpx 32rpx;
				border-radius: 100rpx;
				box-shadow: 0 4rpx 16rpx rgba(228, 92, 26, 0.18);
				flex-shrink: 0;

				.sc-copy-text { font-size: 24rpx; color: #fff; font-weight: 700; }
			}
		}
	}

	.list-bottom { height: calc(160rpx + env(safe-area-inset-bottom)); }

	/* Bottom Sheet */
	.overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0,0,0,0.6);
		z-index: 100;
	}

	.bottom-sheet {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		background: #FFFFFF;
		border-radius: 40rpx 40rpx 0 0;
		border-top: 1rpx solid rgba(0,0,0,0.08);
		z-index: 101;
		padding: 24rpx 28rpx calc(32rpx + env(safe-area-inset-bottom));

		.bs-handle {
			width: 64rpx;
			height: 6rpx;
			border-radius: 3rpx;
			background: rgba(0,0,0,0.12);
			margin: 0 auto 28rpx;
		}

		.bs-title {
			display: block;
			font-size: 30rpx;
			font-weight: 700;
			color: #1A1A1A;
			margin-bottom: 20rpx;
		}

		.bs-section {
			display: block;
			font-size: 22rpx;
			color: rgba(0,0,0,0.40);
			margin-bottom: 14rpx;
			margin-top: 24rpx;
		}

		.bs-chip-row {
			display: flex;
			flex-wrap: wrap;
			gap: 12rpx;

			.bs-chip {
				height: 60rpx;
				padding: 0 24rpx;
				background: rgba(0,0,0,0.06);
				border-radius: 16rpx;
				border: 1rpx solid rgba(0,0,0,0.08);
				display: flex;
				align-items: center;

				.bs-chip-text { font-size: 24rpx; color: rgba(0,0,0,0.6); }

				&.active {
					background: rgba(228, 92, 26,0.15);
					border-color: rgba(228, 92, 26, 0.24);

					.bs-chip-text { color: #E45C1A; font-weight: 600; }
				}
			}
		}

		.bs-actions {
			display: flex;
			gap: 20rpx;
			margin-top: 36rpx;

			.bs-reset {
				flex: 1;
				height: 88rpx;
				background: rgba(0,0,0,0.06);
				border-radius: 24rpx;
				border: 1rpx solid rgba(0,0,0,0.09);
				display: flex;
				align-items: center;
				justify-content: center;

				.bs-reset-text { font-size: 28rpx; color: rgba(0,0,0,0.6); font-weight: 600; }
			}

			.bs-confirm {
				flex: 2;
				height: 88rpx;
				background: #E45C1A;
				border-radius: 24rpx;
				box-shadow: 0 8rpx 24rpx rgba(228, 92, 26, 0.2);
				display: flex;
				align-items: center;
				justify-content: center;

				.bs-confirm-text { font-size: 28rpx; color: #fff; font-weight: 700; }
			}
		}
	}
</style>
