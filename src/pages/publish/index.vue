<template>
	<view class="page">
		<!-- Top nav -->
		<view class="top-bar">
			<text class="top-cancel" @tap="goBack">取消</text>
			<view class="btn-pub" :class="{ on: canPublish }" @tap="doPublish">
				<text class="btn-pub-t">发布</text>
			</view>
		</view>

		<scroll-view
			class="body"
			scroll-y
			:show-scrollbar="false"
			:scroll-into-view="scrollToId"
		>
			<!-- Title input -->
			<input
				class="title-inp"
				v-model="form.title"
				placeholder="标题"
				placeholder-class="title-ph"
				maxlength="40"
			/>

			<view class="divider" />

			<!-- Rich text editor -->
			<editor
				id="post-editor"
				class="content-ed"
				placeholder="分享你此刻的想法..."
				show-img-size
				show-img-toolbar
				@ready="onEditorReady"
				@input="onEditorInput"
				@statuschange="onEditorStatusChange"
			/>

			<!-- Media upload grid -->
			<view class="media-grid">
				<view v-for="(src, i) in mediaList" :key="i" class="m-cell">
					<image :src="src" mode="aspectFill" class="m-img" />
					<view class="m-del" @tap.stop="removeMedia(i)">
						<text class="m-x">×</text>
					</view>
				</view>
				<view v-if="mediaList.length < 9" class="m-add" @tap="pickMedia">
					<text class="m-plus">+</text>
					<text class="m-lbl">图片/视频</text>
				</view>
			</view>

			<!-- Scene selector -->
			<view class="meta-section">
				<view class="meta-row">
					<text class="meta-label">分类</text>
					<text v-if="!form.scene" class="meta-hint">选一个，让更多人发现</text>
				</view>
				<scroll-view class="scene-scroll" scroll-x :show-scrollbar="false">
					<view class="scene-list">
						<view
							v-for="s in SCENE_OPTIONS"
							:key="s"
							class="scene-chip"
							:class="{ on: form.scene === s }"
							@tap="form.scene = s"
						>
							<text class="scene-chip-t">{{ s }}</text>
						</view>
					</view>
				</scroll-view>
			</view>

			<!-- Tags input -->
			<view id="section-tags" class="meta-section tags-section">
				<view class="meta-row">
					<text class="meta-label">标签</text>
					<text class="meta-sub">{{ form.tags.length }}/5</text>
				</view>
				<view class="tags-wrap">
					<view v-for="(tag, i) in form.tags" :key="i" class="tag-chip">
						<text class="tag-t">#{{ tag }}</text>
						<text class="tag-rm" @tap.stop="removeTag(i)">×</text>
					</view>
					<input
						v-if="form.tags.length < 5"
						class="tag-inp"
						v-model="tagInput"
						:focus="tagInputFocus"
						placeholder="添加标签，回车确认"
						placeholder-class="tag-ph"
						maxlength="12"
						@confirm="addTag"
						@blur="tagInputFocus = false"
					/>
				</view>
			</view>

			<view class="body-gap" />
		</scroll-view>

		<!-- Formatting bar (above bottom toolbar, fixed) -->
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
				<view class="bi" @tap="pickMedia">
					<uni-icons type="image" size="22" color="#3C3C3C" />
				</view>
				<view class="bi" :class="{ 'bi-act': showFormatBar }" @tap="toggleFormatBar">
					<uni-icons type="compose" size="22" :color="showFormatBar ? '#5B5BD6' : '#3C3C3C'" />
				</view>
				<view class="bi" @tap="pickVideo">
					<uni-icons type="videocam" size="22" color="#3C3C3C" />
				</view>
				<view class="bi" @tap="insertDivider">
					<uni-icons type="bars" size="22" color="#3C3C3C" />
				</view>
				<!-- # → 滚动并聚焦到标签输入框，统一入口 -->
				<view class="bi" @tap="focusTagInput">
					<text class="bi-hash">#</text>
				</view>
				<view class="bi" @tap="onEmoji">
					<uni-icons type="emojiface" size="22" color="#3C3C3C" />
				</view>
				<view class="bi" @tap="insertEditorImage">
					<uni-icons type="more" size="22" color="#3C3C3C" />
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, reactive, ref } from 'vue'

const SKILL_PREVIEW_KEY = 'latest_published_skill_v1'
const FEED_PUBLISHED_KEY = 'skill_feed_published_v1'
const SCENE_OPTIONS = ['写作', '编程', '自媒体', '办公', '运营', '学习', '设计', '电商']

type PostForm = {
	title: string
	html: string
	text: string
	scene: string
	tags: string[]
}

const instance = getCurrentInstance()
const editorCtx = ref<any>(null)
const formats = ref<Record<string, any>>({})
const mediaList = ref<string[]>([])
const showFormatBar = ref(false)
const tagInput = ref('')
const tagInputFocus = ref(false)
const scrollToId = ref('')

const form = reactive<PostForm>({
	title: '',
	html: '',
	text: '',
	scene: '',
	tags: []
})

const stripHtml = (html: string) =>
	html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()

/* ── editor ── */
const onEditorReady = () => {
	uni.createSelectorQuery()
		.select('#post-editor')
		.context((res: any) => { editorCtx.value = res?.context ?? null })
		.exec()
}

const onEditorInput = (e: any) => {
	const d = e?.detail ?? {}
	form.html = d.html ?? ''
	form.text = (d.text || stripHtml(form.html)).trim()
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

const applyFormat = (name: string, value?: string | number | boolean) => {
	if (ensureEditor()) editorCtx.value.format(name, value)
}

const undo         = () => { if (ensureEditor()) editorCtx.value.undo() }
const redo         = () => { if (ensureEditor()) editorCtx.value.redo() }
const removeFormat = () => { if (ensureEditor()) editorCtx.value.removeFormat() }
const insertDivider = () => { if (ensureEditor()) editorCtx.value.insertDivider({}) }

const onEmoji = () => uni.showToast({ title: '表情功能开发中', icon: 'none' })

const insertEditorImage = () => {
	if (!ensureEditor()) return
	uni.chooseImage({
		count: 1,
		sizeType: ['compressed'],
		sourceType: ['album', 'camera'],
		success: (res) => {
			const src = res.tempFilePaths?.[0]
			if (src) editorCtx.value.insertImage({ src, alt: '内容图片' })
		}
	})
}

/* ── media ── */
const pickMedia = () => {
	const remain = 9 - mediaList.value.length
	if (remain <= 0) return
	uni.chooseImage({
		count: remain,
		sizeType: ['compressed'],
		sourceType: ['album', 'camera'],
		success: (res) => mediaList.value.push(...res.tempFilePaths)
	})
}

const pickVideo = () => {
	uni.chooseVideo({
		sourceType: ['album', 'camera'],
		success: (res) => mediaList.value.push(res.tempFilePath)
	})
}

const removeMedia = (i: number) => mediaList.value.splice(i, 1)

/* ── tags ── */
const addTag = () => {
	const v = tagInput.value.trim().replace(/^#/, '')
	if (v && !form.tags.includes(v) && form.tags.length < 5) form.tags.push(v)
	tagInput.value = ''
}

const removeTag = (i: number) => form.tags.splice(i, 1)

// # 按钮：滚动到标签区并聚焦输入框，避免和编辑器内插入文本的逻辑重叠
const focusTagInput = () => {
	scrollToId.value = ''
	nextTick(() => {
		scrollToId.value = 'section-tags'
		tagInputFocus.value = true
	})
}

/* ── state ── */
const canPublish = computed(() => !!(form.title.trim() || form.text.trim()))

const hasContent = computed(() =>
	!!(form.title.trim() || form.text.trim() || mediaList.value.length)
)

/* ── helpers ── */
const buildBrief = (text: string) => {
	const pure = text.replace(/\s+/g, ' ').trim()
	if (!pure) return ''
	const lines = pure.split(/[。！？!?；;\n]/).map((s) => s.trim()).filter(Boolean)
	const merged = (lines.slice(0, 2).join('，') || pure).trim()
	return merged.length > 90 ? `${merged.slice(0, 87)}...` : merged
}

const formatDate = (d: Date) =>
	`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/* ── payload builders ── */
const buildSkillPayload = (id: string, brief: string, scene: string, now: Date) => ({
	id,
	title: form.title.trim() || '无标题',
	scene,
	author: '我',
	authorColor: '#5B5BD6',
	publishTime: formatDate(now),
	copyCount: '0',
	favoriteCount: '0',
	successRate: '--',
	feedbackCount: '0',
	brief,
	useScenes: form.tags.length ? form.tags : [scene],
	avgInputToken: '--',
	avgOutputToken: '--',
	avgTotalToken: '--',
	estimatedCost: '--',
	recommendedModel: '--',
	commonModel: '--',
	showConsume: false,
	totalUses: '0',
	weekUses: '0',
	fullPrompt: form.text.trim(),
	fullPromptHtml: form.html.trim(),
	contentImages: [...mediaList.value],
	variableNotes: '',
	variables: [],
	steps: ['复制内容', '粘贴到 AI 工具', '按需调整'],
	feedbacks: [],
	similarSkills: []
})

const buildFeedItem = (id: string, brief: string, scene: string) => ({
	id,
	title: form.title.trim() || '无标题',
	summary: brief,
	scene,
	tags: form.tags.slice(0, 3),
	avgToken: '--',
	model: '--',
	modelColor: '#5B5BD6',
	successRate: '--',
	copyCount: '0',
	favoriteCount: '0',
	author: '我',
	authorColor: '#5B5BD6',
	featured: false,
	isNew: true,
	lowCost: false,
	highConsume: false,
	stable: false,
	publishedAt: Date.now()
})

/* ── actions ── */
const resetForm = () => {
	form.title = ''
	form.html = ''
	form.text = ''
	form.scene = ''
	form.tags = []
	tagInput.value = ''
	mediaList.value = []
	formats.value = {}
	showFormatBar.value = false
	if (editorCtx.value) editorCtx.value.clear({})
}

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

const doPublish = () => {
	if (!canPublish.value) {
		uni.showToast({ title: '请输入标题或内容', icon: 'none' })
		return
	}
	const id = `p-${Date.now()}`
	const now = new Date()
	const brief = buildBrief(form.text) || form.title.trim()
	const scene = form.scene || '其他'

	uni.setStorageSync(SKILL_PREVIEW_KEY, buildSkillPayload(id, brief, scene, now))
	uni.setStorageSync(FEED_PUBLISHED_KEY, buildFeedItem(id, brief, scene))

	uni.showToast({ title: '发布成功', icon: 'success' })
	setTimeout(() => {
		resetForm()
		uni.navigateTo({ url: '/pages/detail/skill?fromPublish=1' })
	}, 600)
}

onShow(() => {
	// #ifdef MP-WEIXIN
	uni.getTabBar(instance?.proxy)?.setData({ selected: 1 })
	// #endif
})
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

.title-inp {
	width: 100%;
	height: 88rpx;
	padding: 0 28rpx;
	font-size: 34rpx;
	font-weight: 600;
	color: #1A1A2E;
	box-sizing: border-box;
}

.title-ph { color: #C8CACC; font-weight: 400; }

.divider {
	height: 1rpx;
	background: rgba(0, 0, 0, 0.06);
	margin: 0 28rpx;
}

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

/* ── media grid ── */
.media-grid {
	display: flex;
	flex-wrap: wrap;
	gap: 14rpx;
	padding: 8rpx 28rpx 20rpx;
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
.meta-section { padding: 16rpx 28rpx 0; }
.tags-section  { padding-bottom: 28rpx; }

.meta-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 12rpx;
}

.meta-label { font-size: 24rpx; font-weight: 700; color: rgba(0, 0, 0, 0.55); }
.meta-hint  { font-size: 22rpx; color: #C8CACC; }
.meta-sub   { font-size: 22rpx; color: #9CA3AF; }

/* ── scene chips ── */
.scene-scroll { width: 100%; }

.scene-list {
	display: inline-flex;
	gap: 12rpx;
	padding-bottom: 4rpx;
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

/* ── tags ── */
.tags-wrap {
	display: flex;
	flex-wrap: wrap;
	gap: 10rpx;
	align-items: center;
}

.tag-chip {
	display: inline-flex;
	align-items: center;
	height: 56rpx;
	padding: 0 16rpx;
	border-radius: 10rpx;
	background: rgba(91, 91, 214, 0.08);
	border: 1rpx solid rgba(91, 91, 214, 0.20);
	gap: 6rpx;

	.tag-t  { font-size: 24rpx; color: #5B5BD6; font-weight: 600; }
	.tag-rm { font-size: 28rpx; color: #5B5BD6; font-weight: 700; }
}

.tag-inp {
	height: 56rpx;
	min-width: 160rpx;
	max-width: 280rpx;
	padding: 0 16rpx;
	border-radius: 10rpx;
	border: 1rpx dashed rgba(0, 0, 0, 0.15);
	background: rgba(0, 0, 0, 0.025);
	font-size: 24rpx;
	color: #1A1A2E;
	box-sizing: border-box;
}

.tag-ph { color: #C8CACC; }

.body-gap { height: calc(200rpx + env(safe-area-inset-bottom)); }

/* ── formatting bar ── */
.format-bar {
	position: fixed;
	left: 0;
	right: 0;
	/* #ifndef H5 */
	bottom: calc(96rpx + 108rpx + env(safe-area-inset-bottom));
	/* #endif */
	/* #ifdef H5 */
	bottom: calc(96rpx + var(--window-bottom));
	/* #endif */
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
	/* #ifndef H5 */
	bottom: calc(108rpx + env(safe-area-inset-bottom));
	/* #endif */
	/* #ifdef H5 */
	bottom: var(--window-bottom);
	/* #endif */
	height: 96rpx;
	background: rgba(255, 255, 255, 0.97);
	border-top: 1rpx solid rgba(0, 0, 0, 0.07);
	display: flex;
	align-items: center;
}

.btm-icons {
	display: flex;
	align-items: center;
	justify-content: space-around;
	width: 100%;
	padding: 0 8rpx;
}

.bi {
	width: 80rpx;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 16rpx;

	.bi-hash {
		font-size: 34rpx;
		font-weight: 700;
		color: #3C3C3C;
		line-height: 1;
	}

	&.bi-act { background: rgba(91, 91, 214, 0.10); }
}
</style>
