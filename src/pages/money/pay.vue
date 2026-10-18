<template>
  <view class="app">
    <view class="price-box">
      <text>支付金额</text>
      <text class="price">{{ orderInfo.payAmount }}</text>
    </view>

    <view class="pay-type-list">
      <view class="type-item b-b" @click="handleChangePayType(1)">
        <text class="icon yticon icon-alipay"></text>
        <view class="con">
          <text class="tit">支付宝支付</text>
          <text>推荐使用支付宝支付</text>
        </view>
        <label class="radio">
          <radio name="payType" value="" color="#fa436a" :checked="payType == 1" />
        </label>
      </view>
      <view class="type-item b-b" @click="handleChangePayType(2)">
        <text class="icon yticon icon-weixinzhifu"></text>
        <view class="con">
          <text class="tit">微信支付</text>
        </view>
        <label class="radio">
          <radio name="payType" value="" color="#fa436a" :checked="payType == 2" />
        </label>
      </view>
    </view>

    <!-- 电脑端扫码支付二维码 -->
    <view v-if="showQrCode" class="qr-box">
      <image class="qr-code" :src="qrCodeUrl" mode="widthFix" />
      <text class="qr-tip">打开支付宝扫一扫完成支付</text>
      <text class="qr-tip sub">支付完成后将自动跳转</text>
      <text class="qr-refresh" @click="handleCreateQrCode">刷新二维码</text>
    </view>

    <text v-if="!showQrCode" class="mix-btn" @click="handleConfirmPay">确认支付</text>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import {
  getOrderDetailAPI,
  payOrderSuccessAPI,
  fetchAlipayPayAPI,
  fetchAliapyStatusAPI,
} from '@/apis/order'
import type { OmsOrderDetail } from '@/types/order'

// 是否使用支付宝支付（H5端启用，通过环境变量配置）
const USE_ALIPAY = import.meta.env.VITE_USE_ALIPAY === 'true'

// 是否电脑端（通过 UA 判断，用于选择电脑扫码支付还是手机网站支付）
const isPC = !/Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent)

// ===== 页面数据 =====
// 订单ID
const orderId = ref<number | null>(null)
// 支付方式：1->支付宝；2->微信
const payType = ref(1)
// 订单信息
const orderInfo = ref<Partial<OmsOrderDetail>>({})
// 二维码图片（dataURL）
const qrCodeUrl = ref('')
// 是否展示二维码扫码区
const showQrCode = ref(false)
// 支付状态轮询定时器
let pollTimer: ReturnType<typeof setInterval> | null = null

// ===== 数据加载 =====
// 加载订单详情
const loadData = async () => {
  try {
    const res = await getOrderDetailAPI(orderId.value!)
    orderInfo.value = res.data
  } catch (e) {
    console.error('加载订单详情失败', e)
  }
}

// ===== 生命周期 =====
// 页面加载
onLoad(async (options: any) => {
  orderId.value = options.orderId
  loadData()
})

// ===== 事件处理方法 =====
// 选择支付方式
const handleChangePayType = (type: number) => {
  payType.value = type
}

// 确认支付
const handleConfirmPay = async () => {
  // #ifdef H5
  if (USE_ALIPAY) {
    if (payType.value != 1) {
      uni.showToast({
        title: '暂不支持微信支付！',
        icon: 'none',
      })
      return
    }
    if (isPC) {
      // 电脑端：请求扫码支付接口，页面渲染二维码供手机扫码
      await handleCreateQrCode()
    } else {
      // 手机端：跳转手机网站支付，唤起支付宝 APP
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
      window.location.href =
        apiBaseUrl +
        '/alipay/webPay?outTradeNo=' +
        orderInfo.value.orderSn +
        '&subject=' +
        orderInfo.value.receiverName +
        '的商品订单' +
        '&totalAmount=' +
        orderInfo.value.totalAmount
    }
    return
  }
  // #endif

  try {
    await payOrderSuccessAPI({
      orderId: orderId.value!,
      payType: payType.value,
    })
    uni.redirectTo({
      url: '/pages/money/paySuccess',
    })
  } catch (e) {
    console.error('支付失败', e)
  }
}

// 电脑端：创建扫码支付
const handleCreateQrCode = async () => {
  try {
    uni.showLoading({ title: '生成二维码...' })
    const qrContent = await fetchAlipayPayAPI({
      outTradeNo: orderInfo.value.orderSn!,
      subject: orderInfo.value.receiverName + '的商品订单',
      totalAmount: orderInfo.value.totalAmount!,
    })
    if (!qrContent) {
      throw new Error('二维码内容为空')
    }
    // #ifdef H5
    // 用 qrcode 库将二维码内容渲染为图片（兼容 default / 具名导出两种形态）
    const qrcodeModule = await import('qrcode')
    const QRCode = (qrcodeModule as any).default ?? qrcodeModule
    qrCodeUrl.value = await QRCode.toDataURL(qrContent, { width: 240, margin: 1 })
    // #endif
    showQrCode.value = true
    startPolling()
  } catch (e) {
    console.error('创建二维码失败', e)
    uni.showToast({ title: '二维码生成失败，请重试', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

// 轮询支付宝交易状态
const startPolling = () => {
  stopPolling()
  pollTimer = setInterval(async () => {
    try {
      const res = await fetchAliapyStatusAPI({ outTradeNo: orderInfo.value.orderSn! })
      if (res.data != null && res.data === 'TRADE_SUCCESS') {
        stopPolling()
        uni.redirectTo({
          url: '/pages/money/paySuccess?out_trade_no=' + orderInfo.value.orderSn,
        })
      }
    } catch (e) {
      console.error('查询支付状态失败', e)
    }
  }, 3000)
}

// 停止轮询
const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

// 页面卸载时清理轮询定时器
onUnload(() => {
  stopPolling()
})
</script>

<style lang="scss" scoped>
.app {
  width: 100%;
}

.price-box {
  background-color: #fff;
  height: 265rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 28rpx;
  color: #909399;

  .price {
    font-size: 50rpx;
    color: #303133;
    margin-top: 12rpx;

    &:before {
      content: '￥';
      font-size: 40rpx;
    }
  }
}

.pay-type-list {
  margin-top: 20rpx;
  background-color: #fff;
  padding-left: 60rpx;

  .type-item {
    height: 120rpx;
    padding: 20rpx 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-right: 60rpx;
    font-size: 30rpx;
    position: relative;
  }

  .icon {
    width: 100rpx;
    font-size: 52rpx;
  }

  .icon-erjiye-yucunkuan {
    color: #fe8e2e;
  }

  .icon-weixinzhifu {
    color: #36cb59;
  }

  .icon-alipay {
    color: #01aaef;
  }

  .tit {
    font-size: $font-lg;
    color: $font-color-dark;
    margin-bottom: 4rpx;
  }

  .con {
    flex: 1;
    display: flex;
    flex-direction: column;
    font-size: $font-sm;
    color: $font-color-light;
  }
}

.mix-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 630rpx;
  height: 80rpx;
  margin: 80rpx auto 30rpx;
  font-size: $font-lg;
  color: #fff;
  background-color: $base-color;
  border-radius: 10rpx;
  box-shadow: 1px 2px 5px rgba(219, 63, 96, 0.4);
}

.qr-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;

  .qr-code {
    width: 400rpx;
    height: 400rpx;
    padding: 20rpx;
    background-color: #fff;
    border: 1px solid #eee;
    border-radius: 12rpx;
  }

  .qr-tip {
    margin-top: 24rpx;
    font-size: 30rpx;
    color: #303133;

    &.sub {
      margin-top: 8rpx;
      font-size: 24rpx;
      color: #909399;
    }
  }

  .qr-refresh {
    margin-top: 20rpx;
    font-size: 26rpx;
    color: $base-color;
  }
}
</style>
