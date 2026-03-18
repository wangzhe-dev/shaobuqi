<template>
	<view class="page">

		<!-- 顶部 Profile 头 -->
		<view class="profile-header" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="ph-inner">
				<view class="ph-avatar-wrap">
					<view class="ph-avatar">
						<text class="ph-avatar-t">林</text>
					</view>
					<view class="ph-avatar-badge">Lv.4</view>
				</view>
				<view class="ph-info">
					<text class="ph-name">林小雨</text>
					<text class="ph-bio">不断验证Skill，不断分享经验</text>
					<view class="ph-tags">
						<view class="ph-tag">写作</view>
						<view class="ph-tag">自媒体</view>
					</view>
				</view>
				<view class="ph-edit-btn" @tap="editProfile">
					<uni-icons class="ph-edit-icon" type="compose" size="18" color="rgba(255,255,255,0.88)" />
				</view>
			</view>

			<!-- 数据摘要 -->
			<view class="ph-stats">
				<view class="ph-stat-item">
					<text class="ph-stat-val">23</text>
					<text class="ph-stat-label">发布 Skill</text>
				</view>
				<view class="ph-stat-div" />
				<view class="ph-stat-item">
					<text class="ph-stat-val orange">8.4k</text>
					<text class="ph-stat-label">被复制</text>
				</view>
				<view class="ph-stat-div" />
				<view class="ph-stat-item">
					<text class="ph-stat-val">3.1k</text>
					<text class="ph-stat-label">被收藏</text>
				</view>
				<view class="ph-stat-div" />
				<view class="ph-stat-item">
					<text class="ph-stat-val green">91%</text>
					<text class="ph-stat-label">平均复现率</text>
				</view>
			</view>
		</view>

		<!-- 功能导航网格 -->
		<view class="func-section">
			<view class="func-grid">
				<view
					v-for="item in funcItems"
					:key="item.label"
					class="func-item"
					@tap="item.action"
				>
					<uni-icons class="func-icon" :type="item.icon" :color="item.color" size="22" />
					<text class="func-label">{{ item.label }}</text>
					<view v-if="item.count" class="func-count">
						<text class="func-count-text">{{ item.count }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 最近发布的 Skill -->
		<view class="section-head">
			<text class="sh-title">最近发布</text>
			<text class="sh-more" @tap="toMyPublish">全部 ›</text>
		</view>
		<scroll-view class="my-scroll" scroll-y :show-scrollbar="false">
			<view class="my-skills-list">
				<view
					v-for="skill in mySkills"
					:key="skill.id"
					class="my-skill-card"
					@tap="toSkill(skill.id)"
				>
					<view class="msc-head">
						<view class="msc-scene-tag">{{ skill.scene }}</view>
						<text class="msc-time">{{ skill.time }}</text>
					</view>
					<text class="msc-title">{{ skill.title }}</text>
					<view class="msc-stats">
						<view class="msc-stat">
							<text class="msc-stat-val orange">{{ skill.copyCount }}</text>
							<text class="msc-stat-label">复制</text>
						</view>
						<view class="msc-stat">
							<text class="msc-stat-val">{{ skill.favoriteCount }}</text>
							<text class="msc-stat-label">收藏</text>
						</view>
						<view class="msc-stat">
							<text class="msc-stat-val green">{{ skill.successRate }}</text>
							<text class="msc-stat-label">复现率</text>
						</view>
						<view class="msc-stat">
							<text class="msc-stat-val blue">{{ skill.feedbackCount }}</text>
							<text class="msc-stat-label">反馈</text>
						</view>
					</view>
				</view>
			</view>

			<view class="list-bottom" />
		</scroll-view>

	</view>
</template>

<script setup lang="ts">
	import { getCurrentInstance } from 'vue'
	import { useSysInfoStore } from '@/stores'

	const instance = getCurrentInstance()
	onShow(() => {
		uni.getTabBar(instance?.proxy)?.setData({ selected: 4 })
	})

	const sysInfo = useSysInfoStore()
	const statusBarHeight = computed(() => (sysInfo.systemInfo as any).statusBarHeight || 44)

	const funcItems = [
		{
			icon: 'list', color: '#5E738A', label: '我的发布', count: '23',
			action: () => toMyPublish()
		},
		{
			icon: 'star-filled', color: '#D6943A', label: '我的收藏', count: '47',
			action: () => toMyFavorites()
		},
		{
			icon: 'fire-filled', color: '#E45C1A', label: '我的复制', count: '128',
			action: () => toMyCopies()
		},
		{
			icon: 'chatbubble-filled', color: '#2F8A57', label: '我的反馈', count: '15',
			action: () => toMyFeedbacks()
		},
		{
			icon: 'folder-add-filled', color: '#7B5B3C', label: '草稿箱', count: '2',
			action: () => toDrafts()
		},
		{
			icon: 'settings-filled', color: 'rgba(0,0,0,0.55)', label: '设置', count: null,
			action: () => toSettings()
		}
	]

	const mySkills = ref([
		{
			id: 's1', title: '万能长文写作框架', scene: '写作', time: '2天前',
			copyCount: '1.2k', favoriteCount: '312', successRate: '94%', feedbackCount: '43'
		},
		{
			id: 's2', title: '爆款自媒体选题生成', scene: '自媒体', time: '5天前',
			copyCount: '890', favoriteCount: '234', successRate: '87%', feedbackCount: '31'
		},
		{
			id: 's3', title: '极简翻译润色器', scene: '写作', time: '2周前',
			copyCount: '5.2k', favoriteCount: '1.8k', successRate: '96%', feedbackCount: '128'
		}
	])

	const toSkill = (id: string) => {
		uni.navigateTo({ url: `/pages/detail/skill?id=${id}` })
	}

	const toMyPublish = () => uni.showToast({ title: '我的发布开发中', icon: 'none' })
	const toMyFavorites = () => uni.showToast({ title: '我的收藏开发中', icon: 'none' })
	const toMyCopies = () => uni.showToast({ title: '我的复制开发中', icon: 'none' })
	const toMyFeedbacks = () => uni.showToast({ title: '我的反馈开发中', icon: 'none' })
	const toDrafts = () => uni.showToast({ title: '草稿箱开发中', icon: 'none' })
	const toSettings = () => uni.showToast({ title: '设置开发中', icon: 'none' })
	const editProfile = () => uni.showToast({ title: '编辑资料开发中', icon: 'none' })
</script>

<style lang="scss" scoped>
	.page {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: #FFFFFF;
	}

	/* Profile 头 */
	.profile-header {
		background: linear-gradient(160deg, #191D23 0%, #1E2228 60%, #191D23 100%);
		border-bottom: 1rpx solid rgba(0,0,0,0.07);
		padding-bottom: 0;
		flex-shrink: 0;

		.ph-inner {
			display: flex;
			align-items: flex-start;
			gap: 20rpx;
			padding: 28rpx 24rpx 24rpx;
		}

		.ph-avatar-wrap {
			position: relative;
			flex-shrink: 0;

			.ph-avatar {
				width: 120rpx;
				height: 120rpx;
				border-radius: 50%;
				background: #D6943A;
				display: flex;
				align-items: center;
				justify-content: center;
				box-shadow: 0 8rpx 24rpx rgba(214, 148, 58,0.4);
				border: 3rpx solid rgba(228, 92, 26, 0.18);

				.ph-avatar-t { font-size: 48rpx; color: #fff; font-weight: 800; }
			}

			.ph-avatar-badge {
				position: absolute;
				bottom: -4rpx;
				right: -4rpx;
				font-size: 18rpx;
				font-weight: 700;
				color: #E45C1A;
				background: #FFFFFF;
				border: 2rpx solid rgba(228, 92, 26, 0.24);
				padding: 3rpx 10rpx;
				border-radius: 100rpx;
			}
		}

		.ph-info {
			flex: 1;
			padding-top: 4rpx;

			.ph-name { display: block; font-size: 36rpx; font-weight: 800; color: #1A1A1A; margin-bottom: 8rpx; }
			.ph-bio { display: block; font-size: 24rpx; color: rgba(0,0,0,0.50); line-height: 1.5; margin-bottom: 14rpx; }

			.ph-tags {
				display: flex;
				gap: 10rpx;

				.ph-tag {
					font-size: 18rpx;
					color: rgba(0,0,0,0.40);
					background: rgba(0,0,0,0.06);
					padding: 4rpx 14rpx;
					border-radius: 8rpx;
				}
			}
		}

		.ph-edit-btn {
			width: 64rpx;
			height: 64rpx;
			background: rgba(0,0,0,0.06);
			border-radius: 20rpx;
			display: flex;
			align-items: center;
			justify-content: center;

			.ph-edit-icon {
				width: 30rpx;
				height: 30rpx;
				display: flex;
				align-items: center;
				justify-content: center;
			}
		}

		.ph-stats {
			display: flex;
			align-items: center;
			padding: 24rpx 0;
			margin: 0 24rpx;
			border-top: 1rpx solid rgba(0,0,0,0.06);

			.ph-stat-item {
				flex: 1;
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 6rpx;

				.ph-stat-val { font-size: 34rpx; font-weight: 900; color: #1A1A1A; }
				.ph-stat-val.orange { color: #E45C1A; }
				.ph-stat-val.green { color: #2F8A57; }
				.ph-stat-label { font-size: 20rpx; color: rgba(0,0,0,0.40); }
			}

			.ph-stat-div {
				width: 1rpx;
				height: 40rpx;
				background: rgba(0,0,0,0.07);
			}
		}
	}

	/* 功能网格 */
	.func-section {
		padding: 20rpx 24rpx;
		flex-shrink: 0;

		.func-grid {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			gap: 16rpx;

			.func-item {
				background: #FFFFFF;
				border-radius: 20rpx;
				border: 1rpx solid rgba(0,0,0,0.07);
				padding: 24rpx 16rpx;
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 10rpx;
				position: relative;

				&:active { background: #F5F7FA; }

				.func-icon {
					width: 44rpx;
					height: 44rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					flex-shrink: 0;
				}
				.func-label { font-size: 22rpx; color: rgba(0,0,0,0.60); font-weight: 500; }

				.func-count {
					position: absolute;
					top: 12rpx;
					right: 14rpx;
					background: rgba(228, 92, 26,0.2);
					border-radius: 100rpx;
					padding: 2rpx 10rpx;

					.func-count-text { font-size: 18rpx; color: #E45C1A; font-weight: 600; }
				}
			}
		}
	}

	/* 最近发布 */
	.section-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8rpx 24rpx 16rpx;
		flex-shrink: 0;

		.sh-title { font-size: 28rpx; font-weight: 700; color: #1A1A1A; }
		.sh-more { font-size: 24rpx; color: rgba(0,0,0,0.40); }
	}

	.my-scroll { flex: 1; overflow: hidden; }

	.my-skills-list {
		padding: 0 24rpx;
		display: flex;
		flex-direction: column;
		gap: 16rpx;

		.my-skill-card {
			background: #FFFFFF;
			border-radius: 24rpx;
			border: 1rpx solid rgba(0,0,0,0.07);
			padding: 24rpx 28rpx;

			&:active { background: #F5F7FA; }

			.msc-head {
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin-bottom: 14rpx;

				.msc-scene-tag {
					font-size: 18rpx;
					color: rgba(0,0,0,0.40);
					background: rgba(0,0,0,0.06);
					padding: 4rpx 12rpx;
					border-radius: 6rpx;
				}

				.msc-time { font-size: 20rpx; color: rgba(0,0,0,0.35); }
			}

			.msc-title {
				display: block;
				font-size: 28rpx;
				font-weight: 700;
				color: #1A1A1A;
				margin-bottom: 18rpx;
				line-height: 1.35;
			}

			.msc-stats {
				display: flex;
				align-items: center;
				gap: 0;

				.msc-stat {
					flex: 1;
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: 4rpx;
					padding: 12rpx 0;
					background: rgba(0,0,0,0.02);
					border-radius: 12rpx;

					& + .msc-stat { margin-left: 10rpx; }

					.msc-stat-val { font-size: 26rpx; font-weight: 700; color: #1A1A1A; }
					.msc-stat-val.orange { color: #E45C1A; }
					.msc-stat-val.green { color: #2F8A57; }
					.msc-stat-val.blue { color: #5E738A; }
					.msc-stat-label { font-size: 18rpx; color: rgba(0,0,0,0.35); }
				}
			}
		}
	}

	.list-bottom { height: calc(160rpx + env(safe-area-inset-bottom)); }
</style>
