<template>
	<view class="login-screen">
		<!-- Avatar and Welcome Section -->
		<view class="welcome-section">
			<view class="avatar-container">
				<text class="avatar-text">A</text>
			</view>
			<text class="welcome-title">欢迎帧元负氧离子</text>
			<text class="welcome-subtitle">登录以查看您的会员权益</text>
		</view>

		<!-- Login Buttons -->
		<view class="buttons-section">
			<view class="wechat-btn" @tap="handleWechatLogin">
				<image class="btn-icon" :src="icons.wechat" mode="aspectFit"></image>
				<text class="btn-text wechat-text">微信一键登录</text>
			</view>
			<view class="phone-btn" @tap="handlePhoneLogin">
				<image class="btn-icon" :src="icons.phone" mode="aspectFit"></image>
				<text class="btn-text phone-text">手机号码登录</text>
			</view>
		</view>

		<!-- Terms and Conditions -->
		<view class="terms-section">
			<view class="checkbox" :class="{ checked: termsAgreed }" @tap="toggleTerms">
				<text v-if="termsAgreed" class="checkmark">✓</text>
			</view>
			<view class="terms-text">
				<text class="terms-normal">我已阅读并同意</text>
				<text class="terms-link" @tap="openUserAgreement">用户协议</text>
				<text class="terms-normal">和</text>
				<text class="terms-link" @tap="openPrivacyPolicy">隐私政策</text>
			</view>
		</view>

		<!-- 商家版入口 -->
		<view class="staff-entry" @tap="navigateToStaff">
			<text class="staff-entry-text">商家版入口</text>
		</view>
	</view>
</template>

<script>
import { api } from '@/api/request'

export default {
	data() {
		return {
			termsAgreed: false,
			loading: false,
			icons: {
				wechat: 'https://www.figma.com/api/mcp/asset/6f1ecd7b-5f40-48fb-9ad6-f69a05013455',
				phone: 'https://www.figma.com/api/mcp/asset/d0de85e0-b7cc-49dc-995b-8410f60b8977'
			}
		}
	},
	methods: {
		async handleWechatLogin() {
			// 检查是否同意协议
			if (!this.termsAgreed) {
				uni.showToast({
					title: '请先阅读并同意用户协议和隐私政策',
					icon: 'none',
					duration: 2000
				})
				return
			}

			// 防止重复点击
			if (this.loading) {
				return
			}

			this.loading = true
			uni.showLoading({
				title: '登录中...',
				mask: true
			})

			try {
				// 步骤1: 调用 uni.login 获取微信 code
				const loginRes = await new Promise((resolve, reject) => {
					uni.login({
						provider: 'weixin',
						success: resolve,
						fail: reject
					})
				})

				console.log('uni.login 返回:', loginRes)

				if (!loginRes.code) {
					throw new Error('获取微信登录凭证失败')
				}

				// 步骤2: 将 code 发送到后端进行登录验证
				const response = await api.user.login(loginRes.code)
				console.log('后端登录响应:', response)

				if (response.code === 200) {
					// 步骤3: 保存 token 到本地存储
					if (response.data && response.data.token) {
						uni.setStorageSync('token', response.data.token)
						console.log('Token 已保存')
					}

					// 步骤4: 保存用户信息（如果有）
					if (response.data && response.data.userInfo) {
						uni.setStorageSync('userInfo', response.data.userInfo)
					}

					uni.hideLoading()
					uni.showToast({
						title: '登录成功',
						icon: 'success',
						duration: 1500
					})

					// 步骤5: 根据用户角色跳转到不同页面
					setTimeout(() => {
						const userInfo = response.data?.userInfo || uni.getStorageSync('userInfo')
						const userRole = userInfo?.role || 'user'
						
						if (userRole === 'staff') {
							// 商家用户跳转到扫码核销页面
							uni.reLaunch({
								url: '/pages/staff/verify'
							})
						} else {
							// 普通用户跳转到首页
							uni.reLaunch({
								url: '/pages/index/index'
							})
						}
					}, 1500)
				} else {
					// 后端返回错误
					const errorMsg = response.message || '登录失败，请重试'
					uni.hideLoading()
					uni.showToast({
						title: errorMsg,
						icon: 'none',
						duration: 2000
					})
				}
			} catch (error) {
				console.error('微信登录错误:', error)
				uni.hideLoading()
				
				let errorMsg = '登录失败，请重试'
				if (error.errMsg) {
					if (error.errMsg.includes('fail')) {
						errorMsg = '微信登录失败，请检查网络连接'
					} else {
						errorMsg = error.errMsg
					}
				} else if (error.message) {
					errorMsg = error.message
				}

				uni.showToast({
					title: errorMsg,
					icon: 'none',
					duration: 2000
				})
			} finally {
				this.loading = false
			}
		},
		handlePhoneLogin() {
			// 跳转到手机号登录页面
			uni.navigateTo({
				url: '/pages/phone-login/phone-login'
			})
		},
		toggleTerms() {
			this.termsAgreed = !this.termsAgreed
		},
		openUserAgreement() {
			// 打开用户协议页面
			uni.navigateTo({
				url: '/pages/agreement/user-agreement'
			})
		},
		openPrivacyPolicy() {
			// 打开隐私政策页面
			uni.navigateTo({
				url: '/pages/agreement/privacy-policy'
			})
		},
		navigateToStaff() {
			// 跳转到商家版登录页面
			uni.navigateTo({
				url: '/pages/staff/login'
			})
		}
	}
}
</script>

<style scoped>
.login-screen {
	width: 100%;
	min-height: 100vh;
	background-color: #ffffff;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 208rpx 48rpx 0;
	box-sizing: border-box;
}

.welcome-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 48rpx;
	margin-bottom: 200rpx;
	width: 100%;
}

.avatar-container {
	background-color: #1a1a1a;
	border-radius: 32rpx;
	width: 192rpx;
	height: 192rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 20rpx 25rpx -5rpx rgba(0, 0, 0, 0.1), 0 8rpx 10rpx -6rpx rgba(0, 0, 0, 0.1);
	flex-shrink: 0;
}

.avatar-text {
	font-family: 'Inter', sans-serif;
	font-weight: bold;
	font-size: 72rpx;
	line-height: 80rpx;
	color: #e8d5b5;
	letter-spacing: 0.74rpx;
}

.welcome-title {
	font-family: 'Inter', 'Noto Sans SC', 'Noto Sans JP', sans-serif;
	font-weight: bold;
	font-size: 48rpx;
	line-height: 64rpx;
	color: #101828;
	letter-spacing: 0.14rpx;
	text-align: center;
}

.welcome-subtitle {
	font-family: 'Inter', 'Noto Sans SC', 'Noto Sans JP', sans-serif;
	font-weight: normal;
	font-size: 32rpx;
	line-height: 48rpx;
	color: #6a7282;
	letter-spacing: -0.625rpx;
	text-align: center;
}

.buttons-section {
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 32rpx;
	margin-bottom: 120rpx;
}

.wechat-btn {
	background-color: #07c160;
	width: 100%;
	height: 96rpx;
	border-radius: 9999rpx;
	box-shadow: 0 10rpx 15rpx -3rpx #dcfce7, 0 4rpx 6rpx -4rpx #dcfce7;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 16rpx;
}

.phone-btn {
	background-color: #ffffff;
	border: 2rpx solid #e5e7eb;
	width: 100%;
	height: 96rpx;
	border-radius: 9999rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 16rpx;
}

.btn-icon {
	width: 32rpx;
	height: 32rpx;
	flex-shrink: 0;
}

.btn-text {
	font-family: 'Inter', 'Noto Sans SC', 'Noto Sans JP', sans-serif;
	font-weight: 500;
	font-size: 32rpx;
	line-height: 48rpx;
	text-align: center;
	letter-spacing: -0.625rpx;
}

.wechat-text {
	color: #ffffff;
}

.phone-text {
	color: #364153;
}

.terms-section {
	width: 100%;
	display: flex;
	gap: 16rpx;
	align-items: center;
	justify-content: center;
	padding: 0 92rpx;
	box-sizing: border-box;
}

.checkbox {
	border: 2rpx solid #d1d5dc;
	border-radius: 9999rpx;
	width: 32rpx;
	height: 32rpx;
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #ffffff;
}

.checkbox.checked {
	background-color: #07c160;
	border-color: #07c160;
}

.checkmark {
	color: #ffffff;
	font-size: 24rpx;
	font-weight: bold;
	line-height: 1;
}

.terms-text {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 0;
}

.terms-normal {
	font-family: 'Inter', 'Noto Sans SC', 'Noto Sans JP', sans-serif;
	font-weight: normal;
	font-size: 28rpx;
	line-height: 40rpx;
	color: #99a1af;
	letter-spacing: -0.3rpx;
}

.terms-link {
	font-family: 'Inter', 'Noto Sans SC', 'Noto Sans JP', sans-serif;
	font-weight: normal;
	font-size: 28rpx;
	line-height: 40rpx;
	color: #2b7fff;
	letter-spacing: -0.3rpx;
	text-decoration: underline;
}

/* 商家版入口 - 不明显的提示 */
.staff-entry {
	margin-top: 80rpx;
	padding: 16rpx 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.staff-entry-text {
	font-family: 'Inter', 'Noto Sans SC', 'Noto Sans JP', sans-serif;
	font-weight: normal;
	font-size: 24rpx;
	line-height: 32rpx;
	color: #99a1af;
	letter-spacing: -0.2rpx;
	opacity: 0.6;
}
</style>

