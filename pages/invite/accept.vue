<template>
	<view class="accept-invite-page">
		<!-- 顶部导航 -->
		<view class="topbar">
			<text class="topbar-title">接受邀请</text>
		</view>

		<view class="content">
			<!-- 邀请信息展示 -->
			<view class="invite-info-card">
				<view class="invite-icon">🎁</view>
				<text class="invite-title">您收到一个会员卡邀请</text>
				<text class="invite-subtitle">绑定后即可享受会员权益</text>
			</view>

			<!-- 邀请码输入 -->
			<view class="input-section">
				<text class="input-label">邀请码</text>
				<input 
					class="invite-code-input" 
					v-model="inviteCode" 
					placeholder="请输入邀请码"
					placeholder-style="color:#999999;"
					maxlength="8"
				/>
			</view>

			<!-- 提示信息 -->
			<view v-if="errorMessage" class="error-message">
				<text class="error-text">{{ errorMessage }}</text>
			</view>

			<!-- 接受邀请按钮 -->
			<button 
				class="accept-btn" 
				:class="{ disabled: !canAccept }"
				:disabled="!canAccept || loading"
				@tap="handleAcceptInvite"
			>
				<text v-if="!loading" class="accept-btn-text">接受邀请</text>
				<text v-else class="accept-btn-text">处理中...</text>
			</button>

			<!-- 或者使用微信登录 -->
			<view class="divider">
				<text class="divider-text">或</text>
			</view>

			<button class="wechat-login-btn" @tap="handleWechatLogin">
				<image class="wechat-icon" :src="icons.wechat" mode="aspectFit"></image>
				<text class="wechat-text">微信一键登录并接受邀请</text>
			</button>
		</view>
	</view>
</template>

<script>
import { api } from '@/api/request'

export default {
	data() {
		return {
			inviteCode: '',
			loading: false,
			errorMessage: '',
			icons: {
				wechat: 'https://www.figma.com/api/mcp/asset/6f1ecd7b-5f40-48fb-9ad6-f69a05013455'
			}
		}
	},
	computed: {
		canAccept() {
			return this.inviteCode && this.inviteCode.trim().length >= 4
		}
	},
	onLoad(options) {
		console.log('接受邀请页面 onLoad，options:', options)
		// 从页面参数中获取邀请码
		if (options.code) {
			this.inviteCode = options.code
			console.log('从分享链接获取到邀请码:', this.inviteCode)
		} else {
			console.log('未从分享链接获取到邀请码，需要用户手动输入')
		}
	},
	methods: {
		// 接受邀请（已登录用户）
		async handleAcceptInvite() {
			if (!this.canAccept) {
				uni.showToast({
					title: '请输入邀请码',
					icon: 'none'
				})
				return
			}

			const token = uni.getStorageSync('token')
			if (!token) {
				// 未登录，提示使用微信登录
				uni.showToast({
					title: '请先登录',
					icon: 'none'
				})
				this.handleWechatLogin()
				return
			}

			this.loading = true
			this.errorMessage = ''

			try {
				const response = await api.invitation.accept(this.inviteCode.trim())
				
				if (response.code === 200) {
					uni.showToast({
						title: '绑定成功',
						icon: 'success'
					})
					
					// 延迟跳转到我的页面
					setTimeout(() => {
						uni.reLaunch({
							url: '/pages/my/my'
						})
					}, 1500)
				} else {
					this.errorMessage = response.message || '接受邀请失败'
					uni.showToast({
						title: response.message || '接受邀请失败',
						icon: 'none'
					})
				}
			} catch (error) {
				console.error('接受邀请失败:', error)
				this.errorMessage = '网络错误，请重试'
				uni.showToast({
					title: '网络错误，请重试',
					icon: 'none'
				})
			} finally {
				this.loading = false
			}
		},

		// 微信登录并接受邀请
		async handleWechatLogin() {
			if (!this.canAccept) {
				uni.showToast({
					title: '请输入邀请码',
					icon: 'none'
				})
				return
			}

			this.loading = true
			this.errorMessage = ''

			try {
				// 获取微信登录 code
				const loginRes = await new Promise((resolve, reject) => {
					uni.login({
						provider: 'weixin',
						success: resolve,
						fail: reject
					})
				})

				if (!loginRes.code) {
					uni.showToast({
						title: '获取微信登录凭证失败',
						icon: 'none'
					})
					this.loading = false
					return
				}

				// 调用接受邀请接口（通过微信code）
				const response = await api.invitation.acceptByCode(this.inviteCode.trim(), loginRes.code)

				if (response.code === 200 && response.data) {
					// 保存 token 和用户信息
					if (response.data.token) {
						uni.setStorageSync('token', response.data.token)
					}
					if (response.data.userInfo) {
						uni.setStorageSync('userInfo', response.data.userInfo)
					}

					uni.showToast({
						title: '绑定成功',
						icon: 'success'
					})

					// 延迟跳转到我的页面
					setTimeout(() => {
						uni.reLaunch({
							url: '/pages/my/my'
						})
					}, 1500)
				} else {
					this.errorMessage = response.message || '接受邀请失败'
					uni.showToast({
						title: response.message || '接受邀请失败',
						icon: 'none'
					})
				}
			} catch (error) {
				console.error('微信登录并接受邀请失败:', error)
				this.errorMessage = '网络错误，请重试'
				uni.showToast({
					title: '网络错误，请重试',
					icon: 'none'
				})
			} finally {
				this.loading = false
			}
		}
	}
}
</script>

<style scoped>
.accept-invite-page {
	width: 100%;
	min-height: 100vh;
	background-color: #f9f9f9;
}

.topbar {
	width: 100%;
	height: 88rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #ffffff;
	position: relative;
}

.topbar-title {
	font-size: 36rpx;
	font-weight: 500;
	color: #1e2939;
}

.content {
	padding: 60rpx 40rpx;
	display: flex;
	flex-direction: column;
	gap: 40rpx;
}

.invite-info-card {
	background: linear-gradient(135deg, #4a5d50 0%, #6b8e6b 100%);
	border-radius: 24rpx;
	padding: 60rpx 40rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 20rpx;
}

.invite-icon {
	font-size: 80rpx;
}

.invite-title {
	font-size: 36rpx;
	font-weight: 500;
	color: #ffffff;
}

.invite-subtitle {
	font-size: 28rpx;
	color: rgba(255, 255, 255, 0.8);
}

.input-section {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.input-label {
	font-size: 28rpx;
	color: #1e2939;
	font-weight: 500;
}

.invite-code-input {
	width: 100%;
	height: 88rpx;
	background: #ffffff;
	border-radius: 12rpx;
	padding: 0 30rpx;
	font-size: 32rpx;
	color: #1e2939;
	border: 2rpx solid #e5e7eb;
}

.invite-code-input:focus {
	border-color: #4a5d50;
}

.error-message {
	padding: 20rpx;
	background: #fef2f2;
	border-radius: 12rpx;
	border: 2rpx solid #fecaca;
}

.error-text {
	font-size: 26rpx;
	color: #dc2626;
}

.accept-btn {
	width: 100%;
	height: 88rpx;
	background: #4a5d50;
	border-radius: 12rpx;
	border: none;
	display: flex;
	align-items: center;
	justify-content: center;
}

.accept-btn.disabled {
	background: #d1d5db;
}

.accept-btn-text {
	font-size: 32rpx;
	color: #ffffff;
	font-weight: 500;
}

.divider {
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 20rpx 0;
}

.divider::before,
.divider::after {
	content: '';
	flex: 1;
	height: 1rpx;
	background: #e5e7eb;
}

.divider-text {
	font-size: 24rpx;
	color: #999999;
	margin: 0 20rpx;
}

.wechat-login-btn {
	width: 100%;
	height: 88rpx;
	background: #07c160;
	border-radius: 12rpx;
	border: none;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 20rpx;
}

.wechat-icon {
	width: 40rpx;
	height: 40rpx;
}

.wechat-text {
	font-size: 32rpx;
	color: #ffffff;
	font-weight: 500;
}
</style>

