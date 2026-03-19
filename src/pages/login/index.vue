<template>
	<view class="page">
		<view class="hero">
			<text class="hero-title">烧不起</text>
			<text class="hero-sub">登录后可发布 / 收藏 / 反馈 Skill</text>
		</view>

		<view class="card">
			<input
				v-model="form.identifier"
				class="inp"
				placeholder="手机号或邮箱"
				placeholder-class="inp-ph"
			/>
			<input
				v-model="form.password"
				class="inp"
				type="password"
				password
				placeholder="密码"
				placeholder-class="inp-ph"
			/>

			<view class="tips">开发账号：13800000000 / 12345678</view>

			<view class="btn" :class="{ on: canLogin && !loading }" @tap="doLogin">
				<text class="btn-t">{{ loading ? '登录中...' : '登录' }}</text>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { passwordLogin } from '@/api/auth'
import { useUserStore } from '@/stores'

const userStore = useUserStore()
const loading = ref(false)

const form = reactive({
	identifier: '',
	password: ''
})

const canLogin = computed(() => !!form.identifier.trim() && !!form.password.trim())

const doLogin = async () => {
	if (!canLogin.value || loading.value) return

	loading.value = true
	try {
		const data = await passwordLogin({
			identifier: form.identifier.trim(),
			password: form.password
		})
		userStore.setToken(data?.token || '')
		userStore.setUserInfo(data?.user || null)
		uni.showToast({ title: '登录成功', icon: 'success' })

		setTimeout(() => {
			const pages = getCurrentPages()
			if (pages.length > 1) uni.navigateBack()
			else uni.switchTab({ url: '/pages/my/my' })
		}, 500)
	} catch {
		// 已由请求拦截器处理提示
	} finally {
		loading.value = false
	}
}
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
</style>
