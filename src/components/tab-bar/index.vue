<template>
	<view class="tab-shell">
		<view class="tab-panel">
			<view class="tab-group">
				<view
					v-for="item in leftTabs"
					:key="item.path"
					class="tab-item"
					:class="{ active: isActive(item.path) }"
					@tap="go(item.path)"
				>
					<view class="tab-hitbox">
						<view class="tab-icon-wrap" :class="{ active: isActive(item.path) }">
							<uni-icons
								:type="isActive(item.path) ? item.activeIcon : item.icon"
								:color="isActive(item.path) ? '#4F46E5' : '#98A2B3'"
								size="24"
							/>
						</view>
						<text class="tab-label">{{ item.label }}</text>
					</view>
				</view>
			</view>

			<view class="tab-publish-slot">
				<view class="publish-aura" :class="{ active: isPublishActive }" />
				<view class="publish-ring" :class="{ active: isPublishActive }" @tap="go(publishTab.path)">
					<view class="publish-core">
						<uni-icons type="plusempty" color="#FFFFFF" size="34" />
					</view>
				</view>
				<text class="publish-label" :class="{ active: isPublishActive }">{{ publishTab.label }}</text>
			</view>

			<view class="tab-group">
				<view
					v-for="item in rightTabs"
					:key="item.path"
					class="tab-item"
					:class="{ active: isActive(item.path) }"
					@tap="go(item.path)"
				>
					<view class="tab-hitbox">
						<view class="tab-icon-wrap" :class="{ active: isActive(item.path) }">
							<uni-icons
								:type="isActive(item.path) ? item.activeIcon : item.icon"
								:color="isActive(item.path) ? '#4F46E5' : '#98A2B3'"
								size="24"
							/>
						</view>
						<text class="tab-label">{{ item.label }}</text>
					</view>
				</view>
			</view>
		</view>

		<view class="safe-area" />
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
		padding: 0 24rpx 18rpx;
		z-index: 999;
	}

	.tab-panel {
		position: relative;
		display: flex;
		align-items: flex-end;
		padding: 20rpx 20rpx 18rpx;
		border-radius: 42rpx;
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(244, 247, 252, 0.98) 100%);
		box-shadow:
			0 24rpx 60rpx rgba(15, 23, 42, 0.12),
			0 8rpx 24rpx rgba(79, 70, 229, 0.08),
			inset 0 1rpx 0 rgba(255, 255, 255, 0.92);
		overflow: visible;

		&::before {
			content: '';
			position: absolute;
			left: 24rpx;
			right: 24rpx;
			top: 0;
			height: 2rpx;
			border-radius: 999rpx;
			background: linear-gradient(90deg, rgba(99, 102, 241, 0) 0%, rgba(99, 102, 241, 0.42) 50%, rgba(99, 102, 241, 0) 100%);
		}
	}

	.tab-group {
		flex: 1;
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
	}

	.tab-item {
		flex: 1;
		display: flex;
		justify-content: center;
	}

	.tab-hitbox {
		position: relative;
		width: 112rpx;
		padding: 10rpx 0 2rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		border-radius: 28rpx;
		transition: all 0.2s ease;
	}

	.tab-item.active .tab-hitbox {
		background: linear-gradient(180deg, rgba(91, 91, 214, 0.12) 0%, rgba(91, 91, 214, 0.03) 100%);
		box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.7);
	}

	.tab-item.active .tab-hitbox::after {
		content: '';
		position: absolute;
		left: 50%;
		bottom: -8rpx;
		transform: translateX(-50%);
		width: 34rpx;
		height: 6rpx;
		border-radius: 999rpx;
		background: linear-gradient(90deg, #5b5bd6 0%, #8b5cf6 100%);
		box-shadow: 0 4rpx 10rpx rgba(91, 91, 214, 0.24);
	}

	.tab-icon-wrap {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 10rpx;
		border-radius: 20rpx;
	}

	.tab-icon-wrap.active {
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(231, 236, 255, 0.9) 100%);
		box-shadow:
			0 8rpx 18rpx rgba(91, 91, 214, 0.14),
			inset 0 1rpx 0 rgba(255, 255, 255, 0.88);
	}

	.tab-label {
		font-size: 20rpx;
		line-height: 1;
		color: #98a2b3;
		font-weight: 500;
		letter-spacing: 0.5rpx;
	}

	.tab-item.active .tab-label {
		color: #283248;
		font-weight: 600;
	}

	.tab-publish-slot {
		width: 172rpx;
		flex-shrink: 0;
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: -46rpx;
		pointer-events: none;
	}

	.publish-aura {
		position: absolute;
		top: -2rpx;
		width: 146rpx;
		height: 146rpx;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(91, 91, 214, 0.2) 0%, rgba(91, 91, 214, 0.05) 46%, rgba(91, 91, 214, 0) 72%);
		transform: scale(0.92);
		opacity: 0.9;
	}

	.publish-aura.active {
		background: radial-gradient(circle, rgba(91, 91, 214, 0.3) 0%, rgba(124, 58, 237, 0.08) 46%, rgba(124, 58, 237, 0) 72%);
		transform: scale(1);
	}

	.publish-label {
		margin-top: 12rpx;
		font-size: 20rpx;
		line-height: 1;
		font-weight: 600;
		color: #6b7280;
		letter-spacing: 1rpx;
	}

	.publish-label.active {
		color: #2d2f80;
	}

	.publish-ring {
		position: relative;
		width: 126rpx;
		height: 126rpx;
		padding: 8rpx;
		border-radius: 50%;
		background: linear-gradient(145deg, rgba(255, 255, 255, 0.96) 0%, rgba(224, 231, 255, 0.92) 100%);
		box-shadow:
			0 20rpx 40rpx rgba(91, 91, 214, 0.22),
			0 8rpx 16rpx rgba(15, 23, 42, 0.1),
			inset 0 1rpx 0 rgba(255, 255, 255, 1);
		pointer-events: auto;
	}

	.publish-ring.active {
		box-shadow:
			0 24rpx 44rpx rgba(91, 91, 214, 0.3),
			0 10rpx 20rpx rgba(15, 23, 42, 0.12),
			inset 0 1rpx 0 rgba(255, 255, 255, 1);
	}

	.publish-core {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: linear-gradient(145deg, #5865f2 0%, #4f46e5 48%, #7c3aed 100%);
		box-shadow:
			inset 0 2rpx 10rpx rgba(255, 255, 255, 0.28),
			inset 0 -12rpx 22rpx rgba(49, 46, 129, 0.35);

		&::before {
			content: '';
			position: absolute;
			top: 10rpx;
			left: 18rpx;
			right: 18rpx;
			height: 24rpx;
			border-radius: 999rpx;
			background: linear-gradient(180deg, rgba(255, 255, 255, 0.72) 0%, rgba(255, 255, 255, 0) 100%);
		}
	}

	.safe-area {
		height: constant(safe-area-inset-bottom);
		height: env(safe-area-inset-bottom);
	}
</style>
