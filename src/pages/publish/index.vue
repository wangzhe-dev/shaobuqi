<template>
	<view class="page">
		<view class="top-bar">
			<view class="top-main">
				<text class="top-title">发布 Skill</text>
				<text class="top-subtitle">把你的提示词整理成可复制模板，60 秒可发布</text>
			</view>
			<view class="top-clear" @tap="resetFormWithConfirm">
				<text class="top-clear-text">清空</text>
			</view>
		</view>

		<view v-if="restoredDraftAt" class="draft-tip">
			<text class="draft-tip-text">已恢复草稿 · {{ restoredDraftAt }}</text>
			<view class="draft-tip-btn" @tap="clearDraft">
				<text class="draft-tip-btn-text">删除草稿</text>
			</view>
		</view>

		<scroll-view class="content" scroll-y :show-scrollbar="false">
			<view class="card guide-card">
				<text class="guide-title">发布节奏</text>
				<view class="guide-list">
					<text class="guide-item">1. 写标题，选场景</text>
					<text class="guide-item">2. 粘贴完整 Prompt</text>
					<text class="guide-item">3. 点发布，自动跳转详情预览</text>
				</view>
				<view class="guide-actions">
					<view class="guide-btn" @tap="fillPromptTemplate">
						<text class="guide-btn-text">一键模板</text>
					</view>
					<view class="guide-btn" @tap="smartExtract">
						<text class="guide-btn-text">智能整理</text>
					</view>
				</view>
			</view>

			<view class="card">
				<view class="card-head">
					<text class="card-title">基础信息</text>
					<text class="card-flag">必填</text>
				</view>

				<view class="field">
					<view class="field-label-row">
						<text class="field-label">标题</text>
						<text class="field-count">{{ form.title.length }}/24</text>
					</view>
					<input
						class="field-input"
						v-model="form.title"
						placeholder="例如：朋友圈成交文案生成器"
						maxlength="24"
					/>
				</view>

				<view class="field">
					<text class="field-label">场景分类</text>
					<view class="chip-group">
						<view
							v-for="scene in sceneOptions"
							:key="scene"
							class="chip"
							:class="{ active: form.scene === scene }"
							@tap="form.scene = scene"
						>
							<text class="chip-text">{{ scene }}</text>
						</view>
					</view>
				</view>

				<view class="field">
					<view class="field-label-row">
						<text class="field-label">简介</text>
						<text class="field-count">{{ form.brief.length }}/90</text>
					</view>
					<textarea
						class="field-textarea compact"
						v-model="form.brief"
						placeholder="可选，不填会自动生成一句简介"
						:maxlength="90"
						:auto-height="true"
					/>
				</view>
			</view>

			<view class="card">
				<view class="card-head">
					<text class="card-title">Skill 内容</text>
					<text class="card-flag">必填</text>
				</view>

				<view class="field">
					<view class="field-label-row">
						<text class="field-label">完整 Prompt</text>
						<text class="field-count">{{ form.fullPrompt.length }}/4000</text>
					</view>
					<textarea
						class="field-textarea code"
						v-model="form.fullPrompt"
						placeholder="贴入可直接复制使用的完整 Prompt"
						:maxlength="4000"
						:auto-height="true"
					/>
				</view>

				<view class="prompt-actions">
					<view class="ghost-btn" @tap="fillPromptTemplate">
						<text class="ghost-btn-text">填入模板</text>
					</view>
					<view class="ghost-btn" @tap="smartExtract">
						<text class="ghost-btn-text">智能提取</text>
					</view>
				</view>
			</view>

			<view class="card">
				<view class="card-head">
					<text class="card-title">展示补充</text>
					<text class="card-flag soft">可选</text>
				</view>

				<view class="field">
					<text class="field-label">使用场景</text>
					<view class="chip-group">
						<view
							v-for="scene in useSceneOptions"
							:key="scene"
							class="chip"
							:class="{ active: form.useScenes.includes(scene) }"
							@tap="toggleUseScene(scene)"
						>
							<text class="chip-text">{{ scene }}</text>
						</view>
					</view>
					<input
						class="field-input custom-scene"
						v-model="customUseSceneInput"
						placeholder="补充一个自定义场景，回车添加"
						@confirm="addCustomUseScene"
					/>
					<view class="tag-list" v-if="form.useScenes.length">
						<view v-for="(scene, idx) in form.useScenes" :key="scene + idx" class="tag-item">
							<text class="tag-item-text">{{ scene }}</text>
							<text class="tag-item-del" @tap="removeUseScene(idx)">×</text>
						</view>
					</view>
				</view>

				<view class="field">
					<view class="field-label-row">
						<text class="field-label">使用步骤</text>
						<text class="field-count">{{ previewSteps.length }} 步</text>
					</view>
					<textarea
						class="field-textarea compact"
						v-model="form.stepsText"
						placeholder="可选，每行一步；不填会自动生成 3~4 步"
						:maxlength="500"
						:auto-height="true"
					/>
				</view>

				<view class="field">
					<view class="field-label-row">
						<text class="field-label">变量说明</text>
						<text class="field-count">{{ placeholderVars.length }} 个变量</text>
					</view>
					<textarea
						class="field-textarea compact"
						v-model="form.variableNotes"
						placeholder="可选，不填会根据 {变量} 自动生成"
						:maxlength="500"
						:auto-height="true"
					/>
				</view>
			</view>

			<view class="card preview-card">
				<view class="card-head">
					<text class="card-title">发布预览</text>
					<text class="preview-score">{{ qualityScore }} 分</text>
				</view>

				<view class="preview-head">
					<text class="preview-scene">{{ form.scene || '未分类' }}</text>
				</view>
				<text class="preview-title">{{ form.title || '（请填写标题）' }}</text>
				<text class="preview-brief">{{ previewBrief || '（请填写 Prompt 后自动生成简介）' }}</text>

				<view class="preview-block">
					<text class="preview-block-title">使用场景</text>
					<view class="preview-scene-list">
						<view v-for="scene in previewUseScenes" :key="scene" class="preview-scene-chip">
							<text class="preview-scene-chip-text">{{ scene }}</text>
						</view>
					</view>
				</view>

				<view class="preview-block">
					<text class="preview-block-title">Skill 内容</text>
					<view class="preview-prompt-panel">
						<text class="preview-prompt-text">{{ promptPreview }}</text>
					</view>
				</view>

				<view class="preview-block">
					<text class="preview-block-title">使用步骤</text>
					<view class="preview-steps">
						<view v-for="(step, idx) in previewSteps" :key="step + idx" class="preview-step-item">
							<view class="preview-step-num">
								<text class="preview-step-num-text">{{ idx + 1 }}</text>
							</view>
							<text class="preview-step-text">{{ step }}</text>
						</view>
					</view>
				</view>
			</view>

			<view class="content-bottom" />
		</scroll-view>

		<view class="bottom-bar">
			<view class="draft-btn" @tap="saveDraft(true)">
				<text class="draft-btn-text">存草稿</text>
			</view>
			<view class="publish-btn" :class="{ disabled: !canPublish }" @tap="publishSkill">
				<text class="publish-btn-text">发布并预览</text>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { computed, getCurrentInstance, onUnmounted, reactive, ref, watch } from 'vue'

	type SkillForm = {
		title: string
		scene: string
		brief: string
		fullPrompt: string
		useScenes: string[]
		stepsText: string
		variableNotes: string
	}

	const SKILL_DRAFT_KEY = 'publish_skill_draft_v5'
	const PUBLISHED_SKILL_PREVIEW_KEY = 'latest_published_skill_v1'

	const sceneOptions = ['写作', '编程', '自媒体', '办公', '运营', '学习', '设计', '电商']
	const useSceneOptions = ['朋友圈', '小红书', '公众号', '知乎', '视频口播', '私域转化', '直播间', '客服回复']

	const instance = getCurrentInstance()
	const customUseSceneInput = ref('')
	const restoredDraftAt = ref('')

	const form = reactive<SkillForm>({
		title: '',
		scene: '',
		brief: '',
		fullPrompt: '',
		useScenes: [],
		stepsText: '',
		variableNotes: ''
	})

	const normalizeLineList = (text: string) => {
		return text
			.split('\n')
			.map(line => line.trim())
			.filter(Boolean)
	}

	const extractSection = (text: string, label: string) => {
		const reg = new RegExp(`【${label}】([\\s\\S]*?)(?=\\n\\s*【[^\\n]+】|$)`)
		const match = text.match(reg)
		return match ? match[1].trim() : ''
	}

	const detectSceneFromPrompt = (text: string) => {
		for (const scene of sceneOptions) {
			if (text.includes(scene)) return scene
		}
		return ''
	}

	const extractUseScenesFromPrompt = (text: string) => {
		const found: string[] = []
		const inline = text.match(/使用场景[：:]\s*([^\n]+)/)
		if (inline?.[1]) {
			inline[1]
				.split(/[、，,\/\s]+/)
				.map(item => item.trim())
				.filter(Boolean)
				.forEach(item => found.push(item))
		}
		for (const scene of useSceneOptions) {
			if (text.includes(scene)) found.push(scene)
		}
		return Array.from(new Set(found)).slice(0, 8)
	}

	const extractStepsFromPrompt = (text: string) => {
		const direct = Array.from(text.matchAll(/^\s*(?:\d+[\.、]|[-•])\s*(.+)$/gm))
			.map(item => item[1].trim())
			.filter(Boolean)
		if (direct.length >= 2) return Array.from(new Set(direct)).slice(0, 8)

		const outputSection = extractSection(text, '输出要求')
		const outputSteps = Array.from(outputSection.matchAll(/^\s*(?:\d+[\.、]|[-•])\s*(.+)$/gm))
			.map(item => item[1].trim())
			.filter(Boolean)
		if (outputSteps.length >= 2) return Array.from(new Set(outputSteps)).slice(0, 8)

		return []
	}

	const buildTitleFromPrompt = (text: string, scene: string) => {
		const lines = normalizeLineList(text)
		const candidate = lines.find(line => !/^【.+】$/.test(line) && line.length <= 24)
		if (candidate && !/[：:]/.test(candidate)) return candidate.slice(0, 24)

		const sceneMap: Record<string, string> = {
			写作: '高转化文案生成器',
			编程: '问题排查助手',
			自媒体: '爆款内容生成器',
			办公: '高效办公助手',
			运营: '增长运营策略助手',
			学习: '结构化学习教练',
			设计: '创意设计助手',
			电商: '电商转化文案助手'
		}
		return sceneMap[scene] || '结构化提示词助手'
	}

	const buildBriefFromPrompt = (text: string, scene: string) => {
		const role = extractSection(text, '角色设定').replace(/\s+/g, ' ')
		const output = extractSection(text, '输出要求').replace(/\s+/g, ' ')
		const raw = (output || role || text).replace(/\s+/g, ' ').slice(0, 40)
		const brief = `面向${scene || '通用'}场景的结构化 Prompt，${raw}${raw.length >= 40 ? '...' : ''}`
		return brief.slice(0, 90)
	}

	const mergeUseScenes = (items: string[]) => {
		const merged = new Set(form.useScenes)
		for (const item of items) {
			if (!item || merged.size >= 8) break
			merged.add(item)
		}
		form.useScenes = Array.from(merged).slice(0, 8)
	}

	const placeholderVars = computed(() => {
		const vars = new Set<string>()
		const matches = form.fullPrompt.matchAll(/\{([^{}\n]{1,30})\}/g)
		for (const match of matches) {
			vars.add(match[1].trim())
		}
		return Array.from(vars)
	})

	const previewUseScenes = computed(() => {
		if (form.useScenes.length) return form.useScenes
		if (form.scene) return [form.scene]
		return ['待补充']
	})

	const manualSteps = computed(() => normalizeLineList(form.stepsText).slice(0, 8))
	const autoSteps = computed(() => extractStepsFromPrompt(form.fullPrompt.trim()))

	const previewSteps = computed(() => {
		if (manualSteps.value.length >= 2) return manualSteps.value
		if (autoSteps.value.length >= 2) return autoSteps.value
		return ['复制 Skill 内容', '粘贴到 ChatGPT 或 Claude', '替换大括号变量为真实信息', '发送并按结果微调']
	})

	const autoBrief = computed(() => {
		const text = form.fullPrompt.trim()
		if (!text) return ''
		return buildBriefFromPrompt(text, form.scene)
	})

	const previewBrief = computed(() => {
		if (form.brief.trim()) return form.brief.trim()
		return autoBrief.value
	})

	const promptPreview = computed(() => {
		const text = form.fullPrompt.trim()
		if (!text) return '（请先填写 Prompt）'
		if (text.length <= 380) return text
		return `${text.slice(0, 380)}...`
	})

	const resolvedVariableNotes = computed(() => {
		if (form.variableNotes.trim()) return form.variableNotes.trim()
		if (!placeholderVars.value.length) return ''
		return placeholderVars.value.map(item => `{${item}}：替换为你的实际信息`).join('\n')
	})

	const qualityScore = computed(() => {
		let score = 0
		if (form.title.trim()) score += 30
		if (form.scene) score += 20
		if (form.fullPrompt.trim()) score += 30
		if (previewSteps.value.length >= 2) score += 10
		if (previewBrief.value) score += 10
		return Math.min(score, 100)
	})

	const hasFormContent = computed(() => {
		return [
			form.title,
			form.scene,
			form.brief,
			form.fullPrompt,
			form.stepsText,
			form.variableNotes,
			...form.useScenes
		]
			.some(item => `${item || ''}`.trim().length > 0)
	})

	const canPublish = computed(() => {
		return !!form.title.trim() && !!form.scene && !!form.fullPrompt.trim()
	})

	const toggleUseScene = (scene: string) => {
		if (form.useScenes.includes(scene)) {
			form.useScenes = form.useScenes.filter(item => item !== scene)
			return
		}
		if (form.useScenes.length < 8) form.useScenes.push(scene)
	}

	const addCustomUseScene = () => {
		const value = customUseSceneInput.value.trim()
		if (!value) return
		if (!form.useScenes.includes(value) && form.useScenes.length < 8) {
			form.useScenes.push(value)
		}
		customUseSceneInput.value = ''
	}

	const removeUseScene = (idx: number) => {
		form.useScenes.splice(idx, 1)
	}

	const fillPromptTemplate = () => {
		const template = `【你是谁】
你是一位很会写营销文案的老师，能把复杂卖点写成普通人看得懂、愿意下单的文案。

【你要做什么】
1. 先看懂：这是谁的产品、卖给谁、在哪个场景用。
2. 输出 3 个版本：
- 痛点版（先说问题，再给解决方案）
- 场景版（让人有代入感）
- 数据版（用数字或结果增强说服力）
3. 每个版本都要有：核心好处 + 一句行动引导（比如“现在就试试”）。
4. 信息不完整时，不要反问，直接按默认参数生成可用结果。

【固定参数（默认执行）】
- 每版 120~150 字
- 语气：真实、自然、口语化
- 输出数量：3版
- 如缺“目标用户”：默认“25~35岁上班族”
- 如缺“使用场景”：默认“日常通勤+碎片时间”
- 如缺“核心卖点”：默认提炼为“省时、省钱、好上手”
- 禁止先提问，直接输出结果

【输出格式】
请按下面格式输出：

版本1（痛点版）：
...

版本2（场景版）：
...

版本3（数据版）：
...

最后自检：
- 有没有讲清楚用户能得到什么：是/否
- 有没有行动引导：是/否
- 有没有空话套话：是/否

【我会提供这些信息】
产品名称：{产品名称}
核心卖点：{核心卖点}
目标用户：{目标用户}
使用场景：{使用场景}
语气风格：{语气风格}
禁用词：{禁用词，可留空}`

		if (!form.fullPrompt.trim()) {
			form.fullPrompt = template
			return
		}

		uni.showModal({
			title: '替换当前 Prompt？',
			content: '模板会覆盖你已经填写的 Prompt 内容。',
			success: (res) => {
				if (res.confirm) form.fullPrompt = template
			}
		})
	}

	const smartExtract = () => {
		const text = form.fullPrompt.trim()
		if (!text) {
			uni.showToast({ title: '请先粘贴 Prompt', icon: 'none' })
			return
		}

		const detectedScene = detectSceneFromPrompt(text)
		if (!form.scene && detectedScene) form.scene = detectedScene

		if (!form.title.trim()) form.title = buildTitleFromPrompt(text, form.scene)
		if (!form.brief.trim()) form.brief = buildBriefFromPrompt(text, form.scene)

		const extractedUseScenes = extractUseScenesFromPrompt(text)
		if (extractedUseScenes.length) mergeUseScenes(extractedUseScenes)

		if (!form.stepsText.trim()) {
			const extractedSteps = extractStepsFromPrompt(text)
			if (extractedSteps.length) form.stepsText = extractedSteps.join('\n')
		}

		if (!form.variableNotes.trim() && placeholderVars.value.length) {
			form.variableNotes = placeholderVars.value.map(item => `{${item}}：替换为你的实际信息`).join('\n')
		}

		uni.showToast({
			title: `已整理 ${placeholderVars.value.length} 变量 / ${previewSteps.value.length} 步骤`,
			icon: 'none'
		})
	}

	const resetForm = () => {
		form.title = ''
		form.scene = ''
		form.brief = ''
		form.fullPrompt = ''
		form.useScenes = []
		form.stepsText = ''
		form.variableNotes = ''
		customUseSceneInput.value = ''
	}

	const resetFormWithConfirm = () => {
		if (!hasFormContent.value) {
			resetForm()
			return
		}
		uni.showModal({
			title: '确认清空？',
			content: '将清空当前填写内容，草稿不会被删除。',
			success: (res) => {
				if (!res.confirm) return
				resetForm()
				uni.showToast({ title: '已清空', icon: 'none' })
			}
		})
	}

	const formatDateTime = (timestamp: number) => {
		const date = new Date(timestamp)
		const month = `${date.getMonth() + 1}`.padStart(2, '0')
		const day = `${date.getDate()}`.padStart(2, '0')
		const hour = `${date.getHours()}`.padStart(2, '0')
		const minute = `${date.getMinutes()}`.padStart(2, '0')
		return `${month}-${day} ${hour}:${minute}`
	}

	const formatPublishDate = () => {
		const now = new Date()
		const y = now.getFullYear()
		const m = `${now.getMonth() + 1}`.padStart(2, '0')
		const d = `${now.getDate()}`.padStart(2, '0')
		return `${y}-${m}-${d}`
	}

	const saveDraft = (showToast = false) => {
		if (!hasFormContent.value) return
		const payload = {
			form: {
				title: form.title,
				scene: form.scene,
				brief: form.brief,
				fullPrompt: form.fullPrompt,
				useScenes: [...form.useScenes],
				stepsText: form.stepsText,
				variableNotes: form.variableNotes
			},
			updatedAt: Date.now()
		}
		uni.setStorageSync(SKILL_DRAFT_KEY, payload)
		restoredDraftAt.value = formatDateTime(payload.updatedAt)
		if (showToast) uni.showToast({ title: '草稿已保存', icon: 'success' })
	}

	const loadDraft = () => {
		const raw = uni.getStorageSync(SKILL_DRAFT_KEY)
		if (!raw || !raw.form) return false
		const data = raw.form

		form.title = data.title || ''
		form.scene = data.scene || ''
		form.brief = data.brief || ''
		form.fullPrompt = data.fullPrompt || ''
		form.useScenes = Array.isArray(data.useScenes) ? data.useScenes.slice(0, 8) : []
		form.stepsText = data.stepsText || ''
		form.variableNotes = data.variableNotes || ''
		customUseSceneInput.value = ''
		restoredDraftAt.value = raw.updatedAt ? formatDateTime(raw.updatedAt) : ''
		return true
	}

	const clearDraft = () => {
		uni.removeStorageSync(SKILL_DRAFT_KEY)
		restoredDraftAt.value = ''
		uni.showToast({ title: '草稿已删除', icon: 'none' })
	}

	const buildPublishedSkillPayload = () => {
		return {
			id: `p-${Date.now()}`,
			title: form.title.trim() || '新发布 Skill',
			scene: form.scene || '未分类',
			author: '我',
			authorColor: '#D6943A',
			publishTime: formatPublishDate(),
			copyCount: '0',
			favoriteCount: '0',
			successRate: '--',
			feedbackCount: '0',
			brief: previewBrief.value,
			useScenes: previewUseScenes.value,
			fullPrompt: form.fullPrompt.trim(),
			steps: previewSteps.value,
			variableNotes: resolvedVariableNotes.value,
			showConsume: false,
			avgInputToken: '',
			avgOutputToken: '',
			avgTotalToken: '',
			estimatedCost: '',
			recommendedModel: '--',
			commonModel: '--',
			totalUses: '0',
			weekUses: '0',
			feedbacks: [],
			similarSkills: []
		}
	}

	const publishSkill = () => {
		if (!canPublish.value) {
			uni.showToast({ title: '请补全标题、场景和 Prompt', icon: 'none' })
			return
		}

		uni.setStorageSync(PUBLISHED_SKILL_PREVIEW_KEY, buildPublishedSkillPayload())
		uni.removeStorageSync(SKILL_DRAFT_KEY)
		restoredDraftAt.value = ''
		uni.showToast({ title: '发布成功', icon: 'success' })

		setTimeout(() => {
			resetForm()
			uni.navigateTo({ url: '/pages/detail/skill?fromPublish=1' })
		}, 600)
	}

	let draftTimer: ReturnType<typeof setTimeout> | null = null
	const scheduleDraftSave = () => {
		if (draftTimer) clearTimeout(draftTimer)
		draftTimer = setTimeout(() => saveDraft(false), 600)
	}

	watch(form, scheduleDraftSave, { deep: true })

	onShow(() => {
		// #ifdef MP-WEIXIN
		uni.getTabBar(instance?.proxy)?.setData({ selected: 1 })
		// #endif
		if (!hasFormContent.value) loadDraft()
	})

	onUnmounted(() => {
		if (draftTimer) clearTimeout(draftTimer)
	})
</script>

<style lang="scss" scoped>
	.page {
		--accent: #e45c1a;
		--accent-soft: rgba(228, 92, 26, 0.1);
		--ink: #18181a;
		--ink-soft: rgba(24, 24, 26, 0.58);
		--line: rgba(24, 24, 26, 0.1);
		display: flex;
		flex-direction: column;
		height: 100%;
		background: #ffffff;
		font-family: 'DIN Alternate', 'PingFang SC', 'Hiragino Sans GB', sans-serif;
	}

	.top-bar {
		display: flex;
		align-items: flex-start;
		gap: 18rpx;
		padding: 28rpx 24rpx 20rpx;
		background: #ffffff;
		border-bottom: 1rpx solid var(--line);

		.top-main {
			flex: 1;
		}

		.top-title {
			display: block;
			font-size: 42rpx;
			font-weight: 900;
			color: var(--ink);
			line-height: 1.2;
		}

		.top-subtitle {
			display: block;
			margin-top: 8rpx;
			font-size: 24rpx;
			line-height: 1.5;
			color: var(--ink-soft);
		}

		.top-clear {
			height: 56rpx;
			padding: 0 20rpx;
			border-radius: 999rpx;
			background: rgba(0, 0, 0, 0.05);
			border: 1rpx solid rgba(0, 0, 0, 0.08);
			display: flex;
			align-items: center;
			justify-content: center;

			.top-clear-text {
				font-size: 22rpx;
				color: rgba(0, 0, 0, 0.55);
				font-weight: 600;
			}
		}
	}

	.draft-tip {
		margin: 16rpx 24rpx 0;
		padding: 16rpx 18rpx;
		border-radius: 16rpx;
		background: #fff7f2;
		border: 1rpx solid rgba(228, 92, 26, 0.2);
		display: flex;
		align-items: center;
		gap: 12rpx;

		.draft-tip-text {
			flex: 1;
			font-size: 22rpx;
			color: rgba(0, 0, 0, 0.55);
		}

		.draft-tip-btn {
			height: 46rpx;
			padding: 0 16rpx;
			border-radius: 999rpx;
			background: rgba(228, 92, 26, 0.12);
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.draft-tip-btn-text {
			font-size: 20rpx;
			color: var(--accent);
			font-weight: 700;
		}
	}

	.content {
		flex: 1;
		overflow: hidden;
	}

	.card {
		margin: 20rpx 24rpx 0;
		background: #ffffff;
		border-radius: 24rpx;
		border: 1rpx solid var(--line);
		padding: 24rpx;
	}

	.guide-card {
		background: linear-gradient(135deg, #fff6ef 0%, #fff 100%);
		border-color: rgba(228, 92, 26, 0.2);

		.guide-title {
			display: block;
			font-size: 26rpx;
			font-weight: 800;
			color: #b94b14;
			margin-bottom: 14rpx;
		}

		.guide-list {
			display: flex;
			flex-direction: column;
			gap: 8rpx;
		}

		.guide-item {
			display: block;
			font-size: 23rpx;
			color: rgba(0, 0, 0, 0.68);
			line-height: 1.55;
		}

		.guide-actions {
			display: flex;
			gap: 12rpx;
			margin-top: 16rpx;
		}

		.guide-btn {
			height: 56rpx;
			padding: 0 18rpx;
			background: rgba(228, 92, 26, 0.1);
			border: 1rpx solid rgba(228, 92, 26, 0.18);
			border-radius: 14rpx;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.guide-btn-text {
			font-size: 22rpx;
			font-weight: 700;
			color: var(--accent);
		}
	}

	.card-head {
		display: flex;
		align-items: center;
		gap: 12rpx;
		margin-bottom: 10rpx;
	}

	.card-title {
		flex: 1;
		font-size: 28rpx;
		font-weight: 800;
		color: var(--ink);
	}

	.card-flag {
		height: 40rpx;
		padding: 0 14rpx;
		border-radius: 999rpx;
		background: rgba(228, 92, 26, 0.14);
		color: var(--accent);
		font-size: 20rpx;
		font-weight: 700;
		display: inline-flex;
		align-items: center;
		justify-content: center;

		&.soft {
			background: rgba(0, 0, 0, 0.06);
			color: rgba(0, 0, 0, 0.45);
		}
	}

	.field {
		margin-top: 18rpx;
	}

	.field-label-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 10rpx;
	}

	.field-label {
		display: block;
		font-size: 24rpx;
		font-weight: 700;
		color: rgba(0, 0, 0, 0.62);
		margin-bottom: 10rpx;
	}

	.field-count {
		font-size: 20rpx;
		color: rgba(0, 0, 0, 0.36);
	}

	.field-input,
	.field-textarea {
		width: 100%;
		background: #ffffff;
		border-radius: 16rpx;
		border: 1rpx solid var(--line);
		padding: 0 18rpx;
		font-size: 26rpx;
		color: #1a1a1a;
	}

	.field-input {
		height: 84rpx;
	}

	.field-textarea {
		min-height: 220rpx;
		padding: 18rpx;
		line-height: 1.65;
	}

	.field-textarea.compact {
		min-height: 140rpx;
	}

	.field-textarea.code {
		background: #fff9f4;
		border-color: rgba(228, 92, 26, 0.22);
		font-family: 'SFMono-Regular', 'Menlo', 'Courier New', monospace;
		font-size: 24rpx;
	}

	.custom-scene {
		margin-top: 12rpx;
	}

	.chip-group {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
	}

	.chip {
		height: 62rpx;
		padding: 0 22rpx;
		border-radius: 15rpx;
		border: 1rpx solid rgba(0, 0, 0, 0.1);
		background: rgba(0, 0, 0, 0.04);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.18s ease;

		.chip-text {
			font-size: 23rpx;
			font-weight: 600;
			color: rgba(0, 0, 0, 0.58);
		}

		&.active {
			background: rgba(228, 92, 26, 0.12);
			border-color: rgba(228, 92, 26, 0.35);
			box-shadow: 0 6rpx 14rpx rgba(228, 92, 26, 0.12);

			.chip-text {
				color: var(--accent);
			}
		}
	}

	.tag-list {
		display: flex;
		flex-wrap: wrap;
		gap: 10rpx;
		margin-top: 12rpx;
	}

	.tag-item {
		display: flex;
		align-items: center;
		gap: 8rpx;
		height: 48rpx;
		padding: 0 14rpx;
		border-radius: 999rpx;
		background: rgba(0, 0, 0, 0.05);

		.tag-item-text {
			font-size: 21rpx;
			color: rgba(0, 0, 0, 0.62);
		}

		.tag-item-del {
			font-size: 22rpx;
			color: rgba(0, 0, 0, 0.4);
		}
	}

	.prompt-actions {
		display: flex;
		gap: 12rpx;
		margin-top: 16rpx;
	}

	.ghost-btn {
		height: 58rpx;
		padding: 0 18rpx;
		background: #ffffff;
		border: 1rpx solid rgba(228, 92, 26, 0.22);
		border-radius: 14rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		.ghost-btn-text {
			font-size: 22rpx;
			font-weight: 700;
			color: var(--accent);
		}
	}

	.preview-card {
		background: #fafafa;
		border-color: rgba(0, 0, 0, 0.08);
		margin-bottom: 8rpx;
	}

	.preview-score {
		font-size: 24rpx;
		font-weight: 800;
		color: #2f8a57;
	}

	.preview-head {
		margin-bottom: 10rpx;
	}

	.preview-scene {
		display: inline-flex;
		height: 42rpx;
		padding: 0 14rpx;
		border-radius: 999rpx;
		background: rgba(0, 0, 0, 0.06);
		font-size: 20rpx;
		color: rgba(0, 0, 0, 0.5);
		align-items: center;
	}

	.preview-title {
		display: block;
		font-size: 30rpx;
		font-weight: 900;
		color: #1a1a1a;
		line-height: 1.3;
		margin-bottom: 10rpx;
	}

	.preview-brief {
		display: block;
		font-size: 24rpx;
		color: rgba(0, 0, 0, 0.54);
		line-height: 1.6;
	}

	.preview-block {
		margin-top: 16rpx;
	}

	.preview-block-title {
		display: block;
		font-size: 22rpx;
		font-weight: 700;
		color: rgba(0, 0, 0, 0.68);
		margin-bottom: 10rpx;
	}

	.preview-scene-list {
		display: flex;
		flex-wrap: wrap;
		gap: 10rpx;
	}

	.preview-scene-chip {
		height: 44rpx;
		padding: 0 14rpx;
		border-radius: 999rpx;
		background: rgba(228, 92, 26, 0.12);
		border: 1rpx solid rgba(228, 92, 26, 0.2);
		display: flex;
		align-items: center;
	}

	.preview-scene-chip-text {
		font-size: 20rpx;
		font-weight: 600;
		color: #be4d15;
	}

	.preview-prompt-panel {
		background: #191a31;
		border-radius: 18rpx;
		padding: 20rpx;
		border: 1rpx solid rgba(255, 255, 255, 0.08);
	}

	.preview-prompt-text {
		display: block;
		font-size: 22rpx;
		line-height: 1.7;
		color: #b9c2ff;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.preview-steps {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
	}

	.preview-step-item {
		display: flex;
		align-items: flex-start;
		gap: 12rpx;
	}

	.preview-step-num {
		width: 38rpx;
		height: 38rpx;
		border-radius: 50%;
		background: var(--accent);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		margin-top: 2rpx;
	}

	.preview-step-num-text {
		font-size: 18rpx;
		font-weight: 800;
		color: #fff;
	}

	.preview-step-text {
		flex: 1;
		font-size: 22rpx;
		line-height: 1.55;
		color: rgba(0, 0, 0, 0.72);
	}

	.content-bottom {
		height: calc(180rpx + env(safe-area-inset-bottom));
	}

	.bottom-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		gap: 14rpx;
		padding: 14rpx 24rpx calc(14rpx + env(safe-area-inset-bottom));
		background: rgba(255, 255, 255, 0.98);
		border-top: 1rpx solid var(--line);
		backdrop-filter: blur(10px);
	}

	.draft-btn {
		width: 188rpx;
		height: 88rpx;
		border-radius: 22rpx;
		background: rgba(0, 0, 0, 0.06);
		border: 1rpx solid rgba(0, 0, 0, 0.1);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.draft-btn-text {
		font-size: 26rpx;
		font-weight: 700;
		color: rgba(0, 0, 0, 0.58);
	}

	.publish-btn {
		flex: 1;
		height: 88rpx;
		border-radius: 22rpx;
		background: var(--accent);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 10rpx 24rpx rgba(228, 92, 26, 0.24);

		&.disabled {
			background: rgba(0, 0, 0, 0.1);
			box-shadow: none;
		}
	}

	.publish-btn-text {
		font-size: 30rpx;
		font-weight: 800;
		color: #fff;
	}
</style>
