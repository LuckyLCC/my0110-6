<template>
	<view class="container">
		<!-- Hero Banner Section -->
		<view class="hero-section">
			<image class="hero-bg" mode="aspectFill" :src="images.luxuryCabin"></image>
			<view class="hero-overlay"></view>
			<view class="hero-gradient"></view>
			<view class="hero-content">
				<view class="hero-tags">
					<view class="tag premium">
						<text class="tag-text">PREMIUM WELLNESS</text>
					</view>
					<view class="tag o2">
						<text class="tag-text">O₂ ION</text>
					</view>
				</view>
				<view class="hero-title">
					<text class="title-line">城市</text>
					<text class="title-line">森林氧舱</text>
				</view>
				<view class="hero-description">
					<text class="desc-line">在喧嚣都市中,为您找回</text>
					<text class="desc-line">每一次深呼吸的纯净与宁静。</text>
				</view>
			</view>
		</view>

		<!-- VIP Member Card -->
		<view class="vip-card">
			<view class="vip-card-left">
				<view class="vip-header">
					<text class="vip-icon">✦</text>
					<text class="vip-title">成为尊享会员</text>
				</view>
				<view class="vip-price">
					<text class="vip-price-label">单次体验低至</text>
					<text class="vip-price-value">¥{{ vipPrice }}</text>
					<text class="vip-price-unit">/ 次</text>
				</view>
			</view>
			<view class="vip-card-right" @tap="navigateToStore">
				<image class="arrow-icon" :src="images.icon" mode="aspectFit"></image>
			</view>
		</view>

		<!-- Main Content -->
		<view class="main-content">
			<!-- Single Experience Card -->
			<view class="experience-card">
				<view class="experience-header">
					<view class="experience-info">
						<text class="experience-title">深度单次体验</text>
						<text class="experience-desc">60分钟纯净富氧环境，包含茶歇</text>
					</view>
					<view class="experience-price">
						<text class="price-current">¥{{ singleExperiencePrice.current }}</text>
						<text class="price-original">原价 ¥{{ singleExperiencePrice.original }}</text>
					</view>
				</view>
				<view class="experience-divider"></view>
				<view class="experience-footer">
					<view class="experience-features">
						<view class="feature-item">
							<image class="feature-icon" :src="images.icon1" mode="aspectFit"></image>
							<text class="feature-text">60min</text>
						</view>
						<view class="feature-item feature-item-private">
							<image class="feature-icon" :src="images.icon2" mode="aspectFit"></image>
							<text class="feature-text">私密空间</text>
						</view>
					</view>
					<view class="experience-btn" @tap="navigateToBooking">
						<text class="btn-text">立即预约</text>
					</view>
				</view>
			</view>

			<!-- Gallery Section -->
			<view class="gallery-section">
				<view class="gallery-header">
					<text class="gallery-title">环境与服务</text>
					<text class="gallery-label">Gallery</text>
				</view>
				<scroll-view class="gallery-scroll" scroll-x="true" show-scrollbar="false">
					<view class="gallery-list">
						<view class="gallery-item" v-for="(item, index) in galleryItems" :key="index">
							<image class="gallery-img" :src="item.image" mode="aspectFill"></image>
							<view class="gallery-overlay"></view>
							<view class="gallery-info">
								<text class="gallery-name">{{ item.name }}</text>
								<text class="gallery-name-en">{{ item.nameEn }}</text>
							</view>
						</view>
					</view>
				</scroll-view>
			</view>
		</view>

		<!-- Bottom Navigation -->
		<BottomNav :current="0"></BottomNav>
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
			vipPrice: '99', // 默认价格，将从后端获取
			singleExperiencePrice: {
				current: 398,
				original: 598
			},
			images: {
				luxuryCabin: 'https://www.figma.com/api/mcp/asset/60bff265-fe2f-4c41-ba59-ee52e68d299e',
				icon: 'https://www.figma.com/api/mcp/asset/9be8f457-e93d-4188-bac0-bbed59aab937',
				icon1: 'https://www.figma.com/api/mcp/asset/6fe18f3a-6d6d-4c4a-9901-bc3dfa8aeca1',
				icon2: 'https://www.figma.com/api/mcp/asset/5d72241c-8308-4dfa-a543-84108286f447',
				gallery1: 'https://www.figma.com/api/mcp/asset/a745e6a5-7152-4910-aa07-f87902dd9833',
				gallery2: 'https://www.figma.com/api/mcp/asset/eb88c44a-062f-4171-9fa9-06e21ab08d7c'
			},
			galleryItems: [
				{
					name: '独立座舱',
					nameEn: 'Private Cabin',
					image: 'https://www.figma.com/api/mcp/asset/a745e6a5-7152-4910-aa07-f87902dd9833'
				},
				{
					name: '茶歇服务',
					nameEn: 'Tea Service',
					image: 'https://www.figma.com/api/mcp/asset/eb88c44a-062f-4171-9fa9-06e21ab08d7c'
				},
				{
					name: '纯净负离子',
					nameEn: 'Fresh Air',
					image: 'https://www.figma.com/api/mcp/asset/a745e6a5-7152-4910-aa07-f87902dd9833'
				}
			]
		}
	},
	async onLoad() {
		// 页面加载时获取最新的套餐信息
		await this.loadPackageData()
	},
	methods: {
		async loadPackageData() {
			try {
				// 获取所有套餐信息
				const response = await api.packages.getAll()
				if (response.code === 200 && response.data && response.data.length > 0) {
					// 查找价格最低的套餐用于VIP卡片展示
					const cheapestPackage = response.data.reduce((prev, curr) => {
						const prevPrice = prev.avgPricePerTime || Number.MAX_VALUE
						const currPrice = curr.avgPricePerTime || Number.MAX_VALUE
						return prevPrice < currPrice ? prev : curr
					})
					
					// 设置VIP卡片价格
					if (cheapestPackage.avgPricePerTime) {
						this.vipPrice = cheapestPackage.avgPricePerTime
					}
					
					// 单次体验价格固定为398和598，不从后端获取
					this.singleExperiencePrice.current = 398
					this.singleExperiencePrice.original = 598
				}
			} catch (error) {
				console.error('获取套餐数据失败:', error)
				// 即使获取失败，也保持默认价格
				this.singleExperiencePrice.current = 398
				this.singleExperiencePrice.original = 598
			}
		},
		navigateToBooking() {
			uni.navigateTo({
				url: '/pages/booking/booking'
			})
		},
		navigateToStore() {
			uni.navigateTo({
				url: '/pages/store/store'
			})
		}
	}
}
</script>

<style scoped>
.container {
	width: 100%;
	min-height: 100vh;
	background-color: #f9f9f9;
	position: relative;
	padding-bottom: 184rpx;
}

/* Hero Section */
.hero-section {
	width: 100%;
	height: 1000rpx;
	position: relative;
	border-radius: 0 0 80rpx 80rpx;
	overflow: hidden;
	box-shadow: 0 50rpx 100rpx -24rpx rgba(0, 0, 0, 0.25);
}

.hero-bg {
	position: absolute;
	width: 100%;
	height: 100%;
	top: 0;
	left: 0;
}

.hero-overlay {
	position: absolute;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.2);
	top: 0;
	left: 0;
}

.hero-gradient {
	position: absolute;
	width: 100%;
	height: 100%;
	background: linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0) 50%);
	top: 0;
	left: 0;
}

.hero-content {
	position: absolute;
	width: 100%;
	padding: 200rpx 64rpx 0;
	display: flex;
	flex-direction: column;
	gap: 48rpx;
}

.hero-tags {
	display: flex;
	gap: 24rpx;
}

.tag {
	background-color: rgba(255, 255, 255, 0.1);
	border: 2rpx solid rgba(255, 255, 255, 0.2);
	border-radius: 9999rpx;
	height: 58rpx;
	padding: 0 32rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.tag-text {
	color: #ffffff;
	font-size: 20rpx;
	font-weight: 300;
	letter-spacing: 3.23rpx;
	text-transform: uppercase;
}

.tag.premium {
	width: 321rpx;
}

.tag.o2 {
	width: 149rpx;
}

.hero-title {
	display: flex;
	flex-direction: column;
	gap: 0;
	line-height: 120rpx;
}

.title-line {
	color: #ffffff;
	font-size: 96rpx;
	font-weight: 400;
	letter-spacing: 14.4rpx;
	display: block;
}

.hero-description {
	display: flex;
	flex-direction: column;
	gap: 0;
	border-left: 2rpx solid rgba(255, 255, 255, 0.3);
	padding-left: 32rpx;
	width: 559rpx;
}

.desc-line {
	color: rgba(255, 255, 255, 0.9);
	font-size: 28rpx;
	font-weight: 300;
	line-height: 56rpx;
	letter-spacing: 0.4rpx;
	display: block;
}

/* VIP Card */
.vip-card {
	position: relative;
	margin: -106rpx 48rpx 0;
	background: linear-gradient(to bottom, #2c2a26 0%, #1a1917 100%);
	border: 2rpx solid rgba(255, 255, 255, 0.05);
	border-radius: 48rpx;
	padding: 60rpx 50rpx 40rpx 50rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	box-shadow: 0 50rpx 100rpx -24rpx rgba(0, 0, 0, 0.1);
	z-index: 10;
}

/* Main Content */
.main-content {
	padding: 64rpx 48rpx 0;
	display: flex;
	flex-direction: column;
	gap: 64rpx;
	margin-top: 0;
}

.vip-card-left {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 16rpx;
	margin-top: -28rpx; /* 向上移动，可根据需要调整像素值（负值向上，正值向下） */
}

.vip-header {
	display: flex;
	align-items: center;
	gap: 16rpx;
	height: 56rpx;
}

.vip-icon {
	color: #d4af37;
	font-size: 32rpx;
	line-height: 48rpx;
}

.vip-title {
	color: #ffebc8;
	font-size: 36rpx;
	font-weight: 300;
	letter-spacing: 6.32rpx;
}

.vip-price {
	height: 40rpx;
	display: flex;
	align-items: center;
	gap: 0;
}

.vip-price-label {
	color: rgba(255, 235, 200, 0.6);
	font-size: 24rpx;
	font-weight: 300;
	line-height: 32rpx;
	letter-spacing: 1.2rpx;
}

.vip-price-value {
	color: #ffffff;
	font-size: 28rpx;
	font-weight: 400;
	line-height: 40rpx;
	letter-spacing: 0.9rpx;
	margin: 0 8rpx;
}

.vip-price-unit {
	color: rgba(255, 235, 200, 0.6);
	font-size: 24rpx;
	font-weight: 300;
	line-height: 32rpx;
	letter-spacing: 1.2rpx;
}

.vip-card-right {
	width: 80rpx;
	height: 80rpx;
	background-color: rgba(255, 255, 255, 0.05);
	border: 2rpx solid rgba(255, 235, 200, 0.2);
	border-radius: 9999rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 4rpx;
	margin-top: -20rpx; /* 向上移动，可根据需要调整像素值（负值向上，正值向下） */
}

.arrow-icon {
	width: 32rpx;
	height: 32rpx;
}

/* Experience Card */
.experience-card {
	background-color: #ffffff;
	border: 2rpx solid rgba(249, 250, 251, 0.5);
	border-radius: 48rpx;
	padding: 58rpx 58rpx 58rpx;
	box-shadow: 0 20rpx 80rpx -20rpx rgba(0, 0, 0, 0.05);
}

.experience-header {
	display: flex;
	justify-content: space-between;
	margin-bottom: 48rpx;
}

.experience-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.experience-title {
	color: #333333;
	font-size: 40rpx;
	font-weight: 500;
	line-height: 56rpx;
	letter-spacing: 3.1rpx;
}

.experience-desc {
	color: #999999;
	font-size: 24rpx;
	font-weight: 300;
	line-height: 32rpx;
	letter-spacing: 0.6rpx;
}

.experience-price {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
	align-items: flex-end;
}

.price-current {
	color: #4a5d50;
	font-size: 48rpx;
	font-weight: 400;
	line-height: 64rpx;
	letter-spacing: -1.06rpx;
}

.price-original {
	color: #999999;
	font-size: 20rpx;
	font-weight: 300;
	line-height: 30rpx;
	text-decoration: line-through;
	letter-spacing: 0.23rpx;
}

.experience-divider {
	height: 2rpx;
	background: linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 50%);
	margin: 0;
}

.experience-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 40rpx;
}

.experience-features {
	display: flex;
	gap: 32rpx;
}

.feature-item {
	display: flex;
	align-items: center;
	gap: 12rpx;
	height: 32rpx;
}

.feature-icon {
	width: 28rpx;
	height: 28rpx;
}

.feature-text {
	color: #999999;
	font-size: 24rpx;
	font-weight: 300;
	line-height: 32rpx;
	letter-spacing: 0.6rpx;
}

.feature-item-private {
	margin-left: -20rpx; /* 向左移动20rpx，可根据需要调整像素值 */
	gap: 6rpx; /* 图标和文字之间的间距，约5像素 */
}

.experience-btn {
	background-color: #4a5d50;
	border-radius: 9999rpx;
	width: 238rpx;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 20rpx 30rpx -6rpx rgba(74, 93, 80, 0.2), 0 8rpx 12rpx -8rpx rgba(74, 93, 80, 0.2);
}

.btn-text {
	color: #ffffff;
	font-size: 24rpx;
	font-weight: 300;
	letter-spacing: 3.6rpx;
	text-align: center;
}

/* Gallery Section */
.gallery-section {
	display: flex;
	flex-direction: column;
	gap: 40rpx;
}

.gallery-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 8rpx;
	height: 56rpx;
}

.gallery-title {
	color: #333333;
	font-size: 36rpx;
	font-weight: 500;
	line-height: 56rpx;
	letter-spacing: 2.72rpx;
}

.gallery-label {
	color: #999999;
	font-size: 20rpx;
	font-weight: 300;
	line-height: 30rpx;
	letter-spacing: 2.23rpx;
	text-transform: uppercase;
}

.gallery-scroll {
	width: 100%;
	white-space: nowrap;
}

.gallery-list {
	display: flex;
	gap: 32rpx;
}

.gallery-item {
	position: relative;
	width: 440rpx;
	height: 300rpx;
	border-radius: 32rpx;
	overflow: hidden;
	box-shadow: 0 20rpx 30rpx -6rpx #f3f4f6, 0 8rpx 12rpx -8rpx #f3f4f6;
	flex-shrink: 0;
}

.gallery-img {
	width: 100%;
	height: 100%;
}

.gallery-overlay {
	position: absolute;
	width: 100%;
	height: 100%;
	background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 50%);
	top: 0;
	left: 0;
}

.gallery-info {
	position: absolute;
	bottom: 32rpx;
	left: 32rpx;
	display: flex;
	flex-direction: column;
	gap: 17rpx;
}

.gallery-name {
	color: rgba(255, 255, 255, 0.9);
	font-size: 24rpx;
	font-weight: 300;
	line-height: 32rpx;
	letter-spacing: 2.4rpx;
}

.gallery-name-en {
	color: rgba(255, 255, 255, 0.5);
	font-size: 20rpx;
	font-weight: 300;
	line-height: 30rpx;
	letter-spacing: 1.23rpx;
	text-transform: uppercase;
}
</style>