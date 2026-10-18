<template>
  <view
    class="mix-list-cell"
    :class="border"
    @click="emit('eventClick')"
    hover-class="cell-hover"
    :hover-stay-time="50"
  >
    <view v-if="icon" class="cell-icon-box" :style="[{ color: iconColor }]">
      <text class="cell-icon yticon" :class="icon"></text>
      <!-- 图标右上角未读徽标（badge <= 0 时不显示） -->
      <text v-if="badge && badge > 0" class="cell-badge">{{ badge > 99 ? '99+' : badge }}</text>
    </view>
    <text class="cell-tit clamp">{{ title }}</text>
    <text v-if="tips" class="cell-tip">{{ tips }}</text>
    <text class="cell-more yticon" :class="typeList[navigateType]"></text>
  </view>
</template>

<script setup lang="ts">
const props = defineProps<{
  icon?: string
  title?: string
  tips?: string
  navigateType?: 'left' | 'right' | 'up' | 'down'
  border?: string
  hoverClass?: string
  iconColor?: string
  /** 图标右上角徽标数字（<= 0 时隐藏） */
  badge?: number
}>()

const emit = defineEmits<{
  eventClick: []
}>()

const typeList = {
  left: 'icon-zuo',
  right: 'icon-you',
  up: 'icon-shang',
  down: 'icon-xia',
}
</script>

<style lang="scss" scoped>
.icon .mix-list-cell.b-b:after {
  left: 90rpx;
}

.mix-list-cell {
  display: flex;
  align-items: baseline;
  padding: 20rpx 30rpx;
  line-height: 60rpx;
  position: relative;

  &.cell-hover {
    background: #fafafa;
  }

  &.b-b:after {
    left: 30rpx;
  }

  .cell-icon-box {
    position: relative;
    align-self: center;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56rpx;
    flex-shrink: 0;
  }

  .cell-icon {
    max-height: 60rpx;
    font-size: 38rpx;
    line-height: 1;
  }

  .cell-badge {
    position: absolute;
    top: -12rpx;
    right: -16rpx;
    min-width: 30rpx;
    height: 30rpx;
    padding: 0 8rpx;
    background: #fa436a;
    color: #fff;
    font-size: 20rpx;
    line-height: 30rpx;
    text-align: center;
    border-radius: 15rpx;
    border: 2rpx solid #fff;
    box-sizing: border-box;
  }

  .cell-more {
    align-self: center;
    font-size: 30rpx;
    color: #999;
    margin-left: 8rpx;
  }

  .cell-tit {
    flex: 1;
    font-size: 28rpx;
    color: #333;
    margin-right: 10rpx;
  }

  .cell-tip {
    font-size: 24rpx;
    color: #999;
  }
}
</style>
