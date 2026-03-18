<template>
	<view class="page">

		<scroll-view class="main-scroll" scroll-y :show-scrollbar="false">

			<!-- ① 首屏价值区 -->
			<view class="hero-section">
				<view class="hero-glow" />
				<view class="hero-content">
					<text class="hero-title">好用的 AI Skill，不一定最贵</text>
					<text class="hero-subtitle">复制别人验证过的 Skill，烧走弯路，烧烧 token</text>
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
							<uni-icons class="hero-tag-dot" type="checkmarkempty" size="14" color="#2F8A57" />
							<text class="hero-tag-text">可直接复制</text>
						</view>
						<view class="hero-tag">
							<uni-icons class="hero-tag-dot" type="checkmarkempty" size="14" color="#2F8A57" />
							<text class="hero-tag-text">透明展示 token</text>
						</view>
						<view class="hero-tag">
							<uni-icons class="hero-tag-dot" type="checkmarkempty" size="14" color="#2F8A57" />
							<text class="hero-tag-text">社区复现反馈</text>
						</view>
					</view>
				</view>
			</view>

			<!-- ② 本周最值得复制 -->
			<view class="section-head">
				<view class="sh-left">
					<view class="sh-badge">
						<uni-icons type="medal-filled" size="20" color="#D6943A" />
					</view>
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
					<view class="sh-badge">
						<uni-icons type="wallet-filled" size="20" color="#2F8A57" />
					</view>
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
					<view class="sh-badge">
						<uni-icons type="navigate-filled" size="20" color="#E45C1A" />
					</view>
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
					<uni-icons class="scene-icon" :type="scene.icon" :color="scene.color" size="26" />
					<text class="scene-name">{{ scene.name }}</text>
				</view>
			</view>

			<!-- ⑤ 热门创作者 -->
			<view class="section-head">
				<view class="sh-left">
					<view class="sh-badge">
						<uni-icons type="person-filled" size="20" color="#7B5B3C" />
					</view>
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
					<view class="sh-badge">
						<uni-icons type="bars" size="20" color="#5E738A" />
					</view>
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

	</view>
</template>

<script setup lang="ts">
	import { getCurrentInstance } from 'vue'

	const instance = getCurrentInstance()
	onShow(() => {
		uni.getTabBar(instance?.proxy)?.setData({ selected: 0 })
	})

	const topSkills = ref([
		{
			id: 's1',
			title: 'PS 人像精修提示词（参数版）',
			scene: '设计',
			summary: '给出可执行修图步骤和参数区间，适合人像精修、电商主图和写真后期',
			avgToken: '1.9k',
			copyCount: '8.3k',
			successRate: '93%',
			author: '阿泽修图',
			authorColor: '#D6943A',
			featured: true
		},
		{
			id: 's2',
			title: '前端 Bug 定位与修复助手',
			scene: '编程',
			summary: '线上报错先定位根因再修复，附最小补丁和回归清单',
			avgToken: '2.1k',
			copyCount: '7.6k',
			successRate: '90%',
			author: '周知行',
			authorColor: '#9A6530',
			featured: false
		},
		{
			id: 's3',
			title: '会议纪要行动项提取器',
			scene: '办公',
			summary: '会议原文一键拆成决策、待办、负责人和截止时间',
			avgToken: '1.1k',
			copyCount: '6.9k',
			successRate: '93%',
			author: '刘效率',
			authorColor: '#2F8A57',
			featured: true
		}
	])

	const efficiencySkills = ref([
		{
			id: 's4',
			title: '电商主图卖点文案生成器',
			scene: '电商',
			label: '转化友好',
			labelType: 'label-green',
			avgToken: '1.5k',
			copyCount: '5.9k',
			successRate: '91%'
		},
		{
			id: 's5',
			title: '短视频口播脚本生成器',
			scene: '自媒体',
			label: '新手友好',
			labelType: 'label-blue',
			avgToken: '1.8k',
			copyCount: '5.1k',
			successRate: '89%'
		},
		{
			id: 's6',
			title: '英语口语陪练教练',
			scene: '学习',
			label: '输出稳定',
			labelType: 'label-purple',
			avgToken: '1.6k',
			copyCount: '4.4k',
			successRate: '88%'
		}
	])

	const hotScenes = ref([
		{ icon: 'compose', name: '写作', color: '#C84634' },
		{ icon: 'gear-filled', name: '编程', color: '#5E738A' },
		{ icon: 'videocam-filled', name: '自媒体', color: '#7B5B3C' },
		{ icon: 'calendar-filled', name: '办公', color: '#4F6C82' },
		{ icon: 'notification-filled', name: '运营', color: '#E45C1A' },
		{ icon: 'staff-filled', name: '学习', color: '#2F8A57' },
		{ icon: 'color-filled', name: '设计', color: '#B9893D' },
		{ icon: 'shop-filled', name: '电商', color: '#9A6530' }
	])

	const hotCreators = ref([
		{
			id: 'c1', name: '林晓峰', color: '#D6943A',
			badge: '长文高手', skillCount: '23', weekCopies: '8.4k'
		},
		{
			id: 'c2', name: '陈省钱', color: '#9A6530',
			badge: '低耗大神', skillCount: '17', weekCopies: '6.1k'
		},
		{
			id: 'c3', name: '张代码', color: '#2F8A57',
			badge: '编程强者', skillCount: '31', weekCopies: '5.3k'
		},
		{
			id: 'c4', name: '王爆款', color: '#7B5B3C',
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

	const toPublish = () => {
		uni.switchTab({ url: '/pages/publish/index' })
	}

	const toSkillTab = () => {
		uni.switchTab({ url: '/pages/skill/index' })
	}

	const toTrend = () => {
		uni.switchTab({ url: '/pages/community/index' })
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
		background: #FFFFFF;
	}

	/* 导航栏 */
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

		.brand-wrap {
			display: flex;
			align-items: center;
			gap: 8rpx;
			flex-shrink: 0;

			.brand-icon { font-size: 36rpx; }
			.brand { font-size: 34rpx; font-weight: 900; color: #1A1A1A; letter-spacing: -0.5rpx; }
		}

		.search-bar {
			flex: 1;
			height: 64rpx;
			background: rgba(0,0,0,0.06);
			border-radius: 32rpx;
			border: 1rpx solid rgba(0,0,0,0.08);
			display: flex;
			align-items: center;
			gap: 10rpx;
			padding: 0 20rpx;

			.search-icon { font-size: 26rpx; }
			.search-placeholder { font-size: 22rpx; color: rgba(0,0,0,0.35); flex: 1; }
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
				background: #C84634;
				border: 2rpx solid #1A1A1A;
			}
		}
	}

	.main-scroll { flex: 1; overflow: hidden; }

	/* ① 首屏价值区 */
	.hero-section {
		position: relative;
		margin: 32rpx 24rpx 8rpx;
		background: #FFFFFF;
		border-radius: 32rpx;
		border: 1rpx solid rgba(0,0,0,0.07);
		overflow: hidden;
		padding: 40rpx 32rpx 36rpx;

		.hero-glow {
			position: absolute;
			top: -60rpx;
			right: -60rpx;
			width: 300rpx;
			height: 300rpx;
			background: radial-gradient(circle, rgba(228, 92, 26,0.2) 0%, rgba(228, 92, 26,0) 70%);
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
			color: #1A1A1A;
			line-height: 1.3;
			margin-bottom: 16rpx;
			letter-spacing: -0.5rpx;
		}

		.hero-subtitle {
			display: block;
			font-size: 26rpx;
			color: rgba(0,0,0,0.55);
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
				background: #E45C1A;
				border-radius: 20rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				box-shadow: 0 8rpx 24rpx rgba(228, 92, 26, 0.2);

				.hero-btn-text { font-size: 28rpx; font-weight: 700; color: #fff; }
			}

			.hero-btn-secondary {
				flex: 1;
				height: 80rpx;
				background: rgba(0,0,0,0.07);
				border-radius: 20rpx;
				border: 1rpx solid rgba(0,0,0,0.10);
				display: flex;
				align-items: center;
				justify-content: center;

				.hero-btn-text-sec { font-size: 28rpx; font-weight: 700; color: rgba(0,0,0,0.72); }
			}
		}

		.hero-tags {
			display: flex;
			gap: 20rpx;

			.hero-tag {
				display: flex;
				align-items: center;
				gap: 6rpx;

				.hero-tag-dot {
					width: 24rpx;
					height: 24rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					flex-shrink: 0;
				}
				.hero-tag-text { font-size: 22rpx; color: rgba(0,0,0,0.50); }
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

			.sh-badge {
				width: 36rpx;
				height: 36rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				flex-shrink: 0;
			}
			.sh-title { font-size: 30rpx; font-weight: 700; color: #1A1A1A; }
		}

		.sh-more { font-size: 24rpx; color: rgba(0,0,0,0.40); }
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
		background: #FFFFFF;
		border-radius: 28rpx;
		border: 1rpx solid rgba(0,0,0,0.07);
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
				color: rgba(0,0,0,0.50);
				background: rgba(0,0,0,0.07);
				padding: 6rpx 16rpx;
				border-radius: 100rpx;
			}

			.slc-featured {
				font-size: 18rpx;
				color: #D6943A;
				background: rgba(214, 148, 58,0.15);
				padding: 4rpx 12rpx;
				border-radius: 100rpx;
				font-weight: 600;
			}
		}

		.slc-title {
			display: block;
			font-size: 28rpx;
			font-weight: 800;
			color: #1A1A1A;
			margin-bottom: 12rpx;
			line-height: 1.35;
		}

		.slc-summary {
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
			overflow: hidden;
			font-size: 24rpx;
			color: rgba(0,0,0,0.50);
			line-height: 1.6;
			margin-bottom: 24rpx;
			flex: 1;
		}

		.slc-meta {
			display: flex;
			align-items: center;
			background: rgba(0,0,0,0.04);
			border-radius: 16rpx;
			padding: 16rpx 0;
			margin-bottom: 24rpx;

			.slc-meta-item {
				flex: 1;
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 4rpx;

				.slc-meta-label { font-size: 20rpx; color: rgba(0,0,0,0.40); }
				.slc-meta-val { font-size: 24rpx; font-weight: 700; color: #1A1A1A; }
				.slc-meta-val.orange { color: #E45C1A; }
				.slc-meta-val.green { color: #2F8A57; }
			}

			.slc-meta-div {
				width: 1rpx;
				height: 32rpx;
				background: rgba(0,0,0,0.08);
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

				.slc-author-name { font-size: 22rpx; color: rgba(0,0,0,0.55); }
			}

			.copy-btn {
				background: #E45C1A;
				padding: 12rpx 24rpx;
				border-radius: 100rpx;
				box-shadow: 0 4rpx 16rpx rgba(228, 92, 26, 0.18);

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
			background: #FFFFFF;
			border-radius: 24rpx;
			border: 1rpx solid rgba(0,0,0,0.07);
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

					&.label-green { color: #2F8A57; background: rgba(47, 138, 87,0.1); }
					&.label-blue { color: #5E738A; background: rgba(94, 115, 138,0.1); }
					&.label-purple { color: #C7A06A; background: rgba(199, 160, 106,0.1); }
				}

				.eff-scene { font-size: 20rpx; color: rgba(0,0,0,0.40); text-align: center; }
			}

			.eff-title {
				flex: 1;
				font-size: 26rpx;
				font-weight: 700;
				color: #1A1A1A;
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

					.eff-token-val { font-size: 22rpx; font-weight: 700; color: #E45C1A; }
					.eff-token-label { font-size: 18rpx; color: rgba(0,0,0,0.40); }
				}

				.eff-divider {
					width: 1rpx;
					height: 24rpx;
					background: rgba(0,0,0,0.08);
				}

				.eff-copies { font-size: 20rpx; color: rgba(0,0,0,0.40); }
				.eff-rate { font-size: 20rpx; }
				.green-text { color: #2F8A57; }
			}

			.eff-copy-btn {
				background: rgba(228, 92, 26,0.15);
				border: 1rpx solid rgba(228, 92, 26, 0.18);
				padding: 10rpx 20rpx;
				border-radius: 100rpx;
				flex-shrink: 0;

				.eff-copy-text { font-size: 22rpx; color: #E45C1A; font-weight: 600; }
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
			background: #FFFFFF;
			border-radius: 20rpx;
			border: 1rpx solid rgba(0,0,0,0.06);
			padding: 28rpx 12rpx;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 12rpx;

			.scene-icon {
				width: 52rpx;
				height: 52rpx;
				display: flex;
				align-items: center;
				justify-content: center;
			}
			.scene-name { font-size: 22rpx; color: rgba(0,0,0,0.60); font-weight: 500; }
		}
	}

	/* ⑤ 热门创作者 */
	.creator-card {
		width: 220rpx;
		background: #FFFFFF;
		border-radius: 24rpx;
		border: 1rpx solid rgba(0,0,0,0.07);
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

		.creator-name { font-size: 26rpx; font-weight: 700; color: #1A1A1A; }

		.creator-badge {
			font-size: 18rpx;
			color: #D6943A;
			background: rgba(214, 148, 58,0.12);
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

				.cst-val { font-size: 26rpx; font-weight: 800; color: #1A1A1A; }
				.cst-val.orange { color: #E45C1A; }
				.cst-label { font-size: 18rpx; color: rgba(0,0,0,0.40); }
			}
		}

		.creator-follow-btn {
			width: 100%;
			height: 56rpx;
			background: rgba(0,0,0,0.06);
			border-radius: 16rpx;
			border: 1rpx solid rgba(0,0,0,0.09);
			display: flex;
			align-items: center;
			justify-content: center;

			.creator-follow-text { font-size: 22rpx; color: rgba(0,0,0,0.60); font-weight: 600; }
		}
	}

	/* ⑥ 今日趋势摘要 */
	.trend-card {
		margin: 0 24rpx;
		background: #FFFFFF;
		border-radius: 24rpx;
		border: 1rpx solid rgba(0,0,0,0.07);
		overflow: hidden;

		.trend-grid {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 0;

			.trend-item {
				padding: 24rpx 28rpx;
				border-bottom: 1rpx solid rgba(0,0,0,0.05);
				border-right: 1rpx solid rgba(0,0,0,0.05);

				&:nth-child(even) { border-right: none; }
				&:nth-child(3), &:nth-child(4) { border-bottom: none; }

				.trend-label { display: block; font-size: 20rpx; color: rgba(0,0,0,0.40); margin-bottom: 8rpx; }
				.trend-val { display: block; font-size: 26rpx; font-weight: 700; color: #1A1A1A; }
				.trend-val.orange { color: #E45C1A; }
				.trend-val.green { color: #2F8A57; }
			}
		}

		.trend-footer {
			padding: 20rpx 28rpx;
			background: rgba(228, 92, 26,0.06);
			border-top: 1rpx solid rgba(228, 92, 26,0.1);

			.trend-footer-text { font-size: 24rpx; color: #E45C1A; font-weight: 600; }
		}
	}

	.feed-bottom { height: calc(160rpx + env(safe-area-inset-bottom)); }
</style>
