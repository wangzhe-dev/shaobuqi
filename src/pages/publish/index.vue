<template>
	<view class="page">

		<!-- 入口选择（默认视图） -->
		<view v-if="!activeMode" class="entry-view">
			<view class="entry-header">
				<text class="entry-title">发布</text>
				<text class="entry-subtitle">选择你想发布的内容类型</text>
			</view>

			<view class="entry-cards">
				<!-- 入口A：发布 Skill -->
				<view class="entry-card entry-card-skill" @tap="startPublishSkill">
					<view class="ec-icon-wrap">
						<text class="ec-icon">⚡</text>
					</view>
					<view class="ec-body">
						<text class="ec-title">发布 Skill</text>
						<text class="ec-desc">分享可复制、可复用的 AI 话术模板。让更多人复制你验证过的 Skill。</text>
						<view class="ec-tags">
							<text class="ec-tag">可复制模板</text>
							<text class="ec-tag">变量参数化</text>
							<text class="ec-tag">token透明</text>
						</view>
					</view>
					<text class="ec-arrow">→</text>
				</view>

				<!-- 入口B：记录一次使用 -->
				<view class="entry-card entry-card-record" @tap="startRecord">
					<view class="ec-icon-wrap ec-icon-wrap-blue">
						<text class="ec-icon">📝</text>
					</view>
					<view class="ec-body">
						<text class="ec-title">记录一次使用</text>
						<text class="ec-desc">记录你的一次 AI 使用经历，包括模型、消耗和效果，沉淀为社区数据。</text>
						<view class="ec-tags">
							<text class="ec-tag">模型+token</text>
							<text class="ec-tag">效果评价</text>
							<text class="ec-tag">关联Skill</text>
						</view>
					</view>
					<text class="ec-arrow">→</text>
				</view>
			</view>

			<!-- 草稿箱 -->
			<view class="draft-row" @tap="toDraftBox">
				<text class="draft-icon">📂</text>
				<text class="draft-text">草稿箱 (2)</text>
				<text class="draft-arrow">›</text>
			</view>
		</view>

		<!-- 发布 Skill —— 4步分步表单 -->
		<view v-if="activeMode === 'skill'" class="form-view">
			<!-- 步骤进度条 -->
			<view class="step-progress">
				<view class="sp-header">
					<view class="sp-back" @tap="backToEntry">
						<text class="sp-back-icon">←</text>
					</view>
					<text class="sp-title">发布 Skill</text>
					<view class="sp-draft-btn" @tap="saveDraft">
						<text class="sp-draft-text">存草稿</text>
					</view>
				</view>
				<view class="sp-bar">
					<view
						v-for="i in 4" :key="i"
						class="sp-segment"
						:class="{ active: skillStep >= i, done: skillStep > i }"
					/>
				</view>
				<text class="sp-hint">步骤 {{ skillStep }} / 4 · {{ stepHints[skillStep - 1] }}</text>
			</view>

			<scroll-view class="form-scroll" scroll-y :show-scrollbar="false">

				<!-- Step 1: 基本信息 -->
				<view v-if="skillStep === 1" class="form-step">
					<text class="form-section-title">基本信息</text>

					<view class="form-field">
						<text class="field-label">Skill 标题 *</text>
						<input class="field-input" v-model="form.title" placeholder="简洁有力的标题，20字以内" maxlength="20" />
					</view>

					<view class="form-field">
						<text class="field-label">一句话简介 *</text>
						<input class="field-input" v-model="form.summary" placeholder="描述这个Skill能做什么，40字以内" maxlength="40" />
					</view>

					<view class="form-field">
						<text class="field-label">场景分类 *</text>
						<view class="field-chips">
							<view
								v-for="s in scenes"
								:key="s"
								class="field-chip"
								:class="{ active: form.scene === s }"
								@tap="form.scene = s"
							>
								<text class="field-chip-text">{{ s }}</text>
							</view>
						</view>
					</view>

					<view class="form-field">
						<text class="field-label">标签（最多3个）</text>
						<input class="field-input" v-model="tagInput" placeholder="输入后按空格添加" @confirm="addTag" />
						<view class="tag-list">
							<view v-for="(tag, idx) in form.tags" :key="idx" class="added-tag">
								<text class="added-tag-text">{{ tag }}</text>
								<text class="added-tag-del" @tap="removeTag(idx)">×</text>
							</view>
						</view>
					</view>
				</view>

				<!-- Step 2: Skill 内容 -->
				<view v-if="skillStep === 2" class="form-step">
					<text class="form-section-title">Skill 内容</text>

					<view class="form-field">
						<view class="field-label-row">
							<text class="field-label">System Prompt *</text>
							<text class="field-count">{{ form.systemPrompt.length }}/500</text>
						</view>
						<textarea
							class="field-textarea"
							v-model="form.systemPrompt"
							placeholder="你的 System Prompt，告诉模型它是什么角色"
							:maxlength="500"
							:auto-height="true"
						/>
					</view>

					<view class="form-field">
						<view class="field-label-row">
							<text class="field-label">用户输入模板 *</text>
							<text class="field-count">{{ form.userTemplate.length }}/300</text>
						</view>
						<textarea
							class="field-textarea"
							v-model="form.userTemplate"
							placeholder="用{变量名}标记可替换的部分，如{topic}、{audience}"
							:maxlength="300"
							:auto-height="true"
						/>
						<text class="field-tip">使用 {变量名} 格式标记可替换内容</text>
					</view>

					<view class="form-field">
						<view class="field-label-row">
							<text class="field-label">使用说明</text>
						</view>
						<textarea
							class="field-textarea"
							v-model="form.usage"
							placeholder="可选：说明如何使用这个Skill，注意事项等"
							:maxlength="200"
							:auto-height="true"
						/>
					</view>
				</view>

				<!-- Step 3: 消耗信息 -->
				<view v-if="skillStep === 3" class="form-step">
					<text class="form-section-title">消耗信息</text>
					<text class="step-desc">这是烧不起的核心特色，帮助用户判断值不值得使用</text>

					<view class="form-field">
						<text class="field-label">推荐模型 *</text>
						<view class="field-chips">
							<view
								v-for="m in models"
								:key="m"
								class="field-chip"
								:class="{ active: form.recommendedModel === m }"
								@tap="form.recommendedModel = m"
							>
								<text class="field-chip-text">{{ m }}</text>
							</view>
						</view>
					</view>

					<view class="token-inputs">
						<view class="form-field ti-field">
							<text class="field-label">预计输入 token</text>
							<input class="field-input" v-model="form.avgInputToken" placeholder="如：1200" type="number" />
						</view>
						<view class="form-field ti-field">
							<text class="field-label">预计输出 token</text>
							<input class="field-input" v-model="form.avgOutputToken" placeholder="如：2000" type="number" />
						</view>
					</view>

					<view class="token-preview" v-if="totalToken">
						<text class="tp-label">预计总 token</text>
						<text class="tp-val">{{ totalToken }}</text>
					</view>

					<view class="form-field">
						<view class="field-label-row">
							<text class="field-label">示例输出（可选）</text>
						</view>
						<textarea
							class="field-textarea"
							v-model="form.sampleOutput"
							placeholder="粘贴一段实际输出，帮助用户判断质量"
							:maxlength="400"
							:auto-height="true"
						/>
					</view>
				</view>

				<!-- Step 4: 预览与发布 -->
				<view v-if="skillStep === 4" class="form-step">
					<text class="form-section-title">预览与发布</text>

					<!-- 预览卡 -->
					<view class="preview-card">
						<view class="prev-head">
							<view class="prev-scene-tag">{{ form.scene || '未分类' }}</view>
						</view>
						<text class="prev-title">{{ form.title || '(未填写标题)' }}</text>
						<text class="prev-summary">{{ form.summary || '(未填写简介)' }}</text>
						<view class="prev-meta">
							<view class="pm-item">
								<text class="pm-icon">⚡</text>
								<text class="pm-val orange">{{ totalToken || '--' }} tokens</text>
							</view>
							<view class="pm-item">
								<text class="pm-label">推荐模型</text>
								<text class="pm-val">{{ form.recommendedModel || '--' }}</text>
							</view>
						</view>
					</view>

					<!-- 发布校验 -->
					<view class="publish-checklist">
						<text class="pcl-title">发布前检查</text>
						<view v-for="check in publishChecks" :key="check.label" class="pcl-item">
							<text class="pcl-icon" :class="check.pass ? 'pass' : 'fail'">
								{{ check.pass ? '✓' : '✗' }}
							</text>
							<text class="pcl-label" :class="{ 'pcl-fail': !check.pass }">{{ check.label }}</text>
						</view>
					</view>
				</view>

				<view class="form-bottom" />
			</scroll-view>

			<!-- 步骤按钮 -->
			<view class="step-actions">
				<view v-if="skillStep > 1" class="step-prev-btn" @tap="prevStep">
					<text class="step-prev-text">上一步</text>
				</view>
				<view
					v-if="skillStep < 4"
					class="step-next-btn"
					:class="{ disabled: !canNext }"
					@tap="nextStep"
				>
					<text class="step-next-text">下一步</text>
				</view>
				<view v-if="skillStep === 4" class="step-publish-btn" :class="{ disabled: !canPublish }" @tap="publishSkill">
					<text class="step-publish-text">发布 Skill</text>
				</view>
			</view>
		</view>

		<!-- 记录一次使用 -->
		<view v-if="activeMode === 'record'" class="form-view">
			<view class="step-progress">
				<view class="sp-header">
					<view class="sp-back" @tap="backToEntry">
						<text class="sp-back-icon">←</text>
					</view>
					<text class="sp-title">记录一次使用</text>
					<view class="sp-draft-btn" @tap="saveDraft">
						<text class="sp-draft-text">存草稿</text>
					</view>
				</view>
			</view>

			<scroll-view class="form-scroll" scroll-y :show-scrollbar="false">
				<view class="form-step">
					<text class="form-section-title">使用记录</text>

					<view class="form-field">
						<text class="field-label">我做了什么任务 *</text>
						<textarea
							class="field-textarea"
							v-model="record.task"
							placeholder="简单描述这次AI使用的任务"
							:maxlength="100"
							:auto-height="true"
						/>
					</view>

					<view class="form-field">
						<text class="field-label">用了什么模型 *</text>
						<view class="field-chips">
							<view
								v-for="m in models"
								:key="m"
								class="field-chip"
								:class="{ active: record.model === m }"
								@tap="record.model = m"
							>
								<text class="field-chip-text">{{ m }}</text>
							</view>
						</view>
					</view>

					<view class="token-inputs">
						<view class="form-field ti-field">
							<text class="field-label">输入 token</text>
							<input class="field-input" v-model="record.inputToken" placeholder="如：1200" type="number" />
						</view>
						<view class="form-field ti-field">
							<text class="field-label">输出 token</text>
							<input class="field-input" v-model="record.outputToken" placeholder="如：2000" type="number" />
						</view>
					</view>

					<view class="form-field">
						<text class="field-label">最终效果 *</text>
						<view class="field-chips">
							<view
								v-for="e in ['成功 ✅', '一般 🆗', '翻车 ❌']"
								:key="e"
								class="field-chip"
								:class="{ active: record.result === e }"
								@tap="record.result = e"
							>
								<text class="field-chip-text">{{ e }}</text>
							</view>
						</view>
					</view>

					<view class="form-field">
						<text class="field-label">简短感受（可选）</text>
						<textarea
							class="field-textarea"
							v-model="record.comment"
							placeholder="用几句话描述你的体验"
							:maxlength="150"
							:auto-height="true"
						/>
					</view>
				</view>

				<view class="form-bottom" />
			</scroll-view>

			<view class="step-actions">
				<view class="step-publish-btn" @tap="publishRecord">
					<text class="step-publish-text">发布记录</text>
				</view>
			</view>
		</view>

		<tab-bar v-if="!activeMode" current="/pages/publish/index" />
	</view>
</template>

<script setup lang="ts">
	const activeMode = ref<'skill' | 'record' | null>(null)
	const skillStep = ref(1)
	const tagInput = ref('')

	const form = reactive({
		title: '',
		summary: '',
		scene: '',
		tags: [] as string[],
		systemPrompt: '',
		userTemplate: '',
		usage: '',
		recommendedModel: '',
		avgInputToken: '',
		avgOutputToken: '',
		sampleOutput: ''
	})

	const record = reactive({
		task: '',
		model: '',
		inputToken: '',
		outputToken: '',
		result: '',
		comment: ''
	})

	const scenes = ['写作', '编程', '自媒体', '办公', '运营', '学习', '设计', '电商']
	const models = ['Claude Sonnet', 'Claude Opus', 'GPT-4o', 'GPT-4o-mini', 'DeepSeek', 'Gemini Pro']

	const stepHints = ['填写基本信息', '填写Skill内容', '填写消耗信息', '预览并发布']

	const totalToken = computed(() => {
		const i = parseInt(form.avgInputToken) || 0
		const o = parseInt(form.avgOutputToken) || 0
		if (!i && !o) return ''
		return ((i + o) / 1000).toFixed(1) + 'k'
	})

	const canNext = computed(() => {
		if (skillStep.value === 1) return form.title && form.summary && form.scene
		if (skillStep.value === 2) return form.systemPrompt && form.userTemplate
		if (skillStep.value === 3) return form.recommendedModel
		return true
	})

	const publishChecks = computed(() => [
		{ label: '已填写标题', pass: !!form.title },
		{ label: '已填写简介', pass: !!form.summary },
		{ label: '已选择场景', pass: !!form.scene },
		{ label: '已填写 System Prompt', pass: !!form.systemPrompt },
		{ label: '已填写用户输入模板', pass: !!form.userTemplate },
		{ label: '已选择推荐模型', pass: !!form.recommendedModel }
	])

	const canPublish = computed(() => publishChecks.value.every(c => c.pass))

	const addTag = () => {
		const t = tagInput.value.trim()
		if (t && form.tags.length < 3 && !form.tags.includes(t)) {
			form.tags.push(t)
		}
		tagInput.value = ''
	}

	const removeTag = (idx: number) => {
		form.tags.splice(idx, 1)
	}

	const startPublishSkill = () => {
		activeMode.value = 'skill'
		skillStep.value = 1
	}

	const startRecord = () => {
		activeMode.value = 'record'
	}

	const backToEntry = () => {
		activeMode.value = null
	}

	const nextStep = () => {
		if (canNext.value && skillStep.value < 4) skillStep.value++
	}

	const prevStep = () => {
		if (skillStep.value > 1) skillStep.value--
	}

	const saveDraft = () => {
		uni.showToast({ title: '已存入草稿箱', icon: 'success' })
	}

	const publishSkill = () => {
		if (!canPublish.value) return
		uni.showToast({ title: 'Skill 发布成功！', icon: 'success' })
		setTimeout(() => {
			activeMode.value = null
			skillStep.value = 1
		}, 1500)
	}

	const publishRecord = () => {
		uni.showToast({ title: '使用记录发布成功！', icon: 'success' })
		setTimeout(() => {
			activeMode.value = null
		}, 1500)
	}

	const toDraftBox = () => {
		uni.showToast({ title: '草稿箱功能开发中', icon: 'none' })
	}
</script>

<style lang="scss" scoped>
	.page {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: #0B0D12;
	}

	/* 入口视图 */
	.entry-view {
		flex: 1;
		padding: 0 24rpx;
		overflow-y: auto;

		.entry-header {
			padding: 48rpx 0 32rpx;

			.entry-title { display: block; font-size: 44rpx; font-weight: 900; color: #F5F7FA; margin-bottom: 10rpx; }
			.entry-subtitle { display: block; font-size: 26rpx; color: rgba(255,255,255,0.45); }
		}

		.entry-cards {
			display: flex;
			flex-direction: column;
			gap: 20rpx;
			margin-bottom: 28rpx;
		}
	}

	.entry-card {
		background: #141922;
		border-radius: 28rpx;
		border: 1rpx solid rgba(255,255,255,0.08);
		padding: 28rpx;
		display: flex;
		align-items: flex-start;
		gap: 20rpx;

		&:active { background: #1A2030; }

		&.entry-card-skill { border-color: rgba(255,122,26,0.2); }
		&.entry-card-record { border-color: rgba(93,169,255,0.2); }

		.ec-icon-wrap {
			width: 88rpx;
			height: 88rpx;
			border-radius: 24rpx;
			background: rgba(255,122,26,0.15);
			border: 1rpx solid rgba(255,122,26,0.25);
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;

			.ec-icon { font-size: 40rpx; }

			&.ec-icon-wrap-blue {
				background: rgba(93,169,255,0.15);
				border-color: rgba(93,169,255,0.25);
			}
		}

		.ec-body {
			flex: 1;

			.ec-title { display: block; font-size: 30rpx; font-weight: 800; color: #F5F7FA; margin-bottom: 10rpx; }
			.ec-desc { display: block; font-size: 24rpx; color: rgba(255,255,255,0.5); line-height: 1.6; margin-bottom: 16rpx; }

			.ec-tags {
				display: flex;
				flex-wrap: wrap;
				gap: 10rpx;

				.ec-tag {
					font-size: 18rpx;
					color: rgba(255,255,255,0.4);
					background: rgba(255,255,255,0.06);
					padding: 4rpx 14rpx;
					border-radius: 8rpx;
				}
			}
		}

		.ec-arrow { font-size: 32rpx; color: rgba(255,255,255,0.3); flex-shrink: 0; margin-top: 24rpx; }
	}

	.draft-row {
		display: flex;
		align-items: center;
		gap: 14rpx;
		background: rgba(255,255,255,0.05);
		border-radius: 20rpx;
		padding: 24rpx 28rpx;
		margin-bottom: calc(160rpx + env(safe-area-inset-bottom));

		.draft-icon { font-size: 32rpx; }
		.draft-text { flex: 1; font-size: 26rpx; color: rgba(255,255,255,0.6); font-weight: 500; }
		.draft-arrow { font-size: 28rpx; color: rgba(255,255,255,0.3); }
	}

	/* 表单视图 */
	.form-view {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	/* 步骤进度条 */
	.step-progress {
		padding: 20rpx 24rpx 16rpx;
		background: #0B0D12;
		border-bottom: 1rpx solid rgba(255,255,255,0.06);
		flex-shrink: 0;

		.sp-header {
			display: flex;
			align-items: center;
			gap: 16rpx;
			margin-bottom: 20rpx;

			.sp-back {
				width: 60rpx;
				height: 60rpx;
				background: rgba(255,255,255,0.07);
				border-radius: 18rpx;
				display: flex;
				align-items: center;
				justify-content: center;

				.sp-back-icon { font-size: 28rpx; color: #F5F7FA; }
			}

			.sp-title { flex: 1; font-size: 30rpx; font-weight: 700; color: #F5F7FA; }

			.sp-draft-btn {
				background: rgba(255,255,255,0.07);
				border-radius: 100rpx;
				padding: 10rpx 22rpx;

				.sp-draft-text { font-size: 22rpx; color: rgba(255,255,255,0.55); }
			}
		}

		.sp-bar {
			display: flex;
			gap: 8rpx;
			margin-bottom: 12rpx;

			.sp-segment {
				flex: 1;
				height: 6rpx;
				background: rgba(255,255,255,0.12);
				border-radius: 3rpx;
				transition: background 0.3s;

				&.active { background: #FF7A1A; }
				&.done { background: rgba(255,122,26,0.4); }
			}
		}

		.sp-hint { font-size: 22rpx; color: rgba(255,255,255,0.45); }
	}

	.form-scroll { flex: 1; overflow: hidden; }

	.form-step {
		padding: 28rpx 24rpx 0;

		.form-section-title {
			display: block;
			font-size: 30rpx;
			font-weight: 700;
			color: #F5F7FA;
			margin-bottom: 8rpx;
		}

		.step-desc {
			display: block;
			font-size: 24rpx;
			color: rgba(255,255,255,0.4);
			line-height: 1.5;
			margin-bottom: 28rpx;
		}
	}

	.form-field {
		margin-top: 28rpx;

		.field-label {
			display: block;
			font-size: 24rpx;
			font-weight: 600;
			color: rgba(255,255,255,0.65);
			margin-bottom: 14rpx;
		}

		.field-label-row {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 14rpx;

			.field-label { margin-bottom: 0; }
			.field-count { font-size: 20rpx; color: rgba(255,255,255,0.35); }
		}

		.field-input {
			width: 100%;
			height: 80rpx;
			background: #141922;
			border-radius: 16rpx;
			border: 1rpx solid rgba(255,255,255,0.1);
			padding: 0 20rpx;
			font-size: 26rpx;
			color: #F5F7FA;

			&:focus { border-color: rgba(255,122,26,0.4); }
		}

		.field-textarea {
			width: 100%;
			min-height: 160rpx;
			background: #141922;
			border-radius: 16rpx;
			border: 1rpx solid rgba(255,255,255,0.1);
			padding: 20rpx;
			font-size: 26rpx;
			color: #F5F7FA;
			line-height: 1.65;
		}

		.field-tip {
			display: block;
			font-size: 20rpx;
			color: rgba(255,122,26,0.6);
			margin-top: 8rpx;
		}

		.field-chips {
			display: flex;
			flex-wrap: wrap;
			gap: 12rpx;

			.field-chip {
				height: 64rpx;
				padding: 0 24rpx;
				background: rgba(255,255,255,0.07);
				border-radius: 16rpx;
				border: 1rpx solid rgba(255,255,255,0.1);
				display: flex;
				align-items: center;
				transition: all 0.2s;

				.field-chip-text { font-size: 24rpx; color: rgba(255,255,255,0.6); }

				&.active {
					background: rgba(255,122,26,0.15);
					border-color: rgba(255,122,26,0.4);

					.field-chip-text { color: #FF7A1A; font-weight: 600; }
				}
			}
		}

		.tag-list {
			display: flex;
			flex-wrap: wrap;
			gap: 10rpx;
			margin-top: 12rpx;

			.added-tag {
				display: flex;
				align-items: center;
				gap: 8rpx;
				background: rgba(93,169,255,0.12);
				border: 1rpx solid rgba(93,169,255,0.25);
				padding: 6rpx 16rpx;
				border-radius: 100rpx;

				.added-tag-text { font-size: 22rpx; color: #5DA9FF; }
				.added-tag-del { font-size: 24rpx; color: rgba(93,169,255,0.6); }
			}
		}
	}

	.token-inputs {
		display: flex;
		gap: 16rpx;

		.ti-field { flex: 1; }
	}

	.token-preview {
		margin-top: 16rpx;
		background: rgba(255,122,26,0.08);
		border-radius: 16rpx;
		border: 1rpx solid rgba(255,122,26,0.2);
		padding: 16rpx 24rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;

		.tp-label { font-size: 22rpx; color: rgba(255,255,255,0.5); }
		.tp-val { font-size: 30rpx; font-weight: 800; color: #FF7A1A; }
	}

	/* 预览卡 */
	.preview-card {
		background: rgba(255,255,255,0.04);
		border-radius: 20rpx;
		border: 1rpx solid rgba(255,255,255,0.08);
		padding: 24rpx;
		margin-bottom: 28rpx;

		.prev-head { margin-bottom: 14rpx; }

		.prev-scene-tag {
			display: inline-flex;
			font-size: 20rpx;
			color: rgba(255,255,255,0.5);
			background: rgba(255,255,255,0.08);
			padding: 5rpx 16rpx;
			border-radius: 8rpx;
		}

		.prev-title {
			display: block;
			font-size: 30rpx;
			font-weight: 800;
			color: #F5F7FA;
			margin-bottom: 10rpx;
		}

		.prev-summary {
			display: block;
			font-size: 24rpx;
			color: rgba(255,255,255,0.5);
			line-height: 1.6;
			margin-bottom: 18rpx;
		}

		.prev-meta {
			display: flex;
			gap: 24rpx;

			.pm-item {
				display: flex;
				align-items: center;
				gap: 8rpx;

				.pm-icon { font-size: 22rpx; }
				.pm-label { font-size: 20rpx; color: rgba(255,255,255,0.4); }
				.pm-val { font-size: 24rpx; font-weight: 600; color: rgba(255,255,255,0.7); }
				.pm-val.orange { color: #FF7A1A; }
			}
		}
	}

	/* 发布校验清单 */
	.publish-checklist {
		background: rgba(255,255,255,0.04);
		border-radius: 20rpx;
		padding: 24rpx;

		.pcl-title {
			display: block;
			font-size: 24rpx;
			font-weight: 600;
			color: rgba(255,255,255,0.55);
			margin-bottom: 18rpx;
		}

		.pcl-item {
			display: flex;
			align-items: center;
			gap: 14rpx;
			padding: 12rpx 0;
			border-bottom: 1rpx solid rgba(255,255,255,0.05);

			&:last-child { border-bottom: none; }

			.pcl-icon {
				font-size: 26rpx;
				font-weight: 700;
				width: 40rpx;
				text-align: center;

				&.pass { color: #4CD964; }
				&.fail { color: rgba(255,255,255,0.2); }
			}

			.pcl-label { font-size: 24rpx; color: rgba(255,255,255,0.7); }
			.pcl-fail { color: rgba(255,255,255,0.35); }
		}
	}

	.form-bottom { height: calc(160rpx + env(safe-area-inset-bottom)); }

	/* 步骤操作按钮 */
	.step-actions {
		display: flex;
		gap: 16rpx;
		padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
		background: rgba(11,13,18,0.95);
		backdrop-filter: blur(20px);
		border-top: 1rpx solid rgba(255,255,255,0.06);
		flex-shrink: 0;

		.step-prev-btn {
			flex: 1;
			height: 88rpx;
			background: rgba(255,255,255,0.07);
			border-radius: 24rpx;
			border: 1rpx solid rgba(255,255,255,0.12);
			display: flex;
			align-items: center;
			justify-content: center;

			.step-prev-text { font-size: 28rpx; color: rgba(255,255,255,0.6); font-weight: 600; }
		}

		.step-next-btn, .step-publish-btn {
			flex: 2;
			height: 88rpx;
			background: linear-gradient(135deg, #FF7A1A 0%, #E05A00 100%);
			border-radius: 24rpx;
			box-shadow: 0 8rpx 24rpx rgba(255,122,26,0.35);
			display: flex;
			align-items: center;
			justify-content: center;

			.step-next-text, .step-publish-text { font-size: 28rpx; color: #fff; font-weight: 700; }

			&.disabled {
				background: rgba(255,255,255,0.1);
				box-shadow: none;

				.step-next-text, .step-publish-text { color: rgba(255,255,255,0.35); }
			}
		}
	}
</style>
