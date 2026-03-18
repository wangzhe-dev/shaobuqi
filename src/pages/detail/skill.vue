<template>
	<view class="page">

		<scroll-view class="main-scroll" scroll-y :show-scrollbar="false">

			<!-- 封面图 -->
			<view class="cover-wrap">
				<image :src="skill.cover" class="cover-img" mode="aspectFill" />
				<view class="cover-overlay">
					<view class="cat-badge-cover" :style="{ background: skill.catColor }">
						<text class="cat-badge-text">{{ skill.catLabel }}</text>
					</view>
				</view>
			</view>

			<view class="content-pad">

				<!-- 标题 + 标签 -->
				<view class="title-section">
					<text class="skill-title">{{ skill.title }}</text>
					<view class="tags-row">
						<text v-for="tag in skill.tags" :key="tag" class="tag">{{ tag }}</text>
					</view>
				</view>

				<!-- 数据行 -->
				<view class="data-row">
					<view class="data-item">
						<text class="data-num">{{ skill.usage }}</text>
						<text class="data-label">使用次数</text>
					</view>
					<view class="data-divider" />
					<view class="data-item">
						<text class="data-num">{{ skill.favorites }}</text>
						<text class="data-label">收藏人数</text>
					</view>
					<view class="data-divider" />
					<view class="data-item">
						<text class="data-num">{{ skill.rating }}</text>
						<text class="data-label">好评率</text>
					</view>
				</view>

				<!-- 作者信息 -->
				<view class="author-row" @tap="toAuthor">
					<view class="av" :style="{ background: skill.authorColor }">
						<text class="av-t">{{ skill.author[0] }}</text>
					</view>
					<view class="author-meta">
						<text class="author-name">{{ skill.author }}</text>
						<text class="author-desc">{{ skill.authorBio }}</text>
					</view>
					<view class="follow-btn" :class="{ following: isFollowing }" @tap.stop="toggleFollow">
						<text class="follow-text">{{ isFollowing ? '已关注' : '+ 关注' }}</text>
					</view>
				</view>

				<!-- 简介 -->
				<view class="desc-section">
					<text class="section-title">简介</text>
					<text class="desc-text" :class="{ 'line-3': !descExpanded }">{{ skill.desc }}</text>
					<view v-if="!descExpanded" class="expand-btn" @tap="descExpanded = true">
						<text class="expand-text">展开全部 ▾</text>
					</view>
				</view>

				<!-- 适用场景 -->
				<view class="scenes-section">
					<text class="section-title">适用场景</text>
					<view class="scenes-grid">
						<view v-for="scene in skill.scenes" :key="scene" class="scene-card">
							<text class="scene-check">✓</text>
							<text class="scene-text">{{ scene }}</text>
						</view>
					</view>
				</view>

				<!-- Skill 内容体 -->
				<view class="skill-content-section">
					<view class="section-header">
						<text class="section-title">Skill 内容</text>
						<view class="copy-btn" @tap="copyContent">
							<text class="copy-text">📋 复制全部</text>
						</view>
					</view>
					<view class="skill-content-block">
						<text class="skill-content-text">{{ skill.content }}</text>
					</view>
				</view>

				<!-- 使用说明 -->
				<view class="usage-section">
					<text class="section-title">使用说明</text>
					<view class="usage-steps">
						<view v-for="(step, i) in skill.steps" :key="i" class="step-item">
							<view class="step-num">
								<text class="step-n">{{ i + 1 }}</text>
							</view>
							<text class="step-text">{{ step }}</text>
						</view>
					</view>
				</view>

				<!-- 相关 Skill -->
				<view class="related-section">
					<text class="section-title">相关 Skill</text>
					<scroll-view scroll-x :show-scrollbar="false" class="related-scroll">
						<view class="related-inner">
							<view v-for="r in relatedSkills" :key="r.id" class="related-card" @tap="toSkill(r.id)">
								<view class="rel-icon">
									<text class="rel-emoji">{{ r.icon }}</text>
								</view>
								<text class="rel-title line-2">{{ r.title }}</text>
								<text class="rel-usage">使用 {{ r.usage }}</text>
							</view>
						</view>
					</scroll-view>
				</view>

			</view>

			<view class="scroll-bottom" />
		</scroll-view>

		<!-- 底部 CTA -->
		<view class="fixed-cta iphonex-p">
			<view class="cta-collect-btn" @tap="toggleCollect">
				<text :class="['cta-collect-ico', { collected: isCollected }]">★</text>
				<text class="cta-collect-text">{{ isCollected ? '已收藏' : '收藏' }}</text>
			</view>
			<view class="cta-use-btn" @tap="useSkill">
				<text class="cta-use-text">⚡ 立即使用</text>
			</view>
		</view>

	</view>
</template>

<script setup lang="ts">
	const isCollected = ref(false)
	const isFollowing = ref(false)
	const descExpanded = ref(false)

	const skill = reactive({
		id: 's1',
		icon: '✍️',
		catLabel: '写作',
		catColor: '#5B5BD6',
		cover: 'https://picsum.photos/seed/skilldet/750/400',
		title: '万能文案生成器',
		tags: ['文案', '营销', 'AI辅助'],
		usage: '2.3k',
		favorites: '891',
		rating: '96%',
		author: '文案大师Leon',
		authorColor: '#5B5BD6',
		authorBio: '10年文案经验 · 服务500+品牌',
		desc: `这个 Skill 基于我10年的文案写作经验提炼，结合 AI 的语言能力，帮你快速产出高质量文案。

核心逻辑是通过结构化的输入，引导 AI 从「用户痛点」「产品价值」「情感共鸣」三个维度切入，生成既有说服力又有温度的文案。

适合没有文案基础的产品人、创业者、电商卖家，也适合专业文案人提升效率。`,
		scenes: [
			'产品推广文案',
			'朋友圈/公众号',
			'小红书种草文',
			'活动促销文案',
			'品牌故事叙述'
		],
		content: `【角色设定】
你是一位拥有10年经验的资深文案师，擅长写出让用户产生共鸣、激发购买欲的文案。

【任务输入】
产品名称：{产品名称}
产品卖点：{核心卖点1}、{核心卖点2}
目标用户：{用户画像描述}
使用场景：{朋友圈/小红书/公众号}

【输出要求】
请基于以上信息，从以下3个角度各输出一版文案：
1. 痛点切入型（先戳痛点，再给解决方案）
2. 场景代入型（描绘美好使用场景，引发向往）
3. 数据说服型（用具体数字证明价值）

每版文案控制在150字以内，语言自然不生硬，拒绝套话。`,
		steps: [
			'复制上方 Skill 内容',
			'打开 ChatGPT 或 Claude，粘贴进去',
			'将大括号里的内容替换为你的产品信息',
			'发送后等待输出，选择最满意的版本',
			'微调细节，即可使用'
		]
	})

	const relatedSkills = ref([
		{ id: 'r1', icon: '📱', title: '小红书爆款标题生成', usage: '1.8k' },
		{ id: 'r2', icon: '🎯', title: '用户痛点挖掘框架', usage: '2.1k' },
		{ id: 'r3', icon: '📊', title: '产品卖点提炼模板', usage: '956' },
		{ id: 'r4', icon: '🔥', title: '朋友圈种草文模板', usage: '3.4k' }
	])

	const toggleCollect = () => {
		isCollected.value = !isCollected.value
		uni.showToast({ title: isCollected.value ? '已收藏' : '已取消收藏', icon: 'none' })
	}

	const toggleFollow = () => {
		isFollowing.value = !isFollowing.value
	}

	const useSkill = () => {
		uni.setClipboardData({
			data: skill.content,
			success: () => {
				uni.showToast({ title: '已复制 Skill 内容，去 AI 工具粘贴使用', icon: 'none', duration: 2000 })
			}
		})
	}

	const copyContent = () => {
		uni.setClipboardData({
			data: skill.content,
			success: () => {
				uni.showToast({ title: '已复制', icon: 'success' })
			}
		})
	}

	const toAuthor = () => {
		uni.navigateTo({ url: '/pages/author/index?id=u1' })
	}

	const toSkill = (id: string) => {
		uni.navigateTo({ url: `/pages/detail/skill?id=${id}` })
	}
</script>

<style lang="scss" scoped>
	.page {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: #F7F8FA;
	}

	.main-scroll {
		flex: 1;
		overflow: hidden;

		.scroll-bottom {
			height: 160rpx;
		}
	}

	/* 封面图 */
	.cover-wrap {
		position: relative;

		.cover-img {
			width: 100%;
			height: 440rpx;
			display: block;
		}

		.cover-overlay {
			position: absolute;
			bottom: 20rpx;
			left: 24rpx;

			.cat-badge-cover {
				padding: 8rpx 20rpx;
				border-radius: 20rpx;

				.cat-badge-text {
					font-size: 24rpx;
					color: #fff;
					font-weight: 600;
				}
			}
		}
	}

	.content-pad {
		background: var(--bg-color);
		border-radius: 40rpx 40rpx 0 0;
		margin-top: -40rpx;
		padding: 32rpx 28rpx;
		position: relative;
		box-shadow: 0 -8rpx 32rpx rgba(0,0,0,0.06);
	}

	/* 标题 */
	.title-section {
		margin-bottom: 24rpx;

		.skill-title {
			display: block;
			font-size: 40rpx;
			font-weight: 800;
			color: #1A1A2E;
			margin-bottom: 14rpx;
			line-height: 1.3;
		}

		.tags-row {
			display: flex;
			flex-wrap: wrap;
			gap: 10rpx;

			.tag {
				font-size: 22rpx;
				color: #5B5BD6;
				background: rgba(91, 91, 214, 0.1);
				padding: 6rpx 16rpx;
				border-radius: 16rpx;
			}
		}
	}

	/* 数据行 */
	.data-row {
		display: flex;
		align-items: center;
		background: #F9FAFB;
		border-radius: 16rpx;
		padding: 20rpx 0;
		margin-bottom: 24rpx;

		.data-item {
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 4rpx;

			.data-num {
				font-size: 34rpx;
				font-weight: 700;
				color: #5B5BD6;
			}

			.data-label {
				font-size: 22rpx;
				color: #9CA3AF;
			}
		}

		.data-divider {
			width: 1rpx;
			height: 48rpx;
			background: #E5E7EB;
		}
	}

	/* 作者行 */
	.author-row {
		display: flex;
		align-items: center;
		gap: 16rpx;
		padding: 20rpx;
		background: var(--card-bg);
		border-radius: 24rpx;
		margin-bottom: 28rpx;
		box-shadow: 0 4rpx 24rpx rgba(0,0,0,0.03);
		border: 1rpx solid var(--border-color);

		.av {
			width: 80rpx;
			height: 80rpx;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;

			.av-t {
				font-size: 30rpx;
				color: #fff;
				font-weight: 700;
			}
		}

		.author-meta {
			flex: 1;

			.author-name {
				display: block;
				font-size: 28rpx;
				font-weight: 700;
				color: #1A1A2E;
				margin-bottom: 4rpx;
			}

			.author-desc {
				font-size: 22rpx;
				color: #9CA3AF;
			}
		}

		.follow-btn {
			border: 2rpx solid #5B5BD6;
			border-radius: 40rpx;
			padding: 10rpx 24rpx;

			.follow-text {
				font-size: 22rpx;
				color: #5B5BD6;
				font-weight: 600;
			}

			&.following {
				border-color: #E5E7EB;
				background: #F3F4F6;

				.follow-text {
					color: #9CA3AF;
				}
			}
		}
	}

	/* Section 通用 */
	.section-title {
		display: block;
		font-size: 30rpx;
		font-weight: 700;
		color: #1A1A2E;
		margin-bottom: 16rpx;
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 16rpx;

		.copy-btn {
			.copy-text {
				font-size: 24rpx;
				color: #5B5BD6;
			}
		}
	}

	/* 简介 */
	.desc-section {
		margin-bottom: 28rpx;

		.desc-text {
			font-size: 26rpx;
			color: #6B7280;
			line-height: 1.8;
		}

		.expand-btn {
			margin-top: 8rpx;

			.expand-text {
				font-size: 24rpx;
				color: #5B5BD6;
			}
		}
	}

	/* 适用场景 */
	.scenes-section {
		margin-bottom: 32rpx;

		.scenes-grid {
			display: flex;
			flex-wrap: wrap;
			gap: 16rpx;

			.scene-card {
				display: flex;
				align-items: center;
				gap: 8rpx;
				background: var(--card-bg);
				border-radius: 16rpx;
				padding: 12rpx 20rpx;
				box-shadow: 0 4rpx 16rpx rgba(16, 185, 129, 0.08);
				border: 1rpx solid rgba(16, 185, 129, 0.15);

				.scene-check {
					font-size: 22rpx;
					color: #10B981;
					font-weight: 700;
				}

				.scene-text {
					font-size: 24rpx;
					color: #374151;
				}
			}
		}
	}

	/* Skill 内容体 */
	.skill-content-section {
		margin-bottom: 28rpx;

		.skill-content-block {
			background: #1E1E2E;
			border-radius: 16rpx;
			padding: 24rpx;

			.skill-content-text {
				font-size: 24rpx;
				color: #A5B4FC;
				line-height: 1.8;
				font-family: 'Courier New', monospace;
			}
		}
	}

	/* 使用说明 */
	.usage-section {
		margin-bottom: 28rpx;

		.usage-steps {
			display: flex;
			flex-direction: column;
			gap: 16rpx;

			.step-item {
				display: flex;
				align-items: center;
				gap: 20rpx;
				background: var(--card-bg);
				padding: 16rpx 24rpx;
				border-radius: 20rpx;
				box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.02);
				border: 1rpx solid var(--border-color);

				.step-num {
					width: 44rpx;
					height: 44rpx;
					border-radius: 50%;
					background: var(--brand-gradient);
					display: flex;
					align-items: center;
					justify-content: center;
					flex-shrink: 0;

					.step-n {
						font-size: 22rpx;
						color: #fff;
						font-weight: 700;
					}
				}

				.step-text {
					font-size: 26rpx;
					color: #374151;
					line-height: 1.5;
				}
			}
		}
	}

	/* 相关 Skill */
	.related-section {
		margin-bottom: 20rpx;

		.related-scroll {
			.related-inner {
				display: flex;
				gap: 16rpx;
				padding-bottom: 4rpx;
			}

			.related-card {
				width: 200rpx;
				background: #F9FAFB;
				border-radius: 16rpx;
				padding: 16rpx;
				flex-shrink: 0;
				display: flex;
				flex-direction: column;
				gap: 8rpx;

				.rel-icon {
					width: 64rpx;
					height: 64rpx;
					background: #fff;
					border-radius: 14rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.06);

					.rel-emoji {
						font-size: 32rpx;
					}
				}

				.rel-title {
					font-size: 24rpx;
					font-weight: 600;
					color: #1A1A2E;
					line-height: 1.5;
				}

				.rel-usage {
					font-size: 20rpx;
					color: #9CA3AF;
				}
			}
		}
	}

	/* 底部 CTA */
	.fixed-cta {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: #fff;
		border-top: 1rpx solid #F3F4F6;
		padding: 16rpx 24rpx 0;
		display: flex;
		gap: 16rpx;

		.cta-collect-btn {
			width: 140rpx;
			height: 80rpx;
			border: 2rpx solid #E5E7EB;
			border-radius: 40rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 8rpx;
			flex-shrink: 0;

			.cta-collect-ico {
				font-size: 28rpx;
				color: #D1D5DB;

				&.collected {
					color: #F59E0B;
				}
			}

			.cta-collect-text {
				font-size: 24rpx;
				color: #6B7280;
			}
		}

		.cta-use-btn {
			flex: 1;
			height: 84rpx;
			background: var(--burn-gradient);
			border-radius: 42rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			box-shadow: 0 8rpx 24rpx rgba(255, 90, 95, 0.3);
			transition: transform 0.2s;

			&:active {
				transform: scale(0.96);
			}

			.cta-use-text {
				font-size: 28rpx;
				color: #fff;
				font-weight: 700;
			}
		}
	}
</style>
