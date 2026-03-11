<template>
	<view class="page">

		<!-- 分类宫格 -->
		<scroll-view scroll-x class="cat-scroll" :show-scrollbar="false">
			<view class="cat-inner">
				<view
					v-for="cat in CATEGORIES"
					:key="cat.key"
					class="cat-item"
					:class="{ active: activeCat === cat.key }"
					@tap="activeCat = cat.key"
				>
					<view class="cat-icon-wrap" :class="{ 'cat-icon-active': activeCat === cat.key }">
						<text class="cat-icon">{{ cat.icon }}</text>
					</view>
					<text class="cat-label" :class="{ 'cat-label-active': activeCat === cat.key }">{{ cat.label }}</text>
				</view>
			</view>
		</scroll-view>

		<!-- 筛选 Tab -->
		<view class="filter-tabs">
			<view
				v-for="tab in FILTER_TABS"
				:key="tab"
				class="tab-item"
				:class="{ active: activeTab === tab }"
				@tap="activeTab = tab"
			>
				<text class="tab-text">{{ tab }}</text>
				<view v-if="activeTab === tab" class="tab-bar" />
			</view>
			<view class="tab-right">
				<view class="filter-btn" @tap="showFilter">
					<text class="filter-icon">⚙</text>
					<view v-if="hasFilter" class="filter-dot" />
				</view>
			</view>
		</view>

		<!-- Skill 卡片列表 -->
		<scroll-view class="skill-scroll" scroll-y :show-scrollbar="false">
			<view class="skill-list">

				<view
					v-for="skill in skills"
					:key="skill.id"
					class="skill-card"
					@tap="toSkill(skill.id)"
				>
					<!-- 顶部：分类标签 + 精选角标 -->
					<view class="card-top-row">
						<view class="cat-badge" :style="{ background: skill.catColor + '18', color: skill.catColor }">
							<text class="cat-badge-text">{{ skill.catLabel }}</text>
						</view>
						<view v-if="skill.featured" class="featured-badge">
							<text class="featured-text">⭐ 精选</text>
						</view>
					</view>

					<!-- 主体：图标 + 信息 -->
					<view class="card-body">
						<view class="icon-wrap">
							<text class="icon-emoji">{{ skill.icon }}</text>
						</view>
						<view class="card-info">
							<text class="skill-title">{{ skill.title }}</text>
							<text class="skill-desc line-2">{{ skill.desc }}</text>

							<!-- 适用场景 -->
							<view class="scenes-row">
								<text v-for="scene in skill.scenes" :key="scene" class="scene-tag">✓ {{ scene }}</text>
							</view>

							<!-- 标签 -->
							<view class="tags-row">
								<text v-for="tag in skill.tags" :key="tag" class="stag">{{ tag }}</text>
							</view>
						</view>
					</view>

					<!-- 底部：作者 + 数据 + 按钮 -->
					<view class="card-foot">
						<view class="author-row">
							<view class="av" :style="{ background: skill.authorColor }">
								<text class="av-t">{{ skill.author[0] }}</text>
							</view>
							<text class="author-name">{{ skill.author }}</text>
						</view>
						<view class="stat-row">
							<text class="stat-item">使用 {{ skill.usage }}</text>
							<text class="stat-dot">·</text>
							<text class="stat-item">收藏 {{ skill.favorites }}</text>
						</view>
						<view class="btns-row">
							<view class="collect-btn" @tap.stop="collectSkill(skill)">
								<text :class="['collect-ico', { collected: skill.collected }]">★</text>
							</view>
							<view class="use-btn" @tap.stop="useSkill(skill)">
								<text class="use-text">立即使用</text>
							</view>
						</view>
					</view>
				</view>

			</view>
			<view class="list-bottom" />
		</scroll-view>

		<tab-bar current="/pages/skill/index" />
	</view>
</template>

<script setup lang="ts">
	const CATEGORIES = [
		{ key: 'all', icon: '🌟', label: '全部' },
		{ key: 'writing', icon: '✍️', label: '写作' },
		{ key: 'code', icon: '💻', label: '编程' },
		{ key: 'design', icon: '🎨', label: '设计' },
		{ key: 'marketing', icon: '📣', label: '营销' },
		{ key: 'study', icon: '📚', label: '学习' },
		{ key: 'career', icon: '💼', label: '职场' },
		{ key: 'efficiency', icon: '⚡', label: '效率' }
	]

	const FILTER_TABS = ['最热', '最新', '精选']

	const activeCat = ref('all')
	const activeTab = ref('最热')
	const hasFilter = ref(false)

	const showFilter = () => {
		uni.showToast({ title: '筛选功能开发中', icon: 'none' })
	}

	const skills = ref([
		{
			id: 's1', icon: '✍️', catLabel: '写作', catColor: '#5B5BD6',
			featured: true,
			title: '万能文案生成器',
			desc: '输入产品名称和卖点，30秒输出3套方案，朋友圈/小红书/公众号/Banner 文案格式全覆盖，拒绝千篇一律',
			scenes: ['产品推广', '社媒内容', '活动文案'],
			tags: ['文案', '营销', 'AI辅助'],
			author: '文案大师Leon', authorColor: '#5B5BD6',
			usage: '2.3k', favorites: '891',
			collected: false
		},
		{
			id: 's2', icon: '📝', catLabel: '职场', catColor: '#059669',
			featured: false,
			title: '周报一键生成',
			desc: '把本周工作流水账扔进去，帮你提炼亮点、优化表达，生成让领导满意的专业周报，再也不用熬夜写周报',
			scenes: ['职场汇报', '效率提升'],
			tags: ['职场', '效率', '汇报'],
			author: '职场老鸟晓明', authorColor: '#059669',
			usage: '5.1k', favorites: '2.1k',
			collected: true
		},
		{
			id: 's3', icon: '🧠', catLabel: '职场', catColor: '#059669',
			featured: true,
			title: '面试回答 STAR 框架',
			desc: 'STAR法则+行业案例库，帮你把平淡的工作经历打磨成有说服力的面试亮点，大幅提升面试通过率',
			scenes: ['求职面试', '自我介绍', '经历包装'],
			tags: ['求职', '面试', '职场'],
			author: 'HR大厂前辈', authorColor: '#DC2626',
			usage: '8.7k', favorites: '3.4k',
			collected: false
		},
		{
			id: 's4', icon: '🎨', catLabel: '设计', catColor: '#F59E0B',
			featured: false,
			title: 'UI 设计评审话术包',
			desc: '帮你用专业设计语言跟甲方/老板沟通设计决策，避免被无理由改稿，维护设计方案的完整性',
			scenes: ['设计评审', '方案汇报', '客户沟通'],
			tags: ['设计', '沟通', 'UI'],
			author: '设计师小鹿', authorColor: '#F59E0B',
			usage: '1.8k', favorites: '654',
			collected: false
		},
		{
			id: 's5', icon: '💻', catLabel: '编程', catColor: '#7C3AED',
			featured: false,
			title: 'Code Review 助手',
			desc: '把代码扔进来，帮你找潜在 bug、性能问题、安全漏洞，并给出具体的优化建议和重构方向',
			scenes: ['代码审查', 'Bug排查', '性能优化'],
			tags: ['编程', '代码质量', '重构'],
			author: '后端老司机', authorColor: '#7C3AED',
			usage: '3.6k', favorites: '1.2k',
			collected: false
		},
		{
			id: 's6', icon: '📊', catLabel: '效率', catColor: '#0891B2',
			featured: false,
			title: '数据分析结论提炼',
			desc: '把一堆数字和表格扔给它，自动识别关键趋势、异常点，生成清晰的数据洞察和业务建议',
			scenes: ['数据报告', '业务分析', '决策支持'],
			tags: ['数据分析', '效率', '洞察'],
			author: '数据分析师Wendy', authorColor: '#0891B2',
			usage: '2.9k', favorites: '1.1k',
			collected: false
		}
	])

	const collectSkill = (skill: any) => {
		skill.collected = !skill.collected
		uni.showToast({ title: skill.collected ? '已收藏' : '已取消收藏', icon: 'none' })
	}

	const useSkill = (_skill: any) => {
		uni.showToast({ title: '已复制 Skill 内容', icon: 'success' })
	}

	const toSkill = (id: string) => {
		uni.navigateTo({ url: `/pages/detail/skill?id=${id}` })
	}
</script>

<style lang="scss" scoped>
	.page {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: #F7F8FA;
	}

	/* 分类横划 */
	.cat-scroll {
		background: #fff;
		flex-shrink: 0;

		.cat-inner {
			display: flex;
			padding: 20rpx 16rpx 16rpx;
			gap: 0;
		}

		.cat-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 8rpx;
			padding: 0 20rpx;
			white-space: nowrap;

			.cat-icon-wrap {
				width: 88rpx;
				height: 88rpx;
				border-radius: 22rpx;
				background: #F3F4F6;
				display: flex;
				align-items: center;
				justify-content: center;
				transition: all 0.2s;

				&.cat-icon-active {
					background: linear-gradient(135deg, #5B5BD6 0%, #8B5CF6 100%);
				}

				.cat-icon {
					font-size: 40rpx;
				}
			}

			.cat-label {
				font-size: 22rpx;
				color: #9CA3AF;

				&.cat-label-active {
					color: #5B5BD6;
					font-weight: 600;
				}
			}
		}
	}

	/* 筛选 Tab */
	.filter-tabs {
		display: flex;
		align-items: center;
		background: #fff;
		padding: 0 20rpx;
		border-bottom: 1rpx solid #F3F4F6;
		margin-bottom: 16rpx;
		flex-shrink: 0;

		.tab-item {
			position: relative;
			padding: 20rpx 16rpx 18rpx;

			.tab-text {
				font-size: 28rpx;
				color: #9CA3AF;
			}

			&.active .tab-text {
				color: #1A1A2E;
				font-weight: 700;
			}

			.tab-bar {
				position: absolute;
				bottom: 0;
				left: 50%;
				transform: translateX(-50%);
				width: 32rpx;
				height: 4rpx;
				border-radius: 2rpx;
				background: #5B5BD6;
			}
		}

		.tab-right {
			margin-left: auto;

			.filter-btn {
				position: relative;
				width: 56rpx;
				height: 56rpx;
				border-radius: 12rpx;
				background: #F3F4F6;
				display: flex;
				align-items: center;
				justify-content: center;

				.filter-icon {
					font-size: 28rpx;
					color: #6B7280;
				}

				.filter-dot {
					position: absolute;
					top: 8rpx;
					right: 8rpx;
					width: 12rpx;
					height: 12rpx;
					border-radius: 50%;
					background: #EF4444;
				}
			}
		}
	}

	/* Skill 列表 */
	.skill-scroll {
		flex: 1;
		overflow: hidden;

		.skill-list {
			padding: 0 20rpx;
			display: flex;
			flex-direction: column;
			gap: 16rpx;
		}

		.list-bottom {
			height: 40rpx;
		}
	}

	/* Skill 卡片 */
	.skill-card {
		background: #fff;
		border-radius: 24rpx;
		padding: 24rpx;
		box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.06);
		border: 1rpx solid transparent;

		&:active {
			border-color: #DDD6FE;
			background: #FAFAFA;
		}

		.card-top-row {
			display: flex;
			align-items: center;
			gap: 12rpx;
			margin-bottom: 18rpx;

			.cat-badge {
				padding: 5rpx 16rpx;
				border-radius: 20rpx;

				.cat-badge-text {
					font-size: 22rpx;
					font-weight: 600;
				}
			}

			.featured-badge {
				.featured-text {
					font-size: 22rpx;
					color: #F59E0B;
					background: rgba(245, 158, 11, 0.1);
					padding: 5rpx 14rpx;
					border-radius: 20rpx;
				}
			}
		}

		.card-body {
			display: flex;
			gap: 20rpx;
			margin-bottom: 20rpx;

			.icon-wrap {
				width: 96rpx;
				height: 96rpx;
				background: #F7F8FA;
				border-radius: 20rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				flex-shrink: 0;
				box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);

				.icon-emoji {
					font-size: 48rpx;
				}
			}

			.card-info {
				flex: 1;
				display: flex;
				flex-direction: column;
				gap: 8rpx;

				.skill-title {
					font-size: 30rpx;
					font-weight: 700;
					color: #1A1A2E;
				}

				.skill-desc {
					font-size: 24rpx;
					color: #6B7280;
					line-height: 1.6;
				}

				.scenes-row {
					display: flex;
					flex-wrap: wrap;
					gap: 8rpx;

					.scene-tag {
						font-size: 22rpx;
						color: #059669;
					}
				}

				.tags-row {
					display: flex;
					flex-wrap: wrap;
					gap: 8rpx;

					.stag {
						font-size: 20rpx;
						color: #6B7280;
						background: #F3F4F6;
						padding: 4rpx 14rpx;
						border-radius: 12rpx;
					}
				}
			}
		}

		.card-foot {
			border-top: 1rpx solid #F3F4F6;
			padding-top: 18rpx;
			display: flex;
			flex-direction: column;
			gap: 14rpx;

			.author-row {
				display: flex;
				align-items: center;
				gap: 10rpx;

				.av {
					width: 44rpx;
					height: 44rpx;
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;

					.av-t {
						font-size: 18rpx;
						color: #fff;
						font-weight: 700;
					}
				}

				.author-name {
					font-size: 24rpx;
					color: #6B7280;
				}
			}

			.stat-row {
				display: flex;
				align-items: center;
				gap: 8rpx;

				.stat-item {
					font-size: 22rpx;
					color: #9CA3AF;
				}

				.stat-dot {
					font-size: 22rpx;
					color: #D1D5DB;
				}
			}

			.btns-row {
				display: flex;
				align-items: center;
				gap: 12rpx;
				justify-content: flex-end;

				.collect-btn {
					width: 68rpx;
					height: 68rpx;
					border-radius: 50%;
					border: 2rpx solid #E5E7EB;
					display: flex;
					align-items: center;
					justify-content: center;

					.collect-ico {
						font-size: 30rpx;
						color: #D1D5DB;

						&.collected {
							color: #F59E0B;
						}
					}
				}

				.use-btn {
					flex: 1;
					height: 68rpx;
					background: #5B5BD6;
					border-radius: 34rpx;
					display: flex;
					align-items: center;
					justify-content: center;

					.use-text {
						font-size: 26rpx;
						color: #fff;
						font-weight: 600;
					}
				}
			}
		}
	}
</style>
