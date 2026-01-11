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
					<text class="price-value">¥398</text>
					<text class="price-original">¥598</text>
				</view>
			</view>
			<view class="summary-btn" :class="{ disabled: !isComplete }">
				<text class="summary-btn-text">支付并预约</text>
			</view>
		</view>

		<!-- Bottom Navigation -->
		<BottomNav :current="2"></BottomNav>
	</view>
</template>

<script>
import BottomNav from '@/components/BottomNav.vue'

export default {
	components: {
		BottomNav
	},
	data() {
		return {
			selectedDate: 0,
			selectedTime: -1,
			selectedSeat: '',
			dates: [
				{ number: '01.07', weekday: '周三GMT+8' },
				{ number: '01.08', weekday: '周四GMT+8' },
				{ number: '01.09', weekday: '周五GMT+8' },
				{ number: '01.10', weekday: '周六GMT+8' },
				{ number: '01.11', weekday: '周日GMT+8' },
				{ number: '01.12', weekday: '周一GMT+8' },
				{ number: '01.13', weekday: '周二GMT+8' }
			],
			timeSlots: [
				'10:00–11:00', '11:15–12:15', '12:30–13:30',
				'13:45–14:45', '15:00–16:00', '16:15–17:15',
				'17:30–18:30', '18:45–19:45', '20:00–21:00'
			],
			cabins: [
				{ name: '1号舱', seats: ['A座', 'B座'] },
				{ name: '2号舱', seats: ['A座', 'B座'] }
			]
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
	methods: {
		selectDate(index) {
			this.selectedDate = index
		},
		selectTime(index) {
			this.selectedTime = index === this.selectedTime ? -1 : index
		},
		selectSeat(cabinIndex, seatIndex) {
			const seatKey = `${cabinIndex}-${seatIndex}`
			this.selectedSeat = this.selectedSeat === seatKey ? '' : seatKey
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
