<template>
	<view class="page">

		<!-- 自定义导航栏 -->
		<view class="navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="navbar-inner">
				<view class="nav-back" @tap="goBack">
					<uni-icons class="nav-back-icon" type="left" size="20" color="#1A1A1A" />
				</view>
				<text class="nav-title">Skill 详情</text>
				<view class="nav-actions">
					<view class="nav-btn" @tap="shareSkill">
						<uni-icons class="nav-btn-icon" type="paperplane" size="20" color="rgba(0,0,0,0.70)" />
					</view>
					<view class="nav-btn" @tap="reportSkill">
						<uni-icons class="nav-btn-icon" type="more-filled" size="20" color="rgba(0,0,0,0.70)" />
					</view>
				</view>
			</view>
		</view>

		<scroll-view class="main-scroll" scroll-y :show-scrollbar="false">
			<!-- 1. 顶部概览区 -->
			<view class="overview-section">
				<view class="scene-tag">{{ skill.scene }}</view>
				<text class="skill-title">{{ skill.title }}</text>

				<view class="author-row">
					<view class="author-av" :style="{ background: skill.authorColor }">
						<text class="author-av-t">{{ skill.author[0] }}</text>
					</view>
					<text class="author-name">{{ skill.author }}</text>
					<text class="publish-time">{{ skill.publishTime }}</text>
					<view class="follow-btn" @tap="followAuthor">
						<text class="follow-btn-text">关注</text>
					</view>
				</view>

				<!-- 数据概览 -->
				<view class="overview-stats">
					<view class="ov-stat">
						<text class="ov-stat-val">{{ skill.copyCount }}</text>
						<text class="ov-stat-label">复制数</text>
					</view>
					<view class="ov-divider" />
					<view class="ov-stat">
						<text class="ov-stat-val">{{ skill.favoriteCount }}</text>
						<text class="ov-stat-label">收藏数</text>
					</view>
					<view class="ov-divider" />
					<view class="ov-stat">
						<text class="ov-stat-val green">{{ skill.successRate }}</text>
						<text class="ov-stat-label">复现率</text>
					</view>
					<view class="ov-divider" />
					<view class="ov-stat">
						<text class="ov-stat-val">{{ skill.feedbackCount }}</text>
						<text class="ov-stat-label">反馈数</text>
					</view>
				</view>
			</view>

      <!-- 简介 -->
      <view class="skill-intro">
        <text class="si-title">简介</text>
        <text class="si-text">{{ skill.brief }}</text>
        <!-- 图片九宫格 -->
        <view v-if="skill.images && skill.images.length" class="skill-imgs"
          :class="`gi-${skill.images.length <= 4 ? skill.images.length : 'many'}`">
          <app-image v-for="(src, i) in skill.images.slice(0, 9)" :key="i"
            :src="src" class="skill-img" mode="aspectFill"
            @tap="previewSkillImage(skill.images, i)" />
        </view>
      </view>

      <!-- 使用场景 -->
      <view class="scene-block">
        <text class="sb-title">使用场景</text>
        <view class="scene-chip-list">
          <view v-for="scene in skill.useScenes" :key="scene" class="scene-chip">
            <text class="scene-chip-text">{{ scene }}</text>
          </view>
        </view>
      </view>

				<!-- 4. Skill 正文区 -->
					<view class="section-card skill-content-card">
						<view class="section-header">
							<uni-icons class="section-badge" type="list" size="18" color="#5E738A" />
							<text class="section-title">Skill 内容</text>
							<view class="copy-all-btn" @tap="copyAll">
								<uni-icons class="copy-all-icon" type="list" size="13" color="#E45C1A" />
								<text class="copy-all-text">复制全部</text>
							</view>
						</view>

					<view class="skill-content-panel">
						<rich-text v-if="promptHtmlNodes" class="scp-rich" :nodes="promptHtmlNodes" />
						<text v-else class="scp-text">{{ skill.fullPrompt }}</text>
					</view>

					<view v-if="Array.isArray(skill.contentImages) && skill.contentImages.length" class="content-img-block">
						<text class="content-img-title">内容图片</text>
						<view class="content-img-grid">
							<app-image
								v-for="(img, idx) in skill.contentImages"
								:key="`${img}-${idx}`"
								class="content-img"
								:src="img"
								mode="aspectFill"
								@tap="previewContentImage(idx)"
							/>
						</view>
					</view>
				</view>

			<view v-if="variableNotesText" class="section-card variable-notes-card">
				<view class="section-header">
					<uni-icons class="section-badge" type="info-filled" size="18" color="#7B5B3C" />
					<text class="section-title">变量说明</text>
				</view>
				<text class="vn-text">{{ variableNotesText }}</text>
			</view>

				<!-- 5. 使用步骤 -->
				<view class="section-card">
					<view class="section-header">
						<uni-icons class="section-badge" type="paperplane-filled" size="18" color="#2F8A57" />
						<text class="section-title">使用步骤</text>
						<text class="section-subtitle">复制后按顺序操作</text>
					</view>

				<view class="steps-list">
					<view v-for="(step, idx) in skill.steps" :key="idx" class="step-item">
						<view class="step-num">
							<text class="step-num-text">{{ idx + 1 }}</text>
						</view>
						<text class="step-text">{{ step }}</text>
					</view>
				</view>
			</view>

			<!-- 6. 复现反馈区（结构化，非普通评论区） -->
			<view class="section-card">
				<view class="section-header">
					<uni-icons class="section-badge" type="chatbubble-filled" size="18" color="#5E738A" />
					<text class="section-title">复现反馈</text>
					<view class="write-feedback-btn" @tap="writeFeedback">
						<text class="write-fb-text">写反馈</text>
					</view>
				</view>

				<view class="feedback-list">
					<view v-for="fb in skill.feedbacks" :key="fb.id" class="feedback-card">
						<view class="fb-head">
							<view class="fb-av" :style="{ background: fb.userColor }">
								<text class="fb-av-t">{{ fb.userName[0] }}</text>
							</view>
							<view class="fb-meta">
								<text class="fb-name">{{ fb.userName }}</text>
								<text class="fb-time">{{ fb.time }}</text>
							</view>
							<view class="fb-status-badge" :class="'status-' + fb.status">
								<text class="fb-status-text">{{ statusLabel(fb.status) }}</text>
							</view>
						</view>

						<!-- 使用数据 -->
						<view class="fb-token-row">
							<view class="fbt-item">
								<text class="fbt-label">模型</text>
								<text class="fbt-val model">{{ fb.model }}</text>
							</view>
							<view class="fbt-item">
								<text class="fbt-label">输入</text>
								<text class="fbt-val orange">{{ fb.inputToken }}</text>
							</view>
							<view class="fbt-item">
								<text class="fbt-label">输出</text>
								<text class="fbt-val orange">{{ fb.outputToken }}</text>
							</view>
							<view class="fbt-item">
								<text class="fbt-label">总 token</text>
								<text class="fbt-val orange">{{ fb.totalToken }}</text>
							</view>
						</view>

						<text class="fb-comment">{{ fb.comment }}</text>
					</view>
				</view>
			</view>

			<!-- 7. 相似推荐 -->
			<view class="section-card">
				<view class="section-header">
					<uni-icons class="section-badge" type="star-filled" size="18" color="#D6943A" />
					<text class="section-title">相似推荐</text>
				</view>

				<view class="similar-list">
					<view v-for="s in skill.similarSkills" :key="s.id" class="similar-item" @tap="toSkill(s.id)">
						<view class="si-info">
							<text class="si-tag">{{ s.tag }}</text>
							<text class="si-title">{{ s.title }}</text>
							<view class="si-meta">
								<view class="si-token-wrap">
									<uni-icons type="fire-filled" size="12" color="#E45C1A" />
									<text class="si-token orange">{{ s.avgToken }}</text>
								</view>
								<text class="si-rate green">{{ s.successRate }} 复现</text>
							</view>
						</view>
						<view class="si-copy-btn" @tap.stop="copyQuick(s)">
							<text class="si-copy-text">复制</text>
						</view>
					</view>
				</view>
			</view>

			<view class="detail-bottom" />
		</scroll-view>

		<!-- 底部固定操作栏 -->
		<view class="bottom-bar">
			<view class="bb-fav" @tap="toggleFavorite">
				<uni-icons
					class="bb-fav-icon"
					:type="isFavorited ? 'star-filled' : 'star'"
					size="18"
					:color="isFavorited ? '#E45C1A' : 'rgba(0,0,0,0.50)'"
				/>
				<text class="bb-fav-text">收藏</text>
			</view>
			<view class="bb-copy-btn" @tap="copySkill">
				<uni-icons class="bb-copy-icon" type="fire-filled" size="16" color="#FFFFFF" />
				<text class="bb-copy-text">复制 Skill</text>
			</view>
		</view>

		<!-- 复制成功引导弹层 -->
		<view v-if="showCopyGuide" class="copy-guide-overlay" @tap="showCopyGuide = false">
			<view class="copy-guide-sheet" @tap.stop>
				<view class="cg-title-row">
					<uni-icons type="checkmarkempty" size="18" color="#2F8A57" />
					<text class="cg-title">已复制 Skill！</text>
				</view>
				<text class="cg-subtitle">接下来你想做什么？</text>
				<view class="cg-actions">
					<view class="cg-btn" @tap="goUse">
						<uni-icons class="cg-btn-icon" type="paperplane-filled" size="18" color="#E45C1A" />
						<text class="cg-btn-text">去使用</text>
					</view>
					<view class="cg-btn" @tap="saveFavorite">
						<uni-icons class="cg-btn-icon" type="star-filled" size="18" color="#D6943A" />
						<text class="cg-btn-text">收藏到我的 Skill</text>
					</view>
					<view class="cg-btn" @tap="recordResult">
						<uni-icons class="cg-btn-icon" type="compose" size="18" color="#5E738A" />
						<text class="cg-btn-text">记录一次结果</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { copySkill as copySkillApi, favoriteSkill, getSkillDetail, unfavoriteSkill } from '@/api/skill'
	import AppImage from '@/components/app-image/index.vue'
	import { useSysInfoStore, useUserStore } from '@/stores'
	import { requireLogin } from '@/utils/auth-guard'
	import { getSafeAreaTop } from '@/utils/safe-area'

	const sysInfo = useSysInfoStore()
	const userStore = useUserStore()
	const statusBarHeight = computed(() => getSafeAreaTop(sysInfo.systemInfo))
	const PUBLISHED_SKILL_PREVIEW_KEY = 'latest_published_skill_v1'

	const isFavorited = ref(false)
	const showCopyGuide = ref(false)
	const currentSkillId = ref('')

	const createEmptySkill = () => ({
		id: '',
		title: '未命名 Skill',
		scene: '其他',
		author: '匿名用户',
		authorColor: '#5B5BD6',
		publishTime: '--',
		copyCount: '0',
		favoriteCount: '0',
		successRate: '--',
		feedbackCount: '0',
		brief: '',
		useScenes: [] as string[],
		images: [] as string[],
		avgInputToken: '--',
		avgOutputToken: '--',
		avgTotalToken: '--',
		estimatedCost: '--',
		recommendedModel: '--',
		commonModel: '--',
		showConsume: false,
		totalUses: '0',
		weekUses: '0',
		fullPrompt: '',
		fullPromptHtml: '',
		contentImages: [] as string[],
		variableNotes: '',
		variables: [] as Array<{ name: string; desc?: string | null }>,
		steps: [] as string[],
		feedbacks: [] as any[],
		similarSkills: [] as any[]
	})

	const skill = ref(createEmptySkill())

	const formatCount = (value: number | null | undefined) => {
		const n = Number(value ?? 0)
		if (!Number.isFinite(n) || n <= 0) return '0'
		if (n >= 10000) return `${(n / 1000).toFixed(1)}k`
		return `${Math.round(n)}`
	}

	const parseDisplayCount = (value: string) => {
		const raw = `${value || ''}`.toLowerCase().trim()
		if (!raw) return 0
		const num = Number.parseFloat(raw.replace(/[^0-9.]/g, ''))
		if (!Number.isFinite(num)) return 0
		if (raw.includes('k')) return num * 1000
		return num
	}

	const formatRate = (value: number | null | undefined) => {
		if (value === null || value === undefined || Number.isNaN(Number(value))) return '--'
		return `${Number(value).toFixed(0)}%`
	}

	const formatToken = (value: number | null | undefined) => {
		const n = Number(value ?? 0)
		if (!Number.isFinite(n) || n <= 0) return '--'
		if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
		return `${Math.round(n)}`
	}

	const formatDate = (value: string | null | undefined) => {
		if (!value) return '--'
		const d = new Date(value)
		if (Number.isNaN(d.getTime())) return '--'
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
	}

	const formatCostRange = (low: number | null | undefined, high: number | null | undefined) => {
		if (low === null || high === null || low === undefined || high === undefined) return '--'
		return `¥${Number(low).toFixed(2)}~${Number(high).toFixed(2)}`
	}

	const normalizeSkillId = (raw: unknown) => {
		const text = `${raw ?? ''}`
		if (/^\d+$/.test(text)) return text
		const matched = text.match(/\d+/)
		return matched?.[0] || ''
	}

	const promptHtmlNodes = computed(() => `${skill.value.fullPromptHtml || ''}`.trim())

	const variableNotesText = computed(() => {
		const direct = `${skill.value.variableNotes || ''}`.trim()
		if (direct) return direct
		if (!Array.isArray(skill.value.variables) || !skill.value.variables.length) return ''
		return skill.value.variables.map((item: any) => `{${item.name}}：${item.desc || ''}`).join('\n')
	})

	const statusLabel = (status: string) => {
		return { success: '成功', normal: '一般', fail: '翻车' }[status] || status
	}

	const mapApiDetail = (detail: any) => {
		return {
			id: `${detail?.id || ''}`,
			title: `${detail?.title || '未命名 Skill'}`,
			scene: `${detail?.scene || '其他'}`,
			author: `${detail?.creator?.nickname || '匿名用户'}`,
			authorColor: `${detail?.creator?.displayColor || '#5B5BD6'}`,
			publishTime: formatDate(detail?.publishAt),
			copyCount: formatCount(detail?.stats?.copyCount),
			favoriteCount: formatCount(detail?.stats?.favoriteCount),
			successRate: formatRate(detail?.stats?.successRate),
			feedbackCount: formatCount(detail?.stats?.feedbackCount),
			brief: `${detail?.brief || ''}`,
			useScenes: Array.isArray(detail?.content?.useScenes) && detail.content.useScenes.length
				? detail.content.useScenes
				: (Array.isArray(detail?.tags) ? detail.tags : []),
			images: Array.isArray(detail?.images?.cover) && detail.images.cover.length
				? detail.images.cover
				: (detail?.coverImage ? [detail.coverImage] : []),
			avgInputToken: formatToken(detail?.tokenInfo?.avgInputTokens),
			avgOutputToken: formatToken(detail?.tokenInfo?.avgOutputTokens),
			avgTotalToken: formatToken(detail?.tokenInfo?.avgTotalTokens),
			estimatedCost: formatCostRange(detail?.tokenInfo?.estimatedCostLow, detail?.tokenInfo?.estimatedCostHigh),
			recommendedModel: `${detail?.tokenInfo?.recommendedModelName || '--'}`,
			commonModel: `${detail?.tokenInfo?.commonModelName || '--'}`,
			showConsume: true,
			totalUses: formatCount(detail?.stats?.totalUses),
			weekUses: formatCount(detail?.stats?.weekUses),
			fullPrompt: `${detail?.content?.fullPrompt || ''}`,
			fullPromptHtml: `${detail?.content?.fullPromptHtml || ''}`,
			contentImages: Array.isArray(detail?.images?.content) ? detail.images.content : [],
			variableNotes: `${detail?.content?.variableNotes || ''}`,
			variables: Array.isArray(detail?.content?.variables) ? detail.content.variables : [],
			steps: Array.isArray(detail?.content?.steps) ? detail.content.steps : [],
			feedbacks: Array.isArray(detail?.feedbacks)
				? detail.feedbacks.map((fb: any) => ({
					id: fb.id,
					userName: `${fb?.user?.nickname || '用户'}`,
					userColor: `${fb?.user?.displayColor || '#7B5B3C'}`,
					time: formatDate(fb?.createdAt),
					model: `${fb?.modelName || '--'}`,
					inputToken: formatToken(fb?.inputTokens),
					outputToken: formatToken(fb?.outputTokens),
					totalToken: formatToken(fb?.totalTokens),
					status: `${fb?.status || 'normal'}`,
					comment: `${fb?.comment || ''}`
				}))
				: [],
			similarSkills: Array.isArray(detail?.similarSkills)
				? detail.similarSkills.map((s: any) => ({
					id: `${s?.id || ''}`,
					title: `${s?.title || ''}`,
					tag: `${s?.scene || '其他'}`,
					avgToken: formatToken(s?.avgTotalTokens),
					successRate: formatRate(s?.successRate)
				}))
				: []
		}
	}

	const applyPublishedSkill = (payload: any) => {
		if (!payload || typeof payload !== 'object') return
		skill.value = {
			...createEmptySkill(),
			...skill.value,
			id: `${payload.id ?? skill.value.id}`,
			title: payload.title ?? skill.value.title,
			scene: payload.scene ?? skill.value.scene,
			author: payload.author ?? skill.value.author,
			authorColor: payload.authorColor ?? skill.value.authorColor,
			publishTime: payload.publishTime ?? skill.value.publishTime,
			copyCount: payload.copyCount ?? skill.value.copyCount,
			favoriteCount: payload.favoriteCount ?? skill.value.favoriteCount,
			successRate: payload.successRate ?? skill.value.successRate,
			feedbackCount: payload.feedbackCount ?? skill.value.feedbackCount,
			brief: payload.brief ?? skill.value.brief,
			useScenes: Array.isArray(payload.useScenes) ? payload.useScenes : skill.value.useScenes,
			images: Array.isArray(payload.images) ? payload.images.slice(0, 9) : skill.value.images,
			fullPrompt: payload.fullPrompt ?? skill.value.fullPrompt,
			fullPromptHtml: payload.fullPromptHtml ?? skill.value.fullPromptHtml,
			contentImages: Array.isArray(payload.contentImages) ? payload.contentImages.slice(0, 9) : skill.value.contentImages,
			variableNotes: payload.variableNotes ?? skill.value.variableNotes,
			variables: Array.isArray(payload.variables) ? payload.variables : skill.value.variables,
			steps: Array.isArray(payload.steps) ? payload.steps : skill.value.steps,
			feedbacks: Array.isArray(payload.feedbacks) ? payload.feedbacks : skill.value.feedbacks,
			similarSkills: Array.isArray(payload.similarSkills) ? payload.similarSkills : skill.value.similarSkills
		}
	}

	const loadSkillDetail = async (rawId: unknown) => {
		const id = normalizeSkillId(rawId)
		if (!id) return
		try {
			const detail = await getSkillDetail(id)
			currentSkillId.value = `${detail?.id || id}`
			isFavorited.value = !!detail?.isFavorited
			skill.value = mapApiDetail(detail)
		} catch {}
	}

	const tryRecordCopy = async (sourceChannel: string) => {
		if (!userStore.token || !currentSkillId.value) return
		try {
			await copySkillApi(currentSkillId.value, { sourceChannel })
		} catch {}
	}

	onLoad((query: any) => {
		const isFromPublish = `${query?.fromPublish || ''}` === '1'
		if (isFromPublish) {
			const payload = uni.getStorageSync(PUBLISHED_SKILL_PREVIEW_KEY)
			if (payload) {
				applyPublishedSkill(payload)
				currentSkillId.value = normalizeSkillId(payload.id)
				uni.showToast({ title: '已加载刚发布内容', icon: 'none' })
			}
		}
		void loadSkillDetail(query?.id || currentSkillId.value)
	})

	const copySkill = () => {
		if (!requireLogin(userStore.token, '复制 Skill')) return
		showCopyGuide.value = true
		uni.setClipboardData({
			data: skill.value.fullPrompt || '',
			success: () => {
				uni.showToast({ title: '已复制 Skill', icon: 'success' })
				void tryRecordCopy('detail')
			}
		})
	}

	const copyAll = () => {
		if (!requireLogin(userStore.token, '复制 Skill')) return
		uni.setClipboardData({
			data: skill.value.fullPrompt || '',
			success: () => {
				uni.showToast({ title: '已复制全部内容', icon: 'success' })
				void tryRecordCopy('copy_all')
			}
		})
	}

	const previewSkillImage = (images: string[], idx: number) => {
		if (!images || !images.length) return
		uni.previewImage({ current: images[idx] || images[0], urls: images })
	}

	const previewContentImage = (idx: number) => {
		const images = Array.isArray(skill.value.contentImages) ? skill.value.contentImages.filter((item: any) => !!item) : []
		if (!images.length) return
		uni.previewImage({ current: images[idx] || images[0], urls: images })
	}

	const toggleFavorite = async () => {
		if (!requireLogin(userStore.token, '收藏 Skill')) return
		if (!currentSkillId.value) return

		try {
			if (isFavorited.value) {
				await unfavoriteSkill(currentSkillId.value)
				isFavorited.value = false
				skill.value.favoriteCount = formatCount(parseDisplayCount(skill.value.favoriteCount) - 1)
				uni.showToast({ title: '已取消收藏', icon: 'none' })
			} else {
				await favoriteSkill(currentSkillId.value)
				isFavorited.value = true
				skill.value.favoriteCount = formatCount(parseDisplayCount(skill.value.favoriteCount) + 1)
				uni.showToast({ title: '已收藏', icon: 'none' })
			}
		} catch {}
	}

	const followAuthor = () => {
		if (!requireLogin(userStore.token, '关注作者')) return
		uni.showToast({ title: '已关注', icon: 'success' })
	}
	const shareSkill = () => uni.showToast({ title: '分享功能开发中', icon: 'none' })
	const reportSkill = () => uni.showToast({ title: '举报功能开发中', icon: 'none' })
	const writeFeedback = () => {
		if (!requireLogin(userStore.token, '写反馈')) return
		const query = currentSkillId.value ? `?skillId=${currentSkillId.value}` : ''
		uni.navigateTo({ url: `/pages/publish/record${query}` })
	}
	const toSkill = (id: string) => uni.navigateTo({ url: `/pages/detail/skill?id=${id}` })
	const copyQuick = async (s: any) => {
		if (!requireLogin(userStore.token, '复制 Skill')) return
		if (s?.id) {
			try {
				await copySkillApi(s.id, { sourceChannel: 'similar' })
			} catch {}
		}
		uni.showToast({ title: '已复制 Skill', icon: 'success' })
	}
	const goBack = () => uni.navigateBack()

	const goUse = () => {
		showCopyGuide.value = false
		uni.showToast({ title: '打开你的 AI 工具使用吧', icon: 'none' })
	}

	const saveFavorite = () => {
		showCopyGuide.value = false
		void toggleFavorite()
	}

	const recordResult = () => {
		showCopyGuide.value = false
		const query = currentSkillId.value ? `?skillId=${currentSkillId.value}` : ''
		uni.navigateTo({ url: `/pages/publish/record${query}` })
	}
</script>

<style lang="scss" scoped>
	.page {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: #FFFFFF;
	}

	/* 自定义导航栏 */
	.navbar {
		background: #FFFFFF;
		flex-shrink: 0;
		border-bottom: 1rpx solid rgba(0,0,0,0.05);

		.navbar-inner {
			height: 88rpx;
			padding: 0 24rpx;
			display: flex;
			align-items: center;
			gap: 16rpx;
		}

		.nav-back {
			width: 64rpx;
			height: 64rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			background: rgba(0,0,0,0.06);
			border-radius: 20rpx;
			flex-shrink: 0;

			.nav-back-icon {
				width: 32rpx;
				height: 32rpx;
				display: flex;
				align-items: center;
				justify-content: center;
			}
		}

		.nav-title {
			flex: 1;
			font-size: 30rpx;
			font-weight: 700;
			color: #1A1A1A;
			text-align: center;
		}

		.nav-actions {
			display: flex;
			gap: 8rpx;

			.nav-btn {
				width: 64rpx;
				height: 64rpx;
				display: flex;
				align-items: center;
				justify-content: center;

				.nav-btn-icon {
					width: 30rpx;
					height: 30rpx;
					display: flex;
					align-items: center;
					justify-content: center;
				}
			}
		}
	}

	.main-scroll { flex: 1; overflow: hidden; }

	/* 通用 section 卡 */
	.section-card {
		margin: 20rpx 24rpx 0;
		background: #FFFFFF;
		border-radius: 28rpx;
		border: 1rpx solid rgba(0,0,0,0.07);
		padding: 28rpx;
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 10rpx;
		margin-bottom: 24rpx;

		.section-badge {
			width: 32rpx;
			height: 32rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
		}
		.section-title { font-size: 28rpx; font-weight: 700; color: #1A1A1A; flex: 1; }
		.section-subtitle { font-size: 20rpx; color: rgba(0,0,0,0.35); }
	}

	.copy-all-btn {
		height: 52rpx;
		padding: 0 18rpx;
		border-radius: 999rpx;
		background: rgba(228, 92, 26, 0.1);
		border: 1rpx solid rgba(228, 92, 26, 0.16);
		display: flex;
		align-items: center;
		gap: 6rpx;
		justify-content: center;

		.copy-all-icon {
			width: 20rpx;
			height: 20rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
		}

		.copy-all-text {
			font-size: 20rpx;
			color: #E45C1A;
			font-weight: 600;
		}
	}

	/* 2. 简介与场景 */
	.skill-intro {
		margin: 20rpx 24rpx 0;
		background: #FFFFFF;
		border: 1rpx solid rgba(228, 92, 26, 0.14);
		border-radius: 24rpx;
		padding: 24rpx;
		box-shadow: 0 10rpx 30rpx rgba(228, 92, 26, 0.08);

		.si-title {
			display: block;
			font-size: 24rpx;
			font-weight: 700;
			color: #B74914;
			margin-bottom: 12rpx;
		}

		.si-text {
			display: block;
			font-size: 25rpx;
			color: rgba(0,0,0,0.74);
			line-height: 1.72;
		}
	}

	.scene-block {
		margin: 12rpx 24rpx 0;
		background: #FFFFFF;
		border: 1rpx solid rgba(228, 92, 26, 0.1);
		border-radius: 24rpx;
		padding: 24rpx 24rpx 20rpx;

		.sb-title {
			display: block;
			font-size: 24rpx;
			font-weight: 700;
			color: #B74914;
			margin-bottom: 14rpx;
		}

		.scene-chip-list {
			display: flex;
			flex-wrap: wrap;
			gap: 12rpx;
		}

		.scene-chip {
			height: 52rpx;
			padding: 0 18rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			background: rgba(228, 92, 26, 0.08);
			border: 1rpx solid rgba(228, 92, 26, 0.18);
			border-radius: 999rpx;

			.scene-chip-text {
				font-size: 22rpx;
				color: #C24F16;
				font-weight: 600;
				line-height: 1;
			}
		}
	}

	/* 1. 顶部概览区 */
	.overview-section {
		margin: 20rpx 24rpx 0;
		background: #FFFFFF;
		border-radius: 28rpx;
		border: 1rpx solid rgba(0,0,0,0.07);
		padding: 28rpx;

		.scene-tag {
			display: inline-flex;
			font-size: 20rpx;
			color: rgba(0,0,0,0.50);
			background: rgba(0,0,0,0.07);
			padding: 6rpx 18rpx;
			border-radius: 100rpx;
			margin-bottom: 18rpx;
		}

		.skill-title {
			display: block;
			font-size: 38rpx;
			font-weight: 900;
			color: #1A1A1A;
			line-height: 1.3;
			margin-bottom: 24rpx;
			letter-spacing: -0.5rpx;
		}

		.author-row {
			display: flex;
			align-items: center;
			gap: 12rpx;
			margin-bottom: 28rpx;

			.author-av {
				width: 56rpx;
				height: 56rpx;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				flex-shrink: 0;

				.author-av-t { font-size: 22rpx; color: #fff; font-weight: 700; }
			}

			.author-name { font-size: 26rpx; color: rgba(0,0,0,0.8); font-weight: 600; }
			.publish-time { font-size: 22rpx; color: rgba(0,0,0,0.40); flex: 1; }

			.follow-btn {
				background: rgba(228, 92, 26,0.15);
				border: 1rpx solid rgba(228, 92, 26, 0.2);
				padding: 10rpx 24rpx;
				border-radius: 100rpx;

				.follow-btn-text { font-size: 22rpx; color: #E45C1A; font-weight: 600; }
			}
		}

		.overview-stats {
			display: flex;
			align-items: center;
			background: rgba(0,0,0,0.03);
			border-radius: 20rpx;
			padding: 20rpx 0;

			.ov-stat {
				flex: 1;
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 6rpx;

				.ov-stat-val { font-size: 28rpx; font-weight: 800; color: #1A1A1A; }
				.ov-stat-val.green { color: #2F8A57; }
				.ov-stat-label { font-size: 20rpx; color: rgba(0,0,0,0.40); }
			}

			.ov-divider {
				width: 1rpx;
				height: 36rpx;
				background: rgba(0,0,0,0.08);
			}
		}
	}

	/* 图片九宫格 */
	.skill-imgs {
		display: flex;
		flex-wrap: wrap;
		gap: 4rpx;
		margin-top: 16rpx;

		.skill-img { border-radius: 10rpx; display: block; }

		/* 1张：宽横图 */
		&.gi-1 .skill-img { width: 100%; height: 360rpx; border-radius: 16rpx; }
		/* 2张：并排各半 */
		&.gi-2 .skill-img { width: calc(50% - 2rpx); height: 240rpx; }
		/* 3张：三等分一行 */
		&.gi-3 .skill-img { width: calc(33.33% - 3rpx); height: 200rpx; }
		/* 4张：2×2 方格 */
		&.gi-4 .skill-img { width: calc(50% - 2rpx); height: 220rpx; }
		/* 5-9张：每行3列自然换行，末行左对齐 */
		&.gi-many .skill-img { width: calc(33.33% - 3rpx); height: 190rpx; }
	}


		/* 4. Skill 正文区 */
		.skill-content-card {
			padding-top: 20rpx;

			.section-header {
				margin-bottom: 18rpx;
			}

			.skill-content-panel {
				background: #191A31;
				border-radius: 26rpx;
				padding: 28rpx;
				border: 1rpx solid rgba(255,255,255,0.06);
			}

			.scp-text,
			.scp-rich {
				display: block;
				font-size: 24rpx;
				color: #AEB7FF;
				line-height: 1.72;
				white-space: pre-wrap;
				word-break: break-word;
			}

			.scp-rich :deep(img) {
				max-width: 100%;
				height: auto;
				border-radius: 10rpx;
			}

			.content-img-block {
				margin-top: 18rpx;
			}

			.content-img-title {
				display: block;
				margin-bottom: 10rpx;
				font-size: 22rpx;
				font-weight: 700;
				color: rgba(0, 0, 0, 0.60);
			}

			.content-img-grid {
				display: grid;
				grid-template-columns: repeat(3, minmax(0, 1fr));
				gap: 10rpx;
			}

			.content-img {
				width: 100%;
				height: 168rpx;
				border-radius: 12rpx;
				background: rgba(0, 0, 0, 0.04);
			}
		}

	.variable-notes-card {
		.vn-text {
			display: block;
			font-size: 24rpx;
			color: rgba(0, 0, 0, 0.72);
			line-height: 1.7;
			white-space: pre-wrap;
			word-break: break-word;
		}
	}

	/* 5. 使用步骤 */
	.steps-list {
		display: flex;
		flex-direction: column;
		gap: 16rpx;

		.step-item {
			display: flex;
			gap: 16rpx;
			align-items: flex-start;

			.step-num {
				width: 48rpx;
				height: 48rpx;
				border-radius: 50%;
				background: #E45C1A;
				display: flex;
				align-items: center;
				justify-content: center;
				flex-shrink: 0;
				margin-top: 4rpx;

				.step-num-text { font-size: 22rpx; color: #fff; font-weight: 800; }
			}

			.step-text { font-size: 26rpx; color: rgba(0,0,0,0.75); line-height: 1.65; flex: 1; }
		}
	}

	/* 6. 复现反馈区 */
	.write-feedback-btn {
		background: rgba(228, 92, 26,0.12);
		border: 1rpx solid rgba(228, 92, 26, 0.16);
		padding: 8rpx 20rpx;
		border-radius: 100rpx;

		.write-fb-text { font-size: 22rpx; color: #E45C1A; font-weight: 600; }
	}

	.feedback-list {
		display: flex;
		flex-direction: column;
		gap: 20rpx;

		.feedback-card {
			background: rgba(0,0,0,0.03);
			border-radius: 20rpx;
			padding: 20rpx;

			.fb-head {
				display: flex;
				align-items: center;
				gap: 12rpx;
				margin-bottom: 16rpx;

				.fb-av {
					width: 52rpx;
					height: 52rpx;
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;
					flex-shrink: 0;

					.fb-av-t { font-size: 20rpx; color: #fff; font-weight: 700; }
				}

				.fb-meta {
					flex: 1;

					.fb-name { display: block; font-size: 24rpx; font-weight: 600; color: rgba(0,0,0,0.8); }
					.fb-time { font-size: 20rpx; color: rgba(0,0,0,0.40); }
				}

				.fb-status-badge {
					font-size: 20rpx;
					padding: 6rpx 14rpx;
					border-radius: 100rpx;

					&.status-success { color: #2F8A57; background: rgba(47, 138, 87,0.12); }
					&.status-normal { color: #5E738A; background: rgba(94, 115, 138,0.12); }
					&.status-fail { color: #C84634; background: rgba(200, 70, 52,0.12); }

					.fb-status-text { font-weight: 600; }
				}
			}

			.fb-token-row {
				display: flex;
				gap: 0;
				background: rgba(0,0,0,0.03);
				border-radius: 12rpx;
				padding: 12rpx 0;
				margin-bottom: 16rpx;

				.fbt-item {
					flex: 1;
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: 4rpx;

					.fbt-label { font-size: 18rpx; color: rgba(0,0,0,0.35); }
					.fbt-val { font-size: 22rpx; font-weight: 700; color: rgba(0,0,0,0.70); }
					.fbt-val.orange { color: #E45C1A; }
					.fbt-val.model { font-size: 20rpx; color: #C7A06A; }
				}
			}

			.fb-comment {
				font-size: 24rpx;
				color: rgba(0,0,0,0.70);
				line-height: 1.65;
			}
		}
	}

	/* 7. 相似推荐 */
	.similar-list {
		display: flex;
		flex-direction: column;
		gap: 16rpx;

		.similar-item {
			display: flex;
			align-items: center;
			gap: 20rpx;
			padding: 18rpx 0;
			border-bottom: 1rpx solid rgba(0,0,0,0.05);

			&:last-child { border-bottom: none; }

			.si-info {
				flex: 1;

				.si-tag {
					display: inline-flex;
					font-size: 18rpx;
					color: rgba(0,0,0,0.40);
					background: rgba(0,0,0,0.06);
					padding: 3rpx 12rpx;
					border-radius: 6rpx;
					margin-bottom: 8rpx;
				}

				.si-title { display: block; font-size: 26rpx; font-weight: 700; color: #1A1A1A; margin-bottom: 8rpx; }

				.si-meta {
					display: flex;
					gap: 16rpx;

					.si-token-wrap {
						display: flex;
						align-items: center;
						gap: 4rpx;
					}

					.si-token { font-size: 22rpx; }
					.orange { color: #E45C1A; }
					.si-rate { font-size: 22rpx; }
					.green { color: #2F8A57; }
				}
			}

			.si-copy-btn {
				background: rgba(228, 92, 26,0.12);
				border: 1rpx solid rgba(228, 92, 26, 0.16);
				padding: 12rpx 24rpx;
				border-radius: 100rpx;
				flex-shrink: 0;

				.si-copy-text { font-size: 22rpx; color: #E45C1A; font-weight: 600; }
			}
		}
	}

	.detail-bottom { height: calc(180rpx + env(safe-area-inset-bottom)); }

	/* 底部固定操作栏 */
	.bottom-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
		background: #FFFFFF;
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border-top: 1rpx solid rgba(0,0,0,0.07);
		display: flex;
		gap: 16rpx;
		align-items: center;

		.bb-fav {
			width: 96rpx;
			height: 88rpx;
			background: rgba(0,0,0,0.06);
			border-radius: 24rpx;
			border: 1rpx solid rgba(0,0,0,0.09);
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 4rpx;

			.bb-fav-icon {
				width: 30rpx;
				height: 30rpx;
				display: flex;
				align-items: center;
				justify-content: center;
			}
			.bb-fav-text { font-size: 18rpx; color: rgba(0,0,0,0.50); }
		}

		.bb-copy-btn {
			flex: 1;
			height: 88rpx;
			background: #E45C1A;
			border-radius: 24rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 12rpx;
			box-shadow: 0 8rpx 28rpx rgba(228, 92, 26, 0.24);

			.bb-copy-icon {
				width: 24rpx;
				height: 24rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				flex-shrink: 0;
			}
			.bb-copy-text { font-size: 30rpx; font-weight: 700; color: #fff; }
		}
	}

	/* 复制成功引导 */
	.copy-guide-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0,0,0,0.7);
		z-index: 200;
		display: flex;
		align-items: flex-end;
	}

	.copy-guide-sheet {
		width: 100%;
		background: #FFFFFF;
		border-radius: 40rpx 40rpx 0 0;
		border-top: 1rpx solid rgba(0,0,0,0.08);
		padding: 40rpx 28rpx calc(48rpx + env(safe-area-inset-bottom));

		.cg-title-row {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 8rpx;
			margin-bottom: 10rpx;
		}

		.cg-title {
			display: block;
			font-size: 34rpx;
			font-weight: 800;
			color: #1A1A1A;
			text-align: center;
		}

		.cg-subtitle {
			display: block;
			font-size: 24rpx;
			color: rgba(0,0,0,0.40);
			margin-bottom: 36rpx;
			text-align: center;
		}

		.cg-actions {
			display: flex;
			flex-direction: column;
			gap: 16rpx;

			.cg-btn {
				height: 96rpx;
				background: rgba(0,0,0,0.06);
				border-radius: 24rpx;
				border: 1rpx solid rgba(0,0,0,0.08);
				display: flex;
				align-items: center;
				gap: 20rpx;
				padding: 0 28rpx;

				&:first-child {
					background: rgba(228, 92, 26,0.12);
					border-color: rgba(228, 92, 26, 0.16);
				}

				.cg-btn-icon {
					width: 28rpx;
					height: 28rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					flex-shrink: 0;
				}
				.cg-btn-text { font-size: 28rpx; font-weight: 600; color: rgba(0,0,0,0.85); }
			}
		}
	}

	/* 低版本微信 WebView 对 gap/grid 支持不完整，补充降级规则 */
	@supports not (gap: 1px) {
		.navbar .navbar-inner > * + * { margin-left: 16rpx; }
		.navbar .nav-actions > * + * { margin-left: 8rpx; }
		.section-header > * + * { margin-left: 10rpx; }
		.copy-all-btn > * + * { margin-left: 6rpx; }

		.scene-chip-list > * { margin-right: 12rpx; margin-bottom: 12rpx; }
		.overview-section .author-row > * + * { margin-left: 12rpx; }
		.overview-section .ov-stat > * + * { margin-top: 6rpx; }

		.steps-list > * + * { margin-top: 16rpx; }
		.steps-list .step-item > * + * { margin-left: 16rpx; }

		.feedback-list > * + * { margin-top: 20rpx; }
		.feedback-list .fb-head > * + * { margin-left: 12rpx; }
		.feedback-list .fbt-item > * + * { margin-top: 4rpx; }

		.similar-list > * + * { margin-top: 16rpx; }
		.similar-list .similar-item > * + * { margin-left: 20rpx; }
		.similar-list .si-meta > * + * { margin-left: 16rpx; }
		.similar-list .si-token-wrap > * + * { margin-left: 4rpx; }

		.bottom-bar > * + * { margin-left: 16rpx; }
		.bottom-bar .bb-fav > * + * { margin-top: 4rpx; }
		.bottom-bar .bb-copy-btn > * + * { margin-left: 12rpx; }

		.copy-guide-sheet .cg-title-row > * + * { margin-left: 8rpx; }
		.copy-guide-sheet .cg-actions > * + * { margin-top: 16rpx; }
		.copy-guide-sheet .cg-btn > * + * { margin-left: 20rpx; }
	}

	@supports not (display: grid) {
		.skill-content-card .content-img-grid {
			display: flex;
			flex-wrap: wrap;
			margin: -5rpx;
		}

		.skill-content-card .content-img {
			width: calc((100% - 30rpx) / 3);
			margin: 5rpx;
		}
	}
</style>
