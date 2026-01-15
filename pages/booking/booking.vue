<template>
	<view class="container">
		<!-- Header -->
		<view class="header">
			<text class="header-title">立即预约</text>
		</view>

		<!-- Date Selection -->
		<view class="date-section">
			<text class="section-label">选择日期</text>
			<scroll-view class="date-scroll" scroll-x="true" show-scrollbar="false">
				<view class="date-list">
					<view 
						class="date-item" 
						v-for="(date, index) in dates" 
						:key="index"
						:class="{ active: selectedDate === index }"
						@tap="selectDate(index)"
					>
						<text class="date-number" :class="{ 'date-number-active': selectedDate === index }">{{ date.number }}</text>
						<text class="date-weekday" :class="{ 'date-weekday-active': selectedDate === index }">{{ date.weekday }}</text>
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- Time Selection -->
		<view class="time-section">
			<text class="section-label">选择时段</text>
			<view class="time-grid">
				<view 
					class="time-item" 
					v-for="(time, index) in timeSlots" 
					:key="index"
					:class="{ active: selectedTime === index }"
					@tap="selectTime(index)"
				>
					<text class="time-text" :class="{ 'time-text-active': selectedTime === index }">{{ time }}</text>
					<view v-if="selectedTime === index" class="time-check">
						<text class="check-icon">✓</text>
					</view>
				</view>
			</view>
		</view>

		<!-- Cabin Selection -->
		<view class="cabin-section">
			<text class="section-label">选择舱位</text>
			<view class="cabin-grid">
				<view 
					class="cabin-item" 
					v-for="(cabin, index) in cabins" 
					:key="index"
				>
					<text class="cabin-title">{{ cabin.name }}</text>
					<view class="seat-row">
						<view 
							class="seat-item" 
							v-for="(seat, sIndex) in cabin.seats" 
							:key="sIndex"
							:class="{ active: selectedSeat === `${index}-${sIndex}` }"
							@tap="selectSeat(index, sIndex)"
						>
							<text class="seat-label" :class="{ 'seat-label-active': selectedSeat === `${index}-${sIndex}` }">{{ seat }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- Summary Bar -->
		<view class="summary-bar">
			<view class="summary-left">
				<text v-if="!isComplete" class="summary-hint">请选择时间和座位</text>
				<text v-else class="summary-details">{{ selectedDateText }} {{ selectedTimeText }} {{ selectedCabinText }}-{{ selectedSeatText }}</text>
			<view class="summary-price">
				<text class="price-label">总计:</text>
				<text class="price-value">¥{{ isMember ? 0 : totalPrice.current }}</text>
				<text v-if="!isMember" class="price-original">¥{{ totalPrice.original }}</text>
			</view>
		</view>
		<view class="summary-btn" :class="{ disabled: !isComplete }" @tap="createBooking">
			<text class="summary-btn-text">{{ isMember ? '立即预约' : '支付并预约' }}</text>
		</view>
		</view>

		<!-- Bottom Navigation -->
		<BottomNav :current="2"></BottomNav>
	</view>
</template>

<script>
import BottomNav from '@/components/BottomNav.vue'
import { api } from '@/api/request'

export default {
	components: {
		BottomNav
	},
	data() {
		return {
			selectedDate: 0,
			selectedTime: -1,
			selectedSeat: '',
			dates: this.generateDates(),
			timeSlots: [
				'10:00–11:00', '11:15–12:15', '12:30–13:30',
				'13:45–14:45', '15:00–16:00', '16:15–17:15',
				'17:30–18:30', '18:45–19:45', '20:00–21:00'
			],
			cabins: [
				{ name: '1号舱', seats: ['A座', 'B座'] },
				{ name: '2号舱', seats: ['A座', 'B座'] }
			],
			totalPrice: {
				current: 398,
				original: 598
			},
			isMember: false // 是否是会员用户
		}
	},
	computed: {
		isComplete() {
			return this.selectedDate >= 0 && this.selectedTime >= 0 && this.selectedSeat !== ''
		},
		selectedDateText() {
			if (this.selectedDate >= 0) {
				return this.dates[this.selectedDate].number.replace('.', '月').replace('.', '日')
			}
			return ''
		},
		selectedTimeText() {
			if (this.selectedTime >= 0) {
				return this.timeSlots[this.selectedTime]
			}
			return ''
		},
		selectedCabinText() {
			if (this.selectedSeat) {
				const [cabinIndex] = this.selectedSeat.split('-')
				return this.cabins[parseInt(cabinIndex)].name
			}
			return ''
		},
		selectedSeatText() {
			if (this.selectedSeat) {
				const [cabinIndex, seatIndex] = this.selectedSeat.split('-')
				return this.cabins[parseInt(cabinIndex)].seats[parseInt(seatIndex)]
			}
			return ''
		}
	},
	onLoad() {
		this.checkMemberStatus()
	},
	onShow() {
		// 页面显示时重新检查会员状态
		this.checkMemberStatus()
	},
	methods: {
		// 检查用户是否是会员（是否有生效中的卡）
		async checkMemberStatus() {
			const token = uni.getStorageSync('token')
			if (!token) {
				this.isMember = false
				console.log('未登录，不是会员')
				return
			}
			
			try {
				const ordersResponse = await api.payment.getOrders()
				console.log('购卡记录响应:', ordersResponse)
				
				if (ordersResponse.code === 200 && ordersResponse.data) {
					// 获取已支付的订单
					const paidOrders = ordersResponse.data.filter(order => order.status === 'paid')
					console.log('已支付的订单:', paidOrders)
					
					// 检查是否有生效中的卡（复用"我的"页面的判断逻辑）
					const now = new Date()
					now.setHours(0, 0, 0, 0)
					
					const hasActiveCard = paidOrders.some(order => {
						// 判断状态：未生效/生效中/已过期（完全复用"我的"页面的判断逻辑）
						if (order.status === 'paid') {
							// 检查卡开始日期
							if (order.cardStartDate) {
								// 解析开始日期，支持多种格式
								let startDateStr = String(order.cardStartDate)
								if (startDateStr.includes('T')) {
									startDateStr = startDateStr.split('T')[0]
								}
								const startDate = new Date(startDateStr)
								startDate.setHours(0, 0, 0, 0)
								
								// 如果当前时间 < 卡开始日期，则为未生效
								if (now < startDate) {
									console.log(`订单 ${order.id}: 未生效（当前时间 < 开始日期）`)
									return false
								} else {
									// 当前时间 >= 卡开始日期，检查是否过期
									if (order.cardEndDate) {
										// 解析到期日期
										let endDateStr = String(order.cardEndDate)
										if (endDateStr.includes('T')) {
											endDateStr = endDateStr.split('T')[0]
										}
										const endDate = new Date(endDateStr)
										endDate.setHours(0, 0, 0, 0)
										
										// 如果当前时间 <= 到期日期，则为生效中；否则为已过期
										if (now <= endDate) {
											console.log(`订单 ${order.id}: 生效中（${startDateStr} <= ${now.toISOString().split('T')[0]} <= ${endDateStr}）`)
											return true
										} else {
											console.log(`订单 ${order.id}: 已过期（当前时间 > 到期日期）`)
											return false
										}
									} else {
										// 没有到期日期，默认为生效中（可能是无限期）
										console.log(`订单 ${order.id}: 生效中（没有到期日期，无限期）`)
										return true
									}
								}
							} else {
								// 没有开始日期，检查到期日期
								if (order.cardEndDate) {
									let endDateStr = String(order.cardEndDate)
									if (endDateStr.includes('T')) {
										endDateStr = endDateStr.split('T')[0]
									}
									const endDate = new Date(endDateStr)
									endDate.setHours(0, 0, 0, 0)
									
									if (now <= endDate) {
										console.log(`订单 ${order.id}: 生效中（当前时间 <= 到期日期）`)
										return true
									} else {
										console.log(`订单 ${order.id}: 已过期（当前时间 > 到期日期）`)
										return false
									}
								} else {
									// 既没有开始日期也没有到期日期，默认为生效中
									console.log(`订单 ${order.id}: 生效中（没有日期信息，无限期）`)
									return true
								}
							}
						}
						return false
					})
					
					this.isMember = hasActiveCard
					console.log('最终会员状态:', this.isMember)
				} else {
					this.isMember = false
					console.log('没有购卡记录或请求失败')
				}
			} catch (error) {
				console.error('检查会员状态失败:', error)
				this.isMember = false
			}
		},
		generateDates() {
			const dates = []
			const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
			const today = new Date()
			
			for (let i = 0; i < 15; i++) {
				const date = new Date(today)
				date.setDate(today.getDate() + i)
				
				const month = String(date.getMonth() + 1).padStart(2, '0')
				const day = String(date.getDate()).padStart(2, '0')
				const weekday = weekdays[date.getDay()]
				
				dates.push({
					number: `${month}.${day}`,
					weekday: weekday
				})
			}
			
			return dates
		},
		selectDate(index) {
			this.selectedDate = index
		},
		selectTime(index) {
			this.selectedTime = index === this.selectedTime ? -1 : index
		},
		selectSeat(cabinIndex, seatIndex) {
			const seatKey = `${cabinIndex}-${seatIndex}`
			this.selectedSeat = this.selectedSeat === seatKey ? '' : seatKey
		},
		async createBooking() {
			if (!this.isComplete) {
				uni.showToast({
					title: '请先选择日期、时段和座位',
					icon: 'none'
				})
				return
			}

			try {
				// 获取完整的日期格式
				const selectedDateInfo = this.dates[this.selectedDate]
				const currentDate = new Date()
				currentDate.setDate(currentDate.getDate() + this.selectedDate)
				const formattedDate = currentDate.toISOString().split('T')[0] // YYYY-MM-DD格式

				// 检查用户是否可以预订当天（每人每天只能消费一次）
				const canBookResponse = await api.booking.canBookToday(formattedDate)
				if (canBookResponse.code === 200 && !canBookResponse.data) {
					uni.showModal({
						title: '提醒',
						content: '您今天已经消费过了，每人每天只能消费一次',
						showCancel: false,
						confirmText: '知道了'
					})
					return
				}

				// 获取选中的舱位和座位信息
				const [cabinIndex, seatIndex] = this.selectedSeat.split('-')
				const cabinName = this.cabins[parseInt(cabinIndex)].name
				const seatName = this.cabins[parseInt(cabinIndex)].seats[parseInt(seatIndex)]

				// 调用后端API创建预约订单
				// 如果是会员，价格为0；否则使用原价
				const finalPrice = this.isMember ? 0 : this.totalPrice.current
				const finalOriginalPrice = this.isMember ? 0 : this.totalPrice.original
				
				const response = await api.booking.create({
					date: formattedDate,
					timeSlot: this.timeSlots[this.selectedTime],
					cabinName: cabinName,
					seatName: seatName,
					price: finalPrice,
					originalPrice: finalOriginalPrice
				})

				if (response.code === 200) {
					const orderId = response.data.id
					
					// 如果是会员（价格为0），直接成功，不需要支付
					if (this.isMember) {
						uni.showToast({
							title: '预约成功',
							icon: 'success'
						})
						
						// 跳转到我的页面
						setTimeout(() => {
							uni.reLaunch({
								url: '/pages/my/my'
							})
						}, 1500)
					} else {
						// 普通用户需要支付
						const payResponse = await api.booking.pay(orderId)
						if (payResponse.code === 200) {
							uni.showToast({
								title: '预约支付成功',
								icon: 'success'
							})
							
							// 跳转回上一页
							setTimeout(() => {
								uni.navigateBack()
							}, 1500)
						} else {
							uni.showToast({
								title: payResponse.message || '支付失败',
								icon: 'none'
							})
						}
					}
				} else {
					uni.showToast({
						title: response.message || '预约失败',
						icon: 'none'
					})
				}
			} catch (error) {
				console.error('创建预约订单失败:', error)
				uni.showToast({
					title: '网络错误，请稍后重试',
					icon: 'none'
				})
			}
		}
	}
}
</script>

<style scoped>
.container {
	width: 100%;
	min-height: 100vh;
	background-color: #f9f9f9;
	padding-bottom: 184rpx;
}

.header {
	width: 100%;
	height: 112rpx;
	background-color: rgba(249, 249, 249, 0.9);
	border-bottom: 2rpx solid #f3f4f6;
	display: flex;
	align-items: center;
	padding: 0 40rpx 34rpx;
}

.header-title {
	color: #333333;
	font-size: 40rpx;
	font-weight: 500;
	line-height: 56rpx;
	letter-spacing: 3.1rpx;
}

.date-section {
	background-color: #ffffff;
	padding: 40rpx;
	box-shadow: 0 2rpx 6rpx 0 rgba(0, 0, 0, 0.1), 0 2rpx 4rpx -2rpx rgba(0, 0, 0, 0.1);
}

.section-label {
	color: #6a7282;
	font-size: 28rpx;
	font-weight: 300;
	line-height: 40rpx;
	letter-spacing: 0.4rpx;
	display: block;
	margin-bottom: 32rpx;
}

.date-scroll {
	width: 100%;
	white-space: nowrap;
}

.date-list {
	display: flex;
	gap: 24rpx;
}

.date-item {
	width: 128rpx;
	height: 128rpx;
	border-radius: 28rpx;
	border: 2rpx solid #f3f4f6;
	background-color: #ffffff;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
	flex-shrink: 0;
}

.date-item.active {
	background-color: #4a5d50;
	border-color: #4a5d50;
	box-shadow: 0 8rpx 12rpx -2rpx rgba(0, 0, 0, 0.1), 0 4rpx 8rpx -4rpx rgba(0, 0, 0, 0.1);
}

.date-number {
	color: #4a5565;
	font-size: 24rpx;
	font-weight: 300;
	line-height: 32rpx;
	opacity: 0.8;
}

.date-number-active {
	color: #ffffff;
}

.date-weekday {
	color: #4a5565;
	font-size: 28rpx;
	font-weight: 500;
	line-height: 40rpx;
	letter-spacing: -0.3rpx;
}

.date-weekday-active {
	color: #ffffff;
}

.time-section {
	padding: 32rpx;
}

.time-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 24rpx 24rpx;
}

.time-item {
	height: 84rpx;
	border-radius: 20rpx;
	border: 2rpx solid #f3f4f6;
	background-color: #ffffff;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
}

.time-item.active {
	background-color: rgba(74, 93, 80, 0.05);
	border-color: #4a5d50;
}

.time-text {
	color: #4a5565;
	font-size: 24rpx;
	font-weight: 300;
	line-height: 32rpx;
	letter-spacing: 1.2rpx;
}

.time-text-active {
	color: #4a5d50;
}

.time-check {
	position: absolute;
	top: 0;
	right: 0;
	width: 24rpx;
	height: 24rpx;
	background-color: #4a5d50;
	border-radius: 0 20rpx 0 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.check-icon {
	color: #ffffff;
	font-size: 16rpx;
}

.cabin-section {
	padding: 0 32rpx;
}

.cabin-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 32rpx;
}

.cabin-item {
	background-color: #ffffff;
	border: 2rpx solid #f3f4f6;
	border-radius: 32rpx;
	padding: 42rpx;
	box-shadow: 0 2rpx 6rpx 0 rgba(0, 0, 0, 0.1), 0 2rpx 4rpx -2rpx rgba(0, 0, 0, 0.1);
}

.cabin-title {
	color: #1e2939;
	font-size: 32rpx;
	font-weight: 500;
	line-height: 48rpx;
	letter-spacing: 0.18rpx;
	display: block;
	padding-bottom: 32rpx;
	border-bottom: 2rpx solid #f9fafb;
	margin-bottom: 32rpx;
	text-align: center;
}

.seat-row {
	display: flex;
	gap: 32rpx;
	justify-content: space-between;
}

.seat-item {
	flex: 1;
	height: 132rpx;
	border-radius: 20rpx;
	border: 2rpx solid rgba(0, 0, 0, 0);
	background-color: #ffffff;
	display: flex;
	align-items: center;
	justify-content: center;
}

.seat-item.active {
	background-color: #4a5d50;
	box-shadow: 0 8rpx 12rpx -2rpx rgba(0, 0, 0, 0.1), 0 4rpx 8rpx -4rpx rgba(0, 0, 0, 0.1);
}

.seat-label {
	color: #0a0a0a;
	font-size: 24rpx;
	font-weight: 300;
	line-height: 32rpx;
}

.seat-label-active {
	color: #ffffff;
}

.summary-bar {
	position: fixed;
	bottom: 184rpx;
	left: 0;
	right: 0;
	background-color: #ffffff;
	border-top: 2rpx solid #f3f4f6;
	padding: 42rpx 40rpx;
	box-shadow: 0 -8rpx 40rpx 0 rgba(0, 0, 0, 0.02);
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.summary-left {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.summary-hint {
	color: #99a1af;
	font-size: 24rpx;
	font-weight: 300;
	line-height: 32rpx;
	letter-spacing: 0.6rpx;
}

.summary-details {
	color: #99a1af;
	font-size: 24rpx;
	font-weight: 300;
	line-height: 32rpx;
	letter-spacing: 0.6rpx;
}

.summary-price {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.price-label {
	color: #101828;
	font-size: 28rpx;
	font-weight: 300;
	line-height: 40rpx;
	letter-spacing: -0.3rpx;
}

.price-value {
	color: #4a5d50;
	font-size: 40rpx;
	font-weight: 600;
	line-height: 56rpx;
	letter-spacing: -1.9rpx;
}

.price-original {
	color: #d1d5dc;
	font-size: 24rpx;
	font-weight: 300;
	line-height: 32rpx;
	text-decoration: line-through;
}

.summary-btn {
	width: 314rpx;
	height: 88rpx;
	background-color: #2c2a26;
	border-radius: 9999rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 20rpx 30rpx -6rpx rgba(44, 42, 38, 0.2), 0 8rpx 12rpx -8rpx rgba(44, 42, 38, 0.2);
}

.summary-btn.disabled {
	opacity: 0.5;
}

.summary-btn-text {
	color: #ffebc8;
	font-size: 28rpx;
	font-weight: 300;
	line-height: 40rpx;
	letter-spacing: 2.5rpx;
}
</style>