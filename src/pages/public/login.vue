<template>
  <view class="container">
    <view class="left-bottom-sign"></view>
    <view class="back-btn yticon icon-zuojiantou-up" @click="navBack"></view>
    <view class="right-top-sign"></view>
    <!-- 设置白色背景防止软键盘把下部绝对定位元素顶上来盖住输入框等 -->
    <view class="wrapper">
      <view class="left-top-sign">LOGIN</view>
      <view class="welcome">欢迎回来！</view>
      <view class="tab-bar">
        <view class="tab-item" :class="{ active: loginMode === 'sms' }" @click="switchMode('sms')">验证码登录</view>
        <view class="tab-item" :class="{ active: loginMode === 'password' }" @click="switchMode('password')">密码登录</view>
      </view>
      <!-- 短信验证码登录 -->
      <view class="input-content" v-if="loginMode === 'sms'">
        <view class="input-item">
          <text class="tit">手机号</text>
          <input type="number" v-model="phone" placeholder="请输入手机号" :maxlength="11" />
        </view>
        <view class="input-item">
          <text class="tit">图形验证码</text>
          <view class="captcha-row">
            <input
              type="text"
              v-model="captchaText"
              placeholder="请输入图形验证码"
              :maxlength="4"
              @confirm="toLogin"
            />
            <image class="captcha-img" :src="captchaImage" mode="aspectFit" @click="loadCaptcha"></image>
          </view>
        </view>
        <view class="input-item">
          <text class="tit">短信验证码</text>
          <view class="auth-code-row">
            <input
              type="number"
              v-model="smsCode"
              placeholder="请输入短信验证码"
              :maxlength="6"
              @confirm="toLogin"
            />
            <button
              class="get-code-btn"
              :class="{ disabled: smsCountdown > 0 }"
              :disabled="smsCountdown > 0"
              @click="handleGetSmsCode"
            >
              {{ smsCountdown > 0 ? `${smsCountdown}s后重试` : '获取验证码' }}
            </button>
          </view>
        </view>
      </view>
      <!-- 手机号密码登录 -->
      <view class="input-content" v-else>
        <view class="input-item">
          <text class="tit">手机号</text>
          <input type="number" v-model="phone" placeholder="请输入手机号" :maxlength="11" />
        </view>
        <view class="input-item">
          <text class="tit">密码</text>
          <view class="password-row">
            <input
              v-model="password"
              placeholder="请输入密码"
              placeholder-class="input-empty"
              :maxlength="20"
              :password="!showPassword"
              @confirm="toLogin"
            />
            <view
              class="eye-icon"
              :class="showPassword ? 'eye-open' : 'eye-close'"
              @click="togglePassword"
            ></view>
          </view>
        </view>
      </view>
      <button class="confirm-btn" @click="toLogin" :disabled="logining"> 登录 </button>
      <view class="forget-section" @click="toForgetPassword">忘记密码?</view>
    </view>
    <view class="register-section">
      还没有账号?
      <text @click="toRegist">马上注册</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useMemberStore } from '@/stores/member'
import { useSmsCode } from '@/composables/useSmsCode'

// 获取会员store
const memberStore = useMemberStore()

// 图形验证码 + 短信验证码获取逻辑
const { captchaImage, captchaText, smsCountdown, loadCaptcha, sendSmsCode } = useSmsCode()

// 登录手机号
const phone = ref('')
// 登录密码（密码登录）
const password = ref('')
// 密码是否明文显示
const showPassword = ref(false)
// 切换密码可见性
const togglePassword = () => {
  showPassword.value = !showPassword.value
}
// 短信验证码
const smsCode = ref('')
// 登录方式：sms=短信验证码登录, password=密码登录
const loginMode = ref<'sms' | 'password'>('sms')
// 登录加载状态
const logining = ref(false)

// 页面加载时获取图形验证码
onLoad(() => {
  loadCaptcha()
})

// 切换登录方式
const switchMode = (mode: 'sms' | 'password') => {
  loginMode.value = mode
  // 切回验证码登录时刷新图形验证码
  if (mode === 'sms') {
    loadCaptcha()
  }
}

// 获取短信验证码
const handleGetSmsCode = async () => {
  try {
    await sendSmsCode(phone.value)
    uni.showToast({
      title: '验证码已发送',
      icon: 'none',
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : '获取验证码失败，请重试'
    uni.showToast({
      title: msg,
      icon: 'none',
    })
  }
}

// 登录处理
const toLogin = async () => {
  if (!phone.value) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }
  if (loginMode.value === 'sms') {
    if (!smsCode.value) {
      uni.showToast({ title: '请输入短信验证码', icon: 'none' })
      return
    }
  } else {
    if (!password.value) {
      uni.showToast({ title: '请输入密码', icon: 'none' })
      return
    }
  }

  logining.value = true

  try {
    if (loginMode.value === 'sms') {
      await memberStore.memberSmsLogin(phone.value, smsCode.value)
    } else {
      await memberStore.memberPasswordLogin(phone.value, password.value)
    }

    uni.showToast({
      title: '登录成功',
      icon: 'success',
    })

    // 登录成功后立即清空密码，缩短其在内存中的存活时间
    password.value = ''

    setTimeout(() => {
      // 登录成功跳转：有来源页面则返回来源页（如“我的”/购物车/商品页），否则跳首页
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack({
          fail: () => {
            uni.switchTab({ url: '/pages/index/index' })
          },
        })
      } else {
        uni.switchTab({ url: '/pages/index/index' })
      }
    }, 500)
  } catch (error) {
    uni.showToast({
      title: loginMode.value === 'sms' ? '登录失败，请检查验证码' : '登录失败，请检查账号密码',
      icon: 'none',
    })
  } finally {
    logining.value = false
  }
}

// 返回上一页
const navBack = () => {
  uni.navigateBack()
}

// 跳转到忘记密码页
const toForgetPassword = () => {
  uni.navigateTo({ url: '/pages/public/forgetPassword' })
}

// 跳转到注册页
const toRegist = () => {
  uni.navigateTo({ url: '/pages/public/register?mode=register' })
}
</script>

<style lang="scss">
page {
  background: #fff;
}

.container {
  padding-top: 115px;
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #fff;
}

.wrapper {
  position: relative;
  z-index: 90;
  background: #fff;
  padding-bottom: 40rpx;
}

.back-btn {
  position: absolute;
  left: 40rpx;
  z-index: 9999;
  top: calc(var(--status-bar-height) + 40rpx);
  font-size: 40rpx;
  color: $font-color-dark;
}

.left-top-sign {
  font-size: 120rpx;
  color: $page-color-base;
  position: relative;
  left: -16rpx;
}

.right-top-sign {
  position: absolute;
  top: calc(var(--status-bar-height) + 80rpx);
  right: -30rpx;
  z-index: 95;

  &:before,
  &:after {
    display: block;
    content: '';
    width: 400rpx;
    height: 80rpx;
    background: #b4f3e2;
  }

  &:before {
    transform: rotate(50deg);
    border-radius: 0 50px 0 0;
  }

  &:after {
    position: absolute;
    right: -198rpx;
    top: 0;
    transform: rotate(-50deg);
    border-radius: 50px 0 0 0;
    /* background: pink; */
  }
}

.left-bottom-sign {
  position: absolute;
  left: -270rpx;
  bottom: -320rpx;
  border: 100rpx solid #d0d1fd;
  border-radius: 50%;
  padding: 180rpx;
}

.welcome {
  position: relative;
  left: 50rpx;
  top: -90rpx;
  font-size: 46rpx;
  color: #555;
  text-shadow: 1px 0px 1px rgba(0, 0, 0, 0.3);
}

.tab-bar {
  display: flex;
  justify-content: center;
  margin-bottom: 40rpx;

  .tab-item {
    font-size: 30rpx;
    color: #999;
    padding: 0 40rpx 12rpx;
    border-bottom: 4rpx solid transparent;

    &.active {
      color: $uni-color-primary;
      border-bottom-color: $uni-color-primary;
      font-weight: 600;
    }
  }
}

.password-row {
  display: flex;
  align-items: center;
  flex: 1;

  input {
    flex: 1;
  }
}

.eye-icon {
  flex-shrink: 0;
  width: 36rpx;
  height: 36rpx;
  margin-left: 16rpx;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-position: center;
}

/* 睁眼（明文可见，点击可隐藏） */
.eye-open {
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'/%3E%3Ccircle cx='12' cy='12' r='3'/%3E%3C/svg%3E");
}

/* 闭眼（明文隐藏，点击可显示） */
.eye-close {
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'/%3E%3Ccircle cx='12' cy='12' r='3'/%3E%3Cline x1='1' y1='1' x2='23' y2='23'/%3E%3C/svg%3E");
}

.input-content {
  padding: 0 60rpx;
}

.input-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding: 0 30rpx;
  background: $page-color-light;
  height: 120rpx;
  border-radius: 4px;
  margin-bottom: 50rpx;

  &:last-child {
    margin-bottom: 0;
  }

  .tit {
    height: 50rpx;
    line-height: 56rpx;
    font-size: $font-sm + 2rpx;
    color: $font-color-base;
  }

  input {
    height: 60rpx;
    font-size: $font-base + 2rpx;
    color: $font-color-dark;
    width: 100%;
  }
}

.auth-code-row {
  display: flex;
  align-items: center;
  width: 100%;

  input {
    flex: 1;
  }

  .get-code-btn {
    flex-shrink: 0;
    width: 200rpx;
    height: 60rpx;
    line-height: 60rpx;
    font-size: 24rpx;
    color: $uni-color-primary;
    background: #fff;
    border: 1rpx solid $uni-color-primary;
    border-radius: 8rpx;
    padding: 0;
    margin: 0;
    margin-left: 20rpx;

    &::after {
      border: none;
    }

    &.disabled {
      color: $font-color-disabled;
      border-color: $font-color-disabled;
    }
  }
}

.captcha-row {
  display: flex;
  align-items: center;
  width: 100%;

  input {
    flex: 1;
  }

  .captcha-img {
    flex-shrink: 0;
    width: 180rpx;
    height: 60rpx;
    border-radius: 8rpx;
    margin-left: 20rpx;
    background: #f2f3f5;
  }
}

.confirm-btn {
  width: 630rpx;
  height: 76rpx;
  line-height: 76rpx;
  border-radius: 50px;
  margin-top: 70rpx;
  background: $uni-color-primary;
  color: #fff;
  font-size: $font-lg;

  &:after {
    border-radius: 100px;
  }
}

.forget-section {
  font-size: $font-sm + 2rpx;
  color: $font-color-spec;
  text-align: center;
  margin-top: 40rpx;
}

.register-section {
  position: absolute;
  left: 0;
  bottom: 50rpx;
  width: 100%;
  font-size: $font-sm + 2rpx;
  color: $font-color-base;
  text-align: center;

  text {
    color: $font-color-spec;
    margin-left: 10rpx;
  }
}
</style>
