<template>
  <view class="content">
    <!-- 空白页 -->
    <empty v-if="recordList.length === 0"></empty>

    <!-- 售后记录列表 -->
    <view v-for="record in recordList" :key="record.id" class="record-item">
      <view class="i-top b-b">
        <text class="time">{{ formatDateTime(record.createTime) }}</text>
        <text class="state" :style="{ color: getStatusColor(record.status) }">{{
          getStatusText(record.status)
        }}</text>
      </view>
      <!-- 退款金额 -->
      <view v-if="record.status === 2" class="refund-box">
        <text class="refund-label">退款金额</text>
        <text class="refund-amount">￥{{ record.returnAmount || record.productRealPrice * record.productCount }}</text>
        <text v-if="record.handleTime" class="refund-time">处理时间 {{ formatDateTime(record.handleTime) }}</text>
      </view>
      <!-- 退货商品 -->
      <view class="goods-box-single" @click="handleShowOrderDetail(record.orderId)">
        <image class="goods-img" :src="record.productPic" mode="aspectFill"></image>
        <view class="right">
          <text class="title clamp">{{ record.productName }}</text>
          <text class="attr-box">{{ record.productAttr }} x {{ record.productCount }}</text>
          <text class="price">{{ record.productPrice }}</text>
        </view>
      </view>
      <view class="info-box">
        <text>订单编号：{{ record.orderSn }}</text>
        <text>退货原因：{{ record.reason }}</text>
        <text v-if="record.description">问题描述：{{ record.description }}</text>
        <text>退货人：{{ record.returnName }}　{{ record.returnPhone }}</text>
      </view>
      <view v-if="record.status === 3 && record.handleNote" class="tip-box reject">
        <text>拒绝原因：{{ record.handleNote }}</text>
      </view>
      <view v-else class="tip-box">
        <text>商家将在 1-3 个工作日内处理，请耐心等待</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { formatDate } from '@/utils/date'
import { getReturnApplyListAPI } from '@/apis/order'
import type { OmsOrderReturnApply } from '@/types/order'

// ===== 页面数据 =====
// 售后记录列表
const recordList = ref<OmsOrderReturnApply[]>([])

// ===== onShow =====
// 每次进入页面从后端拉取最新售后记录
onShow(async () => {
  try {
    const res = await getReturnApplyListAPI()
    recordList.value = res.data || []
  } catch (e) {
    console.error('加载售后记录失败', e)
  }
})

// ===== 事件处理方法 =====

// 查看对应订单详情
const handleShowOrderDetail = (orderId: number) => {
  uni.navigateTo({
    url: `/pages/order/orderDetail?orderId=${orderId}`,
  })
}

// 申请状态文案：0->待处理；1->退货中；2->已退款；3->已拒绝
const getStatusText = (status: number): string => {
  const statusMap: Record<number, string> = {
    0: '待处理',
    1: '退货中',
    2: '已退款',
    3: '已拒绝',
  }
  return statusMap[status] || '未知'
}

// 申请状态颜色
const getStatusColor = (status: number): string => {
  if (status === 2) {
    return '#07c160'
  }
  if (status === 3) {
    return '#fa436a'
  }
  return '#ff9a2e'
}

// 格式化日期时间
const formatDateTime = (time: string): string => {
  const date = new Date(time)
  return formatDate(date, 'yyyy-MM-dd hh:mm')
}
</script>

<style lang="scss">
page {
  background: $page-color-base;
}
</style>

<style lang="scss" scoped>
.content {
  padding: 0 20rpx 40rpx;
}

.record-item {
  margin-top: 16rpx;
  background: #fff;
  padding: 0 30rpx 24rpx;

  .i-top {
    display: flex;
    align-items: center;
    height: 80rpx;
    font-size: $font-base;
    color: $font-color-dark;
    position: relative;

    .time {
      flex: 1;
    }

    .state {
      color: $base-color;
    }
  }

  .refund-box {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    padding: 16rpx 0;
    border-top: 1rpx solid #f2f2f2;

    .refund-label {
      font-size: $font-sm + 2rpx;
      color: $font-color-light;
      margin-right: 16rpx;
    }

    .refund-amount {
      font-size: $font-base + 8rpx;
      color: #07c160;
      font-weight: 500;
    }

    .refund-time {
      width: 100%;
      margin-top: 8rpx;
      font-size: $font-sm;
      color: $font-color-light;
    }
  }

  .goods-box-single {
    display: flex;
    padding: 20rpx 0;

    .goods-img {
      flex-shrink: 0;
      display: block;
      width: 120rpx;
      height: 120rpx;
    }

    .right {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 0 0 0 24rpx;
      overflow: hidden;

      .title {
        font-size: $font-base + 2rpx;
        color: $font-color-dark;
        line-height: 1;
      }

      .attr-box {
        font-size: $font-sm + 2rpx;
        color: $font-color-light;
        padding: 10rpx 0;
      }

      .price {
        font-size: $font-base + 2rpx;
        color: $font-color-dark;

        &::before {
          content: '￥';
          font-size: $font-sm;
          margin: 0 2rpx 0 0;
        }
      }
    }
  }

  .info-box {
    display: flex;
    flex-direction: column;
    padding: 16rpx 0;
    font-size: $font-sm + 2rpx;
    color: $font-color-light;
    line-height: 1.8;
    border-top: 1rpx solid #f2f2f2;
  }

  .tip-box {
    padding-top: 16rpx;
    font-size: $font-sm;
    color: #ff9a2e;

    &.reject {
      color: #fa436a;
    }
  }
}
</style>