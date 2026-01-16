<template>
	<view class="staff-login-page">
		<!-- 返回按钮 -->
		<view class="back-button" @tap="goBack">
			<image class="back-icon" src="/static/Button.png" mode="aspectFit"></image>
		</view>
		
		<!-- Header -->
		<view class="header">
			<text class="header-title">商家登录</text>
			<text class="header-subtitle">请输入用户名和密码</text>
		</view>

		<!-- Login Form -->
		<view class="form-section">
			<view class="input-group">
				<text class="input-label">用户名</text>
				<input 
					v-model="username" 
					class="input-field" 
					placeholder="请输入用户名"
					@input="onUsernameInput"
				/>
			</view>

			<view class="input-group">
				<text class="input-label">密码</text>
				<input 
					v-model="password" 
					class="input-field" 
					type="password"
					placeholder="请输入密码"
					@input="onPasswordInput"
					@confirm="handleLogin"
				/>
			</view>

			<button class="login-btn" :class="{ disabled: !canLogin }" @tap="handleLogin">
				<text class="login-btn-text">登录</text>
			</button>
		</view>
	</view>
</template>

<script>
import { api } from '@/api/request'

export default {
	data() {
		return {
			username: '',
			password: '',
			loading: false
		}
	},
	computed: {
		canLogin() {
			return this.username.trim().length > 0 && this.password.trim().length > 0 && !this.loading
		}
	},
		methods: {
		goBack() {
			// 返回上一页
			uni.navigateBack({
				delta: 1,
				fail: () => {
					// 如果无法返回，则跳转到登录页面
					uni.redirectTo({
						url: '/pages/login/login'
					})
				}
			})
		},
		onUsernameInput(e) {
			this.username = e.detail.value
		},
		onPasswordInput(e) {
			this.password = e.detail.value
		},
		async handleLogin() {
			if (!this.canLogin) {
				return
			}

			if (!this.username.trim()) {
				uni.showToast({
					title: '请输入用户名',
					icon: 'none'
				})
				return
			}

			if (!this.password.trim()) {
				uni.showToast({
					title: '请输入密码',
					icon: 'none'
				})
				return
			}

			this.loading = true
			uni.showLoading({
				title: '登录中...',
				mask: true
			})

			try {
				const response = await api.staff.login(this.username.trim(), this.password.trim())
				
				if (response.code === 200) {
					// 保存 token
					if (response.data && response.data.token) {
						uni.setStorageSync('token', response.data.token)
					}

					// 保存用户信息
					if (response.data && response.data.userInfo) {
						uni.setStorageSync('userInfo', response.data.userInfo)
					}

					uni.hideLoading()
					uni.showToast({
						title: '登录成功',
						icon: 'success',
						duration: 1500
					})

					// 跳转到商家核销页面
					setTimeout(() => {
						uni.reLaunch({
							url: '/pages/staff/verify'
						})
					}, 1500)
				} else {
					uni.hideLoading()
					uni.showToast({
						title: response.message || '登录失败，请检查用户名和密码',
						icon: 'none',
						duration: 2000
					})
				}
			} catch (error) {
				console.error('商家登录错误:', error)
				uni.hideLoading()
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
.staff-login-page {
	min-height: 100vh;
	background: #f9f9f9;
	padding: 120rpx 48rpx 0;
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

.header {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 120rpx;
}

.header-title {
	font-size: 48rpx;
	line-height: 64rpx;
	font-weight: 600;
	color: #1e2939;
	margin-bottom: 24rpx;
}

.header-subtitle {
	font-size: 28rpx;
	line-height: 40rpx;
	color: #999999;
}

.form-section {
	width: 100%;
}

.input-group {
	margin-bottom: 40rpx;
}

.input-label {
	display: block;
	font-size: 28rpx;
	line-height: 40rpx;
	font-weight: 400;
	color: #1e2939;
	margin-bottom: 16rpx;
}

.input-field {
	width: 100%;
	height: 88rpx;
	background: #ffffff;
	border: 2rpx solid #e5e7eb;
	border-radius: 16rpx;
	padding: 0 24rpx;
	font-size: 32rpx;
	line-height: 44rpx;
	color: #1e2939;
	box-sizing: border-box;
}

.input-field:focus {
	border-color: #4a5d50;
}

.login-btn {
	width: 100%;
	height: 96rpx;
	background: #4a5d50;
	border-radius: 9999rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 60rpx;
	border: none;
}

.login-btn.disabled {
	background: #d1d5dc;
	opacity: 0.6;
}

.login-btn-text {
	font-size: 32rpx;
	line-height: 48rpx;
	font-weight: 500;
	color: #ffffff;
}
</style>

