// 测试环境
let requestUrl = 'https://dev.xxx.com/stage-api' // 接口地址
let imgUrl = 'https://dev.xxx.com/ync-file/static-test/ydp/v1' // 图片存储域名

if (process.env.NODE_ENV === 'development') {
	// 开发环境
	let url = ''
	try { url = uni.getStorageSync('requestUrl') || '' } catch { url = '' }

	if (url) requestUrl = url

	console.log('当前环境地址----------', requestUrl)
} else {
	// 生产环境
	requestUrl = 'https://app.xxx.com/prod-api'
	imgUrl = 'https://app.xxx.com/ync-file/static/ydp/v1'
}

// 默认登录页路径
const loginPage = '/pages/login/smsLogin'

// h5接口代理的路径前缀
const apiPrefix = 'h5api'

// 主题色
const mainColor = '#FF6E26'

// 分享给朋友
const mpShareFriend = { title: 'uniapp - 分享给朋友', path: '/pages/index/index', imageUrl: `${imgUrl}/default-share.png` }

// 分享到朋友圈
const mpShareTimeline = { title: 'uniapp - 分享到朋友圈', query: '', imageUrl: `${imgUrl}/default-share.png` }

export {
	requestUrl,
	imgUrl,
	loginPage,
	apiPrefix,
	mainColor,
	mpShareFriend,
	mpShareTimeline
}