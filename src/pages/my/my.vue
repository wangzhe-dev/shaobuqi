<template>
	<scroll-view class="page" scroll-y :show-scrollbar="false">

		<!-- ── Profile ── -->
		<view class="profile-card" :style="profileCardStyle">
			<view class="pc-row">
				<view class="avatar-wrap">
					<view class="avatar"><text class="avatar-t">{{ profile.name[0] || '我' }}</text></view>
					<view class="lv-badge">Lv.4</view>
				</view>
				<view class="pc-info">
					<text class="pc-name">{{ profile.name }}</text>
					<text class="pc-bio">{{ profile.bio }}</text>
					<view class="pc-tags">
						<text v-for="tag in profile.tags" :key="tag" class="pc-tag">{{ tag }}</text>
					</view>
				</view>
				<view class="edit-btn" @tap="editProfile">
					<uni-icons type="compose" size="17" color="#9CA3AF" />
				</view>
			</view>

			<view class="stats-bar">
				<view class="stat-item">
					<text class="sv">{{ profile.publishedSkillCount }}</text>
					<text class="sl">发布 Skill</text>
				</view>
				<view class="stat-div" />
				<view class="stat-item">
					<text class="sv orange">{{ profile.totalCopyCount }}</text>
					<text class="sl">被复制</text>
				</view>
				<view class="stat-div" />
				<view class="stat-item">
					<text class="sv green">{{ profile.avgSuccessRate }}</text>
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
				<view v-if="mySkills.length === 0" class="empty-row">
					<text class="empty-t">还没有发布 Skill</text>
				</view>
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

		<!-- ── 我的收藏 ── -->
		<view class="section">
			<view class="section-hd">
				<text class="sh-title">我的收藏</text>
			</view>
			<view class="list-card">
				<view v-if="myFavorites.length === 0" class="empty-row">
					<text class="empty-t">还没有收藏 Skill</text>
				</view>
				<view
					v-for="favorite in myFavorites"
					:key="favorite.id"
					class="line-item"
					@tap="toSkill(favorite.id)"
				>
					<view class="item-main">
						<text class="item-title">{{ favorite.title }}</text>
						<text class="item-sub">{{ favorite.creator }} · {{ favorite.scene }}</text>
					</view>
					<text class="item-meta">{{ favorite.favoriteCount }} 收藏</text>
				</view>
			</view>
		</view>

		<!-- ── 我的复制 ── -->
		<view class="section">
			<view class="section-hd">
				<text class="sh-title">我的复制</text>
			</view>
			<view class="list-card">
				<view v-if="myCopies.length === 0" class="empty-row">
					<text class="empty-t">还没有复制记录</text>
				</view>
				<view
					v-for="copy in myCopies"
					:key="copy.id"
					class="line-item"
				>
					<view class="item-main">
						<text class="item-title">{{ copy.title }}</text>
						<text class="item-sub">{{ copy.scene }} · {{ copy.time }}</text>
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
					<text class="settings-label">关于烧不起</text>
					<text class="settings-hint">v1.0.0</text>
					<uni-icons type="right" size="13" color="#C8CBD4" />
				</view>
			</view>
		</view>

		<view class="page-bottom" />
	</scroll-view>
</template>

<script setup lang="ts">
	import { getMyCopies, getMyFavorites, getMyProfile, getMySkills } from '@/api/me'
import { useSysInfoStore, useUserStore } from '@/stores'
import { getCurrentInstance } from 'vue'

	const instance = getCurrentInstance()
	onShow(() => {
		// #ifdef MP-WEIXIN
		uni.getTabBar(instance?.proxy)?.setData({ selected: 2 })
		// #endif
		loadMyData()
	})
	const userStore = useUserStore()

	const sysInfo = useSysInfoStore()
	const statusBarHeight = computed(() => (sysInfo.systemInfo as any).statusBarHeight || 44)
	const profileCardStyle = computed(() => {
		// #ifdef H5
		return { '--profile-safe-top-base': '16px' }
		// #endif
	})

	const mySkills = ref([
		{ id: 's1', title: '万能长文写作框架', scene: '写作', time: '2天前',
		  copyCount: '1.2k', favoriteCount: '312', successRate: '94%', feedbackCount: '43'  },
		{ id: 's2', title: '爆款自媒体选题生成', scene: '自媒体', time: '5天前',
		  copyCount: '890',  favoriteCount: '234', successRate: '87%', feedbackCount: '31'  },
		{ id: 's3', title: '极简翻译润色器',     scene: '写作',   time: '2周前',
		  copyCount: '5.2k', favoriteCount: '1.8k', successRate: '96%', feedbackCount: '128' },
	])

	const myFavorites = ref<Array<{
		id: string
		title: string
		scene: string
		creator: string
		favoriteCount: string
	}>>([])

	const myCopies = ref<Array<{
		id: string
		title: string
		scene: string
		time: string
	}>>([])

	const profile = reactive({
		name: '我',
		bio: '不断验证Skill，不断分享经验',
		tags: ['Skill'],
		publishedSkillCount: '0',
		totalCopyCount: '0',
		avgSuccessRate: '--'
	})

	const formatCount = (value: number | null | undefined) => {
		const n = Number(value ?? 0)
		if (!Number.isFinite(n) || n <= 0) return '0'
		if (n >= 10000) return `${(n / 1000).toFixed(1)}k`
		return `${Math.round(n)}`
	}

	const formatRate = (value: number | null | undefined) => {
		if (value === null || value === undefined || Number.isNaN(Number(value))) return '--'
		return `${Number(value).toFixed(0)}%`
	}

	const formatRelativeTime = (time: string | null | undefined) => {
		if (!time) return '--'
		const date = new Date(time)
		if (Number.isNaN(date.getTime())) return '--'
		const diff = Date.now() - date.getTime()
		const day = 24 * 60 * 60 * 1000
		if (diff < day) return '今天'
		if (diff < 2 * day) return '1天前'
		if (diff < 7 * day) return `${Math.floor(diff / day)}天前`
		return `${Math.floor(diff / (7 * day))}周前`
	}

	const loadMyData = async () => {
		if (!userStore.token) return

		try {
			const me = await getMyProfile()
			profile.name = me?.nickname || '我'
			profile.bio = me?.bio || '不断验证Skill，不断分享经验'
			profile.tags = me?.bio ? ['创作者'] : ['Skill']
			profile.publishedSkillCount = formatCount(me?.publishedSkillCount)
			profile.totalCopyCount = formatCount(me?.totalCopyCount)
			profile.avgSuccessRate = formatRate(me?.avgSuccessRate)
		} catch {}

		try {
			const skillData = await getMySkills({ page: 1, pageSize: 20, status: 1 })
			const list = Array.isArray(skillData?.list) ? skillData.list : []
			mySkills.value = list.map((skill: any) => ({
				id: `${skill.id}`,
				title: skill.title,
				scene: skill.scene || '其他',
				time: formatRelativeTime(skill.publishAt || skill.updatedAt),
				copyCount: formatCount(skill.copyCount),
				favoriteCount: formatCount(skill.favoriteCount),
				successRate: formatRate(skill.successRate),
				feedbackCount: formatCount(skill.feedbackCount)
			}))
		} catch {}

		try {
			const favoriteData = await getMyFavorites({ page: 1, pageSize: 8 })
			const list = Array.isArray(favoriteData?.list) ? favoriteData.list : []
			myFavorites.value = list.map((item: any) => ({
				id: `${item?.skill?.id || ''}`,
				title: `${item?.skill?.title || '未命名 Skill'}`,
				scene: `${item?.skill?.scene || '其他'}`,
				creator: `${item?.skill?.creator?.nickname || '匿名用户'}`,
				favoriteCount: formatCount(item?.skill?.favoriteCount)
			}))
		} catch {}

		try {
			const copyData = await getMyCopies({ page: 1, pageSize: 8 })
			const list = Array.isArray(copyData?.list) ? copyData.list : []
			myCopies.value = list.map((item: any) => ({
				id: `${item?.id || ''}`,
				title: `${item?.skill?.title || '已删除 Skill'}`,
				scene: `${item?.skill?.scene || '其他'}`,
				time: formatRelativeTime(item?.createdAt)
			}))
		} catch {}
	}

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

	const toSkill = (id: string) => {
		if (!id) {
			uni.showToast({ title: 'Skill 已不存在', icon: 'none' })
			return
		}
		uni.navigateTo({ url: `/pages/detail/skill?id=${id}` })
	}
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
			title: '烧不起',
			content: '版本 v1.0.0\n\n记录 AI 消耗，共享高效 Skill。\n\n© 2025 烧不起团队',
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

.list-card {
	background: #FFFFFF;
	border-radius: 24rpx;
	overflow: hidden;
}

.line-item {
	display: flex;
	align-items: center;
	gap: 12rpx;
	padding: 22rpx 20rpx;
	border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
	&:last-child { border-bottom: none; }
	&:active { background: #F8F8FF; }
}

.item-main {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 6rpx;
}

.item-title {
	font-size: 26rpx;
	font-weight: 600;
	color: #1A1A2E;
}

.item-sub {
	font-size: 22rpx;
	color: #9CA3AF;
}

.item-meta {
	font-size: 22rpx;
	color: #6B7280;
}

.empty-row {
	display: flex;
	justify-content: center;
	padding: 28rpx 20rpx;
}

.empty-t {
	font-size: 24rpx;
	color: #9CA3AF;
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
