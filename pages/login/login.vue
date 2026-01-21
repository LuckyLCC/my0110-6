<template>
	<view class="login-screen">
		<!-- 返回按钮 -->
		<view class="back-button" @tap="goBackToMy">
			<image class="back-icon" src="/static/Button.png" mode="aspectFit"></image>
		</view>
		
		<!-- Avatar and Welcome Section -->
		<view class="welcome-section">
			<view class="avatar-container">
				<text class="avatar-text">A</text>
			</view>
			<text class="welcome-title">欢迎帧元负氧离子</text>
			<text class="welcome-subtitle">登录以查看您的会员权益</text>
		</view>

		<!-- 用户信息填写（如果获取到的是降级信息） -->
		<view v-if="showUserInfoForm" class="user-info-form-overlay" @tap="cancelUserInfoForm">
			<view class="user-info-form" @tap.stop>
				<view class="form-title">请完善您的信息</view>
				<view class="form-tip">微信无法直接获取您的昵称和头像，请手动填写</view>
				<view class="avatar-selector">
					<button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
						<image 
							v-if="selectedAvatar" 
							class="avatar-preview" 
							:src="selectedAvatar" 
							mode="aspectFill"
						></image>
						<view v-else class="avatar-placeholder">
							<text class="avatar-placeholder-text">选择头像</text>
						</view>
					</button>
				</view>
				<input 
					class="nickname-input" 
					type="nickname" 
					:value="selectedNickname" 
					placeholder="请输入昵称"
					@input="onNicknameInput"
				/>
				<view class="form-buttons">
					<view class="form-btn cancel-btn" @tap="cancelUserInfoForm">跳过</view>
					<view class="form-btn confirm-btn" @tap="confirmUserInfo">确认</view>
				</view>
			</view>
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
			showUserInfoForm: false, // 是否显示用户信息填写表单
			selectedAvatar: '', // 用户选择的头像
			selectedNickname: '', // 用户输入的昵称
			pendingLoginCode: null, // 待处理的登录 code
			icons: {
				wechat: '/static/login/wechat.png',
				phone: '/static/login/phone.png'
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

			try {
				// 步骤1: 先获取微信用户信息（昵称和头像）- 必须在用户点击时立即调用，不能延迟
				// 注意：必须在 showLoading 之前调用，确保在用户点击的同步上下文中
				let userProfile = null
				console.log('========== 开始获取微信用户信息 ==========')
				try {
					console.log('准备调用 uni.getUserProfile...')
					const profileRes = await new Promise((resolve, reject) => {
						uni.getUserProfile({
							desc: '用于完善用户资料',
							success: (res) => {
								console.log('getUserProfile success 回调被触发')
								resolve(res)
							},
							fail: (err) => {
								console.error('getUserProfile fail 回调被触发:', err)
								reject(err)
							}
						})
					})
					
					console.log('getUserProfile 返回完整数据:', JSON.stringify(profileRes))
					
					if (profileRes && profileRes.userInfo) {
						// 检查是否是降级后的匿名信息
						const isDemote = profileRes.userInfo.is_demote === true || profileRes.is_demote === true
						
						if (isDemote) {
							console.warn('⚠️ 获取到的是降级后的匿名信息，不是真实用户信息')
							console.warn('微信小程序新政策：无法直接获取用户真实昵称和头像')
							console.warn('昵称:', profileRes.userInfo.nickName, '(这是匿名昵称)')
							// 显示用户信息填写表单，让用户手动选择头像和输入昵称
							// 先获取 code，然后显示表单
							const loginRes = await new Promise((resolve, reject) => {
								uni.login({
									provider: 'weixin',
									success: resolve,
									fail: reject
								})
							})
							if (loginRes.code) {
								this.pendingLoginCode = loginRes.code
								this.showUserInfoForm = true
								uni.hideLoading()
								this.loading = false
								return // 等待用户填写信息
							}
							// 如果获取 code 失败，继续使用默认值
							userProfile = null
						} else {
							userProfile = {
								nickName: profileRes.userInfo.nickName,
								avatarUrl: profileRes.userInfo.avatarUrl
							}
							console.log('✅ 成功获取到微信用户信息:')
							console.log('  - 昵称:', userProfile.nickName)
							console.log('  - 头像:', userProfile.avatarUrl)
						}
					} else {
						console.warn('⚠️ getUserProfile 返回的数据中没有 userInfo')
						console.warn('返回数据:', profileRes)
					}
				} catch (profileError) {
					console.error('❌ 获取微信用户信息失败:')
					console.error('错误对象:', profileError)
					console.error('错误信息:', profileError.errMsg || profileError.message || '未知错误')
					console.error('错误详情:', JSON.stringify(profileError))
					
					// 如果用户拒绝授权，继续登录流程，但不传递用户信息
					if (profileError.errMsg && profileError.errMsg.includes('cancel')) {
						console.warn('用户拒绝了授权，将使用默认昵称')
					}
				}
				console.log('========== 获取微信用户信息结束 ==========')

				// 显示加载提示（在获取用户信息之后）
				uni.showLoading({
					title: '登录中...',
					mask: true
				})

				// 步骤2: 调用 uni.login 获取微信 code
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

				// 步骤3: 将 code 和用户信息发送到后端进行登录验证
				const nicknameToSend = userProfile?.nickName || null
				const avatarUrlToSend = userProfile?.avatarUrl || null
				console.log('准备发送登录请求:')
				console.log('  - code:', loginRes.code ? '已提供' : '未提供')
				console.log('  - nickname:', nicknameToSend)
				console.log('  - avatarUrl:', avatarUrlToSend ? '已提供' : '未提供')
				
				// 使用公共方法完成登录
				await this.completeLoginWithCode(loginRes.code, nicknameToSend, avatarUrlToSend)
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
		},
		goBackToMy() {
			// 返回我的页面
			uni.navigateBack({
				delta: 1,
				fail: () => {
					// 如果无法返回，则跳转到我的页面
					uni.redirectTo({
						url: '/pages/my/my'
					})
				}
			})
		},
		// 用户选择头像
		onChooseAvatar(e) {
			console.log('用户选择头像:', e.detail)
			const { avatarUrl } = e.detail
			this.selectedAvatar = avatarUrl
			console.log('设置头像:', avatarUrl)
		},
		// 用户输入昵称
		onNicknameInput(e) {
			console.log('用户输入昵称:', e.detail.value)
			this.selectedNickname = e.detail.value || ''
		},
		// 取消填写用户信息
		cancelUserInfoForm() {
			this.showUserInfoForm = false
			this.selectedAvatar = ''
			this.selectedNickname = ''
			const code = this.pendingLoginCode
			this.pendingLoginCode = null
			this.loading = false
			// 使用默认信息继续登录
			if (code) {
				this.completeLoginWithCode(code, null, null)
			}
		},
		// 确认用户信息并完成登录
		async confirmUserInfo() {
			if (!this.pendingLoginCode) {
				uni.showToast({
					title: '登录凭证已过期，请重新登录',
					icon: 'none'
				})
				this.showUserInfoForm = false
				this.loading = false
				return
			}

			// 验证昵称
			if (!this.selectedNickname || this.selectedNickname.trim() === '') {
				uni.showToast({
					title: '请输入昵称',
					icon: 'none'
				})
				return
			}

			uni.showLoading({
				title: '登录中...',
				mask: true
			})

			// 使用用户填写的信息完成登录
			await this.completeLoginWithCode(
				this.pendingLoginCode,
				this.selectedNickname.trim(),
				this.selectedAvatar
			)

			// 重置表单
			this.showUserInfoForm = false
			this.selectedAvatar = ''
			this.selectedNickname = ''
			this.pendingLoginCode = null
		},
		// 使用 code 完成登录（公共方法）
		async completeLoginWithCode(code, nickname, avatarUrl) {
			try {
				console.log('完成登录，参数:')
				console.log('  - code:', code ? '已提供' : '未提供')
				console.log('  - nickname:', nickname)
				console.log('  - avatarUrl:', avatarUrl ? '已提供' : '未提供')

				const response = await api.user.login(code, nickname, avatarUrl)
				console.log('后端登录响应:', response)

				if (response.code === 200) {
					// 保存 token 到本地存储
					if (response.data && response.data.token) {
						uni.setStorageSync('token', response.data.token)
						console.log('Token 已保存')
					}

					// 保存用户信息（如果有）
					if (response.data && response.data.userInfo) {
						uni.setStorageSync('userInfo', response.data.userInfo)
					}

					uni.hideLoading()
					uni.showToast({
						title: '登录成功',
						icon: 'success',
						duration: 1500
					})

					// 根据用户角色跳转到不同页面
					setTimeout(() => {
						const userInfo = response.data?.userInfo || uni.getStorageSync('userInfo')
						const userRole = userInfo?.role || 'user'
						
						if (String(userRole).toLowerCase() === 'staff') {
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
					this.loading = false
				}
			} catch (error) {
				console.error('登录错误:', error)
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
				this.loading = false
			}
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
	position: relative;
}

/* 返回按钮 */
.back-button {
	position: fixed;
	top: 88rpx;
	left: 32rpx;
	width: 80rpx;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 100;
	background: transparent;
}

.back-icon {
	width: 60rpx;
	height: 60rpx;
	display: block;
	background: transparent;
	border: none;
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
	color: #999999;
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
	color: #999999;
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
	color: #999999;
	letter-spacing: -0.2rpx;
	opacity: 0.6;
}

/* 用户信息填写表单 */
.user-info-form-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
}

.user-info-form {
	width: 600rpx;
	background-color: #ffffff;
	border-radius: 32rpx;
	padding: 60rpx 48rpx;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 40rpx;
}

.form-title {
	font-family: 'Inter', 'Noto Sans SC', 'Noto Sans JP', sans-serif;
	font-weight: 600;
	font-size: 36rpx;
	line-height: 52rpx;
	color: #333333;
	text-align: center;
}

.form-tip {
	font-family: 'Inter', 'Noto Sans SC', 'Noto Sans JP', sans-serif;
	font-weight: normal;
	font-size: 26rpx;
	line-height: 38rpx;
	color: #999999;
	text-align: center;
}

.avatar-selector {
	width: 100%;
	display: flex;
	justify-content: center;
}

.avatar-btn {
	width: 160rpx;
	height: 160rpx;
	border-radius: 50%;
	border: 2rpx solid #e5e7eb;
	background-color: #f9fafb;
	padding: 0;
	margin: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
}

.avatar-btn::after {
	border: none;
}

.avatar-preview {
	width: 100%;
	height: 100%;
	border-radius: 50%;
}

.avatar-placeholder {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #f3f4f6;
}

.avatar-placeholder-text {
	font-family: 'Inter', 'Noto Sans SC', 'Noto Sans JP', sans-serif;
	font-weight: normal;
	font-size: 24rpx;
	color: #999999;
}

.nickname-input {
	width: 100%;
	height: 88rpx;
	border: 2rpx solid #e5e7eb;
	border-radius: 16rpx;
	padding: 0 32rpx;
	box-sizing: border-box;
	font-family: 'Inter', 'Noto Sans SC', 'Noto Sans JP', sans-serif;
	font-size: 30rpx;
	color: #333333;
	background-color: #ffffff;
}

.nickname-input:focus {
	border-color: #4a5d50;
}

.form-buttons {
	width: 100%;
	display: flex;
	gap: 24rpx;
	margin-top: 20rpx;
}

.form-btn {
	flex: 1;
	height: 88rpx;
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-family: 'Inter', 'Noto Sans SC', 'Noto Sans JP', sans-serif;
	font-weight: 500;
	font-size: 32rpx;
	line-height: 48rpx;
}

.cancel-btn {
	background-color: #f3f4f6;
	color: #999999;
}

.confirm-btn {
	background-color: #4a5d50;
	color: #ffffff;
}
</style>

