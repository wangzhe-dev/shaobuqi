<template>
	<view class="tab-shell">
		<view class="tab-panel">
			<view class="tab-group">
				<view
					v-for="item in leftTabs"
					:key="item.path"
					class="tab-item"
					:class="{ active: isActive(item.path) }"
					hover-class="tab-item-hover"
					hover-stay-time="80"
					@tap="go(item.path)"
				>
					<view class="tab-hitbox">
						<view class="tab-icon-wrap">
							<uni-icons
								:type="isActive(item.path) ? item.activeIcon : item.icon"
								:color="isActive(item.path) ? activeColor : inactiveColor"
								size="22"
							/>
						</view>
						<text class="tab-label">{{ item.label }}</text>
					</view>
				</view>
			</view>

			<view class="tab-publish-slot">
				<view
					class="publish-button"
					:class="{ active: isPublishActive }"
					hover-class="publish-button-hover"
					hover-stay-time="80"
					@tap="go(publishTab.path)"
				>
					<view class="publish-icon-wrap">
						<uni-icons type="plusempty" color="#FFFFFF" size="22" />
					</view>
					<text class="publish-label">{{ publishTab.label }}</text>
				</view>
			</view>

			<view class="tab-group">
				<view
					v-for="item in rightTabs"
					:key="item.path"
					class="tab-item"
					:class="{ active: isActive(item.path) }"
					hover-class="tab-item-hover"
					hover-stay-time="80"
					@tap="go(item.path)"
				>
					<view class="tab-hitbox">
						<view class="tab-icon-wrap">
							<uni-icons
								:type="isActive(item.path) ? item.activeIcon : item.icon"
								:color="isActive(item.path) ? activeColor : inactiveColor"
								size="22"
							/>
						</view>
						<text class="tab-label">{{ item.label }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	type TabItem = {
		path: string
		label: string
		icon: string
		activeIcon: string
	}

	const props = defineProps<{ current: string }>()

	const leftTabs: TabItem[] = [
		{
			path: '/pages/index/index',
			label: '首页',
			icon: 'home',
			activeIcon: 'home-filled'
		},
		{
			path: '/pages/community/index',
			label: '烧榜',
			icon: 'fire',
			activeIcon: 'fire-filled'
		}
	]

	const rightTabs: TabItem[] = [
		{
			path: '/pages/skill/index',
			label: 'Skill',
			icon: 'star',
			activeIcon: 'star-filled'
		},
		{
			path: '/pages/my/my',
			label: '我的',
			icon: 'person',
			activeIcon: 'person-filled'
		}
	]

	const publishTab = {
		path: '/pages/publish/index',
		label: '发布'
	}

	const activeColor = '#FF6A3D'
	const inactiveColor = '#8C96A8'

	const isActive = (path: string) => props.current === path

	const isPublishActive = computed(() => props.current === publishTab.path)

	const go = (path: string) => {
		if (props.current === path) return
		uni.switchTab({ url: path })
	}
</script>

<style lang="scss" scoped>
	.tab-shell {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 0 18rpx 16rpx;
		padding-bottom: 16rpx;
		padding-bottom: calc(16rpx + constant(safe-area-inset-bottom));
		padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
		z-index: 999;
		-webkit-transform: translateZ(0);
		transform: translateZ(0);
	}

	.tab-panel {
		position: relative;
		display: flex;
		align-items: center;
		min-height: 118rpx;
		padding: 14rpx 16rpx;
		border-radius: 36rpx;
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(250, 244, 239, 0.94) 100%);
		border: 1rpx solid rgba(255, 255, 255, 0.72);
		box-shadow:
			0 12rpx 36rpx rgba(44, 34, 24, 0.12),
			0 4rpx 12rpx rgba(255, 106, 61, 0.08),
			inset 0 1rpx 0 rgba(255, 255, 255, 0.88);
		overflow: visible;
		-webkit-backface-visibility: hidden;
		backface-visibility: hidden;

		&::before {
			content: '';
			position: absolute;
			left: 24rpx;
			right: 24rpx;
			top: 1rpx;
			height: 2rpx;
			border-radius: 999rpx;
			background: linear-gradient(90deg, rgba(255, 122, 69, 0) 0%, rgba(255, 122, 69, 0.5) 48%, rgba(255, 122, 69, 0) 100%);
		}

		&::after {
			content: '';
			position: absolute;
			left: 22rpx;
			right: 22rpx;
			bottom: 0;
			height: 28rpx;
			border-radius: 0 0 34rpx 34rpx;
			background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 241, 233, 0.7) 100%);
			pointer-events: none;
		}
	}

	.tab-group {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 6rpx;
		min-width: 0;
	}

	.tab-item {
		flex: 1;
		display: flex;
		justify-content: center;
		min-width: 0;
		-webkit-tap-highlight-color: transparent;
	}

	.tab-hitbox {
		position: relative;
		width: 100%;
		max-width: 114rpx;
		min-height: 84rpx;
		padding: 10rpx 8rpx 8rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		border-radius: 26rpx;
		transition:
			background-color 0.2s ease,
			box-shadow 0.2s ease,
			transform 0.2s ease;
	}

	.tab-item.active .tab-hitbox {
		background: linear-gradient(180deg, rgba(255, 122, 69, 0.16) 0%, rgba(255, 122, 69, 0.04) 100%);
		box-shadow:
			inset 0 1rpx 0 rgba(255, 255, 255, 0.74),
			0 8rpx 18rpx rgba(255, 122, 69, 0.08);
	}

	.tab-item.active .tab-hitbox::after {
		content: '';
		position: absolute;
		left: 50%;
		bottom: -2rpx;
		transform: translateX(-50%);
		width: 12rpx;
		height: 12rpx;
		border-radius: 999rpx;
		background: #ff6a3d;
		box-shadow: 0 0 0 8rpx rgba(255, 106, 61, 0.12);
	}

	.tab-item-hover .tab-hitbox {
		background: rgba(255, 255, 255, 0.44);
		transform: translateY(1rpx);
	}

	.tab-icon-wrap {
		width: 56rpx;
		height: 56rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 8rpx;
		border-radius: 18rpx;
		background: rgba(140, 150, 168, 0.08);
		transition:
			background 0.2s ease,
			box-shadow 0.2s ease,
			transform 0.2s ease;
	}

	.tab-item.active .tab-icon-wrap {
		background: linear-gradient(180deg, rgba(255, 247, 242, 1) 0%, rgba(255, 232, 219, 0.96) 100%);
		box-shadow:
			0 8rpx 20rpx rgba(255, 106, 61, 0.16),
			inset 0 1rpx 0 rgba(255, 255, 255, 0.92);
		transform: translateY(-2rpx);
	}

	.tab-label {
		font-size: 20rpx;
		line-height: 1.1;
		color: #8c96a8;
		font-weight: 500;
		letter-spacing: 0.6rpx;
		white-space: nowrap;
	}

	.tab-item.active .tab-label {
		color: #52352b;
		font-weight: 600;
	}

	.tab-publish-slot {
		width: 176rpx;
		flex-shrink: 0;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 6rpx;
	}

	.publish-button {
		position: relative;
		width: 160rpx;
		height: 86rpx;
		padding: 0 18rpx 0 12rpx;
		border-radius: 999rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
		background: linear-gradient(135deg, #ff8551 0%, #ff6a3d 48%, #ef4d2f 100%);
		box-shadow:
			0 14rpx 28rpx rgba(239, 77, 47, 0.24),
			0 4rpx 12rpx rgba(76, 42, 30, 0.12),
			inset 0 1rpx 0 rgba(255, 255, 255, 0.36);
		transform: translateY(-10rpx);
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease,
			filter 0.2s ease;
		-webkit-tap-highlight-color: transparent;

		&::before {
			content: '';
			position: absolute;
			top: 8rpx;
			left: 20rpx;
			right: 20rpx;
			height: 18rpx;
			border-radius: 999rpx;
			background: linear-gradient(180deg, rgba(255, 255, 255, 0.72) 0%, rgba(255, 255, 255, 0) 100%);
		}
	}

	.publish-button.active {
		box-shadow:
			0 18rpx 34rpx rgba(239, 77, 47, 0.28),
			0 6rpx 14rpx rgba(76, 42, 30, 0.14),
			inset 0 1rpx 0 rgba(255, 255, 255, 0.42);
	}

	.publish-button-hover {
		transform: translateY(-7rpx);
		filter: brightness(1.02);
	}

	.publish-icon-wrap {
		position: relative;
		z-index: 1;
		width: 48rpx;
		height: 48rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.18);
		border: 1rpx solid rgba(255, 255, 255, 0.22);
	}

	.publish-label {
		position: relative;
		z-index: 1;
		font-size: 24rpx;
		line-height: 1;
		font-weight: 700;
		color: #fff8f4;
		letter-spacing: 2rpx;
		white-space: nowrap;
	}

	/* #ifdef H5 */
	@supports ((-webkit-backdrop-filter: blur(16px)) or (backdrop-filter: blur(16px))) {
		.tab-panel {
			-webkit-backdrop-filter: saturate(180%) blur(16px);
			backdrop-filter: saturate(180%) blur(16px);
		}
	}
	/* #endif */
</style>
