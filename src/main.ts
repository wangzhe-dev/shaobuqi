import { createSSRApp } from 'vue'
import * as Pinia from 'pinia'
import App from './App.vue'
import { createUnistorage } from 'pinia-plugin-unistorage'
import uniapi from './utils/common/uniapi'
import { loginPage, imgUrl, mainColor } from './config'
import 'sard-uniapp/global.d.ts'

// #ifdef MP-WEIXIN
import mpShareMixin from './mixin/mp-share-mixin'
// #endif

// #ifdef H5
import { createVNode, render } from 'vue'
import PwaPrompt from './components/PwaPrompt.vue'

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
