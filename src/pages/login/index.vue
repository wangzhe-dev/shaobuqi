<template>
	<view class="auth-page">
		<view class="liquid-bg">
			<view class="liquid-vignette" />
			<view class="liquid-ring-outer">
			<view class="liquid-ring" :style="{ '--quantity': String(liquidCards.length) }">
				<view
					v-for="(item, index) in liquidCards"
					:key="item.label"
					class="liquid-card"
					:style="{ '--index': String(index), '--color-card': item.color }"
				>
					<view class="liquid-fill" />
					<view class="liquid-body">
						<view class="liquid-icon-wrap">
							<text class="liquid-icon">{{ item.icon }}</text>
						</view>
						<text class="liquid-label">{{ item.label }}</text>
					</view>
				</view>
			</view>
			</view>
		</view>

		<view class="auth-wrap">
			<view class="auth-card">
				<text class="card-title">{{ isRegister ? '创建你的账号' : '欢迎回来' }}</text>
				<!-- <text class="card-subtitle">让灵感与效率在同一块液态画布上流动</text> -->

				<view class="segment">
					<view class="segment-indicator" :style="{ transform: `translateX(${isRegister ? '100%' : '0'})` }" />
					<view class="segment-item" :class="{ active: !isRegister }" @tap="switchMode(false)">
						<text class="segment-text">登录</text>
					</view>
					<view class="segment-item" :class="{ active: isRegister }" @tap="switchMode(true)">
						<text class="segment-text">注册</text>
					</view>
				</view>

				<view class="field">
					<text class="field-label">邮箱</text>
					<view
						class="field-input"
						:class="{
							focused: focusedField === activeEmailField,
							invalid: activeEmailValue.trim() && !activeEmailValid
						}"
					>
						<uni-icons type="qq" size="18" color="#B8C8EB" />
						<input
							v-model="activeEmailModel"
							class="inp"
							placeholder="请输入邮箱地址"
							placeholder-class="inp-placeholder"
							maxlength="60"
							@focus="focusedField = activeEmailField"
							@blur="focusedField = ''"
						/>
						<uni-icons
							v-if="activeEmailValue"
							type="clear"
							size="16"
							color="#B8C8EB"
							@tap.stop="clearEmail"
						/>
					</view>
					<text v-if="activeEmailTip" class="field-tip error">{{ activeEmailTip }}</text>
				</view>

				<template v-if="isRegister">
					<view class="field">
						<text class="field-label">验证码</text>
						<view class="code-row">
							<view class="field-input code-input" :class="{ focused: focusedField === 'code' }">
								<uni-icons type="paperplane-filled" size="16" color="#B8C8EB" />
								<input
									v-model="regForm.code"
									class="inp"
									placeholder="6 位验证码"
									placeholder-class="inp-placeholder"
									maxlength="6"
									@focus="focusedField = 'code'"
									@blur="focusedField = ''"
								/>
							</view>
							<view class="send-btn" :class="{ disabled: !canSendCode }" @tap="doSendCode">
								<text class="send-btn-text">{{ sendCodeText }}</text>
							</view>
						</view>
					</view>

					<view class="field">
						<text class="field-label">昵称（可选）</text>
						<view class="field-input" :class="{ focused: focusedField === 'nickname' }">
							<uni-icons type="person-filled" size="16" color="#B8C8EB" />
							<input
								v-model="regForm.nickname"
								class="inp"
								placeholder="最多 20 个字符"
								placeholder-class="inp-placeholder"
								maxlength="20"
								@focus="focusedField = 'nickname'"
								@blur="focusedField = ''"
							/>
						</view>
					</view>
				</template>

				<view class="field">
					<text class="field-label">{{ isRegister ? '设置密码' : '登录密码' }}</text>
					<view
						class="field-input"
						:class="{
							focused: focusedField === activePasswordField,
							invalid: (activePasswordValue && !!activePasswordTip) || (!isRegister && !!loginServerTip)
						}"
					>
						<uni-icons type="locked-filled" size="16" color="#B8C8EB" />
						<input
							v-model="activePasswordModel"
							class="inp"
							:password="!activePasswordVisible"
							type="text"
							placeholder="请输入至少 6 位密码"
							placeholder-class="inp-placeholder"
							maxlength="32"
							@focus="focusedField = activePasswordField"
							@blur="focusedField = ''"
						/>
						<view class="icon-action" @tap="toggleActivePassword">
							<uni-icons :type="activePasswordVisible ? 'eye-slash-filled' : 'eye-filled'" size="18" color="#C4D0EA" />
						</view>
					</view>
					<text v-if="activePasswordTip || (!isRegister && loginServerTip)" class="field-tip error">
						{{ !isRegister && loginServerTip ? loginServerTip : activePasswordTip }}
					</text>
				</view>

				<template v-if="isRegister">
					<view class="field">
						<text class="field-label">确认密码</text>
						<view
							class="field-input"
							:class="{ focused: focusedField === 'confirm', invalid: regForm.confirmPassword && !registerPasswordMatched }"
						>
							<uni-icons type="locked-filled" size="16" color="#B8C8EB" />
							<input
								v-model="regForm.confirmPassword"
								class="inp"
								:password="!showConfirmPassword"
								type="text"
								placeholder="再次输入密码"
								placeholder-class="inp-placeholder"
								maxlength="32"
								@focus="focusedField = 'confirm'"
								@blur="focusedField = ''"
							/>
							<view class="icon-action" @tap="showConfirmPassword = !showConfirmPassword">
								<uni-icons :type="showConfirmPassword ? 'eye-slash-filled' : 'eye-filled'" size="18" color="#C4D0EA" />
							</view>
						</view>
						<text v-if="registerConfirmTip" class="field-tip error">{{ registerConfirmTip }}</text>
					</view>
				</template>

				<view class="agreement" @tap="agreed = !agreed">
					<uni-icons :type="agreed ? 'checkbox-filled' : 'circle'" size="18" :color="agreed ? '#67D9FF' : '#9FB1D6'" />
					<text class="agreement-text">同意</text>
					<text class="agreement-link" @tap.stop="openAgreement">《用户协议》</text>
					<text class="agreement-text">和</text>
					<text class="agreement-link" @tap.stop="openPrivacy">《隐私政策》</text>
				</view>

				<view class="submit-btn" :class="{ active: canSubmit, loading }" @tap="submit">
					<uni-icons v-if="loading" type="loop" size="18" color="#f4f8ff" class="loading-icon" />
					<text class="submit-text">{{ submitText }}</text>
				</view>

				<view class="helper-row">
					<text class="helper-text">{{ isRegister ? '已有账号？' : '没有账号？' }}</text>
					<text class="helper-link" @tap="switchMode(!isRegister)">{{ isRegister ? '去登录' : '去注册' }}</text>
					<text v-if="!isRegister" class="helper-link" @tap="forgotPassword">忘记密码</text>
				</view>
			</view>
		</view>

		<view class="icp-row" @tap="openIcp">
			<text class="icp-text">{{ ICP_RECORD }}</text>
		</view>
	</view>
</template>

<script setup lang="ts">
import { emailRegister, passwordLogin, sendEmailCode } from '@/api/auth'
import { useUserStore } from '@/stores'
import { computed, onUnmounted, reactive, ref } from 'vue'

const userStore = useUserStore()
const QQ_EMAIL_REG = /^[A-Za-z0-9._%+-]+@qq\.com$/i
const CODE_REG = /^\d{6}$/
const ICP_RECORD = '京ICP备2025111493号-2'
const liquidCards = [
	{ label: '写作', icon: '✍️', color: '99, 215, 255' },
	{ label: '编程', icon: '💻', color: '129, 167, 255' },
	{ label: '自媒体', icon: '📱', color: '191, 146, 255' },
	{ label: '办公', icon: '📊', color: '116, 237, 214' },
	{ label: '运营', icon: '📈', color: '146, 236, 145' },
	{ label: '学习', icon: '📚', color: '255, 224, 130' },
	{ label: '设计', icon: '🎨', color: '255, 160, 201' },
	{ label: '电商', icon: '🛒', color: '136, 200, 255' }
]

const isRegister = ref(false)
const focusedField = ref('')
const loading = ref(false)
const sendingCode = ref(false)
const countdown = ref(0)
const agreed = ref(true)
const loginServerTip = ref('')

const showLoginPassword = ref(false)
const showRegisterPassword = ref(false)
const showConfirmPassword = ref(false)

const loginForm = reactive({ email: '', password: '' })
const regForm = reactive({ email: '', code: '', nickname: '', password: '', confirmPassword: '' })

let countdownTimer: ReturnType<typeof setInterval> | null = null

const normalizeEmail = (value: string) => value.trim().toLowerCase()
const isQqEmail = (value: string) => QQ_EMAIL_REG.test(normalizeEmail(value))

const loginEmailValid = computed(() => isQqEmail(loginForm.email))
const registerEmailValid = computed(() => isQqEmail(regForm.email))
const registerCodeValid = computed(() => CODE_REG.test(regForm.code.trim()))
const registerPasswordMatched = computed(() => regForm.password === regForm.confirmPassword)
const loginPasswordValid = computed(() => loginForm.password.length >= 6 && !/\s/.test(loginForm.password))
const registerPasswordValid = computed(() => regForm.password.length >= 6 && !/\s/.test(regForm.password))

const canLogin = computed(() => loginEmailValid.value && loginPasswordValid.value && agreed.value && !loading.value)
const canRegister = computed(() => {
	return registerEmailValid.value && registerCodeValid.value && registerPasswordValid.value && registerPasswordMatched.value && agreed.value && !loading.value
})
const canSubmit = computed(() => isRegister.value ? canRegister.value : canLogin.value)

const sendCodeText = computed(() => {
	if (sendingCode.value) return '发送中...'
	if (countdown.value > 0) return `${countdown.value}s`
	return '发送验证码'
})

const activeEmailField = computed(() => (isRegister.value ? 'reg-email' : 'login-email'))
const activeEmailModel = computed({
	get: () => (isRegister.value ? regForm.email : loginForm.email),
	set: (value: string) => {
		if (isRegister.value) regForm.email = value
		else {
			loginForm.email = value
			loginServerTip.value = ''
		}
	}
})
const activeEmailValue = computed(() => (isRegister.value ? regForm.email : loginForm.email))
const activeEmailValid = computed(() => (isRegister.value ? registerEmailValid.value : loginEmailValid.value))

const activePasswordField = computed(() => (isRegister.value ? 'reg-password' : 'login-password'))
const activePasswordModel = computed({
	get: () => (isRegister.value ? regForm.password : loginForm.password),
	set: (value: string) => {
		if (isRegister.value) regForm.password = value
		else {
			loginForm.password = value
			loginServerTip.value = ''
		}
	}
})
const activePasswordVisible = computed(() => (isRegister.value ? showRegisterPassword.value : showLoginPassword.value))
const activePasswordValue = computed(() => (isRegister.value ? regForm.password : loginForm.password))

const activeEmailTip = computed(() => {
	if (!activeEmailValue.value.trim() || activeEmailValid.value) return ''
	return '邮箱格式不正确'
})

const activePasswordTip = computed(() => {
	if (!activePasswordValue.value) return ''
	if (/\s/.test(activePasswordValue.value)) return '密码不能包含空格'
	if (activePasswordValue.value.length < 6) return '密码至少 6 位'
	return ''
})

const registerConfirmTip = computed(() => {
	if (!regForm.confirmPassword || registerPasswordMatched.value) return ''
	return '两次密码不一致'
})

const submitText = computed(() => {
	if (loading.value) return isRegister.value ? '注册中...' : '登录中...'
	return isRegister.value ? '注册并登录' : '立即登录'
})

const canSendCode = computed(() => registerEmailValid.value && countdown.value === 0 && !sendingCode.value)

const clearTimer = () => {
	if (!countdownTimer) return
	clearInterval(countdownTimer)
	countdownTimer = null
}

const startCountdown = () => {
	clearTimer()
	countdown.value = 60
	countdownTimer = setInterval(() => {
		countdown.value -= 1
		if (countdown.value <= 0) {
			countdown.value = 0
			clearTimer()
		}
	}, 1000)
}

const clearEmail = () => {
	if (isRegister.value) regForm.email = ''
	else {
		loginForm.email = ''
		loginServerTip.value = ''
	}
}

const switchMode = (registerMode: boolean) => {
	if (loading.value) return
	isRegister.value = registerMode
	focusedField.value = ''
	loginServerTip.value = ''
}

const toggleActivePassword = () => {
	if (isRegister.value) showRegisterPassword.value = !showRegisterPassword.value
	else showLoginPassword.value = !showLoginPassword.value
}

const requireAgreement = () => {
	if (agreed.value) return true
	uni.showToast({ title: '请先阅读并同意协议', icon: 'none' })
	return false
}

const afterLoginSuccess = () => {
	uni.showToast({ title: '登录成功', icon: 'success' })
	setTimeout(() => {
		const pages = getCurrentPages()
		if (pages.length > 1) uni.navigateBack()
		else uni.switchTab({ url: '/pages/my/my' })
	}, 500)
}

const doSendCode = async () => {
	if (!registerEmailValid.value) {
		uni.showToast({ title: '邮箱格式不正确', icon: 'none' })
		return
	}
	if (!canSendCode.value) return

	sendingCode.value = true
	try {
		await sendEmailCode(normalizeEmail(regForm.email))
		uni.showToast({ title: '验证码已发送', icon: 'success' })
		startCountdown()
	} catch {
		// 已由请求拦截器统一提示
	} finally {
		sendingCode.value = false
	}
}

const doLogin = async () => {
	if (loading.value) return
	if (!normalizeEmail(loginForm.email)) {
		uni.showToast({ title: '请输入邮箱地址', icon: 'none' })
		return
	}
	if (!loginEmailValid.value) {
		uni.showToast({ title: '邮箱格式不正确', icon: 'none' })
		return
	}
	if (!loginForm.password) {
		uni.showToast({ title: '请输入密码', icon: 'none' })
		return
	}
	if (/\s/.test(loginForm.password)) {
		uni.showToast({ title: '密码不能包含空格', icon: 'none' })
		return
	}
	if (loginForm.password.length < 6) {
		uni.showToast({ title: '密码至少 6 位', icon: 'none' })
		return
	}
	if (!requireAgreement()) return

	loginServerTip.value = ''
	loading.value = true
	try {
		const data = await passwordLogin({
			identifier: normalizeEmail(loginForm.email),
			password: loginForm.password
		})
		const token = `${data?.token || ''}`.trim()
		if (!token || !data?.user) {
			throw new Error('登录失败，请检查账号和密码')
		}
		userStore.setToken(token)
		userStore.setUserInfo(data.user)
		afterLoginSuccess()
	} catch (err: any) {
		const msg = typeof err === 'string' ? err : (err?.message || '')
		if (/账号不存在|已禁用/i.test(msg)) loginServerTip.value = '账号不存在或已禁用，请检查后重试'
		else if (/密码/i.test(msg)) loginServerTip.value = '密码错误，请重新输入'
	} finally {
		loading.value = false
	}
}

const doRegister = async () => {
	if (loading.value) return
	if (!normalizeEmail(regForm.email)) {
		uni.showToast({ title: '请输入邮箱地址', icon: 'none' })
		return
	}
	if (!registerEmailValid.value) {
		uni.showToast({ title: '邮箱格式不正确', icon: 'none' })
		return
	}
	if (!registerCodeValid.value) {
		uni.showToast({ title: '请输入 6 位数字验证码', icon: 'none' })
		return
	}
	if (!regForm.password) {
		uni.showToast({ title: '请输入密码', icon: 'none' })
		return
	}
	if (/\s/.test(regForm.password)) {
		uni.showToast({ title: '密码不能包含空格', icon: 'none' })
		return
	}
	if (regForm.password.length < 6) {
		uni.showToast({ title: '密码至少 6 位', icon: 'none' })
		return
	}
	if (!registerPasswordMatched.value) {
		uni.showToast({ title: '两次密码不一致', icon: 'none' })
		return
	}
	if (!requireAgreement()) return

	loading.value = true
	try {
		const payload: { email: string; code: string; password: string; nickname?: string } = {
			email: normalizeEmail(regForm.email),
			code: regForm.code.trim(),
			password: regForm.password
		}
		const nickname = regForm.nickname.trim()
		if (nickname) payload.nickname = nickname

		const data = await emailRegister(payload)
		const token = `${data?.token || ''}`.trim()
		if (!token || !data?.user) {
			throw new Error('注册成功状态异常，请重新登录')
		}
		userStore.setToken(token)
		userStore.setUserInfo(data.user)
		afterLoginSuccess()
	} catch {
		// 已由请求拦截器统一提示
	} finally {
		loading.value = false
	}
}

const submit = () => {
	if (isRegister.value) {
		doRegister()
		return
	}
	doLogin()
}

const forgotPassword = () => {
	uni.showToast({ title: '请联系管理员协助重置密码', icon: 'none' })
}

const openAgreement = () => {
	uni.showToast({ title: '用户协议页待接入', icon: 'none' })
}

const openPrivacy = () => {
	uni.showToast({ title: '隐私政策页待接入', icon: 'none' })
}

const openIcp = () => {
	// #ifdef H5
	window.open('https://beian.miit.gov.cn/', '_blank')
	// #endif
	// #ifndef H5
	uni.showToast({ title: ICP_RECORD, icon: 'none' })
	// #endif
}

onUnmounted(() => {
	clearTimer()
})
</script>

<style scoped lang="scss">
.auth-page {
	--line: rgba(146, 172, 236, 0.44);

	position: relative;
	min-height: 100vh;
	overflow: hidden;
	background:
		radial-gradient(circle at 11% 8%, rgba(85, 226, 255, 0.42) 0%, rgba(85, 226, 255, 0) 34%),
		radial-gradient(circle at 88% 8%, rgba(214, 133, 255, 0.38) 0%, rgba(214, 133, 255, 0) 34%),
		radial-gradient(circle at 50% 108%, rgba(255, 140, 226, 0.3) 0%, rgba(255, 140, 226, 0) 48%),
		linear-gradient(150deg, #090c24 0%, #122047 48%, #2a1353 100%);
	font-family: 'Avenir Next', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

.liquid-bg {
	position: absolute;
	inset: 0;
	z-index: 0;
	pointer-events: none;
	overflow: hidden;
	filter: saturate(145%) brightness(1.06);
}

.liquid-vignette {
	position: absolute;
	inset: 0;
	background:
		radial-gradient(circle at 50% 53%, rgba(9, 12, 35, 0) 30%, rgba(11, 15, 39, 0.14) 84%),
		linear-gradient(180deg, rgba(7, 10, 29, 0.06) 0%, rgba(11, 14, 38, 0.1) 100%);
}

.liquid-ring-outer {
	--card-w: 176rpx;
	--card-h: 252rpx;
	--translate-z: 340rpx;
	--rotate-x: -12deg;
	--perspective: 1900rpx;

	position: absolute;
	width: var(--card-w);
	height: var(--card-h);
	top: 3%;
	left: calc(50% - (var(--card-w) / 2));
	animation: liquid-rise 2.4s cubic-bezier(0.34, 1.3, 0.64, 1) forwards;
}

.liquid-ring {
	position: absolute;
	inset: 0;
	transform-style: preserve-3d;
	animation: liquid-rotate 28s linear infinite;
	transform: perspective(var(--perspective)) rotateX(var(--rotate-x));
}

.liquid-card {
	position: absolute;
	inset: 0;
	overflow: hidden;
	border-radius: 26rpx;
	border: 2rpx solid rgba(var(--color-card), 0.72);
	background: rgba(255, 255, 255, 0.1);
	backdrop-filter: blur(4rpx) saturate(175%);
	box-shadow:
		0 16rpx 34rpx rgba(12, 16, 46, 0.38),
		inset 0 0 0 1rpx rgba(255, 255, 255, 0.34);
	opacity: 0.88;
	backface-visibility: hidden;
	transform: rotateY(calc((360deg / var(--quantity)) * var(--index))) translateZ(var(--translate-z));
}

.liquid-fill {
	position: absolute;
	inset: 0;
	background:
		radial-gradient(circle at 50% 24%, rgba(255, 255, 255, 0.72) 0%, rgba(255, 255, 255, 0.14) 44%, rgba(255, 255, 255, 0) 100%),
		linear-gradient(160deg, rgba(var(--color-card), 0.3) 0%, rgba(var(--color-card), 0.64) 100%);
}

.liquid-fill::before {
	content: '';
	position: absolute;
	inset: 0;
	background: linear-gradient(0deg, rgba(7, 11, 34, 0.44) 0%, rgba(7, 11, 34, 0) 40%);
}

.liquid-fill::after {
	content: '';
	position: absolute;
	inset: 12% 10%;
	border-radius: 24rpx;
	border: 1rpx solid rgba(255, 255, 255, 0.34);
}

.liquid-body {
	position: absolute;
	inset: 0;
	z-index: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 14rpx;
	padding: 0 14rpx;
}

.liquid-icon-wrap {
	width: 76rpx;
	height: 76rpx;
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(255, 255, 255, 0.2);
	border: 1rpx solid rgba(255, 255, 255, 0.36);
	box-shadow: 0 4rpx 14rpx rgba(0, 0, 0, 0.22), inset 0 1rpx 0 rgba(255,255,255,0.3);
}

.liquid-icon {
	font-size: 42rpx;
	line-height: 1;
}

.liquid-label {
	text-align: center;
	font-size: 28rpx;
	font-weight: 800;
	letter-spacing: 1rpx;
	color: #f5f9ff;
	text-shadow: 0 1rpx 6rpx rgba(8, 12, 32, 0.7);
}

.auth-wrap {
	position: relative;
	z-index: 2;
	min-height: calc(100vh - 90rpx);
	padding: 66rpx 30rpx 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.auth-card {
	width: 100%;
	padding: 32rpx 28rpx 24rpx;
	border-radius: 22rpx;
	background: rgba(255, 255, 255, 0.08);
	border: 1rpx solid rgba(204, 221, 255, 0.44);
	backdrop-filter: blur(6rpx) saturate(145%);
	box-shadow: 0 20rpx 44rpx rgba(9, 14, 40, 0.34);
}

.card-title {
	display: block;
	margin-bottom: 38rpx;
	font-size: 34rpx;
	line-height: 1.2;
  text-align: center;
	font-weight: 700;
	color: #eff4ff;
}

.card-subtitle {
	display: block;
	margin-bottom: 18rpx;
	font-size: 22rpx;
	color: #b8c7ea;
}

.segment {
	height: 78rpx;
	background: rgba(255, 255, 255, 0.08);
	border-radius: 16rpx;
	position: relative;
	display: flex;
	padding: 6rpx;
	margin-bottom: 20rpx;
}

.segment-indicator {
	position: absolute;
	top: 6rpx;
	left: 6rpx;
	width: calc(50% - 6rpx);
	height: calc(100% - 12rpx);
	border-radius: 12rpx;
	background: linear-gradient(135deg, #34c6ff 0%, #5e76ff 54%, #8a69ff 100%);
	box-shadow: 0 8rpx 20rpx rgba(91, 110, 239, 0.32);
	transition: transform 220ms ease;
}

.segment-item {
	position: relative;
	z-index: 1;
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
}

.segment-text {
	font-size: 26rpx;
	font-weight: 600;
	color: #c2d0ee;
	transition: color 180ms ease;
}

.segment-item.active .segment-text {
	color: #f6f9ff;
}

.field {
	margin-bottom: 12rpx;
}

.field-label {
	display: block;
	margin-bottom: 9rpx;
	font-size: 21rpx;
	font-weight: 600;
	color: #d2ddf6;
}

.field-input {
	display: flex;
	align-items: center;
	gap: 10rpx;
	min-height: 88rpx;
	padding: 0 16rpx;
	border-radius: 14rpx;
	border: 1rpx solid var(--line);
	background: rgba(255, 255, 255, 0.07);
	transition: border-color 180ms ease, box-shadow 180ms ease;
}

.field-input.focused {
	border-color: #7edaff;
	box-shadow: 0 0 0 4rpx rgba(126, 218, 255, 0.18);
}

.field-input.invalid {
	border-color: #d86695;
}

.inp {
	flex: 1;
	height: 88rpx;
	font-size: 27rpx;
	color: #f2f7ff;
}

.inp-placeholder {
	font-size: 24rpx;
	color: #b4c2e2;
}

.code-row {
	display: flex;
	gap: 10rpx;
}

.code-input {
	flex: 1;
}

.send-btn {
	min-width: 190rpx;
	padding: 0 16rpx;
	border-radius: 14rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #2ec8ff 0%, #5a77ff 54%, #8769ff 100%);
	box-shadow: 0 8rpx 20rpx rgba(90, 119, 255, 0.3);
}

.send-btn.disabled {
	opacity: 0.42;
}

.send-btn-text {
	font-size: 22rpx;
	font-weight: 700;
	color: #fff8f3;
}

.icon-action {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 2rpx;
}

.field-tip {
	display: block;
	min-height: 34rpx;
	padding: 8rpx 2rpx 0;
	font-size: 20rpx;
	color: #d55e93;
}

.field-tip.error {
	color: #d55e93;
}

.agreement {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 8rpx 0 4rpx;
}

.agreement-text,
.agreement-link {
	font-size: 20rpx;
}

.agreement-text {
	color: #c2d1ef;
}

.agreement-link {
	color: #83ddff;
	font-weight: 600;
}

.submit-btn {
	height: 90rpx;
	margin-top: 10rpx;
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10rpx;
	background: rgba(255, 255, 255, 0.09);
}

.submit-btn.active {
	background: linear-gradient(135deg, #2ec8ff 0%, #5a77ff 54%, #8769ff 100%);
	box-shadow: 0 12rpx 30rpx rgba(90, 120, 255, 0.34);
}

.submit-btn.loading {
	opacity: 0.92;
}

.submit-text {
	font-size: 30rpx;
	font-weight: 700;
	color: #b2c0e2;
}

.submit-btn.active .submit-text {
	color: #f4f8ff;
}

.loading-icon {
	animation: spin 900ms linear infinite;
}

.helper-row {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 14rpx;
	padding-top: 16rpx;
}

.helper-text,
.helper-link {
	font-size: 21rpx;
}

.helper-text {
	color: #b4c2e1;
}

.helper-link {
	font-weight: 600;
	color: #83ddff;
}

.icp-row {
	position: relative;
	z-index: 2;
	padding: 8rpx 24rpx 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.icp-text {
	font-size: 20rpx;
	color: #a7b5d8;
}

@media screen and (min-width: 960px) {
	.liquid-ring {
		--card-w: 144px;
		--card-h: 210px;
		--translate-z: 306px;
		--perspective: 1280px;
		--rotate-x: -30deg;
		top: 3%;
		left: calc(50% - (var(--card-w) / 2));
	}

	.liquid-icon {
		font-size: 28px;
	}

	.liquid-icon-wrap {
		width: 52px;
		height: 52px;
		border-radius: 14px;
	}

	.liquid-label {
		font-size: 16px;
		letter-spacing: 0.5px;
	}

	.auth-wrap {
		padding: 68px 24px 14px;
	}

	.auth-card {
		max-width: 470px;
		padding: 26px 22px 18px;
	}

	.card-title {
		font-size: 24px;
	}

	.card-subtitle {
		font-size: 13px;
	}

	.field-label,
	.inp,
	.inp-placeholder,
	.send-btn-text,
	.field-tip,
	.agreement-text,
	.agreement-link,
	.helper-text,
	.helper-link,
	.icp-text,
	.segment-text {
		font-size: 14px;
	}

	.submit-text {
		font-size: 18px;
	}
}

/* 外层容器：从屏幕底部升起 → 冲过头 → 回落 */
@keyframes liquid-rise {
	0%   { transform: translateY(640rpx); }
	62%  { transform: translateY(-100rpx); }
	100% { transform: translateY(0); }
}

@keyframes liquid-rotate {
	from {
		transform: perspective(var(--perspective)) rotateX(var(--rotate-x)) rotateY(0);
	}
	to {
		transform: perspective(var(--perspective)) rotateX(var(--rotate-x)) rotateY(1turn);
	}
}

@keyframes spin {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}
</style>
