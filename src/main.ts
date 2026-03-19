import { createSSRApp } from 'vue'
import * as Pinia from 'pinia'
import App from './App.vue'
import { createUnistorage } from 'pinia-plugin-unistorage'
import uniapi from './utils/common/uniapi'
import { loginPage, imgUrl, mainColor } from './config'
import 'sard-uniapp/global.d.ts'

// #ifdef H5
import quill from 'quill'
// #endif

// #ifdef MP-WEIXIN
import mpShareMixin from './mixin/mp-share-mixin'
// #endif

// #ifdef H5
import { createVNode, render } from 'vue'
import PwaPrompt from './components/PwaPrompt.vue'

if (typeof window !== 'undefined') {
	;(window as Window & { Quill?: unknown }).Quill = quill

	const ua = window.navigator.userAgent.toLowerCase()
	const isWechat = ua.includes('micromessenger')
	const isIOS = /iphone|ipad|ipod/.test(ua)
	const isStandalone = window.matchMedia?.('(display-mode: standalone)')?.matches
		|| (window.navigator as Navigator & { standalone?: boolean }).standalone === true

	// iOS 微信浏览器在普通网页模式下会重复计算底部安全区，导致 tabbar 偏高
	if (isWechat && isIOS && !isStandalone) {
		document.documentElement.classList.add('wechat-ios-browser')
	}
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
		const pwaContainer = document.createElement('div')
		pwaContainer.id = 'pwa-prompt-container'
		document.body.appendChild(pwaContainer)
		const vnode = createVNode(PwaPrompt)
		vnode.appContext = app._context
		render(vnode, pwaContainer)
	}
	// #endif

	return {
		app,
		Pinia
	}
}
