<template>
	<view class="payment-page">
		<!-- Header -->
		<view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="back-btn" @tap="goBack">
				<image class="back-icon" :src="icons.back" mode="aspectFit"></image>
			</view>
			<text class="header-title">确认订单</text>
		</view>

		<!-- Content -->
		<scroll-view class="content-scroll" scroll-y="true">
			<view class="content">
				<!-- Product Card -->
				<view class="product-card">
					<view class="card-header">
						<view class="premium-tag">
							<image class="star-icon" :src="icons.star" mode="aspectFit"></image>
							<text class="premium-text">PREMIUM WELLNESS</text>
						</view>
						<view class="crown-icon-wrapper">
							<image class="crown-icon" :src="icons.crown" mode="aspectFit"></image>
						</view>
					</view>
					<view class="card-content">
						<text class="product-name">{{ packageName }}</text>
						<view class="product-tagline">
							<view class="divider"></view>
							<text class="tagline-text">纯净富氧 · 深度焕活</text>
						</view>
					</view>
					<view class="card-footer">
						<view class="price-section">
							<text class="price-label">Total Price</text>
							<view class="price-value">
								<text class="currency">¥</text>
								<text class="amount">{{ priceInteger }}</text>
								<text class="decimal">{{ priceDecimal }}</text>
							</view>
						</view>
						<view class="validity-badge">
							<text class="validity-text">有效期{{ validDays }}天</text>
						</view>
					</view>
				</view>

				<!-- Tags -->
				<view class="tags-row">
					<text class="tag">WELLNESS</text>
					<text class="tag">NATURE</text>
					<text class="tag">SERENITY</text>
				</view>

				<!-- Purchase Details -->
				<view class="details-section">
					<text class="section-title">购买详情</text>
					<view class="details-card">
						<view class="detail-row">
							<text class="detail-label">商品名称</text>
							<text class="detail-value">富氧太空舱 · {{ packageName }}</text>
						</view>
						<view class="detail-divider"></view>
						<view class="detail-row">
							<text class="detail-label">服务门店</text>
							<text class="detail-value">城市森林旗舰店</text>
						</view>
						<view class="detail-divider"></view>
						<view class="detail-row">
							<text class="detail-label">交易类型</text>
							<text class="detail-value">{{ transactionTypeText }}</text>
						</view>
						<view class="detail-divider"></view>
						<picker mode="date" :value="cardStartDate" :start="minDate" :end="maxDate" @change="onDateChange">
							<view class="detail-row detail-row-selectable">
								<text class="detail-label">卡开始日期</text>
								<view class="detail-value-wrapper">
									<text class="detail-value">{{ cardStartDate || '请选择' }}</text>
									<text class="detail-arrow">›</text>
								</view>
							</view>
						</picker>
						<view class="detail-divider"></view>
						<view class="detail-row">
							<text class="detail-label">卡到期日期</text>
							<text class="detail-value">{{ cardEndDate }}</text>
						</view>
						<view class="detail-divider"></view>
						<view class="detail-row">
							<text class="detail-label">总计金额</text>
							<text class="detail-value">¥{{ formattedPrice }}</text>
						</view>
					</view>
				</view>

				<!-- Payment Method -->
				<view class="payment-section">
					<text class="section-title">支付方式</text>
					<view class="payment-card">
						<view class="payment-option">
							<view class="payment-icon-wrapper">
								<image class="payment-icon" :src="icons.wechat" mode="aspectFit"></image>
							</view>
							<view class="payment-info">
								<text class="payment-name">微信支付</text>
								<text class="payment-desc">推荐微信用户使用</text>
							</view>
						</view>
						<view class="payment-check">
							<image class="check-icon" :src="icons.check" mode="aspectFit"></image>
						</view>
					</view>
					<view class="security-info">
						<image class="lock-icon" :src="icons.lock" mode="aspectFit"></image>
						<text class="security-text">加密支付，保障您的资金安全</text>
					</view>
				</view>
			</view>
		</scroll-view>

		<!-- Bottom Bar -->
		<view class="bottom-bar">
			<view class="total-section">
				<text class="total-label">Total</text>
				<view class="total-price">
					<text class="total-currency">¥</text>
					<text class="total-amount">{{ priceInteger }}</text>
				</view>
			</view>
			<view class="pay-btn" @tap="handlePay">
				<text class="pay-btn-text">立即支付</text>
			</view>
		</view>
	</view>
</template>

<script>
import { api } from '@/api/request'

export default {
	data() {
		return {
			packageId: '',
			packageName: '月卡',
			price: 3980,
			originalPrice: 0,
			validDays: 30,
			statusBarHeight: 0,
			cardStartDate: '',
			cardEndDate: '',
			transactionType: 'NEW', // NEW-新开卡, RENEW-续费
			orderId: null,
			icons: {
				back: 'https://www.figma.com/api/mcp/asset/6e0ab730-69c1-4a8c-9c93-837acebcbedd',
				star: 'https://www.figma.com/api/mcp/asset/d8a75e34-91f3-4668-9f68-1aa515439cc8',
				crown: 'https://www.figma.com/api/mcp/asset/686b2997-9764-4723-80b4-7f7a49675a6d',
				wechat: 'https://www.figma.com/api/mcp/asset/bcdd9994-4ce4-418e-b4e5-497ae718d29f',
				check: 'https://www.figma.com/api/mcp/asset/f7c2725a-2c81-453a-aa24-4a8d4b469eb9',
				lock: 'https://www.figma.com/api/mcp/asset/59233441-a25d-483d-9319-e6e37b0927dd'
			}
		}
	},
	async onLoad(options) {
		// 获取状态栏高度
		const systemInfo = uni.getSystemInfoSync()
		this.statusBarHeight = systemInfo.statusBarHeight || 0
		
		// 接收从会员商城页面传递的参数
		if (options.packageId) {
			this.packageId = options.packageId
		}
		if (options.packageName) {
			this.packageName = decodeURIComponent(options.packageName)
		}
		if (options.price) {
			// 会员商城页面传递的价格已经是元为单位，直接使用
			this.price = parseFloat(options.price)
		}
		if (options.originalPrice) {
			// 会员商城页面传递的原价已经是元为单位，直接使用
			this.originalPrice = parseFloat(options.originalPrice)
		}
		if (options.validDays) {
			// 接收有效期天数
			this.validDays = parseInt(options.validDays)
		}
		
		// 预计算卡开始日期、到期日期和交易类型
		await this.calculateCardDates()
	},
	computed: {
		formattedPrice() {
			return this.price.toFixed(2)
		},
		priceInteger() {
			return Math.floor(this.price)
		},
		priceDecimal() {
			return (this.price % 1).toFixed(2).substring(1)
		},
		transactionTypeText() {
			return this.transactionType === 'RENEW' ? '续费' : '新开卡'
		},
		// 最小日期（今天）
		minDate() {
			const today = new Date()
			return this.formatDateForPicker(today)
		},
		// 最大日期（一年后）
		maxDate() {
			const today = new Date()
			const maxDate = new Date(today)
			maxDate.setFullYear(today.getFullYear() + 1)
			return this.formatDateForPicker(maxDate)
		}
	},
		methods: {
		// 日期选择器变化事件
		onDateChange(e) {
			const selectedDate = e.detail.value
			this.cardStartDate = selectedDate
			// 根据选择的开始日期计算到期日期
			this.calculateEndDate(selectedDate)
			// 根据选择的日期判断交易类型
			this.updateTransactionType(selectedDate)
		},
		// 根据开始日期计算到期日期
		calculateEndDate(startDateStr) {
			if (!startDateStr) return
			const startDate = new Date(startDateStr)
			const endDate = new Date(startDate.getTime() + this.validDays * 24 * 60 * 60 * 1000)
			this.cardEndDate = this.formatDate(endDate)
		},
		// 根据选择的日期更新交易类型
		async updateTransactionType(selectedDateStr) {
			const token = uni.getStorageSync('token')
			if (!token) {
				// 未登录时，默认为新开卡
				this.transactionType = 'NEW'
				return
			}
			
			try {
				// 检查是否有已支付的购卡记录
				const ordersResponse = await api.payment.getOrders()
				const hasPaidOrders = ordersResponse.code === 200 && 
					ordersResponse.data && 
					ordersResponse.data.some(order => order.status === 'paid')
				
				// 简化逻辑：有已支付的购卡记录就是续费，没有就是新开卡
				if (hasPaidOrders) {
					this.transactionType = 'RENEW'
					console.log('判断为续费：用户有已支付的购卡记录')
				} else {
					this.transactionType = 'NEW'
					console.log('判断为新开卡：用户没有已支付的购卡记录')
				}
			} catch (error) {
				console.error('获取购卡记录失败:', error)
				// 获取失败，默认为新开卡
				this.transactionType = 'NEW'
			}
		},
		// 格式化日期为picker格式：YYYY-MM-DD
		formatDateForPicker(date) {
			if (!date) return ''
			const d = date instanceof Date ? date : new Date(date)
			const year = d.getFullYear()
			const month = String(d.getMonth() + 1).padStart(2, '0')
			const day = String(d.getDate()).padStart(2, '0')
			return `${year}-${month}-${day}`
		},
		// 预计算卡开始日期、到期日期和交易类型（初始化默认值）
		async calculateCardDates() {
			const token = uni.getStorageSync('token')
			if (!token) {
				// 未登录时，默认为新开卡，从当前时间开始
				const now = new Date()
				this.cardStartDate = this.formatDateForPicker(now)
				this.calculateEndDate(this.cardStartDate)
				this.transactionType = 'NEW'
				return
			}
			
			try {
				// 先检查是否有已支付的购卡记录
				const ordersResponse = await api.payment.getOrders()
				const hasPaidOrders = ordersResponse.code === 200 && 
					ordersResponse.data && 
					ordersResponse.data.some(order => order.status === 'paid')
				
				// 简化逻辑：有已支付的购卡记录就是续费，没有就是新开卡
				if (hasPaidOrders) {
					// 有已支付的购卡记录，判断为续费
					this.transactionType = 'RENEW'
					
					// 获取用户信息，获取会员到期时间作为默认开始日期
					try {
						const userResponse = await api.user.getInfo()
						if (userResponse.code === 200 && userResponse.data && userResponse.data.memberExpireTime) {
							const expireTime = new Date(userResponse.data.memberExpireTime)
							const now = new Date()
							// 如果会员未过期，从会员到期时间开始；如果已过期，从今天开始
							if (expireTime > now) {
								this.cardStartDate = this.formatDateForPicker(expireTime)
							} else {
								this.cardStartDate = this.formatDateForPicker(now)
							}
						} else {
							// 没有会员到期时间，从今天开始
							const now = new Date()
							this.cardStartDate = this.formatDateForPicker(now)
						}
					} catch (error) {
						// 获取用户信息失败，从今天开始
						const now = new Date()
						this.cardStartDate = this.formatDateForPicker(now)
					}
					this.calculateEndDate(this.cardStartDate)
				} else {
					// 没有已支付的购卡记录，判断为新开卡，从今天开始
					const now = new Date()
					this.cardStartDate = this.formatDateForPicker(now)
					this.calculateEndDate(this.cardStartDate)
					this.transactionType = 'NEW'
				}
			} catch (error) {
				console.error('获取购卡记录失败:', error)
				// 获取失败，默认为新开卡
				const now = new Date()
				this.cardStartDate = this.formatDateForPicker(now)
				this.calculateEndDate(this.cardStartDate)
				this.transactionType = 'NEW'
			}
		},
		// 格式化日期：2026-01-10
		formatDate(date) {
			if (!date) return ''
			const d = date instanceof Date ? date : new Date(date)
			const year = d.getFullYear()
			const month = String(d.getMonth() + 1).padStart(2, '0')
			const day = String(d.getDate()).padStart(2, '0')
			return `${year}-${month}-${day}`
		},
		goBack() {
			uni.navigateBack()
		},
		async handleMockPaymentSuccess() {
			// Mock模式下模拟支付成功
			uni.showLoading({
				title: '模拟支付中...',
				mask: true
			})
			
			try {
				// 获取订单ID
				const orderId = this.orderId
				
				if (!orderId) {
					uni.hideLoading()
					uni.showToast({
						title: '订单信息缺失',
						icon: 'none'
					})
					return
				}
				
				// 调用后端接口更新订单状态为已支付
				const response = await api.payment.mockPaymentSuccess(orderId)
				
				if (response.code === 200) {
					uni.hideLoading()
					uni.showToast({
						title: '支付成功（Mock模式）',
						icon: 'success',
						duration: 2000
					})
					
					// 跳转到我的页面
					setTimeout(() => {
						uni.reLaunch({
							url: '/pages/my/my'
						})
					}, 2000)
				} else {
					uni.hideLoading()
					uni.showToast({
						title: response.message || '模拟支付失败',
						icon: 'none'
					})
				}
				
			} catch (error) {
				uni.hideLoading()
				uni.showToast({
					title: '模拟支付失败',
					icon: 'none'
				})
				console.error('模拟支付失败:', error)
			}
		},
		async handlePay() {
			// 检查是否登录
			const token = uni.getStorageSync('token')
			if (!token) {
				uni.showToast({
					title: '请先登录',
					icon: 'none',
					duration: 2000
				})
				setTimeout(() => {
					uni.navigateTo({
						url: '/pages/login/login'
					})
				}, 2000)
				return
			}

			// 检查套餐信息
			if (!this.packageId) {
				uni.showToast({
					title: '套餐信息错误',
					icon: 'none'
				})
				return
			}

			uni.showLoading({
				title: '正在支付...',
				mask: true
			})

			// 检查是否选择了卡开始日期
			if (!this.cardStartDate) {
				uni.showToast({
					title: '请选择卡开始日期',
					icon: 'none'
				})
				return
			}
			
			try {
				// 步骤1: 创建支付订单（传递用户选择的卡开始日期）
				const orderResponse = await api.payment.createPackageOrder(this.packageId, this.price, this.cardStartDate)
				
				if (orderResponse.code !== 200) {
					throw new Error(orderResponse.message || '创建订单失败')
				}

				const orderId = orderResponse.data.orderId || orderResponse.data.id
				if (!orderId) {
					throw new Error('订单创建失败，未返回订单ID')
				}
				
				// 保存订单ID，用于mock支付成功
				this.orderId = orderId
				
				// 更新卡开始日期、到期日期和交易类型（如果后端返回了这些字段）
				if (orderResponse.data.cardStartDate) {
					this.cardStartDate = this.formatDateForPicker(new Date(orderResponse.data.cardStartDate))
				}
				if (orderResponse.data.cardEndDate) {
					this.cardEndDate = this.formatDate(new Date(orderResponse.data.cardEndDate))
				}
				if (orderResponse.data.transactionType) {
					this.transactionType = orderResponse.data.transactionType
				}

				// 步骤2: 获取微信支付参数
				const payResponse = await api.payment.getWechatPayParams(orderId)
				
				if (payResponse.code !== 200) {
					throw new Error(payResponse.message || '获取支付参数失败')
				}

				const payParams = payResponse.data
				
				// 步骤3: 调起微信支付
				uni.requestPayment({
					provider: 'wxpay',
					timeStamp: payParams.timeStamp,
					nonceStr: payParams.nonceStr,
					package: payParams.package,
					signType: payParams.signType || 'RSA',
					paySign: payParams.paySign,
					success: (res) => {
						console.log('支付成功:', res)
						uni.hideLoading()
						uni.showToast({
							title: '支付成功',
							icon: 'success',
							duration: 2000
						})
						
						// 支付成功后跳转到订单页面或首页
						setTimeout(() => {
							uni.reLaunch({
								url: '/pages/my/my'
							})
						}, 2000)
					},
					fail: (err) => {
						console.error('支付失败:', err)
						uni.hideLoading()
						
						let errorMsg = '支付失败'
						if (err.errMsg) {
							if (err.errMsg.includes('cancel')) {
								errorMsg = '支付已取消'
							} else if (err.errMsg.includes('fail')) {
								errorMsg = '支付失败，请重试'
							} else {
								errorMsg = err.errMsg
							}
						}
						
						// 检查是否是mock模式（通过检查prepay_id是否包含MOCK）
						const isMockMode = payParams.package && payParams.package.includes('MOCK_PREPAY_ID')
						
						if (isMockMode) {
							// Mock模式下，提供模拟支付成功的选项
							uni.showModal({
								title: 'Mock模式提示',
								content: '当前为Mock模式，真实支付会失败。是否模拟支付成功？',
								confirmText: '模拟成功',
								cancelText: '取消',
								success: (modalRes) => {
									if (modalRes.confirm) {
										// 模拟支付成功
										this.handleMockPaymentSuccess()
									} else {
										uni.showToast({
											title: '支付已取消',
											icon: 'none',
											duration: 2000
										})
									}
								}
							})
						} else {
							uni.showToast({
								title: errorMsg,
								icon: 'none',
								duration: 2000
							})
						}
					}
				})
			} catch (error) {
				console.error('支付流程错误:', error)
				uni.hideLoading()
				
				let errorMsg = '支付失败，请重试'
				if (error.message) {
					errorMsg = error.message
				} else if (error.errMsg) {
					errorMsg = error.errMsg
				}
				
				uni.showToast({
					title: errorMsg,
					icon: 'none',
					duration: 2000
				})
			}
		}
	}
}
</script>

<style scoped>
.payment-page {
	width: 100%;
	min-height: 100vh;
	background-color: #f7f8fa;
	display: flex;
	flex-direction: column;
    padding-top: 27px; /* 添加这行，根据实际情况调整数值，单位可以是 px 或 rpx */
}

.header {
	width: 100%;
	min-height: 144rpx;
	padding-top: 0;
	padding-bottom: 32rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
	background-color: #f9f9f7;
	box-sizing: border-box;
}

.back-btn {
	position: absolute;
	left: 32rpx;
	width: 80rpx;
	height: 80rpx;
	background-color: rgba(0, 0, 0, 0.05);
	border-radius: 9999rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	top: 50%;
	transform: translateY(-50%);
}

.back-icon {
	width: 48rpx;
	height: 48rpx;
}

.header-title {
	font-family: 'Inter', 'Noto Sans SC', 'Noto Sans JP', sans-serif;
	font-weight: 500;
	font-size: 36rpx;
	line-height: 56rpx;
	color: #1a1c1a;
	letter-spacing: -0.88rpx;
}

.content-scroll {
	flex: 1;
	width: 100%;
}

.content {
	padding: 32rpx 48rpx 200rpx;
	display: flex;
	flex-direction: column;
	gap: 48rpx;
}

/* Product Card */
.product-card {
	background-color: #1a1c1a;
	border-radius: 64rpx;
	padding: 32rpx 48rpx;
	box-shadow: 0 25rpx 50rpx -12rpx rgba(26, 28, 26, 0.2);
}

.card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16rpx;
}

.premium-tag {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.star-icon {
	width: 40rpx;
	height: 40rpx;
}

.premium-text {
	font-family: 'Inter', sans-serif;
	font-weight: 500;
	font-size: 24rpx;
	line-height: 32rpx;
	color: #c4a373;
	letter-spacing: 2.4rpx;
	text-transform: uppercase;
}

.crown-icon-wrapper {
	width: 80rpx;
	height: 80rpx;
	border: 2rpx solid rgba(196, 163, 115, 0.3);
	border-radius: 9999rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.crown-icon {
	width: 40rpx;
	height: 40rpx;
}

.card-content {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
	margin-bottom: 32rpx;
}

.product-name {
	font-family: 'Inter', 'Noto Sans JP', sans-serif;
	font-weight: 300;
	font-size: 60rpx;
	line-height: 72rpx;
	color: #ffffff;
	letter-spacing: 2.29rpx;
}

.product-tagline {
	display: flex;
	align-items: center;
	gap: 32rpx;
}

.divider {
	width: 64rpx;
	height: 2rpx;
	background-color: rgba(196, 163, 115, 0.3);
}

.tagline-text {
	font-family: 'Inter', 'Noto Sans SC', 'Noto Sans JP', sans-serif;
	font-weight: 300;
	font-size: 24rpx;
	line-height: 32rpx;
	color: rgba(196, 163, 115, 0.6);
	letter-spacing: 1.2rpx;
}

.card-footer {
	display: flex;
	justify-content: space-between;
	align-items: flex-end;
}

.price-section {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.price-label {
	font-family: 'Inter', sans-serif;
	font-weight: normal;
	font-size: 20rpx;
	line-height: 30rpx;
	color: rgba(196, 163, 115, 0.4);
	letter-spacing: 1.23rpx;
	text-transform: uppercase;
}

.price-value {
	display: flex;
	align-items: baseline;
}

.currency {
	font-family: 'Inter', sans-serif;
	font-weight: 300;
	font-size: 36rpx;
	line-height: 56rpx;
	color: #c4a373;
	letter-spacing: -0.88rpx;
	margin-right: 4rpx;
}

.amount {
	font-family: 'Inter', sans-serif;
	font-weight: 300;
	font-size: 72rpx;
	line-height: 80rpx;
	color: #c4a373;
	letter-spacing: -1.06rpx;
}

.decimal {
	font-family: 'Inter', sans-serif;
	font-weight: 300;
	font-size: 28rpx;
	line-height: 40rpx;
	color: #c4a373;
	opacity: 0.6;
	letter-spacing: -0.3rpx;
}

.validity-badge {
	background-color: rgba(196, 163, 115, 0.05);
	border: 2rpx solid rgba(196, 163, 115, 0.2);
	border-radius: 9999rpx;
	padding: 27rpx 34rpx;
	height: 76rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.validity-text {
	font-family: 'Inter', 'Noto Sans JP', sans-serif;
	font-weight: 300;
	font-size: 24rpx;
	line-height: 32rpx;
	color: #c4a373;
	letter-spacing: 0.6rpx;
}

/* Tags */
.tags-row {
	display: flex;
	justify-content: center;
	gap: 64rpx;
}

.tag {
	font-family: 'Inter', sans-serif;
	font-weight: 500;
	font-size: 20rpx;
	line-height: 30rpx;
	color: rgba(74, 93, 80, 0.4);
	letter-spacing: 4.23rpx;
}

/* Details Section */
.details-section {
	display: flex;
	flex-direction: column;
	gap: 32rpx;
}

.section-title {
	font-family: 'Inter', 'Noto Sans SC', 'Noto Sans JP', sans-serif;
	font-weight: 500;
	font-size: 28rpx;
	line-height: 40rpx;
	color: #1a1c1a;
	letter-spacing: -0.3rpx;
	padding-left: 8rpx;
}

.details-card {
	background-color: #ffffff;
	border-radius: 48rpx;
	padding: 48rpx;
	box-shadow: 0 2rpx 6rpx 0 rgba(0, 0, 0, 0.1), 0 2rpx 4rpx -2rpx rgba(0, 0, 0, 0.1);
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

.detail-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: 40rpx;
}

.detail-label {
	font-family: 'Inter', 'Noto Sans SC', 'Noto Sans JP', sans-serif;
	font-weight: normal;
	font-size: 28rpx;
	line-height: 40rpx;
	color: rgba(74, 93, 80, 0.6);
	letter-spacing: -0.3rpx;
}

.detail-value {
	font-family: 'Inter', 'Noto Sans SC', 'Noto Sans JP', sans-serif;
	font-weight: 500;
	font-size: 28rpx;
	line-height: 40rpx;
	color: #1a1c1a;
	letter-spacing: -0.3rpx;
}

.detail-row-selectable {
	cursor: pointer;
	position: relative;
}

/* picker组件样式 */
picker {
	width: 100%;
	display: block;
}

.detail-value-wrapper {
	display: flex;
	align-items: center;
	gap: 16rpx;
	flex: 1;
	justify-content: flex-end;
}

.detail-arrow {
	font-size: 32rpx;
	color: rgba(74, 93, 80, 0.4);
	line-height: 40rpx;
}

.detail-divider {
	height: 2rpx;
	background-color: #f3f4f6;
}

/* Payment Section */
.payment-section {
	display: flex;
	flex-direction: column;
	gap: 32rpx;
}

.payment-card {
	background-color: #ffffff;
	border-radius: 48rpx;
	padding: 32rpx;
	box-shadow: 0 2rpx 6rpx 0 rgba(0, 0, 0, 0.1), 0 2rpx 4rpx -2rpx rgba(0, 0, 0, 0.1);
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.payment-option {
	display: flex;
	align-items: center;
	gap: 24rpx;
	flex: 1;
}

.payment-icon-wrapper {
	width: 80rpx;
	height: 80rpx;
	background-color: #f2faf4;
	border-radius: 9999rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.payment-icon {
	width: 48rpx;
	height: 48rpx;
}

.payment-info {
	display: flex;
	flex-direction: column;
	gap: 4rpx;
	flex: 1;
}

.payment-name {
	font-family: 'Inter', 'Noto Sans JP', sans-serif;
	font-weight: 500;
	font-size: 28rpx;
	line-height: 40rpx;
	color: #1a1c1a;
	letter-spacing: -0.3rpx;
}

.payment-desc {
	font-family: 'Inter', 'Noto Sans SC', 'Noto Sans JP', sans-serif;
	font-weight: normal;
	font-size: 24rpx;
	line-height: 32rpx;
	color: rgba(74, 93, 80, 0.4);
}

.payment-check {
	width: 48rpx;
	height: 48rpx;
	background-color: #4a5d50;
	border-radius: 9999rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.check-icon {
	width: 28rpx;
	height: 28rpx;
}

.security-info {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
}

.lock-icon {
	width: 24rpx;
	height: 24rpx;
}

.security-text {
	font-family: 'Inter', 'Noto Sans SC', 'Noto Sans JP', sans-serif;
	font-weight: normal;
	font-size: 20rpx;
	line-height: 30rpx;
	color: rgba(74, 93, 80, 0.3);
	letter-spacing: 0.23rpx;
}

/* Bottom Bar */
.bottom-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: #ffffff;
	border-top: 2rpx solid #f0f0f0;
	padding: 2rpx 48rpx 2rpx 66rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: 126rpx;
	box-shadow: 0 -20rpx 25rpx -5rpx rgba(74, 93, 80, 0.1), 0 -8rpx 10rpx -6rpx rgba(74, 93, 80, 0.1);
	z-index: 100;
}

.total-section {
	display: flex;
	flex-direction: column;
	gap: 4rpx;
}

.total-label {
	font-family: 'Inter', sans-serif;
	font-weight: 500;
	font-size: 20rpx;
	line-height: 30rpx;
	color: rgba(74, 93, 80, 0.4);
	letter-spacing: 1.23rpx;
	text-transform: uppercase;
}

.total-price {
	display: flex;
	align-items: baseline;
}

.total-currency {
	font-family: 'Inter', sans-serif;
	font-weight: normal;
	font-size: 28rpx;
	line-height: 40rpx;
	color: #1a1c1a;
	letter-spacing: -0.3rpx;
	margin-right: 4rpx;
}

.total-amount {
	font-family: 'Inter', sans-serif;
	font-weight: 500;
	font-size: 40rpx;
	line-height: 56rpx;
	color: #1a1c1a;
	letter-spacing: -1.9rpx;
}

.pay-btn {
	background-color: #4a5d50;
	border-radius: 9999rpx;
	width: 240rpx;
	height: 88rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 10rpx 15rpx -3rpx rgba(74, 93, 80, 0.2), 0 4rpx 6rpx -4rpx rgba(74, 93, 80, 0.2);
}

.pay-btn-text {
	font-family: 'Inter', 'Noto Sans SC', 'Noto Sans JP', sans-serif;
	font-weight: 500;
	font-size: 28rpx;
	line-height: 40rpx;
	color: #ffffff;
	letter-spacing: -0.3rpx;
}
</style>

