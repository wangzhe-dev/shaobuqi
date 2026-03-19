<template>
	<view class="page">
		<!-- Top nav -->
		<view class="top-bar">
			<text class="top-cancel" @tap="goBack">取消</text>
			<view class="btn-pub" :class="{ on: canPublish }" @tap="publish">
				<text class="btn-pub-t">发布</text>
			</view>
		</view>

		<scroll-view class="body" scroll-y :show-scrollbar="false">
			<!-- Rich text editor -->
			<editor
				id="rec-editor"
				class="content-ed"
				placeholder="做了什么？效果怎么样？踩了什么坑，或者有什么心得..."
				show-img-size
				show-img-toolbar
				@ready="onEditorReady"
				@input="onEditorInput"
				@statuschange="onEditorStatusChange"
			/>

			<view class="divider" />

			<!-- Media grid -->
			<view class="media-grid">
				<view v-for="(src, i) in form.images" :key="i" class="m-cell">
					<image :src="src" mode="aspectFill" class="m-img" />
					<view class="m-del" @tap.stop="removeImage(i)">
						<text class="m-x">×</text>
					</view>
				</view>
				<view v-if="form.images.length < 9" class="m-add" @tap="addImage">
					<text class="m-plus">+</text>
					<text class="m-lbl">加张图</text>
				</view>
			</view>

			<view class="divider" />

			<!-- Model selector -->
			<view class="meta-section">
				<view class="meta-row">
					<text class="meta-label">AI 模型</text>
					<text v-if="!form.model" class="meta-hint">选一个</text>
				</view>
				<scroll-view class="scene-scroll" scroll-x :show-scrollbar="false">
					<view class="scene-list">
						<view
							v-for="m in modelOptions" :key="m"
							class="scene-chip" :class="{ on: form.model === m }"
							@tap="form.model = m"
						>
							<text class="scene-chip-t">{{ m }}</text>
						</view>
					</view>
				</scroll-view>
			</view>

			<view class="divider" />

			<!-- Cost data -->
			<view class="meta-section">
				<view class="meta-row">
					<text class="meta-label">消耗数据</text>
					<text class="meta-hint">可选</text>
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

			<view class="divider" />

			<!-- Reactions -->
			<view class="meta-section meta-section-btm">
				<view class="meta-row">
					<text class="meta-label">这次感觉</text>
					<text class="meta-hint">可选</text>
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

			<view class="body-gap" />
		</scroll-view>

		<!-- Formatting bar (above bottom toolbar) -->
		<view v-if="showFormatBar" class="format-bar">
			<view class="fb-btn" :class="{ on: !!formats.bold }" @tap="applyFormat('bold')">
				<text class="fb-t fb-bold">B</text>
			</view>
			<view class="fb-btn" :class="{ on: !!formats.italic }" @tap="applyFormat('italic')">
				<text class="fb-t fb-italic">I</text>
			</view>
			<view class="fb-btn" :class="{ on: !!formats.underline }" @tap="applyFormat('underline')">
				<text class="fb-t fb-ul">U</text>
			</view>
			<view class="fb-btn" :class="{ on: formats.header === 2 }" @tap="applyFormat('header', 2)">
				<text class="fb-t">H2</text>
			</view>
			<view class="fb-btn" :class="{ on: formats.list === 'bullet' }" @tap="applyFormat('list', 'bullet')">
				<text class="fb-t">• 列</text>
			</view>
			<view class="fb-sep" />
			<view class="fb-btn" @tap="undo">
				<text class="fb-t">↩</text>
			</view>
			<view class="fb-btn" @tap="redo">
				<text class="fb-t">↪</text>
			</view>
			<view class="fb-btn" @tap="removeFormat">
				<text class="fb-t fb-clr">清</text>
			</view>
		</view>

		<!-- Bottom toolbar -->
		<view class="btm-bar">
			<view class="btm-icons">
				<view class="bi" @tap="addImage">
					<uni-icons type="image" size="22" color="#3C3C3C" />
				</view>
				<view class="bi" :class="{ 'bi-act': showFormatBar }" @tap="toggleFormatBar">
					<uni-icons type="compose" size="22" :color="showFormatBar ? '#5B5BD6' : '#3C3C3C'" />
				</view>
				<view class="bi" @tap="onEmoji">
					<uni-icons type="emojiface" size="22" color="#3C3C3C" />
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'

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

const editorCtx     = ref<any>(null)
const formats       = ref<Record<string, any>>({})
const showFormatBar = ref(false)

const form = reactive({
	model:    '',
	content:  '',
	text:     '',
	cost:     '',
	tokens:   '',
	reaction: '',
	images:   [] as string[],
})

const canPublish = computed(() => !!form.model && !!form.text.trim())
const hasContent = computed(() => !!form.text.trim() || form.images.length > 0)

/* ── editor ── */
const onEditorReady = () => {
	uni.createSelectorQuery()
		.select('#rec-editor')
		.context((res: any) => { editorCtx.value = res?.context ?? null })
		.exec()
}

const onEditorInput = (e: any) => {
	const d = e?.detail ?? {}
	form.content = d.html ?? ''
	form.text    = (d.text ?? '').trim()
}

const onEditorStatusChange = (e: any) => {
	formats.value = e?.detail ?? {}
}

const ensureEditor = () => {
	if (editorCtx.value) return true
	uni.showToast({ title: '编辑器初始化中', icon: 'none' })
	return false
}

/* ── formatting ── */
const toggleFormatBar = () => { showFormatBar.value = !showFormatBar.value }
const applyFormat  = (name: string, value?: string | number | boolean) => { if (ensureEditor()) editorCtx.value.format(name, value) }
const undo         = () => { if (ensureEditor()) editorCtx.value.undo() }
const redo         = () => { if (ensureEditor()) editorCtx.value.redo() }
const removeFormat = () => { if (ensureEditor()) editorCtx.value.removeFormat() }

/* ── reactions ── */
const toggleReaction = (key: string) => {
	form.reaction = form.reaction === key ? '' : key
}

/* ── images ── */
const addImage = () => {
	uni.chooseImage({
		count: 9 - form.images.length,
		sizeType: ['compressed'],
		sourceType: ['album', 'camera'],
		success: (res) => { form.images.push(...res.tempFilePaths) },
	})
}

const removeImage = (idx: number) => { form.images.splice(idx, 1) }

const onEmoji = () => uni.showToast({ title: '表情功能开发中', icon: 'none' })

/* ── nav ── */
const goBack = () => {
	if (!hasContent.value) {
		uni.navigateBack()
		return
	}
	uni.showModal({
		title: '确认离开？',
		content: '内容未保存，离开后将丢失',
		confirmText: '离开',
		confirmColor: '#E45C1A',
		success: (res) => { if (res.confirm) uni.navigateBack() }
	})
}

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
	background: #FFFFFF;
	font-family: 'PingFang SC', 'Hiragino Sans GB', sans-serif;
}

/* ── top bar ── */
.top-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 24rpx 16rpx;
	flex-shrink: 0;
}

.top-cancel {
	font-size: 30rpx;
	color: #6B7280;
	font-weight: 500;
}

.btn-pub {
	height: 60rpx;
	padding: 0 32rpx;
	border-radius: 100rpx;
	background: rgba(91, 91, 214, 0.15);
	display: flex;
	align-items: center;

	.btn-pub-t {
		font-size: 26rpx;
		font-weight: 700;
		color: rgba(91, 91, 214, 0.45);
	}

	&.on {
		background: #5B5BD6;
		.btn-pub-t { color: #FFFFFF; }
	}
}

/* ── body ── */
.body { flex: 1; min-height: 0; overflow: hidden; }

/* ── editor ── */
.content-ed {
	width: 100%;
	min-height: 280rpx;
	padding: 20rpx 28rpx;
	font-size: 30rpx;
	line-height: 1.75;
	color: #1A1A2E;
	box-sizing: border-box;
}

.divider {
	height: 1rpx;
	background: rgba(0, 0, 0, 0.06);
	margin: 0 28rpx;
}

/* ── media grid ── */
.media-grid {
	display: flex;
	flex-wrap: wrap;
	gap: 14rpx;
	padding: 20rpx 28rpx;
}

.m-cell {
	position: relative;
	width: 200rpx;
	height: 200rpx;
	border-radius: 16rpx;
	overflow: hidden;
	flex-shrink: 0;

	.m-img { width: 100%; height: 100%; display: block; }

	.m-del {
		position: absolute;
		top: 8rpx;
		right: 8rpx;
		width: 40rpx;
		height: 40rpx;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;

		.m-x { font-size: 28rpx; color: #FFF; line-height: 1; margin-top: -2rpx; }
	}
}

.m-add {
	width: 200rpx;
	height: 200rpx;
	border-radius: 16rpx;
	background: #F2F3F7;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 10rpx;
	flex-shrink: 0;

	.m-plus { font-size: 48rpx; color: #AAACB0; line-height: 1; font-weight: 300; }
	.m-lbl  { font-size: 22rpx; color: #AAACB0; }
}

/* ── meta sections ── */
.meta-section { padding: 20rpx 28rpx 0; }
.meta-section-btm { padding-bottom: 28rpx; }

.meta-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 12rpx;
}

.meta-label { font-size: 24rpx; font-weight: 700; color: rgba(0, 0, 0, 0.55); }
.meta-hint  { font-size: 22rpx; color: #C8CACC; }

/* ── model / scene chips ── */
.scene-scroll { width: 100%; }

.scene-list {
	display: inline-flex;
	gap: 12rpx;
	padding-bottom: 20rpx;
}

.scene-chip {
	display: inline-flex;
	align-items: center;
	height: 60rpx;
	padding: 0 22rpx;
	border-radius: 12rpx;
	background: rgba(0, 0, 0, 0.04);
	border: 1rpx solid rgba(0, 0, 0, 0.08);
	white-space: nowrap;
	flex-shrink: 0;

	.scene-chip-t { font-size: 24rpx; font-weight: 600; color: rgba(0, 0, 0, 0.55); }

	&.on {
		background: rgba(91, 91, 214, 0.10);
		border-color: rgba(91, 91, 214, 0.30);
		.scene-chip-t { color: #5B5BD6; }
	}
}

/* ── cost row ── */
.cost-row {
	display: flex;
	align-items: center;
	background: rgba(0, 0, 0, 0.03);
	border-radius: 16rpx;
	padding: 0 16rpx;
	height: 88rpx;
	margin-bottom: 20rpx;
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
.cost-bar { width: 1rpx; height: 40rpx; background: rgba(0, 0, 0, 0.10); margin: 0 16rpx; flex-shrink: 0; }

/* ── reactions ── */
.rxn-row { display: flex; gap: 12rpx; margin-bottom: 4rpx; }

.rxn-chip {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8rpx;
	padding: 18rpx 0;
	border-radius: 18rpx;
	background: rgba(0, 0, 0, 0.04);
	border: 2rpx solid transparent;

	.rxn-em  { font-size: 36rpx; }
	.rxn-lab { font-size: 20rpx; color: rgba(0, 0, 0, 0.50); font-weight: 600; }
	&.on .rxn-lab { font-weight: 700; }
}

.body-gap { height: calc(200rpx + env(safe-area-inset-bottom)); }

/* ── formatting bar ── */
.format-bar {
	position: fixed;
	left: 0;
	right: 0;
	bottom: calc(96rpx + env(safe-area-inset-bottom));
	height: 80rpx;
	background: rgba(248, 248, 250, 0.98);
	border-top: 1rpx solid rgba(0, 0, 0, 0.07);
	display: flex;
	align-items: center;
	padding: 0 12rpx;
	gap: 4rpx;
	box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.04);
	z-index: 10;
}

.fb-btn {
	height: 60rpx;
	min-width: 60rpx;
	padding: 0 14rpx;
	border-radius: 10rpx;
	display: flex;
	align-items: center;
	justify-content: center;

	.fb-t     { font-size: 24rpx; font-weight: 700; color: rgba(0, 0, 0, 0.60); }
	.fb-bold  { font-weight: 900; }
	.fb-italic { font-style: italic; }
	.fb-ul    { text-decoration: underline; }
	.fb-clr   { font-size: 20rpx; color: rgba(0, 0, 0, 0.40); }

	&.on {
		background: rgba(91, 91, 214, 0.12);
		.fb-t { color: #5B5BD6; }
	}
}

.fb-sep {
	width: 1rpx;
	height: 36rpx;
	background: rgba(0, 0, 0, 0.10);
	margin: 0 6rpx;
	flex-shrink: 0;
}

/* ── bottom toolbar ── */
.btm-bar {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	height: calc(96rpx + env(safe-area-inset-bottom));
	padding-bottom: env(safe-area-inset-bottom);
	background: rgba(255, 255, 255, 0.97);
	border-top: 1rpx solid rgba(0, 0, 0, 0.07);
	display: flex;
	align-items: center;
}

.btm-icons {
	display: flex;
	align-items: center;
	padding: 0 8rpx;
	gap: 4rpx;
}

.bi {
	width: 80rpx;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 16rpx;

	&.bi-act { background: rgba(91, 91, 214, 0.10); }
}
</style>
