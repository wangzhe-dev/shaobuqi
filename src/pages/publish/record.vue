<template>
	<view class="page">
		<scroll-view class="scrl" scroll-y :show-scrollbar="false">

			<!-- 选模型 -->
			<view class="card" style="margin-top: 20rpx">
				<view class="card-hd">
					<text class="card-title">AI 模型</text>
					<text class="flag-red">必选</text>
				</view>
				<scroll-view class="model-scroll" scroll-x :show-scrollbar="false">
					<view class="model-list">
						<view
							v-for="m in modelOptions" :key="m"
							class="m-chip" :class="{ on: form.model === m }"
							@tap="form.model = m"
						>
							<text class="m-t">{{ m }}</text>
						</view>
					</view>
				</scroll-view>
			</view>

			<!-- 说说这次 -->
			<view class="card">
				<view class="card-hd">
					<text class="card-title">说说这次</text>
					<view class="hd-right">
						<text class="flag-red">必填</text>
						<text class="char-c">{{ form.content.length }}/500</text>
					</view>
				</view>
				<textarea
					class="main-ta"
					v-model="form.content"
					placeholder="做了什么？效果怎么样？踩了什么坑，或者有什么心得..."
					:maxlength="500"
				/>
			</view>

			<!-- 消耗数据 -->
			<view class="card">
				<view class="card-hd">
					<text class="card-title">消耗数据</text>
					<text class="flag-gray">可选</text>
				</view>
				<view class="cost-row">
					<view class="cost-box">
						<text class="cost-pre">¥</text>
						<input class="cost-inp" v-model="form.cost" type="digit" placeholder="花费金额" />
					</view>
					<view class="cost-bar" />
					<view class="cost-box">
						<input class="cost-inp" v-model="form.tokens" type="number" placeholder="Token 数量" />
						<text class="cost-suf">tokens</text>
					</view>
				</view>
			</view>

			<!-- 感受 -->
			<view class="card">
				<view class="card-hd">
					<text class="card-title">这次感觉</text>
					<text class="flag-gray">可选</text>
				</view>
				<view class="rxn-row">
					<view
						v-for="r in reactions" :key="r.key"
						class="rxn-chip" :class="{ on: form.reaction === r.key }"
						:style="form.reaction === r.key
							? { background: r.bgColor, borderColor: r.borderColor }
							: {}"
						@tap="toggleReaction(r.key)"
					>
						<text class="rxn-em">{{ r.emoji }}</text>
						<text class="rxn-lab" :style="form.reaction === r.key ? { color: r.activeColor } : {}">
							{{ r.text }}
						</text>
					</view>
				</view>
			</view>

			<!-- 图片 -->
			<view class="card">
				<view class="card-hd">
					<text class="card-title">加张图</text>
					<text class="flag-gray">可选 · 最多9张</text>
				</view>
				<view class="img-grid">
					<view v-for="(src, i) in form.images" :key="i" class="img-item">
						<image :src="src" class="img-pic" mode="aspectFill" />
						<view class="img-del" @tap.stop="removeImage(i)">
							<text class="img-del-t">×</text>
						</view>
					</view>
					<view v-if="form.images.length < 9" class="img-add" @tap="addImage">
						<uni-icons type="camera-filled" size="26" color="#BFC4CF" />
					</view>
				</view>
			</view>

			<view class="btm-gap" />
		</scroll-view>

		<!-- 底部发布栏 -->
		<view class="btm-bar">
			<view class="pub-btn" :class="{ off: !canPublish }" @tap="publish">
				<text class="pub-t">发布</text>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { reactive, computed } from 'vue'

	const modelOptions = [
		'Claude Sonnet', 'Claude Opus', 'Claude Haiku',
		'GPT-4o', 'GPT-4.1', 'o1', 'Gemini 2.0', '其他',
	]

	const reactions = [
		{ key: 'worth',    emoji: '✅', text: '值了',  activeColor: '#2F8A57', bgColor: 'rgba(47,138,87,0.10)',  borderColor: 'rgba(47,138,87,0.28)'  },
		{ key: 'ok',       emoji: '🤔', text: '还行',  activeColor: '#5B5BD6', bgColor: 'rgba(91,91,214,0.10)',  borderColor: 'rgba(91,91,214,0.28)'  },
		{ key: 'regret',   emoji: '😬', text: '后悔了', activeColor: '#E45C1A', bgColor: 'rgba(228,92,26,0.10)',  borderColor: 'rgba(228,92,26,0.28)'  },
		{ key: 'addicted', emoji: '🔥', text: '上瘾了', activeColor: '#FF7A45', bgColor: 'rgba(255,122,69,0.10)', borderColor: 'rgba(255,122,69,0.28)' },
	]

	const form = reactive({
		model:    '',
		content:  '',
		cost:     '',
		tokens:   '',
		reaction: '',
		images:   [] as string[],
	})

	const canPublish = computed(() => !!form.model && !!form.content.trim())

	const toggleReaction = (key: string) => {
		form.reaction = form.reaction === key ? '' : key
	}

	const addImage = () => {
		uni.chooseImage({
			count: 9 - form.images.length,
			sizeType: ['compressed'],
			sourceType: ['album', 'camera'],
			success: (res) => { form.images.push(...res.tempFilePaths) },
		})
	}

	const removeImage = (idx: number) => { form.images.splice(idx, 1) }

	const publish = () => {
		if (!canPublish.value) {
			uni.showToast({ title: '请选择模型并填写内容', icon: 'none' })
			return
		}
		uni.showLoading({ title: '发布中...' })
		setTimeout(() => {
			uni.hideLoading()
			uni.showToast({ title: '发布成功', icon: 'success' })
			setTimeout(() => uni.navigateBack(), 800)
		}, 600)
	}
</script>

<style lang="scss" scoped>
.page {
	display: flex;
	flex-direction: column;
	height: 100%;
	background: #F7F8FA;
}

.scrl { flex: 1; overflow: hidden; }

/* ── 卡片 ── */
.card {
	background: #FFFFFF;
	margin: 0 24rpx 16rpx;
	border-radius: 24rpx;
	padding: 24rpx;
}

.card-hd {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16rpx;
}

.card-title { font-size: 28rpx; font-weight: 700; color: #1A1A2E; }

.hd-right { display: flex; align-items: center; gap: 12rpx; }

.flag-red {
	font-size: 20rpx; font-weight: 600;
	color: #E45C1A;
	background: rgba(228, 92, 26, 0.10);
	padding: 4rpx 12rpx; border-radius: 100rpx;
}

.flag-gray {
	font-size: 20rpx; font-weight: 500;
	color: #9CA3AF;
	background: rgba(0,0,0,0.05);
	padding: 4rpx 12rpx; border-radius: 100rpx;
}

.char-c { font-size: 20rpx; color: #9CA3AF; }

/* ── 模型选择 ── */
.model-scroll { width: 100%; white-space: nowrap; }

.model-list {
	display: inline-flex;
	gap: 12rpx;
	padding: 4rpx 0 8rpx;
}

.m-chip {
	display: inline-flex;
	align-items: center;
	height: 62rpx;
	padding: 0 22rpx;
	border-radius: 14rpx;
	background: rgba(0,0,0,0.04);
	border: 1rpx solid rgba(0,0,0,0.08);
	white-space: nowrap;
	flex-shrink: 0;

	&.on {
		background: rgba(228, 92, 26, 0.10);
		border-color: rgba(228, 92, 26, 0.30);
		.m-t { color: #E45C1A; }
	}

	.m-t { font-size: 24rpx; font-weight: 600; color: rgba(0,0,0,0.55); }
}

/* ── 内容 textarea ── */
.main-ta {
	width: 100%;
	min-height: 200rpx;
	font-size: 28rpx;
	color: #1A1A2E;
	line-height: 1.75;
}

/* ── 消耗数据 ── */
.cost-row {
	display: flex;
	align-items: center;
	background: rgba(0,0,0,0.03);
	border-radius: 16rpx;
	padding: 0 16rpx;
	height: 88rpx;
}

.cost-box {
	flex: 1;
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.cost-pre { font-size: 28rpx; font-weight: 700; color: #E45C1A; flex-shrink: 0; }
.cost-suf { font-size: 22rpx; color: #9CA3AF; flex-shrink: 0; }
.cost-inp { flex: 1; font-size: 26rpx; color: #1A1A2E; height: 60rpx; }
.cost-bar { width: 1rpx; height: 40rpx; background: rgba(0,0,0,0.10); margin: 0 16rpx; flex-shrink: 0; }

/* ── 感受 ── */
.rxn-row { display: flex; gap: 12rpx; }

.rxn-chip {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8rpx;
	padding: 18rpx 0;
	border-radius: 18rpx;
	background: rgba(0,0,0,0.04);
	border: 2rpx solid transparent;

	.rxn-em  { font-size: 36rpx; }
	.rxn-lab { font-size: 20rpx; color: rgba(0,0,0,0.50); font-weight: 600; }
	&.on .rxn-lab { font-weight: 700; }
}

/* ── 图片 ── */
.img-grid {
	display: flex;
	flex-wrap: wrap;
	gap: 8rpx;
}

.img-item {
	width: calc(33.33% - 6rpx);
	height: 220rpx;
	border-radius: 12rpx;
	overflow: hidden;
	position: relative;

	.img-pic { width: 100%; height: 100%; }

	.img-del {
		position: absolute;
		top: 8rpx; right: 8rpx;
		width: 36rpx; height: 36rpx;
		border-radius: 50%;
		background: rgba(0,0,0,0.55);
		display: flex; align-items: center; justify-content: center;
		.img-del-t { font-size: 28rpx; color: #fff; line-height: 1; }
	}
}

.img-add {
	width: calc(33.33% - 6rpx);
	height: 220rpx;
	border-radius: 12rpx;
	background: rgba(0,0,0,0.04);
	border: 2rpx dashed #D1D5DB;
	display: flex; align-items: center; justify-content: center;
}

/* ── 底部 ── */
.btm-gap { height: calc(120rpx + env(safe-area-inset-bottom)); }

.btm-bar {
	position: fixed;
	left: 0; right: 0; bottom: 0;
	padding: 14rpx 24rpx calc(14rpx + env(safe-area-inset-bottom));
	background: rgba(255,255,255,0.97);
	border-top: 1rpx solid rgba(0,0,0,0.07);
}

.pub-btn {
	height: 88rpx;
	border-radius: 22rpx;
	background: #E45C1A;
	display: flex; align-items: center; justify-content: center;
	box-shadow: 0 10rpx 24rpx rgba(228, 92, 26, 0.24);

	&.off { background: rgba(0,0,0,0.10); box-shadow: none; }

	.pub-t { font-size: 30rpx; font-weight: 800; color: #fff; }
}
</style>
