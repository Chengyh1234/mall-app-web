<template>
  <view class="content">
    <!-- 空白页 -->
    <empty v-if="commentList.length === 0 && loadingType !== 'loading'" />
    <!-- 评论列表 -->
    <view class="comment-list">
      <view
        v-for="(item, index) in commentList"
        :key="index"
        class="comment-card"
        @click="navToProduct(item)"
      >
        <view class="head">
          <image
            class="portrait"
            :src="item.memberIcon || '/static/missing-face.png'"
            mode="aspectFill"
          ></image>
          <view class="user-info">
            <text class="name">{{ item.memberNickName || '匿名用户' }}</text>
            <uni-rate :value="item.star" :disabled="true" :size="12" />
          </view>
          <text class="time">{{ formatDateTime(item.createTime) }}</text>
        </view>
        <text class="comment-content">{{ item.content }}</text>
        <!-- 晒图 -->
        <view v-if="item.pics" class="pics">
          <image
            v-for="(pic, picIndex) in item.pics.split(',')"
            :key="picIndex"
            :src="pic"
            mode="aspectFill"
            @click.stop="previewImage(pic)"
          ></image>
        </view>
        <!-- 商品信息 -->
        <view class="product-info">
          <text class="product-name clamp">{{ item.productName || '查看商品' }}</text>
          <text class="reply-count">回复 {{ item.replayCount || 0 }}</text>
        </view>
      </view>
    </view>
    <!-- 加载状态 -->
    <view v-if="commentList.length > 0" class="load-more">
      {{ loadingType === 'nomore' ? '没有更多了' : loadingType === 'loading' ? '加载中...' : '上拉加载更多' }}
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { getMyCommentListAPI } from '@/apis/comment'
import type { PmsCommentDetail } from '@/types/comment'
import empty from '@/components/empty.vue'

// ===== 页面数据 =====
// 加载更多状态
const loadingType = ref<'more' | 'loading' | 'nomore'>('more')
// 我的评价列表
const commentList = ref<PmsCommentDetail[]>([])
// 分页请求参数
const searchParam = ref({
  pageNum: 1,
  pageSize: 6,
})

// ===== 日期格式化 =====
const formatDateTime = (time?: string) => {
  if (!time) {
    return 'N/A'
  }
  const date = new Date(time)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
}

// ===== loadData =====
// 加载我的评价列表，支持下拉刷新和上拉加载
const loadData = async (type: 'refresh' | 'add' = 'add') => {
  if (type === 'add') {
    if (loadingType.value === 'nomore') {
      return
    }
    loadingType.value = 'loading'
  } else {
    loadingType.value = 'more'
  }

  // 下拉刷新时重置
  if (type === 'refresh') {
    searchParam.value.pageNum = 1
    commentList.value = []
  }

  try {
    const res = await getMyCommentListAPI(
      searchParam.value.pageNum,
      searchParam.value.pageSize,
    )
    const dataList = res.data.list || []

    if (dataList.length === 0) {
      loadingType.value = 'nomore'
      searchParam.value.pageNum = Math.max(1, searchParam.value.pageNum - 1)
    } else {
      if (dataList.length < searchParam.value.pageSize) {
        loadingType.value = 'nomore'
        searchParam.value.pageNum = Math.max(1, searchParam.value.pageNum - 1)
      } else {
        loadingType.value = 'more'
      }
      commentList.value = commentList.value.concat(dataList)
    }

    if (type === 'refresh') {
      uni.stopPullDownRefresh()
    }
  } catch (e) {
    console.error('加载我的评价失败', e)
    if (type === 'refresh') {
      uni.stopPullDownRefresh()
    }
  }
}

// ===== onLoad =====
onLoad(() => {
  loadData()
})

// ===== onPullDownRefresh =====
onPullDownRefresh(() => {
  loadData('refresh')
})

// ===== onReachBottom =====
onReachBottom(() => {
  if (loadingType.value === 'nomore') {
    return
  }
  searchParam.value.pageNum++
  loadData()
})

// ===== 事件处理方法 =====

// 跳转商品详情页
const navToProduct = (item: PmsCommentDetail) => {
  uni.navigateTo({
    url: `/pages/product/product?id=${item.productId}`,
  })
}

// 预览图片
const previewImage = (url: string) => {
  uni.previewImage({ urls: [url], current: url })
}
</script>

<style lang="scss">
page {
  background: $page-color-base;
}
</style>

<style lang="scss" scoped>
.comment-list {
  padding: 20rpx;
}

.comment-card {
  background: #fff;
  border-radius: 10rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;

  .head {
    display: flex;
    align-items: center;

    .portrait {
      flex-shrink: 0;
      width: 72rpx;
      height: 72rpx;
      border-radius: 50%;
    }

    .user-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      margin-left: 16rpx;

      .name {
        font-size: $font-base + 2rpx;
        color: $font-color-dark;
        margin-bottom: 4rpx;
      }

      :deep(.uni-rate) {
        margin-left: 0;
      }
    }

    .time {
      font-size: $font-sm;
      color: $font-color-light;
    }
  }

  .comment-content {
    display: block;
    padding: 20rpx 0;
    font-size: $font-base;
    color: $font-color-dark;
    line-height: 1.6;
  }

  /* 晒图 */
  .pics {
    display: flex;
    flex-wrap: wrap;

    image {
      width: 150rpx;
      height: 150rpx;
      margin: 0 12rpx 12rpx 0;
      border-radius: 6rpx;
    }
  }

  /* 商品信息 */
  .product-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16rpx;
    margin-top: 8rpx;
    background: #f6f6f6;
    border-radius: 8rpx;

    .product-name {
      flex: 1;
      font-size: $font-sm + 2rpx;
      color: $font-color-base;
    }

    .reply-count {
      margin-left: 16rpx;
      font-size: $font-sm;
      color: $font-color-light;
    }
  }
}

.load-more {
  text-align: center;
  padding: 20rpx;
  font-size: $font-sm + 2rpx;
  color: $font-color-light;
}
</style>
