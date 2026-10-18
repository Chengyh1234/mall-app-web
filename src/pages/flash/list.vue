<template>
  <view class="flash-container">
    <!-- 顶部氛围 Banner -->
    <view class="flash-banner">
      <view class="banner-text">
        <text class="banner-title">限时秒杀</text>
        <text class="banner-sub">整点准时开抢 · 手慢无</text>
      </view>
      <image class="banner-icon" src="/static/icon_flash_promotion.png" mode="aspectFit"></image>
    </view>

    <!-- 场次时间轴 -->
    <scroll-view class="session-tabs" scroll-x :show-scrollbar="false">
      <view class="session-tabs-inner">
        <view
          v-for="(session, index) in sessionList"
          :key="session.id || index"
          class="session-tab"
          :class="{ active: currentIndex === index, ended: sessionStatus(session) === 'ended' }"
          @click="handleSelectSession(index)"
        >
          <text class="session-time">{{ formatTime(session.startTime) }}</text>
          <text class="session-label">{{ sessionStatusText(sessionStatus(session)) }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 当前场次信息 -->
    <view class="session-info">
      <view class="session-status">
        <text class="status-dot"></text>
        <text class="status-text">{{ statusTitle }}</text>
      </view>
      <view class="countdown" v-if="currentSession">
        <text class="countdown-label">{{ countdownLabel }}</text>
        <view class="countdown-timer">
          <text class="timer">{{ cutDownText.hour }}</text>
          <text class="colon">:</text>
          <text class="timer">{{ cutDownText.minute }}</text>
          <text class="colon">:</text>
          <text class="timer">{{ cutDownText.second }}</text>
        </view>
      </view>
    </view>

    <!-- 商品列表 -->
    <view class="goods-list" v-if="currentSession && currentSession.productList.length">
      <view
        v-for="(item, index) in currentSession.productList"
        :key="item.id || index"
        class="goods-item"
        @click="handleNavToDetail(item)"
      >
        <image class="goods-img" :src="item.pic" mode="aspectFill"></image>
        <view class="goods-info">
          <text class="goods-name clamp">{{ item.name }}</text>
          <text class="goods-sub clamp">{{ item.subTitle }}</text>
          <view class="goods-price-row">
            <view class="goods-price-box">
              <text class="price">￥{{ flashPrice(item) }}</text>
              <text class="original-price" v-if="flashPrice(item) !== item.price">￥{{ item.price }}</text>
            </view>
            <view class="buy-btn" :class="{ disabled: isEnded }">{{ buyBtnText }}</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 空态 -->
    <view class="empty" v-if="currentSession && !currentSession.productList.length">
      <text class="empty-text">本场暂无可抢购的商品</text>
    </view>
    <view class="empty" v-if="!loading && !sessionList.length">
      <text class="empty-text">暂无限时秒杀活动</text>
    </view>

    <!-- 加载状态 -->
    <view class="loading-more" v-if="loading">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { getFlashPromotionListAPI, getHomeContentAPI } from '@/apis/home'
import type { FlashPromotionItem } from '@/types/home'
import type { PmsProduct } from '@/types/product'

// ===== 场次状态 =====
// upcoming-即将开始；ongoing-抢购中；ended-已结束
type SessionStatus = 'upcoming' | 'ongoing' | 'ended'

// ===== 页面数据 =====
const loading = ref(false)
// 场次列表（按开始时间升序）
const sessionList = ref<FlashPromotionItem[]>([])
// 选中的场次下标
const currentIndex = ref(0)

// 倒计时文本
const cutDownText = ref({ hour: '00', minute: '00', second: '00' })
// 倒计时定时器句柄
let countdownTimer: ReturnType<typeof setInterval> | null = null

// ===== 计算属性 =====
// 当前选中场次
const currentSession = computed<FlashPromotionItem | null>(
  () => sessionList.value[currentIndex.value] || null,
)

// 判断场次状态（由当前时间推导，后端不返回 status）
const sessionStatus = (session: FlashPromotionItem): SessionStatus => {
  const now = Date.now()
  const start = new Date(session.startTime).getTime()
  const end = new Date(session.endTime).getTime()
  if (now < start) return 'upcoming'
  if (now <= end) return 'ongoing'
  return 'ended'
}

// 当前场次状态
const currentStatus = computed<SessionStatus>(() =>
  currentSession.value ? sessionStatus(currentSession.value) : 'ended',
)

// 当前场次是否已结束（用于置灰按钮）
const isEnded = computed(() => currentStatus.value === 'ended')

// 状态标题文本
const statusTitle = computed(() => {
  switch (currentStatus.value) {
    case 'ongoing':
      return '火热进行中'
    case 'upcoming':
      return '即将开始 · 敬请期待'
    default:
      return '本场已结束'
  }
})

// 倒计时标签
const countdownLabel = computed(() => {
  switch (currentStatus.value) {
    case 'ongoing':
      return '距本场结束'
    case 'upcoming':
      return '距本场开始'
    default:
      return '已开场次'
  }
})

// 购买按钮文案
const buyBtnText = computed(() => {
  switch (currentStatus.value) {
    case 'ongoing':
      return '马上抢'
    case 'upcoming':
      return '即将开抢'
    default:
      return '已结束'
  }
})

// 场次状态文字（时间轴角标）
const sessionStatusText = (status: SessionStatus): string => {
  switch (status) {
    case 'ongoing':
      return '抢购中'
    case 'upcoming':
      return '未开始'
    default:
      return '已结束'
  }
}

// ===== 工具方法 =====
// 秒杀价（有秒杀价用秒杀价，否则回退商品原价）
const flashPrice = (item: PmsProduct) => item.flashPromotionPrice || item.price

// 格式化时间 -> HH:mm
const formatTime = (time?: string) => {
  if (!time) return '--:--'
  const d = new Date(time)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

// 更新倒计时
const updateCutDown = () => {
  const session = currentSession.value
  if (!session) {
    cutDownText.value = { hour: '00', minute: '00', second: '00' }
    return
  }
  // 进行中倒计时到结束时间，未开始倒计时到开始时间
  const target =
    currentStatus.value === 'upcoming' ? new Date(session.startTime).getTime() : new Date(session.endTime).getTime()
  let offset = target - Date.now()
  if (offset <= 0) offset = 0

  const hour = String(Math.floor(offset / (60 * 60 * 1000))).padStart(2, '0')
  const minute = String(Math.floor((offset % (60 * 60 * 1000)) / (60 * 1000))).padStart(2, '0')
  const second = String(Math.floor((offset % (60 * 1000)) / 1000)).padStart(2, '0')
  cutDownText.value = { hour, minute, second }
}

// 启动倒计时
const startCountdown = () => {
  updateCutDown()
  if (countdownTimer) clearInterval(countdownTimer)
  countdownTimer = setInterval(updateCutDown, 1000)
}

// 停止倒计时
const stopCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

// ===== 切换场次 =====
const handleSelectSession = (index: number) => {
  currentIndex.value = index
  startCountdown()
}

// ===== 跳转商品详情 =====
const handleNavToDetail = (item: PmsProduct) => {
  const session = currentSession.value
  // 判断是否还有可用的秒杀场次（进行中/未开始）来判断是否需要携带秒杀上下文
  if (!session) {
    uni.navigateTo({
      url: `/pages/product/product?id=${item.id}`,
    })
    return
  }
  // 带秒杀上下文进入详情页，详情页据此展示"立即抢购"并走秒杀下单接口
  uni.navigateTo({
    url: `/pages/product/product?id=${item.id}&flashPromotionId=${session.flashPromotionId}&sessionId=${session.id}&flashPrice=${item.flashPromotionPrice || item.price}`,
  })
}

// ===== 数据加载 =====
const loadData = async () => {
  loading.value = true
  try {
    // 优先使用秒杀场次列表接口
    let list: FlashPromotionItem[] = []
    const res = await getFlashPromotionListAPI()
    list = res.data || []

    // 接口未实现或返回空时，降级用首页的当前场次兜底
    if (!list.length) {
      const homeRes = await getHomeContentAPI()
      const flash = homeRes.data?.homeFlashPromotion
      if (flash) {
        list = [
          {
            id: 0,
            name: '整点秒杀',
            flashPromotionId: 0,
            startTime: flash.startTime,
            endTime: flash.endTime,
            productList: flash.productList || [],
          },
        ]
      }
    }

    // 按开始时间升序排序
    sessionList.value = list.sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    )

    // 默认选中第一个进行中的场次，否则第一个未开始的，否则第一个
    if (sessionList.value.length) {
      const ongoingIdx = sessionList.value.findIndex((s) => sessionStatus(s) === 'ongoing')
      if (ongoingIdx >= 0) {
        currentIndex.value = ongoingIdx
      } else {
        currentIndex.value = 0
      }
      startCountdown()
    }
  } catch (err) {
    console.error('加载秒杀场次失败', err)
  } finally {
    loading.value = false
  }
}

// ===== 生命周期 =====
onLoad(() => {
  loadData()
})

onUnload(() => {
  stopCountdown()
})
</script>

<style lang="scss" scoped>
.flash-container {
  min-height: 100vh;
  background: $page-color-base;
  padding-bottom: 40rpx;
}

/* 顶部氛围 Banner */
.flash-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx 40rpx;
  background: linear-gradient(135deg, #ff6b3d, #fa436a);
  color: #fff;

  .banner-title {
    display: block;
    font-size: 44rpx;
    font-weight: 700;
    letter-spacing: 2rpx;
  }

  .banner-sub {
    display: block;
    margin-top: 8rpx;
    font-size: $font-sm;
    opacity: 0.9;
  }

  .banner-icon {
    width: 120rpx;
    height: 120rpx;
    opacity: 0.95;
  }
}

/* 场次时间轴 */
.session-tabs {
  background: #fff;
  white-space: nowrap;

  .session-tabs-inner {
    display: flex;
    padding: 0 24rpx;
  }

  .session-tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
    min-width: 120rpx;
    padding: 20rpx 8rpx;
    border-bottom: 4rpx solid transparent;

    &.active {
      border-bottom-color: $uni-color-primary;

      .session-time {
        color: $uni-color-primary;
        font-weight: 700;
      }

      .session-label {
        color: $uni-color-primary;
      }
    }

    &.ended {
      .session-time,
      .session-label {
        color: $font-color-disabled;
      }
    }

    .session-time {
      font-size: $font-lg;
      color: $font-color-dark;
      line-height: 1.4;
    }

    .session-label {
      margin-top: 6rpx;
      font-size: $font-sm - 4rpx;
      color: $font-color-light;
    }
  }
}

/* 当前场次信息 + 倒计时 */
.session-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 30rpx;
  background: #fff;

  .session-status {
    display: flex;
    align-items: center;

    .status-dot {
      width: 14rpx;
      height: 14rpx;
      margin-right: 12rpx;
      border-radius: 50%;
      background: $uni-color-primary;
      box-shadow: 0 0 0 6rpx rgba(250, 67, 106, 0.15);
    }

    .status-text {
      font-size: $font-base;
      font-weight: 600;
      color: $font-color-dark;
    }
  }

  .countdown {
    display: flex;
    align-items: center;

    .countdown-label {
      margin-right: 12rpx;
      font-size: $font-sm;
      color: $font-color-light;
    }

    .countdown-timer {
      display: flex;
      align-items: center;
    }

    .timer {
      display: inline-block;
      min-width: 44rpx;
      height: 40rpx;
      text-align: center;
      line-height: 40rpx;
      font-size: $font-sm + 2rpx;
      font-weight: 600;
      color: #fff;
      border-radius: 4rpx;
      background: $font-color-dark;
    }

    .colon {
      margin: 0 4rpx;
      font-size: $font-base;
      color: $font-color-dark;
    }
  }
}

/* 商品列表 */
.goods-list {
  padding: 0 30rpx;
}

.goods-item {
  display: flex;
  margin-top: 24rpx;
  padding: 20rpx;
  background: #fff;
  border-radius: 12rpx;

  .goods-img {
    flex-shrink: 0;
    width: 180rpx;
    height: 180rpx;
    border-radius: 8rpx;
    background: $image-bg-color;
  }

  .goods-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-left: 20rpx;
    overflow: hidden;
  }

  .goods-name {
    font-size: $font-base;
    color: $font-color-dark;
    line-height: 1.4;
  }

  .goods-sub {
    margin-top: 6rpx;
    font-size: $font-sm;
    color: $font-color-light;
  }

  .goods-price-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 12rpx;
  }

  .goods-price-box {
    display: flex;
    align-items: baseline;

    .price {
      font-size: 36rpx;
      font-weight: 700;
      color: $uni-color-primary;
      line-height: 1;

      &::before {
        content: '￥';
        font-size: $font-base;
      }
    }

    .original-price {
      margin-left: 10rpx;
      font-size: $font-sm;
      color: $font-color-light;
      text-decoration: line-through;
    }
  }

  .buy-btn {
    flex-shrink: 0;
    padding: 12rpx 28rpx;
    font-size: $font-base;
    color: #fff;
    background: linear-gradient(90deg, #ff6b3d, #fa436a);
    border-radius: 999rpx;

    &.disabled {
      background: $font-color-disabled;
    }
  }
}

/* 空态 / 加载 */
.empty {
  padding: 120rpx 0;
  text-align: center;

  .empty-text {
    font-size: $font-base;
    color: $font-color-light;
  }
}

.loading-more {
  padding: 30rpx 0;
  text-align: center;
  font-size: $font-sm;
  color: $font-color-light;
}
</style>