<template>
	<!-- 仅在 H5 平台渲染 -->
	<!-- #ifdef H5 -->
	<view>
		<!-- ① iOS 安装引导（Safari 无法自动弹 prompt，只能引导用户手动操作） -->
		<view v-if="showIOSHint" class="pwa-prompt pwa-prompt--install" @tap.stop>
			<view class="pwa-prompt__content">
				<view class="pwa-prompt__close" @tap="dismissInstall">✕</view>
				<view class="pwa-prompt__icon-wrap">
					<text class="pwa-prompt__app-icon">少不起</text>
				</view>
				<text class="pwa-prompt__title">添加到主屏幕</text>
				<text class="pwa-prompt__desc">安装后可离线使用，体验更流畅</text>
				<view class="pwa-prompt__ios-steps">
					<view class="pwa-prompt__step">
						<text class="pwa-prompt__step-num">1</text>
						<text class="pwa-prompt__step-text">点击底部工具栏的</text>
						<text class="pwa-prompt__share-icon">⎋</text>
						<text class="pwa-prompt__step-text">分享按钮</text>
					</view>
					<view class="pwa-prompt__step">
						<text class="pwa-prompt__step-num">2</text>
						<text class="pwa-prompt__step-text">选择「添加到主屏幕」</text>
					</view>
				</view>
				<view class="pwa-prompt__arrow-wrap">
					<view class="pwa-prompt__arrow" />
				</view>
			</view>
		</view>

		<!-- ② Chrome/Edge 安装提示（beforeinstallprompt 触发后显示） -->
		<view v-else-if="showInstallBtn" class="pwa-prompt pwa-prompt--install" @tap.stop>
			<view class="pwa-prompt__content pwa-prompt__content--row">
				<text class="pwa-prompt__icon">📲</text>
				<view class="pwa-prompt__text">
					<text class="pwa-prompt__title">安装少不起</text>
					<text class="pwa-prompt__desc">添加到主屏幕，随时快速访问</text>
				</view>
				<view class="pwa-prompt__actions pwa-prompt__actions--row">
					<text class="pwa-prompt__btn pwa-prompt__btn--update" @tap="installApp">安装</text>
					<text class="pwa-prompt__btn pwa-prompt__btn--dismiss" @tap="dismissInstall">✕</text>
				</view>
			</view>
		</view>

		<!-- ③ 桌面 Chromium 安装引导（浏览器未主动弹提示时兜底显示） -->
		<view v-else-if="showDesktopHint" class="pwa-prompt pwa-prompt--install" @tap.stop>
			<view class="pwa-prompt__content pwa-prompt__content--row">
				<text class="pwa-prompt__icon">💻</text>
				<view class="pwa-prompt__text">
					<text class="pwa-prompt__title">可安装到桌面</text>
					<text class="pwa-prompt__desc">Chrome 桌面版通常不会自动弹窗，请点击地址栏右侧的安装图标</text>
				</view>
				<view class="pwa-prompt__actions pwa-prompt__actions--row">
					<text class="pwa-prompt__btn pwa-prompt__btn--dismiss" @tap="dismissInstall">知道了</text>
				</view>
			</view>
		</view>

		<!-- ④ SW 更新提示 -->
		<view v-else-if="needRefresh" class="pwa-prompt pwa-prompt--update" @tap.stop>
			<view class="pwa-prompt__content pwa-prompt__content--row">
				<text class="pwa-prompt__icon">🚀</text>
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
import { ref, onMounted } from 'vue'

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>
}

// ── 状态 ──────────────────────────────────────────────────────
const showIOSHint = ref(false)
const showInstallBtn = ref(false)
const showDesktopHint = ref(false)
const needRefresh = ref(false)

// Chrome beforeinstallprompt 事件暂存
let deferredPrompt: BeforeInstallPromptEvent | null = null
let swRegistration: ServiceWorkerRegistration | null = null

// ── 平台检测 ───────────────────────────────────────────────────
/** 是否已以 PWA 模式运行（standalone / fullscreen） */
const isInStandaloneMode = (): boolean => {
	return (
		window.matchMedia('(display-mode: standalone)').matches ||
		(window.navigator as any).standalone === true
	)
}

/** iOS 设备（iPhone / iPad） */
const isIOS = (): boolean => /iphone|ipad|ipod/i.test(navigator.userAgent)

/** Android 设备 */
const isAndroid = (): boolean => /android/i.test(navigator.userAgent)

/** 桌面版 Chromium（Chrome / Edge） */
const isDesktopChromium = (): boolean => {
	const ua = navigator.userAgent.toLowerCase()
	const isChromium = /chrome|chromium|edg\//i.test(ua) && !/opr\//i.test(ua)
	return isChromium && !isIOS() && !isAndroid()
}

/** 是否已关闭过安装提示 */
const wasDismissed = (): boolean => {
	try { return !!localStorage.getItem('pwa-install-dismissed') } catch { return false }
}

function revealInstallPrompt() {
	showDesktopHint.value = false
	setTimeout(() => { showInstallBtn.value = true }, 1500)
}

function scheduleDesktopInstallHint() {
	if (!isDesktopChromium()) return

	window.setTimeout(() => {
		if (!deferredPrompt && !showInstallBtn.value && !isInStandaloneMode() && !wasDismissed()) {
			showDesktopHint.value = true
		}
	}, 3200)
}

function handleBeforeInstallPrompt(event: Event) {
	event.preventDefault()
	deferredPrompt = event as BeforeInstallPromptEvent
	revealInstallPrompt()
}

// ── 生命周期 ──────────────────────────────────────────────────
onMounted(() => {
	// 已是 PWA 或 SW 不支持 → 跳过
	if (!('serviceWorker' in navigator) || isInStandaloneMode()) return

	setupInstallPrompt()
	setupSWUpdateDetection()
})

// ── 安装引导 ──────────────────────────────────────────────────
function setupInstallPrompt() {
	if (wasDismissed()) return

	if (isIOS()) {
		// iOS Safari：延迟 1.5s 显示操作引导
		setTimeout(() => { showIOSHint.value = true }, 1500)
		return
	}

	// Chrome / Edge / Android：
	// beforeinstallprompt 可能在 Vue 挂载前已触发（由 index.html 提前捕获）
	const preCapture = (window as any).__pwa_deferred_prompt as BeforeInstallPromptEvent | null
	if (preCapture) {
		deferredPrompt = preCapture
		;(window as any).__pwa_deferred_prompt = null
		revealInstallPrompt()
	} else {
		// 尚未触发，继续监听
		window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
		scheduleDesktopInstallHint()
	}

	// 用户完成安装后自动隐藏
	window.addEventListener('appinstalled', () => {
		showInstallBtn.value = false
		showDesktopHint.value = false
		deferredPrompt = null
		try { localStorage.setItem('pwa-install-dismissed', '1') } catch { /* noop */ }
	})
}

function installApp() {
	if (!deferredPrompt) return
	deferredPrompt.prompt()
	deferredPrompt.userChoice.then(() => {
		deferredPrompt = null
		showInstallBtn.value = false
	})
}

function dismissInstall() {
	showIOSHint.value = false
	showInstallBtn.value = false
	showDesktopHint.value = false
	try { localStorage.setItem('pwa-install-dismissed', '1') } catch { /* noop */ }
}

// ── SW 更新检测 ────────────────────────────────────────────────
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
.pwa-prompt {
	position: fixed;
	left: 24rpx;
	right: 24rpx;
	z-index: 9999;
	animation: slideUp 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);

	// iOS 安装引导：固定在底部，箭头指向分享按钮
	&--install {
		bottom: calc(env(safe-area-inset-bottom) + 20rpx);
	}

	// 更新提示：稍高一些，避免遮住底部操作
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

	&__app-icon {
		font-size: 22rpx;
		color: #fff;
		font-weight: 700;
		letter-spacing: -1rpx;
	}

	&__icon {
		font-size: 44rpx;
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

	// iOS 步骤说明
	&__ios-steps {
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

	&__share-icon {
		font-size: 32rpx;
		color: #5B5BD6;
		font-weight: 700;
		// Safari 分享图标近似符号
		transform: rotate(90deg);
		display: inline-block;
		margin: 0 4rpx;
	}

	// 底部箭头（指向 Safari 工具栏）
	&__arrow-wrap {
		display: flex;
		justify-content: center;
		margin-top: 24rpx;
		padding-bottom: 8rpx;
	}

	&__arrow {
		width: 0;
		height: 0;
		border-left: 18rpx solid transparent;
		border-right: 18rpx solid transparent;
		border-top: 22rpx solid rgba(91, 91, 214, 0.3);
	}

	// 操作按钮
	&__actions {
		&--row {
			display: flex;
			flex-direction: column;
			gap: 10rpx;
			flex-shrink: 0;
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

@keyframes slideUp {
	from { opacity: 0; transform: translateY(24rpx); }
	to   { opacity: 1; transform: translateY(0); }
}
</style>
