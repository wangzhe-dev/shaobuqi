<template>
	<!-- 仅在 H5 平台渲染 -->
	<!-- #ifdef H5 -->
	<view>
		<view
			v-if="showInstallEntry"
			class="pwa-entry"
			@tap="openInstallEntry"
		>
			<text class="pwa-entry__icon">{{ installEntryIcon }}</text>
			<text class="pwa-entry__text">{{ installEntryText }}</text>
		</view>

		<!-- iOS Safari 原生安装引导 -->
		<view v-if="showIOSHint" class="pwa-prompt pwa-prompt--install" @tap.stop>
			<view class="pwa-prompt__content">
				<view class="pwa-prompt__close" @tap="dismissInstall">✕</view>
				<view class="pwa-prompt__icon-wrap">
					<text class="pwa-prompt__app-icon">少不起</text>
				</view>
				<text class="pwa-prompt__title">添加到主屏幕</text>
				<text class="pwa-prompt__desc">安装后可离线使用，体验更流畅</text>
				<view class="pwa-prompt__steps">
					<view class="pwa-prompt__step">
						<text class="pwa-prompt__step-num">1</text>
						<text class="pwa-prompt__step-text">点击底部或顶部的分享按钮</text>
					</view>
					<view class="pwa-prompt__step">
						<text class="pwa-prompt__step-num">2</text>
						<text class="pwa-prompt__step-text">选择“添加到主屏幕”</text>
					</view>
					<view class="pwa-prompt__step">
						<text class="pwa-prompt__step-num">3</text>
						<text class="pwa-prompt__step-text">确认后即可从桌面直接打开</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 支持原生 beforeinstallprompt 的浏览器 -->
		<view v-else-if="showInstallBtn" class="pwa-prompt pwa-prompt--install" @tap.stop>
			<view class="pwa-prompt__content pwa-prompt__content--row">
				<text class="pwa-prompt__icon">安装</text>
				<view class="pwa-prompt__text">
					<text class="pwa-prompt__title">安装少不起</text>
					<text class="pwa-prompt__desc">添加到主屏幕，后续可像 App 一样直接打开</text>
				</view>
				<view class="pwa-prompt__actions pwa-prompt__actions--row">
					<text class="pwa-prompt__btn pwa-prompt__btn--update" @tap="installApp">安装</text>
					<text class="pwa-prompt__btn pwa-prompt__btn--dismiss" @tap="dismissInstall">稍后</text>
				</view>
			</view>
		</view>

		<!-- 手动安装引导 -->
		<view v-else-if="showManualHint" class="pwa-prompt pwa-prompt--install" @tap.stop>
			<view class="pwa-prompt__content">
				<view class="pwa-prompt__close" @tap="dismissInstall">✕</view>
				<view class="pwa-prompt__icon-wrap pwa-prompt__icon-wrap--small">
					<text class="pwa-prompt__app-icon">{{ manualGuide.icon }}</text>
				</view>
				<text class="pwa-prompt__title">{{ manualGuide.title }}</text>
				<text class="pwa-prompt__desc">{{ manualGuide.desc }}</text>
				<view class="pwa-prompt__steps">
					<view v-for="(step, index) in manualGuide.steps" :key="`${manualGuide.title}-${index}`" class="pwa-prompt__step">
						<text class="pwa-prompt__step-num">{{ index + 1 }}</text>
						<text class="pwa-prompt__step-text">{{ step }}</text>
					</view>
				</view>
				<view class="pwa-prompt__actions pwa-prompt__actions--manual">
					<text v-if="hasNativeInstallPrompt" class="pwa-prompt__btn pwa-prompt__btn--update" @tap="installApp">立即安装</text>
					<text class="pwa-prompt__btn pwa-prompt__btn--dismiss" @tap="dismissInstall">知道了</text>
				</view>
			</view>
		</view>

		<!-- SW 更新提示 -->
		<view v-else-if="needRefresh" class="pwa-prompt pwa-prompt--update" @tap.stop>
			<view class="pwa-prompt__content pwa-prompt__content--row">
				<text class="pwa-prompt__icon">更新</text>
				<view class="pwa-prompt__text">
					<text class="pwa-prompt__title">发现新版本</text>
					<text class="pwa-prompt__desc">点击更新以获取最新内容</text>
				</view>
				<view class="pwa-prompt__actions pwa-prompt__actions--row">
					<text class="pwa-prompt__btn pwa-prompt__btn--update" @tap="updateSW">立即更新</text>
					<text class="pwa-prompt__btn pwa-prompt__btn--dismiss" @tap="dismissUpdate">稍后</text>
				</view>
			</view>
		</view>
	</view>
	<!-- #endif -->
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

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
const needRefresh = ref(false)
const installPromptDismissed = ref(false)
const hasNativeInstallPrompt = ref(false)

const INSTALL_DISMISS_KEY = 'pwa-install-dismissed-at'
const INSTALL_DISMISS_TTL = 1000 * 60 * 60 * 24

let deferredPrompt: BeforeInstallPromptEvent | null = null
let swRegistration: ServiceWorkerRegistration | null = null

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
			'点击浏览器右上角、底部栏或“更多/菜单”入口',
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
				'选择“在浏览器打开”或先复制链接到系统浏览器',
				'回到页面后点击“安装应用”或“添加到桌面”'
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
				'选择“在浏览器打开”',
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
				'选择“浏览器打开”或复制链接',
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
				'选择“在浏览器打开”',
				'在系统浏览器里选择“安装应用”或“添加到桌面”'
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
				'选择“在浏览器打开”',
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
				'选择“添加到主屏幕”',
				'确认后即可从桌面直接打开'
			]
		}
	}

	if (isIOS()) {
		return {
			icon: 'Saf',
			title: '请在 Safari 中打开',
			desc: 'iPhone 上只有 Safari 的“添加到主屏幕”体验最完整，其他浏览器通常需要先跳到 Safari。',
			steps: [
				'打开当前浏览器菜单并选择“在 Safari 中打开”',
				'在 Safari 中点击分享按钮',
				'选择“添加到主屏幕”并确认'
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
				'选择“文件 -> 添加到程序坞”',
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
				'选择“安装少不起”或“Install app”'
			]
		}
	}

	if (isSamsungBrowser()) return createAndroidGuide('三星浏览器', '“添加页面到”或“添加到主屏幕”')
	if (isHuaweiBrowser()) return createAndroidGuide('华为浏览器', '“添加到桌面”或“添加快捷方式”')
	if (isHonorBrowser()) return createAndroidGuide('荣耀浏览器', '“添加到桌面”或“添加快捷方式”')
	if (isMiBrowser()) return createAndroidGuide('小米浏览器', '“添加到桌面”或“发送到桌面”')
	if (isVivoBrowser()) return createAndroidGuide('vivo 浏览器', '“添加到桌面”或“添加到主屏幕”')
	if (isOppoBrowser()) return createAndroidGuide('OPPO 浏览器', '“添加到桌面”或“创建快捷方式”')
	if (isQuarkBrowser()) return createAndroidGuide('夸克浏览器', '“添加到桌面”或“安装应用”')
	if (isUCBrowser()) return createAndroidGuide('UC 浏览器', '“添加到桌面”或“发送到桌面”')
	if (isQQBrowser()) return createAndroidGuide('QQ 浏览器', '“添加到桌面”或“添加到主屏幕”')
	if (isBaiduBrowser()) return createAndroidGuide('百度浏览器', '“添加到桌面”或“创建快捷方式”')
	if (isFirefoxMobile()) return createAndroidGuide('Firefox', '“安装”或“添加到主屏幕”')
	if (isEdgeMobile()) return createAndroidGuide('Edge', '“安装此站点为应用”或“添加到手机”')
	if (isChromeMobile()) return createAndroidGuide('Chrome', '“安装应用”或“添加到主屏幕”')

	return createAndroidGuide('当前浏览器', '“安装应用”“添加到主屏幕”“添加到桌面”或“创建快捷方式”')
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
	if ('serviceWorker' in navigator) {
		setupSWUpdateDetection()
	}
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

function setupSWUpdateDetection() {
	navigator.serviceWorker.ready.then((registration) => {
		swRegistration = registration

		if (registration.waiting) {
			needRefresh.value = true
		}

		registration.addEventListener('updatefound', () => {
			const newWorker = registration.installing
			newWorker?.addEventListener('statechange', () => {
				if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
					needRefresh.value = true
				}
			})
		})
	})

	let refreshing = false
	navigator.serviceWorker.addEventListener('controllerchange', () => {
		if (!refreshing) {
			refreshing = true
			window.location.reload()
		}
	})
}

function updateSW() {
	swRegistration?.waiting?.postMessage({ type: 'SKIP_WAITING' })
	needRefresh.value = false
}

function dismissUpdate() {
	needRefresh.value = false
}
</script>

<style lang="scss" scoped>
.pwa-entry {
	position: fixed;
	right: 24rpx;
	bottom: calc(env(safe-area-inset-bottom) + 160rpx);
	z-index: 9998;
	display: flex;
	align-items: center;
	gap: 10rpx;
	padding: 18rpx 24rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, #5B5BD6 0%, #4338CA 100%);
	box-shadow:
		0 16rpx 36rpx rgba(67, 56, 202, 0.24),
		0 4rpx 10rpx rgba(0, 0, 0, 0.12);
	color: #ffffff;
}

.pwa-entry__icon {
	width: 34rpx;
	height: 34rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.22);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 26rpx;
	line-height: 34rpx;
	text-align: center;
}

.pwa-entry__text {
	font-size: 24rpx;
	font-weight: 700;
	line-height: 1;
}

.pwa-prompt {
	position: fixed;
	left: 24rpx;
	right: 24rpx;
	z-index: 9999;
	animation: slideUp 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);

	&--install {
		bottom: calc(env(safe-area-inset-bottom) + 20rpx);
	}

	&--update {
		bottom: calc(env(safe-area-inset-bottom) + 120rpx);
	}

	&__content {
		background: #ffffff;
		border-radius: 28rpx;
		padding: 40rpx 36rpx 32rpx;
		box-shadow:
			0 8rpx 40rpx rgba(91, 91, 214, 0.16),
			0 2rpx 8rpx rgba(0, 0, 0, 0.06);
		border: 1rpx solid rgba(91, 91, 214, 0.1);
		position: relative;

		&--row {
			display: flex;
			align-items: center;
			gap: 20rpx;
			padding: 28rpx 32rpx;
		}
	}

	&__close {
		position: absolute;
		top: 24rpx;
		right: 28rpx;
		font-size: 28rpx;
		color: #9CA3AF;
		line-height: 1;
		padding: 8rpx;
	}

	&__icon-wrap {
		width: 100rpx;
		height: 100rpx;
		background: linear-gradient(135deg, #5B5BD6 0%, #7c3aed 100%);
		border-radius: 24rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 24rpx;
		box-shadow: 0 8rpx 20rpx rgba(91, 91, 214, 0.3);
	}

	&__icon-wrap--small {
		width: 84rpx;
		height: 84rpx;
		margin-bottom: 20rpx;
	}

	&__app-icon {
		font-size: 22rpx;
		color: #fff;
		font-weight: 700;
		letter-spacing: -1rpx;
	}

	&__icon {
		font-size: 30rpx;
		min-width: 72rpx;
		height: 72rpx;
		border-radius: 20rpx;
		background: #F4F5FF;
		color: #4338CA;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	&__text {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}

	&__title {
		font-size: 30rpx;
		font-weight: 700;
		color: #1A1A2E;
		line-height: 1.3;
		display: block;
		text-align: center;
	}

	&__content--row &__title {
		text-align: left;
		font-size: 28rpx;
	}

	&__desc {
		font-size: 24rpx;
		color: #6B7280;
		line-height: 1.5;
		display: block;
		text-align: center;
		margin-top: 8rpx;
	}

	&__content--row &__desc {
		text-align: left;
		margin-top: 4rpx;
	}

	&__steps {
		margin-top: 32rpx;
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	&__step {
		display: flex;
		align-items: center;
		gap: 12rpx;
		background: #F8F7FF;
		border-radius: 16rpx;
		padding: 18rpx 20rpx;
	}

	&__step-num {
		width: 36rpx;
		height: 36rpx;
		background: #5B5BD6;
		color: #fff;
		border-radius: 50%;
		font-size: 22rpx;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		line-height: 36rpx;
		text-align: center;
	}

	&__step-text {
		font-size: 26rpx;
		color: #374151;
		line-height: 1.4;
	}

	&__actions {
		&--row {
			display: flex;
			flex-direction: column;
			gap: 10rpx;
			flex-shrink: 0;
		}

		&--manual {
			display: flex;
			flex-direction: column;
			gap: 12rpx;
			margin-top: 28rpx;
		}
	}

	&__btn {
		font-size: 24rpx;
		font-weight: 600;
		padding: 12rpx 24rpx;
		border-radius: 100rpx;
		text-align: center;
		white-space: nowrap;

		&--update {
			background: #5B5BD6;
			color: #ffffff;
		}

		&--dismiss {
			background: #F3F4F6;
			color: #6B7280;
		}
	}
}

@media screen and (min-width: 768px) {
	.pwa-entry {
		right: 24px;
		bottom: 32px;
		padding: 12px 16px;
		gap: 8px;
	}

	.pwa-entry__icon {
		width: 22px;
		height: 22px;
		font-size: 18px;
		line-height: 22px;
	}

	.pwa-entry__text {
		font-size: 14px;
	}

	.pwa-prompt {
		left: auto;
		right: 24px;
		width: 380px;

		&--install,
		&--update {
			bottom: 92px;
		}
	}
}

@keyframes slideUp {
	from { opacity: 0; transform: translateY(24rpx); }
	to   { opacity: 1; transform: translateY(0); }
}
</style>
