<template>
	<view class="page">

		<!-- 自定义导航栏 -->
		<view class="navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="navbar-inner">
				<view class="brand-wrap">
					<text class="brand-icon">🔥</text>
					<text class="brand">烧不起</text>
				</view>
				<view class="search-bar" @tap="toSearch">
					<text class="search-icon">🔍</text>
					<text class="search-placeholder">搜索 Skill / 场景 / 模型 / 作者</text>
				</view>
				<view class="nav-btn" @tap="toNotify">
					<text class="nav-icon">🔔</text>
					<view class="red-dot" />
				</view>
			</view>
		</view>

		<scroll-view class="main-scroll" scroll-y :show-scrollbar="false">

			<!-- ① 首屏价值区 -->
			<view class="hero-section">
				<view class="hero-glow" />
				<view class="hero-content">
					<text class="hero-title">好用的 AI Skill，不一定最贵</text>
					<text class="hero-subtitle">复制别人验证过的 Skill，少走弯路，少烧 token</text>
					<view class="hero-actions">
						<view class="hero-btn-primary" @tap="toSkillTab">
							<text class="hero-btn-text">找 Skill</text>
						</view>
						<view class="hero-btn-secondary" @tap="toPublish">
							<text class="hero-btn-text-sec">发 Skill</text>
						</view>
					</view>
					<view class="hero-tags">
						<view class="hero-tag">
							<text class="hero-tag-dot">✓</text>
							<text class="hero-tag-text">可直接复制</text>
						</view>
						<view class="hero-tag">
							<text class="hero-tag-dot">✓</text>
							<text class="hero-tag-text">透明展示 token</text>
						</view>
						<view class="hero-tag">
							<text class="hero-tag-dot">✓</text>
							<text class="hero-tag-text">社区复现反馈</text>
						</view>
					</view>
				</view>
			</view>

			<!-- ② 本周最值得复制 -->
			<view class="section-head">
				<view class="sh-left">
					<text class="sh-badge">🏆</text>
					<text class="sh-title">本周最值得复制</text>
				</view>
				<text class="sh-more" @tap="toSkillTab">全部 ›</text>
			</view>
			<scroll-view class="horiz-scroll" scroll-x :show-scrollbar="false">
				<view class="skill-large-row">
					<view
						v-for="skill in topSkills"
						:key="skill.id"
						class="skill-large-card"
						@tap="toSkill(skill.id)"
					>
						<view class="slc-head">
							<view class="slc-scene-tag">{{ skill.scene }}</view>
							<view v-if="skill.featured" class="slc-featured">精选</view>
						</view>
						<text class="slc-title">{{ skill.title }}</text>
						<text class="slc-summary line-2">{{ skill.summary }}</text>
						<view class="slc-meta">
							<view class="slc-meta-item">
								<text class="slc-meta-label">平均token</text>
								<text class="slc-meta-val orange">{{ skill.avgToken }}</text>
							</view>
							<view class="slc-meta-div" />
							<view class="slc-meta-item">
								<text class="slc-meta-label">复制数</text>
								<text class="slc-meta-val">{{ skill.copyCount }}</text>
							</view>
							<view class="slc-meta-div" />
							<view class="slc-meta-item">
								<text class="slc-meta-label">复现率</text>
								<text class="slc-meta-val green">{{ skill.successRate }}</text>
							</view>
						</view>
						<view class="slc-foot">
							<view class="slc-author">
								<view class="slc-av" :style="{ background: skill.authorColor }">
									<text class="slc-av-t">{{ skill.author[0] }}</text>
								</view>
								<text class="slc-author-name">{{ skill.author }}</text>
							</view>
							<view class="copy-btn" @tap.stop="copySkill(skill)">
								<text class="copy-btn-text">复制 Skill</text>
							</view>
						</view>
					</view>
				</view>
			</scroll-view>

			<!-- ③ 低消耗高收益 -->
			<view class="section-head">
				<view class="sh-left">
					<text class="sh-badge">💡</text>
					<text class="sh-title">低消耗高收益</text>
				</view>
				<text class="sh-more" @tap="toSkillTab">更多 ›</text>
			</view>
			<view class="efficiency-list">
				<view
					v-for="skill in efficiencySkills"
					:key="skill.id"
					class="eff-card"
					@tap="toSkill(skill.id)"
				>
					<view class="eff-label-row">
						<view class="eff-label" :class="skill.labelType">{{ skill.label }}</view>
						<text class="eff-scene">{{ skill.scene }}</text>
					</view>
					<text class="eff-title">{{ skill.title }}</text>
					<view class="eff-metrics">
						<view class="eff-token">
							<text class="eff-token-val">{{ skill.avgToken }}</text>
							<text class="eff-token-label">tokens</text>
						</view>
						<view class="eff-divider" />
						<text class="eff-copies">{{ skill.copyCount }} 复制</text>
						<view class="eff-divider" />
						<text class="eff-rate green-text">{{ skill.successRate }} 复现</text>
					</view>
					<view class="eff-copy-btn" @tap.stop="copySkill(skill)">
						<text class="eff-copy-text">复制</text>
					</view>
				</view>
			</view>

			<!-- ④ 热门场景 -->
			<view class="section-head">
				<view class="sh-left">
					<text class="sh-badge">🎯</text>
					<text class="sh-title">热门场景</text>
				</view>
			</view>
			<view class="scene-grid">
				<view
					v-for="scene in hotScenes"
					:key="scene.name"
					class="scene-item"
					@tap="toSkillByScene(scene.name)"
				>
					<text class="scene-icon">{{ scene.icon }}</text>
					<text class="scene-name">{{ scene.name }}</text>
				</view>
			</view>

			<!-- ⑤ 热门创作者 -->
			<view class="section-head">
				<view class="sh-left">
					<text class="sh-badge">⭐</text>
					<text class="sh-title">热门创作者</text>
				</view>
			</view>
			<scroll-view class="horiz-scroll" scroll-x :show-scrollbar="false">
				<view class="creator-row">
					<view
						v-for="creator in hotCreators"
						:key="creator.id"
						class="creator-card"
						@tap="toAuthor(creator.id)"
					>
						<view class="creator-av" :style="{ background: creator.color }">
							<text class="creator-av-t">{{ creator.name[0] }}</text>
						</view>
						<text class="creator-name">{{ creator.name }}</text>
						<view class="creator-badge">{{ creator.badge }}</view>
						<view class="creator-stats">
							<view class="creator-stat">
								<text class="cst-val">{{ creator.skillCount }}</text>
								<text class="cst-label">爆款</text>
							</view>
							<view class="creator-stat">
								<text class="cst-val orange">{{ creator.weekCopies }}</text>
								<text class="cst-label">7日复制</text>
							</view>
						</view>
						<view class="creator-follow-btn">
							<text class="creator-follow-text">关注</text>
						</view>
					</view>
				</view>
			</scroll-view>

			<!-- ⑥ 今日趋势摘要 -->
			<view class="section-head">
				<view class="sh-left">
					<text class="sh-badge">📊</text>
					<text class="sh-title">今日趋势摘要</text>
				</view>
				<text class="sh-more" @tap="toTrend">查看完整 ›</text>
			</view>
			<view class="trend-card" @tap="toTrend">
				<view class="trend-grid">
					<view class="trend-item" v-for="t in todayTrend" :key="t.label">
						<text class="trend-label">{{ t.label }}</text>
						<text class="trend-val" :class="t.color">{{ t.val }}</text>
					</view>
				</view>
				<view class="trend-footer">
					<text class="trend-footer-text">查看完整趋势数据 →</text>
				</view>
			</view>

			<view class="feed-bottom" />
		</scroll-view>

		<tab-bar current="/pages/index/index" />
	</view>
</template>

<script setup lang="ts">
	import { useSysInfoStore } from '@/stores'

	const sysInfo = useSysInfoStore()
	const statusBarHeight = computed(() => (sysInfo.systemInfo as any).statusBarHeight || 44)

	const topSkills = ref([
		{
			id: 's1', title: '万能长文写作框架', scene: '写作',
			summary: '输入主题和受众，输出完整文章结构+段落，适合知乎、公众号、行业报告',
			avgToken: '3.2k', copyCount: '12.4k', successRate: '94%',
			author: '林小雨', authorColor: '#7C3AED', featured: true
		},
		{
			id: 's2', title: '代码审查专家 Prompt', scene: '编程',
			summary: '帮你找出 Bug、安全隐患、性能问题，并给出改进建议，支持多语言',
			avgToken: '2.1k', copyCount: '8.9k', successRate: '91%',
			author: '张开源', authorColor: '#0891B2', featured: false
		},
		{
			id: 's3', title: '爆款自媒体选题生成', scene: '自媒体',
			summary: '输入你的账号定位，输出 20 个带热点预测的选题，附带参考角度',
			avgToken: '1.8k', copyCount: '6.7k', successRate: '87%',
			author: '王创作', authorColor: '#D97706', featured: true
		}
	])

	const efficiencySkills = ref([
		{
			id: 'e1', title: '极简翻译润色器', scene: '写作/翻译',
			label: '低成本高收益', labelType: 'label-green',
			avgToken: '800', copyCount: '5.2k', successRate: '96%'
		},
		{
			id: 'e2', title: '会议纪要速记模板', scene: '办公',
			label: '新手友好', labelType: 'label-blue',
			avgToken: '1.2k', copyCount: '4.1k', successRate: '92%'
		},
		{
			id: 'e3', title: '商品描述批量生成', scene: '电商',
			label: '输出稳定', labelType: 'label-purple',
			avgToken: '1.5k', copyCount: '3.8k', successRate: '89%'
		}
	])

	const hotScenes = ref([
		{ icon: '✍️', name: '写作' },
		{ icon: '💻', name: '编程' },
		{ icon: '📱', name: '自媒体' },
		{ icon: '💼', name: '办公' },
		{ icon: '📣', name: '运营' },
		{ icon: '📚', name: '学习' },
		{ icon: '🎨', name: '设计' },
		{ icon: '🛍️', name: '电商' }
	])

	const hotCreators = ref([
		{
			id: 'c1', name: '林晓峰', color: '#7C3AED',
			badge: '长文高手', skillCount: '23', weekCopies: '8.4k'
		},
		{
			id: 'c2', name: '陈省钱', color: '#0891B2',
			badge: '低耗大神', skillCount: '17', weekCopies: '6.1k'
		},
		{
			id: 'c3', name: '张代码', color: '#059669',
			badge: '编程强者', skillCount: '31', weekCopies: '5.3k'
		},
		{
			id: 'c4', name: '王爆款', color: '#D97706',
			badge: '爆款创作', skillCount: '14', weekCopies: '4.7k'
		}
	])

	const todayTrend = ref([
		{ label: '今日最热模型', val: 'Claude Sonnet', color: '' },
		{ label: '今日最热场景', val: '编程辅助', color: '' },
		{ label: '今日最烧 Skill', val: '代码生成大师', color: 'orange' },
		{ label: '今日最省 Skill', val: '极简翻译器', color: 'green' }
	])

	const copySkill = (_skill: any) => {
		uni.showToast({ title: '已复制 Skill', icon: 'success' })
	}

	const toSkill = (id: string) => {
		uni.navigateTo({ url: `/pages/detail/skill?id=${id}` })
	}

	const toAuthor = (id: string) => {
		uni.navigateTo({ url: `/pages/author/index?id=${id}` })
	}

	const toSearch = () => {
		uni.navigateTo({ url: '/pages/search/index' })
	}

	const toPublish = () => {
		uni.switchTab({ url: '/pages/publish/index' })
	}

	const toSkillTab = () => {
		uni.switchTab({ url: '/pages/skill/index' })
	}

	const toTrend = () => {
		uni.switchTab({ url: '/pages/community/index' })
	}

	const toNotify = () => {
		uni.showToast({ title: '暂无新通知', icon: 'none' })
	}

	const toSkillByScene = (scene: string) => {
		uni.navigateTo({ url: `/pages/skill/index?scene=${scene}` })
	}
</script>

<style lang="scss" scoped>
	.page {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: #0B0D12;
	}

	/* 导航栏 */
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

		.brand-wrap {
			display: flex;
			align-items: center;
			gap: 8rpx;
			flex-shrink: 0;

			.brand-icon { font-size: 36rpx; }
			.brand { font-size: 34rpx; font-weight: 900; color: #F5F7FA; letter-spacing: -0.5rpx; }
		}

		.search-bar {
			flex: 1;
			height: 64rpx;
			background: rgba(255,255,255,0.07);
			border-radius: 32rpx;
			border: 1rpx solid rgba(255,255,255,0.1);
			display: flex;
			align-items: center;
			gap: 10rpx;
			padding: 0 20rpx;

			.search-icon { font-size: 26rpx; }
			.search-placeholder { font-size: 22rpx; color: rgba(255,255,255,0.35); flex: 1; }
		}

		.nav-btn {
			position: relative;
			width: 64rpx;
			height: 64rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;

			.nav-icon { font-size: 36rpx; }

			.red-dot {
				position: absolute;
				top: 8rpx;
				right: 8rpx;
				width: 14rpx;
				height: 14rpx;
				border-radius: 50%;
				background: #FF5D5D;
				border: 2rpx solid #0B0D12;
			}
		}
	}

	.main-scroll { flex: 1; overflow: hidden; }

	/* ① 首屏价值区 */
	.hero-section {
		position: relative;
		margin: 32rpx 24rpx 8rpx;
		background: #141922;
		border-radius: 32rpx;
		border: 1rpx solid rgba(255,255,255,0.08);
		overflow: hidden;
		padding: 40rpx 32rpx 36rpx;

		.hero-glow {
			position: absolute;
			top: -60rpx;
			right: -60rpx;
			width: 300rpx;
			height: 300rpx;
			background: radial-gradient(circle, rgba(255,122,26,0.2) 0%, rgba(255,122,26,0) 70%);
			pointer-events: none;
		}
	}

	.hero-content {
		position: relative;
		z-index: 1;

		.hero-title {
			display: block;
			font-size: 38rpx;
			font-weight: 900;
			color: #F5F7FA;
			line-height: 1.3;
			margin-bottom: 16rpx;
			letter-spacing: -0.5rpx;
		}

		.hero-subtitle {
			display: block;
			font-size: 26rpx;
			color: rgba(255,255,255,0.55);
			line-height: 1.6;
			margin-bottom: 36rpx;
		}

		.hero-actions {
			display: flex;
			gap: 20rpx;
			margin-bottom: 32rpx;

			.hero-btn-primary {
				flex: 1;
				height: 80rpx;
				background: linear-gradient(135deg, #FF7A1A 0%, #E05A00 100%);
				border-radius: 20rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				box-shadow: 0 8rpx 24rpx rgba(255,122,26,0.35);

				.hero-btn-text { font-size: 28rpx; font-weight: 700; color: #fff; }
			}

			.hero-btn-secondary {
				flex: 1;
				height: 80rpx;
				background: rgba(255,255,255,0.08);
				border-radius: 20rpx;
				border: 1rpx solid rgba(255,255,255,0.15);
				display: flex;
				align-items: center;
				justify-content: center;

				.hero-btn-text-sec { font-size: 28rpx; font-weight: 700; color: rgba(255,255,255,0.85); }
			}
		}

		.hero-tags {
			display: flex;
			gap: 20rpx;

			.hero-tag {
				display: flex;
				align-items: center;
				gap: 6rpx;

				.hero-tag-dot { font-size: 20rpx; color: #4CD964; font-weight: 700; }
				.hero-tag-text { font-size: 22rpx; color: rgba(255,255,255,0.5); }
			}
		}
	}

	/* section 标题行 */
	.section-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 36rpx 24rpx 16rpx;

		.sh-left {
			display: flex;
			align-items: center;
			gap: 10rpx;

			.sh-badge { font-size: 28rpx; }
			.sh-title { font-size: 30rpx; font-weight: 700; color: #F5F7FA; }
		}

		.sh-more { font-size: 24rpx; color: rgba(255,255,255,0.4); }
	}

	/* ② 横滑容器 */
	.horiz-scroll {
		width: 100%;

		.skill-large-row, .creator-row {
			display: flex;
			gap: 20rpx;
			padding: 0 24rpx 8rpx;
			width: max-content;
		}
	}

	/* 大Skill卡 */
	.skill-large-card {
		width: 340rpx;
		background: #141922;
		border-radius: 28rpx;
		border: 1rpx solid rgba(255,255,255,0.08);
		padding: 28rpx;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;

		.slc-head {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 20rpx;

			.slc-scene-tag {
				font-size: 20rpx;
				color: rgba(255,255,255,0.5);
				background: rgba(255,255,255,0.08);
				padding: 6rpx 16rpx;
				border-radius: 100rpx;
			}

			.slc-featured {
				font-size: 18rpx;
				color: #FFC24A;
				background: rgba(255,194,74,0.15);
				padding: 4rpx 12rpx;
				border-radius: 100rpx;
				font-weight: 600;
			}
		}

		.slc-title {
			display: block;
			font-size: 28rpx;
			font-weight: 800;
			color: #F5F7FA;
			margin-bottom: 12rpx;
			line-height: 1.35;
		}

		.slc-summary {
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
			overflow: hidden;
			font-size: 24rpx;
			color: rgba(255,255,255,0.5);
			line-height: 1.6;
			margin-bottom: 24rpx;
			flex: 1;
		}

		.slc-meta {
			display: flex;
			align-items: center;
			background: rgba(255,255,255,0.05);
			border-radius: 16rpx;
			padding: 16rpx 0;
			margin-bottom: 24rpx;

			.slc-meta-item {
				flex: 1;
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 4rpx;

				.slc-meta-label { font-size: 20rpx; color: rgba(255,255,255,0.4); }
				.slc-meta-val { font-size: 24rpx; font-weight: 700; color: #F5F7FA; }
				.slc-meta-val.orange { color: #FF7A1A; }
				.slc-meta-val.green { color: #4CD964; }
			}

			.slc-meta-div {
				width: 1rpx;
				height: 32rpx;
				background: rgba(255,255,255,0.1);
			}
		}

		.slc-foot {
			display: flex;
			align-items: center;
			justify-content: space-between;

			.slc-author {
				display: flex;
				align-items: center;
				gap: 10rpx;

				.slc-av {
					width: 48rpx;
					height: 48rpx;
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;

					.slc-av-t { font-size: 20rpx; color: #fff; font-weight: 700; }
				}

				.slc-author-name { font-size: 22rpx; color: rgba(255,255,255,0.55); }
			}

			.copy-btn {
				background: linear-gradient(135deg, #FF7A1A 0%, #E05A00 100%);
				padding: 12rpx 24rpx;
				border-radius: 100rpx;
				box-shadow: 0 4rpx 16rpx rgba(255,122,26,0.3);

				.copy-btn-text { font-size: 22rpx; color: #fff; font-weight: 700; }
			}
		}
	}

	/* ③ 低消耗高收益 */
	.efficiency-list {
		padding: 0 24rpx;
		display: flex;
		flex-direction: column;
		gap: 16rpx;

		.eff-card {
			background: #141922;
			border-radius: 24rpx;
			border: 1rpx solid rgba(255,255,255,0.08);
			padding: 24rpx 28rpx;
			display: flex;
			align-items: center;
			gap: 20rpx;

			.eff-label-row {
				display: flex;
				flex-direction: column;
				gap: 8rpx;
				flex-shrink: 0;
				width: 140rpx;

				.eff-label {
					font-size: 18rpx;
					font-weight: 600;
					padding: 4rpx 12rpx;
					border-radius: 8rpx;
					text-align: center;

					&.label-green { color: #4CD964; background: rgba(76,217,100,0.1); }
					&.label-blue { color: #5DA9FF; background: rgba(93,169,255,0.1); }
					&.label-purple { color: #A78BFA; background: rgba(167,139,250,0.1); }
				}

				.eff-scene { font-size: 20rpx; color: rgba(255,255,255,0.4); text-align: center; }
			}

			.eff-title {
				flex: 1;
				font-size: 26rpx;
				font-weight: 700;
				color: #F5F7FA;
				line-height: 1.4;
			}

			.eff-metrics {
				display: flex;
				align-items: center;
				gap: 12rpx;
				flex-shrink: 0;

				.eff-token {
					display: flex;
					align-items: baseline;
					gap: 2rpx;

					.eff-token-val { font-size: 22rpx; font-weight: 700; color: #FF7A1A; }
					.eff-token-label { font-size: 18rpx; color: rgba(255,255,255,0.4); }
				}

				.eff-divider {
					width: 1rpx;
					height: 24rpx;
					background: rgba(255,255,255,0.1);
				}

				.eff-copies { font-size: 20rpx; color: rgba(255,255,255,0.45); }
				.eff-rate { font-size: 20rpx; }
				.green-text { color: #4CD964; }
			}

			.eff-copy-btn {
				background: rgba(255,122,26,0.15);
				border: 1rpx solid rgba(255,122,26,0.3);
				padding: 10rpx 20rpx;
				border-radius: 100rpx;
				flex-shrink: 0;

				.eff-copy-text { font-size: 22rpx; color: #FF7A1A; font-weight: 600; }
			}
		}
	}

	/* ④ 热门场景 */
	.scene-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 20rpx;
		padding: 0 24rpx;

		.scene-item {
			background: #141922;
			border-radius: 20rpx;
			border: 1rpx solid rgba(255,255,255,0.07);
			padding: 28rpx 12rpx;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 12rpx;

			.scene-icon { font-size: 44rpx; }
			.scene-name { font-size: 22rpx; color: rgba(255,255,255,0.65); font-weight: 500; }
		}
	}

	/* ⑤ 热门创作者 */
	.creator-card {
		width: 220rpx;
		background: #141922;
		border-radius: 24rpx;
		border: 1rpx solid rgba(255,255,255,0.08);
		padding: 28rpx 20rpx 24rpx;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12rpx;

		.creator-av {
			width: 88rpx;
			height: 88rpx;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.3);

			.creator-av-t { font-size: 32rpx; color: #fff; font-weight: 800; }
		}

		.creator-name { font-size: 26rpx; font-weight: 700; color: #F5F7FA; }

		.creator-badge {
			font-size: 18rpx;
			color: #FFC24A;
			background: rgba(255,194,74,0.12);
			padding: 4rpx 14rpx;
			border-radius: 100rpx;
		}

		.creator-stats {
			display: flex;
			gap: 20rpx;
			width: 100%;

			.creator-stat {
				flex: 1;
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 4rpx;

				.cst-val { font-size: 26rpx; font-weight: 800; color: #F5F7FA; }
				.cst-val.orange { color: #FF7A1A; }
				.cst-label { font-size: 18rpx; color: rgba(255,255,255,0.4); }
			}
		}

		.creator-follow-btn {
			width: 100%;
			height: 56rpx;
			background: rgba(255,255,255,0.07);
			border-radius: 16rpx;
			border: 1rpx solid rgba(255,255,255,0.12);
			display: flex;
			align-items: center;
			justify-content: center;

			.creator-follow-text { font-size: 22rpx; color: rgba(255,255,255,0.65); font-weight: 600; }
		}
	}

	/* ⑥ 今日趋势摘要 */
	.trend-card {
		margin: 0 24rpx;
		background: #141922;
		border-radius: 24rpx;
		border: 1rpx solid rgba(255,255,255,0.08);
		overflow: hidden;

		.trend-grid {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 0;

			.trend-item {
				padding: 24rpx 28rpx;
				border-bottom: 1rpx solid rgba(255,255,255,0.06);
				border-right: 1rpx solid rgba(255,255,255,0.06);

				&:nth-child(even) { border-right: none; }
				&:nth-child(3), &:nth-child(4) { border-bottom: none; }

				.trend-label { display: block; font-size: 20rpx; color: rgba(255,255,255,0.4); margin-bottom: 8rpx; }
				.trend-val { display: block; font-size: 26rpx; font-weight: 700; color: #F5F7FA; }
				.trend-val.orange { color: #FF7A1A; }
				.trend-val.green { color: #4CD964; }
			}
		}

		.trend-footer {
			padding: 20rpx 28rpx;
			background: rgba(255,122,26,0.06);
			border-top: 1rpx solid rgba(255,122,26,0.1);

			.trend-footer-text { font-size: 24rpx; color: #FF7A1A; font-weight: 600; }
		}
	}

	.feed-bottom { height: calc(160rpx + env(safe-area-inset-bottom)); }
</style>
