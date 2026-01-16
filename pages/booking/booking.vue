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
					:class="{ 
						active: selectedTime === index,
						disabled: isTimeSlotDisabled(index)
					}"
					@tap="selectTime(index)"
				>
					<text class="time-text" :class="{ 'time-text-active': selectedTime === index, 'time-text-disabled': isTimeSlotDisabled(index) }">{{ time }}</text>
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
							:class="{ 
								active: selectedSeat === `${index}-${sIndex}`,
								disabled: isSeatDisabled(index, sIndex)
							}"
							@tap="selectSeat(index, sIndex)"
						>
							<text class="seat-label" :class="{ 
								'seat-label-active': selectedSeat === `${index}-${sIndex}`,
								'seat-label-disabled': isSeatDisabled(index, sIndex)
							}">{{ seat }}</text>
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
			isMember: false, // 是否是会员用户
			bookedSeats: [] // 已预约的舱位列表，格式：['1号舱-A座', '2号舱-B座']
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
		// 检查当前选中的时段是否已过期（如果选择的是今天）
		if (this.selectedTime >= 0 && this.isTimeSlotDisabled(this.selectedTime)) {
			this.selectedTime = -1
		}
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
					
					// 检查是否有生效中的卡（必须使用 cardStatus 字段，不允许使用日期判断）
					const hasActiveCard = paidOrders.some(order => {
						// 必须使用后端返回的 cardStatus 字段，只有"生效中"才认为是生效的
						if (order.cardStatus) {
							const isActive = order.cardStatus === '生效中'
							console.log(`订单 ${order.id} (${order.packageName}): cardStatus = ${order.cardStatus}, 是否生效中: ${isActive}`)
							return isActive
						}
						
						// 如果没有 cardStatus，说明数据异常，不允许预约
						console.log(`订单 ${order.id} (${order.packageName}): cardStatus 为 null 或 undefined，不允许预约`)
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
			// 如果切换日期后，当前选中的时段已过期，清除选择
			if (this.selectedTime >= 0 && this.isTimeSlotDisabled(this.selectedTime)) {
				this.selectedTime = -1
			}
			// 清除已选座位，并重新加载已预约的舱位
			this.selectedSeat = ''
			this.loadBookedSeats()
		},
		selectTime(index) {
			// 检查时段是否已过期
			if (this.isTimeSlotDisabled(index)) {
				uni.showToast({
					title: '该时段已过期，无法选择',
					icon: 'none',
					duration: 2000
				})
				return
			}
			this.selectedTime = index === this.selectedTime ? -1 : index
			// 清除已选座位，并重新加载已预约的舱位
			this.selectedSeat = ''
			this.loadBookedSeats()
		},
		// 检查时段是否已过期
		isTimeSlotDisabled(timeIndex) {
			// 如果选择的不是今天，不需要检查时间
			if (this.selectedDate > 0) {
				return false
			}
			
			// 如果选择的是今天，检查当前时间是否已超过时段的开始时间
			const timeSlot = this.timeSlots[timeIndex]
			if (!timeSlot) {
				return false
			}
			
			// 解析时间段，提取开始时间（例如：'10:00–11:00' -> '10:00'）
			// 支持两种分隔符：长破折号（–）和短横线（-）
			let startTimeStr = timeSlot.split('–')[0]
			if (!startTimeStr || startTimeStr === timeSlot) {
				startTimeStr = timeSlot.split('-')[0]
			}
			
			if (!startTimeStr) {
				return false
			}
			
			// 获取当前时间
			const now = new Date()
			const currentHour = now.getHours()
			const currentMinute = now.getMinutes()
			
			// 解析时段的开始时间
			const timeParts = startTimeStr.split(':')
			if (timeParts.length !== 2) {
				return false
			}
			
			const startHour = parseInt(timeParts[0], 10)
			const startMinute = parseInt(timeParts[1], 10)
			
			if (isNaN(startHour) || isNaN(startMinute)) {
				return false
			}
			
			// 比较时间：如果当前时间 >= 时段开始时间，则已过期
			if (currentHour > startHour) {
				return true // 已过期
			} else if (currentHour === startHour && currentMinute >= startMinute) {
				return true // 已过期
			}
			
			return false // 未过期
		},
		selectSeat(cabinIndex, seatIndex) {
			// 检查座位是否已被预约
			if (this.isSeatDisabled(cabinIndex, seatIndex)) {
				uni.showToast({
					title: '该舱位已被预约，请选择其他舱位',
					icon: 'none',
					duration: 2000
				})
				return
			}
			const seatKey = `${cabinIndex}-${seatIndex}`
			this.selectedSeat = this.selectedSeat === seatKey ? '' : seatKey
		},
		// 检查座位是否已被预约
		isSeatDisabled(cabinIndex, seatIndex) {
			// 如果还没有选择日期或时段，不禁用
			if (this.selectedDate < 0 || this.selectedTime < 0) {
				return false
			}
			
			const cabinName = this.cabins[cabinIndex].name
			const seatName = this.cabins[cabinIndex].seats[seatIndex]
			const seatKey = `${cabinName}-${seatName}`
			
			// 检查该座位是否在已预约列表中
			return this.bookedSeats.includes(seatKey)
		},
		// 加载已预约的舱位列表
		async loadBookedSeats() {
			// 如果还没有选择日期或时段，不加载
			if (this.selectedDate < 0 || this.selectedTime < 0) {
				this.bookedSeats = []
				return
			}
			
			try {
				// 获取完整的日期格式
				const currentDate = new Date()
				currentDate.setDate(currentDate.getDate() + this.selectedDate)
				// 使用本地时间格式化，避免时区问题
				const year = currentDate.getFullYear()
				const month = String(currentDate.getMonth() + 1).padStart(2, '0')
				const day = String(currentDate.getDate()).padStart(2, '0')
				const formattedDate = `${year}-${month}-${day}` // YYYY-MM-DD格式
				const timeSlot = this.timeSlots[this.selectedTime]
				
				const response = await api.booking.getBookedSeats(formattedDate, timeSlot)
				if (response.code === 200 && response.data) {
					this.bookedSeats = response.data || []
					console.log('已预约的舱位列表:', this.bookedSeats)
				} else {
					this.bookedSeats = []
				}
			} catch (error) {
				console.error('获取已预约舱位列表失败:', error)
				this.bookedSeats = []
			}
		},
		async createBooking() {
			if (!this.isComplete) {
				uni.showToast({
					title: '请先选择日期、时段和座位',
					icon: 'none'
				})
				return
			}

			// 在预约前重新检查会员状态，确保状态是最新的
			await this.checkMemberStatus()
			console.log('预约前会员状态检查结果:', this.isMember)

			try {
				// 获取完整的日期格式
				const selectedDateInfo = this.dates[this.selectedDate]
				const currentDate = new Date()
				currentDate.setDate(currentDate.getDate() + this.selectedDate)
				// 使用本地时间格式化，避免时区问题
				const year = currentDate.getFullYear()
				const month = String(currentDate.getMonth() + 1).padStart(2, '0')
				const day = String(currentDate.getDate()).padStart(2, '0')
				const formattedDate = `${year}-${month}-${day}` // YYYY-MM-DD格式

				// 检查用户是否可以预订该日期（每人每天只能预约一次）
				const canBookResponse = await api.booking.canBookToday(formattedDate)
				if (canBookResponse.code === 200 && !canBookResponse.data) {
					uni.showModal({
						title: '提醒',
						content: '您在该日期已经预约过了，每人每天只能预约一次',
						showCancel: false,
						confirmText: '知道了'
					})
					return
				}

				// 获取选中的舱位和座位信息
				const [cabinIndex, seatIndex] = this.selectedSeat.split('-')
				const cabinName = this.cabins[parseInt(cabinIndex)].name
				const seatName = this.cabins[parseInt(cabinIndex)].seats[parseInt(seatIndex)]

				// 显示预约提示信息
				const confirmResult = await new Promise((resolve) => {
					uni.showModal({
						title: '预约须知',
						content: '请在预约开始时间前10分钟到店准备，为避免影响其他顾客我们将于预约开始时间准时关舱，届时不能进入舱体，请取消预约订单并重新预约后续场次',
						showCancel: true,
						confirmText: '我已了解',
						cancelText: '取消',
						success: (res) => {
							resolve(res.confirm)
						},
						fail: () => {
							resolve(false)
						}
					})
				})

				// 如果用户点击取消，不继续预约
				if (!confirmResult) {
					return
				}

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
							icon: 'success',
							duration: 1500
						})
						
						// 跳转到我的页面
						setTimeout(() => {
							try {
								uni.redirectTo({
									url: '/pages/my/my',
									fail: (err) => {
										console.error('跳转失败:', err)
										// 如果 redirectTo 失败，尝试 navigateTo
										uni.navigateTo({
											url: '/pages/my/my',
											fail: () => {
												// 如果都失败，提示用户手动返回
												uni.showToast({
													title: '请手动返回查看订单',
													icon: 'none'
												})
											}
										})
									}
								})
							} catch (error) {
								console.error('跳转异常:', error)
								uni.showToast({
									title: '请手动返回查看订单',
									icon: 'none'
								})
							}
						}, 1500)
					} else {
						// 普通用户需要支付，调用微信支付
						uni.showLoading({
							title: '正在获取支付信息...',
							mask: true
						})
						
						try {
							// 步骤1: 获取微信支付参数
							const payResponse = await api.booking.getWechatPayParams(orderId)
							
							if (payResponse.code !== 200) {
								uni.hideLoading()
								uni.showToast({
									title: payResponse.message || '获取支付信息失败',
									icon: 'none'
								})
								return
							}
							
							const payParams = payResponse.data
							
							// 检查是否是mock模式（通过检查prepay_id是否包含MOCK）
							const isMockMode = payParams.package && payParams.package.includes('MOCK_PREPAY_ID')
							
							// 步骤2: 调起微信支付
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
									
									// 支付成功后跳转到我的页面
									setTimeout(() => {
										try {
											uni.redirectTo({
												url: '/pages/my/my',
												fail: (err) => {
													console.error('跳转失败:', err)
													// 如果 redirectTo 失败，尝试 navigateTo
													uni.navigateTo({
														url: '/pages/my/my',
														fail: () => {
															// 如果都失败，提示用户手动返回
															uni.showToast({
																title: '请手动返回查看订单',
																icon: 'none'
															})
														}
													})
												}
											})
										} catch (error) {
											console.error('跳转异常:', error)
											uni.showToast({
												title: '请手动返回查看订单',
												icon: 'none'
											})
										}
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
									
									if (isMockMode) {
										// Mock模式下，无论什么错误，都提供模拟支付成功的选项
										uni.showModal({
											title: 'Mock模式提示',
											content: '当前为Mock模式，真实支付会失败。是否模拟支付成功？',
											confirmText: '模拟成功',
											cancelText: '取消',
											success: (modalRes) => {
												if (modalRes.confirm) {
													// 模拟支付成功
													this.handleMockBookingPaymentSuccess(orderId)
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
										// 非Mock模式，直接显示错误信息
										uni.showToast({
											title: errorMsg,
											icon: 'none',
											duration: 2000
										})
									}
								}
							})
						} catch (error) {
							console.error('获取支付信息失败:', error)
							uni.hideLoading()
							uni.showToast({
								title: '网络错误，请稍后重试',
								icon: 'none'
							})
						}
					}
				} else {
					// 如果是次卡次数用完的错误，使用弹窗提示
					const errorMessage = response.message || '预约失败'
					if (errorMessage.includes('剩余次数已用完') || errorMessage.includes('续费') || errorMessage.includes('升级')) {
						uni.showModal({
							title: '提示',
							content: errorMessage,
							showCancel: true,
							cancelText: '取消',
							confirmText: '去续费',
							success: (res) => {
								if (res.confirm) {
									// 跳转到商城页面
									uni.navigateTo({
										url: '/pages/store/store'
									})
								}
							}
						})
					} else {
						uni.showToast({
							title: errorMessage,
							icon: 'none',
							duration: 2000
						})
					}
				}
			} catch (error) {
				console.error('创建预约订单失败:', error)
				uni.showToast({
					title: '网络错误，请稍后重试',
					icon: 'none'
				})
			}
		},
		async handleMockBookingPaymentSuccess(orderId) {
			// Mock模式下模拟支付成功
			uni.showLoading({
				title: '模拟支付中...',
				mask: true
			})
			
			try {
				if (!orderId) {
					uni.hideLoading()
					uni.showToast({
						title: '订单信息缺失',
						icon: 'none'
					})
					return
				}
				
				// 调用后端接口更新订单状态为已支付
				const response = await api.booking.mockPaymentSuccess(orderId)
				
				if (response.code === 200) {
					uni.hideLoading()
					uni.showToast({
						title: '支付成功（Mock模式）',
						icon: 'success',
						duration: 2000
					})
					
					// 跳转到我的页面
					setTimeout(() => {
						try {
							uni.redirectTo({
								url: '/pages/my/my',
								fail: (err) => {
									console.error('跳转失败:', err)
									// 如果 redirectTo 失败，尝试 navigateTo
									uni.navigateTo({
										url: '/pages/my/my',
										fail: () => {
											// 如果都失败，提示用户手动返回
											uni.showToast({
												title: '请手动返回查看订单',
												icon: 'none'
											})
										}
									})
								}
							})
						} catch (error) {
							console.error('跳转异常:', error)
							uni.showToast({
								title: '请手动返回查看订单',
								icon: 'none'
							})
						}
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
	color: #999999;
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

.time-item.disabled {
	background-color: #f9fafb;
	border-color: #e5e7eb;
	opacity: 0.5;
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

.time-text-disabled {
	color: #999999;
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

.seat-item.disabled {
	background-color: #f9fafb;
	border-color: #e5e7eb;
	opacity: 0.5;
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

.seat-label-disabled {
	color: #999999;
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
	color: #999999;
	font-size: 24rpx;
	font-weight: 300;
	line-height: 32rpx;
	letter-spacing: 0.6rpx;
}

.summary-details {
	color: #999999;
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
	color: #999999;
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