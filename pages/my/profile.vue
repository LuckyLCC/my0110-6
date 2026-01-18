<template>
	<view class="page">
		<!-- 顶部导航栏 -->
		<view class="header">
			<view class="back-btn" @tap="goBack">
				<image class="back-icon" src="/static/profile/back-arrow.png" mode="aspectFit"></image>
			</view>
			<text class="header-title">个人信息</text>
			<view class="header-right"></view>
		</view>

		<scroll-view class="scroll" scroll-y="true" :show-scrollbar="false">
			<view class="content">
				<!-- 头像区域 -->
				<view class="avatar-section">
					<view class="avatar-container" @tap="changeAvatar">
						<view class="avatar-wrapper">
							<image class="avatar" :src="userInfo.avatar || '/static/profile/avatar.png'" mode="aspectFill"></image>
						</view>
					</view>
					<text class="avatar-hint">点击更换头像</text>
				</view>

				<!-- 个人信息卡片 -->
				<view class="info-card">
					<!-- 昵称 -->
					<view class="info-row" @tap="editNickname">
						<text class="info-label">昵称</text>
						<text class="info-value">{{ userInfo.nickname || '微信用户' }}</text>
					</view>
					<view class="divider"></view>

					<!-- 性别 -->
					<view class="info-row">
						<text class="info-label">性别</text>
						<view class="gender-group">
							<view class="gender-item" @tap="selectGender('male')">
								<view class="radio" :class="{ 'radio-selected': userInfo.gender === 'male' }">
									<image v-if="userInfo.gender === 'male'" class="radio-icon" src="/static/profile/radio-selected.png" mode="aspectFit"></image>
								</view>
								<text class="gender-text">男</text>
							</view>
							<view class="gender-item" @tap="selectGender('female')">
								<view class="radio" :class="{ 'radio-selected': userInfo.gender === 'female' }">
									<image v-if="userInfo.gender === 'female'" class="radio-icon" src="/static/profile/radio-selected.png" mode="aspectFit"></image>
								</view>
								<text class="gender-text">女</text>
							</view>
						</view>
					</view>
					<view class="divider"></view>

					<!-- 手机号 -->
					<view class="info-row" @tap="editPhone">
						<text class="info-label">手机号</text>
						<text class="info-value">{{ userInfo.phoneMasked || '138****8888' }}</text>
					</view>
					<view class="divider"></view>

					<!-- 生日 -->
					<view class="info-row" @tap="selectBirthday">
						<text class="info-label">生日</text>
						<text class="info-value">{{ userInfo.birthday || '1995年01月01日' }}</text>
					</view>
				</view>

				<!-- 保存修改按钮 -->
				<view class="save-btn" @tap="saveChanges">
					<text class="save-btn-text">保存修改</text>
				</view>

				<!-- 退出登录 -->
				<view class="logout-btn" @tap="logout">
					<text class="logout-text">退出登录</text>
				</view>

				<view class="bottom-safe"></view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const userInfo = ref({
	avatar: '',
	nickname: '',
	gender: 'female',
	phone: '',
	phoneMasked: '138****8888',
	birthday: '1995年01月01日'
})

onMounted(() => {
	loadUserInfo()
})

const loadUserInfo = async () => {
	try {
		const localUserInfo = uni.getStorageSync('userInfo')
		if (localUserInfo) {
			updateUserInfo(localUserInfo)
		}
		
		const token = uni.getStorageSync('token')
		if (token) {
			try {
				const { api } = require('@/api/request')
				const response = await api.user.getInfo()
				if (response.code === 200 && response.data) {
					updateUserInfo(response.data)
					uni.setStorageSync('userInfo', response.data)
				}
			} catch (error) {
				console.log('获取用户信息失败，使用本地存储:', error)
			}
		}
	} catch (error) {
		console.error('加载用户信息错误:', error)
	}
}

const updateUserInfo = (userInfoData) => {
	if (!userInfoData) return
	
	if (userInfoData.avatar || userInfoData.avatarUrl) {
		userInfo.value.avatar = userInfoData.avatar || userInfoData.avatarUrl
	}
	
	if (userInfoData.nickname || userInfoData.name) {
		userInfo.value.nickname = userInfoData.nickname || userInfoData.name || '微信用户'
	}
	
	if (userInfoData.gender) {
		userInfo.value.gender = userInfoData.gender === 'male' || userInfoData.gender === '男' ? 'male' : 'female'
	}
	
	if (userInfoData.phone || userInfoData.phoneNumber) {
		const phone = userInfoData.phone || userInfoData.phoneNumber
		userInfo.value.phone = phone
		userInfo.value.phoneMasked = maskPhone(phone)
	}
	
	if (userInfoData.birthday) {
		userInfo.value.birthday = formatBirthday(userInfoData.birthday)
	}
}

const maskPhone = (phone) => {
	if (!phone || phone.length < 11) return phone
	return phone.substring(0, 3) + '****' + phone.substring(7)
}

const formatBirthday = (birthday) => {
	if (!birthday) return '1995年01月01日'
	const date = new Date(birthday)
	if (isNaN(date.getTime())) return birthday
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}年${month}月${day}日`
}

const goBack = () => {
	uni.navigateBack()
}

const changeAvatar = () => {
	uni.chooseImage({
		count: 1,
		sizeType: ['compressed'],
		sourceType: ['album', 'camera'],
		success: (res) => {
			userInfo.value.avatar = res.tempFilePaths[0]
		},
		fail: (err) => {
			console.error('选择头像失败:', err)
		}
	})
}

const editNickname = () => {
	uni.showModal({
		title: '修改昵称',
		editable: true,
		placeholderText: '请输入昵称',
		success: (res) => {
			if (res.confirm && res.content) {
				userInfo.value.nickname = res.content
			}
		}
	})
}

const selectGender = (gender) => {
	userInfo.value.gender = gender
}

const editPhone = () => {
	uni.showToast({
		title: '手机号修改功能开发中',
		icon: 'none'
	})
}

const selectBirthday = () => {
	uni.showModal({
		title: '选择生日',
		editable: true,
		placeholderText: '请输入生日，格式：1995年01月01日',
		success: (res) => {
			if (res.confirm && res.content) {
				const datePattern = /^\d{4}年\d{2}月\d{2}日$/
				if (datePattern.test(res.content)) {
					userInfo.value.birthday = res.content
				} else {
					uni.showToast({
						title: '日期格式不正确',
						icon: 'none'
					})
				}
			}
		}
	})
}

const saveChanges = async () => {
	try {
		const token = uni.getStorageSync('token')
		if (token) {
			const currentUserInfo = uni.getStorageSync('userInfo') || {}
			const updateData = {
				nickname: userInfo.value.nickname,
				gender: userInfo.value.gender,
				phone: userInfo.value.phone,
				birthday: userInfo.value.birthday
			}
			const updatedUserInfo = {
				...currentUserInfo,
				...updateData
			}
			uni.setStorageSync('userInfo', updatedUserInfo)
			
			uni.showToast({
				title: '保存成功',
				icon: 'success'
			})
		} else {
			uni.showToast({
				title: '请先登录',
				icon: 'none'
			})
		}
	} catch (error) {
		console.error('保存用户信息错误:', error)
	}
}

const logout = () => {
	uni.showModal({
		title: '提示',
		content: '确定要退出登录吗？',
		success: (res) => {
			if (res.confirm) {
				uni.removeStorageSync('token')
				uni.removeStorageSync('userInfo')
				uni.reLaunch({
					url: '/pages/login/login'
				})
			}
		}
	})
}
</script>

<style scoped>
.page {
	width: 100%;
	min-height: 100vh;
	background-color: #f5f7f9;
}

/* 顶部导航栏 */
.header {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 112rpx;
	background-color: #ffffff;
	border-bottom: 2rpx solid #f3f4f6;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-top: env(safe-area-inset-top, 0rpx);
	padding-left: 16rpx;
	padding-right: 16rpx;
	z-index: 10;
	box-shadow: 0 2rpx 6rpx 0 rgba(0, 0, 0, 0.1), 0 2rpx 4rpx -2rpx rgba(0, 0, 0, 0.1);
}

.back-btn {
	width: 72rpx;
	height: 72rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 16rpx;
}

.back-icon {
	width: 36rpx;
	height: 36rpx;
}

.header-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #1d293d;
	letter-spacing: -0.625rpx;
	line-height: 48rpx;
}

.header-right {
	width: 72rpx;
	height: 72rpx;
}

.scroll {
	height: 100vh;
	background-color: #f5f7f9;
	padding-top: 112rpx;
}

.content {
	padding: 32rpx;
	padding-bottom: 0;
}

/* 头像区域 */
.avatar-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 32rpx;
	padding-top: 32rpx;
}

.avatar-container {
	position: relative;
	width: 192rpx;
	height: 192rpx;
	margin-bottom: 16rpx;
}

.avatar-wrapper {
	width: 192rpx;
	height: 192rpx;
	border-radius: 50%;
	background-color: #ffffff;
	border: 2rpx solid #f3f4f6;
	padding: 10rpx;
	box-shadow: 0 2rpx 6rpx 0 rgba(0, 0, 0, 0.1), 0 2rpx 4rpx -2rpx rgba(0, 0, 0, 0.1);
}

.avatar {
	width: 100%;
	height: 100%;
	border-radius: 50%;
	background-color: #f0f0f0;
}

.avatar-hint {
	font-size: 28rpx;
	color: #99a1af;
	line-height: 40rpx;
	letter-spacing: -0.3rpx;
	text-align: center;
}

/* 个人信息卡片 */
.info-card {
	background-color: #ffffff;
	border-radius: 32rpx;
	border: 2rpx solid rgba(243, 244, 246, 0.5);
	box-shadow: 0 2rpx 6rpx 0 rgba(0, 0, 0, 0.1), 0 2rpx 4rpx -2rpx rgba(0, 0, 0, 0.1);
	margin-bottom: 32rpx;
	overflow: hidden;
}

.info-row {
	display: flex;
	align-items: center;
	min-height: 111rpx;
	padding: 0 32rpx;
	position: relative;
}

.info-label {
	font-size: 30rpx;
	color: #45556c;
	width: 160rpx;
	flex-shrink: 0;
	letter-spacing: -0.47rpx;
	line-height: 45rpx;
	font-weight: 400;
}

.info-value {
	flex: 1;
	font-size: 30rpx;
	font-weight: 500;
	color: #1d293d;
	text-align: right;
	letter-spacing: -0.47rpx;
	line-height: 45rpx;
}

.divider {
	height: 2rpx;
	background-color: #f9fafb;
	margin-left: 32rpx;
}

/* 性别选择 */
.gender-group {
	display: flex;
	align-items: center;
	gap: 48rpx;
	flex: 1;
	justify-content: flex-end;
}

.gender-item {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.radio {
	width: 32rpx;
	height: 32rpx;
	border-radius: 50%;
	border: 2rpx solid #d1d5dc;
	background-color: transparent;
	box-shadow: 0 2rpx 4rpx 0 rgba(0, 0, 0, 0.05);
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
}

.radio-selected {
	background-color: #1b3b2f;
	border-color: #1b3b2f;
}

.radio-icon {
	width: 16rpx;
	height: 16rpx;
}

.gender-text {
	font-size: 30rpx;
	color: #314158;
	letter-spacing: -0.47rpx;
}

/* 保存修改按钮 */
.save-btn {
	width: 100%;
	height: 96rpx;
	background-color: #4a5d50;
	border-radius: 9999rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 32rpx;
	box-shadow: 0 20rpx 30rpx -6rpx rgba(27, 59, 47, 0.1), 0 8rpx 12rpx -8rpx rgba(27, 59, 47, 0.1);
}

.save-btn-text {
	font-size: 32rpx;
	font-weight: 500;
	color: #ffffff;
	letter-spacing: -0.625rpx;
}

/* 退出登录 */
.logout-btn {
	width: 100%;
	height: 96rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 32rpx;
}

.logout-text {
	font-size: 32rpx;
	font-weight: 500;
	color: #fb2c36;
	letter-spacing: -0.625rpx;
}

.bottom-safe {
	height: env(safe-area-inset-bottom, 0rpx);
}
</style>

