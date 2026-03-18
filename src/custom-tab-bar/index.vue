<template>
	<view class="tab-bar">
		<view class="tab-bar-inner">

			<view
				v-for="(item, i) in leftTabs"
				:key="item.path"
				class="tab-item"
				:class="{ active: selected === i }"
				@tap="go(i, item.path)"
			>
				<uni-icons
					:type="selected === i ? item.activeIcon : item.icon"
					:color="selected === i ? '#FF7A1A' : 'rgba(255,255,255,0.35)'"
					size="24"
				/>
				<text class="tab-label">{{ item.label }}</text>
			</view>

			<view class="tab-center" @tap="go(2, '/pages/publish/index')">
				<view class="pub-btn" :class="{ active: selected === 2 }">
					<text class="pub-plus">+</text>
				</view>
				<text class="tab-label">发布</text>
			</view>

			<view
				v-for="(item, i) in rightTabs"
				:key="item.path"
				class="tab-item"
				:class="{ active: selected === i + 3 }"
				@tap="go(i + 3, item.path)"
			>
				<uni-icons
					:type="selected === i + 3 ? item.activeIcon : item.icon"
					:color="selected === i + 3 ? '#FF7A1A' : 'rgba(255,255,255,0.35)'"
					size="24"
				/>
				<text class="tab-label">{{ item.label }}</text>
			</view>

		</view>
		<view class="safe-bottom" />
	</view>
</template>

<script>
import UniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'

export default {
	components: { UniIcons },
	data() {
		return {
			selected: 0,
			leftTabs: [
				{ path: '/pages/index/index',     label: '首页', icon: 'home',   activeIcon: 'home-filled' },
				{ path: '/pages/community/index', label: '趋势', icon: 'fire',   activeIcon: 'fire-filled' }
			],
			rightTabs: [
				{ path: '/pages/skill/index', label: 'Skill', icon: 'star',   activeIcon: 'star-filled' },
				{ path: '/pages/my/my',       label: '我的',  icon: 'person', activeIcon: 'person-filled' }
			]
		}
	},
	methods: {
		go(index, path) {
			if (this.selected === index) return
			this.selected = index
			uni.switchTab({ url: path })
		},
		setData(data) {
			if (data.selected !== undefined) {
				this.selected = data.selected
			}
		}
	}
}
</script>

<style lang="scss">
	.tab-bar {
		background: #FFFFFF;
		border-top: 1rpx solid rgba(0,0,0,0.06);
	}

	.tab-bar-inner {
		display: flex;
		align-items: flex-end;
		height: 108rpx;
		padding: 0 4rpx 14rpx;
	}

	.tab-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6rpx;
		padding-bottom: 2rpx;

		.tab-label {
			font-size: 18rpx;
			color: rgba(255, 255, 255, 0.35);
			font-weight: 400;
			line-height: 1;
		}

		&.active .tab-label {
			color: #FF7A1A;
			font-weight: 600;
		}
	}

	.tab-center {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8rpx;

		.pub-btn {
			width: 80rpx;
			height: 80rpx;
			border-radius: 50%;
			background: linear-gradient(135deg, #FF7A1A 0%, #E05A00 100%);
			display: flex;
			align-items: center;
			justify-content: center;
			box-shadow: 0 4rpx 20rpx rgba(255, 122, 26, 0.45);
			margin-top: -28rpx;

			&.active { opacity: 0.85; }
		}

		.pub-plus {
			font-size: 52rpx;
			color: #fff;
			line-height: 1;
			font-weight: 300;
			margin-top: -6rpx;
		}

		.tab-label {
			font-size: 18rpx;
			color: rgba(255, 255, 255, 0.35);
			font-weight: 400;
			line-height: 1;
		}
	}

	.safe-bottom {
		height: 0;
		height: constant(safe-area-inset-bottom);
		height: env(safe-area-inset-bottom);
	}
</style>
