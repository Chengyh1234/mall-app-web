<template>
  <view class="container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input-wrap">
        <text class="yticon icon-sousuo"></text>
        <input
          class="search-input"
          type="text"
          v-model="keyword"
          placeholder="请输入商品 如：手机"
          placeholder-class="placeholder"
          confirm-type="search"
          :focus="true"
          @input="handleInput"
          @confirm="handleSearch"
        />
        <text
          v-if="keyword"
          class="yticon icon-shanchu4 clear-btn"
          @click="handleClearInput"
        ></text>
      </view>
      <text class="search-action-btn" @click="handleSearch">搜索</text>
    </view>

    <!-- 搜索联想建议 -->
    <view class="suggest-section" v-if="suggestList.length > 0 && keyword">
      <view class="suggest-header">
        <text class="suggest-title">猜你想搜</text>
        <view class="suggest-count">
          <text class="suggest-count-text">{{ suggestList.length }} 条建议</text>
        </view>
      </view>
      <view class="suggest-card">
        <view
          class="suggest-item"
          hover-class="suggest-item-hover"
          :hover-stay-time="50"
          v-for="(item, index) in suggestList"
          :key="index"
          @click="handleSuggestClick(item)"
        >
          <view class="suggest-rank" :class="'rank-' + (index < 3 ? index + 1 : 'other')">
            <text>{{ index < 3 ? index + 1 : index + 1 }}</text>
          </view>
          <text class="suggest-text">
            <template v-for="(seg, i) in highlightKeyword(item)" :key="i">
              <text :class="{ 'suggest-highlight': seg.highlight }">{{ seg.text }}</text>
            </template>
          </text>
          <text class="yticon icon-arrowright suggest-arrow"></text>
        </view>
      </view>
    </view>

    <!-- 搜索历史 -->
    <view class="history-section" v-if="searchStore.historyList.length > 0 && suggestList.length === 0">
      <view class="section-header">
        <text class="section-title">搜索历史</text>
        <text class="yticon icon-lajitong clear-icon" @click="handleClearHistory"></text>
      </view>
      <view class="history-list">
        <view
          class="history-item"
          v-for="(item, index) in searchStore.historyList"
          :key="index"
          @click="handleHistoryClick(item)"
        >
          <text class="history-text">{{ item }}</text>
          <text
            class="yticon icon-shanchu4 delete-icon"
            @click.stop="handleDeleteHistory(item)"
          ></text>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-section" v-else>
      <text class="empty-text">暂无搜索记录</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSearchStore } from '@/stores/search'
import { esSearchSuggestAPI } from '@/apis/esProduct'

// ===== Store 相关 =====
// 获取搜索store
const searchStore = useSearchStore()

// ===== 页面数据 =====
// 搜索关键字
const keyword = ref('')
// 搜索联想建议列表
const suggestList = ref<string[]>([])
// 联想请求防抖定时器
let suggestTimer: ReturnType<typeof setTimeout> | null = null

// 请求搜索联想
const fetchSuggest = async (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) {
    suggestList.value = []
    return
  }
  try {
    const res = await esSearchSuggestAPI(trimmed)
    suggestList.value = res.data || []
  } catch {
    suggestList.value = []
  }
}

// 输入监听（防抖 300ms）
const handleInput = (e: { detail: { value: string } }) => {
  keyword.value = e.detail.value
  if (suggestTimer) {
    clearTimeout(suggestTimer)
  }
  suggestTimer = setTimeout(() => {
    fetchSuggest(e.detail.value)
  }, 300)
}

// 点击联想词直接搜索
const handleSuggestClick = (item: string) => {
  keyword.value = item
  handleSearch()
}

// 将联想词按输入关键词拆分为高亮分段
const highlightKeyword = (item: string) => {
  const kw = keyword.value.trim()
  if (!kw) {
    return [{ text: item, highlight: false }]
  }
  const segments: { text: string; highlight: boolean }[] = []
  let rest = item
  let pos = rest.toLocaleLowerCase().indexOf(kw.toLocaleLowerCase())
  while (pos !== -1 && rest.length > 0) {
    if (pos > 0) {
      segments.push({ text: rest.slice(0, pos), highlight: false })
    }
    segments.push({ text: rest.slice(pos, pos + kw.length), highlight: true })
    rest = rest.slice(pos + kw.length)
    pos = rest.toLocaleLowerCase().indexOf(kw.toLocaleLowerCase())
  }
  if (rest.length > 0) {
    segments.push({ text: rest, highlight: false })
  }
  return segments.length > 0 ? segments : [{ text: item, highlight: false }]
}

// ===== 事件处理方法 =====
// 执行搜索
const handleSearch = () => {
  const trimmed = keyword.value.trim()
  // 保存到搜索历史（仅有关键字时保存）
  if (trimmed) {
    searchStore.addKeyword(trimmed)
  }
  // 跳转到商品列表页（空关键字搜索所有商品）
  uni.navigateTo({
    url: trimmed
      ? `/pages/product/list?keyword=${encodeURIComponent(trimmed)}`
      : '/pages/product/list',
  })
}

// 点击搜索历史
const handleHistoryClick = (item: string) => {
  keyword.value = item
  searchStore.addKeyword(item)
  uni.navigateTo({
    url: `/pages/product/list?keyword=${encodeURIComponent(item)}`,
  })
}

// 清空输入框
const handleClearInput = () => {
  keyword.value = ''
}

// 取消搜索
const handleCancel = () => {
  uni.navigateBack()
}

// 清空搜索历史
const handleClearHistory = () => {
  uni.showModal({
    content: '确定清空搜索历史？',
    success: (e) => {
      if (e.confirm) {
        searchStore.clearHistory()
      }
    },
  })
}

// 删除单条搜索历史
const handleDeleteHistory = (item: string) => {
  searchStore.removeKeyword(item)
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #fff;
}

// 搜索栏
.search-bar {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background: #fff;
}

.search-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  height: 70rpx;
  padding: 0 20rpx;
  background: #f5f5f5;
  border-radius: 35rpx;

  .icon-sousuo {
    font-size: 32rpx;
    color: #999;
    margin-right: 10rpx;
  }
}

.search-input {
  flex: 1;
  height: 70rpx;
  font-size: 28rpx;
  color: $font-color-dark;
}

.placeholder {
  color: #999;
  font-size: 28rpx;
}

.clear-btn {
  font-size: 32rpx;
  color: #ccc;
  padding: 0 10rpx;
}

.search-action-btn {
  margin-left: 20rpx;
  font-size: 28rpx;
  color: $base-color;
  white-space: nowrap;
}

// 搜索联想建议
.suggest-section {
  padding: 20rpx 30rpx 0;

  .suggest-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 10rpx 4rpx 20rpx;
  }

  .suggest-title {
    font-size: 30rpx;
    font-weight: bold;
    color: $font-color-dark;
  }

  .suggest-count {
    padding: 4rpx 16rpx;
    background: #f5f6f7;
    border-radius: 20rpx;
  }

  .suggest-count-text {
    font-size: 22rpx;
    color: #999;
  }

  .suggest-card {
    background: #fff;
    border-radius: 16rpx;
    overflow: hidden;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
  }

  .suggest-item {
    display: flex;
    align-items: center;
    height: 96rpx;
    padding: 0 24rpx;
    border-bottom: 1rpx solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }
  }

  .suggest-item-hover {
    background: #f7f8fa;
  }

  // 排行序号徽标
  .suggest-rank {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36rpx;
    height: 36rpx;
    margin-right: 20rpx;
    border-radius: 8rpx;
    font-size: 24rpx;
    font-weight: 600;
    color: #bbb;
    background: #f2f3f5;

    text {
      line-height: 1;
    }
  }

  .rank-1 {
    color: #fff;
    background: linear-gradient(135deg, #ff6b6b, #ff3d3d);
    font-size: 28rpx;
  }

  .rank-2 {
    color: #fff;
    background: linear-gradient(135deg, #ffa94d, #ff922b);
    font-size: 26rpx;
  }

  .rank-3 {
    color: #fff;
    background: linear-gradient(135deg, #ffd43b, #fcc419);
    font-size: 24rpx;
  }

  .suggest-text {
    flex: 1;
    font-size: 28rpx;
    color: $font-color-dark;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    padding-right: 12rpx;
  }

  .suggest-highlight {
    color: $base-color;
    font-weight: 600;
  }

  .suggest-arrow {
    font-size: 30rpx;
    color: #ccc;
  }
}

// 搜索历史
.history-section {
  padding: 30rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: $font-color-dark;
}

.clear-icon {
  font-size: 34rpx;
  color: #ccc;
}

.history-list {
  display: flex;
  flex-wrap: wrap;
}

.history-item {
  display: flex;
  align-items: center;
  max-width: 100%;
  padding: 12rpx 24rpx;
  margin: 0 20rpx 20rpx 0;
  background: #f5f5f5;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: $font-color-base;
}

.history-text {
  max-width: 300rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.delete-icon {
  font-size: 24rpx;
  color: #ccc;
  margin-left: 10rpx;
}

// 空状态
.empty-section {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 200rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #ccc;
}
</style>
