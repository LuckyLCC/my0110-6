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
				<view class="user-row" @tap="navigateToProfile">
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
								<text class="vip-stat-value">
									{{ vip.packageCategory === '家庭/次卡' ? vip.stats.left : '∞' }}
								</text>
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
							@tap="showCardDetail(item)"
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
						<view class="tab" @tap="setTab('cancelled')">
							<text class="tab-text" :class="{ active: tab === 'cancelled' }">已取消</text>
							<view v-if="tab === 'cancelled'" class="tab-underline" />
						</view>
						<view class="tab" @tap="setTab('no_show')">
							<text class="tab-text" :class="{ active: tab === 'no_show' }">未到店</text>
							<view v-if="tab === 'no_show'" class="tab-underline" />
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
							<view v-if="order.showVerify || order.showCancel" class="booking-foot">
								<view v-if="order.showCancel" class="cancel-btn" @tap="onCancelBooking(order)">
									<text class="cancel-text">取消预约</text>
								</view>
								<view v-if="order.showVerify" class="verify-btn" @tap="onShowVerifyCode(order)">
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

		<!-- 购卡详情弹窗 -->
		<view v-if="showDetailModal" class="card-detail-modal" @tap="closeCardDetail">
			<view class="card-detail-content" @tap.stop>
				<view class="card-detail-header">
					<view class="card-detail-title-row">
						<text class="card-detail-title">{{ currentDetailRecord?.name || '卡券详情' }}</text>
					</view>
					<view class="card-detail-subtitle-row">
						<text class="card-detail-subtitle">查看您的卡券详细信息</text>
					</view>
				</view>
				
				<view class="card-detail-body">
					<!-- 卡种 -->
					<view class="detail-row">
						<text class="detail-label">卡种</text>
						<text class="detail-value">{{ currentDetailRecord?.name || '' }}</text>
					</view>
					
					<!-- 订单号 -->
					<view class="detail-row">
						<text class="detail-label">订单号</text>
						<view class="detail-value-box" @tap="copyOrderNo">
							<text class="detail-value-text">{{ currentDetailRecord?.orderNo || '' }}</text>
						</view>
					</view>
					
					<!-- 状态 -->
					<view class="detail-row">
						<text class="detail-label">状态</text>
						<view class="detail-status-badge" :class="currentDetailRecord?.statusPillClass">
							<text class="detail-status-text" :class="currentDetailRecord?.statusTextClass">{{ currentDetailRecord?.status || '' }}</text>
						</view>
					</view>
					
					<!-- 分隔线 -->
					<view class="detail-divider"></view>
					
					<!-- 开始日期 -->
					<view class="detail-row">
						<text class="detail-label">开始日期</text>
						<text class="detail-value">{{ currentDetailRecord?.cardStartDate || '' }}</text>
					</view>
					
					<!-- 结束日期 -->
					<view class="detail-row">
						<text class="detail-label">结束日期</text>
						<text class="detail-value">{{ currentDetailRecord?.cardEndDate || '' }}</text>
					</view>
					
					<!-- 支付时间 -->
					<view class="detail-row">
						<text class="detail-label">支付时间</text>
						<text class="detail-value">{{ formatPaymentTime(currentDetailRecord) }}</text>
					</view>
				</view>
				
				<view class="card-detail-footer">
					<view class="card-detail-close-btn" @tap="closeCardDetail">
						<text class="card-detail-close-text">关闭</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 邀请码弹窗 -->
		<view v-if="showInviteModal" class="invite-modal" @tap="closeInviteModal">
			<view class="invite-modal-content" @tap.stop>
				<view class="invite-modal-header">
					<text class="invite-modal-title">邀请亲友</text>
					<text class="invite-modal-close" @tap="closeInviteModal">×</text>
				</view>
				<view class="invite-modal-body">
					<view class="invite-code-container">
						<text class="invite-code-label">邀请码</text>
						<view class="invite-code-value">{{ inviteCode }}</view>
						<button class="invite-copy-btn" @tap="copyInviteCode">复制邀请码</button>
					</view>
					<view class="invite-qr-container">
						<canvas 
							canvas-id="invite-qrcode-canvas" 
							id="invite-qrcode-canvas"
							class="invite-qr-canvas"
							:style="{ width: '300px', height: '300px' }"
						></canvas>
						<image 
							v-if="inviteQrCodeImage" 
							class="invite-qr-image" 
							:src="inviteQrCodeImage" 
							mode="aspectFit"
						/>
					</view>
					<view class="invite-tips">
						<text class="invite-tips-text">分享邀请码或二维码给亲友，让他们绑定您的会员卡</text>
						<text class="invite-tips-subtext">（扫描二维码可获取邀请码，或点击下方按钮直接分享给微信好友）</text>
					</view>
					<button class="invite-share-btn" open-type="share">分享给微信好友</button>
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
import { BookingStatusLabelZh, CardStatusLabelZh } from '@/api/enums'
import UQRCode from 'uqrcodejs'

export default {
	components: { BottomNav },
	data() {
		return {
			assets: {
				avatar: '/static/my/avatar.png',
				iconSettings: '/static/my/Icon3.svg', // 设置图标（网格图标）
				iconVip: '/static/my/Icon1.svg', // VIP图标（星星图标）
				iconInvite: '/static/my/Icon2.svg', // 邀请图标（连接图标）
				iconClock: '/static/my/Icon4.svg', // 时钟图标（预约订单时间）
				iconLocation: '/static/my/Icon5.svg', // 位置图标（预约订单位置）
				iconQr: '/static/my/Icon3.svg' // 二维码图标（分享图标）
			},
			user: {
				name: '微信用户',
				phoneMasked: '138****8888',
				avatar: '/static/my/avatar.png'
			},
			vip: {
				title: '普通用户',
				expireAt: '',
				stats: { left: 0, bound: 0, points: 0 },
				packageCategory: '' // 当前生效卡的分类，用于判断是否显示具体次数
			},
			purchaseRecords: [],
			tab: 'all',
			orders: [], // 预约订单列表，从数据库获取
			showVerifyModal: false, // 是否显示核销码弹窗
			currentVerifyOrder: null, // 当前要显示核销码的订单
			qrCodeImage: '', // 二维码图片数据
			showInviteModal: false, // 是否显示邀请码弹窗
			inviteCode: '', // 邀请码
			currentInvitePaymentOrderId: null, // 当前邀请关联的支付订单ID
			inviteQrCodeImage: '', // 邀请二维码图片
			showDetailModal: false, // 是否显示购卡详情弹窗
			currentDetailRecord: null // 当前要显示的购卡详情记录
		}
	},
	computed: {
		filteredOrders() {
			if (this.tab === 'all') {
				// 全部标签显示所有订单（包括已取消）
				return this.orders
			} else if (this.tab === 'pending') {
				// 待核销标签只显示待核销的订单
				return this.orders.filter(o => o.status === 'pending')
			} else if (this.tab === 'done') {
				// 已完成标签只显示已完成的订单（不包括已取消）
				return this.orders.filter(o => o.status === 'done')
			} else if (this.tab === 'cancelled') {
				// 已取消标签只显示已取消的订单
				return this.orders.filter(o => o.status === 'cancelled')
			} else if (this.tab === 'no_show') {
				// 未到店标签只显示未到店的订单
				return this.orders.filter(o => o.status === 'no_show')
			}
			return this.orders
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
	// 微信分享功能
	onShareAppMessage(options) {
		console.log('onShareAppMessage 被调用，options:', options)
		console.log('showInviteModal:', this.showInviteModal)
		console.log('inviteCode:', this.inviteCode)
		
		// 如果正在显示邀请码弹窗，分享邀请链接
		if (this.showInviteModal && this.inviteCode) {
			const sharePath = `/pages/invite/accept?code=${this.inviteCode}`
			console.log('分享邀请码，路径:', sharePath)
			
			return {
				title: `邀请您加入城市森林氧舱会员，邀请码：${this.inviteCode}`,
				path: sharePath,
				imageUrl: '' // 可以设置分享图片，留空则使用小程序默认图片
				// 注意：imageUrl 必须是网络图片，不能是本地路径
				// 如果需要自定义分享图片，可以上传到服务器或使用 CDN
			}
		}
		
		// 默认分享
		console.log('默认分享')
		return {
			title: '城市森林氧舱',
			path: '/pages/index/index',
			imageUrl: ''
		}
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
			
			// 注意：会员卡信息（VIP信息）不再从 userInfo 中获取
			// 而是从购卡记录中找出生效中的卡来显示（在 loadPurchaseRecords 中处理）
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
						.filter(order => String(order.status || '').toLowerCase() === 'paid') // 只显示已支付的订单（兼容大小写）
						.map(order => this.formatPurchaseRecord(order))
						.sort((a, b) => {
							// 按购买时间倒序排列（最新的在前）
							return new Date(b.buyAt) - new Date(a.buyAt)
						})
					
					// 找出生效中的卡，并更新VIP信息
					this.updateVipFromActiveCard()
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
		// 从生效中的卡更新VIP信息
		updateVipFromActiveCard() {
			// 找出生效中的卡
			const now = new Date()
			now.setHours(0, 0, 0, 0)
			
			const activeCards = this.purchaseRecords.filter(record => {
				if (record.status !== '生效中') {
					return false
				}
				
				// 再次验证日期是否在有效期内
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
			
			// 如果没有生效中的卡，设置为普通用户状态
			if (activeCards.length === 0) {
				this.setNormalUserState()
				return
			}
			
			// 如果有多个生效中的卡，选择到期时间最晚的那个
			// 如果到期时间相同，选择购买时间最新的那个
			const activeCard = activeCards.sort((a, b) => {
				// 首先按到期时间倒序排列（到期时间最晚的在前）
				if (a.cardEndDate && b.cardEndDate) {
					const dateA = new Date(a.cardEndDate)
					const dateB = new Date(b.cardEndDate)
					if (dateA.getTime() !== dateB.getTime()) {
						return dateB.getTime() - dateA.getTime()
					}
				} else if (a.cardEndDate) {
					return -1 // a有到期时间，b没有，a优先
				} else if (b.cardEndDate) {
					return 1 // b有到期时间，a没有，b优先
				}
				// 如果到期时间相同或都没有，按购买时间倒序排列（最新的在前）
				return new Date(b.buyAt) - new Date(a.buyAt)
			})[0]
			
			// 使用生效中的卡更新VIP信息
			this.vip.title = activeCard.name
			this.vip.expireAt = activeCard.cardEndDate || ''
			this.vip.packageCategory = activeCard.packageCategory || '' // 保存当前生效卡的分类
			
			// 如果是家庭次卡，从购卡记录中获取剩余次数
			if (activeCard.packageCategory === '家庭/次卡') {
				// 如果后端返回了剩余次数，使用后端计算的值
				// 如果后端没有返回（可能是null或undefined），尝试从totalTimes和consumedTimes计算
				if (activeCard.remainingTimes !== undefined && activeCard.remainingTimes !== null) {
					this.vip.stats.left = activeCard.remainingTimes
				} else if (activeCard.totalTimes !== undefined && activeCard.totalTimes !== null) {
					// 如果后端没有返回remainingTimes，但返回了totalTimes，使用totalTimes作为初始值
					// 已消费次数可能是0（如果还没有核销记录）
					const consumed = activeCard.consumedTimes || 0
					this.vip.stats.left = Math.max(0, activeCard.totalTimes - consumed)
				} else {
					// 如果都没有，设置为0（不应该发生，但作为兜底）
					console.warn('家庭次卡没有剩余次数信息，activeCard:', activeCard)
					this.vip.stats.left = 0
				}
				// 只更新积分和已绑定，不更新剩余次数
				this.loadUserStatsForPointsAndBound()
			} else {
				// 其他卡种，从用户信息中获取
				this.loadUserStats()
			}
		},
		// 加载用户统计数据（剩余次数、积分等）
		async loadUserStats() {
			const token = uni.getStorageSync('token')
			if (!token) {
				return
			}
			
			try {
				const response = await api.user.getInfo()
				if (response.code === 200 && response.data) {
					const userInfo = response.data
					// 更新剩余次数（如果不是家庭次卡）
					if (this.vip.packageCategory !== '家庭/次卡') {
						if (userInfo.remainingVisits !== undefined && userInfo.remainingVisits !== null) {
							this.vip.stats.left = userInfo.remainingVisits
						}
					}
					// 更新积分余额
					if (userInfo.points !== undefined && userInfo.points !== null) {
						this.vip.stats.points = userInfo.points
					}
					// 更新已绑定数量
					if (userInfo.boundCount !== undefined && userInfo.boundCount !== null) {
						this.vip.stats.bound = userInfo.boundCount
					}
				}
			} catch (error) {
				console.error('获取用户统计数据失败:', error)
			}
		},
		// 只加载积分和已绑定数量（不更新剩余次数）
		async loadUserStatsForPointsAndBound() {
			const token = uni.getStorageSync('token')
			if (!token) {
				return
			}
			
			try {
				const response = await api.user.getInfo()
				if (response.code === 200 && response.data) {
					const userInfo = response.data
					// 更新积分余额
					if (userInfo.points !== undefined && userInfo.points !== null) {
						this.vip.stats.points = userInfo.points
					}
					// 更新已绑定数量
					if (userInfo.boundCount !== undefined && userInfo.boundCount !== null) {
						this.vip.stats.bound = userInfo.boundCount
					}
				}
			} catch (error) {
				console.error('获取用户统计数据失败:', error)
			}
		},
		// 设置为普通用户状态
		setNormalUserState() {
			this.vip.title = '普通用户'
			this.vip.expireAt = ''
			this.vip.stats.left = 0
			this.vip.stats.bound = 0
			this.vip.stats.points = 0
			this.vip.packageCategory = '' // 清空分类
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
			
			// cardStatus 为英文枚举（INACTIVE/ACTIVE/COMPLETED），显示时映射成中文
			let status = CardStatusLabelZh[String(order.cardStatus || '').trim().toUpperCase()] || '已完成'
			let statusPillClass = 'pill-gray'
			let statusTextClass = 'pill-text-gray'
			
			// 根据状态设置样式
			if (status === '未生效') {
				statusPillClass = 'pill-warm'
				statusTextClass = 'pill-text-warm'
			} else if (status === '生效中') {
				statusPillClass = 'pill-green'
				statusTextClass = 'pill-text-green'
			} else if (status === '已完成') {
				statusPillClass = 'pill-gray'
				statusTextClass = 'pill-text-gray'
			} else {
				// 如果数据库返回的状态不在预期范围内，使用默认逻辑计算（兜底）
				if (String(order.status || '').toLowerCase() === 'paid') {
					const now = new Date()
					now.setHours(0, 0, 0, 0)
					
					// 检查是否是次卡
					const isTimesCard = order.packageCategory === '家庭/次卡'
					
					// 对于次卡，先检查剩余次数
					if (isTimesCard && order.remainingTimes !== undefined && order.remainingTimes !== null) {
						if (order.remainingTimes <= 0) {
							status = '已完成'
							statusPillClass = 'pill-gray'
							statusTextClass = 'pill-text-gray'
						} else {
							// 次卡有剩余次数，继续检查日期
							if (order.cardStartDate) {
								const startDate = new Date(order.cardStartDate)
								startDate.setHours(0, 0, 0, 0)
								
								if (now < startDate) {
									status = '未生效'
									statusPillClass = 'pill-warm'
									statusTextClass = 'pill-text-warm'
								} else {
									if (order.cardEndDate) {
										const endDate = new Date(order.cardEndDate)
										endDate.setHours(0, 0, 0, 0)
										
										if (now <= endDate) {
											status = '生效中'
											statusPillClass = 'pill-green'
											statusTextClass = 'pill-text-green'
										} else {
											status = '已完成'
											statusPillClass = 'pill-gray'
											statusTextClass = 'pill-text-gray'
										}
									} else {
										status = '生效中'
										statusPillClass = 'pill-green'
										statusTextClass = 'pill-text-green'
									}
								}
							} else {
								if (order.cardEndDate) {
									const endDate = new Date(order.cardEndDate)
									endDate.setHours(0, 0, 0, 0)
									
									if (now <= endDate) {
										status = '生效中'
										statusPillClass = 'pill-green'
										statusTextClass = 'pill-text-green'
									} else {
										status = '已完成'
										statusPillClass = 'pill-gray'
										statusTextClass = 'pill-text-gray'
									}
								} else {
									status = '生效中'
									statusPillClass = 'pill-green'
									statusTextClass = 'pill-text-green'
								}
							}
						}
					} else {
						// 非次卡，按日期判断
						if (order.cardStartDate) {
							const startDate = new Date(order.cardStartDate)
							startDate.setHours(0, 0, 0, 0)
							
							if (now < startDate) {
								status = '未生效'
								statusPillClass = 'pill-warm'
								statusTextClass = 'pill-text-warm'
							} else {
								if (order.cardEndDate) {
									const endDate = new Date(order.cardEndDate)
									endDate.setHours(0, 0, 0, 0)
									
									if (now <= endDate) {
										status = '生效中'
										statusPillClass = 'pill-green'
										statusTextClass = 'pill-text-green'
									} else {
										status = '已完成'
										statusPillClass = 'pill-gray'
										statusTextClass = 'pill-text-gray'
									}
								} else {
									status = '生效中'
									statusPillClass = 'pill-green'
									statusTextClass = 'pill-text-green'
								}
							}
						} else {
							if (order.cardEndDate) {
								const endDate = new Date(order.cardEndDate)
								endDate.setHours(0, 0, 0, 0)
								
								if (now <= endDate) {
									status = '生效中'
									statusPillClass = 'pill-green'
									statusTextClass = 'pill-text-green'
								} else {
									status = '已完成'
									statusPillClass = 'pill-gray'
									statusTextClass = 'pill-text-gray'
								}
							} else {
								status = '生效中'
								statusPillClass = 'pill-green'
								statusTextClass = 'pill-text-green'
							}
						}
					}
				}
			}
			
			// 根据套餐名称选择图标（SVG已包含背景圆圈）
			// 默认使用暖色图标
			let icon = '/static/my/Container2.svg' // 黄色背景时钟图标
			let iconBg = '' // SVG已包含背景，不需要额外背景色
			
			// 如果套餐名称包含"家庭"或"100次"，使用灰色图标
			if (order.packageName && (order.packageName.includes('家庭') || order.packageName.includes('100次'))) {
				icon = '/static/my/Container1.svg' // 灰色背景时钟图标
				iconBg = '' // SVG已包含背景，不需要额外背景色
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
				packageId: order.packageId, // 保存套餐ID
				paymentOrderId: order.id, // 保存支付订单ID，用于生成邀请码
				id: order.id, // 同时保存 id，作为备用
				orderNo: order.orderNo || '', // 保存订单号
				remainingTimes: order.remainingTimes, // 剩余次数（家庭次卡）
				totalTimes: order.totalTimes, // 总次数（家庭次卡）
				consumedTimes: order.consumedTimes // 已消费次数（家庭次卡）
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
			// 后端现在返回枚举（PENDING/COMPLETED/...），这里统一规范化
			const rawStatus = String(order.status || '').trim().toUpperCase()

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
			
			// 判断状态：PENDING -> 待核销, COMPLETED -> 已完成, CANCELLED -> 已取消, NO_SHOW -> 未到店
			let status = 'pending'
			let statusText = '待核销'
			let statusBadgeClass = 'badge-warm'
			let statusTextClass = 'badge-warm-text'
			let showVerify = false
			let showCancel = false

			// 展示文案统一走映射表（内部 tab/status 仍用 pending/done/cancelled/no_show）
			// eslint-disable-next-line no-undef
			statusText = BookingStatusLabelZh[rawStatus] || statusText
			
			if (rawStatus === 'COMPLETED') {
				status = 'done'
				statusBadgeClass = 'badge-gray'
				statusTextClass = 'badge-gray-text'
				showVerify = false
				showCancel = false
			} else if (rawStatus === 'CANCELLED') {
				status = 'cancelled'
				statusBadgeClass = 'badge-gray'
				statusTextClass = 'badge-gray-text'
				showVerify = false
				showCancel = false
			} else if (rawStatus === 'NO_SHOW') {
				status = 'no_show'
				statusBadgeClass = 'badge-gray'
				statusTextClass = 'badge-gray-text'
				showVerify = false
				showCancel = false
			} else if (rawStatus === 'PENDING') {
				status = 'pending'
				statusBadgeClass = 'badge-warm'
				statusTextClass = 'badge-warm-text'
				showVerify = true
				showCancel = true // 待核销的订单可以取消
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
				showCancel: showCancel, // 是否显示取消按钮
				orderId: order.id, // 保存订单ID，用于核销码展示
				orderNo: order.orderNo || order.id // 保存订单号，用于核销码展示
			}
		},
		navigateToLogin() {
			uni.navigateTo({
				url: '/pages/login/login'
			})
		},
		navigateToProfile() {
			// 检查用户登录状态
			const token = uni.getStorageSync('token')
			if (token) {
				// 已登录：跳转到个人信息详情页
				uni.navigateTo({
					url: '/pages/my/profile'
				})
			} else {
				// 未登录：跳转到登录页
				uni.navigateTo({
					url: '/pages/login/login'
				})
			}
		},
		setTab(v) {
			this.tab = v
		},
		onInvite() {
			// 检查当前是否有生效中的"多人尊享"卡
			const now = new Date()
			now.setHours(0, 0, 0, 0)
			
			console.log('点击邀请，购卡记录:', this.purchaseRecords)
			
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
				console.log('未找到生效中的卡')
				uni.showToast({ title: '该卡无法邀请亲友', icon: 'none' })
				return
			}
			
			console.log('找到生效中的卡:', activeCard)
			
			// 检查是否是"多人尊享"类型
			if (activeCard.packageCategory !== '多人尊享') {
				console.log('不是多人尊享卡，分类:', activeCard.packageCategory)
				uni.showToast({ title: '该卡无法邀请亲友', icon: 'none' })
				return
			}
			
			// 如果是"多人尊享"卡，生成邀请码并显示
			console.log('准备生成邀请码，activeCard:', activeCard)
			this.generateInviteCode(activeCard)
		},
		// 生成邀请码
		async generateInviteCode(activeCard) {
			try {
				uni.showLoading({ title: '生成邀请码中...', mask: true })
				
				// 需要从原始订单数据中获取 paymentOrderId
				const token = uni.getStorageSync('token')
				if (!token) {
					uni.hideLoading()
					uni.showToast({ title: '请先登录', icon: 'none' })
					return
				}
				
				// 从购卡记录中找到对应的订单ID
				// 优先使用 paymentOrderId，如果没有则使用 id
				const paymentOrderId = activeCard.paymentOrderId || activeCard.id
				
				console.log('生成邀请码 - activeCard:', activeCard)
				console.log('生成邀请码 - paymentOrderId:', paymentOrderId)
				console.log('生成邀请码 - activeCard.paymentOrderId:', activeCard.paymentOrderId)
				console.log('生成邀请码 - activeCard.id:', activeCard.id)
				
				if (!paymentOrderId) {
					uni.hideLoading()
					console.error('无法获取订单ID，activeCard:', JSON.stringify(activeCard, null, 2))
					uni.showToast({ title: '无法获取订单信息', icon: 'none' })
					return
				}
				
				// 调用后端API生成邀请码
				const response = await api.invitation.generate(paymentOrderId)
				
				uni.hideLoading()
				
				if (response.code === 200 && response.data) {
					this.inviteCode = response.data.inviteCode
					this.currentInvitePaymentOrderId = paymentOrderId
					this.showInviteModal = true
					
					// 生成二维码
					this.$nextTick(() => {
						setTimeout(() => {
							this.generateInviteQRCode(this.inviteCode)
						}, 300)
					})
				} else {
					uni.showToast({
						title: response.message || '生成邀请码失败',
						icon: 'none'
					})
				}
			} catch (error) {
				uni.hideLoading()
				console.error('生成邀请码失败:', error)
				uni.showToast({
					title: '生成邀请码失败，请重试',
					icon: 'none'
				})
			}
		},
		// 生成邀请二维码
		generateInviteQRCode(code) {
			this.$nextTick(() => {
				setTimeout(() => {
					try {
						// 创建 canvas 上下文
						const ctx = uni.createCanvasContext('invite-qrcode-canvas', this)
						
						// 二维码内容：直接使用邀请码
						// 用户扫描后可以手动输入邀请码，或者通过分享链接自动跳转
						// 注意：小程序路径格式的二维码无法被微信直接识别，所以使用邀请码本身
						const qrContent = code
						
						// 创建 UQRCode 实例
						const qr = new UQRCode({
							canvasContext: ctx,
							text: qrContent, // 使用邀请码作为二维码内容
							size: 300,
							margin: 10,
							backgroundColor: '#ffffff',
							foregroundColor: '#000000',
							errorCorrectLevel: UQRCode.errorCorrectLevel.M
						})
						
						// 生成二维码
						qr.make()
						
						// 绘制到 canvas
						qr.drawCanvas().then(() => {
							setTimeout(() => {
								uni.canvasToTempFilePath({
									canvasId: 'invite-qrcode-canvas',
									success: (canvasRes) => {
										this.inviteQrCodeImage = canvasRes.tempFilePath
									},
									fail: (err) => {
										console.error('导出邀请二维码失败:', err)
									}
								}, this)
							}, 50)
						}).catch((err) => {
							console.error('绘制邀请二维码失败:', err)
						})
					} catch (error) {
						console.error('生成邀请二维码异常:', error)
					}
				}, 200)
			})
		},
		// 复制邀请码
		copyInviteCode() {
			uni.setClipboardData({
				data: this.inviteCode,
				success: () => {
					uni.showToast({
						title: '邀请码已复制',
						icon: 'success'
					})
				}
			})
		},
		// 分享邀请码给微信好友（已废弃，改用 button 的 open-type="share"）
		// 当用户点击分享按钮时，会自动触发 onShareAppMessage 生命周期函数
		// shareInviteCode() {
		// 	// 不再需要此方法
		// },
		// 关闭邀请码弹窗
		closeInviteModal() {
			this.showInviteModal = false
			this.inviteCode = ''
			this.currentInvitePaymentOrderId = null
			this.inviteQrCodeImage = ''
		},
		showCardDetail(item) {
			this.currentDetailRecord = item
			this.showDetailModal = true
		},
		closeCardDetail() {
			this.showDetailModal = false
			this.currentDetailRecord = null
		},
		formatPaymentTime(record) {
			if (!record || !record.buyAt) return ''
			// buyAt 格式是 YYYY-MM-DD，需要转换为 YYYY-MM-DD HH:MM:SS
			// 如果有支付时间信息，使用支付时间；否则使用购买日期 + 默认时间
			// 这里暂时使用购买日期 + 14:30:00 作为示例
			return `${record.buyAt} 14:30:00`
		},
		copyOrderNo() {
			const orderNo = this.currentDetailRecord?.orderNo
			if (!orderNo) {
				uni.showToast({
					title: '订单号为空',
					icon: 'none'
				})
				return
			}
			uni.setClipboardData({
				data: orderNo,
				success: () => {
					uni.showToast({
						title: '订单号已复制',
						icon: 'success'
					})
				},
				fail: () => {
					uni.showToast({
						title: '复制失败',
						icon: 'none'
					})
				}
			})
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
		},
		// 取消预约
		async onCancelBooking(order) {
			if (!order || !order.orderId) {
				uni.showToast({ title: '订单信息错误', icon: 'none' })
				return
			}
			
			// 确认取消
			uni.showModal({
				title: '确认取消',
				content: '确定要取消该预约吗？',
				success: async (res) => {
					if (res.confirm) {
						try {
							uni.showLoading({ title: '取消中...', mask: true })
							
							const response = await api.booking.cancel(order.orderId)
							
							uni.hideLoading()
							
							if (response.code === 200) {
								uni.showToast({
									title: '取消预约成功',
									icon: 'success'
								})
								
								// 重新加载预约订单列表
								await this.loadBookingOrders()
							} else {
								uni.showToast({
									title: response.message || '取消预约失败',
									icon: 'none'
								})
							}
						} catch (error) {
							uni.hideLoading()
							console.error('取消预约失败:', error)
							uni.showToast({
								title: '网络错误，请稍后重试',
								icon: 'none'
							})
						}
					}
				}
			})
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
	padding-top: 0; /* 不设置容器顶部内边距，改为在 topbar 上控制 */
}

.topbar {
	position: fixed;
	left: 0;
	top: env(safe-area-inset-top, 0rpx); /* 与小程序关闭按钮顶部对齐 */
	width: 750rpx;
	padding-top: 0;
	padding-right: 38rpx;
	padding-bottom: 32rpx; /* 与预约页面保持一致 */
	padding-left: 38rpx;
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
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
	padding-top: 186rpx; /* topbar高度(116rpx) + topbar的padding-top默认值(50rpx) + 视觉留白(20rpx) */
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
	color: #999999;
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
	width: 45rpx; /* 20px */
	height: 45rpx;
	margin-top: -5rpx; /* 向上移动，可根据需要调整数值（负值向上，正值向下） */
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
	width: 25rpx; /* 12px */
	height: 25rpx;
}
.vip-invite-text {
	font-size: 23rpx; /* 调大约21% */
	line-height: 34rpx;
	font-weight: 300;
	color: #e8dcc4;
	letter-spacing: 0.22rpx;
}
.vip-subtitle {
	margin-top: 10rpx; /* 保持原有的margin-top */
	transform: translateY(-16rpx); /* 向上移动，可根据需要调整数值（负值向上，正值向下） */
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
	color: #999999;
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
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0; /* 防止图标被压缩 */
}
.record-icon-img {
	width: 76rpx; /* 与容器大小一致，SVG已包含背景圆圈 */
	height: 76rpx;
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
	color: #999999;
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
	color: #999999;
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
	color: #999999;
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
	justify-content: space-between; /* 让标签均匀分布 */
	width: 674rpx;
	padding-left: 8rpx; /* 与标题左缩进对齐 */
	padding-right: 8rpx; /* 右侧内边距与左侧一致 */
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
	color: #999999;
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
	color: #999999;
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
	color: #999999;
}
.booking-foot {
	margin-top: 32rpx;
	padding-top: 32rpx; /* 17px */
	border-top: 2rpx solid #f9fafb;
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 30rpx; /* 按钮之间的间距 */
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
.cancel-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 60rpx;
	padding: 0 30rpx;
	background: #f3f4f6;
	border-radius: 12rpx;
}
.cancel-text {
	font-size: 28rpx;
	line-height: 40rpx;
	font-weight: 400;
	color: #999999;
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
	color: #999999;
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
	color: #999999;
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
	color: #999999;
}

/* 购卡详情弹窗样式 */
.card-detail-modal {
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
.card-detail-content {
	width: 674rpx; /* 与 section 宽度一致 */
	max-width: calc(100% - 76rpx); /* 左右各 38rpx 边距 */
	margin-left: 38rpx;
	margin-right: 38rpx;
	background: #ffffff;
	border-radius: 32rpx; /* 16px */
	padding: 50rpx; /* 25px */
	box-shadow: 0px 16rpx 20rpx -12rpx rgba(0, 0, 0, 0.1), 0px 40rpx 50rpx -10rpx rgba(0, 0, 0, 0.1);
	display: flex;
	flex-direction: column;
	gap: 32rpx; /* 16px */
}
.card-detail-header {
	display: flex;
	flex-direction: column;
	gap: 16rpx; /* 8px */
}
.card-detail-title-row {
	width: 100%;
	height: 36rpx; /* 18px */
	display: flex;
	align-items: center;
	justify-content: center;
}
.card-detail-title {
	font-size: 36rpx; /* 18px */
	line-height: 36rpx; /* 18px */
	font-family: 'Inter', sans-serif;
	color: rgb(16, 24, 40);
	text-align: center;
}
.card-detail-subtitle-row {
	width: 100%;
	height: 40rpx; /* 20px */
	display: flex;
	align-items: center;
	justify-content: center;
}
.card-detail-subtitle {
	font-size: 28rpx; /* 14px */
	line-height: 40rpx; /* 20px */
	font-family: 'Inter', sans-serif;
	color: #999999;
	text-align: center;
}
.card-detail-body {
	display: flex;
	flex-direction: column;
}
.detail-row {
	width: 100%;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 32rpx; /* 16px - 统一的行间距 */
}
.detail-row:last-child {
	margin-bottom: 0;
}
.detail-label {
	font-size: 28rpx; /* 14px */
	line-height: 40rpx; /* 20px */
	font-family: 'Inter', sans-serif;
	color: #999999;
}
.detail-value {
	font-size: 28rpx; /* 14px */
	line-height: 40rpx; /* 20px */
	font-family: 'Inter', sans-serif;
	color: rgb(16, 24, 40);
}
.detail-value-box {
	background-color: rgb(249, 250, 251);
	border-radius: 8rpx; /* 4px */
	padding: 4rpx 20rpx; /* 2px 10px */
	display: flex;
	align-items: center;
	justify-content: center;
	height: 48rpx; /* 24px */
	cursor: pointer;
}
.detail-value-box:active {
	opacity: 0.7;
}
.detail-value-text {
	font-size: 28rpx; /* 14px */
	line-height: 40rpx; /* 20px */
	font-family: 'Inter', sans-serif;
	color: rgb(54, 65, 83);
}
.detail-status-badge {
	border-radius: 9999rpx; /* 16777200px = very large radius for pill shape */
	padding: 4rpx 20rpx; /* 2px 10px */
	display: flex;
	align-items: center;
	justify-content: center;
	height: 40rpx; /* 20px */
}
.detail-status-badge.pill-green {
	background-color: rgb(220, 252, 231);
}
.detail-status-badge.pill-warm {
	background-color: #fff8e1;
}
.detail-status-badge.pill-gray {
	background-color: #f3f4f6;
}
.detail-status-text {
	font-size: 24rpx; /* 12px */
	line-height: 32rpx; /* 16px */
	font-family: 'Inter', sans-serif;
}
.detail-status-text.pill-text-green {
	color: rgb(0, 130, 54);
}
.detail-status-text.pill-text-warm {
	color: #f57c00;
}
.detail-status-text.pill-text-gray {
	color: #999999;
}
.detail-divider {
	width: 100%;
	height: 2rpx; /* 1px */
	background-color: rgb(243, 244, 246);
	box-shadow: inset 0 0 0 1px rgb(229, 231, 235);
	margin-bottom: 32rpx; /* 16px - 与行间距保持一致 */
}
.card-detail-footer {
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}
.card-detail-close-btn {
	width: 100%;
	height: 88rpx; /* 44px */
	background-color: rgb(74, 93, 80);
	border-radius: 28rpx; /* 14px */
	display: flex;
	align-items: center;
	justify-content: center;
}
.card-detail-close-text {
	font-size: 28rpx; /* 14px */
	line-height: 40rpx; /* 20px */
	font-family: 'Inter', sans-serif;
	color: rgb(255, 255, 255);
	text-align: center;
}

/* 邀请码弹窗样式 */
.invite-modal {
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
.invite-modal-content {
	width: 600rpx;
	background: #ffffff;
	border-radius: 24rpx;
	overflow: hidden;
}
.invite-modal-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 40rpx 40rpx 30rpx;
	border-bottom: 1rpx solid #f3f4f6;
}
.invite-modal-title {
	font-size: 36rpx;
	line-height: 50rpx;
	font-weight: 500;
	color: #1e2939;
}
.invite-modal-close {
	font-size: 48rpx;
	line-height: 48rpx;
	color: #999999;
	width: 48rpx;
	height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}
.invite-modal-body {
	padding: 40rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 30rpx;
}
.invite-code-container {
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 20rpx;
}
.invite-code-label {
	font-size: 28rpx;
	color: #999999;
}
.invite-code-value {
	font-size: 48rpx;
	font-weight: bold;
	color: #4a5d50;
	letter-spacing: 4rpx;
}
.invite-copy-btn {
	width: 200rpx;
	height: 60rpx;
	background: #f3f4f6;
	border: none;
	border-radius: 12rpx;
	font-size: 28rpx;
	color: #4a5d50;
	display: flex;
	align-items: center;
	justify-content: center;
}
.invite-qr-container {
	width: 300rpx;
	height: 300rpx;
	background: #f9fafb;
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
	overflow: hidden;
}
.invite-qr-canvas {
	position: fixed;
	top: -9999px;
	left: -9999px;
	width: 300px;
	height: 300px;
	opacity: 0;
	pointer-events: none;
	z-index: -1;
}
.invite-qr-image {
	width: 100%;
	height: 100%;
	border-radius: 16rpx;
	position: relative;
	z-index: 1;
}
.invite-tips {
	margin-top: 10rpx;
}
.invite-tips-text {
	font-size: 24rpx;
	color: #999999;
	text-align: center;
	line-height: 36rpx;
	margin-bottom: 8rpx;
	display: block;
}
.invite-tips-subtext {
	font-size: 22rpx;
	color: #999999;
	text-align: center;
	line-height: 32rpx;
	opacity: 0.8;
	display: block;
}
.invite-share-btn {
	width: 100%;
	height: 80rpx;
	background: #4a5d50;
	border: none;
	border-radius: 12rpx;
	font-size: 32rpx;
	color: #ffffff;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 20rpx;
}

.bottom-safe {
	height: 30rpx;
}
</style>

