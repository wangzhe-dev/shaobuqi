<template>
	<view class="page">
		<!-- ─── Hero ─────────────────────────────────────────────── -->
		<view class="hero">
			<view class="deco-ring r1" />
			<view class="deco-ring r2" />
			<view class="hero-body">
				<view class="accent-line" />
				<text class="hero-title">烧不起</text>
				<text class="hero-sub">{{ isRegister ? '注册账号，开始使用' : '登录后可发布 · 收藏 · 反馈 Skill' }}</text>
			</view>
		</view>

		<!-- ─── Form sheet ─────────────────────────────────────────── -->
		<view class="sheet">
			<view v-if="wxLoading" class="wx-loading">
				<text class="wx-loading-t">微信授权中...</text>
			</view>

			<template v-else>
				<!-- Tabs -->
				<view class="tab-bar">
					<view class="tab-item" :class="{ active: !isRegister }" @tap="isRegister = false">
						<text class="tab-t">登录</text>
						<view class="tab-line" />
					</view>
					<view class="tab-item" :class="{ active: isRegister }" @tap="isRegister = true">
						<text class="tab-t">注册</text>
						<view class="tab-line" />
					</view>
				</view>

				<!-- Login form -->
				<template v-if="!isRegister">
					<!-- #ifdef H5 -->
					<view v-if="inWechat" class="btn on wx-btn" @tap="doWxLogin">
						<text class="btn-t">微信一键登录</text>
					</view>
					<view v-if="inWechat" class="divider">
						<view class="divider-line" />
						<text class="divider-t">或者</text>
						<view class="divider-line" />
					</view>
					<!-- #endif -->

					<view class="inp-wrap" :class="{ focused: focusedField === 'identifier' }">
						<input
							v-model="loginForm.identifier"
							class="inp"
							placeholder="手机号或邮箱"
							placeholder-class="inp-ph"
							@focus="focusedField = 'identifier'"
							@blur="focusedField = ''"
						/>
					</view>
					<view class="inp-wrap" :class="{ focused: focusedField === 'password' }">
						<input
							v-model="loginForm.password"
							class="inp"
							type="password"
							password
							placeholder="密码（6位以上）"
							placeholder-class="inp-ph"
							@focus="focusedField = 'password'"
							@blur="focusedField = ''"
						/>
					</view>

					<view class="dev-hint">
						<text class="dev-hint-tag">DEV</text>
						<text class="dev-hint-val">13800000000 · 12345678</text>
					</view>

					<view class="btn" :class="{ on: canLogin && !loading }" @tap="doLogin">
						<text class="btn-t">{{ loading ? '登录中...' : '登录' }}</text>
					</view>
				</template>

				<!-- Register form -->
				<template v-else>
					<view class="inp-wrap" :class="{ focused: focusedField === 'email' }">
						<input
							v-model="regForm.email"
							class="inp"
							placeholder="邮箱地址"
							placeholder-class="inp-ph"
							@focus="focusedField = 'email'"
							@blur="focusedField = ''"
						/>
					</view>
					<view class="code-row">
						<view class="inp-wrap" :class="{ focused: focusedField === 'code' }">
							<input
								v-model="regForm.code"
								class="inp"
								placeholder="验证码"
								placeholder-class="inp-ph"
								maxlength="6"
								@focus="focusedField = 'code'"
								@blur="focusedField = ''"
							/>
						</view>
						<view class="send-btn" :class="{ disabled: countdown > 0 }" @tap="doSendCode">
							<text class="send-btn-t">{{ countdown > 0 ? `${countdown}s` : '发送' }}</text>
						</view>
					</view>
					<view class="inp-wrap" :class="{ focused: focusedField === 'nickname' }">
						<input
							v-model="regForm.nickname"
							class="inp"
							placeholder="昵称（可选）"
							placeholder-class="inp-ph"
							@focus="focusedField = 'nickname'"
							@blur="focusedField = ''"
						/>
					</view>
					<view class="inp-wrap" :class="{ focused: focusedField === 'regpwd' }">
						<input
							v-model="regForm.password"
							class="inp"
							type="password"
							password
							placeholder="设置密码（6位以上）"
							placeholder-class="inp-ph"
							@focus="focusedField = 'regpwd'"
							@blur="focusedField = ''"
						/>
					</view>
					<view class="inp-wrap" :class="{ focused: focusedField === 'confirm' }">
						<input
							v-model="regForm.confirmPassword"
							class="inp"
							type="password"
							password
							placeholder="再次确认密码"
							placeholder-class="inp-ph"
							@focus="focusedField = 'confirm'"
							@blur="focusedField = ''"
						/>
					</view>

					<view class="btn" :class="{ on: canRegister && !loading }" @tap="doRegister">
						<text class="btn-t">{{ loading ? '注册中...' : '注册并登录' }}</text>
					</view>
				</template>
			</template>
		</view>

		<view class="page-footer">
			<text class="page-footer-t">登录即代表同意《用户协议》与《隐私政策》</text>
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
const focusedField = ref('')

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
// ─── Page ────────────────────────────────────────────────────────────────────
.page {
	min-height: 100vh;
	background: #1A1A2E;
	display: flex;
	flex-direction: column;
}

// ─── Hero ────────────────────────────────────────────────────────────────────
.hero {
	padding: 72rpx 48rpx 88rpx;
	position: relative;
	overflow: hidden;

	.deco-ring {
		position: absolute;
		border-radius: 50%;
	}

	.r1 {
		width: 440rpx;
		height: 440rpx;
		top: -160rpx;
		right: -100rpx;
		border: 1rpx solid rgba(91, 91, 214, 0.18);
	}

	.r2 {
		width: 220rpx;
		height: 220rpx;
		top: 20rpx;
		right: 50rpx;
		border: 1rpx solid rgba(91, 91, 214, 0.1);
		background: rgba(91, 91, 214, 0.04);
	}

	.hero-body {
		position: relative;
		z-index: 1;
	}

	.accent-line {
		width: 48rpx;
		height: 6rpx;
		background: #5B5BD6;
		border-radius: 4rpx;
		margin-bottom: 26rpx;
	}

	.hero-title {
		display: block;
		font-size: 84rpx;
		font-weight: 900;
		color: #FFFFFF;
		letter-spacing: 4rpx;
		line-height: 1;
		margin-bottom: 20rpx;
	}

	.hero-sub {
		display: block;
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.38);
		letter-spacing: 0.5rpx;
	}
}

// ─── Sheet ───────────────────────────────────────────────────────────────────
.sheet {
	flex: 1;
	background: #FFFFFF;
	border-radius: 36rpx 36rpx 0 0;
	margin-top: -36rpx;
	padding: 48rpx 40rpx 60rpx;
	box-shadow: 0 -8rpx 32rpx rgba(0, 0, 0, 0.12);
}

// ─── Tab bar ─────────────────────────────────────────────────────────────────
.tab-bar {
	display: flex;
	gap: 40rpx;
	margin-bottom: 40rpx;

	.tab-item {
		padding-bottom: 18rpx;
		position: relative;

		.tab-t {
			font-size: 30rpx;
			font-weight: 600;
			color: #C8CDD8;
		}

		.tab-line {
			position: absolute;
			bottom: 0;
			left: 0;
			width: 100%;
			height: 3rpx;
			border-radius: 2rpx;
			background: transparent;
		}

		&.active {
			.tab-t {
				color: #1A1A2E;
			}

			.tab-line {
				background: #5B5BD6;
			}
		}
	}
}

// ─── Inputs ──────────────────────────────────────────────────────────────────
.inp-wrap {
	height: 96rpx;
	border-radius: 14rpx;
	border: 1.5rpx solid #EAECF0;
	background: #F8F9FB;
	margin-bottom: 16rpx;
	padding: 0 22rpx;
	display: flex;
	align-items: center;
	box-sizing: border-box;

	&.focused {
		border-color: #5B5BD6;
		background: #FFFFFF;
	}
}

.inp {
	flex: 1;
	height: 100%;
	font-size: 28rpx;
	color: #1A1A2E;
	background: transparent;
}

.inp-ph {
	color: #BEC3CC;
	font-size: 28rpx;
}

// ─── Code row ────────────────────────────────────────────────────────────────
.code-row {
	display: flex;
	gap: 12rpx;
	margin-bottom: 16rpx;

	.inp-wrap {
		flex: 1;
		margin-bottom: 0;
	}
}

.send-btn {
	flex-shrink: 0;
	height: 96rpx;
	padding: 0 28rpx;
	border-radius: 14rpx;
	background: #5B5BD6;
	display: flex;
	align-items: center;
	justify-content: center;

	.send-btn-t {
		font-size: 24rpx;
		font-weight: 700;
		color: #FFFFFF;
		white-space: nowrap;
	}

	&.disabled {
		background: #EAECF0;

		.send-btn-t {
			color: #BEC3CC;
		}
	}
}

// ─── Dev hint ────────────────────────────────────────────────────────────────
.dev-hint {
	display: flex;
	align-items: center;
	gap: 14rpx;
	padding: 16rpx 18rpx;
	border-radius: 10rpx;
	background: rgba(91, 91, 214, 0.06);
	margin: 4rpx 0 24rpx;

	.dev-hint-tag {
		font-size: 18rpx;
		font-weight: 700;
		color: #5B5BD6;
		background: rgba(91, 91, 214, 0.14);
		padding: 4rpx 12rpx;
		border-radius: 6rpx;
		letter-spacing: 2rpx;
	}

	.dev-hint-val {
		font-size: 22rpx;
		color: #6B7280;
	}
}

// ─── Button ──────────────────────────────────────────────────────────────────
.btn {
	height: 96rpx;
	border-radius: 14rpx;
	background: #EAECF0;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 8rpx;

	.btn-t {
		font-size: 30rpx;
		font-weight: 700;
		color: #BEC3CC;
	}

	&.on {
		background: #5B5BD6;

		.btn-t {
			color: #FFFFFF;
		}
	}

	&.wx-btn {
		background: #07C160;

		.btn-t {
			color: #FFFFFF;
		}
	}
}

// ─── Divider ─────────────────────────────────────────────────────────────────
.divider {
	display: flex;
	align-items: center;
	gap: 20rpx;
	margin: 16rpx 0 24rpx;

	.divider-line {
		flex: 1;
		height: 1rpx;
		background: #EAECF0;
	}

	.divider-t {
		font-size: 22rpx;
		color: #C8CDD8;
	}
}

// ─── WX Loading ──────────────────────────────────────────────────────────────
.wx-loading {
	height: 160rpx;
	display: flex;
	align-items: center;
	justify-content: center;

	.wx-loading-t {
		font-size: 28rpx;
		color: #9CA3AF;
	}
}

// ─── Footer ──────────────────────────────────────────────────────────────────
.page-footer {
	background: #FFFFFF;
	padding: 0 40rpx 60rpx;
	text-align: center;

	.page-footer-t {
		font-size: 20rpx;
		color: #C8CDD8;
	}
}
</style>
