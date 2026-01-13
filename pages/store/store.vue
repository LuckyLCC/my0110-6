<template>
	<view class="container">
		<!-- Header -->
		<view class="header">
			<text class="header-title">会员商城</text>
			<text class="header-subtitle">定制您的专属健康方案</text>
		</view>

		<!-- Tabs -->
		<view class="tabs-container">
			<view 
				class="tab-item" 
				:class="{ active: activeTab === 0 }"
				@tap="switchTab(0)"
			>
				<text class="tab-text" :class="{ 'tab-text-active': activeTab === 0 }">个人畅享</text>
			</view>
			<view 
				class="tab-item" 
				:class="{ active: activeTab === 1 }"
				@tap="switchTab(1)"
			>
				<text class="tab-text" :class="{ 'tab-text-active': activeTab === 1 }">多人尊享</text>
			</view>
			<view 
				class="tab-item" 
				:class="{ active: activeTab === 2 }"
				@tap="switchTab(2)"
			>
				<text class="tab-text" :class="{ 'tab-text-active': activeTab === 2 }">家庭/次卡</text>
			</view>
		</view>

		<!-- Content -->
		<scroll-view class="content-scroll" scroll-y="true">
			<view class="content">
				<!-- 加载状态 -->
				<view v-if="loading" class="loading-state">
					<text class="loading-text">加载中...</text>
				</view>
				
				<!-- 错误提示 -->
				<view v-else-if="errorMessage" class="error-message">
					<text class="error-text">{{ errorMessage }}</text>
				</view>
				
				<!-- 空状态 -->
				<view v-else-if="membershipCards.length === 0 && !loading" class="empty-state">
					<text class="empty-text">该分类暂无套餐数据</text>
				</view>
				
				<!-- 数据列表 -->
				<view 
					v-else
					v-for="(item, index) in membershipCards" 
					:key="item.id || index"
					class="card-item"
				>
					<view v-if="item.badge" class="card-badge">{{ item.badge }}</view>
					<view class="card-content">
						<text class="card-title">{{ item.name }}</text>
						<text class="card-desc">{{ formatDescription(item) }}</text>
						<view class="card-price-row">
							<text class="card-price">¥{{ item.price }}</text>
							<view v-if="item.avgPricePerTime" class="card-per-time">约 ¥{{ item.avgPricePerTime }}/次</view>
						</view>
						<view class="card-features">
							<view class="feature-row">
								<view class="feature-item" v-for="(feature, fIndex) in formatFeatures(item)" :key="fIndex">
									<image class="feature-icon" :src="icons.check" mode="aspectFit"></image>
									<text class="feature-text">{{ feature }}</text>
								</view>
							</view>
						</view>
						<view class="card-btn">
							<text class="card-btn-text">立即开通</text>
							<image class="card-btn-icon" :src="icons.arrow" mode="aspectFit"></image>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>

		<!-- Bottom Navigation -->
		<BottomNav :current="1"></BottomNav>
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
			tabCategories: ['个人畅享', '多人尊享', '家庭/次卡'],
			icons: {
				check: 'https://www.figma.com/api/mcp/asset/9af7aa2c-4d02-4734-a623-ed57909f758f',
				arrow: 'https://www.figma.com/api/mcp/asset/f401a2a2-7c95-4d13-b643-051c1f788de1'
			},
			membershipCards: [], // 从数据库获取的数据
			errorMessage: '', // 错误提示信息
			loading: false // 加载状态
		}
	},
	onLoad() {
		this.loadMembershipCards()
	},
	watch: {
		activeTab: {
			handler(newVal) {
				this.loadMembershipCards()
			},
			immediate: true
		}
	},
	methods: {
		async loadMembershipCards() {
			this.loading = true
			this.errorMessage = ''
			this.membershipCards = []
			
			try {
				const category = this.tabCategories[this.activeTab]
				console.log('正在请求分类:', category) // 添加调试日志
				console.log('请求的分类参数:', category) // 添加调试日志
				
				const response = await api.packages.getByCategory(category)
				console.log('API响应:', response) // 添加调试日志
				
				if (response.code === 200) {
					if (response.data && response.data.length > 0) {
						this.membershipCards = response.data
						this.errorMessage = ''
						console.log('成功加载', response.data.length, '个套餐') // 添加调试日志
					} else {
						this.membershipCards = []
						console.log('该分类没有套餐数据') // 添加调试日志
					}
				} else {
					// 后端返回错误
					const errorMsg = response.message || '获取会员套餐数据失败'
					this.errorMessage = `错误: ${errorMsg}`
					this.membershipCards = []
					uni.showToast({
						title: errorMsg,
						icon: 'none',
						duration: 3000
					})
				}
			} catch (error) {
				// 网络错误或请求异常
				console.error('API请求错误:', error) // 添加调试日志
				let errorMsg = '网络连接失败'
				if (error.errMsg) {
					if (error.errMsg.includes('fail')) {
						errorMsg = '无法连接到服务器，请检查后端服务是否启动'
					} else {
						errorMsg = `网络错误: ${error.errMsg}`
					}
				} else if (error.message) {
					errorMsg = `请求错误: ${error.message}`
				}
				
				this.errorMessage = errorMsg
				this.membershipCards = []
				
				console.error('获取会员套餐数据异常:', error)
				uni.showToast({
					title: errorMsg,
					icon: 'none',
					duration: 3000
				})
			} finally {
				this.loading = false
			}
		},
		switchTab(index) {
			console.log('切换到标签:', index) // 添加调试日志
			this.activeTab = index
		},
		formatDescription(item) {
			// 所有卡种都不限次数，但每人每天只能消费一次
			if (item.validDays > 0) {
				return `有效期${item.validDays}天，不限次数（每人每天仅限一次）`
			} else if (item.validDays === -1) {
				return `不限时间，不限次数（每人每天仅限一次）`
			} else {
				return '尊享专属健康方案（每人每天仅限一次）'
			}
		},
		formatFeatures(item) {
			const features = []
			if (item.people > 0) {
				if (item.people === -1) {
					features.push('多人共享')
				} else {
					features.push(`支持${item.people}人绑定`)
				}
			}
			// 多人尊享分类不显示"每人多少次"
			if (this.activeTab !== 1 && item.timesPerPerson > 0) {
				features.push(`每人${item.timesPerPerson}次`)
			}
			return features
		}
	},
	filters: {
		currency(value) {
			if (!value) return '¥0'
			return typeof value === 'number' ? `¥${value}` : value
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
	padding: 48rpx 40rpx 32rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8rpx;
	background-color: #f9f9f9;
}

.header-title {
	color: #333333;
	font-size: 40rpx;
	font-weight: 500;
	line-height: 56rpx;
	letter-spacing: 3.1rpx;
}

.header-subtitle {
	color: #999999;
	font-size: 24rpx;
	font-weight: 300;
	line-height: 32rpx;
	letter-spacing: 0.6rpx;
}

.tabs-container {
	background-color: #f0f0f0;
	margin: 0 64rpx;
	padding: 8rpx;
	border-radius: 9999rpx;
	display: flex;
	gap: 0;
}

.tab-item {
	flex: 1;
	height: 84rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 9999rpx;
}

.tab-item.active {
	background-color: #ffffff;
	box-shadow: 0 2rpx 6rpx 0 rgba(0, 0, 0, 0.1), 0 2rpx 4rpx -2rpx rgba(0, 0, 0, 0.1);
}

.tab-text {
	color: #999999;
	font-size: 28rpx;
	font-weight: 300;
	line-height: 40rpx;
	letter-spacing: 0.4rpx;
}

.tab-text-active {
	color: #333333;
	font-weight: 400;
}

.content-scroll {
	width: 100%;
	height: calc(100vh - 208rpx);
	padding: 32rpx 0 0;
}

.content {
	padding: 0 32rpx 32rpx;
	display: flex;
	flex-direction: column;
	gap: 32rpx;
}

.card-item {
	background-color: #ffffff;
	border-radius: 48rpx;
	overflow: hidden;
	box-shadow: 0 2rpx 6rpx 0 rgba(0, 0, 0, 0.1), 0 2rpx 4rpx -2rpx rgba(0, 0, 0, 0.1);
	position: relative;
}

.card-badge {
	position: absolute;
	top: 0;
	right: 24rpx;
	background-color: #efefef;
	padding: 13rpx 24rpx;
	border-radius: 0 0 28rpx 48rpx;
}

.card-badge text {
	color: #555555;
	font-size: 20rpx;
	font-weight: 300;
	letter-spacing: 1.23rpx;
}

.card-content {
	padding: 48rpx;
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

.card-title {
	color: #444444;
	font-size: 40rpx;
	font-weight: 500;
	line-height: 56rpx;
	letter-spacing: 0.1rpx;
}

.card-desc {
	color: #999999;
	font-size: 28rpx;
	font-weight: 300;
	line-height: 45.5rpx;
	letter-spacing: -0.3rpx;
}

.card-price-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16rpx;
	height: 64rpx;
}

.card-price {
	color: #333333;
	font-size: 48rpx;
	font-weight: 600;
	line-height: 64rpx;
	letter-spacing: -1.06rpx;
}

.card-original-price {
	color: #cccccc;
	font-size: 24rpx;
	font-weight: 300;
	line-height: 32rpx;
	text-decoration: line-through;
}

.card-per-time {
	background-color: #fff8e1;
	padding: 5rpx 16rpx;
	border-radius: 9999rpx;
	height: 38rpx;
	color: #b88c48;
	font-size: 20rpx;
	font-weight: 200;
	letter-spacing: 0.8rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.card-features {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.feature-row {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 16rpx;
}

.feature-item {
	display: flex;
	align-items: center;
	gap: 12rpx;
	height: 32rpx;
}

.feature-icon {
	width: 24rpx;
	height: 24rpx;
}

.feature-text {
	color: #666666;
	font-size: 24rpx;
	font-weight: 300;
	line-height: 32rpx;
	letter-spacing: 0.6rpx;
}

.card-btn {
	background-color: #4a5d50;
	border-radius: 9999rpx;
	width: 100%;
	height: 88rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 16rpx;
	box-shadow: 0 2rpx 6rpx 0 rgba(0, 0, 0, 0.1), 0 2rpx 4rpx -2rpx rgba(0, 0, 0, 0.1);
}

.card-btn-text {
	color: #ffffff;
	font-size: 28rpx;
	font-weight: 300;
	letter-spacing: 2.5rpx;
}

.card-btn-icon {
	width: 32rpx;
	height: 32rpx;
}

.loading-state {
	width: 100%;
	padding: 80rpx 40rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: #ffffff;
	border-radius: 32rpx;
	margin-bottom: 32rpx;
}

.loading-text {
	color: #999999;
	font-size: 28rpx;
	font-weight: 400;
	line-height: 40rpx;
	text-align: center;
}

.empty-state {
	width: 100%;
	padding: 80rpx 40rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: #ffffff;
	border-radius: 32rpx;
	margin-bottom: 32rpx;
}

.empty-text {
	color: #999999;
	font-size: 28rpx;
	font-weight: 400;
	line-height: 40rpx;
	text-align: center;
}

.error-message {
	width: 100%;
	padding: 80rpx 40rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: #ffffff;
	border-radius: 32rpx;
	margin-bottom: 32rpx;
}

.error-text {
	color: #ff4444;
	font-size: 28rpx;
	font-weight: 400;
	line-height: 40rpx;
	text-align: center;
}
</style>