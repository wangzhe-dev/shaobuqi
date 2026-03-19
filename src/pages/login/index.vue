<template>
	<view class="page">
		<view class="hero">
			<text class="hero-title">烧不起</text>
			<text class="hero-sub">{{ isRegister ? '注册账号，开始使用' : '登录后可发布 / 收藏 / 反馈 Skill' }}</text>
		</view>

		<view class="card">
			<!-- 微信授权回调时显示 loading -->
			<view v-if="wxLoading" class="wx-loading">
				<text class="wx-loading-t">微信授权中...</text>
			</view>

			<template v-else>
				<!-- Tab 切换 -->
				<view class="tab-bar">
					<view class="tab-item" :class="{ active: !isRegister }" @tap="isRegister = false">
						<text class="tab-t">登录</text>
					</view>
					<view class="tab-item" :class="{ active: isRegister }" @tap="isRegister = true">
						<text class="tab-t">注册</text>
					</view>
				</view>

				<!-- 登录表单 -->
				<template v-if="!isRegister">
					<!-- #ifdef H5 -->
					<view v-if="inWechat" class="btn on wx-btn" @tap="doWxLogin">
						<text class="btn-t">微信一键登录</text>
					</view>
					<view v-if="inWechat" class="divider">
						<view class="divider-line" />
						<text class="divider-t">或</text>
						<view class="divider-line" />
					</view>
					<!-- #endif -->

					<input
						v-model="loginForm.identifier"
						class="inp"
						placeholder="手机号或邮箱"
						placeholder-class="inp-ph"
					/>
					<input
						v-model="loginForm.password"
						class="inp"
						type="password"
						password
						placeholder="密码（6位以上）"
						placeholder-class="inp-ph"
					/>

					<view class="tips">开发账号：13800000000 / 12345678</view>

					<view class="btn" :class="{ on: canLogin && !loading }" @tap="doLogin">
						<text class="btn-t">{{ loading ? '登录中...' : '登录' }}</text>
					</view>
				</template>

				<!-- 注册表单 -->
				<template v-else>
					<input
						v-model="regForm.email"
						class="inp"
						placeholder="邮箱地址"
						placeholder-class="inp-ph"
					/>
					<view class="code-row">
						<input
							v-model="regForm.code"
							class="inp code-inp"
							placeholder="验证码"
							placeholder-class="inp-ph"
							maxlength="6"
						/>
						<view class="send-btn" :class="{ disabled: countdown > 0 }" @tap="doSendCode">
							<text class="send-btn-t">{{ countdown > 0 ? `${countdown}s` : '发送验证码' }}</text>
						</view>
					</view>
					<input
						v-model="regForm.nickname"
						class="inp"
						placeholder="昵称（可选，默认用邮箱前缀）"
						placeholder-class="inp-ph"
					/>
					<input
						v-model="regForm.password"
						class="inp"
						type="password"
						password
						placeholder="设置密码（6位以上）"
						placeholder-class="inp-ph"
					/>
					<input
						v-model="regForm.confirmPassword"
						class="inp"
						type="password"
						password
						placeholder="再次输入密码"
						placeholder-class="inp-ph"
					/>

					<view class="btn" :class="{ on: canRegister && !loading }" @tap="doRegister">
						<text class="btn-t">{{ loading ? '注册中...' : '注册并登录' }}</text>
					</view>
				</template>
			</template>
		</view>
	</view>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { passwordLogin, wechatH5Login, emailRegister, sendEmailCode } from '@/api/auth'
import { useUserStore } from '@/stores'

const userStore = useUserStore()
const loading = ref(false)
const wxLoading = ref(false)
const isRegister = ref(false)

// #ifdef H5
import { isWechat } from '@/utils/h5'
const inWechat = ref(false)
// #endif

const loginForm = reactive({ identifier: '', password: '' })
const regForm = reactive({ email: '', code: '', nickname: '', password: '', confirmPassword: '' })
const countdown = ref(0)
let countdownTimer: ReturnType<typeof setInterval> | null = null

const canLogin = computed(() => !!loginForm.identifier.trim() && loginForm.password.length >= 6)
const canRegister = computed(() => {
	const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regForm.email.trim())
	return emailOk && regForm.code.length === 6 && regForm.password.length >= 6 && regForm.password === regForm.confirmPassword
})

const startCountdown = () => {
	countdown.value = 60
	countdownTimer = setInterval(() => {
		countdown.value--
		if (countdown.value <= 0 && countdownTimer) {
			clearInterval(countdownTimer)
			countdownTimer = null
		}
	}, 1000)
}

const doSendCode = async () => {
	const email = regForm.email.trim()
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		uni.showToast({ title: '请输入正确的邮箱', icon: 'none' })
		return
	}
	if (countdown.value > 0) return
	try {
		await sendEmailCode(email)
		uni.showToast({ title: '验证码已发送', icon: 'success' })
		startCountdown()
	} catch {
		// 已由请求拦截器处理提示
	}
}

onUnmounted(() => {
	if (countdownTimer) clearInterval(countdownTimer)
})

const afterLoginSuccess = () => {
	uni.showToast({ title: '登录成功', icon: 'success' })
	setTimeout(() => {
		const pages = getCurrentPages()
		if (pages.length > 1) uni.navigateBack()
		else uni.switchTab({ url: '/pages/my/my' })
	}, 500)
}

const doLogin = async () => {
	if (!canLogin.value || loading.value) return
	loading.value = true
	try {
		const data = await passwordLogin({
			identifier: loginForm.identifier.trim(),
			password: loginForm.password
		})
		userStore.setToken(data?.token || '')
		userStore.setUserInfo(data?.user || null)
		afterLoginSuccess()
	} catch {
		// 已由请求拦截器处理提示
	} finally {
		loading.value = false
	}
}

const doRegister = async () => {
	if (!canRegister.value || loading.value) return
	if (regForm.password !== regForm.confirmPassword) {
		uni.showToast({ title: '两次密码不一致', icon: 'none' })
		return
	}
	loading.value = true
	try {
		const payload: { email: string; code: string; password: string; nickname?: string } = {
			email: regForm.email.trim(),
			code: regForm.code.trim(),
			password: regForm.password
		}
		if (regForm.nickname.trim()) payload.nickname = regForm.nickname.trim()
		const data = await emailRegister(payload)
		userStore.setToken(data?.token || '')
		userStore.setUserInfo(data?.user || null)
		afterLoginSuccess()
	} catch {
		// 已由请求拦截器处理提示
	} finally {
		loading.value = false
	}
}

// #ifdef H5
const doWxLogin = () => {
	const appId = import.meta.env.VITE_WX_APPID as string
	if (!appId || appId.startsWith('wx你的')) {
		uni.showToast({ title: '请先配置公众号 AppID', icon: 'none' })
		return
	}
	const redirectUri = encodeURIComponent(window.location.origin + window.location.pathname + '#/pages/login/index')
	const url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_base&state=wechat_login#wechat_redirect`
	window.location.href = url
}

const checkWxCallback = async () => {
	const params = new URLSearchParams(window.location.search)
	const code = params.get('code')
	const state = params.get('state')
	if (!code || state !== 'wechat_login') return

	const cleanUrl = window.location.origin + window.location.pathname + window.location.hash.split('?')[0]
	window.history.replaceState({}, '', cleanUrl)

	wxLoading.value = true
	try {
		const data = await wechatH5Login(code)
		userStore.setToken(data?.token || '')
		userStore.setUserInfo(data?.user || null)
		afterLoginSuccess()
	} catch {
		// 已由请求拦截器处理提示
	} finally {
		wxLoading.value = false
	}
}

onMounted(() => {
	inWechat.value = isWechat()
	checkWxCallback()
})
// #endif
</script>

<style lang="scss" scoped>
.page {
	min-height: 100vh;
	padding: 56rpx 36rpx;
	box-sizing: border-box;
	background: linear-gradient(160deg, #FFF8F3 0%, #F6F8FF 50%, #F9FAFB 100%);
}

.hero {
	margin: 40rpx 0 28rpx;
	.hero-title {
		display: block;
		font-size: 64rpx;
		font-weight: 900;
		color: #1F2937;
		letter-spacing: 2rpx;
	}
	.hero-sub {
		display: block;
		margin-top: 10rpx;
		font-size: 24rpx;
		color: #6B7280;
	}
}

.card {
	background: rgba(255, 255, 255, 0.88);
	backdrop-filter: blur(8rpx);
	border-radius: 26rpx;
	padding: 28rpx;
	box-shadow: 0 18rpx 40rpx rgba(0, 0, 0, 0.06);
}

.tab-bar {
	display: flex;
	margin-bottom: 28rpx;
	border-radius: 14rpx;
	background: #F3F4F6;
	padding: 6rpx;
	gap: 6rpx;

	.tab-item {
		flex: 1;
		height: 64rpx;
		border-radius: 10rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		.tab-t {
			font-size: 28rpx;
			font-weight: 600;
			color: #9CA3AF;
		}

		&.active {
			background: #fff;
			box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);

			.tab-t {
				color: #5B5BD6;
			}
		}
	}
}

.inp {
	height: 88rpx;
	border-radius: 14rpx;
	border: 1rpx solid rgba(0, 0, 0, 0.09);
	padding: 0 20rpx;
	font-size: 28rpx;
	background: #fff;
	margin-bottom: 16rpx;
	box-sizing: border-box;
}

.inp-ph {
	color: #9CA3AF;
}

.tips {
	font-size: 22rpx;
	color: #6B7280;
	background: rgba(91, 91, 214, 0.08);
	border-radius: 10rpx;
	padding: 14rpx;
	margin: 8rpx 0 22rpx;
}

.btn {
	height: 88rpx;
	border-radius: 16rpx;
	background: rgba(91, 91, 214, 0.35);
	display: flex;
	align-items: center;
	justify-content: center;

	.btn-t {
		font-size: 30rpx;
		font-weight: 800;
		color: rgba(255, 255, 255, 0.9);
	}

	&.on {
		background: #5B5BD6;
	}
}

.code-row {
	display: flex;
	gap: 12rpx;
	margin-bottom: 16rpx;

	.code-inp {
		flex: 1;
		margin-bottom: 0;
	}

	.send-btn {
		flex-shrink: 0;
		height: 88rpx;
		padding: 0 20rpx;
		border-radius: 14rpx;
		background: #5B5BD6;
		display: flex;
		align-items: center;
		justify-content: center;

		.send-btn-t {
			font-size: 24rpx;
			font-weight: 600;
			color: #fff;
			white-space: nowrap;
		}

		&.disabled {
			background: #C4C4E8;
		}
	}
}

.wx-btn {
	background: #07C160;
	margin-bottom: 0;
}

.divider {
	display: flex;
	align-items: center;
	gap: 16rpx;
	margin: 24rpx 0;

	.divider-line {
		flex: 1;
		height: 1rpx;
		background: rgba(0, 0, 0, 0.08);
	}

	.divider-t {
		font-size: 22rpx;
		color: #9CA3AF;
	}
}

.wx-loading {
	height: 120rpx;
	display: flex;
	align-items: center;
	justify-content: center;

	.wx-loading-t {
		font-size: 28rpx;
		color: #6B7280;
	}
}
</style>
