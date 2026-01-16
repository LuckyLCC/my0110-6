<template>
	<view class="verify-page">
		<!-- Header -->
		<view class="header">
			<text class="header-title">扫码核销</text>
		</view>

		<!-- 扫描区域 -->
		<view class="scan-section">
			<view class="scan-card">
				<view class="scan-icon-container">
					<text class="scan-icon">📷</text>
				</view>
				<button class="scan-btn" @tap="scanQRCode">
					<text class="scan-btn-text">扫描二维码</text>
				</button>
			</view>

			<view class="divider">
				<view class="divider-line"></view>
				<text class="divider-text">或</text>
				<view class="divider-line"></view>
			</view>

			<!-- 手动输入区域 -->
			<view class="input-section">
				<view class="input-label">
					<text class="label-text">手动输入订单号</text>
				</view>
				<input 
					v-model="orderNoInput" 
					class="order-no-input" 
					placeholder="请输入订单号"
					@confirm="verifyByOrderNo"
				/>
				<button class="verify-btn" @tap="verifyByOrderNo">
					<text class="verify-btn-text">核销</text>
				</button>
			</view>
		</view>

		<!-- 结果显示区域 -->
		<view v-if="verifyResult" class="result-section">
			<view class="result-card" :class="resultCardClass">
				<text class="result-icon">{{ resultIcon }}</text>
				<text class="result-text">{{ verifyResult }}</text>
				<text v-if="orderInfo" class="result-info">{{ orderInfo }}</text>
			</view>
		</view>
	</view>
</template>

<script>
import { api } from '@/api/request'

export default {
	data() {
		return {
			orderNoInput: '',
			verifyResult: '',
			orderInfo: '',
			isSuccess: false
		}
	},
	computed: {
		resultCardClass() {
			return this.isSuccess ? 'result-success' : 'result-error'
		},
		resultIcon() {
			return this.isSuccess ? '✓' : '✗'
		}
	},
	methods: {
		// 扫描二维码
		scanQRCode() {
			uni.scanCode({
				onlyFromCamera: false, // 允许从相册选择
				scanType: ['qrCode', 'barCode'], // 支持二维码和条形码
				success: (res) => {
					console.log('扫描结果:', res)
					const orderNo = res.result.trim()
					if (orderNo) {
						this.verifyByOrderNo(orderNo)
					} else {
						uni.showToast({
							title: '未识别到订单号',
							icon: 'none'
						})
					}
				},
				fail: (err) => {
					console.error('扫描失败:', err)
					uni.showToast({
						title: '扫描失败，请重试',
						icon: 'none'
					})
				}
			})
		},
		
		// 通过订单号核销
		async verifyByOrderNo(orderNo) {
			if (!orderNo) {
				orderNo = this.orderNoInput.trim()
			}
			
			if (!orderNo) {
				uni.showToast({
					title: '请输入订单号',
					icon: 'none'
				})
				return
			}
			
			// 显示加载中
			uni.showLoading({
				title: '核销中...',
				mask: true
			})
			
			try {
				const token = uni.getStorageSync('token')
				if (!token) {
					uni.hideLoading()
					uni.showModal({
						title: '提示',
						content: '请先登录',
						showCancel: false,
						success: () => {
							uni.navigateTo({
								url: '/pages/login/login'
							})
						}
					})
					return
				}

				const response = await api.booking.verifyByOrderNo(orderNo)
				uni.hideLoading()
				
				if (response.code === 200) {
					this.isSuccess = true
					this.verifyResult = '核销成功！'
					
					// 显示订单信息
					if (response.data) {
						const order = response.data
						this.orderInfo = `${order.date} ${order.timeSlot} ${order.cabinName}-${order.seatName}`
					}
					
					uni.showToast({
						title: '核销成功',
						icon: 'success',
						duration: 2000
					})
					
					// 清空输入框
					this.orderNoInput = ''
					
					// 3秒后清空结果显示
					setTimeout(() => {
						this.verifyResult = ''
						this.orderInfo = ''
					}, 3000)
				} else {
					this.isSuccess = false
					this.verifyResult = response.message || '核销失败'
					this.orderInfo = ''
					
					uni.showToast({
						title: response.message || '核销失败',
						icon: 'none',
						duration: 2000
					})
				}
			} catch (error) {
				uni.hideLoading()
				console.error('核销失败:', error)
				this.isSuccess = false
				this.verifyResult = '网络错误，请重试'
				this.orderInfo = ''
				
				uni.showToast({
					title: '网络错误',
					icon: 'none'
				})
			}
		}
	}
}
</script>

<style scoped>
.verify-page {
	min-height: 100vh;
	background: #f9f9f9;
	padding-bottom: 40rpx;
}

.header {
	padding: 60rpx 40rpx 40rpx;
	background: #ffffff;
}

.header-title {
	font-size: 44rpx;
	line-height: 60rpx;
	font-weight: 600;
	color: #1e2939;
}

.scan-section {
	padding: 40rpx;
}

.scan-card {
	background: #ffffff;
	border-radius: 24rpx;
	padding: 60rpx 40rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.scan-icon-container {
	width: 120rpx;
	height: 120rpx;
	background: #f3f4f6;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 40rpx;
}

.scan-icon {
	font-size: 64rpx;
	line-height: 64rpx;
}

.scan-btn {
	width: 100%;
	height: 88rpx;
	background: #4a5d50;
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border: none;
}

.scan-btn-text {
	font-size: 32rpx;
	line-height: 44rpx;
	font-weight: 500;
	color: #ffffff;
}

.divider {
	display: flex;
	align-items: center;
	margin: 40rpx 0;
	gap: 20rpx;
}

.divider-line {
	flex: 1;
	height: 1rpx;
	background: #e5e7eb;
}

.divider-text {
	font-size: 26rpx;
	line-height: 36rpx;
	color: #999999;
}

.input-section {
	background: #ffffff;
	border-radius: 24rpx;
	padding: 40rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.input-label {
	margin-bottom: 24rpx;
}

.label-text {
	font-size: 28rpx;
	line-height: 40rpx;
	font-weight: 400;
	color: #1e2939;
}

.order-no-input {
	width: 100%;
	height: 88rpx;
	background: #f9fafb;
	border-radius: 16rpx;
	padding: 0 24rpx;
	font-size: 32rpx;
	line-height: 44rpx;
	color: #1e2939;
	margin-bottom: 24rpx;
	border: 2rpx solid #e5e7eb;
}

.order-no-input:focus {
	border-color: #4a5d50;
}

.verify-btn {
	width: 100%;
	height: 88rpx;
	background: #4a5d50;
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border: none;
}

.verify-btn-text {
	font-size: 32rpx;
	line-height: 44rpx;
	font-weight: 500;
	color: #ffffff;
}

.result-section {
	padding: 0 40rpx;
	margin-top: 40rpx;
}

.result-card {
	background: #ffffff;
	border-radius: 24rpx;
	padding: 40rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.result-success {
	border: 2rpx solid #10b981;
}

.result-error {
	border: 2rpx solid #ef4444;
}

.result-icon {
	font-size: 64rpx;
	line-height: 64rpx;
	margin-bottom: 20rpx;
}

.result-success .result-icon {
	color: #10b981;
}

.result-error .result-icon {
	color: #ef4444;
}

.result-text {
	font-size: 32rpx;
	line-height: 44rpx;
	font-weight: 500;
	margin-bottom: 16rpx;
}

.result-success .result-text {
	color: #10b981;
}

.result-error .result-text {
	color: #ef4444;
}

.result-info {
	font-size: 26rpx;
	line-height: 36rpx;
	color: #999999;
	text-align: center;
}
</style>

