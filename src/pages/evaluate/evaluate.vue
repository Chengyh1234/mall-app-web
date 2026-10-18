<template>
  <view class="content">
    <!-- 商品卡片 -->
    <view class="goods-card" v-if="productId">
      <image class="goods-img" :src="productPic" mode="aspectFill"></image>
      <view class="goods-info">
        <text class="goods-name clamp">{{ productName }}</text>
        <text class="goods-attr">{{ formatAttr(productAttribute) }}</text>
      </view>
    </view>

    <!-- 评分 -->
    <view class="section rate-section">
      <view class="section-title">
        <text>商品评分</text>
        <text class="rate-tip">{{ star > 0 ? '已选 ' + star + ' 星' : '请选择评分' }}</text>
      </view>
      <!-- 自定义星级选择：可反复点击修改，点击当前星取消 -->
      <view class="star-picker">
        <text
          v-for="n in 5"
          :key="n"
          class="star"
          :class="{ active: n <= star }"
          @click="handleStarClick(n)"
          >★</text
        >
      </view>
    </view>

    <!-- 评价内容 -->
    <view class="section content-section">
      <textarea
        v-model="content"
        class="content-textarea"
        placeholder="宝贝满足你的期待吗？说说它的优点，分享给大家吧~"
        :maxlength="500"
      ></textarea>
      <text class="word-count">{{ content.length }}/500</text>
    </view>

    <!-- 晒图 -->
    <view class="section pics-section">
      <view class="section-title">
        <text>晒图</text>
        <text class="rate-tip">最多上传9张</text>
      </view>
      <view class="pics-list">
        <view v-for="(pic, index) in picsList" :key="index" class="pic-item">
          <image :src="pic.url" mode="aspectFill"></image>
          <text
            v-if="!pic.uploading"
            class="pic-del yticon icon-iconfontshanchu1"
            @click="removePic(index)"
          ></text>
          <view v-if="pic.uploading" class="pic-loading">
            <text>上传中</text>
          </view>
        </view>
        <view v-if="picsList.length < 9" class="pic-add" @click="chooseImage">
          <text class="add-plus">+</text>
          <text>添加图片</text>
        </view>
      </view>
    </view>

    <!-- 提交 -->
    <button class="submit-btn" :loading="submitting" @click="handleSubmit">发表评价</button>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { addCommentAPI } from '@/apis/comment'
import { uploadImageToOSS } from '@/utils/oss'

// ===== 商品信息（来自订单入口传参） =====
const productId = ref(0)
const productName = ref('')
const productPic = ref('')
const productAttribute = ref('')

// ===== 表单数据 =====
// 评价星数：1-5
const star = ref(0)
// 评价内容
const content = ref('')
// 晒图列表（本地缩略图 -> OSS 上传后替换为完整URL）
const picsList = ref<{ url: string; uploading: boolean }[]>([])
// 是否提交中
const submitting = ref(false)

// ===== onLoad =====
// 接收订单入口传来的商品信息（uni 已对 query 解码）
onLoad((options) => {
  if (options?.productId) {
    productId.value = +options.productId
  }
  productName.value = options?.productName || ''
  productPic.value = options?.productPic || ''
  productAttribute.value = options?.productAttribute || ''
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

// 选择星级：点击第n颗星设为n星，点击当前星取消
const handleStarClick = (n: number) => {
  star.value = star.value === n ? 0 : n
}

// 内容达到500字上限时提示
watch(content, (val) => {
  if (val.length >= 500) {
    uni.showToast({ icon: 'none', title: '最多输入500字' })
  }
})

// 选择并上传图片
const chooseImage = () => {
  const count = 9 - picsList.value.length
  uni.chooseImage({
    count,
    success: async (res) => {
      for (const tempFilePath of res.tempFilePaths) {
        // 先插入占位（上传中）；后续必须通过 picsList.value[index] 代理修改才能触发视图更新
        picsList.value.push({ url: tempFilePath, uploading: true })
        const index = picsList.value.length - 1
        try {
          const url = await uploadImageToOSS(tempFilePath)
          picsList.value[index].url = url
        } catch (e) {
          console.error('图片上传失败', e)
          uni.showToast({ icon: 'none', title: '图片上传失败' })
          picsList.value.splice(index, 1)
        } finally {
          picsList.value[index].uploading = false
        }
      }
    },
  })
}

// 删除已选图片
const removePic = (index: number) => {
  picsList.value.splice(index, 1)
}

// 提交评价
const handleSubmit = async () => {
  if (star.value < 1) {
    uni.showToast({ icon: 'none', title: '请选择评分' })
    return
  }
  if (!content.value.trim()) {
    uni.showToast({ icon: 'none', title: '请输入评价内容' })
    return
  }
  if (picsList.value.some((p) => p.uploading)) {
    uni.showToast({ icon: 'none', title: '图片上传中，请稍候' })
    return
  }
  submitting.value = true
  try {
    const pics = picsList.value.map((p) => p.url).join(',')
    await addCommentAPI({
      productId: productId.value,
      star: star.value,
      content: content.value.trim(),
      pics: pics || undefined,
      productAttribute: productAttribute.value || undefined,
    })
    uni.showToast({ icon: 'success', title: '评价成功' })
    setTimeout(() => {
      // 返回上一页（订单列表/订单详情）；H5 刷新后无上一页时，跳转到订单列表兜底
      uni.navigateBack({
        fail: () => {
          uni.redirectTo({ url: '/pages/order/order' })
        },
      })
    }, 1000)
  } catch (e) {
    console.error('发表评价失败', e)
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

/* 商品卡片 */
.goods-card {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: #fff;
  border-radius: 10rpx;

  .goods-img {
    flex-shrink: 0;
    width: 140rpx;
    height: 140rpx;
    border-radius: 6rpx;
  }

  .goods-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding-left: 24rpx;
    overflow: hidden;

    .goods-name {
      font-size: $font-base + 4rpx;
      color: $font-color-dark;
      line-height: 1.4;
    }

    .goods-attr {
      margin-top: 12rpx;
      font-size: $font-sm + 2rpx;
      color: $font-color-light;
    }
  }
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
    margin-bottom: 24rpx;

    .rate-tip {
      font-size: $font-sm + 2rpx;
      color: $font-color-light;
    }
  }
}

/* 评分 */
.rate-section {
  .star-picker {
    display: flex;
    justify-content: center;
    align-items: center;

    .star {
      font-size: 64rpx;
      line-height: 1;
      margin: 0 12rpx;
      color: #ddd;

      &.active {
        color: #f9a100;
      }
    }
  }
}

/* 评价内容 */
.content-section {
  position: relative;

  .content-textarea {
    width: 100%;
    height: 240rpx;
    padding: 16rpx;
    box-sizing: border-box;
    font-size: $font-base;
    background: #f6f6f6;
    border-radius: 8rpx;
  }

  .word-count {
    position: absolute;
    right: 24rpx;
    bottom: 16rpx;
    font-size: $font-sm;
    color: $font-color-light;
  }
}

/* 晒图 */
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
      font-size: $font-sm + 2rpx;
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
}
</style>
