<template>
	<view class="bottom-nav">
		<view 
			class="nav-item" 
			:class="{ active: current === 0 }"
			@tap="navigateTo('/pages/index/index')"
		>
			<view class="nav-icon">
				<image v-if="current === 0" :src="icons.homeActive" mode="aspectFit" class="icon-img"></image>
				<image v-else :src="icons.home" mode="aspectFit" class="icon-img"></image>
			</view>
			<text class="nav-text" :class="{ 'nav-text-active': current === 0 }">首页</text>
		</view>
		<view 
			class="nav-item" 
			:class="{ active: current === 1 }"
			@tap="navigateTo('/pages/store/store')"
		>
			<view class="nav-icon">
				<image v-if="current === 1" :src="icons.storeActive" mode="aspectFit" class="icon-img"></image>
				<image v-else :src="icons.store" mode="aspectFit" class="icon-img"></image>
			</view>
			<text class="nav-text" :class="{ 'nav-text-active': current === 1 }">会员购</text>
		</view>
		<view 
			class="nav-item" 
			:class="{ active: current === 2 }"
			@tap="navigateTo('/pages/booking/booking')"
		>
			<view class="nav-icon">
				<image v-if="current === 2" :src="icons.bookingActive" mode="aspectFit" class="icon-img"></image>
				<image v-else :src="icons.booking" mode="aspectFit" class="icon-img"></image>
			</view>
			<text class="nav-text" :class="{ 'nav-text-active': current === 2 }">预约</text>
		</view>
		<view 
			class="nav-item" 
			:class="{ active: current === 3 }"
			@tap="navigateTo('/pages/my/my')"
		>
			<view class="nav-icon">
				<image v-if="current === 3" :src="icons.myActive" mode="aspectFit" class="icon-img"></image>
				<image v-else :src="icons.my" mode="aspectFit" class="icon-img"></image>
			</view>
			<text class="nav-text" :class="{ 'nav-text-active': current === 3 }">我的</text>
		</view>
	</view>
</template>

<script>
export default {
	props: {
		current: {
			type: Number,
			default: 0
		}
	},
	data() {
		return {
			icons: {
				home: '/static/home.png',
				homeActive: '/static/home-active .png', // 注意：文件名中有空格
				store: '/static/store.png',
				storeActive: '/static/store-active.png',
				booking: '/static/booking.png',
				bookingActive: '/static/booking-active.png',
				my: '/static/profile.png',
				myActive: '/static/profile-active.png'
			}
		}
	},
	methods: {
		navigateTo(url) {
			const pages = getCurrentPages()
			const currentPage = pages[pages.length - 1]
			const currentRoute = '/' + currentPage.route
			
			if (currentRoute === url) {
				return
			}
			
			// 使用 reLaunch 来切换主要页面，navigateTo 用于跳转到预约页面
			if (url === '/pages/index/index' || url === '/pages/store/store' || url === '/pages/my/my') {
				uni.reLaunch({
					url: url
				})
			} else if (url === '/pages/booking/booking') {
				uni.navigateTo({
					url: url
				})
			}
		}
	}
}
</script>

<style scoped>
.bottom-nav {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	height: 184rpx;
	background-color: rgba(255, 255, 255, 0.95);
	border-top: 2rpx solid #f3f4f6;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 2rpx 48rpx 0;
	box-shadow: 0 -8rpx 40rpx 0 rgba(0, 0, 0, 0.02);
	z-index: 1000;
}

.nav-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	padding: 16rpx 0;
	height: 118rpx;
}

.nav-icon {
	width: 44rpx;
	height: 44rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.icon-img {
	width: 100%;
	height: 100%;
}

.nav-text {
	color: #99a1af;
	font-size: 20rpx;
	font-weight: 300;
	line-height: 30rpx;
	letter-spacing: 0.73rpx;
}

.nav-text-active {
	color: #4a5d50;
	font-weight: 400;
}
</style>
