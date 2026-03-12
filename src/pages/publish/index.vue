<template>
	<view class="page">

		<view class="page-head">
			<view class="page-head-copy">
				<text class="page-kicker">发布</text>
				<text class="page-title">这次你想发哪一种？</text>
				<text class="page-sub">一条烧榜动态，或者一个可复用的 Skill。入口只做这两件事。</text>
			</view>
			<view class="page-head-icon">
				<uni-icons type="compose" color="#FFFFFF" size="24" />
			</view>
		</view>

		<view class="daily-strip">
			<uni-notice-bar
				show-icon
				show-get-more
				more-text="去看看"
				text="今日已有 3,847 人记录了烧榜"
				background-color="rgba(239, 68, 68, 0.08)"
				color="#B91C1C"
				more-color="#5B5BD6"
				@click="goLogBurn"
				@getmore="goLogBurn"
			/>
		</view>

		<view class="section-copy">
			<text class="section-title">1. 发一条烧榜动态</text>
			<text class="section-desc">核心就是花了多少、现在什么心情、想吐槽什么。</text>
		</view>

		<view class="action-card burn-entry" @tap="goLogBurn">
			<view class="card-deco burn-deco" />
			<view class="card-head">
				<view class="card-badge card-badge-burn">
					<uni-icons type="fire-filled" color="#FCA5A5" size="12" />
					<text>烧榜动态</text>
				</view>
				<text class="card-head-tip">适合即时发一笔今天的真实消耗</text>
			</view>
			<view class="card-main">
				<view class="card-icon burn-icon-wrap">
					<uni-icons type="fire-filled" color="#FFF7ED" size="28" />
				</view>
				<view class="card-copy">
					<text class="card-title light">我今天烧了多少</text>
					<text class="card-desc light">带上金额、心情和一句吐槽，发出去就是一条完整动态。</text>
				</view>
			</view>

			<view class="burn-field-row" @tap.stop>
				<view class="burn-field amount-field">
					<text class="field-label">花了多少</text>
					<view class="amount-input-wrap">
						<text class="amount-currency">¥</text>
						<uni-easyinput
							v-model="burnAmount"
							class="amount-input"
							type="digit"
							placeholder="0.00"
							:input-border="false"
							:clearable="false"
							:styles="amountInputStyles"
						/>
					</view>
				</view>
				<view class="burn-field mood-field">
					<text class="field-label">现在心情</text>
					<view class="mood-pills">
						<uni-data-checkbox
							v-model="selectedMood"
							mode="tag"
							wrap
							:selectedColor="'rgba(251, 191, 36, 0.2)'"
							selectedTextColor="#FDE68A"
							:localdata="quickMoodOptions"
						/>
					</view>
				</view>
			</view>

			<view class="rant-box" @tap.stop>
				<text class="field-label">吐槽一句</text>
				<textarea
					v-model="burnRant"
					class="rant-textarea"
					auto-height
					maxlength="80"
					placeholder="比如：来回改了 9 版，最后客户说还是第一版好。"
					placeholder-class="rant-placeholder"
				/>
				<view class="rant-meta">
					<text class="rant-meta-text">写一句场景或吐槽，动态会更有共鸣。</text>
					<text class="rant-count">{{ burnRant.length }}/80</text>
				</view>
			</view>

			<view class="burn-model-box" @tap.stop>
				<text class="field-label">顺手补充模型</text>
				<view class="model-pills">
					<uni-data-checkbox
						v-model="selectedModel"
						mode="tag"
						wrap
						:selectedColor="'rgba(239, 68, 68, 0.3)'"
						selectedTextColor="#FCA5A5"
						:localdata="quickModelOptions"
					/>
				</view>
			</view>

			<view class="preview-block">
				<text class="preview-label">动态预览</text>
				<text class="preview-text">{{ burnPostPreview }}</text>
			</view>

			<view class="card-foot">
				<view class="foot-copy light">
					<uni-icons type="chatboxes-filled" color="#FBBF24" size="15" />
					<text class="foot-copy-text">{{ burnHelperText }}</text>
				</view>
				<view class="card-cta burn-cta" @tap.stop="goLogBurn">
					<text class="card-cta-text">去发烧榜动态</text>
					<uni-icons type="arrowright" color="#FFFFFF" size="15" />
				</view>
			</view>
		</view>

		<view class="section-copy section-gap-top">
			<text class="section-title">2. 发布一个 Skill</text>
			<text class="section-desc">不是发情绪，而是沉淀一个能反复被别人使用的内容。</text>
		</view>

		<view class="action-card skill-entry" @tap="goPublishSkill">
			<view class="card-deco skill-deco" />
			<view class="card-head">
				<view class="card-badge card-badge-skill">
					<uni-icons type="star-filled" color="#5B5BD6" size="12" />
					<text>Skill 发布</text>
				</view>
				<text class="card-head-tip dark">适合沉淀提示词、模板、工作流</text>
			</view>
			<view class="card-main">
				<view class="card-icon skill-icon-wrap">
					<uni-icons type="compose" color="#FFFFFF" size="26" />
				</view>
				<view class="card-copy">
					<text class="card-title dark">把经验整理成一个 Skill</text>
					<text class="card-desc dark">别人点进去后应该能直接拿走内容，用完就有结果。</text>
				</view>
			</view>

			<view class="skill-type-box" @tap.stop>
				<text class="field-label dark">这次准备发布什么</text>
				<view class="skill-type-pills">
					<uni-data-checkbox
						v-model="selectedSkillType"
						mode="tag"
						wrap
						:selectedColor="'rgba(91, 91, 214, 0.14)'"
						selectedTextColor="#5B5BD6"
						:localdata="skillTypeOptions"
					/>
				</view>
			</view>

			<view class="skill-outline">
				<view v-for="item in skillOutline" :key="item.title" class="skill-outline-item">
					<view class="skill-outline-index">{{ item.index }}</view>
					<view class="skill-outline-copy">
						<text class="skill-outline-title">{{ item.title }}</text>
						<text class="skill-outline-desc">{{ item.desc }}</text>
					</view>
				</view>
			</view>

			<view class="skill-tags">
				<uni-tag v-for="tag in skillTags" :key="tag" :text="tag" type="primary" size="mini" circle inverted />
			</view>

			<view class="card-foot">
				<view class="foot-copy dark">
					<uni-icons type="folder-add-filled" color="#5B5BD6" size="15" />
					<text class="foot-copy-text">Skill 更看重可复用、可收藏、可搜索，不是即时吐槽。</text>
				</view>
				<view class="card-cta skill-cta" @tap.stop="goPublishSkill">
					<text class="card-cta-text skill-text">去发布 Skill</text>
					<uni-icons type="arrowright" color="#5B5BD6" size="15" />
				</view>
			</view>
		</view>

		<view class="support-wrap">
			<view class="draft-entry" @tap="goDraft">
				<view class="draft-left">
					<view class="draft-icon-wrap">
						<uni-icons type="compose" color="#5B5BD6" size="20" />
					</view>
					<view class="draft-copy">
						<text class="draft-title">草稿箱</text>
						<text class="draft-sub">{{ draftSummary }}</text>
					</view>
				</view>
				<view class="draft-right">
					<uni-badge class="draft-count" :text="draftCount" type="primary" size="small" />
					<uni-icons type="arrowright" color="#CBD5E1" size="15" />
				</view>
			</view>

			<view class="notice-block">
				<view class="notice-head">
					<uni-icons type="info-filled" color="#5B5BD6" size="16" />
					<text class="notice-title">发布前确认</text>
				</view>
				<view class="notice-list">
					<view v-for="item in noticeItems" :key="item" class="notice-row">
						<uni-icons type="checkmarkempty" color="#5B5BD6" size="14" />
						<text class="notice-item">{{ item }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- #ifdef H5 -->
		<view class="tab-bar-placeholder" />
		<!-- #endif -->

		<tab-bar current="/pages/publish/index" />
	</view>
</template>

<script setup lang="ts">
	const quickModels = ['Claude', 'GPT-4o', 'DeepSeek', 'Gemini']
	const quickMoods = [
		{ emoji: '✅', label: '值了' },
		{ emoji: '😐', label: '还行' },
		{ emoji: '😭', label: '后悔了' },
		{ emoji: '🔥', label: '上瘾了' }
	]
	const skillTypes = ['提示词', '模板', '工作流']
	const skillOutline = [
		{ index: '01', title: '写清标题和用途', desc: '别人一眼就知道这个 Skill 是解决什么问题的。' },
		{ index: '02', title: '放入可直接复用内容', desc: '不是讲思路，而是把提示词、模板或步骤给全。' },
		{ index: '03', title: '补充标签和场景', desc: '方便别人搜索、收藏和判断适不适合自己。' }
	]
	const skillTags = ['提示词', '模板', '工作流']
	const noticeItems = [
		'烧榜动态请填写真实消费数据，不允许虚构',
		'Skill 内容需经过真实验证，发出去后能直接使用',
		'禁止发布违法、广告、引流等内容'
	]

	const selectedModel = ref('Claude')
	const selectedMood = ref('值了')
	const selectedSkillType = ref('提示词')
	const burnAmount = ref('')
	const burnRant = ref('')
	const draftCount = ref(2)

	const quickModelOptions = quickModels.map((model) => ({ text: model, value: model }))
	const quickMoodOptions = quickMoods.map((mood) => ({ text: `${mood.emoji} ${mood.label}`, value: mood.label }))
	const skillTypeOptions = skillTypes.map((type) => ({ text: type, value: type }))

	const amountInputStyles = {
		color: '#FFFFFF',
		backgroundColor: 'transparent',
		borderColor: 'transparent',
		disableColor: 'transparent'
	}

	const hasBurnAmount = computed(() => burnAmount.value.trim() !== '' && !Number.isNaN(Number(burnAmount.value)))
	const burnAmountNumber = computed(() => Number(burnAmount.value) || 0)
	const burnAmountLabel = computed(() => (hasBurnAmount.value ? `¥${burnAmountNumber.value.toFixed(2)}` : '一笔新的花费'))
	const burnRantLabel = computed(() => burnRant.value.trim() || '还没开始吐槽，但已经想发了。')
	const burnPostPreview = computed(() => `今天用 ${selectedModel.value} 烧了 ${burnAmountLabel.value}，现在感觉 ${selectedMood.value}。${burnRantLabel.value}`)
	const burnHelperText = computed(() => {
		if (!burnRant.value.trim()) return '先写一句吐槽或场景，动态会更像真实分享。'
		if (!hasBurnAmount.value) return '金额还没填，别人会更关心你这次到底烧了多少。'
		return '这条动态的信息已经够完整了，发出去会更容易引发共鸣。'
	})
	const draftSummary = computed(() => `还有 ${draftCount.value} 条内容没发完，可以继续接着写`)

	const goLogBurn = () => {
		uni.showToast({ title: '烧榜记录功能开发中', icon: 'none' })
	}

	const goPublishSkill = () => {
		uni.showToast({ title: 'Skill 发布功能开发中', icon: 'none' })
	}

	const goDraft = () => {
		uni.showToast({ title: '草稿箱功能开发中', icon: 'none' })
	}
</script>

<style lang="scss" scoped>
	.page {
		--ink: #0f172a;
		--muted: #64748b;
		--line: #e8edf5;
		--burn-bg-1: #17143c;
		--burn-bg-2: #35245f;
		--burn-bg-3: #7c2d12;
		padding: 24rpx 24rpx 190rpx;
		min-height: 100vh;
		background:
			radial-gradient(circle at top left, rgba(91, 91, 214, 0.07), transparent 26%),
			linear-gradient(180deg, #f4f6fb 0%, #f7f8fa 260rpx);
	}

	.page-head {
		display: flex;
		align-items: flex-start;
		gap: 18rpx;
		margin-bottom: 18rpx;
		padding: 10rpx 4rpx 0;
	}

	.page-head-copy {
		flex: 1;
	}

	.page-kicker {
		display: inline-block;
		margin-bottom: 10rpx;
		padding: 6rpx 12rpx;
		border-radius: 999rpx;
		font-size: 20rpx;
		color: #5b5bd6;
		background: rgba(91, 91, 214, 0.08);
	}

	.page-title {
		display: block;
		margin-bottom: 8rpx;
		font-size: 42rpx;
		line-height: 1.2;
		font-weight: 800;
		color: var(--ink);
	}

	.page-sub {
		font-size: 24rpx;
		line-height: 1.7;
		color: var(--muted);
	}

	.page-head-icon {
		width: 78rpx;
		height: 78rpx;
		border-radius: 22rpx;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #5b5bd6, #8b5cf6);
		box-shadow: 0 16rpx 30rpx rgba(91, 91, 214, 0.18);
	}

	.daily-strip {
		margin-bottom: 18rpx;

		:deep(.uni-noticebar) {
			border-radius: 18rpx;
			padding: 0 10rpx;
		}

		:deep(.uni-noticebar__content-text),
		:deep(.uni-noticebar__more text) {
			font-size: 24rpx !important;
		}
	}

	.section-copy {
		margin-bottom: 14rpx;
		padding: 0 4rpx;
	}

	.section-gap-top {
		margin-top: 18rpx;
	}

	.section-title {
		display: block;
		margin-bottom: 6rpx;
		font-size: 30rpx;
		font-weight: 800;
		color: var(--ink);
	}

	.section-desc {
		font-size: 22rpx;
		line-height: 1.6;
		color: var(--muted);
	}

	.action-card {
		position: relative;
		overflow: hidden;
		border-radius: 28rpx;
		padding: 24rpx;
	}

	.card-deco {
		position: absolute;
		right: -36rpx;
		top: -28rpx;
		width: 180rpx;
		height: 180rpx;
		border-radius: 50%;
		filter: blur(6rpx);
		opacity: 0.55;
	}

	.burn-deco {
		background: rgba(249, 115, 22, 0.18);
	}

	.skill-deco {
		background: rgba(91, 91, 214, 0.1);
	}

	.card-head,
	.card-main,
	.preview-block,
	.card-foot {
		position: relative;
		z-index: 1;
	}

	.card-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12rpx;
		margin-bottom: 18rpx;
	}

	.card-badge {
		display: inline-flex;
		align-items: center;
		gap: 6rpx;
		padding: 6rpx 14rpx;
		border-radius: 999rpx;
		font-size: 20rpx;
		font-weight: 700;
	}

	.card-badge-burn {
		color: #fca5a5;
		background: rgba(239, 68, 68, 0.16);
	}

	.card-badge-skill {
		color: #5b5bd6;
		background: rgba(91, 91, 214, 0.08);
	}

	.card-head-tip {
		font-size: 20rpx;
	}

	.card-head-tip.dark {
		color: #94a3b8;
	}

	.card-main {
		display: flex;
		align-items: flex-start;
		gap: 16rpx;
		margin-bottom: 18rpx;
	}

	.card-icon {
		width: 82rpx;
		height: 82rpx;
		border-radius: 22rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.burn-icon-wrap {
		background: linear-gradient(135deg, rgba(239, 68, 68, 0.34), rgba(251, 146, 60, 0.24));
		box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.12);
	}

	.skill-icon-wrap {
		background: linear-gradient(135deg, #5b5bd6, #8b5cf6);
		box-shadow: 0 12rpx 24rpx rgba(91, 91, 214, 0.16);
	}

	.card-copy {
		flex: 1;
	}

	.card-title {
		display: block;
		margin-bottom: 8rpx;
		font-size: 34rpx;
		line-height: 1.25;
		font-weight: 800;
	}

	.card-title.light,
	.card-desc.light,
	.card-head-tip,
	.foot-copy.light,
	.preview-label,
	.preview-text,
	.field-label,
	.rant-meta-text,
	.rant-count {
		color: #ffffff;
	}

	.card-title.dark {
		color: var(--ink);
	}

	.card-desc {
		font-size: 24rpx;
		line-height: 1.6;
	}

	.card-desc.light {
		color: rgba(255, 255, 255, 0.7);
	}

	.card-desc.dark {
		color: var(--muted);
	}

	.burn-entry {
		background: linear-gradient(145deg, var(--burn-bg-1) 0%, var(--burn-bg-2) 52%, var(--burn-bg-3) 100%);
		box-shadow: 0 22rpx 48rpx rgba(54, 31, 74, 0.16);
	}

	.burn-field-row {
		position: relative;
		z-index: 1;
		display: grid;
		grid-template-columns: 1.05fr 1.35fr;
		gap: 14rpx;
		margin-bottom: 14rpx;
	}

	.burn-field,
	.rant-box,
	.burn-model-box,
	.preview-block {
		border-radius: 18rpx;
		background: rgba(255, 255, 255, 0.08);
		border: 1rpx solid rgba(255, 255, 255, 0.08);
	}

	.burn-field,
	.rant-box,
	.burn-model-box {
		position: relative;
		z-index: 1;
		padding: 18rpx;
	}

	.field-label {
		display: block;
		margin-bottom: 10rpx;
		font-size: 22rpx;
		color: rgba(255, 255, 255, 0.58);
	}

	.field-label.dark {
		color: #64748b;
	}

	.amount-input-wrap {
		display: flex;
		align-items: center;
		gap: 8rpx;
		min-height: 78rpx;
		padding: 0 16rpx;
		border-radius: 16rpx;
		background: rgba(255, 255, 255, 0.08);
	}

	.amount-currency {
		font-size: 30rpx;
		font-weight: 800;
		color: #fbbf24;
	}

	.amount-input {
		flex: 1;

		:deep(.uni-easyinput) {
			width: 100%;
		}

		:deep(.uni-easyinput__content) {
			background: transparent !important;
			border: 0 !important;
			padding-left: 0 !important;
		}

		:deep(.uni-easyinput__content-input) {
			font-size: 30rpx !important;
			font-weight: 800;
			color: #ffffff !important;
		}

		:deep(.uni-easyinput__placeholder-class) {
			color: rgba(255, 255, 255, 0.35);
		}
	}

	.mood-pills,
	.model-pills {
		:deep(.checklist-group) {
			gap: 8rpx;
		}

		:deep(.checklist-box.is--tag) {
			margin: 0;
			padding: 10rpx 14rpx;
			border-radius: 14rpx;
			background: rgba(255, 255, 255, 0.1);
			border-color: rgba(255, 255, 255, 0.15);
		}

		:deep(.checklist-text) {
			font-size: 22rpx;
			color: rgba(255, 255, 255, 0.76);
		}
	}

	.rant-box {
		margin-bottom: 14rpx;
	}

	.rant-textarea {
		width: 100%;
		min-height: 128rpx;
		font-size: 24rpx;
		line-height: 1.7;
		color: #ffffff;
	}

	.rant-placeholder {
		color: rgba(255, 255, 255, 0.34);
	}

	.rant-meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12rpx;
		margin-top: 8rpx;
	}

	.rant-meta-text,
	.rant-count {
		font-size: 20rpx;
		color: rgba(255, 255, 255, 0.44);
	}

	.burn-model-box {
		margin-bottom: 14rpx;
	}

	.preview-block {
		margin-bottom: 14rpx;
		padding: 18rpx;
		background: rgba(251, 191, 36, 0.12);
		border-color: rgba(251, 191, 36, 0.12);
	}

	.preview-label {
		display: block;
		margin-bottom: 8rpx;
		font-size: 21rpx;
		color: rgba(255, 255, 255, 0.54);
	}

	.preview-text {
		font-size: 24rpx;
		line-height: 1.7;
		color: #ffffff;
	}

	.card-foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 14rpx;
	}

	.foot-copy {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 8rpx;
	}

	.foot-copy.dark {
		color: var(--muted);
	}

	.foot-copy-text {
		font-size: 22rpx;
		line-height: 1.6;
	}

	.card-cta {
		display: inline-flex;
		align-items: center;
		gap: 8rpx;
		padding: 16rpx 18rpx;
		border-radius: 16rpx;
		flex-shrink: 0;
	}

	.card-cta-text {
		font-size: 24rpx;
		font-weight: 800;
	}

	.burn-cta {
		background: linear-gradient(90deg, #ef4444, #f97316);
		box-shadow: 0 14rpx 28rpx rgba(239, 68, 68, 0.18);
	}

	.skill-cta {
		background: rgba(91, 91, 214, 0.08);
	}

	.skill-text {
		color: #5b5bd6;
	}

	.skill-entry {
		background: linear-gradient(180deg, #ffffff 0%, #f8faff 100%);
		border: 1rpx solid #e8ebff;
		box-shadow: 0 18rpx 36rpx rgba(91, 91, 214, 0.08);
	}

	.skill-type-box,
	.skill-outline {
		position: relative;
		z-index: 1;
		margin-bottom: 14rpx;
	}

	.skill-type-box {
		padding: 18rpx;
		border-radius: 18rpx;
		background: rgba(91, 91, 214, 0.05);
	}

	.skill-type-pills {
		:deep(.checklist-group) {
			gap: 10rpx;
		}

		:deep(.checklist-box.is--tag) {
			margin: 0;
			padding: 10rpx 18rpx;
			border-radius: 16rpx;
			background: #ffffff;
			border-color: rgba(91, 91, 214, 0.12);
		}

		:deep(.checklist-text) {
			font-size: 22rpx;
			color: #64748b;
		}
	}

	.skill-outline {
		display: flex;
		flex-direction: column;
		gap: 10rpx;
	}

	.skill-outline-item {
		display: flex;
		align-items: flex-start;
		gap: 12rpx;
		padding: 16rpx 18rpx;
		border-radius: 18rpx;
		background: #f8faff;
		border: 1rpx solid #eef2ff;
	}

	.skill-outline-index {
		width: 50rpx;
		flex-shrink: 0;
		font-size: 20rpx;
		font-weight: 800;
		color: #5b5bd6;
	}

	.skill-outline-copy {
		flex: 1;
	}

	.skill-outline-title {
		display: block;
		margin-bottom: 4rpx;
		font-size: 24rpx;
		font-weight: 700;
		color: var(--ink);
	}

	.skill-outline-desc {
		font-size: 22rpx;
		line-height: 1.6;
		color: var(--muted);
	}

	.skill-tags {
		position: relative;
		z-index: 1;
		display: flex;
		flex-wrap: wrap;
		gap: 10rpx;
		margin-bottom: 14rpx;

		:deep(.uni-tag) {
			color: #5b5bd6 !important;
			border-color: rgba(91, 91, 214, 0.14) !important;
			background: rgba(91, 91, 214, 0.08) !important;
		}
	}

	.support-wrap {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
		margin-top: 18rpx;
	}

	.draft-entry,
	.notice-block {
		background: #ffffff;
		border-radius: 22rpx;
		padding: 22rpx;
		border: 1rpx solid var(--line);
		box-shadow: 0 14rpx 32rpx rgba(17, 24, 39, 0.05);
	}

	.draft-entry {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 14rpx;
	}

	.draft-left,
	.draft-right {
		display: flex;
		align-items: center;
	}

	.draft-left {
		flex: 1;
		gap: 14rpx;
	}

	.draft-right {
		gap: 10rpx;
	}

	.draft-icon-wrap {
		width: 68rpx;
		height: 68rpx;
		border-radius: 20rpx;
		background: linear-gradient(135deg, rgba(91, 91, 214, 0.12), rgba(139, 92, 246, 0.08));
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.draft-copy {
		flex: 1;
	}

	.draft-title {
		display: block;
		margin-bottom: 6rpx;
		font-size: 28rpx;
		font-weight: 700;
		color: var(--ink);
	}

	.draft-sub {
		font-size: 22rpx;
		line-height: 1.6;
		color: var(--muted);
	}

	.draft-count {
		transform: scale(0.96);
	}

	.notice-head {
		display: flex;
		align-items: center;
		gap: 10rpx;
		margin-bottom: 14rpx;
	}

	.notice-title {
		font-size: 26rpx;
		font-weight: 700;
		color: var(--ink);
	}

	.notice-list {
		display: flex;
		flex-direction: column;
		gap: 10rpx;
	}

	.notice-row {
		display: flex;
		align-items: flex-start;
		gap: 10rpx;
	}

	.notice-item {
		flex: 1;
		font-size: 22rpx;
		line-height: 1.7;
		color: var(--muted);
	}
</style>
