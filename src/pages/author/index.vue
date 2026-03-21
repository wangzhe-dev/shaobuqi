<template>
	<view class="page">

		<!-- 顶部 Hero -->
		<view class="profile-hero">
			<view class="back-btn" @tap="goBack">
				<uni-icons class="back-icon" type="left" size="20" color="#FFFFFF" />
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
						<view class="sc-token-wrap">
							<uni-icons type="fire-filled" size="13" color="#E45C1A" />
							<text class="sc-token orange">{{ skill.avgToken }}</text>
						</view>
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
							<text class="fb-status-text">{{ fb.status === 'success' ? '成功' : '一般' }}</text>
						</view>
					</view>
					<view class="fb-tokens">
						<text class="fb-model">{{ fb.model }}</text>
						<view class="fb-token-wrap">
							<uni-icons type="fire-filled" size="12" color="#E45C1A" />
							<text class="fb-token orange">{{ fb.totalToken }}</text>
						</view>
					</view>
					<text class="fb-comment">{{ fb.comment }}</text>
				</view>
			</view>

			<view class="scroll-bottom" />
		</scroll-view>

	</view>
</template>

<script setup lang="ts">
	import { getCreatorProfile, getSkillDetail, getSkillList, copySkill as copySkillApi } from '@/api/skill'
	import { useUserStore } from '@/stores'
	import { requireLogin } from '@/utils/auth-guard'

	const TABS = [
		{ key: 'skills', label: 'Skill' },
		{ key: 'feedbacks', label: '反馈' }
	]

	const isFollowing = ref(false)
	const activeTab = ref('skills')
	const userStore = useUserStore()

	const author = reactive({
		name: '',
		color: '#5B5BD6',
		bio: '',
		tags: [] as string[],
		totalCopies: '--',
		skillCount: '--',
		avgSuccessRate: '--',
		followers: '0'
	})

	const authorSkills = ref<Array<{
		id: string
		title: string
		scene: string
		time: string
		avgToken: string
		successRate: string
		copyCount: string
		modelName: string
	}>>([])

	const normalizeUsageModelName = (value: unknown): string => {
		const modelName = `${value ?? ''}`.trim()
		if (!modelName || modelName === '--' || modelName === '未知模型') return ''
		return modelName
	}

	const normalizePlainText = (value: unknown) => `${value ?? ''}`
		.replace(/<[^>]*>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()

	// 反馈暂无公开接口，保留空列表
	const authorFeedbacks = ref<Array<{
		id: string
		skillTitle: string
		model: string
		totalToken: string
		status: string
		comment: string
	}>>([])

	const formatCount = (value: number | null | undefined) => {
		const n = Number(value ?? 0)
		if (!Number.isFinite(n) || n <= 0) return '0'
		if (n >= 10000) return `${(n / 1000).toFixed(1)}k`
		return `${Math.round(n)}`
	}

	const formatToken = (value: number | null | undefined) => {
		const n = Number(value ?? 0)
		if (!Number.isFinite(n) || n <= 0) return '--'
		if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
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

	const loadAuthorData = async (userId: number) => {
		try {
			const profile = await getCreatorProfile(userId)
			author.name = profile.nickname || '未知用户'
			author.color = profile.displayColor || '#5B5BD6'
			author.bio = profile.bio || ''
			author.tags = profile.bio ? ['创作者'] : []
			author.totalCopies = formatCount(profile.totalCopyCount)
			author.skillCount = formatCount(profile.publishedSkillCount)
			author.avgSuccessRate = formatRate(profile.avgSuccessRate)
		} catch {
			uni.showToast({ title: '加载用户信息失败', icon: 'none' })
		}

		try {
			const data = await getSkillList({ creatorId: userId, page: 1, pageSize: 20 })
			const list = Array.isArray(data?.list) ? data.list : []
			authorSkills.value = list.map((item: any) => ({
				id: `${item.id}`,
				title: item.title || '未命名 Skill',
				scene: item.scene || '其他',
				time: formatRelativeTime(item.publishAt || item.updatedAt),
				avgToken: formatToken(item.avgTotalTokens),
				successRate: formatRate(item.successRate),
				copyCount: formatCount(item.copyCount),
				modelName: normalizeUsageModelName(item.modelName)
			}))
		} catch {
			uni.showToast({ title: '加载 Skill 列表失败', icon: 'none' })
		}
	}

	onLoad((query: any) => {
		const userId = Number(query?.id)
		if (!userId || !Number.isInteger(userId) || userId <= 0) {
			uni.showToast({ title: '用户不存在', icon: 'none' })
			setTimeout(() => uni.navigateBack(), 1500)
			return
		}
		loadAuthorData(userId)
	})

	const copySkill = async (skill: any) => {
		if (!requireLogin(userStore.token, '复制 Skill')) return
		let copyText = ''
		try {
			const detail = await getSkillDetail(skill?.id)
			copyText = normalizePlainText(detail?.content?.fullPrompt)
		} catch {}
		if (!copyText) copyText = normalizePlainText(skill?.title)
		if (!copyText) {
			uni.showToast({ title: '暂无可复制内容', icon: 'none' })
			return
		}
		const copied = await new Promise<boolean>((resolve) => {
			uni.setClipboardData({
				data: copyText,
				showToast: false,
				success: () => resolve(true),
				fail: () => resolve(false)
			})
		})
		if (!copied) {
			uni.showToast({ title: '复制失败', icon: 'none' })
			return
		}

		try {
			const modelName = normalizeUsageModelName(skill?.modelName)
			await copySkillApi(
				skill.id,
				modelName
					? { sourceChannel: 'author', usage: { modelName } }
					: { sourceChannel: 'author' }
			)
			uni.showToast({ title: '已复制 Skill', icon: 'success' })
		} catch {}
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
		background: var(--card-bg);
	}

	/* 顶部 Hero */
		.profile-hero {
			position: relative;
			flex-shrink: 0;
			padding-top: constant(safe-area-inset-top);
			padding-top: env(safe-area-inset-top);

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

			.back-icon {
				width: 32rpx;
				height: 32rpx;
				display: flex;
				align-items: center;
				justify-content: center;
			}
		}

			.cover-bg {
				width: 100%;
				height: 280rpx;
				background: linear-gradient(160deg, #1E2228 0%, #252A31 50%, #191D23 100%);
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
					border: 4rpx solid #1A1A1A;
					display: flex;
					align-items: center;
					justify-content: center;
					box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.4);

					.av-t { font-size: 48rpx; color: #fff; font-weight: 700; }
				}
			}

			.follow-btn {
				background: var(--orange-color);
				border-radius: 100rpx;
				padding: 18rpx 40rpx;
				box-shadow: 0 4rpx 16rpx rgba(228, 92, 26, 0.18);

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

		/* #ifdef H5 */
		.profile-hero {
			padding-top: var(--h5-safe-area-inset-top, 0px) !important;
		}

		/* #endif */

		/* 用户信息 */
		.user-info {
		padding: 4rpx 28rpx 20rpx;
		background: var(--card-bg);
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
		background: var(--card-bg);
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
			.stat-n.orange { color: var(--orange-color); }
			.stat-n.green { color: var(--green-color); }
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
		background: var(--card-bg);
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
				.ct-tab-text { color: var(--orange-color); font-weight: 700; }

				&::after {
					content: '';
					position: absolute;
					bottom: 0;
					left: 50%;
					transform: translateX(-50%);
					width: 40rpx;
					height: 4rpx;
					background: var(--orange-color);
					border-radius: 999rpx;
				}
			}
		}
	}

	/* 内容 */
	.content-scroll {
		flex: 1;
		overflow: hidden;
		background: var(--card-bg);

		.scroll-bottom { height: 40rpx; }
	}

	/* Skill 列表 */
	.skills-list {
		padding: 20rpx 24rpx;
		display: flex;
		flex-direction: column;
		gap: 16rpx;

		.skill-card {
			background: var(--card-bg);
			border-radius: 24rpx;
			border: 1rpx solid rgba(0,0,0,0.07);
			padding: 24rpx;

			&:active { background: #F5F7FA; }

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

				.sc-token-wrap {
					display: flex;
					align-items: center;
					gap: 4rpx;
				}

				.sc-token { font-size: 22rpx; font-weight: 600; }
				.orange { color: var(--orange-color); }
				.sc-rate { font-size: 22rpx; font-weight: 600; }
				.green { color: var(--green-color); }
				.sc-copies { font-size: 22rpx; color: rgba(0,0,0,0.40); }
			}

			.sc-copy-btn {
				width: 100%;
				height: 72rpx;
				background: var(--orange-color);
				border-radius: 16rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				box-shadow: 0 4rpx 16rpx rgba(228, 92, 26, 0.16);

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
			background: var(--card-bg);
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

					&.status-success { color: var(--green-color); background: rgba(47, 138, 87,0.12); }
					&.status-normal { color: #5E738A; background: rgba(94, 115, 138,0.12); }

					.fb-status-text { font-weight: 600; }
				}
			}

			.fb-tokens {
				display: flex;
				align-items: center;
				gap: 16rpx;
				margin-bottom: 12rpx;

				.fb-model { font-size: 20rpx; color: rgba(0,0,0,0.40); }
				.fb-token-wrap {
					display: flex;
					align-items: center;
					gap: 4rpx;
				}
				.fb-token { font-size: 22rpx; font-weight: 600; }
				.orange { color: var(--orange-color); }
			}

			.fb-comment { font-size: 24rpx; color: rgba(0,0,0,0.60); line-height: 1.6; }
		}
	}
</style>
