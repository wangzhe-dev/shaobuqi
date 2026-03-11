<template>
	<view class="tab-bar">
		<view class="tab-inner">

			<!-- 首页 -->
			<view class="tab-item" @tap="go('/pages/index/index')">
				<view class="tab-icon-wrap">
					<text class="tab-icon" :class="{ active: current === '/pages/index/index' }">⌂</text>
				</view>
				<text class="tab-label" :class="{ active: current === '/pages/index/index' }">首页</text>
				<view v-if="current === '/pages/index/index'" class="active-dot" />
			</view>

			<!-- 烧榜 -->
			<view class="tab-item" @tap="go('/pages/community/index')">
				<view class="tab-icon-wrap">
					<text class="tab-icon" :class="{ active: current === '/pages/community/index' }">⊞</text>
				</view>
				<text class="tab-label" :class="{ active: current === '/pages/community/index' }">烧榜</text>
				<view v-if="current === '/pages/community/index'" class="active-dot" />
			</view>

			<!-- 发布 — 中间浮起按钮 -->
			<view class="tab-publish" @tap="go('/pages/publish/index')">
				<view class="publish-btn" :class="{ 'publish-active': current === '/pages/publish/index' }">
					<text class="publish-plus">+</text>
				</view>
				<text class="tab-label publish-label" :class="{ active: current === '/pages/publish/index' }">发布</text>
			</view>

			<!-- Skill -->
			<view class="tab-item" @tap="go('/pages/skill/index')">
				<view class="tab-icon-wrap">
					<text class="tab-icon" :class="{ active: current === '/pages/skill/index' }">⚡</text>
				</view>
				<text class="tab-label" :class="{ active: current === '/pages/skill/index' }">Skill</text>
				<view v-if="current === '/pages/skill/index'" class="active-dot" />
			</view>

			<!-- 我的 -->
			<view class="tab-item" @tap="go('/pages/my/my')">
				<view class="tab-icon-wrap">
					<text class="tab-icon" :class="{ active: current === '/pages/my/my' }">◎</text>
				</view>
				<text class="tab-label" :class="{ active: current === '/pages/my/my' }">我的</text>
				<view v-if="current === '/pages/my/my'" class="active-dot" />
			</view>

		</view>
		<!-- iOS 安全区 -->
		<view class="safe-area" />
	</view>
</template>

<script setup lang="ts">
	defineProps<{ current: string }>()

	const go = (path: string) => {
		uni.switchTab({ url: path })
	}
</script>

<style lang="scss" scoped>
	.tab-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: #fff;
		box-shadow: 0 -1rpx 0 rgba(0, 0, 0, 0.06), 0 -8rpx 32rpx rgba(0, 0, 0, 0.05);
		z-index: 999;
	}

	.tab-inner {
		height: 110rpx;
		display: flex;
		align-items: flex-end;
		padding-bottom: 16rpx;
	}

	/* 普通 tab 项 */
	.tab-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 5rpx;
		position: relative;
		padding-bottom: 2rpx;

		.tab-icon-wrap {
			width: 48rpx;
			height: 48rpx;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.tab-icon {
			font-size: 36rpx;
			color: #C4C9D4;
			transition: color 0.2s;

			&.active {
				color: #5B5BD6;
			}
		}

		.tab-label {
			font-size: 20rpx;
			color: #C4C9D4;
			font-weight: 400;
			line-height: 1;

			&.active {
				color: #5B5BD6;
				font-weight: 600;
			}
		}

		.active-dot {
			position: absolute;
			bottom: -2rpx;
			left: 50%;
			transform: translateX(-50%);
			width: 6rpx;
			height: 6rpx;
			border-radius: 50%;
			background: #5B5BD6;
		}
	}

	/* 中间发布按钮 */
	.tab-publish {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6rpx;
		/* 整体向上偏移，让按钮悬浮在 tab bar 上方 */
		margin-bottom: 28rpx;

		.publish-btn {
			width: 108rpx;
			height: 108rpx;
			border-radius: 50%;
			background: linear-gradient(145deg, #5B5BD6 0%, #7C3AED 100%);
			display: flex;
			align-items: center;
			justify-content: center;
			/* 白色描边形成与 tab 背景的分离感 */
			box-shadow:
				0 0 0 5rpx #fff,
				0 8rpx 32rpx rgba(91, 91, 214, 0.45),
				0 2rpx 8rpx rgba(0, 0, 0, 0.12);

			&.publish-active {
				background: linear-gradient(145deg, #4849B8 0%, #6D28D9 100%);
			}

			.publish-plus {
				font-size: 64rpx;
				color: #fff;
				font-weight: 200;
				line-height: 1;
				margin-top: -4rpx; /* 视觉居中微调 */
			}
		}

		.publish-label {
			font-size: 20rpx;
			color: #C4C9D4;
			font-weight: 400;

			&.active {
				color: #5B5BD6;
				font-weight: 600;
			}
		}
	}

	/* iOS 底部安全区 */
	.safe-area {
		height: constant(safe-area-inset-bottom);
		height: env(safe-area-inset-bottom);
	}
</style>
