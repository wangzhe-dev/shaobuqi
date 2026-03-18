<template>
	<view class="page">

		<!-- 顶部 Hero -->
		<view class="profile-hero" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="back-btn" @tap="goBack">
				<text class="back-icon">←</text>
			</view>

			<!-- 渐变封面 -->
			<view class="cover-bg" />

			<!-- 头像 + 关注按钮 -->
			<view class="hero-bottom">
				<view class="av-wrap">
					<view class="av" :style="{ background: author.color }">
						<text class="av-t">{{ author.name[0] }}</text>
					</view>
				</view>
				<view class="follow-btn" :class="{ following: isFollowing }" @tap="toggleFollow">
					<text class="follow-text">{{ isFollowing ? '✓ 已关注' : '+ 关注' }}</text>
				</view>
			</view>
		</view>

		<!-- 用户信息 -->
		<view class="user-info">
			<text class="user-name">{{ author.name }}</text>
			<text class="user-bio">{{ author.bio }}</text>
			<view class="user-tags">
				<view v-for="tag in author.tags" :key="tag" class="user-tag">
					<text class="user-tag-text">{{ tag }}</text>
				</view>
			</view>
		</view>

		<!-- 数据统计 -->
		<view class="stats-row">
			<view class="stat-item">
				<text class="stat-n orange">{{ author.totalCopies }}</text>
				<text class="stat-l">被复制</text>
			</view>
			<view class="stat-div" />
			<view class="stat-item">
				<text class="stat-n">{{ author.skillCount }}</text>
				<text class="stat-l">Skill</text>
			</view>
			<view class="stat-div" />
			<view class="stat-item">
				<text class="stat-n green">{{ author.avgSuccessRate }}</text>
				<text class="stat-l">平均复现率</text>
			</view>
			<view class="stat-div" />
			<view class="stat-item">
				<text class="stat-n">{{ author.followers }}</text>
				<text class="stat-l">粉丝</text>
			</view>
		</view>

		<!-- 内容 Tab -->
		<view class="content-tabs">
			<view
				v-for="tab in TABS"
				:key="tab.key"
				class="ct-tab"
				:class="{ active: activeTab === tab.key }"
				@tap="activeTab = tab.key"
			>
				<text class="ct-tab-text">{{ tab.label }}</text>
			</view>
		</view>

		<!-- 内容列表 -->
		<scroll-view class="content-scroll" scroll-y :show-scrollbar="false">

			<!-- Skill 列表 -->
			<view v-if="activeTab === 'skills'" class="skills-list">
				<view
					v-for="skill in authorSkills"
					:key="skill.id"
					class="skill-card"
					@tap="toSkill(skill.id)"
				>
					<view class="sc-head">
						<view class="sc-scene">{{ skill.scene }}</view>
						<text class="sc-time">{{ skill.time }}</text>
					</view>
					<text class="sc-title">{{ skill.title }}</text>
					<view class="sc-meta">
						<text class="sc-token orange">⚡ {{ skill.avgToken }}</text>
						<text class="sc-rate green">{{ skill.successRate }} 复现</text>
						<text class="sc-copies">{{ skill.copyCount }} 复制</text>
					</view>
					<view class="sc-copy-btn" @tap.stop="copySkill(skill)">
						<text class="sc-copy-text">复制 Skill</text>
					</view>
				</view>
			</view>

			<!-- 反馈列表 -->
			<view v-else-if="activeTab === 'feedbacks'" class="feedbacks-list">
				<view v-for="fb in authorFeedbacks" :key="fb.id" class="fb-card">
					<view class="fb-head">
						<text class="fb-skill">{{ fb.skillTitle }}</text>
						<view class="fb-status" :class="'status-' + fb.status">
							<text class="fb-status-text">{{ fb.status === 'success' ? '✅ 成功' : '🆗 一般' }}</text>
						</view>
					</view>
					<view class="fb-tokens">
						<text class="fb-model">{{ fb.model }}</text>
						<text class="fb-token orange">⚡ {{ fb.totalToken }}</text>
					</view>
					<text class="fb-comment">{{ fb.comment }}</text>
				</view>
			</view>

			<view class="scroll-bottom" />
		</scroll-view>

	</view>
</template>

<script setup lang="ts">
	import { useSysInfoStore } from '@/stores'

	const sysInfo = useSysInfoStore()
	const statusBarHeight = computed(() => (sysInfo.systemInfo as any).statusBarHeight || 44)

	const TABS = [
		{ key: 'skills', label: 'Skill' },
		{ key: 'feedbacks', label: '反馈' }
	]

	const isFollowing = ref(false)
	const activeTab = ref('skills')

	const author = reactive({
		name: '林小雨',
		color: '#7C3AED',
		bio: '专注AI写作提效，分享经过验证的高复现率Skill',
		tags: ['写作', '自媒体', 'AI效率'],
		totalCopies: '8.4k',
		skillCount: '23',
		avgSuccessRate: '91%',
		followers: '2.4k'
	})

	const authorSkills = ref([
		{
			id: 's1', title: '万能长文写作框架', scene: '写作', time: '2天前',
			avgToken: '3.2k', successRate: '94%', copyCount: '1.2k'
		},
		{
			id: 's2', title: '爆款自媒体选题生成', scene: '自媒体', time: '5天前',
			avgToken: '1.8k', successRate: '87%', copyCount: '890'
		},
		{
			id: 's3', title: '极简翻译润色器', scene: '写作', time: '2周前',
			avgToken: '800', successRate: '96%', copyCount: '5.2k'
		}
	])

	const authorFeedbacks = ref([
		{
			id: 'f1', skillTitle: '万能长文写作框架',
			model: 'Claude Sonnet', totalToken: '3.4k',
			status: 'success', comment: '完全按步骤来，一次成功！输出结构非常清晰。'
		},
		{
			id: 'f2', skillTitle: '极简翻译润色器',
			model: 'DeepSeek', totalToken: '0.9k',
			status: 'success', comment: '极低消耗，效果很好，是目前最省的翻译方案之一。'
		}
	])

	const copySkill = (_skill: any) => {
		uni.showToast({ title: '已复制 Skill', icon: 'success' })
	}

	const toSkill = (id: string) => {
		uni.navigateTo({ url: `/pages/detail/skill?id=${id}` })
	}

	const toggleFollow = () => {
		isFollowing.value = !isFollowing.value
		uni.showToast({ title: isFollowing.value ? '已关注' : '已取消关注', icon: 'none' })
	}

	const goBack = () => {
		uni.navigateBack()
	}
</script>

<style lang="scss" scoped>
	.page {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: #F5F3EF;
	}

	/* 顶部 Hero */
	.profile-hero {
		position: relative;
		flex-shrink: 0;

		.back-btn {
			position: absolute;
			top: 0;
			left: 20rpx;
			z-index: 20;
			margin-top: 16rpx;
			width: 72rpx;
			height: 72rpx;
			border-radius: 50%;
			background: rgba(0,0,0,0.4);
			display: flex;
			align-items: center;
			justify-content: center;

			.back-icon { font-size: 34rpx; color: #fff; }
		}

		.cover-bg {
			width: 100%;
			height: 280rpx;
			background: linear-gradient(160deg, #1A1025 0%, #2D1B69 50%, #141922 100%);
		}

		.hero-bottom {
			display: flex;
			align-items: flex-end;
			justify-content: space-between;
			padding: 0 28rpx 20rpx;
			margin-top: -60rpx;

			.av-wrap {
				.av {
					width: 120rpx;
					height: 120rpx;
					border-radius: 50%;
					border: 4rpx solid #0B0D12;
					display: flex;
					align-items: center;
					justify-content: center;
					box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.4);

					.av-t { font-size: 48rpx; color: #fff; font-weight: 700; }
				}
			}

			.follow-btn {
				background: linear-gradient(135deg, #FF7A1A 0%, #E05A00 100%);
				border-radius: 100rpx;
				padding: 18rpx 40rpx;
				box-shadow: 0 4rpx 16rpx rgba(255,122,26,0.3);

				.follow-text { font-size: 26rpx; color: #fff; font-weight: 600; }

				&.following {
					background: rgba(0,0,0,0.07);
					box-shadow: none;
					border: 1rpx solid rgba(0,0,0,0.10);

					.follow-text { color: rgba(0,0,0,0.50); }
				}
			}
		}
	}

	/* 用户信息 */
	.user-info {
		padding: 4rpx 28rpx 20rpx;
		background: #FFFFFF;
		border-bottom: 1rpx solid rgba(0,0,0,0.06);

		.user-name { display: block; font-size: 36rpx; font-weight: 800; color: #1A1A1A; margin-bottom: 10rpx; }
		.user-bio { display: block; font-size: 24rpx; color: rgba(0,0,0,0.50); line-height: 1.6; margin-bottom: 14rpx; }

		.user-tags {
			display: flex;
			flex-wrap: wrap;
			gap: 10rpx;

			.user-tag {
				font-size: 18rpx;
				color: rgba(0,0,0,0.40);
				background: rgba(0,0,0,0.06);
				padding: 5rpx 16rpx;
				border-radius: 8rpx;

				.user-tag-text {}
			}
		}
	}

	/* 数据统计 */
	.stats-row {
		display: flex;
		align-items: center;
		background: #FFFFFF;
		border-bottom: 1rpx solid rgba(0,0,0,0.06);
		padding: 20rpx 0;
		margin-bottom: 0;

		.stat-item {
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 4rpx;

			.stat-n { font-size: 30rpx; font-weight: 800; color: #1A1A1A; }
			.stat-n.orange { color: #FF7A1A; }
			.stat-n.green { color: #4CD964; }
			.stat-l { font-size: 20rpx; color: rgba(0,0,0,0.40); }
		}

		.stat-div {
			width: 1rpx;
			height: 40rpx;
			background: rgba(0,0,0,0.07);
		}
	}

	/* 内容 Tab */
	.content-tabs {
		display: flex;
		background: #FFFFFF;
		border-bottom: 1rpx solid rgba(0,0,0,0.05);
		flex-shrink: 0;

		.ct-tab {
			flex: 1;
			padding: 20rpx 0 18rpx;
			display: flex;
			justify-content: center;
			position: relative;

			.ct-tab-text { font-size: 26rpx; color: rgba(0,0,0,0.40); font-weight: 500; }

			&.active {
				.ct-tab-text { color: #FF7A1A; font-weight: 700; }

				&::after {
					content: '';
					position: absolute;
					bottom: 0;
					left: 50%;
					transform: translateX(-50%);
					width: 40rpx;
					height: 4rpx;
					background: #FF7A1A;
					border-radius: 999rpx;
				}
			}
		}
	}

	/* 内容 */
	.content-scroll {
		flex: 1;
		overflow: hidden;
		background: #F5F3EF;

		.scroll-bottom { height: 40rpx; }
	}

	/* Skill 列表 */
	.skills-list {
		padding: 20rpx 24rpx;
		display: flex;
		flex-direction: column;
		gap: 16rpx;

		.skill-card {
			background: #FFFFFF;
			border-radius: 24rpx;
			border: 1rpx solid rgba(0,0,0,0.07);
			padding: 24rpx;

			&:active { background: #F0EDE8; }

			.sc-head {
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin-bottom: 12rpx;

				.sc-scene {
					font-size: 18rpx;
					color: rgba(0,0,0,0.40);
					background: rgba(0,0,0,0.06);
					padding: 4rpx 12rpx;
					border-radius: 6rpx;
				}

				.sc-time { font-size: 20rpx; color: rgba(0,0,0,0.35); }
			}

			.sc-title {
				display: block;
				font-size: 28rpx;
				font-weight: 700;
				color: #1A1A1A;
				margin-bottom: 14rpx;
			}

			.sc-meta {
				display: flex;
				gap: 20rpx;
				margin-bottom: 16rpx;

				.sc-token { font-size: 22rpx; font-weight: 600; }
				.orange { color: #FF7A1A; }
				.sc-rate { font-size: 22rpx; font-weight: 600; }
				.green { color: #4CD964; }
				.sc-copies { font-size: 22rpx; color: rgba(0,0,0,0.40); }
			}

			.sc-copy-btn {
				width: 100%;
				height: 72rpx;
				background: linear-gradient(135deg, #FF7A1A 0%, #E05A00 100%);
				border-radius: 16rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				box-shadow: 0 4rpx 16rpx rgba(255,122,26,0.25);

				.sc-copy-text { font-size: 26rpx; font-weight: 700; color: #fff; }
			}
		}
	}

	/* 反馈列表 */
	.feedbacks-list {
		padding: 20rpx 24rpx;
		display: flex;
		flex-direction: column;
		gap: 16rpx;

		.fb-card {
			background: #FFFFFF;
			border-radius: 24rpx;
			border: 1rpx solid rgba(0,0,0,0.07);
			padding: 24rpx;

			.fb-head {
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin-bottom: 12rpx;

				.fb-skill { font-size: 24rpx; font-weight: 600; color: rgba(0,0,0,0.70); flex: 1; }

				.fb-status {
					font-size: 20rpx;
					padding: 4rpx 14rpx;
					border-radius: 100rpx;

					&.status-success { color: #4CD964; background: rgba(76,217,100,0.12); }
					&.status-normal { color: #5DA9FF; background: rgba(93,169,255,0.12); }

					.fb-status-text { font-weight: 600; }
				}
			}

			.fb-tokens {
				display: flex;
				align-items: center;
				gap: 16rpx;
				margin-bottom: 12rpx;

				.fb-model { font-size: 20rpx; color: rgba(0,0,0,0.40); }
				.fb-token { font-size: 22rpx; font-weight: 600; }
				.orange { color: #FF7A1A; }
			}

			.fb-comment { font-size: 24rpx; color: rgba(0,0,0,0.60); line-height: 1.6; }
		}
	}
</style>
