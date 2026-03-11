<template>
	<view class="container">
		<sar-form ref="ruleFormRef" :model="ruleForm" :rules="rules">
			<sar-form-item label="密码" name="pass">
				<sar-input v-model="ruleForm.pass" placeholder="请输入密码" type="password" />
			</sar-form-item>

			<sar-form-item label="确认密码" name="checkPass">
				<sar-input v-model="ruleForm.checkPass" placeholder="请再次输入密码" type="password" />
			</sar-form-item>

			<sar-form-item label="手机号" name="phone">
				<sar-input v-model="ruleForm.phone" placeholder="请输入手机号" :maxlength="11" />
			</sar-form-item>

			<sar-form-item label="年龄" name="age">
				<template #validate="{ state }">
					<sar-input v-model="ruleForm.age" placeholder="请输入大于18岁的年龄" type="number" clearable>
						<template #append>
							<sar-loading v-if="state === 'validating'" color="var(--sar-tertiary-color)" />
						</template>
					</sar-input>
				</template>
			</sar-form-item>

			<sar-form-item label="头像" name="avatarList">
				<sar-upload v-model="ruleForm.avatarList" multiple :max-count="2" :before-choose="beforeChoose" :after-read="afterRead" />
			</sar-form-item>

			<sar-form-item>
				<sar-button @click="submitForm(ruleFormRef)">
					提交
				</sar-button>
				<sar-button type="outline" root-style="margin-top: 20rpx" @click="resetForm(ruleFormRef)">
					重置
				</sar-button>
			</sar-form-item>
		</sar-form>

		<sar-card root-class="mt-20" :title="`当前环境地址：${ requestUrl }`">
			<sar-button root-style="margin-top: 10rpx;" :background="$mainColor" @click="handleClick">
				连续点击7次 可切换开发环境
			</sar-button>
		</sar-card>

		<sar-action-sheet v-model:visible="visible" description="环境切换" :overlay-closable="false" cancel="取消" :item-list="apiList" @select="switchApi" />
	</view>
</template>

<script setup lang="ts">
	import { useSysInfoStore } from '@/stores'
	import { requestUrl } from '@/config'
	// #ifdef APP-PLUS
	import { requestAndroidPermission } from '@/utils/app'
	// #endif
	import type { ActionSheetItem, FormRules, FormExpose, UploadFileItem, UploadProps } from 'sard-uniapp'

	const sysInfo = useSysInfoStore()
	const visible = ref()
	const clickCount = ref(0)
	const timeout = ref()
	const apiList = ref([
		{ name: 'https://app.xxx.com' },
		{ name: 'https://dev.xxx.com' },
		{ name: 'http://192.168.110.102:8080' }
	])

	const ruleFormRef = ref<FormExpose>()
	const ruleForm = reactive({
		pass: '',
		checkPass: '',
		phone: '',
		age: '',
		avatarList: [] as UploadFileItem[]
	})

	const validatePass = (value : string) => {
		if (value === '') return '请输入密码'

		if (ruleForm.checkPass !== '') {
			if (!ruleFormRef.value) return true

			ruleFormRef.value.validate(['checkPass']).catch(() => void 0)
		}
		return true
	}
	const validatePass2 = (value : string) => {
		if (value === '') {
			return '请输入密码'
		} else if (value !== ruleForm.pass) {
			return '两次密码输入不一致！'
		}
		return true
	}

	const checkPhone = (value : string) => {
		if (value === '') return '请输入手机号'
		if (!uni.$tao.validate.mobile(value)) return '请输入正确的手机号'

		return true
	}

	const checkAge = (value : string) => {
		return new Promise<void>((resolve, reject) => {
			if (!value) return reject('请输入年龄')

			setTimeout(() => {
				if (!Number.isInteger(Number(value))) {
					reject('请输入数字')
				} else {
					if (Number(value) < 18) {
						reject('年龄必须大于18岁')
					} else {
						resolve()
					}
				}
			}, 1000)
		})
	}

	const rules = reactive<FormRules>({
		pass: [{ validator: validatePass, trigger: 'blur' }],
		checkPass: [{ validator: validatePass2, trigger: 'blur' }],
		phone: [{ validator: checkPhone, trigger: 'change' }],
		age: [{ validator: checkAge, trigger: 'blur' }],
		avatarList: [{ required: true, message: '请上传头像', trigger: 'change' }]
	})

	// 选择文件前置处理
	const beforeChoose : UploadProps['beforeChoose'] = async (_, next) => {
		// #ifndef APP-PLUS
		next(true)
		// #endif

		// #ifdef APP-PLUS
		uni.showActionSheet({
			itemList: ['拍摄', '从相册选择'],
			success: async (res) => {
				if (res.tapIndex === 0) {
					next({ sourceType: ['camera'] })
				} else if (res.tapIndex === 1) {
					// 使用相册时 需要特殊处理
					const systemInfo = sysInfo.systemInfo as { osAndroidAPILevel ?: number }
					const key = systemInfo.osAndroidAPILevel && systemInfo.osAndroidAPILevel >= 33 ? 'android.permission.READ_MEDIA_IMAGES' : 'android.permission.READ_EXTERNAL_STORAGE'
					if (await requestAndroidPermission([key]) !== 1) return

					next({ sourceType: ['album'] })
				}
			},
			fail: () => next(false)
		})
		// #endif
	}

	const uploadFile = () => {
		return new Promise((resolve) => setTimeout(resolve, 1500))
	}

	// 文件读取完成后的回调
	const afterRead = (fileItem : UploadFileItem) => {
		fileItem.status = 'uploading'
		fileItem.message = '正在上传'
		ruleForm.avatarList = [...ruleForm.avatarList]

		uploadFile().then(() => {
			fileItem.status = 'done'
			ruleForm.avatarList = [...ruleForm.avatarList]
		}).catch(() => {
			fileItem.status = 'failed'
			ruleForm.avatarList = [...ruleForm.avatarList]
		})
	}

	const submitForm = (formEl ?: FormExpose) => {
		if (!formEl) return

		formEl.validate().then(() => {
			uni.$tao.toast('Success!')
		}).catch(() => {
			console.log('error submit!')
		})
	}

	const resetForm = (formEl ?: FormExpose) => {
		if (!formEl) return
		formEl.reset()
	}

	// 连续点击7次 显示Api接口列表
	const handleClick = () => {
		clickCount.value++
		if (clickCount.value === 7) {
			// #ifdef MP-WEIXIN
			if (sysInfo.systemInfo.platform === 'devtools') {
				uni.$tao.toast('在微信开发者工具上，切换完成后需手动点击编译才能刷新')
			}
			// #endif

			visible.value = true
		}

		clearTimeout(timeout.value)
		timeout.value = setTimeout(() => {
			clickCount.value = 0
		}, 1000)
	}

	// 点击列表api进行切换
	const switchApi = (item : ActionSheetItem) => {
		uni.setStorageSync('requestUrl', item.name)

		// #ifdef MP-WEIXIN
		// 退出小程序
		wx.exitMiniProgram()
		// #endif

		// #ifdef APP-PLUS
		// 重启app
		plus.runtime.restart()
		// #endif

		// #ifdef H5
		location.reload()
		// #endif

		visible.value = false
	}
</script>

<style lang="scss" scoped>
	.container {
		padding: 20rpx;
	}
</style>