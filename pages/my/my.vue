<template>
	<view class="container">
		<!-- Header -->
		<view class="header">
			<text class="header-title">资产中心</text>
			<image class="header-icon" :src="icons.settings" mode="aspectFit"></image>
		</view>

		<!-- User Info -->
		<view class="user-section">
			<image class="user-avatar" :src="userInfo.avatarUrl || images.avatar" mode="aspectFill"></image>
			<view class="user-info">
				<text class="user-name">{{ userInfo.nickname || '微信用户' }}</text>
				<text class="user-phone">{{ formattedPhone || '未绑定手机' }}</text>
			</view>
		</view>

		<!-- Membership Card -->
		<view class="membership-card">
			<view class="membership-header">
				<image class="membership-icon" :src="icons.crown" mode="aspectFit"></image>
				<text class="membership-title">{{ membershipLevel }}</text>
			</view>
			<text class="membership-desc">{{ membershipDesc }}</text>
			<view class="membership-stats">
				<view class="stat-item">
					<text class="stat-value">{{ userInfo.remainingVisits || '-' }}</text>
					<text class="stat-label">剩余次数</text>
				</view>
				<view class="stat-item">
					<text class="stat-value">{{ userInfo.totalVisits || 0 }}</text>
					<text class="stat-label">已体验</text>
				</view>
				<view class="stat-item">
					<text class="stat-value">{{ userInfo.points || 0 }}</text>
					<text class="stat-label">积分余额</text>
				</view>
			</view>
		</view>

		<!-- Orders Section -->
		<view class="orders-section">
			<text class="section-title">预约订单</text>
			<view class="order-tabs">
				<view 
					class="tab-item" 
					:class="{ active: activeTab === 0 }"
					@tap="switchTab(0)"
				>
					<text class="tab-text" :class="{ 'tab-text-active': activeTab === 0 }">全部</text>
					<view v-if="activeTab === 0" class="tab-indicator"></view>
				</view>
				<view 
					class="tab-item" 
					:class="{ active: activeTab === 1 }"
					@tap="switchTab(1)"
				>
					<text class="tab-text" :class="{ 'tab-text-active': activeTab === 1 }">待核销</text>
				</view>
				<view 
					class="tab-item" 
					:class="{ active: activeTab === 2 }"
					@tap="switchTab(2)"
				>
					<text class="tab-text" :class="{ 'tab-text-active': activeTab === 2 }">已完成</text>
				</view>
			</view>
			<view class="order-list">
				<view class="order-item" v-for="(order, index) in orders" :key="order.id || index">
					<view class="order-header">
						<view class="order-left">
							<view class="order-badge">{{ order.cabinName }}</view>
							<text class="order-date">{{ order.date }}</text>
						</view>
						<view class="order-status">{{ order.status }}</view>
					</view>
					<view class="order-info">
						<view class="info-item">
							<image class="info-icon" :src="icons.clock" mode="aspectFit"></image>
							<text class="info-text">{{ order.timeSlot }}</text>
						</view>
						<view class="info-item">
							<image class="info-icon" :src="icons.seat" mode="aspectFit"></image>
							<text class="info-text">{{ order.seatName }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- Bottom Navigation -->
		<BottomNav :current="3"></BottomNav>
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
			activeTab: 0,
			userInfo: {},
			icons: {
				settings: 'https://www.figma.com/api/mcp/asset/5ed2b362-9495-4961-ad72-a22eab14d2af',
				crown: 'https://www.figma.com/api/mcp/asset/d4df2c09-130a-4366-a7db-6370dd5ebb57',
				clock: 'https://www.figma.com/api/mcp/asset/62825eba-30db-4e17-986f-16509882f006',
				seat: 'https://www.figma.com/api/mcp/asset/e29a6eaf-07e3-4f31-8860-2cf07c88f6b3'
			},
			images: {
				avatar: 'https://www.figma.com/api/mcp/asset/e62fc854-cb73-44b5-96be-9d778af361fb'
			},
			orders: [],
			orderStatusMap: {
				'0': '全部',
				'1': '待核销',
				'2': '已完成'
			}
		}
	},
	onLoad() {
		this.loadUserData()
	},
	computed: {
		formattedPhone() {
			if (!this.userInfo.phone) return '未绑定手机'
			const phone = this.userInfo.phone
			return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
		},
		membershipLevel() {
			if (this.userInfo.memberLevel >= 1) {
				return '会员用户'
			}
			return '普通用户'
		},
		membershipDesc() {
			if (this.userInfo.memberLevel >= 1) {
				return `到期时间: ${this.userInfo.memberExpireTime || '无限期'}`
			}
			return '尚未开通会员'
		}
	},
	watch: {
		activeTab: {
			handler(newVal) {
				this.loadOrders()
			},
			immediate: true
		}
	},
	methods: {
		async loadUserData() {
			try {
				// 获取用户信息
				const response = await api.user.getInfo()
				if (response.code === 200) {
					this.userInfo = response.data
				} else {
					console.error('获取用户信息失败:', response.message)
				}
				
				// 获取订单数据
				this.loadOrders()
			} catch (error) {
				console.error('加载用户数据失败:', error)
			}
		},
		
		async loadOrders() {
			try {
				let status = ''
				if (this.activeTab === 1) {
					status = 'pending'  // 待核销
				} else if (this.activeTab === 2) {
					status = 'completed'  // 已完成
				}
				
				let response
				if (status) {
					response = await api.booking.getOrdersByStatus(status)
				} else {
					response = await api.booking.getOrders()
				}
				
				if (response.code === 200) {
					this.orders = response.data || []
				} else {
					console.error('获取订单数据失败:', response.message)
					this.orders = []
				}
			} catch (error) {
				console.error('加载订单数据失败:', error)
				this.orders = []
			}
		},
		
		switchTab(index) {
			this.activeTab = index
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
	justify-content: space-between;
	padding: 0 40rpx;
}

.header-title {
	color: #333333;
	font-size: 40rpx;
	font-weight: 500;
	line-height: 56rpx;
	letter-spacing: 3.1rpx;
}

.header-icon {
	width: 40rpx;
	height: 40rpx;
}

.user-section {
	padding: 72rpx 40rpx 0;
	display: flex;
	align-items: center;
	gap: 32rpx;
}

.user-avatar {
	width: 128rpx;
	height: 128rpx;
	border-radius: 9999rpx;
	border: 4rpx solid #ffffff;
	box-shadow: 0 8rpx 12rpx -2rpx rgba(0, 0, 0, 0.1), 0 4rpx 8rpx -4rpx rgba(0, 0, 0, 0.1);
}

.user-info {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.user-name {
	color: #101828;
	font-size: 40rpx;
	font-weight: 500;
	line-height: 56rpx;
	letter-spacing: 0.1rpx;
}

.user-phone {
	color: #6a7282;
	font-size: 28rpx;
	font-weight: 300;
	line-height: 40rpx;
	letter-spacing: 1.1rpx;
}

.membership-card {
	background: linear-gradient(to bottom, #2c2a26 0%, #1a1917 100%);
	border-radius: 48rpx;
	padding: 64rpx;
	margin: 32rpx 40rpx;
	box-shadow: 0 50rpx 100rpx -24rpx rgba(0, 0, 0, 0.25);
}

.membership-header {
	display: flex;
	align-items: center;
	gap: 16rpx;
	margin-bottom: 16rpx;
}

.membership-icon {
	width: 40rpx;
	height: 40rpx;
}

.membership-title {
	color: #ffebc8;
	font-size: 36rpx;
	font-weight: 500;
	line-height: 56rpx;
	letter-spacing: 2.72rpx;
}

.membership-desc {
	color: rgba(255, 235, 200, 0.7);
	font-size: 24rpx;
	font-weight: 300;
	line-height: 32rpx;
	letter-spacing: 0.6rpx;
	margin-bottom: 32rpx;
	display: block;
}

.membership-stats {
	display: flex;
	gap: 80rpx;
}

.stat-item {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.stat-value {
	color: #ffebc8;
	font-size: 60rpx;
	font-weight: 300;
	line-height: 72rpx;
	letter-spacing: -0.71rpx;
}

.stat-label {
	color: rgba(255, 235, 200, 0.6);
	font-size: 20rpx;
	font-weight: 400;
	line-height: 30rpx;
	letter-spacing: 1.23rpx;
}

.orders-section {
	padding: 0 40rpx;
	display: flex;
	flex-direction: column;
	gap: 40rpx;
}

.section-title {
	color: #101828;
	font-size: 36rpx;
	font-weight: 500;
	line-height: 56rpx;
	letter-spacing: 0.02rpx;
}

.order-tabs {
	display: flex;
	border-bottom: 2rpx solid #f3f4f6;
	position: relative;
}

.tab-item {
	height: 88rpx;
	padding: 0 32rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
}

.tab-indicator {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	height: 4rpx;
	background-color: #4a5d50;
}

.tab-text {
	color: #99a1af;
	font-size: 28rpx;
	font-weight: 300;
	line-height: 40rpx;
	letter-spacing: 0.4rpx;
}

.tab-text-active {
	color: #4a5d50;
}

.order-list {
	display: flex;
	flex-direction: column;
	gap: 32rpx;
}

.order-item {
	background-color: #ffffff;
	border: 2rpx solid #f9fafb;
	border-radius: 32rpx;
	padding: 42rpx;
	box-shadow: 0 4rpx 30rpx 0 rgba(0, 0, 0, 0.03);
}

.order-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 32rpx;
	padding-bottom: 32rpx;
	border-bottom: 2rpx solid #f9fafb;
}

.order-left {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.order-badge {
	background-color: rgba(74, 93, 80, 0.1);
	border-radius: 8rpx;
	padding: 9rpx 20rpx;
}

.order-badge text {
	color: #4a5d50;
	font-size: 20rpx;
	font-weight: 500;
	letter-spacing: 0.73rpx;
}

.order-date {
	color: #1e2939;
	font-size: 28rpx;
	font-weight: 500;
	line-height: 40rpx;
	letter-spacing: 0.4rpx;
}

.order-status {
	background-color: #f3f4f6;
	border-radius: 9999rpx;
	padding: 9rpx 20rpx;
}

.order-status text {
	color: #99a1af;
	font-size: 20rpx;
	font-weight: 300;
	letter-spacing: 0.73rpx;
}

.order-info {
	display: flex;
	gap: 48rpx;
}

.info-item {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.info-icon {
	width: 28rpx;
	height: 28rpx;
}

.info-text {
	color: #6a7282;
	font-size: 24rpx;
	font-weight: 300;
	line-height: 32rpx;
}
</style>