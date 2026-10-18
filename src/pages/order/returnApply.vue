<template>
  <view class="content">
    <!-- 选择退货商品 -->
    <view class="section">
      <view class="section-title">
        <text>选择退货商品</text>
        <text class="section-tip">仅支持单件商品申请</text>
      </view>
      <view
        class="goods-card"
        v-for="item in orderItems"
        :key="item.id"
        :class="{ active: currentItem && currentItem.id === item.id }"
        @click="handleSelectItem(item)"
      >
        <image class="goods-img" :src="item.productPic" mode="aspectFill"></image>
        <view class="goods-info">
          <text class="goods-name clamp">{{ item.productName }}</text>
          <text class="goods-attr">{{ formatAttr(item.productAttr) }}</text>
          <view class="goods-price">
            <text>￥{{ item.productPrice }}</text>
            <text class="goods-qty">x {{ item.productQuantity }}</text>
          </view>
        </view>
        <text
          class="goods-check"
          :class="currentItem && currentItem.id === item.id ? 'checked' : ''"
          >✓</text
        >
      </view>
    </view>

    <!-- 退货信息 -->
    <view class="section" v-if="currentItem">
      <view class="form-row">
        <text class="form-label">退货数量</text>
        <view class="stepper">
          <text class="step-btn" :class="{ disabled: returnCount <= 1 }" @click="decreaseCount">-</text>
          <text class="step-num">{{ returnCount }}</text>
          <text
            class="step-btn"
            :class="{ disabled: returnCount >= currentItem.productQuantity }"
            @click="increaseCount"
            >+</text
          >
        </view>
      </view>

      <view class="form-row" @click="showReasonPicker = true">
        <text class="form-label">退货原因</text>
        <view class="form-value">
          <text :class="{ placeholder: !reason }">{{ reason || '请选择退货原因' }}</text>
          <text class="arrow">›</text>
        </view>
      </view>

      <view class="form-col">
        <text class="form-label">问题描述</text>
        <textarea
          v-model="description"
          class="desc-textarea"
          placeholder="请描述商品的问题，方便商家快速处理（选填）"
          :maxlength="200"
        ></textarea>
      </view>

      <view class="pics-section">
        <view class="pics-title">
          <text class="form-label">上传凭证</text>
          <text class="pics-tip">最多9张</text>
        </view>
        <view class="pics-list">
          <view v-for="(pic, index) in proofList" :key="index" class="pic-item">
            <image :src="pic.url" mode="aspectFill"></image>
            <text
              v-if="!pic.uploading"
              class="pic-del"
              @click="removePic(index)"
              >×</text
            >
            <view v-if="pic.uploading" class="pic-loading">
              <text>上传中</text>
            </view>
          </view>
          <view v-if="proofList.length < 9" class="pic-add" @click="chooseImage">
            <text class="add-plus">+</text>
            <text>添加凭证</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 退货人信息 -->
    <view class="section" v-if="currentItem">
      <view class="form-row">
        <text class="form-label">退货人姓名</text>
        <input v-model="returnName" class="form-input" placeholder="请输入姓名" />
      </view>
      <view class="form-row">
        <text class="form-label">退货人电话</text>
        <input v-model="returnPhone" class="form-input" type="number" placeholder="请输入联系电话" />
      </view>
    </view>

    <!-- 提交 -->
    <button class="submit-btn" :loading="submitting" :disabled="!currentItem" @click="handleSubmit">
      提交申请
    </button>

    <!-- 原因选择弹层 -->
    <picker
      v-if="showReasonPicker"
      :range="reasonOptions"
      @change="onReasonChange"
      @cancel="showReasonPicker = false"
    >
      <view class="mask" @click="showReasonPicker = false"></view>
      <view class="reason-panel">
        <view class="reason-item" v-for="(item, index) in reasonOptions" :key="index" @click="selectReason(item)">
          <text :class="{ active: reason === item }">{{ item }}</text>
          <text v-if="reason === item" class="check">✓</text>
        </view>
      </view>
    </picker>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getOrderDetailAPI, createReturnApplyAPI, getReturnApplyListAPI } from '@/apis/order'
import { uploadImageToOSS } from '@/utils/oss'
import type { OmsOrderDetail, OmsOrderItem, OmsOrderReturnApplyParam } from '@/types/order'

// ===== 订单数据 =====
// 订单ID
const orderId = ref(0)
// 订单详情
const order = ref<OmsOrderDetail>({} as OmsOrderDetail)
// 订单商品列表
const orderItems = ref<OmsOrderItem[]>([])
// 当前选中的退货商品
const currentItem = ref<OmsOrderItem | null>(null)

// ===== 退货表单 =====
// 退货数量
const returnCount = ref(1)
// 退货原因
const reason = ref('')
// 问题描述
const description = ref('')
// 凭证图片列表（本地缩略图 -> OSS 上传后替换为完整URL）
const proofList = ref<{ url: string; uploading: boolean }[]>([])
// 退货人姓名
const returnName = ref('')
// 退货人电话
const returnPhone = ref('')
// 是否提交中
const submitting = ref(false)
// 是否显示原因选择弹层
const showReasonPicker = ref(false)

// 可选退货原因
const reasonOptions = ['七天无理由退换', '商品质量问题', '尺码不合适', '颜色/款式不符', '收到错件/漏件', '其他']

// ===== onLoad =====
// 加载订单详情并渲染可退货商品，默认选中第一件；该订单已申请售后则直接返回
onLoad(async (options) => {
  if (options?.orderId) {
    orderId.value = +options.orderId
  }
  try {
    const res = await getOrderDetailAPI(orderId.value)
    order.value = res.data
    orderItems.value = res.data.orderItemList || []
    if (orderItems.value.length > 0) {
      currentItem.value = orderItems.value[0]
    }
    // 退货人信息默认回填订单收货人
    returnName.value = order.value.receiverName || ''
    returnPhone.value = order.value.receiverPhone || ''
  } catch (e) {
    console.error('加载订单信息失败', e)
  }
  // 同一订单已申请售后则提示并返回，防止重复申请（接口失败不阻塞申请页展示）
  try {
    const applyRes = await getReturnApplyListAPI()
    const applied = (applyRes.data || []).some((r) => r.orderId === order.value.id)
    if (applied) {
      uni.showToast({ icon: 'none', title: '该订单已申请售后，请勿重复提交' })
      setTimeout(() => uni.navigateBack(), 1000)
    }
  } catch (e) {
    console.error('校验售后申请失败', e)
  }
})

// ===== 事件处理方法 =====

// 格式化商品属性（兼容JSON字符串与纯文本）
const formatAttr = (attr?: string): string => {
  if (!attr) return ''
  try {
    const attrArr = JSON.parse(attr)
    if (Array.isArray(attrArr)) {
      return attrArr.map((a) => `${a.key}:${a.value}`).join(';')
    }
  } catch {
    // 非JSON格式则原样返回
  }
  return attr
}

// 选择退货商品
const handleSelectItem = (item: OmsOrderItem) => {
  currentItem.value = item
  returnCount.value = 1
}

// 减少退货数量
const decreaseCount = () => {
  if (returnCount.value > 1) {
    returnCount.value -= 1
  }
}

// 增加退货数量
const increaseCount = () => {
  if (currentItem.value && returnCount.value < currentItem.value.productQuantity) {
    returnCount.value += 1
  }
}

// 选择退货原因
const onReasonChange = (e: any) => {
  const index = Number(e.detail.value)
  reason.value = reasonOptions[index] || ''
  showReasonPicker.value = false
}

const selectReason = (item: string) => {
  reason.value = item
  showReasonPicker.value = false
}

// 选择并上传凭证图片
const chooseImage = () => {
  const count = 9 - proofList.value.length
  uni.chooseImage({
    count,
    success: async (res) => {
      for (const tempFilePath of res.tempFilePaths) {
        // 先插入占位（上传中）；后续必须通过代理修改才能触发视图更新
        proofList.value.push({ url: tempFilePath, uploading: true })
        const index = proofList.value.length - 1
        try {
          const url = await uploadImageToOSS(tempFilePath)
          proofList.value[index].url = url
        } catch (e) {
          console.error('凭证上传失败', e)
          uni.showToast({ icon: 'none', title: '凭证上传失败' })
          proofList.value.splice(index, 1)
        } finally {
          proofList.value[index].uploading = false
        }
      }
    },
  })
}

// 删除已选凭证图片
const removePic = (index: number) => {
  proofList.value.splice(index, 1)
}

// 提交退货申请
const handleSubmit = async () => {
  if (!currentItem.value) {
    uni.showToast({ icon: 'none', title: '请选择退货商品' })
    return
  }
  if (!reason.value) {
    uni.showToast({ icon: 'none', title: '请选择退货原因' })
    return
  }
  if (!returnName.value.trim()) {
    uni.showToast({ icon: 'none', title: '请输入退货人姓名' })
    return
  }
  if (!/^1\d{10}$/.test(returnPhone.value.trim())) {
    uni.showToast({ icon: 'none', title: '请输入正确的手机号' })
    return
  }
  if (proofList.value.some((p) => p.uploading)) {
    uni.showToast({ icon: 'none', title: '凭证上传中，请稍候' })
    return
  }

  const item = currentItem.value
  // 计算实付单价：优惠后分摊金额 / 购买数量；无法计算时回退为商品单价
  const unitRealPrice =
    item.realAmount && item.productQuantity
      ? Number((item.realAmount / item.productQuantity).toFixed(2))
      : item.productPrice

  const params: OmsOrderReturnApplyParam = {
    orderId: order.value.id,
    orderSn: order.value.orderSn,
    memberUsername: order.value.memberUsername,
    productId: item.productId,
    productName: item.productName,
    productPic: item.productPic,
    productBrand: item.productBrand,
    productAttr: formatAttr(item.productAttr),
    productCount: returnCount.value,
    productPrice: item.productPrice,
    productRealPrice: unitRealPrice,
    reason: reason.value,
    description: description.value.trim() || undefined,
    proofPics: proofList.value.length > 0 ? proofList.value.map((p) => p.url).join(',') : undefined,
    returnName: returnName.value.trim(),
    returnPhone: returnPhone.value.trim(),
  }

  submitting.value = true
  try {
    await createReturnApplyAPI(params)
    uni.showToast({ icon: 'success', title: '申请成功' })
    setTimeout(() => {
      uni.navigateBack({
        fail: () => {
          uni.redirectTo({ url: '/pages/order/order' })
        },
      })
    }, 1000)
  } catch (e) {
    console.error('提交退货申请失败', e)
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss">
page {
  background: $page-color-base;
}
</style>

<style lang="scss" scoped>
.content {
  padding: 20rpx;
}

/* 通用区块 */
.section {
  margin-top: 20rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 10rpx;

  .section-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: $font-base + 2rpx;
    color: $font-color-dark;
    margin-bottom: 20rpx;

    .section-tip {
      font-size: $font-sm + 2rpx;
      color: $font-color-light;
    }
  }
}

/* 商品选择 */
.goods-card {
  display: flex;
  align-items: center;
  padding: 20rpx;
  border: 2rpx solid transparent;
  border-radius: 10rpx;
  margin-bottom: 16rpx;
  background: #fafafa;

  &.active {
    border-color: $base-color;
    background: #fff;
  }

  .goods-img {
    flex-shrink: 0;
    width: 120rpx;
    height: 120rpx;
    border-radius: 6rpx;
  }

  .goods-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0 20rpx;
    overflow: hidden;

    .goods-name {
      font-size: $font-base;
      color: $font-color-dark;
      line-height: 1.4;
    }

    .goods-attr {
      margin-top: 8rpx;
      font-size: $font-sm;
      color: $font-color-light;
    }

    .goods-price {
      margin-top: 10rpx;
      font-size: $font-base + 2rpx;
      color: $font-color-dark;

      .goods-qty {
        font-size: $font-sm;
        color: $font-color-light;
        margin-left: 16rpx;
      }
    }
  }

  .goods-check {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    color: #fff;
    font-size: $font-sm + 4rpx;
    background: #ddd;

    &.checked {
      background: $base-color;
    }
  }
}

/* 表单行 */
.form-row {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f2f2f2;

  .form-label {
    width: 180rpx;
    font-size: $font-base;
    color: $font-color-dark;
  }

  .form-value {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .placeholder {
      color: $font-color-light;
    }

    .arrow {
      font-size: 36rpx;
      color: $font-color-light;
    }
  }

  .form-input {
    flex: 1;
    font-size: $font-base;
    color: $font-color-dark;
  }
}

/* 数量步进器 */
.stepper {
  display: flex;
  align-items: center;

  .step-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56rpx;
    height: 56rpx;
    font-size: 36rpx;
    color: $font-color-dark;
    background: #f5f5f5;
    border-radius: 6rpx;

    &.disabled {
      color: #ccc;
    }
  }

  .step-num {
    min-width: 80rpx;
    text-align: center;
    font-size: $font-base + 2rpx;
    color: $font-color-dark;
  }
}

/* 问题描述 */
.form-col {
  padding: 24rpx 0;

  .form-label {
    display: block;
    font-size: $font-base;
    color: $font-color-dark;
    margin-bottom: 16rpx;
  }

  .desc-textarea {
    width: 100%;
    height: 180rpx;
    padding: 16rpx;
    box-sizing: border-box;
    font-size: $font-base;
    background: #f6f6f6;
    border-radius: 8rpx;
  }
}

/* 凭证上传 */
.pics-section {
  padding: 24rpx 0;

  .pics-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;

    .form-label {
      font-size: $font-base;
      color: $font-color-dark;
    }

    .pics-tip {
      font-size: $font-sm;
      color: $font-color-light;
    }
  }
}

.pics-list {
  display: flex;
  flex-wrap: wrap;

  .pic-item {
    position: relative;
    width: 200rpx;
    height: 200rpx;
    margin: 0 16rpx 16rpx 0;

    image {
      width: 100%;
      height: 100%;
      border-radius: 8rpx;
    }

    .pic-del {
      position: absolute;
      top: -16rpx;
      right: -16rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40rpx;
      height: 40rpx;
      background: rgba(0, 0, 0, 0.6);
      color: #fff;
      font-size: $font-sm + 4rpx;
      border-radius: 50%;
    }

    .pic-loading {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.3);
      color: #fff;
      font-size: $font-sm;
      border-radius: 8rpx;
    }
  }

  .pic-add {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 200rpx;
    height: 200rpx;
    background: #f6f6f6;
    border-radius: 8rpx;
    font-size: $font-sm;
    color: $font-color-light;

    .add-plus {
      font-size: $font-lg + 20rpx;
      line-height: 1;
      margin-bottom: 8rpx;
    }
  }
}

/* 提交按钮 */
.submit-btn {
  margin-top: 40rpx;
  background: $base-color;
  color: #fff;
  border-radius: 40rpx;
  font-size: $font-base + 2rpx;

  &::after {
    border: none;
  }

  &[disabled] {
    opacity: 0.5;
  }
}

/* 原因选择弹层 */
.mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 999;
}

.reason-panel {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  padding: 16rpx 0 40rpx;
  background: #fff;
  border-radius: 20rpx 20rpx 0 0;

  .reason-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 28rpx 40rpx;
    font-size: $font-base;
    color: $font-color-dark;
    border-bottom: 1rpx solid #f2f2f2;

    .active {
      color: $base-color;
    }

    .check {
      color: $base-color;
      font-size: $font-sm + 4rpx;
    }
  }
}
</style>