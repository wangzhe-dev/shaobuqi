<template>
	<view class="w100 flex-y pl-20 pr-20">
		<view class="flex-y flex-middle">
			<sar-avatar root-class="mb-10 mt-100" src="/static/images/tabbar/index-select.png" size="120rpx" />
			<text class="title">
				{{ sysInfo.systemInfo.appName }}
			</text>

			<text class="title mt-10">
				全局属性-主题色：{{ $mainColor }}
			</text>
		</view>

		<sar-space root-class="mt-20" direction="vertical">
			<!-- #ifdef MP-WEIXIN -->
			<sar-button open-type="share" round>
				分享给朋友
			</sar-button>
			<!-- #endif -->

			<!-- #ifdef H5 || APP-PLUS -->
			<sar-button round @click="onOpenApp">
				打开微信app
			</sar-button>
			<!-- #endif -->

			<!-- #ifdef APP-PLUS -->
			<sar-divider>App权限申请</sar-divider>

			<sar-button round @click="openAppAuthorizeSetting">
				跳转系统授权管理页
			</sar-button>

			<sar-button round @click="applyPermission('相机')">
				点击申请相机权限
			</sar-button>

			<sar-button round @click="applyPermission('相册')">
				点击申请相册权限
			</sar-button>

			<sar-button round @click="applyPermission('电话')">
				点击申请电话权限
			</sar-button>

			<sar-button round @click="applyPermission('位置')">
				点击申请位置权限
			</sar-button>
			<!-- #endif -->

			<sar-button round :loading="loading" @click="applyPermission('保存图片')">
				保存图片
			</sar-button>
		</sar-space>
	</view>
</template>

<script setup lang="ts">
	import { useShareStore, useSysInfoStore } from '@/stores'
	import { saveImageToPhotosAlbum } from '@/utils/common/method'
	// import { getConfigByKey } from '@/api/common'

	// #ifdef H5
	import { openApp } from '@/utils/h5'
	// #endif

	// #ifdef APP-PLUS
	import { openTheApp, requestAndroidPermission } from '@/utils/app'
	// #endif

	const share = useShareStore()
	const sysInfo = useSysInfoStore()
	const loading = ref(false)

	onLoad(() => {
		getDicts()
	})

	onShow(() => {
		// #ifdef MP-WEIXIN
		share.setMpShareFriend({
			title: '修改当前页默认的分享文案',
			path: '/pages/index/index',
			imageUrl: 'https://picsum.photos/500/400'
		})
		// #endif
	})

	const applyPermission = async (type : string) => {
		if (type === '相机') {
			uni.chooseImage({
				sourceType: ['camera'],
				success(res) {
					console.log('成功', res)
				}
			})
		} else if (type === '相册') {
			// 使用相册时 需要特殊处理
			const systemInfo = sysInfo.systemInfo as { osAndroidAPILevel ?: number }
			const key = systemInfo.osAndroidAPILevel && systemInfo.osAndroidAPILevel >= 33 ? 'android.permission.READ_MEDIA_IMAGES' : 'android.permission.READ_EXTERNAL_STORAGE'
			if (await requestAndroidPermission([key]) !== 1) return

			uni.chooseImage({
				sourceType: ['album'],
				success(res) {
					console.log('成功', res)
				}
			})
		} else if (type === '电话') {
			uni.makePhoneCall({
				phoneNumber: '10086'
			})
		} else if (type === '位置') {
			uni.getLocation({
				type: 'wgs84',
				success(res) {
					console.log('成功', res)
				}
			})
		} else if (type === '保存图片') {
			if (loading.value) return
			loading.value = true

			const imgUrl = 'https://s1.imagehub.cc/images/2025/06/06/e298ef8e73bc8a6ced245fe05fe74ce6.png'
			await saveImageToPhotosAlbum(imgUrl).catch(() => loading.value = false)
			loading.value = false
		}
	}

	// 跳转系统授权管理页
	const openAppAuthorizeSetting = () => {
		uni.openAppAuthorizeSetting()
	}

	// 打开app
	const onOpenApp = () => {
		// #ifdef H5
		openApp('weixin://')
		// #endif

		// #ifdef APP-PLUS
		openTheApp('weixin://')
		// #endif
	}

	const getDicts = () => {
		// 接口请求示例
		// getConfigByKey('kindly_reminder').then((res) => {
		// 	console.log('返回结果：', res)
		// })
	}
</script>

<style lang="scss" scoped>
	.logo {
		height: 120rpx;
		width: 120rpx;
		margin-top: 100rpx;
	}

	.btn {
		padding: 10rpx 30rpx;
		color: #fff;
		margin-top: 20rpx;
		background-color: $main-color;
	}

	.title {
		font-size: 28rpx;
		color: #8f8f94;
	}
</style>