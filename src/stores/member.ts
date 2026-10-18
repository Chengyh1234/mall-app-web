import type { MemberInfo } from '@/types/member'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loginAPI, loginBySmsCodeAPI, getMemberInfoAPI } from '@/apis/member'
import { useMessageStore } from '@/stores/message'

// 定义会员Store
export const useMemberStore = defineStore(
  'member',
  () => {
    // 会员信息
    const memberInfo = ref<MemberInfo>()

    // 是否已登录
    const hasLogin = computed(() => !!memberInfo.value)

    // 保存会员信息，登录时使用（剔除敏感字段，防止 password/phone 落盘）
    const setMemberInfo = (val: MemberInfo) => {
      // 后端可能返回 password、phone 等敏感字段，剔除后再保存（内存与持久化均不含）
      const { password: _password, phone: _phone, ...safe } = val as MemberInfo & {
        password?: string
        phone?: string
      }
      memberInfo.value = safe
    }

    // 手机号密码登录（核心业务逻辑，不包含 UI 交互）
    const memberPasswordLogin = async (phone: string, password: string) => {
      await handleLogin(loginAPI({ phone, password }))
    }

    // 短信验证码登录（核心业务逻辑，不包含 UI 交互）
    const memberSmsLogin = async (phone: string, smsCode: string) => {
      await handleLogin(loginBySmsCodeAPI({ phone, smsCode }))
    }

    // 通用登录处理：存储 token 并拉取用户信息
    const handleLogin = async (
      loginPromise: Promise<{ data: { tokenHead: string; token: string } }>,
    ) => {
      // 1. 拼接完整 token 并存储（不落盘手机号等敏感个人信息）
      const loginData = (await loginPromise).data
      const token = `${loginData.tokenHead}${loginData.token}`
      uni.setStorageSync('token', token)

      // 2. 获取用户信息（失败不阻断登录，用户信息后续可刷新）
      try {
        const memberRes = await getMemberInfoAPI()
        setMemberInfo(memberRes.data)
      } catch {
        // 忽略，不影响登录成功跳转
      }

      // 3. 未读数由首页/个人中心页面进入时自行刷新，登录后不再全局轮询
    }

    // 会员退出登录
    const memberLogout = () => {
      memberInfo.value = undefined
      uni.removeStorageSync('token')
      // 停止消息轮询并清零未读数（未登录时 refreshUnread 仅清零不发请求）
      useMessageStore().stopPolling()
      useMessageStore().refreshUnread()
    }

    return {
      memberInfo,
      hasLogin,
      setMemberInfo,
      memberPasswordLogin,
      memberSmsLogin,
      memberLogout,
    }
  },
  // TODO: 持久化
  {
    // 网页端用法
    // persist: true,
    // 兼容多端的用法
    persist: {
      storage: {
        setItem(key, value) {
          uni.setStorageSync(key, value)
        },
        getItem(key) {
          return uni.getStorageSync(key)
        },
      },
      // 恢复时再次清洗存量数据（历史版本可能已落盘 password/phone）
      afterRestore(context) {
        const store = context.store as unknown as {
          memberInfo?: MemberInfo
          setMemberInfo: (val: MemberInfo) => void
        }
        if (store.memberInfo) {
          store.setMemberInfo(store.memberInfo)
        }
      },
    },
  },
)
