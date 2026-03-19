// 全局请求拦截器
import Request from 'luch-request'
import type { HttpRequestConfig, HttpResponse, HttpError, HttpTask } from 'luch-request'
import { requestUrl, loginPage, apiPrefix } from '@/config'
import { useUserStore } from '@/stores'

const service = new Request()

// 白名单（不附加 Authorization 头）
const whiteList = [
	'/auth/wxlogin',
	'/auth/login/password'
]

// 是否正在刷新的标记
let isRefreshing = false
// 重试队列，每一项将是一个待执行的函数形式
let requests = []

// 设置全局配置
service.setConfig((config : HttpRequestConfig) => {
	// #ifdef H5
	config.baseURL = `/${apiPrefix}`
	// #endif

	// #ifndef H5
	config.baseURL = requestUrl
	config.sslVerify = false
	config.firstIpv4 = false
	// #endif

	config.timeout = 20000
	config.header = {
		...config.header,
		'Content-Type': 'application/json;charset=UTF-8'
	}
	return config
})

// 请求拦截
service.interceptors.request.use((config : HttpRequestConfig) => {
	// 初始化请求拦截器时，会执行此方法，此时data为undefined，赋予默认{}
	config.data = config.data || {}

	config.header = { ...config.header }

	// 防止数据重复提交
	if (config.method === 'POST' || config.method === 'PUT' || config.method === 'DELETE') {
		const requestObj = {
			url: config.url,
			data: typeof config.data === 'object' ? JSON.stringify(config.data) : config.data,
			time: new Date().getTime()
		}

		const storageRequestObj = uni.getStorageSync('storageRequestObj')
		if (!storageRequestObj) {
			uni.setStorageSync('storageRequestObj', requestObj)
		} else {
			const storageUrl = storageRequestObj.url
			const storageData = storageRequestObj.data
			const storageTime = storageRequestObj.time
			// 间隔时间(ms)，小于此时间视为重复提交
			const interval = 1000
			if (storageData === requestObj.data && requestObj.time - storageTime < interval && storageUrl === requestObj.url) {
				return Promise.reject('数据正在处理，请勿重复提交')
			} else {
				uni.setStorageSync('storageRequestObj', requestObj)
			}
		}
	}

	if (config.url && whiteList.includes(config.url)) return config

	const token = useUserStore().token
	if (token) config.header['Authorization'] = `Bearer ${token}`

	return config
}, (err : HttpRequestConfig<HttpTask> | HttpError) => {
	return Promise.reject(err)
})

// 响应拦截
service.interceptors.response.use((response : HttpResponse) => {
	if (process.env.NODE_ENV === 'development') {
		// 由于类型检查报错，使用类型断言来绕过检查
		const configWithFullPath = response.config as { fullPath : string } & typeof response.config
		console.log(`响应拦截-${configWithFullPath.fullPath.replace(/^https?:\/\/[^\/]+/, '')}：`, response.config.data, response.data)
	}

	const code = response.data.code
	if (response.statusCode === 200 && (code === 401 || code === 40101)) {
		if (!isRefreshing) {
			isRefreshing = true

			if (code === 401) {
				uni.showModal({
					title: '平台安全提醒',
					content: '由于您长时间未登录平台，为保障账号安全，请您重新登录',
					confirmText: '重新登录',
					showCancel: false,
					success: () => {
						// 清空请求队列
						requests = []
						// 还原标记位
						isRefreshing = false

						useUserStore().logout()
						uni.navigateTo({ url: loginPage })

						return Promise.reject(response.data.msg || 'token已过期')
					}
				})
			} else if (code === 40101) {
				const tip = '您的账号已在其他设备登录，您被强制下线。如果这不是您的操作，请立即修改您的密码以确保账号安全'
				uni.showModal({
					title: '账号登录提示',
					content: tip,
					confirmText: '重新登录',
					success: (res) => {
						requests = []
						isRefreshing = false

						if (res.confirm) {
							useUserStore().logout()
							uni.navigateTo({ url: loginPage })
						}

						return Promise.reject(tip)
					}
				})
			}
		} else {
			// 同时并发出现的请求 新的token没回来之前 先用promise 存入等待队列中，等token刷新后直接执行
			return new Promise((resolve) => {
				requests.push(() => {
					resolve(service.request(response.config))
				})
			})
		}
	} else if (response.statusCode === 200) {
		if (code === 200) return response.data.data

		const msg = response.data.msg || '系统错误'
		uni.showToast({
			title: msg,
			icon: 'none'
		})
		return Promise.reject(msg)
	} else {
		const msg = response.data.msg || response.data.error || '系统错误'
		uni.showToast({
			title: msg,
			icon: 'none'
		})
		return Promise.reject(msg)
	}
}, (err : HttpError) => {
	// 对响应错误做点什么 （statusCode !== 200）
	console.error('----------响应错误----------', err)
	uni.showToast({
		title: err.errMsg || '响应错误',
		icon: 'none',
		duration: 3000
	})
	return Promise.reject(err)
})

const http = {
	get<T>(url : string, params ?: object, config ?: HttpRequestConfig) : Promise<T> {
		return service.get(url, { params, ...config })
	},

	post<T>(url : string, data ?: object, config ?: HttpRequestConfig) : Promise<T> {
		return service.post(url, data, config)
	},

	put<T>(url : string, data ?: object, config ?: HttpRequestConfig) : Promise<T> {
		return service.put(url, data, config)
	},

	delete<T>(url : string, data ?: object, config ?: HttpRequestConfig) : Promise<T> {
		return service.delete(url, data, config)
	}
}

export { http }