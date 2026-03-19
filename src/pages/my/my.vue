<template>
	<scroll-view class="page" scroll-y :show-scrollbar="false">

		<!-- ── Profile ── -->
		<view class="profile-card" :style="profileCardStyle">
			<view class="pc-row">
				<view class="avatar-wrap">
					<view class="avatar"><text class="avatar-t">林</text></view>
					<view class="lv-badge">Lv.4</view>
				</view>
				<view class="pc-info">
					<text class="pc-name">林小雨</text>
					<text class="pc-bio">不断验证Skill，不断分享经验</text>
					<view class="pc-tags">
						<text class="pc-tag">写作</text>
						<text class="pc-tag">自媒体</text>
					</view>
				</view>
				<view class="edit-btn" @tap="editProfile">
					<uni-icons type="compose" size="17" color="#9CA3AF" />
				</view>
			</view>

			<view class="stats-bar">
				<view class="stat-item">
					<text class="sv">23</text>
					<text class="sl">发布 Skill</text>
				</view>
				<view class="stat-div" />
				<view class="stat-item">
					<text class="sv orange">8.4k</text>
					<text class="sl">被复制</text>
				</view>
				<view class="stat-div" />
				<view class="stat-item">
					<text class="sv green">91%</text>
					<text class="sl">平均复现率</text>
				</view>
			</view>
		</view>

		<!-- ── 我的 Skill ── -->
		<view class="section">
			<view class="section-hd">
				<text class="sh-title">我发布的 Skill</text>
				<text class="sh-more" @tap="toAllSkills">全部 ›</text>
			</view>
			<view class="skill-list">
				<view
					v-for="skill in mySkills"
					:key="skill.id"
					class="skill-card"
					@tap="toSkill(skill.id)"
				>
					<view class="sc-top">
						<view class="scene-tag">{{ skill.scene }}</view>
						<text class="sc-time">{{ skill.time }}</text>
					</view>
					<text class="sc-title">{{ skill.title }}</text>
					<view class="sc-stats">
						<view class="sc-stat">
							<text class="ss-val orange">{{ skill.copyCount }}</text>
							<text class="ss-lab">复制</text>
						</view>
						<view class="sc-stat">
							<text class="ss-val">{{ skill.favoriteCount }}</text>
							<text class="ss-lab">收藏</text>
						</view>
						<view class="sc-stat">
							<text class="ss-val green">{{ skill.successRate }}</text>
							<text class="ss-lab">复现率</text>
						</view>
						<view class="sc-stat">
							<text class="ss-val blue">{{ skill.feedbackCount }}</text>
							<text class="ss-lab">反馈</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- ── 设置 ── -->
		<view class="section">
			<view class="settings-card">
				<view class="settings-row" @tap="clearCache">
					<view class="settings-icon-box">
						<uni-icons type="trash" color="#9CA3AF" size="17" />
					</view>
					<text class="settings-label">清除缓存</text>
					<text class="settings-hint">{{ cacheSize }}</text>
					<uni-icons type="right" size="13" color="#C8CBD4" />
				</view>
				<view class="settings-row last" @tap="showAbout">
					<view class="settings-icon-box">
						<uni-icons type="info-filled" color="#9CA3AF" size="17" />
					</view>
					<text class="settings-label">关于少不起</text>
					<text class="settings-hint">v1.0.0</text>
					<uni-icons type="right" size="13" color="#C8CBD4" />
				</view>
			</view>
		</view>

		<view class="page-bottom" />
	</scroll-view>
</template>

<script setup lang="ts">
	import { getCurrentInstance } from 'vue'
	import { useSysInfoStore } from '@/stores'

	const instance = getCurrentInstance()
	onShow(() => {
		// #ifdef MP-WEIXIN
		uni.getTabBar(instance?.proxy)?.setData({ selected: 2 })
		// #endif
	})

	const sysInfo = useSysInfoStore()
	const statusBarHeight = computed(() => (sysInfo.systemInfo as any).statusBarHeight || 44)
	const profileCardStyle = computed(() => {
		// #ifdef H5
		return { '--profile-safe-top-base': '16px' }
		// #endif
		// #ifndef H5
		return { paddingTop: `${statusBarHeight.value + 16}px` }
		// #endif
	})

	const mySkills = ref([
		{ id: 's1', title: '万能长文写作框架',   scene: '写作',   time: '2天前',
		  copyCount: '1.2k', favoriteCount: '312', successRate: '94%', feedbackCount: '43'  },
		{ id: 's2', title: '爆款自媒体选题生成', scene: '自媒体', time: '5天前',
		  copyCount: '890',  favoriteCount: '234', successRate: '87%', feedbackCount: '31'  },
		{ id: 's3', title: '极简翻译润色器',     scene: '写作',   time: '2周前',
		  copyCount: '5.2k', favoriteCount: '1.8k', successRate: '96%', feedbackCount: '128' },
	])

	const cacheSize = ref('计算中...')
	onMounted(() => {
		uni.getStorageInfo({
			success: (res) => {
				const kb = res.currentSize
				cacheSize.value = kb < 1024 ? `${kb} KB` : `${(kb / 1024).toFixed(1)} MB`
			},
			fail: () => { cacheSize.value = '' }
		})
	})

	const toSkill     = (id: string) => uni.navigateTo({ url: `/pages/detail/skill?id=${id}` })
	const toAllSkills = () => uni.navigateTo({ url: '/pages/skill/index' })
	const editProfile = () => uni.showToast({ title: '编辑资料开发中', icon: 'none' })

	const clearCache = () => {
		uni.showModal({
			title: '清除缓存',
			content: '确定要清除本地缓存吗？',
			confirmColor: '#FF7A45',
			success: ({ confirm }) => {
				if (!confirm) return
				uni.clearStorageSync()
				cacheSize.value = '0 KB'
				uni.showToast({ title: '缓存已清除', icon: 'success' })
			}
		})
	}

	const showAbout = () => {
		uni.showModal({
			title: '少不起',
			content: '版本 v1.0.0\n\n记录 AI 消耗，共享高效 Skill。\n\n© 2025 少不起团队',
			showCancel: false,
			confirmText: '知道了',
			confirmColor: '#5B5BD6',
		})
	}
</script>

<style lang="scss" scoped>
.page {
	height: 100%;
	background: #F7F8FA;
}

/* ── Profile ── */
.profile-card {
	background: #FFFFFF;
	padding: 0 24rpx;
	margin-bottom: 16rpx;

	.pc-row {
		display: flex;
		align-items: flex-start;
		gap: 20rpx;
		padding-bottom: 24rpx;
	}

	.avatar-wrap {
		position: relative;
		flex-shrink: 0;

		.avatar {
			width: 96rpx;
			height: 96rpx;
			border-radius: 50%;
			background: #5B5BD6;
			display: flex;
			align-items: center;
			justify-content: center;
			box-shadow: 0 6rpx 20rpx rgba(91, 91, 214, 0.28);

			.avatar-t { font-size: 40rpx; color: #fff; font-weight: 800; }
		}

		.lv-badge {
			position: absolute;
			bottom: -4rpx; right: -6rpx;
			font-size: 17rpx; font-weight: 700;
			color: #FF7A45;
			background: #FFF5F0;
			border: 2rpx solid rgba(255, 122, 69, 0.28);
			padding: 2rpx 10rpx;
			border-radius: 100rpx;
		}
	}

	.pc-info {
		flex: 1;
		padding-top: 4rpx;
		min-width: 0;

		.pc-name { display: block; font-size: 34rpx; font-weight: 800; color: #1A1A2E; margin-bottom: 8rpx; }
		.pc-bio  { display: block; font-size: 24rpx; color: #6B7280; line-height: 1.5; margin-bottom: 12rpx; }

		.pc-tags {
			display: flex; gap: 10rpx;

			.pc-tag {
				font-size: 18rpx; color: #5B5BD6; font-weight: 500;
				background: rgba(91, 91, 214, 0.08);
				padding: 4rpx 14rpx; border-radius: 8rpx;
			}
		}
	}

	.edit-btn {
		width: 56rpx; height: 56rpx;
		border-radius: 16rpx;
		background: rgba(0, 0, 0, 0.04);
		display: flex; align-items: center; justify-content: center;
		flex-shrink: 0;
		&:active { background: rgba(0, 0, 0, 0.08); }
	}
}

/* #ifdef H5 */
.profile-card {
	padding-top: calc(var(--profile-safe-top-base, 16px) + constant(safe-area-inset-top));
	padding-top: calc(var(--profile-safe-top-base, 16px) + env(safe-area-inset-top));
}
/* #endif */

.stats-bar {
	display: flex; align-items: center;
	padding: 20rpx 0 24rpx;
	border-top: 1rpx solid rgba(0, 0, 0, 0.06);

	.stat-item {
		flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6rpx;

		.sv { font-size: 32rpx; font-weight: 900; color: #1A1A2E; }
		.sv.orange { color: #FF7A45; }
		.sv.green  { color: #2F8A57; }
		.sl { font-size: 20rpx; color: #9CA3AF; }
	}

	.stat-div { width: 1rpx; height: 36rpx; background: rgba(0, 0, 0, 0.06); }
}

/* ── 通用 section ── */
.section {
	padding: 0 24rpx 16rpx;
}

.section-hd {
	display: flex; align-items: center; justify-content: space-between;
	padding: 4rpx 4rpx 16rpx;

	.sh-title { font-size: 28rpx; font-weight: 700; color: #1A1A2E; }
	.sh-more  { font-size: 24rpx; color: #9CA3AF; }
}

/* ── Skill 列表 ── */
.skill-list { display: flex; flex-direction: column; gap: 16rpx; }

.skill-card {
	background: #FFFFFF;
	border-radius: 24rpx;
	padding: 24rpx;
	&:active { background: #F8F8FF; }

	.sc-top {
		display: flex; align-items: center; justify-content: space-between;
		margin-bottom: 12rpx;

		.scene-tag {
			font-size: 18rpx; color: #5B5BD6; font-weight: 500;
			background: rgba(91, 91, 214, 0.08);
			padding: 4rpx 12rpx; border-radius: 6rpx;
		}
		.sc-time { font-size: 20rpx; color: #9CA3AF; }
	}

	.sc-title {
		display: block;
		font-size: 28rpx; font-weight: 700; color: #1A1A2E;
		margin-bottom: 16rpx; line-height: 1.4;
	}

	.sc-stats {
		display: flex; align-items: center; gap: 10rpx;

		.sc-stat {
			flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4rpx;
			padding: 12rpx 0;
			background: #F7F8FA; border-radius: 12rpx;

			.ss-val { font-size: 26rpx; font-weight: 700; color: #1A1A2E; }
			.ss-val.orange { color: #FF7A45; }
			.ss-val.green  { color: #2F8A57; }
			.ss-val.blue   { color: #5B5BD6; }
			.ss-lab { font-size: 18rpx; color: #9CA3AF; }
		}
	}
}

/* ── 设置 ── */
.settings-card {
	background: #FFFFFF;
	border-radius: 24rpx;
	overflow: hidden;
}

.settings-row {
	display: flex; align-items: center; gap: 14rpx;
	padding: 24rpx 20rpx;
	border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
	&.last  { border-bottom: none; }
	&:active { background: #F8F8FF; }

	.settings-icon-box {
		width: 52rpx; height: 52rpx;
		border-radius: 14rpx;
		background: rgba(0, 0, 0, 0.04);
		display: flex; align-items: center; justify-content: center;
		flex-shrink: 0;
	}

	.settings-label {
		flex: 1;
		font-size: 28rpx; color: #1A1A2E; font-weight: 500;
	}

	.settings-hint {
		font-size: 24rpx; color: #9CA3AF;
		margin-right: 6rpx;
	}
}

.page-bottom { height: calc(80rpx + env(safe-area-inset-bottom)); }
</style>
