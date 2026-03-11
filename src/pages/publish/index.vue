<template>
	<view class="page">

		<!-- 今日社区记录动态 -->
		<view class="daily-strip">
			<text class="daily-flame">🔥</text>
			<text class="daily-text">今日已有 <text class="daily-hl">3,847</text> 人记录了烧榜</text>
			<text class="daily-more">去看看 ›</text>
		</view>

		<!-- 主选项区 -->
		<view class="options-wrap">

			<!-- 记录烧榜 — 主入口 -->
			<view class="burn-entry" @tap="goLogBurn">
				<view class="burn-entry-top">
					<view class="burn-icon-wrap">
						<text class="burn-icon">🔥</text>
					</view>
					<view class="burn-info">
						<text class="burn-title">记录烧榜</text>
						<text class="burn-sub">记下今天烧了多少，和大家一起晒</text>
					</view>
				</view>
				<view class="burn-quick-fields">
					<view class="bqf-item">
						<text class="bqf-label">选模型</text>
						<view class="bqf-pills">
							<view
								v-for="m in quickModels"
								:key="m"
								class="bqf-pill"
								:class="{ active: selectedModel === m }"
								@tap.stop="selectedModel = m"
							>
								<text class="bqf-pill-text">{{ m }}</text>
							</view>
						</view>
					</view>
					<view class="bqf-item bqf-row">
						<view class="bqf-amount-wrap">
							<text class="bqf-label">花了多少</text>
							<view class="bqf-amount-input">
								<text class="bqf-currency">¥</text>
								<input
									class="bqf-input"
									type="digit"
									v-model="burnAmount"
									placeholder="0.00"
									placeholder-class="bqf-placeholder"
									@tap.stop
								/>
							</view>
						</view>
						<view class="bqf-mood-wrap">
							<text class="bqf-label">心情</text>
							<view class="bqf-moods">
								<view
									v-for="mood in quickMoods"
									:key="mood.label"
									class="bqf-mood"
									:class="{ active: selectedMood === mood.label }"
									@tap.stop="selectedMood = mood.label"
								>
									<text class="bqf-mood-emoji">{{ mood.emoji }}</text>
								</view>
							</view>
						</view>
					</view>
				</view>
				<view class="burn-cta" @tap.stop="goLogBurn">
					<text class="burn-cta-text">完整记录 →</text>
				</view>
			</view>

			<!-- 发布 Skill — 次入口 -->
			<view class="skill-entry" @tap="goPublishSkill">
				<view class="skill-icon-wrap">
					<text class="skill-icon">⚡</text>
				</view>
				<view class="skill-entry-info">
					<text class="skill-entry-title">发布 Skill</text>
					<text class="skill-entry-desc">创建可复用的提示词、模板、工作流</text>
				</view>
				<view class="skill-entry-tags">
					<text class="setag">提示词</text>
					<text class="setag">模板</text>
				</view>
				<text class="entry-arrow">›</text>
			</view>

		</view>

		<!-- 草稿箱 -->
		<view class="draft-entry" @tap="goDraft">
			<text class="draft-icon">📋</text>
			<text class="draft-text">草稿箱</text>
			<view class="draft-count">
				<text class="draft-n">2</text>
			</view>
			<text class="draft-arrow">›</text>
		</view>

		<!-- 发布须知 -->
		<view class="notice-block">
			<text class="notice-title">发布须知</text>
			<text class="notice-item">· 烧榜记录请填写真实消费数据，不允许虚构</text>
			<text class="notice-item">· Skill 内容需经过真实验证，可直接使用</text>
			<text class="notice-item">· 禁止发布违法、广告、引流等内容</text>
		</view>

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

	const selectedModel = ref('Claude')
	const selectedMood = ref('值了')
	const burnAmount = ref('')

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
		padding: 20rpx 24rpx 180rpx;
		background: #F7F8FA;
		min-height: 100vh;
	}

	/* 今日动态条 */
	.daily-strip {
		background: rgba(239, 68, 68, 0.06);
		border-radius: 16rpx;
		padding: 18rpx 20rpx;
		display: flex;
		align-items: center;
		gap: 10rpx;
		margin-bottom: 20rpx;

		.daily-flame { font-size: 28rpx; }

		.daily-text {
			flex: 1;
			font-size: 24rpx;
			color: #6B7280;

			.daily-hl {
				color: #EF4444;
				font-weight: 700;
			}
		}

		.daily-more {
			font-size: 22rpx;
			color: #5B5BD6;
		}
	}

	.options-wrap {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
		margin-bottom: 16rpx;
	}

	/* 记录烧榜 — 主入口 */
	.burn-entry {
		background: linear-gradient(150deg, #1E1B4B 0%, #3B1F6B 100%);
		border-radius: 24rpx;
		padding: 28rpx 24rpx 20rpx;

		.burn-entry-top {
			display: flex;
			align-items: center;
			gap: 16rpx;
			margin-bottom: 24rpx;

			.burn-icon-wrap {
				width: 80rpx;
				height: 80rpx;
				background: rgba(239, 68, 68, 0.2);
				border-radius: 20rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				flex-shrink: 0;

				.burn-icon { font-size: 40rpx; }
			}

			.burn-info {
				.burn-title {
					display: block;
					font-size: 34rpx;
					font-weight: 800;
					color: #fff;
					margin-bottom: 6rpx;
				}

				.burn-sub {
					font-size: 24rpx;
					color: rgba(255, 255, 255, 0.6);
				}
			}
		}

		/* 快捷填写区 */
		.burn-quick-fields {
			background: rgba(255, 255, 255, 0.07);
			border-radius: 16rpx;
			padding: 20rpx;
			margin-bottom: 20rpx;
			display: flex;
			flex-direction: column;
			gap: 18rpx;

			.bqf-item {
				display: flex;
				flex-direction: column;
				gap: 10rpx;

				&.bqf-row {
					flex-direction: row;
					gap: 20rpx;

					> * { flex: 1; }
				}

				.bqf-label {
					font-size: 22rpx;
					color: rgba(255, 255, 255, 0.5);
				}

				.bqf-pills {
					display: flex;
					gap: 10rpx;
					flex-wrap: wrap;

					.bqf-pill {
						padding: 8rpx 18rpx;
						border-radius: 20rpx;
						background: rgba(255, 255, 255, 0.1);
						border: 1rpx solid rgba(255, 255, 255, 0.15);

						.bqf-pill-text {
							font-size: 22rpx;
							color: rgba(255, 255, 255, 0.7);
						}

						&.active {
							background: rgba(239, 68, 68, 0.3);
							border-color: rgba(239, 68, 68, 0.5);

							.bqf-pill-text { color: #FCA5A5; }
						}
					}
				}

				.bqf-amount-input {
					display: flex;
					align-items: center;
					gap: 6rpx;
					background: rgba(255, 255, 255, 0.1);
					border-radius: 12rpx;
					padding: 12rpx 16rpx;

					.bqf-currency {
						font-size: 28rpx;
						color: #FBBF24;
						font-weight: 700;
					}

					.bqf-input {
						flex: 1;
						font-size: 28rpx;
						color: #fff;
						font-weight: 600;
					}
				}

				.bqf-moods {
					display: flex;
					gap: 8rpx;

					.bqf-mood {
						width: 56rpx;
						height: 56rpx;
						border-radius: 14rpx;
						background: rgba(255, 255, 255, 0.1);
						display: flex;
						align-items: center;
						justify-content: center;

						.bqf-mood-emoji { font-size: 28rpx; }

						&.active {
							background: rgba(251, 191, 36, 0.2);
							border: 1rpx solid rgba(251, 191, 36, 0.4);
						}
					}
				}
			}
		}

		.burn-cta {
			background: linear-gradient(90deg, #EF4444, #F97316);
			border-radius: 16rpx;
			padding: 20rpx;
			display: flex;
			align-items: center;
			justify-content: center;

			.burn-cta-text {
				font-size: 28rpx;
				color: #fff;
				font-weight: 700;
			}
		}
	}

	/* 发布 Skill — 次入口 */
	.skill-entry {
		background: #F0F0FD;
		border: 1rpx solid #DDD6FE;
		border-radius: 20rpx;
		padding: 24rpx;
		display: flex;
		align-items: center;
		gap: 16rpx;

		.skill-icon-wrap {
			width: 80rpx;
			height: 80rpx;
			background: linear-gradient(135deg, #5B5BD6, #8B5CF6);
			border-radius: 20rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;

			.skill-icon {
				font-size: 40rpx;
			}
		}

		.skill-entry-info {
			flex: 1;
			display: flex;
			flex-direction: column;
			gap: 6rpx;

			.skill-entry-title {
				font-size: 30rpx;
				font-weight: 700;
				color: #1A1A2E;
			}

			.skill-entry-desc {
				font-size: 23rpx;
				color: #6B7280;
			}
		}

		.skill-entry-tags {
			display: flex;
			flex-direction: column;
			gap: 6rpx;
			align-items: flex-end;

			.setag {
				font-size: 20rpx;
				color: #5B5BD6;
				background: rgba(91, 91, 214, 0.1);
				padding: 4rpx 14rpx;
				border-radius: 10rpx;
			}
		}

		.entry-arrow {
			font-size: 40rpx;
			color: #9CA3AF;
			font-weight: 300;
		}
	}

	/* 草稿箱 */
	.draft-entry {
		background: #fff;
		border-radius: 20rpx;
		padding: 24rpx;
		display: flex;
		align-items: center;
		gap: 16rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);

		.draft-icon { font-size: 34rpx; }

		.draft-text {
			flex: 1;
			font-size: 28rpx;
			color: #1A1A2E;
		}

		.draft-count {
			background: #5B5BD6;
			border-radius: 20rpx;
			padding: 4rpx 14rpx;

			.draft-n {
				font-size: 22rpx;
				color: #fff;
				font-weight: 600;
			}
		}

		.draft-arrow {
			font-size: 36rpx;
			color: #D1D5DB;
		}
	}

	/* 发布须知 */
	.notice-block {
		background: #F9FAFB;
		border-radius: 16rpx;
		padding: 24rpx;
		border-left: 4rpx solid #5B5BD6;

		.notice-title {
			display: block;
			font-size: 26rpx;
			font-weight: 600;
			color: #1A1A2E;
			margin-bottom: 14rpx;
		}

		.notice-item {
			display: block;
			font-size: 22rpx;
			color: #9CA3AF;
			line-height: 1.8;
		}
	}
</style>
