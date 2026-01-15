<template>
	<view class="page">
		<!-- 顶部导航（自定义） -->
		<view class="topbar">
			<text class="topbar-title">资产中心</text>
			<image class="topbar-icon" :src="assets.iconSettings" mode="aspectFit" />
		</view>

		<scroll-view class="scroll" scroll-y="true" :show-scrollbar="false">
			<view class="content">
				<!-- 头像与用户信息 -->
				<view class="user-row" @tap="navigateToLogin">
					<view class="avatar-wrap">
						<image class="avatar" :src="user.avatar || assets.avatar" mode="aspectFill" />
					</view>
					<view class="user-meta">
						<text class="user-name">{{ user.name }}</text>
						<text class="user-phone">{{ user.phoneMasked }}</text>
					</view>
				</view>

				<!-- 会员卡 -->
				<view class="vip-card">
					<view class="vip-glow" />
					<view class="vip-inner">
						<view class="vip-top">
							<view class="vip-title-row">
								<image class="vip-title-icon" :src="assets.iconVip" mode="aspectFit" />
								<text class="vip-title">{{ vip.title }}</text>
							</view>
							<view class="vip-invite" @tap="onInvite">
								<image class="vip-invite-icon" :src="assets.iconInvite" mode="aspectFit" />
								<text class="vip-invite-text">邀请亲友</text>
							</view>
						</view>
						<text v-if="!isNormalUser" class="vip-subtitle">有效期至 {{ vip.expireAt }}</text>
						<view class="vip-stats">
							<view class="vip-stat">
								<text class="vip-stat-value">{{ vip.stats.left }}</text>
								<text class="vip-stat-label">剩余次数</text>
							</view>
							<view class="vip-stat">
								<text class="vip-stat-value">{{ vip.stats.bound }}</text>
								<text class="vip-stat-label">已绑定</text>
							</view>
							<view class="vip-stat">
								<text class="vip-stat-value">{{ vip.stats.points }}</text>
								<text class="vip-stat-label">积分余额</text>
							</view>
						</view>
					</view>
				</view>

				<!-- 购卡记录 -->
				<view class="section">
					<text class="section-title">购卡记录</text>
					<view class="card">
						<view v-if="purchaseRecords.length === 0" class="empty-records">
							<text class="empty-text">暂无购卡记录</text>
						</view>
						<view
							v-for="(item, idx) in purchaseRecords"
							:key="idx"
							class="record-row"
							:class="{
								'record-row-border': idx !== purchaseRecords.length - 1,
								'record-row-last': idx === purchaseRecords.length - 1
							}"
						>
							<view class="record-left">
								<view class="record-icon" :class="item.iconBg">
									<image class="record-icon-img" :src="item.icon" mode="aspectFit" />
								</view>
							<view class="record-meta">
								<text class="record-name">{{ item.name }}</text>
								<text class="record-date">购买于 {{ item.buyAt }}</text>
								<view class="record-dates" v-if="item.cardStartDate || item.cardEndDate">
									<text v-if="item.cardStartDate" class="record-date-item">开始：{{ item.cardStartDate }}</text>
									<text v-if="item.cardEndDate" class="record-date-item">到期：{{ item.cardEndDate }}</text>
								</view>
							</view>
							</view>
							<view class="record-right">
								<text class="record-price">{{ item.price }}</text>
								<view class="pill" :class="item.statusPillClass">
									<text class="pill-text" :class="item.statusTextClass">{{ item.status }}</text>
								</view>
							</view>
						</view>
					</view>
				</view>

				<!-- 预约订单 -->
				<view class="section section-booking">
					<text class="section-title">预约订单</text>
					<view class="tabs">
						<view class="tab" @tap="setTab('all')">
							<text class="tab-text" :class="{ active: tab === 'all' }">全部</text>
							<view v-if="tab === 'all'" class="tab-underline" />
						</view>
						<view class="tab" @tap="setTab('pending')">
							<text class="tab-text" :class="{ active: tab === 'pending' }">待核销</text>
							<view v-if="tab === 'pending'" class="tab-underline" />
						</view>
						<view class="tab" @tap="setTab('done')">
							<text class="tab-text" :class="{ active: tab === 'done' }">已完成</text>
							<view v-if="tab === 'done'" class="tab-underline" />
						</view>
					</view>

					<view class="booking-list">
						<view v-if="orders.length === 0" class="empty-records">
							<text class="empty-text">暂无预约订单</text>
						</view>
						<view v-for="(order, idx) in filteredOrders" v-else :key="idx" class="booking-card">
							<view class="booking-head">
								<view class="booking-head-left">
									<view class="badge-cabin">
										<text class="badge-cabin-text">{{ order.cabin }}</text>
									</view>
									<text class="booking-date">{{ order.date }}</text>
								</view>
								<view class="badge-status" :class="order.statusBadgeClass">
									<text class="badge-status-text" :class="order.statusTextClass">{{ order.statusText }}</text>
								</view>
							</view>
							<view class="booking-meta">
								<view class="booking-meta-item">
									<image class="booking-meta-icon" :src="assets.iconClock" mode="aspectFit" />
									<text class="booking-meta-text">{{ order.time }}</text>
								</view>
								<view class="booking-meta-item">
									<image class="booking-meta-icon" :src="assets.iconLocation" mode="aspectFit" />
									<text class="booking-meta-text">{{ order.site }}</text>
								</view>
							</view>
							<view v-if="order.showVerify" class="booking-foot">
								<view class="verify-btn" @tap="onShowVerifyCode(order)">
									<image class="verify-icon" :src="assets.iconQr" mode="aspectFit" />
									<text class="verify-text">出示核销码</text>
								</view>
							</view>
						</view>
					</view>
				</view>

				<view class="bottom-safe" />
			</view>
		</scroll-view>

		<!-- 核销码弹窗 -->
		<view v-if="showVerifyModal" class="verify-modal" @tap="closeVerifyModal">
			<view class="verify-modal-content" @tap.stop>
				<view class="verify-modal-header">
					<text class="verify-modal-title">核销码</text>
					<text class="verify-modal-close" @tap="closeVerifyModal">×</text>
				</view>
				<view class="verify-modal-body">
					<view class="verify-qr-container">
						<!-- 使用 canvas 生成二维码（隐藏，仅用于生成） -->
						<canvas 
							canvas-id="qrcode-canvas" 
							id="qrcode-canvas"
							class="verify-qr-canvas"
							:style="{ width: '300px', height: '300px' }"
						></canvas>
						<!-- 显示二维码图片（如果生成成功） -->
						<image 
							v-if="qrCodeImage" 
							class="verify-qr-image" 
							:src="qrCodeImage" 
							mode="aspectFit"
						/>
						<!-- 如果二维码生成失败，显示订单号文本 -->
						<view v-else class="verify-qr-placeholder">
							<text class="verify-qr-text">{{ currentVerifyOrder?.orderNo || currentVerifyOrder?.orderId }}</text>
						</view>
					</view>
					<view class="verify-code-text">
						<text class="verify-code-label">核销码：</text>
						<text class="verify-code-value">{{ currentVerifyOrder?.orderNo || currentVerifyOrder?.orderId }}</text>
					</view>
					<view class="verify-tips">
						<text class="verify-tips-text">请向工作人员出示此二维码</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 底部导航 -->
		<BottomNav :current="3" />
	</view>
</template>

<script>
import BottomNav from '@/components/BottomNav.vue'
import { api } from '@/api/request'
import UQRCode from 'uqrcodejs'

export default {
	components: { BottomNav },
	data() {
		return {
			assets: {
				avatar: 'https://www.figma.com/api/mcp/asset/48dced70-d93c-4c7e-ace6-c3b399ca5a05',
				iconSettings: 'https://www.figma.com/api/mcp/asset/51c7f686-bd66-4431-934b-4740a9719f6a',
				iconVip: 'https://www.figma.com/api/mcp/asset/e74344f2-0649-44d7-bb9f-08f2c853e984',
				iconInvite: 'https://www.figma.com/api/mcp/asset/97d47ae7-b35c-4d00-a688-1d5a2a7b8905',
				iconClock: 'https://www.figma.com/api/mcp/asset/ebdc0f3f-8fb4-4dcb-b0db-1a693cb69da8',
				iconLocation: 'https://www.figma.com/api/mcp/asset/7cd435a5-6518-4258-bb95-7d274e49bf10',
				iconQr: 'https://www.figma.com/api/mcp/asset/3629e2b7-0fbd-4283-a904-2a39665d503c'
			},
			user: {
				name: '微信用户',
				phoneMasked: '138****8888',
				avatar: 'https://www.figma.com/api/mcp/asset/48dced70-d93c-4c7e-ace6-c3b399ca5a05'
			},
			vip: {
				title: '普通用户',
				expireAt: '',
				stats: { left: 0, bound: 0, points: 0 }
			},
			purchaseRecords: [],
			tab: 'all',
			orders: [], // 预约订单列表，从数据库获取
			showVerifyModal: false, // 是否显示核销码弹窗
			currentVerifyOrder: null, // 当前要显示核销码的订单
			qrCodeImage: '' // 二维码图片数据
		}
	},
	computed: {
		filteredOrders() {
			if (this.tab === 'all') return this.orders
			return this.orders.filter(o => o.status === this.tab)
		},
		// 判断是否是普通用户（没有生效中的卡）
		isNormalUser() {
			if (!this.purchaseRecords || this.purchaseRecords.length === 0) {
				return true
			}
			
			// 检查是否有生效中的卡
			const now = new Date()
			now.setHours(0, 0, 0, 0)
			
			const hasActiveCard = this.purchaseRecords.some(record => {
				if (record.status !== '生效中') {
					return false
				}
				
				// 检查日期是否在有效期内
				if (record.cardStartDate && record.cardEndDate) {
					const startDate = new Date(record.cardStartDate)
					startDate.setHours(0, 0, 0, 0)
					const endDate = new Date(record.cardEndDate)
					endDate.setHours(0, 0, 0, 0)
					return now >= startDate && now <= endDate
				} else if (record.cardEndDate) {
					const endDate = new Date(record.cardEndDate)
					endDate.setHours(0, 0, 0, 0)
					return now <= endDate
				} else if (record.cardStartDate) {
					const startDate = new Date(record.cardStartDate)
					startDate.setHours(0, 0, 0, 0)
					return now >= startDate
				}
				return true // 没有日期限制，且状态为"生效中"
			})
			
			return !hasActiveCard
		}
	},
	onLoad() {
		this.loadUserInfo()
		this.loadPurchaseRecords()
		this.loadBookingOrders()
	},
	onShow() {
		// 页面显示时重新加载用户信息（从登录页面返回时刷新）
		this.loadUserInfo()
		this.loadPurchaseRecords()
		this.loadBookingOrders()
	},
	methods: {
		// 加载用户信息
		async loadUserInfo() {
			try {
				// 先从本地存储读取
				const localUserInfo = uni.getStorageSync('userInfo')
				if (localUserInfo) {
					this.updateUserInfo(localUserInfo)
				}
				
				// 如果有 token，尝试从服务器获取最新用户信息
				const token = uni.getStorageSync('token')
				if (token) {
					try {
						const response = await api.user.getInfo()
						if (response.code === 200 && response.data) {
							this.updateUserInfo(response.data)
							// 更新本地存储
							uni.setStorageSync('userInfo', response.data)
						}
					} catch (error) {
						console.log('获取用户信息失败，使用本地存储:', error)
					}
				}
			} catch (error) {
				console.error('加载用户信息错误:', error)
			}
		},
		// 更新用户信息显示
		updateUserInfo(userInfo) {
			if (!userInfo) return
			
			// 更新昵称
			if (userInfo.nickname || userInfo.name) {
				this.user.name = userInfo.nickname || userInfo.name || '微信用户'
			}
			
			// 更新头像
			if (userInfo.avatar || userInfo.avatarUrl) {
				this.user.avatar = userInfo.avatar || userInfo.avatarUrl
			}
			
			// 更新手机号（掩码显示）
			if (userInfo.phone) {
				this.user.phoneMasked = this.maskPhone(userInfo.phone)
			} else if (userInfo.phoneNumber) {
				this.user.phoneMasked = this.maskPhone(userInfo.phoneNumber)
			}
			
			// 只有在有生效中的卡时才更新会员卡信息
			// 如果没有生效中的卡，保持普通用户状态（由 loadPurchaseRecords 设置）
			if (!this.isNormalUser) {
				// 更新会员卡信息
				if (userInfo.packageName) {
					this.vip.title = userInfo.packageName
				}
				
				// 更新剩余次数
				if (userInfo.remainingVisits !== undefined && userInfo.remainingVisits !== null) {
					this.vip.stats.left = userInfo.remainingVisits
				}
				
				// 更新积分余额
				if (userInfo.points !== undefined && userInfo.points !== null) {
					this.vip.stats.points = userInfo.points
				}
				
				// 更新会员到期时间
				if (userInfo.memberExpireTime) {
					// 格式化日期：2028-01-10
					const expireDate = new Date(userInfo.memberExpireTime)
					const year = expireDate.getFullYear()
					const month = String(expireDate.getMonth() + 1).padStart(2, '0')
					const day = String(expireDate.getDate()).padStart(2, '0')
					this.vip.expireAt = `${year}-${month}-${day}`
				}
				
				// 更新已绑定数量（如果有的话，暂时保持默认值0）
				// 如果后端有返回绑定数量，可以在这里更新
				if (userInfo.boundCount !== undefined && userInfo.boundCount !== null) {
					this.vip.stats.bound = userInfo.boundCount
				}
			}
		},
		// 手机号掩码处理
		maskPhone(phone) {
			if (!phone || phone.length < 11) return phone
			// 格式：138****8888
			return phone.substring(0, 3) + '****' + phone.substring(7)
		},
		// 加载购卡记录
		async loadPurchaseRecords() {
			const token = uni.getStorageSync('token')
			if (!token) {
				// 未登录时清空记录，设置为普通用户
				this.purchaseRecords = []
				this.setNormalUserState()
				return
			}
			
			try {
				const response = await api.payment.getOrders()
				if (response.code === 200 && response.data) {
					// 转换数据格式
					this.purchaseRecords = response.data
						.filter(order => order.status === 'paid') // 只显示已支付的订单
						.map(order => this.formatPurchaseRecord(order))
						.sort((a, b) => {
							// 按购买时间倒序排列（最新的在前）
							return new Date(b.buyAt) - new Date(a.buyAt)
						})
					
					// 检查是否有生效中的卡，如果没有，设置为普通用户状态
					if (this.isNormalUser) {
						this.setNormalUserState()
					}
				} else {
					this.purchaseRecords = []
					this.setNormalUserState()
				}
			} catch (error) {
				console.error('获取购卡记录失败:', error)
				this.purchaseRecords = []
				this.setNormalUserState()
			}
		},
		// 设置为普通用户状态
		setNormalUserState() {
			this.vip.title = '普通用户'
			this.vip.expireAt = ''
			this.vip.stats.left = 0
			this.vip.stats.bound = 0
			this.vip.stats.points = 0
		},
		// 格式化购卡记录
		formatPurchaseRecord(order) {
			// 格式化价格：¥1,680
			const formattedPrice = '¥' + order.price.toLocaleString('zh-CN', {
				minimumFractionDigits: 0,
				maximumFractionDigits: 0
			})
			
			// 格式化购买日期：2026-01-10
			const buyDate = order.paymentTime || order.createdAt
			let formattedDate = ''
			if (buyDate) {
				const date = new Date(buyDate)
				const year = date.getFullYear()
				const month = String(date.getMonth() + 1).padStart(2, '0')
				const day = String(date.getDate()).padStart(2, '0')
				formattedDate = `${year}-${month}-${day}`
			}
			
			// 格式化卡开始日期：2026-01-10
			let formattedStartDate = ''
			if (order.cardStartDate) {
				const startDate = new Date(order.cardStartDate)
				const year = startDate.getFullYear()
				const month = String(startDate.getMonth() + 1).padStart(2, '0')
				const day = String(startDate.getDate()).padStart(2, '0')
				formattedStartDate = `${year}-${month}-${day}`
			}
			
			// 格式化卡到期日期：2026-01-10
			let formattedEndDate = ''
			if (order.cardEndDate) {
				const endDate = new Date(order.cardEndDate)
				const year = endDate.getFullYear()
				const month = String(endDate.getMonth() + 1).padStart(2, '0')
				const day = String(endDate.getDate()).padStart(2, '0')
				formattedEndDate = `${year}-${month}-${day}`
			}
			
			// 判断状态：未生效/生效中/已过期
			// 1. 如果当前时间 < 卡开始日期 → 未生效
			// 2. 如果当前时间 >= 卡开始日期 且 当前时间 <= 卡到期日期 → 生效中
			// 3. 如果当前时间 > 卡到期日期 → 已过期
			let status = '已过期'
			let statusPillClass = 'pill-gray'
			let statusTextClass = 'pill-text-gray'
			
			if (order.status === 'paid') {
				const now = new Date()
				now.setHours(0, 0, 0, 0)
				
				// 检查卡开始日期
				if (order.cardStartDate) {
					const startDate = new Date(order.cardStartDate)
					startDate.setHours(0, 0, 0, 0)
					
					// 如果当前时间 < 卡开始日期，则为未生效
					if (now < startDate) {
						status = '未生效'
						statusPillClass = 'pill-warm'
						statusTextClass = 'pill-text-warm'
					} else {
						// 当前时间 >= 卡开始日期，检查是否过期
						if (order.cardEndDate) {
							const endDate = new Date(order.cardEndDate)
							endDate.setHours(0, 0, 0, 0)
							
							// 如果当前时间 <= 到期日期，则为生效中；否则为已过期
							if (now <= endDate) {
								status = '生效中'
								statusPillClass = 'pill-green'
								statusTextClass = 'pill-text-green'
							} else {
								status = '已过期'
								statusPillClass = 'pill-gray'
								statusTextClass = 'pill-text-gray'
							}
						} else {
							// 没有卡到期日期（可能是无限期），默认为生效中
							status = '生效中'
							statusPillClass = 'pill-green'
							statusTextClass = 'pill-text-green'
						}
					}
				} else {
					// 没有卡开始日期，检查到期日期
					if (order.cardEndDate) {
						const endDate = new Date(order.cardEndDate)
						endDate.setHours(0, 0, 0, 0)
						
						if (now <= endDate) {
							status = '生效中'
							statusPillClass = 'pill-green'
							statusTextClass = 'pill-text-green'
						} else {
							status = '已过期'
							statusPillClass = 'pill-gray'
							statusTextClass = 'pill-text-gray'
						}
					} else {
						// 既没有开始日期也没有到期日期，默认为生效中
						status = '生效中'
						statusPillClass = 'pill-green'
						statusTextClass = 'pill-text-green'
					}
				}
			}
			
			// 根据套餐名称选择图标和背景色
			// 默认使用暖色图标和背景
			let icon = 'https://www.figma.com/api/mcp/asset/53c6b923-1424-4cc2-9923-6bda581a5924'
			let iconBg = 'bg-warm'
			
			// 如果套餐名称包含"家庭"或"100次"，使用灰色图标
			if (order.packageName && (order.packageName.includes('家庭') || order.packageName.includes('100次'))) {
				icon = 'https://www.figma.com/api/mcp/asset/bd32f170-e8c9-4a38-8b65-ac6e5513a467'
				iconBg = 'bg-gray'
			}
			
			return {
				name: order.packageName || '未知套餐',
				buyAt: formattedDate,
				cardStartDate: formattedStartDate,
				cardEndDate: formattedEndDate,
				price: formattedPrice,
				status: status,
				icon: icon,
				iconBg: iconBg,
				statusPillClass: statusPillClass,
				statusTextClass: statusTextClass,
				packageCategory: order.packageCategory || '', // 保存套餐分类
				packageId: order.packageId // 保存套餐ID
			}
		},
		// 加载预约订单
		async loadBookingOrders() {
			const token = uni.getStorageSync('token')
			if (!token) {
				// 未登录时清空订单
				this.orders = []
				return
			}
			
			try {
				const response = await api.booking.getOrders()
				if (response.code === 200 && response.data) {
					// 转换数据格式
					this.orders = response.data
						.map(order => this.formatBookingOrder(order))
						.sort((a, b) => {
							// 按日期倒序排列（最新的在前）
							return new Date(b.date) - new Date(a.date)
						})
				} else {
					this.orders = []
				}
			} catch (error) {
				console.error('获取预约订单失败:', error)
				this.orders = []
			}
		},
		// 格式化预约订单
		formatBookingOrder(order) {
			// 格式化日期：2026-01-14
			let formattedDate = order.date || ''
			
			// 格式化时间：18:45–19:45
			let formattedTime = order.timeSlot || ''
			// 将时间格式中的 - 替换为 –（中文破折号）
			formattedTime = formattedTime.replace(/-/g, '–')
			
			// 舱位名称：1号舱
			const cabin = order.cabinName || ''
			
			// 座位名称：A座
			const site = order.seatName || ''
			
			// 判断状态：pending -> 待核销, completed -> 已完成
			let status = 'pending'
			let statusText = '待核销'
			let statusBadgeClass = 'badge-warm'
			let statusTextClass = 'badge-warm-text'
			let showVerify = false
			
			if (order.status === 'completed') {
				status = 'done'
				statusText = '已完成'
				statusBadgeClass = 'badge-gray'
				statusTextClass = 'badge-gray-text'
				showVerify = false
			} else if (order.status === 'pending') {
				status = 'pending'
				statusText = '待核销'
				statusBadgeClass = 'badge-warm'
				statusTextClass = 'badge-warm-text'
				showVerify = true
			}
			
			return {
				cabin: cabin,
				date: formattedDate,
				time: formattedTime,
				site: site,
				status: status,
				statusText: statusText,
				statusBadgeClass: statusBadgeClass,
				statusTextClass: statusTextClass,
				showVerify: showVerify,
				orderId: order.id, // 保存订单ID，用于核销码展示
				orderNo: order.orderNo || order.id // 保存订单号，用于核销码展示
			}
		},
		navigateToLogin() {
			uni.navigateTo({
				url: '/pages/login/login'
			})
		},
		setTab(v) {
			this.tab = v
		},
		onInvite() {
			// 检查当前是否有生效中的"多人尊享"卡
			const now = new Date()
			now.setHours(0, 0, 0, 0)
			
			// 从购卡记录中找到生效中的卡（状态为"生效中"）
			const activeCard = this.purchaseRecords.find(record => {
				// 首先检查状态
				if (record.status !== '生效中') {
					return false
				}
				
				// 再次验证日期是否在有效期内（双重检查）
				if (record.cardStartDate && record.cardEndDate) {
					const startDate = new Date(record.cardStartDate)
					startDate.setHours(0, 0, 0, 0)
					const endDate = new Date(record.cardEndDate)
					endDate.setHours(0, 0, 0, 0)
					return now >= startDate && now <= endDate
				} else if (record.cardEndDate) {
					const endDate = new Date(record.cardEndDate)
					endDate.setHours(0, 0, 0, 0)
					return now <= endDate
				} else if (record.cardStartDate) {
					const startDate = new Date(record.cardStartDate)
					startDate.setHours(0, 0, 0, 0)
					return now >= startDate
				}
				// 没有日期限制，且状态为"生效中"，认为是生效的卡
				return true
			})
			
			// 如果没有生效中的卡
			if (!activeCard) {
				uni.showToast({ title: '该卡无法邀请亲友', icon: 'none' })
				return
			}
			
			// 检查是否是"多人尊享"类型
			if (activeCard.packageCategory !== '多人尊享') {
				uni.showToast({ title: '该卡无法邀请亲友', icon: 'none' })
				return
			}
			
			// 如果是"多人尊享"卡，执行邀请功能
			uni.showToast({ title: '邀请功能待接入', icon: 'none' })
		},
		onShowVerifyCode(order) {
			// 显示核销码弹窗
			if (order && (order.orderId || order.orderNo)) {
				this.currentVerifyOrder = order
				this.showVerifyModal = true
				// 清空之前的二维码，显示加载状态
				this.qrCodeImage = ''
				// 立即开始生成二维码（不等待弹窗动画）
				this.generateQRCode(order.orderNo || order.orderId)
			} else {
				uni.showToast({ title: '核销码信息错误', icon: 'none' })
			}
		},
		generateQRCode(orderNo) {
			// 使用 UQRCode 生成二维码
			// 在 uni-app 中，需要等待 DOM 渲染完成
			this.$nextTick(() => {
				// 减少延迟时间，从 500ms 减少到 100ms
				setTimeout(() => {
					try {
						// 创建 canvas 上下文
						const ctx = uni.createCanvasContext('qrcode-canvas', this)
						
						// 创建 UQRCode 实例
						const qr = new UQRCode({
							canvasContext: ctx,
							text: String(orderNo), // 二维码内容为订单号
							size: 300, // 二维码大小
							margin: 10,
							backgroundColor: '#ffffff',
							foregroundColor: '#000000',
							errorCorrectLevel: UQRCode.errorCorrectLevel.M
						})
						
						// 生成二维码
						qr.make()
						
						// 绘制到 canvas
						qr.drawCanvas().then(() => {
							// 减少延迟时间，从 300ms 减少到 50ms
							setTimeout(() => {
								uni.canvasToTempFilePath({
									canvasId: 'qrcode-canvas',
									success: (canvasRes) => {
										this.qrCodeImage = canvasRes.tempFilePath
									},
									fail: (err) => {
										console.error('导出 canvas 失败:', err)
										this.qrCodeImage = ''
									}
								}, this)
							}, 50)
						}).catch((err) => {
							console.error('绘制二维码失败:', err)
							// 如果绘制失败，尝试从 canvas 导出
							setTimeout(() => {
								uni.canvasToTempFilePath({
									canvasId: 'qrcode-canvas',
									success: (canvasRes) => {
										this.qrCodeImage = canvasRes.tempFilePath
									},
									fail: (canvasErr) => {
										console.error('导出 canvas 失败:', canvasErr)
										this.qrCodeImage = ''
									}
								}, this)
							}, 50)
						})
					} catch (error) {
						console.error('生成二维码异常:', error)
						this.qrCodeImage = ''
					}
				}, 100) // 减少延迟到 100ms，确保 canvas 已渲染
			})
		},
		closeVerifyModal() {
			this.showVerifyModal = false
			this.currentVerifyOrder = null
			this.qrCodeImage = ''
		}
	}
}
</script>

<style scoped>
/* 以 Figma 393px 画板为基准，转换为 rpx：750/393 ≈ 1.908 */
.page {
	position: relative;
	min-height: 100vh;
	background: #ffffff;
}

.topbar {
	position: fixed;
	left: 0;
	top: 0;
	width: 750rpx;
	height: 116rpx; /* 61px */
	padding: 0 38rpx; /* 20px */
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
	padding-bottom: 2rpx;
	background: rgba(249, 249, 249, 0.9);
	border-bottom: 2rpx solid #f3f4f6;
	z-index: 10;
}

.topbar-title {
	font-size: 44rpx; /* 调大约16% */
	font-weight: 500;
	line-height: 62rpx;
	letter-spacing: 2.96rpx;
	color: #333333;
}

.topbar-icon {
	width: 38rpx; /* 20px */
	height: 38rpx;
	margin-bottom: 14rpx;
}

.scroll {
	height: 100vh;
	background: #ffffff;
}

.content {
	padding-top: 136rpx; /* topbar + 约(72px)视觉留白 */
	padding-left: 38rpx;
	padding-right: 38rpx;
	padding-bottom: 184rpx; /* BottomNav 已固定 */
	background: #f9f9f9;
	min-height: 100vh;
}

.user-row {
	display: flex;
	align-items: center;
	gap: 30rpx; /* 16px */
	margin-top: 0;
	cursor: pointer;
}

.avatar-wrap {
	width: 122rpx; /* 64px */
	height: 122rpx;
	border-radius: 9999rpx;
	border: 4rpx solid #ffffff;
	background: #e5e7eb;
	box-shadow: 0 8rpx 12rpx -2rpx rgba(0, 0, 0, 0.1), 0 4rpx 8rpx -4rpx rgba(0, 0, 0, 0.1);
	overflow: hidden;
}
.avatar {
	width: 100%;
	height: 100%;
	border-radius: 9999rpx;
}

.user-meta {
	display: flex;
	flex-direction: column;
	gap: 4rpx;
	height: 92rpx; /* 48px */
	justify-content: center;
}
.user-name {
	font-size: 44rpx; /* 调大约16% */
	line-height: 62rpx;
	font-weight: 500;
	color: #101828;
	letter-spacing: 0.1rpx;
}
.user-phone {
	font-size: 32rpx; /* 调大约18% */
	line-height: 44rpx;
	font-weight: 300;
	color: #6a7282;
	letter-spacing: 1.05rpx;
}

.vip-card {
	margin-top: 80rpx; /* 42px：头像区到底部到会员卡顶部的间距 */
	width: 674rpx; /* 353px */
	height: 421rpx; /* 220.625px */
	border-radius: 46rpx; /* 24px */
	background: linear-gradient(180deg, #1a3c2f 0%, #0d2019 100%);
	box-shadow: 0 48rpx 96rpx -24rpx rgba(0, 0, 0, 0.25);
	position: relative;
	overflow: hidden;
}
.vip-glow {
	position: absolute;
	right: 0;
	top: 192rpx; /* 100.63px */
	width: 305rpx; /* 160px */
	height: 305rpx;
	border-radius: 9999rpx;
	background: #ffffff;
	opacity: 0.05;
	filter: blur(40px);
}
.vip-inner {
	position: absolute;
	left: 61rpx; /* 32px */
	top: 61rpx;
	width: 552rpx; /* 289px */
	height: 299rpx; /* 156.625px */
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}
.vip-top {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
}
.vip-title-row {
	display: flex;
	align-items: center;
	gap: 16rpx; /* 8px */
}
.vip-title-icon {
	width: 38rpx; /* 20px */
	height: 38rpx;
}
.vip-title {
	font-size: 40rpx; /* 调大约18% */
	line-height: 62rpx;
	font-weight: 500;
	color: #e8dcc4;
	letter-spacing: 2.6rpx;
}
.vip-invite {
	height: 55rpx; /* 29px */
	padding: 2rpx 25rpx;
	border-radius: 9999rpx;
	border: 2rpx solid rgba(255, 255, 255, 0.1);
	background: rgba(255, 255, 255, 0.2);
	display: flex;
	align-items: center;
	gap: 12rpx;
}
.vip-invite-icon {
	width: 23rpx; /* 12px */
	height: 23rpx;
}
.vip-invite-text {
	font-size: 23rpx; /* 调大约21% */
	line-height: 34rpx;
	font-weight: 300;
	color: #e8dcc4;
	letter-spacing: 0.22rpx;
}
.vip-subtitle {
	margin-top: 10rpx;
	font-size: 28rpx; /* 调大约22% */
	line-height: 36rpx;
	font-weight: 300;
	color: rgba(232, 220, 196, 0.7);
	letter-spacing: 0.57rpx;
}
.vip-stats {
	display: flex;
	gap: 76rpx; /* 40px */
}
.vip-stat {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}
.vip-stat-value {
	font-size: 66rpx; /* 调大约16% */
	line-height: 80rpx;
	font-weight: 300;
	color: #e8dcc4;
	letter-spacing: -0.68rpx;
}
.vip-stat-label {
	font-size: 23rpx; /* 调大约21% */
	line-height: 34rpx;
	font-weight: 400;
	color: rgba(232, 220, 196, 0.6);
	letter-spacing: 1.18rpx;
}

.section {
	margin-top: 82rpx; /* 43px 左右 */
	width: 674rpx; /* 353px：保证购卡/预约区域整体宽度一致 */
}
.section-title {
	font-size: 40rpx; /* 调大约18% */
	line-height: 62rpx;
	font-weight: 500;
	color: #101828;
	padding-left: 8rpx;
}

.card {
	margin-top: 38rpx; /* 20px */
	background: #ffffff;
	border: 2rpx solid #f9fafb;
	border-radius: 30rpx; /* 16px */
	box-shadow: 0 4rpx 29rpx 0 rgba(0, 0, 0, 0.03);
	overflow: hidden;
	min-height: 100rpx;
}

.empty-records {
	padding: 60rpx 38rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.empty-text {
	color: #99a1af;
	font-size: 28rpx;
	font-weight: 300;
	line-height: 40rpx;
}

.record-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 38rpx;
	min-height: 170rpx; /* 89px，改为 min-height 以适应更多内容 */
	padding-top: 24rpx;
	padding-bottom: 24rpx;
}
.record-row-last {
	min-height: 168rpx; /* 88px：第二行略矮，贴近 Figma */
}
.record-row-border {
	border-bottom: 2rpx solid #f9fafb;
}
.record-left {
	display: flex;
	align-items: flex-start;
	gap: 30rpx;
}
.record-icon {
	width: 76rpx; /* 40px */
	height: 76rpx;
	border-radius: 9999rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0; /* 防止图标被压缩 */
}
.record-icon-img {
	width: 34rpx; /* 18px */
	height: 34rpx;
}
.bg-warm {
	background: #fff8e1;
}
.bg-gray {
	background: #f3f4f6;
}
.record-meta {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}
.record-name {
	font-size: 32rpx; /* 调大约18% */
	line-height: 44rpx;
	font-weight: 500;
	color: #101828;
}
.record-date {
	font-size: 28rpx; /* 调大约22% */
	line-height: 36rpx;
	font-weight: 300;
	color: #99a1af;
	margin-top: 4rpx;
}

.record-dates {
	display: flex;
	flex-direction: column;
	gap: 4rpx;
	margin-top: 8rpx;
}

.record-date-item {
	font-size: 28rpx; /* 与购买日期字体大小一致 */
	line-height: 36rpx;
	font-weight: 300;
	color: #99a1af;
	letter-spacing: 0.12rpx;
}
.record-right {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 20rpx;
}
.record-price {
	font-size: 32rpx; /* 调大约18% */
	line-height: 44rpx;
	font-weight: 500;
	color: #101828;
}
.pill {
	padding: 4rpx 15rpx;
	border-radius: 9999rpx;
	height: 36rpx; /* 调大约20%以适配更大字体 */
	display: flex;
	align-items: center;
}
.pill-text {
	font-size: 23rpx; /* 调大约21% */
	line-height: 34rpx;
	font-weight: 300;
	letter-spacing: 0.7rpx;
}
.pill-green {
	background: #e8f5e9;
}
.pill-text-green {
	color: #2e7d32;
}
.pill-gray {
	background: #f3f4f6;
}
.pill-text-gray {
	color: #99a1af;
}
.pill-warm {
	background: #fff8e1;
}
.pill-text-warm {
	color: #f57c00;
}

.section-booking {
	margin-top: 82rpx; /* 与“购卡记录”保持一致 */
}
.tabs {
	margin-top: 22rpx;
	height: 61rpx; /* 32px */
	border-bottom: 2rpx solid #f3f4f6;
	display: flex;
	align-items: flex-start;
	gap: 60rpx; /* 增加间距，从32rpx调整为60rpx */
	width: 674rpx;
	padding-left: 8rpx; /* 与标题左缩进对齐 */
	box-sizing: border-box;
}
.tab {
	position: relative;
	height: 61rpx;
	display: inline-flex;
	align-items: center;
}
.tab-text {
	font-size: 32rpx; /* 调大约18% */
	line-height: 44rpx;
	font-weight: 300;
	color: #99a1af;
	letter-spacing: 0.38rpx;
	white-space: nowrap;
}
.tab-text.active {
	color: #4a5d50;
}
.tab-underline {
	position: absolute;
	left: 0;
	bottom: 0;
	width: 100%; /* 跟随tab宽度，即文字宽度 */
	height: 4rpx; /* 2px */
	background: #4a5d50;
}

.booking-list {
	margin-top: 30rpx;
	display: flex;
	flex-direction: column;
	gap: 29rpx; /* 15px */
	width: 674rpx;
}
.booking-card {
	background: #ffffff;
	border: 2rpx solid #f9fafb;
	border-radius: 30rpx;
	box-shadow: 0 4rpx 29rpx 0 rgba(0, 0, 0, 0.03);
	padding: 38rpx; /* 20px：与购卡记录每行左右 padding 对齐 */
	width: 674rpx;
	box-sizing: border-box;
}
.booking-head {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
}
.booking-head-left {
	display: flex;
	align-items: center;
	gap: 15rpx; /* 8px */
}
.badge-cabin {
	background: rgba(74, 93, 80, 0.1);
	border-radius: 8rpx;
	height: 50rpx; /* 调大约14%以适配更大字体 */
	padding: 0 19rpx;
	display: flex;
	align-items: center;
}
.badge-cabin-text {
	font-size: 23rpx; /* 调大约21% */
	line-height: 34rpx;
	font-weight: 500;
	color: #4a5d50;
}
.booking-date {
	font-size: 32rpx; /* 调大约18% */
	line-height: 44rpx;
	font-weight: 500;
	color: #1e2939;
	letter-spacing: 0.38rpx;
}
.badge-status {
	height: 50rpx; /* 调大约14%以适配更大字体 */
	padding: 0 19rpx;
	border-radius: 9999rpx;
	display: flex;
	align-items: center;
}
.badge-status-text {
	font-size: 23rpx; /* 调大约21% */
	line-height: 34rpx;
	font-weight: 300;
	letter-spacing: 0.7rpx;
}
.badge-warm {
	background: #fff8e1;
}
.badge-warm-text {
	color: #b88c48;
}
.badge-gray {
	background: #f3f4f6;
}
.badge-gray-text {
	color: #99a1af;
}
.booking-meta {
	margin-top: 30rpx;
	display: flex;
	align-items: center;
	gap: 46rpx; /* 24px */
}
.booking-meta-item {
	display: flex;
	align-items: center;
	gap: 12rpx; /* 6px */
}
.booking-meta-icon {
	width: 27rpx; /* 14px */
	height: 27rpx;
}
.booking-meta-text {
	font-size: 28rpx; /* 调大约22% */
	line-height: 36rpx;
	font-weight: 300;
	color: #6a7282;
}
.booking-foot {
	margin-top: 32rpx;
	padding-top: 32rpx; /* 17px */
	border-top: 2rpx solid #f9fafb;
	display: flex;
	justify-content: flex-end;
}
.verify-btn {
	display: flex;
	align-items: center;
	gap: 15rpx; /* 8px */
	height: 38rpx; /* 20px */
}
.verify-icon {
	width: 30rpx; /* 16px */
	height: 30rpx;
}
.verify-text {
	font-size: 32rpx; /* 调大约18% */
	line-height: 44rpx;
	font-weight: 400;
	color: #4a5d50;
	letter-spacing: 0.38rpx;
}

/* 核销码弹窗样式 */
.verify-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 9999;
}
.verify-modal-content {
	width: 600rpx;
	background: #ffffff;
	border-radius: 24rpx;
	overflow: hidden;
}
.verify-modal-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 40rpx 40rpx 30rpx;
	border-bottom: 1rpx solid #f3f4f6;
}
.verify-modal-title {
	font-size: 36rpx;
	line-height: 50rpx;
	font-weight: 500;
	color: #1e2939;
}
.verify-modal-close {
	font-size: 48rpx;
	line-height: 48rpx;
	color: #99a1af;
	width: 48rpx;
	height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}
.verify-modal-body {
	padding: 40rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}
.verify-qr-container {
	width: 400rpx;
	height: 400rpx;
	background: #f9fafb;
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 40rpx;
	position: relative;
	overflow: hidden;
}
.verify-qr-placeholder {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #ffffff;
	border-radius: 16rpx;
	border: 2rpx dashed #e5e7eb;
}
.verify-qr-text {
	font-size: 48rpx;
	line-height: 64rpx;
	font-weight: 600;
	color: #4a5d50;
	letter-spacing: 2rpx;
}
.verify-qr-canvas {
	position: fixed;
	top: -9999px;
	left: -9999px;
	width: 300px;
	height: 300px;
	opacity: 0;
	pointer-events: none;
	z-index: -1;
}
.verify-qr-image {
	width: 100%;
	height: 100%;
	border-radius: 16rpx;
	position: relative;
	z-index: 1;
}
.verify-code-text {
	display: flex;
	align-items: center;
	gap: 16rpx;
	margin-bottom: 30rpx;
}
.verify-code-label {
	font-size: 28rpx;
	line-height: 40rpx;
	font-weight: 400;
	color: #99a1af;
}
.verify-code-value {
	font-size: 32rpx;
	line-height: 44rpx;
	font-weight: 600;
	color: #4a5d50;
	letter-spacing: 1rpx;
}
.verify-tips {
	margin-top: 20rpx;
}
.verify-tips-text {
	font-size: 26rpx;
	line-height: 36rpx;
	font-weight: 300;
	color: #99a1af;
}

.bottom-safe {
	height: 30rpx;
}
</style>

