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
				<view 
					class="card-item" 
					v-for="(item, index) in membershipCards" 
					:key="index"
				>
					<view v-if="item.badge" class="card-badge">{{ item.badge }}</view>
					<view class="card-content">
						<text class="card-title">{{ item.title }}</text>
						<text class="card-desc">{{ item.desc }}</text>
						<view class="card-price-row">
							<text class="card-price">{{ item.price }}</text>
							<text class="card-original-price">{{ item.originalPrice }}</text>
							<view v-if="item.perTime" class="card-per-time">{{ item.perTime }}</view>
						</view>
						<view class="card-features">
							<view class="feature-row">
								<view class="feature-item" v-for="(feature, fIndex) in item.features" :key="fIndex">
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

export default {
	components: {
		BottomNav
	},
	data() {
		return {
			activeTab: 0,
			icons: {
				check: 'https://www.figma.com/api/mcp/asset/9af7aa2c-4d02-4734-a623-ed57909f758f',
				arrow: 'https://www.figma.com/api/mcp/asset/f401a2a2-7c95-4d13-b643-051c1f788de1'
			},
			membershipCards: [
				{
					badge: '新人推荐',
					title: '个人月卡',
					desc: '尊享30天无限次纯净体验',
					price: '¥1680',
					originalPrice: '¥2980',
					perTime: '约 ¥56/次',
					features: ['有效期30天', '无限次', '支持1人绑定', '']
				},
				{
					badge: '超值',
					title: '个人年卡',
					desc: '全年365天健康守护',
					price: '¥9800',
					originalPrice: '¥15800',
					perTime: '约 ¥27/次',
					features: ['有效期365天', '无限次', '支持1人绑定', '']
				},
				{
					title: '个人季卡',
					desc: '90天无限次畅享',
					price: '¥3680',
					originalPrice: '¥5800',
					features: ['有效期90天', '无限次', '支持1人绑定', '']
				},
				{
					title: '个人半年卡',
					desc: '180天无限次畅享',
					price: '¥5800',
					originalPrice: '¥9800',
					features: ['有效期180天', '无限次', '支持1人绑定', '']
				}
			]
		}
	},
	methods: {
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
}

.card-per-time text {
	color: #b88c48;
	font-size: 20rpx;
	font-weight: 300;
	letter-spacing: 0.73rpx;
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
</style>
