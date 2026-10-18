import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUnreadMessageCountAPI } from '@/apis/message'

// 定义消息Store：管理全局未读数与轮询
export const useMessageStore = defineStore('message', () => {
  // 未读消息数量
  const unreadCount = ref(0)
  // 轮询定时器
  let pollingTimer: ReturnType<typeof setInterval> | null = null

  // 刷新未读数（未登录时置 0）
  const refreshUnread = async () => {
    // 以 token 判断登录态，避免 App 重启后内存用户信息未加载导致漏拉
    if (!uni.getStorageSync('token')) {
      unreadCount.value = 0
      return
    }
    try {
      const res = await getUnreadMessageCountAPI()
      unreadCount.value = res.data
    } catch {
      // 拉取失败保持原值，不阻断页面
    }
  }

  // 启动轮询（进入首页/个人中心时调用，返回首次刷新 Promise 便于页面同步徽标）
  const startPolling = () => {
    stopPolling()
    const p = refreshUnread()
    pollingTimer = setInterval(() => refreshUnread(), 30 * 1000)
    return p
  }

  // 停止轮询（登出/App隐藏时调用）
  const stopPolling = () => {
    if (pollingTimer) {
      clearInterval(pollingTimer)
      pollingTimer = null
    }
  }

  // 单条已读后本地减少未读数
  const decreaseUnread = (count = 1) => {
    unreadCount.value = Math.max(0, unreadCount.value - count)
  }

  // 全部已读后清零
  const clearUnread = () => {
    unreadCount.value = 0
  }

  return {
    unreadCount,
    refreshUnread,
    startPolling,
    stopPolling,
    decreaseUnread,
    clearUnread,
  }
})