import * as Pinia from 'pinia'
import { createUnistorage } from 'pinia-plugin-unistorage'
import 'sard-uniapp/global.d.ts'
import { createSSRApp } from 'vue'
import App from './App.vue'
import { imgUrl, loginPage, mainColor } from './config'
import uniapi from './utils/common/uniapi'

// #ifdef H5
import quill from 'quill'
import { registerSW } from 'virtual:pwa-register'
import { createVNode, render } from 'vue'
import PwaPrompt from './components/PwaPrompt.vue'
// #endif

// #ifdef MP-WEIXIN
import mpShareMixin from './mixin/mp-share-mixin'
// #endif

// #ifdef H5
let hasRegisteredPwaSW = false
let pwaUpdateSW: ((reloadPage?: boolean) => Promise<void>) | undefined

const initPwaAutoUpdate = () => {
	if (typeof window === 'undefined' || hasRegisteredPwaSW) return
	hasRegisteredPwaSW = true

	pwaUpdateSW = registerSW({
		immediate: true,
		onNeedRefresh() {
			console.log('[PWA] 检测到新版本，准备刷新并接管页面')
			if (pwaUpdateSW) {
				void pwaUpdateSW(true)
			}
		},
		onOfflineReady() {
			console.log('[PWA] 离线缓存已就绪')
		}
	})

	// 页面回到前台时，主动检查一次 Service Worker 更新
	if ('serviceWorker' in navigator && typeof document !== 'undefined') {
		document.addEventListener('visibilitychange', () => {
			if (document.visibilityState === 'visible') {
				void navigator.serviceWorker.getRegistration().then((registration) => {
					if (registration) {
						return registration.update()
					}
				}).catch((err) => {
					console.warn('[PWA] 前台更新检查失败:', err)
				})
			}
		})

		// 定时检查更新，降低桌面安装后长期不更新的概率
		window.setInterval(() => {
			void navigator.serviceWorker.getRegistration().then((registration) => {
				if (registration) {
					return registration.update()
				}
			}).catch((err) => {
				console.warn('[PWA] 定时更新检查失败:', err)
			})
		}, 60 * 1000)
	}
}

if (typeof window !== 'undefined') {
	;(window as Window & { Quill?: unknown }).Quill = quill

	const ua = window.navigator.userAgent.toLowerCase()
	const isWechat = ua.includes('micromessenger')
	const isIOS = /iphone|ipad|ipod/.test(ua)
	const isStandalone =
		window.matchMedia?.('(display-mode: standalone)')?.matches ||
		(window.navigator as Navigator & { standalone?: boolean }).standalone === true

	// iOS 微信浏览器在普通网页模式下会重复计算底部安全区，导致 tabbar 偏高
	if (isWechat && isIOS && !isStandalone) {
		document.documentElement.classList.add('wechat-ios-browser')
	}

	initPwaAutoUpdate()
}

if (import.meta.env.DEV && import.meta.env.MODE !== 'production' && typeof document !== 'undefined') {
	const script = document.createElement('script')
	script.src = 'https://unpkg.com/vconsole@latest/dist/vconsole.min.js'
	script.onload = () => {
		const VConsole = (window as Window & { VConsole?: new () => unknown }).VConsole
		if (VConsole) new VConsole()
	}
	document.head.appendChild(script)
}
// #endif

export const createApp = () => {
	const app = createSSRApp(App)

	// 全局属性
	app.config.globalProperties.$loginPage = loginPage
	app.config.globalProperties.$imgUrl = imgUrl
	app.config.globalProperties.$mainColor = mainColor

	// pinia 的本地数据缓存插件
	const store = Pinia.createPinia()
	store.use(createUnistorage())
	app.use(store)

	// uni工具类函数
	app.use(uniapi)

	// #ifdef MP-WEIXIN
	// 小程序分享的mixin封装
	app.mixin(mpShareMixin)
	// #endif

	// #ifdef H5
	if (typeof document !== 'undefined') {
		const existed = document.getElementById('pwa-prompt-container')
		if (!existed) {
			const pwaContainer = document.createElement('div')
			pwaContainer.id = 'pwa-prompt-container'
			document.body.appendChild(pwaContainer)
			const vnode = createVNode(PwaPrompt)
			vnode.appContext = app._context
			render(vnode, pwaContainer)
		}
	}
	// #endif

	return {
		app,
		Pinia
	}
}
