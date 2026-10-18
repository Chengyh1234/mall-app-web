<template>
  <view class="content">
    <!-- 优惠券详情 -->
    <view v-if="coupon" class="coupon-card">
      <view class="coupon-info">
        <view class="price-row">
          <text class="symbol">¥</text>
          <text class="price">{{ coupon.amount }}</text>
          <text class="min-point">满{{ coupon.minPoint }}可用</text>
        </view>
        <text class="name">{{ coupon.name }}</text>
        <text class="tips">{{ formatCouponUseType(coupon.useType) }}</text>
      </view>
      <view class="coupon-detail">
        <view class="row">
          <text class="label">使用门槛</text>
          <text class="value">满{{ coupon.minPoint }}元可用</text>
        </view>
        <view class="row">
          <text class="label">有效期至</text>
          <text class="value">{{ formatDateTime(coupon.endTime) }}</text>
        </view>
        <view class="row">
          <text class="label">限领数量</text>
          <text class="value">每人限领{{ coupon.perLimit }}张</text>
        </view>
        <view class="row">
          <text class="label">剩余数量</text>
          <text class="value">{{ coupon.count }}张</text>
        </view>
      </view>
    </view>
    <view v-else class="empty">优惠券不存在或已下架</view>
    <!-- 立即领取 -->
    <button class="receive-btn" :disabled="receiveLoading || received" @click="handleReceive">
      {{ received ? '已领取' : receiveLoading ? '领取中...' : '立即领取' }}
    </button>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getMemberCouponDetailAPI, addMemberCouponAPI } from '@/apis/coupon'
import type { SmsCoupon } from '@/types/coupon'
import { formatDate } from '@/utils/date'

// 优惠券ID
const couponId = ref('')
// 优惠券详情
const coupon = ref<SmsCoupon | null>(null)
// 领取中状态
const receiveLoading = ref(false)
// 已领取状态（领取成功后或提示已领取时置为 true，按钮禁用）
const received = ref(false)

// 格式化日期时间
const formatDateTime = (time: string | null) => {
  if (time == null || time === '') {
    return 'N/A'
  }
  return formatDate(new Date(time), 'yyyy-MM-dd hh:mm:ss')
}

// 格式化优惠券使用类型
const formatCouponUseType = (useType: number) => {
  if (useType === 0) {
    return '全场通用'
  } else if (useType === 1) {
    return '指定分类商品可用'
  } else if (useType === 2) {
    return '指定商品可用'
  }
  return null
}

// 加载优惠券详情
const loadDetail = async () => {
  try {
    const res = await getMemberCouponDetailAPI(couponId.value)
    coupon.value = res.data
  } catch (error) {
    console.error('加载优惠券详情失败:', error)
  }
}

// 领取优惠券
const handleReceive = async () => {
  receiveLoading.value = true
  try {
    await addMemberCouponAPI(couponId.value)
    received.value = true
    uni.showToast({
      title: '领取成功！',
      duration: 2000,
    })
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/coupon/couponList' })
    }, 800)
  } catch (error) {
    // 具体错误消息已由 http 封装统一 toast（如"您已经领取过该优惠券"），此处不重复提示
    const msg = (error as any)?.data?.message || ''
    if (msg.includes('已领取')) {
      received.value = true
    }
  } finally {
    receiveLoading.value = false
  }
}

onLoad((options) => {
  couponId.value = (options?.couponId as string) || ''
  loadDetail()
})
</script>

<style scoped>
.content {
  min-height: 100vh;
  background-color: #f8f8f8;
  padding: 30rpx;
}

.coupon-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
}

.coupon-info {
  background: linear-gradient(135deg, #fa436a, #ff6b81);
  padding: 40rpx 30rpx;
  color: #ffffff;
}

.price-row {
  display: flex;
  align-items: baseline;
}

.symbol {
  font-size: 32rpx;
}

.price {
  font-size: 88rpx;
  font-weight: bold;
}

.min-point {
  margin-left: 16rpx;
  font-size: 24rpx;
  opacity: 0.9;
}

.name {
  display: block;
  margin-top: 12rpx;
  font-size: 30rpx;
  font-weight: bold;
}

.tips {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  opacity: 0.9;
}

.coupon-detail {
  padding: 10rpx 30rpx 30rpx;
}

.row {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f2f3f5;
}

.row:last-child {
  border-bottom: none;
}

.label {
  color: #909399;
  font-size: 26rpx;
}

.value {
  color: #303133;
  font-size: 26rpx;
}

.receive-btn {
  margin-top: 60rpx;
  background-color: #fa436a;
  color: #ffffff;
  font-size: 32rpx;
  border-radius: 44rpx;
}

.receive-btn[disabled] {
  background-color: #c0c4cc;
  color: #ffffff;
}

.empty {
  text-align: center;
  color: #909399;
  padding: 100rpx 0;
  font-size: 28rpx;
}
</style>