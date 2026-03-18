<template>
	<view class="page">

		<!-- 自定义导航栏 -->
		<view class="navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="navbar-inner">
				<view class="nav-back" @tap="goBack">
					<text class="nav-back-icon">←</text>
				</view>
				<text class="nav-title">Skill 详情</text>
				<view class="nav-actions">
					<view class="nav-btn" @tap="shareSkill">
						<text class="nav-btn-icon">📤</text>
					</view>
					<view class="nav-btn" @tap="reportSkill">
						<text class="nav-btn-icon">⋯</text>
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

				<!-- 主 CTA -->
				<view class="main-cta-row">
					<view class="copy-main-btn" @tap="copySkill">
						<text class="copy-main-icon">⚡</text>
						<text class="copy-main-text">复制 Skill</text>
					</view>
					<view class="fav-btn" :class="{ favorited: isFavorited }" @tap="toggleFavorite">
						<text class="fav-icon">{{ isFavorited ? '★' : '☆' }}</text>
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

			<!-- 2. 结果证明区（先于Skill正文展示） -->
			<view class="section-card">
				<view class="section-header">
					<text class="section-badge">🎯</text>
					<text class="section-title">这个 Skill 能做什么</text>
				</view>

				<view class="result-proof-card">
					<view class="rp-row">
						<text class="rp-label">适合谁用</text>
						<text class="rp-val">{{ skill.suitableFor }}</text>
					</view>
					<view class="rp-divider" />
					<view class="rp-row">
						<text class="rp-label">输入什么</text>
						<text class="rp-val">{{ skill.inputDesc }}</text>
					</view>
					<view class="rp-divider" />
					<view class="rp-row">
						<text class="rp-label">输出什么</text>
						<text class="rp-val">{{ skill.outputDesc }}</text>
					</view>
					<view class="rp-divider" />
					<view class="rp-row">
						<text class="rp-label rp-label-red">不适合</text>
						<text class="rp-val rp-val-dim">{{ skill.notFor }}</text>
					</view>
				</view>

				<!-- 示例结果卡 -->
				<view class="sample-result-card">
					<view class="sr-header">
						<text class="sr-title">示例输出片段</text>
					</view>
					<text class="sr-content">{{ skill.sampleOutput }}</text>
				</view>
			</view>

			<!-- 3. 消耗证据区（橙色强调） -->
			<view class="section-card token-section">
				<view class="section-header">
					<text class="section-badge">⚡</text>
					<text class="section-title">消耗证据</text>
					<text class="section-subtitle">社区真实使用数据</text>
				</view>

				<!-- Token 核心数据 -->
				<view class="token-grid">
					<view class="token-item token-item-main">
						<text class="ti-val orange">{{ skill.avgTotalToken }}</text>
						<text class="ti-label">平均总 token</text>
					</view>
					<view class="token-item">
						<text class="ti-val">{{ skill.avgInputToken }}</text>
						<text class="ti-label">输入 token</text>
					</view>
					<view class="token-item">
						<text class="ti-val">{{ skill.avgOutputToken }}</text>
						<text class="ti-label">输出 token</text>
					</view>
				</view>

				<!-- 成本与模型 -->
				<view class="cost-row">
					<view class="cost-item">
						<text class="cost-label">预计成本区间</text>
						<text class="cost-val orange">{{ skill.estimatedCost }}</text>
					</view>
					<view class="cost-divider" />
					<view class="cost-item">
						<text class="cost-label">推荐模型</text>
						<text class="cost-val">{{ skill.recommendedModel }}</text>
					</view>
					<view class="cost-divider" />
					<view class="cost-item">
						<text class="cost-label">社区常用</text>
						<text class="cost-val">{{ skill.commonModel }}</text>
					</view>
				</view>

				<!-- 使用统计 -->
				<view class="usage-stats-row">
					<view class="us-item">
						<text class="us-val">{{ skill.totalUses }}</text>
						<text class="us-label">社区复现次数</text>
					</view>
					<view class="us-item">
						<text class="us-val green">{{ skill.successRate }}</text>
						<text class="us-label">复现成功率</text>
					</view>
					<view class="us-item">
						<text class="us-val blue">{{ skill.weekUses }}</text>
						<text class="us-label">近7日使用</text>
					</view>
				</view>
			</view>

			<!-- 4. Skill 正文区 -->
			<view class="section-card">
				<view class="section-header">
					<text class="section-badge">📋</text>
					<text class="section-title">Skill 内容</text>
					<view class="copy-all-btn" @tap="copyAll">
						<text class="copy-all-text">复制全部</text>
					</view>
				</view>

				<!-- System Prompt -->
				<view class="prompt-block">
					<view class="pb-label-row">
						<text class="pb-label">System Prompt</text>
						<view class="pb-copy-btn" @tap="copyBlock('system')">
							<text class="pb-copy-text">复制</text>
						</view>
					</view>
					<view class="pb-content">
						<text class="pb-text">{{ skill.systemPrompt }}</text>
					</view>
				</view>

				<!-- 用户输入模板 -->
				<view class="prompt-block">
					<view class="pb-label-row">
						<text class="pb-label">用户输入模板</text>
						<view class="pb-copy-btn" @tap="copyBlock('user')">
							<text class="pb-copy-text">复制</text>
						</view>
					</view>
					<view class="pb-content">
						<text class="pb-text">{{ skill.userPromptTemplate }}</text>
					</view>
				</view>

				<!-- 变量说明 -->
				<view class="variables-section">
					<text class="var-title">可替换变量</text>
					<view class="var-list">
						<view v-for="v in skill.variables" :key="v.name" class="var-item">
							<view class="var-name-wrap">
								<text class="var-name">{{ '{' + v.name + '}' }}</text>
							</view>
							<text class="var-desc">{{ v.desc }}</text>
						</view>
					</view>
				</view>

				<!-- 注意事项 -->
				<view class="notes-block">
					<text class="notes-title">⚠️ 注意事项</text>
					<text class="notes-text">{{ skill.notes }}</text>
				</view>
			</view>

			<!-- 5. 使用步骤 -->
			<view class="section-card">
				<view class="section-header">
					<text class="section-badge">🚀</text>
					<text class="section-title">使用步骤</text>
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
					<text class="section-badge">💬</text>
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
					<text class="section-badge">✨</text>
					<text class="section-title">相似推荐</text>
				</view>

				<view class="similar-list">
					<view v-for="s in skill.similarSkills" :key="s.id" class="similar-item" @tap="toSkill(s.id)">
						<view class="si-info">
							<text class="si-tag">{{ s.tag }}</text>
							<text class="si-title">{{ s.title }}</text>
							<view class="si-meta">
								<text class="si-token orange">⚡ {{ s.avgToken }}</text>
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
				<text class="bb-fav-icon">{{ isFavorited ? '★' : '☆' }}</text>
				<text class="bb-fav-text">收藏</text>
			</view>
			<view class="bb-copy-btn" @tap="copySkill">
				<text class="bb-copy-icon">⚡</text>
				<text class="bb-copy-text">复制 Skill</text>
			</view>
		</view>

		<!-- 复制成功引导弹层 -->
		<view v-if="showCopyGuide" class="copy-guide-overlay" @tap="showCopyGuide = false">
			<view class="copy-guide-sheet" @tap.stop>
				<text class="cg-title">✅ 已复制 Skill！</text>
				<text class="cg-subtitle">接下来你想做什么？</text>
				<view class="cg-actions">
					<view class="cg-btn" @tap="goUse">
						<text class="cg-btn-icon">🚀</text>
						<text class="cg-btn-text">去使用</text>
					</view>
					<view class="cg-btn" @tap="saveFavorite">
						<text class="cg-btn-icon">⭐</text>
						<text class="cg-btn-text">收藏到我的 Skill</text>
					</view>
					<view class="cg-btn" @tap="recordResult">
						<text class="cg-btn-icon">📝</text>
						<text class="cg-btn-text">记录一次结果</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { useSysInfoStore } from '@/stores'

	const sysInfo = useSysInfoStore()
	const statusBarHeight = computed(() => (sysInfo.systemInfo as any).statusBarHeight || 44)

	const isFavorited = ref(false)
	const showCopyGuide = ref(false)

	const skill = ref({
		id: 's1',
		title: '万能长文写作框架',
		scene: '写作',
		author: '林小雨',
		authorColor: '#7C3AED',
		publishTime: '2025-12-20',
		copyCount: '12.4k',
		favoriteCount: '3.1k',
		successRate: '94%',
		feedbackCount: '286',

		// 结果证明
		suitableFor: '需要写知乎长文、行业分析报告、公众号深度文章的用户',
		inputDesc: '主题/话题 + 目标读者 + 期望字数（可选）',
		outputDesc: '完整文章结构、各段落核心内容、开头引子、结语',
		notFor: '短文、朋友圈文案、产品 slogan 等短内容创作',
		sampleOutput: '【结构预览】\n一、当前痛点：为什么大家都在用 AI 写作但效果差强人意\n二、核心原因：Prompt 设计缺乏结构化思维\n三、解决方案：万能长文框架的三步走方法\n...',

		// 消耗证据
		avgInputToken: '1.2k',
		avgOutputToken: '2.0k',
		avgTotalToken: '3.2k',
		estimatedCost: '¥0.05~0.15',
		recommendedModel: 'Claude Sonnet',
		commonModel: 'Claude Sonnet',
		totalUses: '4,821',
		weekUses: '1,203',

		// Skill 正文
		systemPrompt: '你是一位专业的中文长文写作专家，擅长知乎专栏、公众号深度文章和行业分析报告。你的文章具有清晰的逻辑结构、丰富的论据和引人入胜的叙述方式。请根据用户提供的主题和要求，创作一篇结构完整的长文。',
		userPromptTemplate: '请帮我写一篇关于【{topic}】的长文。\n目标读者：{audience}\n期望字数：{length}（可选）\n写作风格：{tone}\n重点强调：{focus}',
		variables: [
			{ name: 'topic', desc: '文章主题，如"AI 对教育的影响"' },
			{ name: 'audience', desc: '目标读者群，如"职场新人"、"创业者"' },
			{ name: 'length', desc: '期望字数，如"3000字"（可不填）' },
			{ name: 'tone', desc: '写作风格，如"专业理性"、"轻松幽默"' },
			{ name: 'focus', desc: '重点强调内容，如"数据支撑"、"案例丰富"' }
		],
		notes: '此 Prompt 对 Claude 系列效果最佳。GPT-4o 也适用但输出结构可能稍有差异。建议先生成文章大纲，确认后再让模型展开每个部分，可有效控制 token 消耗。',

		// 使用步骤
		steps: [
			'复制 System Prompt，粘贴到模型的"系统设置"或对话开始处',
			'复制用户输入模板，替换 {} 中的变量为你的实际需求',
			'建议使用 Claude Sonnet，在温度设置 0.7 左右效果最佳',
			'若要省 token：先让模型只生成大纲，确认后再逐段展开'
		],

		// 复现反馈
		feedbacks: [
			{
				id: 'f1', userName: '张晴晴', userColor: '#0891B2', time: '3天前',
				model: 'Claude Sonnet', inputToken: '1.1k', outputToken: '2.3k', totalToken: '3.4k',
				status: 'success', comment: '完全按步骤来的，一次成功！输出的文章结构非常清晰，稍加润色直接发布了。'
			},
			{
				id: 'f2', userName: '李明远', userColor: '#D97706', time: '1周前',
				model: 'GPT-4o', inputToken: '1.4k', outputToken: '1.8k', totalToken: '3.2k',
				status: 'normal', comment: '用GPT-4o跑了一下，结果差不多，但输出的段落不如Claude流畅，需要自己再调整一下。'
			},
			{
				id: 'f3', userName: '王小红', userColor: '#059669', time: '2周前',
				model: 'Claude Sonnet', inputToken: '0.9k', outputToken: '2.1k', totalToken: '3.0k',
				status: 'success', comment: '写了篇关于职场晋升的文章，质量超出预期。按建议先生成大纲节省了不少token。'
			}
		],

		// 相似推荐
		similarSkills: [
			{ id: 'r1', title: '爆款自媒体选题生成', tag: '自媒体', avgToken: '1.8k', successRate: '87%' },
			{ id: 'r2', title: '极简翻译润色器', tag: '写作·省token', avgToken: '800', successRate: '96%' },
			{ id: 'r3', title: '报告摘要提炼器', tag: '办公', avgToken: '2.4k', successRate: '90%' }
		]
	})

	const statusLabel = (status: string) => {
		return { success: '✅ 成功', normal: '🆗 一般', fail: '❌ 翻车' }[status] || status
	}

	const copySkill = () => {
		showCopyGuide.value = true
	}

	const copyAll = () => {
		uni.setClipboardData({
			data: skill.value.systemPrompt + '\n\n' + skill.value.userPromptTemplate,
			success: () => uni.showToast({ title: '已复制全部内容', icon: 'success' })
		})
	}

	const copyBlock = (type: string) => {
		const text = type === 'system' ? skill.value.systemPrompt : skill.value.userPromptTemplate
		uni.setClipboardData({
			data: text,
			success: () => uni.showToast({ title: '已复制', icon: 'success' })
		})
	}

	const toggleFavorite = () => {
		isFavorited.value = !isFavorited.value
		uni.showToast({ title: isFavorited.value ? '已收藏' : '已取消收藏', icon: 'none' })
	}

	const followAuthor = () => {
		uni.showToast({ title: '已关注', icon: 'success' })
	}

	const shareSkill = () => {
		uni.showToast({ title: '分享功能开发中', icon: 'none' })
	}

	const reportSkill = () => {
		uni.showToast({ title: '举报功能开发中', icon: 'none' })
	}

	const writeFeedback = () => {
		uni.showToast({ title: '反馈功能开发中', icon: 'none' })
	}

	const toSkill = (id: string) => {
		uni.navigateTo({ url: `/pages/detail/skill?id=${id}` })
	}

	const copyQuick = (_s: any) => {
		uni.showToast({ title: '已复制 Skill', icon: 'success' })
	}

	const goBack = () => {
		uni.navigateBack()
	}

	const goUse = () => {
		showCopyGuide.value = false
		uni.showToast({ title: '打开你的 AI 工具使用吧 🚀', icon: 'none' })
	}

	const saveFavorite = () => {
		isFavorited.value = true
		showCopyGuide.value = false
		uni.showToast({ title: '已收藏到我的 Skill', icon: 'success' })
	}

	const recordResult = () => {
		showCopyGuide.value = false
		uni.switchTab({ url: '/pages/publish/index' })
	}
</script>

<style lang="scss" scoped>
	.page {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: #0B0D12;
	}

	/* 自定义导航栏 */
	.navbar {
		background: #0B0D12;
		flex-shrink: 0;
		border-bottom: 1rpx solid rgba(255,255,255,0.06);

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
			background: rgba(255,255,255,0.07);
			border-radius: 20rpx;
			flex-shrink: 0;

			.nav-back-icon { font-size: 32rpx; color: #F5F7FA; }
		}

		.nav-title {
			flex: 1;
			font-size: 30rpx;
			font-weight: 700;
			color: #F5F7FA;
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

				.nav-btn-icon { font-size: 34rpx; }
			}
		}
	}

	.main-scroll { flex: 1; overflow: hidden; }

	/* 通用 section 卡 */
	.section-card {
		margin: 20rpx 24rpx 0;
		background: #141922;
		border-radius: 28rpx;
		border: 1rpx solid rgba(255,255,255,0.08);
		padding: 28rpx;
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 10rpx;
		margin-bottom: 24rpx;

		.section-badge { font-size: 28rpx; }
		.section-title { font-size: 28rpx; font-weight: 700; color: #F5F7FA; flex: 1; }
		.section-subtitle { font-size: 20rpx; color: rgba(255,255,255,0.35); }
	}

	/* 1. 顶部概览区 */
	.overview-section {
		margin: 20rpx 24rpx 0;
		background: #141922;
		border-radius: 28rpx;
		border: 1rpx solid rgba(255,255,255,0.08);
		padding: 28rpx;

		.scene-tag {
			display: inline-flex;
			font-size: 20rpx;
			color: rgba(255,255,255,0.5);
			background: rgba(255,255,255,0.08);
			padding: 6rpx 18rpx;
			border-radius: 100rpx;
			margin-bottom: 18rpx;
		}

		.skill-title {
			display: block;
			font-size: 38rpx;
			font-weight: 900;
			color: #F5F7FA;
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

			.author-name { font-size: 26rpx; color: rgba(255,255,255,0.8); font-weight: 600; }
			.publish-time { font-size: 22rpx; color: rgba(255,255,255,0.4); flex: 1; }

			.follow-btn {
				background: rgba(255,122,26,0.15);
				border: 1rpx solid rgba(255,122,26,0.35);
				padding: 10rpx 24rpx;
				border-radius: 100rpx;

				.follow-btn-text { font-size: 22rpx; color: #FF7A1A; font-weight: 600; }
			}
		}

		.main-cta-row {
			display: flex;
			gap: 16rpx;
			margin-bottom: 28rpx;

			.copy-main-btn {
				flex: 1;
				height: 88rpx;
				background: linear-gradient(135deg, #FF7A1A 0%, #E05A00 100%);
				border-radius: 24rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 12rpx;
				box-shadow: 0 8rpx 28rpx rgba(255,122,26,0.4);

				.copy-main-icon { font-size: 32rpx; }
				.copy-main-text { font-size: 30rpx; font-weight: 700; color: #fff; }
			}

			.fav-btn {
				width: 88rpx;
				height: 88rpx;
				border-radius: 24rpx;
				background: rgba(255,255,255,0.07);
				border: 1rpx solid rgba(255,255,255,0.12);
				display: flex;
				align-items: center;
				justify-content: center;

				.fav-icon { font-size: 36rpx; color: rgba(255,255,255,0.5); }

				&.favorited {
					background: rgba(255,194,74,0.15);
					border-color: rgba(255,194,74,0.35);

					.fav-icon { color: #FFC24A; }
				}
			}
		}

		.overview-stats {
			display: flex;
			align-items: center;
			background: rgba(255,255,255,0.04);
			border-radius: 20rpx;
			padding: 20rpx 0;

			.ov-stat {
				flex: 1;
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 6rpx;

				.ov-stat-val { font-size: 28rpx; font-weight: 800; color: #F5F7FA; }
				.ov-stat-val.green { color: #4CD964; }
				.ov-stat-label { font-size: 20rpx; color: rgba(255,255,255,0.4); }
			}

			.ov-divider {
				width: 1rpx;
				height: 36rpx;
				background: rgba(255,255,255,0.1);
			}
		}
	}

	/* 2. 结果证明区 */
	.result-proof-card {
		background: rgba(255,255,255,0.04);
		border-radius: 20rpx;
		overflow: hidden;
		margin-bottom: 20rpx;

		.rp-row {
			display: flex;
			gap: 20rpx;
			padding: 18rpx 20rpx;

			.rp-label {
				font-size: 22rpx;
				color: rgba(255,255,255,0.45);
				flex-shrink: 0;
				width: 100rpx;
				padding-top: 2rpx;
			}

			.rp-label-red { color: #FF5D5D; }

			.rp-val {
				flex: 1;
				font-size: 24rpx;
				color: rgba(255,255,255,0.8);
				line-height: 1.6;
			}

			.rp-val-dim { color: rgba(255,255,255,0.45); }
		}

		.rp-divider {
			height: 1rpx;
			background: rgba(255,255,255,0.06);
			margin: 0 20rpx;
		}
	}

	.sample-result-card {
		background: rgba(255,122,26,0.06);
		border-radius: 20rpx;
		border: 1rpx solid rgba(255,122,26,0.15);
		overflow: hidden;

		.sr-header {
			padding: 16rpx 20rpx 12rpx;
			border-bottom: 1rpx solid rgba(255,122,26,0.1);

			.sr-title { font-size: 22rpx; font-weight: 600; color: rgba(255,122,26,0.8); }
		}

		.sr-content {
			display: block;
			font-size: 24rpx;
			color: rgba(255,255,255,0.65);
			line-height: 1.7;
			padding: 16rpx 20rpx;
		}
	}

	/* 3. 消耗证据区 */
	.token-section {
		border-color: rgba(255,122,26,0.15);
	}

	.token-grid {
		display: flex;
		gap: 16rpx;
		margin-bottom: 20rpx;

		.token-item {
			flex: 1;
			background: rgba(255,255,255,0.04);
			border-radius: 16rpx;
			padding: 20rpx 12rpx;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 8rpx;

			.ti-val { font-size: 30rpx; font-weight: 800; color: rgba(255,255,255,0.7); }
			.ti-val.orange { font-size: 40rpx; color: #FF7A1A; }
			.ti-label { font-size: 20rpx; color: rgba(255,255,255,0.4); text-align: center; }

			&.token-item-main { background: rgba(255,122,26,0.08); border: 1rpx solid rgba(255,122,26,0.2); }
		}
	}

	.cost-row {
		display: flex;
		align-items: center;
		background: rgba(255,255,255,0.04);
		border-radius: 16rpx;
		padding: 18rpx 0;
		margin-bottom: 20rpx;

		.cost-item {
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 6rpx;

			.cost-label { font-size: 20rpx; color: rgba(255,255,255,0.4); }
			.cost-val { font-size: 26rpx; font-weight: 700; color: #F5F7FA; }
			.cost-val.orange { color: #FF7A1A; }
		}

		.cost-divider {
			width: 1rpx;
			height: 36rpx;
			background: rgba(255,255,255,0.1);
		}
	}

	.usage-stats-row {
		display: flex;
		align-items: center;
		gap: 0;

		.us-item {
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 6rpx;
			padding: 16rpx 0;
			background: rgba(255,255,255,0.04);
			border-radius: 16rpx;

			& + .us-item { margin-left: 12rpx; }

			.us-val { font-size: 30rpx; font-weight: 800; color: #F5F7FA; }
			.us-val.green { color: #4CD964; }
			.us-val.blue { color: #5DA9FF; }
			.us-label { font-size: 18rpx; color: rgba(255,255,255,0.4); }
		}
	}

	/* 4. Skill 正文区 */
	.prompt-block {
		margin-bottom: 20rpx;

		.pb-label-row {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 12rpx;

			.pb-label { font-size: 22rpx; font-weight: 600; color: rgba(255,255,255,0.6); }

			.pb-copy-btn {
				background: rgba(255,122,26,0.12);
				border: 1rpx solid rgba(255,122,26,0.25);
				padding: 6rpx 18rpx;
				border-radius: 100rpx;

				.pb-copy-text { font-size: 20rpx; color: #FF7A1A; font-weight: 600; }
			}
		}

		.pb-content {
			background: #0B0D12;
			border-radius: 16rpx;
			border: 1rpx solid rgba(255,255,255,0.07);
			padding: 20rpx;

			.pb-text {
				font-size: 24rpx;
				color: rgba(255,255,255,0.75);
				line-height: 1.75;
				font-family: 'Menlo', 'Courier New', monospace;
			}
		}
	}

	.variables-section {
		margin-bottom: 20rpx;

		.var-title { display: block; font-size: 22rpx; font-weight: 600; color: rgba(255,255,255,0.6); margin-bottom: 14rpx; }

		.var-list {
			display: flex;
			flex-direction: column;
			gap: 10rpx;

			.var-item {
				display: flex;
				align-items: flex-start;
				gap: 14rpx;

				.var-name-wrap {
					background: rgba(93,169,255,0.12);
					border: 1rpx solid rgba(93,169,255,0.25);
					padding: 6rpx 14rpx;
					border-radius: 8rpx;
					flex-shrink: 0;

					.var-name { font-size: 20rpx; color: #5DA9FF; font-weight: 600; font-family: monospace; }
				}

				.var-desc { font-size: 22rpx; color: rgba(255,255,255,0.5); line-height: 1.5; padding-top: 4rpx; }
			}
		}
	}

	.notes-block {
		background: rgba(255,93,93,0.06);
		border-radius: 16rpx;
		border: 1rpx solid rgba(255,93,93,0.15);
		padding: 18rpx 20rpx;

		.notes-title { display: block; font-size: 22rpx; font-weight: 600; color: #FF5D5D; margin-bottom: 10rpx; }
		.notes-text { font-size: 24rpx; color: rgba(255,255,255,0.6); line-height: 1.65; }
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
				background: linear-gradient(135deg, #FF7A1A 0%, #E05A00 100%);
				display: flex;
				align-items: center;
				justify-content: center;
				flex-shrink: 0;
				margin-top: 4rpx;

				.step-num-text { font-size: 22rpx; color: #fff; font-weight: 800; }
			}

			.step-text { font-size: 26rpx; color: rgba(255,255,255,0.75); line-height: 1.65; flex: 1; }
		}
	}

	/* 6. 复现反馈区 */
	.write-feedback-btn {
		background: rgba(255,122,26,0.12);
		border: 1rpx solid rgba(255,122,26,0.25);
		padding: 8rpx 20rpx;
		border-radius: 100rpx;

		.write-fb-text { font-size: 22rpx; color: #FF7A1A; font-weight: 600; }
	}

	.feedback-list {
		display: flex;
		flex-direction: column;
		gap: 20rpx;

		.feedback-card {
			background: rgba(255,255,255,0.04);
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

					.fb-name { display: block; font-size: 24rpx; font-weight: 600; color: rgba(255,255,255,0.8); }
					.fb-time { font-size: 20rpx; color: rgba(255,255,255,0.4); }
				}

				.fb-status-badge {
					font-size: 20rpx;
					padding: 6rpx 14rpx;
					border-radius: 100rpx;

					&.status-success { color: #4CD964; background: rgba(76,217,100,0.12); }
					&.status-normal { color: #5DA9FF; background: rgba(93,169,255,0.12); }
					&.status-fail { color: #FF5D5D; background: rgba(255,93,93,0.12); }

					.fb-status-text { font-weight: 600; }
				}
			}

			.fb-token-row {
				display: flex;
				gap: 0;
				background: rgba(255,255,255,0.04);
				border-radius: 12rpx;
				padding: 12rpx 0;
				margin-bottom: 16rpx;

				.fbt-item {
					flex: 1;
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: 4rpx;

					.fbt-label { font-size: 18rpx; color: rgba(255,255,255,0.35); }
					.fbt-val { font-size: 22rpx; font-weight: 700; color: rgba(255,255,255,0.7); }
					.fbt-val.orange { color: #FF7A1A; }
					.fbt-val.model { font-size: 20rpx; color: #A78BFA; }
				}
			}

			.fb-comment {
				font-size: 24rpx;
				color: rgba(255,255,255,0.7);
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
			border-bottom: 1rpx solid rgba(255,255,255,0.06);

			&:last-child { border-bottom: none; }

			.si-info {
				flex: 1;

				.si-tag {
					display: inline-flex;
					font-size: 18rpx;
					color: rgba(255,255,255,0.4);
					background: rgba(255,255,255,0.07);
					padding: 3rpx 12rpx;
					border-radius: 6rpx;
					margin-bottom: 8rpx;
				}

				.si-title { display: block; font-size: 26rpx; font-weight: 700; color: #F5F7FA; margin-bottom: 8rpx; }

				.si-meta {
					display: flex;
					gap: 16rpx;

					.si-token { font-size: 22rpx; }
					.orange { color: #FF7A1A; }
					.si-rate { font-size: 22rpx; }
					.green { color: #4CD964; }
				}
			}

			.si-copy-btn {
				background: rgba(255,122,26,0.12);
				border: 1rpx solid rgba(255,122,26,0.25);
				padding: 12rpx 24rpx;
				border-radius: 100rpx;
				flex-shrink: 0;

				.si-copy-text { font-size: 22rpx; color: #FF7A1A; font-weight: 600; }
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
		background: rgba(11,13,18,0.95);
		backdrop-filter: blur(20px);
		border-top: 1rpx solid rgba(255,255,255,0.08);
		display: flex;
		gap: 16rpx;
		align-items: center;

		.bb-fav {
			width: 96rpx;
			height: 88rpx;
			background: rgba(255,255,255,0.07);
			border-radius: 24rpx;
			border: 1rpx solid rgba(255,255,255,0.12);
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 4rpx;

			.bb-fav-icon { font-size: 30rpx; color: rgba(255,255,255,0.5); }
			.bb-fav-text { font-size: 18rpx; color: rgba(255,255,255,0.5); }
		}

		.bb-copy-btn {
			flex: 1;
			height: 88rpx;
			background: linear-gradient(135deg, #FF7A1A 0%, #E05A00 100%);
			border-radius: 24rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 12rpx;
			box-shadow: 0 8rpx 28rpx rgba(255,122,26,0.4);

			.bb-copy-icon { font-size: 28rpx; }
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
		background: #141922;
		border-radius: 40rpx 40rpx 0 0;
		border-top: 1rpx solid rgba(255,255,255,0.1);
		padding: 40rpx 28rpx calc(48rpx + env(safe-area-inset-bottom));

		.cg-title {
			display: block;
			font-size: 34rpx;
			font-weight: 800;
			color: #F5F7FA;
			margin-bottom: 10rpx;
			text-align: center;
		}

		.cg-subtitle {
			display: block;
			font-size: 24rpx;
			color: rgba(255,255,255,0.45);
			margin-bottom: 36rpx;
			text-align: center;
		}

		.cg-actions {
			display: flex;
			flex-direction: column;
			gap: 16rpx;

			.cg-btn {
				height: 96rpx;
				background: rgba(255,255,255,0.07);
				border-radius: 24rpx;
				border: 1rpx solid rgba(255,255,255,0.1);
				display: flex;
				align-items: center;
				gap: 20rpx;
				padding: 0 28rpx;

				&:first-child {
					background: rgba(255,122,26,0.12);
					border-color: rgba(255,122,26,0.25);
				}

				.cg-btn-icon { font-size: 32rpx; }
				.cg-btn-text { font-size: 28rpx; font-weight: 600; color: rgba(255,255,255,0.85); }
			}
		}
	}
</style>
