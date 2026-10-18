<template>
  <view class="container">
    <!-- 分类 Tab + 全部已读 -->
    <view class="navbar">
      <view
        v-for="(item, index) in navList"
        :key="index"
        class="nav-item"
        :class="{ current: tabCurrentIndex === index }"
        @click="handleTabClick(index)"
      >
        {{ item.text }}
      </view>
      <text class="read-all" @click="handleReadAll">全部已读</text>
    </view>

    <!-- 消息列表 -->
    <view v-if="messageList.length > 0" class="message-list">
      <view
        v-for="item in messageList"
        :key="item.id"
        class="message-item"
        @click="handleMessageClick(item)"
      >
        <view class="icon-box" :class="'type-' + item.type">
          <text class="type-text">{{ typeText[item.type] }}</text>
          <text v-if="item.readStatus === 0" class="unread-dot"></text>
        </view>
        <view class="content-box">
          <view class="title-row">
            <text class="title" :class="{ 'is-unread': item.readStatus === 0 }">{{ item.title }}</text>
            <text class="time">{{ formatTime(item.createTime) }}</text>
          </view>
          <text class="summary ellipsis">{{ item.content || '点击查看详情' }}</text>
        </view>
      </view>
      <view class="load-more">
        <text>{{ loadMoreText }}</text>
      </view>
    </view>

    <!-- 空态 -->
    <empty v-else-if="!loading" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad, onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app'
import { getMessageListAPI, readMessageAPI, readAllMessageAPI } from '@/apis/message'
import { useMessageStore } from '@/stores/message'
import type { MessageItem, MessageType } from '@/types/message'
import { formatDate } from '@/utils/date'
import empty from '@/components/empty.vue'

// ===== Tab 导航数据 =====
// 消息分类 Tab（type 为空表示全部）
const navList: { type?: MessageType; text: string }[] = [
  { type: undefined, text: '全部' },
  { type: 1, text: '系统' },
  { type: 2, text: '订单' },
  { type: 3, text: '营销' },
]
// 类型中文名（与徽标展示一致）
const typeText: Record<MessageType, string> = { 1: '系统', 2: '订单', 3: '营销' }

// ===== 页面数据 =====
// 当前选中 Tab 索引
const tabCurrentIndex = ref(0)
// 消息列表
const messageList = ref<MessageItem[]>([])
// 是否加载中
const loading = ref(false)
// 是否已全部加载
const finished = ref(false)
// 当前页码，从1开始
const pageNum = ref(1)
// 每页数量
const pageSize = 10

// 消息 Store（全局未读数）
const messageStore = useMessageStore()

// 加载更多文案
const loadMoreText = computed(() => (finished.value ? '没有更多了' : '加载中...'))

// ===== 数据加载 =====
// 加载消息列表（isRefresh 为 true 时刷新覆盖列表）
const loadData = async (isRefresh = false) => {
  if (loading.value) {
    return
  }
  loading.value = true
  try {
    const res = await getMessageListAPI({
      type: navList[tabCurrentIndex.value].type,
      pageNum: pageNum.value,
      pageSize,
    })
    const page = res.data
    const list = page?.list ?? []
    messageList.value = isRefresh ? list : [...messageList.value, ...list]
    finished.value = list.length < pageSize || pageNum.value >= (page?.totalPage ?? 1)
  } catch (e) {
    console.error('加载消息失败', e)
  } finally {
    loading.value = false
  }
}

// ===== 生命周期 =====
// 页面加载：未登录时引导登录
onLoad(() => {
  if (!uni.getStorageSync('token')) {
    uni.navigateTo({ url: '/pages/public/login' })
    return
  }
  loadData()
})

// 触底加载更多
onReachBottom(() => {
  if (finished.value || loading.value) {
    return
  }
  pageNum.value += 1
  loadData()
})

// 下拉刷新
onPullDownRefresh(async () => {
  pageNum.value = 1
  await loadData(true)
  uni.stopPullDownRefresh()
})

// ===== 事件处理方法 =====
// 切换 Tab
const handleTabClick = (index: number) => {
  if (tabCurrentIndex.value === index) {
    return
  }
  tabCurrentIndex.value = index
  pageNum.value = 1
  finished.value = false
  messageList.value = []
  loadData()
}

// 点击消息：标记已读并按业务跳转
const handleMessageClick = async (item: MessageItem) => {
  // 未读则先标记已读
  if (item.readStatus === 0) {
    item.readStatus = 1
    messageStore.decreaseUnread()
    try {
      await readMessageAPI(item.id)
    } catch (e) {
      console.error('标记已读失败', e)
    }
  }
  // 订单消息跳转订单详情
  if (item.type === 2 && item.bizId) {
    uni.navigateTo({ url: `/pages/order/orderDetail?orderId=${item.bizId}` })
  }
  // 营销消息跳转领券页（bizId 为优惠券ID）
  if (item.type === 3 && item.bizId) {
    uni.navigateTo({ url: `/pages/coupon/couponDetail?couponId=${item.bizId}` })
  }
}

// 全部已读
const handleReadAll = async () => {
  const hasUnread = messageList.value.some((item) => item.readStatus === 0)
  if (!hasUnread) {
    uni.showToast({ icon: 'none', title: '暂无未读消息' })
    return
  }
  try {
    await readAllMessageAPI(navList[tabCurrentIndex.value].type)
    messageList.value.forEach((item) => (item.readStatus = 1))
    messageStore.clearUnread()
    uni.showToast({ icon: 'none', title: '已全部标记为已读' })
  } catch (e) {
    console.error('全部已读失败', e)
  }
}

// 格式化消息时间：今天显示时分，跨天显示月日时分
const formatTime = (time: string) => {
  if (!time) {
    return ''
  }
  const date = new Date(time)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  return isToday ? formatDate(date, 'hh:mm') : formatDate(date, 'MM-dd hh:mm')
}
</script>

<style lang="scss">
page {
  background-color: #f5f5f5;
}
</style>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  padding-bottom: 40rpx;
}

.navbar {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 5px;
  background: #fff;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 10;

  .nav-item {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    font-size: 15px;
    color: #606266;
    position: relative;

    &.current {
      color: #fa436a;
      font-weight: 600;

      &:after {
        content: '';
        position: absolute;
        left: 50%;
        bottom: 0;
        transform: translateX(-50%);
        width: 44px;
        height: 0;
        border-bottom: 2px solid #fa436a;
      }
    }
  }

  .read-all {
    padding: 0 12px;
    font-size: 13px;
    color: #999;
    flex-shrink: 0;
  }
}

.message-item {
  display: flex;
  align-items: flex-start;
  padding: 28rpx 24rpx;
  margin: 20rpx 24rpx 0;
  background: #fff;
  border-radius: 12rpx;

  .icon-box {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 76rpx;
    height: 76rpx;
    border-radius: 50%;
    flex-shrink: 0;
    color: #fff;

    &.type-1 {
      background: #54b4ef;
    }

    &.type-2 {
      background: #fa436a;
    }

    &.type-3 {
      background: #ff9800;
    }

    .type-text {
      font-size: 24rpx;
    }

    .unread-dot {
      position: absolute;
      top: -4rpx;
      right: -4rpx;
      width: 18rpx;
      height: 18rpx;
      background: #fa436a;
      border: 2rpx solid #fff;
      border-radius: 50%;
    }
  }

  .content-box {
    flex: 1;
    margin-left: 20rpx;
    overflow: hidden;

    .title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .title {
        font-size: 30rpx;
        color: #303133;
        margin-right: 16rpx;
      }

      .is-unread {
        font-weight: 600;
      }

      .time {
        flex-shrink: 0;
        font-size: 22rpx;
        color: #999;
      }
    }

    .summary {
      margin-top: 12rpx;
      font-size: 26rpx;
      color: #999;
    }
  }
}

.load-more {
  padding: 30rpx 0;
  text-align: center;
  font-size: 24rpx;
  color: #999;
}
</style>