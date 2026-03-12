<template>
	<view class="page">

		<!-- 顶部 Profile 头 -->
		<view class="profile-header" :style="{ paddingTop: statusBarHeight + 'px' }">

			<!-- 右上角操作 -->
			<view class="header-actions">
				<view class="header-btn" @tap="toNotify">
					<text class="header-icon">🔔</text>
				</view>
				<view class="header-btn" @tap="toSetting">
					<text class="header-icon">⚙️</text>
				</view>
			</view>

			<!-- 用户信息 -->
			<view class="user-info">
				<view class="av-wrap" @tap="changeAvatar">
					<view class="av" style="background: #5B5BD6">
						<text class="av-text">林</text>
					</view>
					<view class="av-edit-dot">
						<text class="av-edit-icon">✎</text>
					</view>
				</view>
				<view class="user-meta">
					<text class="user-name">林晓珊</text>
					<text class="user-bio">Claude 重度用户 · 产品人 · 少不起爱好者</text>
				</view>
			</view>

			<!-- 本月烧榜摘要 -->
			<view class="burn-summary">
				<view class="bs-item bs-main">
					<text class="bs-label">本月已烧</text>
					<text class="bs-value red">¥286.50</text>
				</view>
				<view class="bs-divider" />
				<view class="bs-item">
					<text class="bs-label">最爱模型</text>
					<text class="bs-value">Claude</text>
				</view>
				<view class="bs-divider" />
				<view class="bs-item">
					<text class="bs-label">获共鸣</text>
					<text class="bs-value">4.7k</text>
				</view>
			</view>

			<!-- 社交数据行 -->
			<view class="social-row">
				<view class="social-item" @tap="toFans('posts')">
					<text class="social-num">24</text>
					<text class="social-label">记录</text>
				</view>
				<view class="social-item" @tap="toFans('following')">
					<text class="social-num">138</text>
					<text class="social-label">关注</text>
				</view>
				<view class="social-item" @tap="toFans('followers')">
					<text class="social-num">2.1k</text>
					<text class="social-label">粉丝</text>
				</view>
				<view class="social-item">
					<text class="social-num">8.4k</text>
					<text class="social-label">获赞</text>
				</view>
				<view class="edit-btn" @tap="toEditProfile">
					<text class="edit-btn-text">编辑资料</text>
				</view>
			</view>

		</view>

		<!-- 内容 Tab -->
		<view class="content-tabs">
			<uni-segmented-control
				:current="activeTabIndex"
				:values="tabValues"
				style-type="text"
				active-color="#5B5BD6"
				@clickItem="onContentTabChange"
			/>
		</view>

		<!-- 内容区 -->
		<scroll-view class="content-scroll" scroll-y :show-scrollbar="false">

			<!-- 我的发布 — 烧榜记录 -->
			<view v-if="activeTab === 'posts'" class="burn-records">
				<view
					v-for="record in myBurnRecords"
					:key="record.id"
					class="record-card"
					@tap="toPost(record.id)"
				>
					<view class="rc-head">
						<view class="model-badge" :style="{ background: record.modelBg }">
							<view class="model-dot" :style="{ background: record.modelDot }" />
							<text class="model-badge-text">{{ record.model }}</text>
						</view>
						<text class="rc-time">{{ record.time }}</text>
						<view class="rc-mood" :style="{ color: record.moodColor }">
							<text class="rc-mood-text">{{ record.mood }}</text>
						</view>
					</view>
					<view class="rc-data">
						<text class="rc-cost">¥{{ record.cost }}</text>
						<text class="rc-tokens">{{ record.tokens }}</text>
					</view>
					<text class="rc-content line-2">{{ record.content }}</text>
					<view class="rc-foot">
						<text class="rc-stat">♥ {{ record.likes }}</text>
						<text class="rc-stat">😭 {{ record.resonates }} 共鸣</text>
						<text class="rc-stat">💬 {{ record.comments }}</text>
					</view>
				</view>
			</view>

			<!-- 我的收藏 -->
			<view v-else-if="activeTab === 'favorites'">
				<view class="fav-tabs">
					<uni-segmented-control
						:current="favTabIndex"
						:values="favTabValues"
						style-type="button"
						active-color="#5B5BD6"
						in-active-color="#EEF2FF"
						@clickItem="onFavTabChange"
					/>
				</view>

				<!-- 收藏的帖子 -->
				<view v-if="favTab === 'posts'" class="burn-records">
					<view
						v-for="record in favPosts"
						:key="record.id"
						class="record-card"
						@tap="toPost(record.id)"
					>
						<view class="rc-head">
							<view class="fav-av" :style="{ background: record.color }">
								<text class="fav-av-t">{{ record.author[0] }}</text>
							</view>
							<text class="fav-author">{{ record.author }}</text>
							<view class="model-badge" :style="{ background: record.modelBg }">
								<view class="model-dot" :style="{ background: record.modelDot }" />
								<text class="model-badge-text">{{ record.model }}</text>
							</view>
							<text class="rc-time">{{ record.time }}</text>
						</view>
						<view class="rc-data">
							<text class="rc-cost">¥{{ record.cost }}</text>
							<text class="rc-tokens">{{ record.tokens }}</text>
						</view>
						<text class="rc-content line-2">{{ record.content }}</text>
					</view>
				</view>

				<!-- 收藏的 Skill -->
				<view v-else class="fav-skills">
					<view
						v-for="skill in favSkills"
						:key="skill.id"
						class="fav-skill-card"
						@tap="toSkill(skill.id)"
					>
						<view class="fsk-icon">
							<text class="fsk-emoji">{{ skill.icon }}</text>
						</view>
						<view class="fsk-info">
							<text class="fsk-title">{{ skill.title }}</text>
							<text class="fsk-desc line-1">{{ skill.desc }}</text>
						</view>
						<view class="fsk-use-btn" @tap.stop="useSkill(skill)">
							<text class="fsk-use-text">使用</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 烧榜统计 -->
			<view v-else class="burn-stats">
				<view class="bstat-month-card">
					<text class="bstat-month-title">本月消费概览</text>
					<view class="bstat-total-row">
						<text class="bstat-total-label">总计花费</text>
						<text class="bstat-total-val">¥286.50</text>
					</view>
					<view class="bstat-breakdown">
						<view v-for="item in monthStats" :key="item.model" class="bstat-item">
							<view class="bstat-bar-wrap">
								<view class="bstat-bar" :style="{ width: item.pct + '%', background: item.color }" />
							</view>
							<view class="bstat-row">
								<text class="bstat-model">{{ item.model }}</text>
								<text class="bstat-amount">¥{{ item.amount }}</text>
							</view>
						</view>
					</view>
				</view>

				<view class="bstat-history-title">
					<text class="bstat-ht-text">历史记录</text>
				</view>
				<view class="burn-records">
					<view
						v-for="record in myBurnRecords"
						:key="record.id"
						class="record-card"
						@tap="toPost(record.id)"
					>
						<view class="rc-head">
							<view class="model-badge" :style="{ background: record.modelBg }">
								<view class="model-dot" :style="{ background: record.modelDot }" />
								<text class="model-badge-text">{{ record.model }}</text>
							</view>
							<text class="rc-time">{{ record.time }}</text>
							<text class="rc-cost-mini">¥{{ record.cost }}</text>
						</view>
						<text class="rc-content line-1">{{ record.content }}</text>
					</view>
				</view>
			</view>

			<view class="content-bottom" />
		</scroll-view>

		<tab-bar current="/pages/my/my" />
	</view>
</template>

<script setup lang="ts">
	import { useSysInfoStore } from '@/stores'

	const sysInfo = useSysInfoStore()
	const statusBarHeight = computed(() => (sysInfo.systemInfo as any).statusBarHeight || 44)

	const TABS = [
		{ key: 'posts', label: '我的记录' },
		{ key: 'favorites', label: '我的收藏' },
		{ key: 'stats', label: '烧榜统计' }
	]

	const FAV_TABS = [
		{ key: 'posts', label: '内容' },
		{ key: 'skills', label: 'Skill' }
	]

	const activeTab = ref('posts')
	const favTab = ref('posts')
	const tabValues = TABS.map((tab) => tab.label)
	const favTabValues = FAV_TABS.map((tab) => tab.label)
	const activeTabIndex = computed(() => {
		const currentIndex = TABS.findIndex((tab) => tab.key === activeTab.value)
		return currentIndex === -1 ? 0 : currentIndex
	})
	const favTabIndex = computed(() => {
		const currentIndex = FAV_TABS.findIndex((tab) => tab.key === favTab.value)
		return currentIndex === -1 ? 0 : currentIndex
	})

	const myBurnRecords = ref([
		{
			id: 'b1', model: 'Claude', modelBg: 'rgba(124,58,237,0.1)', modelDot: '#7C3AED',
			time: '今天', cost: '38.50', tokens: '120k tokens',
			mood: '值了✓', moodColor: '#059669',
			content: '用 Claude 做了一份完整竞品分析报告，换算下来比请助理便宜 10 倍。',
			likes: 238, resonates: 156, comments: 47
		},
		{
			id: 'b2', model: 'GPT-4o', modelBg: 'rgba(16,185,129,0.1)', modelDot: '#10B981',
			time: '昨天', cost: '52.00', tokens: '200k tokens',
			mood: '后悔了😭', moodColor: '#EF4444',
			content: '改了 8 轮方案，200k tokens 没了。最后客户说"还是用第一版吧"。',
			likes: 1287, resonates: 1043, comments: 267
		},
		{
			id: 'b3', model: 'Claude', modelBg: 'rgba(124,58,237,0.1)', modelDot: '#7C3AED',
			time: '3天前', cost: '19.00', tokens: '65k tokens',
			mood: '值了✓', moodColor: '#059669',
			content: '帮朋友写了份商业计划书，一个下午搞定，省了好几千的咨询费。',
			likes: 467, resonates: 312, comments: 54
		},
		{
			id: 'b4', model: 'DeepSeek', modelBg: 'rgba(37,99,235,0.1)', modelDot: '#2563EB',
			time: '上周', cost: '8.50', tokens: '280k tokens',
			mood: '值了✓', moodColor: '#059669',
			content: '试了试 DeepSeek，写代码真的挺快，价格比 Claude 便宜太多了。',
			likes: 234, resonates: 189, comments: 31
		}
	])

	const favPosts = ref([
		{
			id: 'fp1', author: '王建明', color: '#0891B2',
			model: 'GPT-4o', modelBg: 'rgba(16,185,129,0.1)', modelDot: '#10B981',
			time: '2天前', cost: '312', tokens: '多平台合计',
			content: '月底账单：GPT-4o $42、Claude $28、Gemini $8，合计近 600 块人民币。'
		},
		{
			id: 'fp2', author: '刘明远', color: '#DC2626',
			model: 'GPT-4o', modelBg: 'rgba(16,185,129,0.1)', modelDot: '#10B981',
			time: '昨天', cost: '89.00', tokens: '340k tokens',
			content: '测了 GPT-4o、Claude Sonnet、DeepSeek-V3 三个模型，结论有点反直觉。'
		}
	])

	const favSkills = ref([
		{ id: 's1', icon: '💰', title: 'Token 省钱大法', desc: '用最少的 token 数拿到最好的输出' },
		{ id: 's2', icon: '📊', title: 'AI 账单分析助手', desc: '帮你分析消费结构找出最贵的用法' },
		{ id: 's3', icon: '🔥', title: '烧榜 Prompt 模板', desc: '一次搞定减少无效 token 消耗' }
	])

	const monthStats = ref([
		{ model: 'Claude', amount: '168.50', pct: 59, color: '#7C3AED' },
		{ model: 'GPT-4o', amount: '89.00', pct: 31, color: '#10B981' },
		{ model: 'DeepSeek', amount: '21.50', pct: 8, color: '#2563EB' },
		{ model: 'Gemini', amount: '7.50', pct: 3, color: '#F59E0B' }
	])

	const useSkill = (_skill: any) => {
		uni.showToast({ title: '已复制 Skill 内容', icon: 'success' })
	}

	const toPost = (id: string) => {
		uni.navigateTo({ url: `/pages/detail/post?id=${id}` })
	}

	const toSkill = (id: string) => {
		uni.navigateTo({ url: `/pages/detail/skill?id=${id}` })
	}

	const toEditProfile = () => {
		uni.showToast({ title: '编辑资料功能开发中', icon: 'none' })
	}

	const toNotify = () => {
		uni.showToast({ title: '暂无新通知', icon: 'none' })
	}

	const toSetting = () => {
		uni.showToast({ title: '设置功能开发中', icon: 'none' })
	}

	const toFans = (_type: string) => {
		uni.showToast({ title: '功能开发中', icon: 'none' })
	}

	const changeAvatar = () => {
		uni.showToast({ title: '修改头像功能开发中', icon: 'none' })
	}

	const onContentTabChange = (e: { currentIndex: number }) => {
		activeTab.value = TABS[e.currentIndex]?.key ?? TABS[0].key
	}

	const onFavTabChange = (e: { currentIndex: number }) => {
		favTab.value = FAV_TABS[e.currentIndex]?.key ?? FAV_TABS[0].key
	}
</script>

<style lang="scss" scoped>
	.page {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: #F7F8FA;
	}

	/* 顶部 Profile 头 */
	.profile-header {
		background: linear-gradient(160deg, #1E1B4B 0%, #4C1D95 100%);
		padding-left: 28rpx;
		padding-right: 28rpx;
		padding-bottom: 28rpx;

		.header-actions {
			height: 88rpx;
			display: flex;
			align-items: center;
			justify-content: flex-end;
			gap: 8rpx;

			.header-btn {
				width: 68rpx;
				height: 68rpx;
				border-radius: 50%;
				background: rgba(255, 255, 255, 0.12);
				display: flex;
				align-items: center;
				justify-content: center;

				.header-icon { font-size: 34rpx; }
			}
		}

		.user-info {
			display: flex;
			align-items: center;
			gap: 20rpx;
			margin-bottom: 24rpx;

			.av-wrap {
				position: relative;
				flex-shrink: 0;

				.av {
					width: 110rpx;
					height: 110rpx;
					border-radius: 50%;
					border: 3rpx solid rgba(255, 255, 255, 0.4);
					display: flex;
					align-items: center;
					justify-content: center;

					.av-text {
						font-size: 44rpx;
						color: #fff;
						font-weight: 700;
					}
				}

				.av-edit-dot {
					position: absolute;
					bottom: 0;
					right: 0;
					width: 34rpx;
					height: 34rpx;
					border-radius: 50%;
					background: #FBBF24;
					display: flex;
					align-items: center;
					justify-content: center;

					.av-edit-icon {
						font-size: 17rpx;
						color: #1A1A2E;
					}
				}
			}

			.user-meta {
				flex: 1;

				.user-name {
					display: block;
					font-size: 36rpx;
					font-weight: 700;
					color: #fff;
					margin-bottom: 8rpx;
				}

				.user-bio {
					font-size: 23rpx;
					color: rgba(255, 255, 255, 0.65);
					line-height: 1.5;
				}
			}
		}

		/* 本月烧榜摘要 */
		.burn-summary {
			display: flex;
			align-items: center;
			background: rgba(239, 68, 68, 0.15);
			border: 1rpx solid rgba(239, 68, 68, 0.25);
			border-radius: 18rpx;
			padding: 18rpx 0;
			margin-bottom: 20rpx;

			.bs-item {
				flex: 1;
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 6rpx;

				.bs-label {
					font-size: 21rpx;
					color: rgba(255, 255, 255, 0.55);
				}

				.bs-value {
					font-size: 30rpx;
					font-weight: 700;
					color: #fff;

					&.red { color: #FCA5A5; }
				}
			}

			.bs-divider {
				width: 1rpx;
				height: 44rpx;
				background: rgba(255, 255, 255, 0.15);
			}
		}

		/* 社交数据行 */
		.social-row {
			display: flex;
			align-items: center;
			gap: 0;

			.social-item {
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 4rpx;
				padding: 0 20rpx 0 0;

				.social-num {
					font-size: 30rpx;
					font-weight: 700;
					color: #fff;
				}

				.social-label {
					font-size: 20rpx;
					color: rgba(255, 255, 255, 0.6);
				}
			}

			.edit-btn {
				margin-left: auto;
				background: rgba(255, 255, 255, 0.15);
				border: 1rpx solid rgba(255, 255, 255, 0.3);
				border-radius: 30rpx;
				padding: 14rpx 28rpx;

				.edit-btn-text {
					font-size: 24rpx;
					color: #fff;
				}
			}
		}
	}

	/* Tab */
	.content-tabs {
		background: #fff;
		padding: 8rpx 16rpx 10rpx;
		border-bottom: 1rpx solid #F3F4F6;
		flex-shrink: 0;

		:deep(.segmented-control) {
			height: auto;
		}

		:deep(.segmented-control__item) {
			padding: 10rpx 0;
		}

		:deep(.segmented-control__text) {
			font-size: 28rpx;
		}

		:deep(.segmented-control__item--text) {
			padding: 8rpx 0 14rpx;
		}
	}

	.content-scroll {
		flex: 1;
		overflow: hidden;

		.content-bottom { height: calc(160rpx + env(safe-area-inset-bottom)); }
	}

	/* 烧榜记录列表 */
	.burn-records {
		padding: 16rpx 20rpx;
		display: flex;
		flex-direction: column;
		gap: 12rpx;

		.record-card {
			background: #fff;
			border-radius: 18rpx;
			padding: 20rpx;
			box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
			display: flex;
			flex-direction: column;
			gap: 12rpx;

			.rc-head {
				display: flex;
				align-items: center;
				gap: 10rpx;

				.model-badge {
					display: flex;
					align-items: center;
					gap: 6rpx;
					padding: 5rpx 14rpx;
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

				.rc-time {
					font-size: 22rpx;
					color: #9CA3AF;
					flex: 1;
				}

				.rc-mood {
					font-size: 21rpx;
					font-weight: 500;
				}

				.rc-cost-mini {
					font-size: 26rpx;
					font-weight: 700;
					color: #EF4444;
				}

				.fav-av {
					width: 40rpx;
					height: 40rpx;
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;
					flex-shrink: 0;

					.fav-av-t {
						font-size: 18rpx;
						color: #fff;
						font-weight: 700;
					}
				}

				.fav-author {
					font-size: 24rpx;
					color: #374151;
					font-weight: 500;
				}
			}

			.rc-data {
				display: flex;
				align-items: baseline;
				gap: 14rpx;

				.rc-cost {
					font-size: 40rpx;
					font-weight: 900;
					color: #EF4444;
					letter-spacing: -1rpx;
				}

				.rc-tokens {
					font-size: 24rpx;
					color: #F59E0B;
					font-weight: 600;
				}
			}

			.rc-content {
				font-size: 26rpx;
				color: #374151;
				line-height: 1.6;
				display: block;
			}

			.rc-foot {
				display: flex;
				align-items: center;
				gap: 24rpx;
				padding-top: 10rpx;
				border-top: 1rpx solid #F3F4F6;

				.rc-stat {
					font-size: 22rpx;
					color: #9CA3AF;
				}
			}
		}
	}

	/* 收藏 tab */
	.fav-tabs {
		padding: 16rpx 20rpx 0;

		:deep(.segmented-control) {
			height: 64rpx;
			border-radius: 18rpx;
			overflow: hidden;
		}

		:deep(.segmented-control__item) {
			border-radius: 18rpx;
		}

		:deep(.segmented-control__text) {
			font-size: 26rpx;
		}

		:deep(.segmented-control__item--button) {
			border-color: #EEF2FF !important;
		}
	}

	.fav-skills {
		padding: 16rpx 20rpx;
		display: flex;
		flex-direction: column;
		gap: 12rpx;

		.fav-skill-card {
			background: #fff;
			border-radius: 16rpx;
			padding: 20rpx;
			display: flex;
			align-items: center;
			gap: 16rpx;
			box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);

			.fsk-icon {
				width: 72rpx;
				height: 72rpx;
				background: #F0F0FD;
				border-radius: 16rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				flex-shrink: 0;

				.fsk-emoji { font-size: 36rpx; }
			}

			.fsk-info {
				flex: 1;

				.fsk-title {
					display: block;
					font-size: 28rpx;
					font-weight: 600;
					color: #1A1A2E;
					margin-bottom: 6rpx;
				}

				.fsk-desc { font-size: 22rpx; color: #9CA3AF; }
			}

			.fsk-use-btn {
				background: #5B5BD6;
				padding: 10rpx 24rpx;
				border-radius: 30rpx;
				flex-shrink: 0;

				.fsk-use-text {
					font-size: 22rpx;
					color: #fff;
					font-weight: 500;
				}
			}
		}
	}

	/* 烧榜统计 */
	.burn-stats {
		padding: 16rpx 20rpx;

		.bstat-month-card {
			background: #fff;
			border-radius: 20rpx;
			padding: 24rpx;
			margin-bottom: 20rpx;
			box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);

			.bstat-month-title {
				display: block;
				font-size: 26rpx;
				font-weight: 700;
				color: #1A1A2E;
				margin-bottom: 16rpx;
			}

			.bstat-total-row {
				display: flex;
				align-items: baseline;
				gap: 14rpx;
				margin-bottom: 24rpx;

				.bstat-total-label {
					font-size: 24rpx;
					color: #9CA3AF;
				}

				.bstat-total-val {
					font-size: 48rpx;
					font-weight: 900;
					color: #EF4444;
					letter-spacing: -1rpx;
				}
			}

			.bstat-breakdown {
				display: flex;
				flex-direction: column;
				gap: 14rpx;

				.bstat-item {
					display: flex;
					flex-direction: column;
					gap: 6rpx;

					.bstat-bar-wrap {
						height: 8rpx;
						background: #F3F4F6;
						border-radius: 4rpx;
						overflow: hidden;

						.bstat-bar {
							height: 100%;
							border-radius: 4rpx;
						}
					}

					.bstat-row {
						display: flex;
						justify-content: space-between;

						.bstat-model {
							font-size: 23rpx;
							color: #6B7280;
						}

						.bstat-amount {
							font-size: 23rpx;
							color: #374151;
							font-weight: 600;
						}
					}
				}
			}
		}

		.bstat-history-title {
			padding: 0 4rpx 12rpx;

			.bstat-ht-text {
				font-size: 26rpx;
				font-weight: 700;
				color: #1A1A2E;
			}
		}
	}

	/* 多行省略 */
	.line-1 {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.line-2 {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
	}
</style>
