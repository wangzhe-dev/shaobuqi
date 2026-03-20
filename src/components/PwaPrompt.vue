<template>
	<!-- 仅在 H5 平台渲染 -->
	<!-- #ifdef H5 -->
	<view>

		<!-- ── 版本更新 Banner（顶部滑入）── -->
		<view v-if="needRefresh" class="update-bar">
			<view class="ub-inner">
				<view class="ub-pulse" />
				<view class="ub-text">
					<text class="ub-title">发现新版本</text>
					<text class="ub-desc">更新后体验更流畅</text>
				</view>
				<view class="ub-btn" @tap="updateSW">
					<text class="ub-btn-t">立即更新</text>
				</view>
				<view class="ub-close" @tap="dismissUpdate">
					<text class="ub-close-t">×</text>
				</view>
			</view>
		</view>

		<!-- ── 悬浮安装入口（左下角，不与 FAB 冲突）── -->
		<view v-if="showInstallEntry" class="entry-pill" @tap="openInstallEntry">
			<text class="ep-icon">{{ installEntryIcon }}</text>
			<text class="ep-text">{{ installEntryText }}</text>
		</view>

		<!-- ── 弹框遮罩 ── -->
		<view
			v-if="showIOSHint || showInstallBtn || showManualHint"
			class="modal-backdrop"
			@tap="dismissInstall"
		/>

		<!-- ── iOS Safari 安装引导 Modal ── -->
		<view v-if="showIOSHint" class="modal-wrap" @tap.stop>
			<view class="modal">
				<view class="modal-close" @tap="dismissInstall"><text class="modal-close-t">×</text></view>
				<view class="modal-app-icon"><text class="mai-t">烧不起</text></view>
				<text class="modal-title">添加到主屏幕</text>
				<text class="modal-desc">3 步完成安装，像 App 一样直接打开</text>
				<view class="modal-steps">
					<view class="ms-item">
						<view class="ms-num"><text class="ms-n">1</text></view>
						<text class="ms-t">点击底部工具栏的 <text class="ms-em">□↑ 分享</text> 按钮</text>
					</view>
					<view class="ms-item">
						<view class="ms-num"><text class="ms-n">2</text></view>
						<text class="ms-t">向下滑动，选择 <text class="ms-em">「添加到主屏幕」</text></text>
					</view>
					<view class="ms-item">
						<view class="ms-num"><text class="ms-n">3</text></view>
						<text class="ms-t">点击右上角 <text class="ms-em">「添加」</text> 确认即可</text>
					</view>
				</view>
				<view class="modal-actions">
					<view class="btn-dismiss" @tap="dismissInstall"><text class="btn-dismiss-t">知道了</text></view>
				</view>
			</view>
		</view>

		<!-- ── 原生 beforeinstallprompt 安装 Modal ── -->
		<view v-else-if="showInstallBtn" class="modal-wrap" @tap.stop>
			<view class="modal">
				<view class="modal-close" @tap="dismissInstall"><text class="modal-close-t">×</text></view>
				<view class="modal-app-icon"><text class="mai-t">烧不起</text></view>
				<text class="modal-title">安装烧不起</text>
				<text class="modal-desc">添加到桌面，随时打开，告别浏览器栏</text>
				<view class="modal-benefits">
					<view class="mb-item">
						<text class="mb-icon">✦</text>
						<text class="mb-text">桌面图标，一秒直达</text>
					</view>
					<view class="mb-item">
						<text class="mb-icon">⚡</text>
						<text class="mb-text">离线缓存，加载更快</text>
					</view>
					<view class="mb-item">
						<text class="mb-icon">🎯</text>
						<text class="mb-text">沉浸体验，无浏览器栏</text>
					</view>
				</view>
				<view class="modal-actions">
					<view class="btn-primary" @tap="installApp"><text class="btn-primary-t">添加到桌面</text></view>
					<view class="btn-dismiss" @tap="dismissInstall"><text class="btn-dismiss-t">稍后再说</text></view>
				</view>
			</view>
		</view>

		<!-- ── 手动安装引导 Modal ── -->
		<view v-else-if="showManualHint" class="modal-wrap" @tap.stop>
			<view class="modal">
				<view class="modal-close" @tap="dismissInstall"><text class="modal-close-t">×</text></view>
				<view class="modal-app-icon"><text class="mai-t">烧不起</text></view>
				<text class="modal-title">{{ manualGuide.title }}</text>
				<text class="modal-desc">{{ manualGuide.desc }}</text>
				<view class="modal-steps">
					<view
						v-for="(step, index) in manualGuide.steps"
						:key="`${manualGuide.title}-${index}`"
						class="ms-item"
					>
						<view class="ms-num"><text class="ms-n">{{ index + 1 }}</text></view>
						<text class="ms-t">{{ step }}</text>
					</view>
				</view>
				<view class="modal-actions">
					<view v-if="hasNativeInstallPrompt" class="btn-primary" @tap="installApp">
						<text class="btn-primary-t">立即安装</text>
					</view>
					<view class="btn-dismiss" @tap="dismissInstall"><text class="btn-dismiss-t">知道了</text></view>
				</view>
			</view>
		</view>

	</view>
	<!-- #endif -->
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
// #ifdef H5
import { useRegisterSW } from 'virtual:pwa-register/vue'
// #endif

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>
}

interface InstallGuide {
	icon: string
	title: string
	desc: string
	steps: string[]
}

const showIOSHint = ref(false)
const showInstallBtn = ref(false)
const showManualHint = ref(false)
const installPromptDismissed = ref(false)
const hasNativeInstallPrompt = ref(false)

const INSTALL_DISMISS_KEY = 'pwa-install-dismissed-at'
const INSTALL_DISMISS_TTL = 1000 * 60 * 60 * 24

let deferredPrompt: BeforeInstallPromptEvent | null = null

// ── SW 更新检测（使用 workbox-window 避免时序竞争）──
// #ifdef H5
const { needRefresh, updateServiceWorker } = useRegisterSW({
	onRegisteredSW(_swUrl, registration) {
		if (!registration) return
		// 主动触发一次检查（移动端浏览器不一定每次打开都检查）
		registration.update()
		// 每30分钟检查一次（针对长时间后台挂起后唤醒的情况）
		setInterval(() => {
			if (!registration.installing && navigator.onLine) registration.update()
		}, 30 * 60 * 1000)
	},
})
// #endif
// #ifndef H5
const needRefresh = ref(false)
// #endif

const getUserAgent = (): string => navigator.userAgent.toLowerCase()

const isInStandaloneMode = (): boolean => {
	return (
		window.matchMedia('(display-mode: standalone)').matches ||
		(window.navigator as Navigator & { standalone?: boolean }).standalone === true
	)
}

const isIOS = (): boolean => /iphone|ipad|ipod/i.test(getUserAgent())
const isAndroid = (): boolean => /android/i.test(getUserAgent())

const isWeChat = (): boolean => /micromessenger/i.test(getUserAgent())
const isQQEmbedded = (): boolean => / qq\//i.test(getUserAgent()) && !/mqqbrowser|qqbrowser/i.test(getUserAgent())
const isWeibo = (): boolean => /weibo/i.test(getUserAgent())
const isAlipay = (): boolean => /alipayclient/i.test(getUserAgent())
const isDingTalk = (): boolean => /dingtalk/i.test(getUserAgent())
const isEmbeddedBrowser = (): boolean => isWeChat() || isQQEmbedded() || isWeibo() || isAlipay() || isDingTalk()

const isIOSSafari = (): boolean => {
	return isIOS() &&
		/safari/i.test(getUserAgent()) &&
		!/crios|fxios|edgios|micromessenger| qq\/|mqqbrowser|qqbrowser|weibo|alipayclient|dingtalk/i.test(getUserAgent())
}

const isChromeMobile = (): boolean => {
	return isAndroid() &&
		/chrome\//i.test(getUserAgent()) &&
		!/edga\/|opr\/|samsungbrowser|huaweibrowser|honorbrowser|miuibrowser|vivobrowser|heytapbrowser|oppobrowser|quark|ucbrowser|baidubrowser|baiduboxapp|mqqbrowser|qqbrowser/i.test(getUserAgent())
}

const isEdgeMobile = (): boolean => isAndroid() && /edga\//i.test(getUserAgent())
const isSamsungBrowser = (): boolean => /samsungbrowser/i.test(getUserAgent())
const isHuaweiBrowser = (): boolean => /huaweibrowser/i.test(getUserAgent())
const isHonorBrowser = (): boolean => /honorbrowser/i.test(getUserAgent())
const isMiBrowser = (): boolean => /miuibrowser/i.test(getUserAgent())
const isVivoBrowser = (): boolean => /vivobrowser/i.test(getUserAgent())
const isOppoBrowser = (): boolean => /heytapbrowser|oppobrowser/i.test(getUserAgent())
const isUCBrowser = (): boolean => /ucbrowser|ucweb/i.test(getUserAgent())
const isQuarkBrowser = (): boolean => /quark/i.test(getUserAgent())
const isQQBrowser = (): boolean => /mqqbrowser|qqbrowser/i.test(getUserAgent())
const isBaiduBrowser = (): boolean => /baidubrowser|baiduboxapp/i.test(getUserAgent())
const isFirefoxMobile = (): boolean => isAndroid() && /firefox|fennec/i.test(getUserAgent())

const isDesktopChromium = (): boolean => {
	const ua = getUserAgent()
	const isChromium = /chrome|chromium|edg\//i.test(ua) && !/opr\//i.test(ua)
	return isChromium && !isIOS() && !isAndroid()
}

const isDesktopSafari = (): boolean => {
	const ua = getUserAgent()
	const isSafari = /safari/i.test(ua) && !/chrome|chromium|crios|edg|opr\//i.test(ua)
	return isSafari && !isIOS() && !isAndroid()
}

const supportsInstallEntry = (): boolean => {
	return isDesktopChromium() || isDesktopSafari() || isIOS() || isAndroid()
}

const showInstallEntry = computed(() => {
	return supportsInstallEntry() &&
		!isInStandaloneMode() &&
		!showIOSHint.value &&
		!showInstallBtn.value &&
		!showManualHint.value
})

const installEntryText = computed(() => {
	if (isEmbeddedBrowser()) return '浏览器打开'
	if (isQQBrowser()) return '添加桌面快捷方式'
	if (isIOS()) return isIOSSafari() ? '添加到主屏幕' : 'Safari 打开'
	if (isDesktopSafari()) return '添加到桌面'
	if (hasNativeInstallPrompt.value) return '安装应用'
	if (isAndroid()) return '添加到桌面'
	return '安装到桌面'
})

const installEntryIcon = computed(() => {
	if (isEmbeddedBrowser()) return '↗'
	if (isIOS()) return '□'
	return '+'
})

function createAndroidGuide(browserName: string, entryLabel: string): InstallGuide {
	return {
		icon: '安卓',
		title: `在${browserName}添加到桌面`,
		desc: `${browserName} 对安装入口的命名不完全一样，请在浏览器菜单里查找相近选项。`,
		steps: [
			'点击浏览器右上角、底部栏或"更多/菜单"入口',
			`查找 ${entryLabel}`,
			'确认添加后，即可从手机桌面直接打开'
		]
	}
}

const manualGuide = computed<InstallGuide>(() => {
	if (isWeChat()) {
		return {
			icon: '微',
			title: '请先在系统浏览器打开',
			desc: '微信内置浏览器通常不支持直接安装到桌面，需要先跳到系统浏览器。',
			steps: [
				'点击右上角菜单',
				'选择"在浏览器打开"或先复制链接到系统浏览器',
				'回到页面后点击"安装应用"或"添加到桌面"'
			]
		}
	}

	if (isQQEmbedded()) {
		return {
			icon: 'Q',
			title: '请先在系统浏览器打开',
			desc: 'QQ 内打开时通常不能直接安装，请切到系统浏览器继续。',
			steps: [
				'点击右上角菜单',
				'选择"在浏览器打开"',
				'在系统浏览器里再次点击安装入口'
			]
		}
	}

	if (isWeibo()) {
		return {
			icon: '博',
			title: '请先在系统浏览器打开',
			desc: '微博内置浏览器会限制安装能力，建议切到系统浏览器。',
			steps: [
				'点击右上角菜单',
				'选择"浏览器打开"或复制链接',
				'在外部浏览器中添加到桌面'
			]
		}
	}

	if (isAlipay()) {
		return {
			icon: '支',
			title: '请先在系统浏览器打开',
			desc: '支付宝内置浏览器不稳定，建议改用系统浏览器完成安装。',
			steps: [
				'点击右上角菜单',
				'选择"在浏览器打开"',
				'在系统浏览器里选择"安装应用"或"添加到桌面"'
			]
		}
	}

	if (isDingTalk()) {
		return {
			icon: '钉',
			title: '请先在系统浏览器打开',
			desc: '钉钉内打开时不一定支持桌面安装，请改用系统浏览器。',
			steps: [
				'点击右上角菜单',
				'选择"在浏览器打开"',
				'回到站点后添加到桌面'
			]
		}
	}

	if (isIOSSafari()) {
		return {
			icon: 'iOS',
			title: '添加到主屏幕',
			desc: 'iPhone 和 iPad 需要通过 Safari 手动添加到主屏幕。',
			steps: [
				'点击底部或顶部的分享按钮',
				'选择"添加到主屏幕"',
				'确认后即可从桌面直接打开'
			]
		}
	}

	if (isIOS()) {
		return {
			icon: 'Saf',
			title: '请在 Safari 中打开',
			desc: 'iPhone 上只有 Safari 的"添加到主屏幕"体验最完整，其他浏览器通常需要先跳到 Safari。',
			steps: [
				'打开当前浏览器菜单并选择"在 Safari 中打开"',
				'在 Safari 中点击分享按钮',
				'选择"添加到主屏幕"并确认'
			]
		}
	}

	if (isDesktopSafari()) {
		return {
			icon: 'Mac',
			title: '添加到桌面',
			desc: 'Safari 桌面版不会直接弹出安装框，需要手动添加到程序坞。',
			steps: [
				'打开 Safari 顶部菜单栏',
				'选择"文件 -> 添加到程序坞"',
				'确认后即可像应用一样打开'
			]
		}
	}

	if (isDesktopChromium()) {
		return {
			icon: 'PC',
			title: '安装到桌面',
			desc: '桌面 Chromium 浏览器通常不会强制弹窗，请通过地址栏或浏览器菜单安装。',
			steps: [
				'点击地址栏右侧的安装图标',
				'如果没有图标，打开浏览器菜单',
				'选择"安装烧不起"或"Install app"'
			]
		}
	}

	if (isSamsungBrowser()) return createAndroidGuide('三星浏览器', '"添加页面到"或"添加到主屏幕"')
	if (isHuaweiBrowser()) return createAndroidGuide('华为浏览器', '"添加到桌面"或"添加快捷方式"')
	if (isHonorBrowser()) return createAndroidGuide('荣耀浏览器', '"添加到桌面"或"添加快捷方式"')
	if (isMiBrowser()) return createAndroidGuide('小米浏览器', '"添加到桌面"或"发送到桌面"')
	if (isVivoBrowser()) return createAndroidGuide('vivo 浏览器', '"添加到桌面"或"添加到主屏幕"')
	if (isOppoBrowser()) return createAndroidGuide('OPPO 浏览器', '"添加到桌面"或"创建快捷方式"')
	if (isQuarkBrowser()) return createAndroidGuide('夸克浏览器', '"添加到桌面"或"安装应用"')
	if (isUCBrowser()) return createAndroidGuide('UC 浏览器', '"添加到桌面"或"发送到桌面"')
	if (isQQBrowser()) {
		return {
			icon: 'Q',
			title: 'QQ 浏览器添加到桌面',
			desc: 'QQ 浏览器多数场景是“桌面快捷方式”模式，不一定触发标准 PWA 安装弹窗。',
			steps: [
				'点击浏览器底部“菜单/三横”或右上角“更多”',
				'选择“添加到桌面”或“添加快捷方式”',
				'确认后回到手机桌面，从图标直接打开',
				'若菜单里没有该项，先升级 QQ 浏览器后重试'
			]
		}
	}
	if (isBaiduBrowser()) return createAndroidGuide('百度浏览器', '"添加到桌面"或"创建快捷方式"')
	if (isFirefoxMobile()) return createAndroidGuide('Firefox', '"安装"或"添加到主屏幕"')
	if (isEdgeMobile()) return createAndroidGuide('Edge', '"安装此站点为应用"或"添加到手机"')
	if (isChromeMobile()) return createAndroidGuide('Chrome', '"安装应用"或"添加到主屏幕"')

	return createAndroidGuide('当前浏览器', '"安装应用""添加到主屏幕""添加到桌面"或"创建快捷方式"')
})

const wasDismissed = (): boolean => {
	try {
		const raw = localStorage.getItem(INSTALL_DISMISS_KEY)
		if (!raw) return false

		const dismissedAt = Number(raw)
		if (!Number.isFinite(dismissedAt)) {
			localStorage.removeItem(INSTALL_DISMISS_KEY)
			return false
		}

		return Date.now() - dismissedAt < INSTALL_DISMISS_TTL
	} catch {
		return false
	}
}

const persistDismissState = () => {
	try { localStorage.setItem(INSTALL_DISMISS_KEY, String(Date.now())) } catch { /* noop */ }
}

const clearDismissState = () => {
	try { localStorage.removeItem(INSTALL_DISMISS_KEY) } catch { /* noop */ }
}

function revealInstallPrompt() {
	showIOSHint.value = false
	showManualHint.value = false
	window.setTimeout(() => {
		if (!installPromptDismissed.value) showInstallBtn.value = true
	}, 1500)
}

function scheduleManualHint() {
	if (!isDesktopChromium() && !isAndroid()) return

	window.setTimeout(() => {
		if (!deferredPrompt && !showInstallBtn.value && !isInStandaloneMode() && !wasDismissed()) {
			showManualHint.value = true
		}
	}, 3200)
}

function handleBeforeInstallPrompt(event: Event) {
	event.preventDefault()
	deferredPrompt = event as BeforeInstallPromptEvent
	hasNativeInstallPrompt.value = true
	if (!installPromptDismissed.value) revealInstallPrompt()
}

onMounted(() => {
	if (isInStandaloneMode()) return
	installPromptDismissed.value = wasDismissed()
	setupInstallPrompt()
})

function setupInstallPrompt() {
	if (isIOSSafari()) {
		if (!installPromptDismissed.value) {
			window.setTimeout(() => { showIOSHint.value = true }, 1500)
		}
		return
	}

	const preCapture = (window as Window & { __pwa_deferred_prompt?: BeforeInstallPromptEvent | null }).__pwa_deferred_prompt
	if (preCapture) {
		deferredPrompt = preCapture
		hasNativeInstallPrompt.value = true
		;(window as Window & { __pwa_deferred_prompt?: BeforeInstallPromptEvent | null }).__pwa_deferred_prompt = null
		if (!installPromptDismissed.value) revealInstallPrompt()
	} else if (!installPromptDismissed.value) {
		scheduleManualHint()
	}

	window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

	window.addEventListener('appinstalled', () => {
		showIOSHint.value = false
		showInstallBtn.value = false
		showManualHint.value = false
		installPromptDismissed.value = true
		deferredPrompt = null
		hasNativeInstallPrompt.value = false
		persistDismissState()
	})
}

function installApp() {
	if (!deferredPrompt) {
		showInstallBtn.value = false
		showManualHint.value = true
		return
	}

	deferredPrompt.prompt()
	deferredPrompt.userChoice.then(({ outcome }) => {
		deferredPrompt = null
		hasNativeInstallPrompt.value = false
		showInstallBtn.value = false
		if (outcome === 'dismissed') showManualHint.value = true
	})
}

function dismissInstall() {
	showIOSHint.value = false
	showInstallBtn.value = false
	showManualHint.value = false
	installPromptDismissed.value = true
	persistDismissState()
}

function openInstallEntry() {
	clearDismissState()
	installPromptDismissed.value = false

	if (deferredPrompt) {
		installApp()
		return
	}

	if (isIOSSafari()) {
		showIOSHint.value = true
		return
	}

	showManualHint.value = true
}

function updateSW() {
	// #ifdef H5
	updateServiceWorker(true) // true = 更新后自动 reload
	// #endif
}

function dismissUpdate() {
	needRefresh.value = false
}
</script>

<style lang="scss" scoped>

/* ── 版本更新 Banner（顶部）── */
.update-bar {
	position: fixed;
	top: 0; left: 0; right: 0;
	z-index: 9999;
	background: linear-gradient(135deg, #5B5BD6 0%, #7C7CE8 100%);
	padding: calc(env(safe-area-inset-top) + 12px) 16px 12px;
	animation: slideDown 0.36s cubic-bezier(0.34, 1.2, 0.64, 1);
	box-shadow: 0 4px 20px rgba(91, 91, 214, 0.30);
}

.ub-inner {
	display: flex;
	align-items: center;
	gap: 12px;
}

.ub-pulse {
	width: 10px; height: 10px;
	border-radius: 50%;
	background: #fff;
	opacity: 0.9;
	flex-shrink: 0;
	animation: pulse 1.6s ease-in-out infinite;
}

.ub-text { flex: 1; }
.ub-title { display: block; font-size: 14px; font-weight: 700; color: #fff; line-height: 1.3; }
.ub-desc  { display: block; font-size: 12px; color: rgba(255,255,255,0.75); margin-top: 2px; }

.ub-btn {
	background: rgba(255,255,255,0.20);
	border: 1px solid rgba(255,255,255,0.35);
	border-radius: 100px;
	padding: 7px 16px;
	flex-shrink: 0;
	.ub-btn-t { font-size: 13px; font-weight: 700; color: #fff; }
}

.ub-close {
	width: 30px; height: 30px;
	display: flex; align-items: center; justify-content: center;
	flex-shrink: 0;
	.ub-close-t { font-size: 18px; color: rgba(255,255,255,0.65); line-height: 1; }
}

/* ── 悬浮安装入口（左下角）── */
.entry-pill {
	position: fixed;
	left: 24rpx;
	bottom: calc(env(safe-area-inset-bottom) + 160rpx);
	z-index: 9998;
	display: flex;
	align-items: center;
	gap: 10rpx;
	padding: 18rpx 28rpx 18rpx 22rpx;
	border-radius: 999rpx;
	background: #5B5BD6;
	box-shadow: 0 8rpx 28rpx rgba(91, 91, 214, 0.35);

	.ep-icon { font-size: 26rpx; line-height: 1; }
	.ep-text { font-size: 24rpx; font-weight: 700; color: #fff; }
}

/* ── 弹框遮罩 ── */
.modal-backdrop {
	position: fixed;
	top: 0; left: 0; right: 0; bottom: 0;
	background: rgba(0, 0, 0, 0.50);
	z-index: 9998;
	animation: fadeIn 0.22s ease;
}

/* ── Modal 容器 ── */
.modal-wrap {
	position: fixed;
	top: 0; left: 0; right: 0; bottom: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 9999;
	padding: 40rpx;
}

/* ── Modal 卡片 ── */
.modal {
	width: 100%;
	max-width: 680rpx;
	background: #FFFFFF;
	border-radius: 36rpx;
	padding: 48rpx 40rpx 40rpx;
	position: relative;
	box-shadow:
		0 32rpx 80rpx rgba(0, 0, 0, 0.18),
		0 8rpx 24rpx rgba(0, 0, 0, 0.08);
	animation: modalIn 0.30s cubic-bezier(0.34, 1.3, 0.64, 1);
}

.modal-close {
	position: absolute;
	top: 24rpx; right: 28rpx;
	width: 52rpx; height: 52rpx;
	border-radius: 50%;
	background: rgba(0,0,0,0.06);
	display: flex; align-items: center; justify-content: center;
	.modal-close-t { font-size: 30rpx; color: #9CA3AF; line-height: 1; }
}

/* App 图标 */
.modal-app-icon {
	width: 112rpx; height: 112rpx;
	border-radius: 28rpx;
	background: linear-gradient(145deg, #5B5BD6 0%, #7C7CE8 100%);
	display: flex; align-items: center; justify-content: center;
	margin: 0 auto 28rpx;
	box-shadow: 0 12rpx 32rpx rgba(91, 91, 214, 0.35);

	.mai-t {
		font-size: 20rpx; font-weight: 800;
		color: #fff; letter-spacing: 0;
		line-height: 1.3; text-align: center;
	}
}

.modal-title {
	display: block;
	font-size: 36rpx; font-weight: 800;
	color: #1A1A2E;
	text-align: center;
	margin-bottom: 12rpx;
}

.modal-desc {
	display: block;
	font-size: 25rpx; color: #6B7280;
	text-align: center; line-height: 1.55;
	margin-bottom: 32rpx;
}

/* 步骤（iOS / 手动引导）*/
.modal-steps {
	display: flex; flex-direction: column; gap: 16rpx;
	margin-bottom: 36rpx;
}

.ms-item {
	display: flex; align-items: flex-start; gap: 16rpx;
	background: #F7F8FA;
	border-radius: 18rpx;
	padding: 20rpx 22rpx;

	.ms-num {
		width: 40rpx; height: 40rpx; border-radius: 50%;
		background: #5B5BD6;
		display: flex; align-items: center; justify-content: center;
		flex-shrink: 0;
		.ms-n { font-size: 20rpx; font-weight: 800; color: #fff; line-height: 1; }
	}

	.ms-t { font-size: 26rpx; color: #374151; line-height: 1.55; flex: 1; }
	.ms-em { color: #5B5BD6; font-weight: 700; }
}

/* 优势列表（Chrome 安装）*/
.modal-benefits {
	display: flex; flex-direction: column; gap: 16rpx;
	margin-bottom: 36rpx;
}

.mb-item {
	display: flex; align-items: center; gap: 16rpx;
	padding: 16rpx 20rpx;
	background: #F7F8FA;
	border-radius: 16rpx;

	.mb-icon { font-size: 30rpx; flex-shrink: 0; }
	.mb-text { font-size: 26rpx; color: #374151; font-weight: 500; }
}

/* 按钮 */
.modal-actions { display: flex; flex-direction: column; gap: 14rpx; }

.btn-primary {
	height: 88rpx;
	border-radius: 22rpx;
	background: #5B5BD6;
	display: flex; align-items: center; justify-content: center;
	box-shadow: 0 8rpx 24rpx rgba(91, 91, 214, 0.30);
	.btn-primary-t { font-size: 30rpx; font-weight: 800; color: #fff; }
}

.btn-dismiss {
	height: 80rpx;
	border-radius: 22rpx;
	background: rgba(0,0,0,0.05);
	display: flex; align-items: center; justify-content: center;
	.btn-dismiss-t { font-size: 27rpx; font-weight: 600; color: #9CA3AF; }
}

/* ── 动画 ── */
@keyframes slideDown {
	from { opacity: 0; transform: translateY(-100%); }
	to   { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
	from { opacity: 0; }
	to   { opacity: 1; }
}

@keyframes modalIn {
	from { opacity: 0; transform: scale(0.88) translateY(20rpx); }
	to   { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes pulse {
	0%, 100% { opacity: 0.9; transform: scale(1); }
	50%       { opacity: 0.5; transform: scale(0.75); }
}

/* ── 桌面端适配 ── */
@media screen and (min-width: 768px) {
	.entry-pill {
		left: 24px;
		bottom: 32px;
		padding: 10px 18px 10px 14px;
		gap: 8px;
		.ep-icon { font-size: 16px; }
		.ep-text { font-size: 13px; }
	}

	.update-bar { padding: 12px 24px; }

	.modal-wrap { padding: 24px; }
	.modal { max-width: 420px; padding: 36px 32px 32px; }
}
</style>
