<template>
  <view class="container">
    <view class="left-top-sign">RESET</view>
    <view class="welcome">重置密码</view>
    <view class="input-content">
      <view class="input-item">
        <text class="tit">手机号</text>
        <input type="number" v-model="formData.phone" placeholder="请输入手机号" :maxlength="11" />
      </view>
      <view class="input-item">
        <text class="tit">图形验证码</text>
        <view class="captcha-row">
          <input
            type="text"
            v-model="captchaText"
            placeholder="请输入图形验证码"
            :maxlength="4"
          />
          <image class="captcha-img" :src="captchaImage" mode="aspectFit" @click="loadCaptcha"></image>
        </view>
      </view>
      <view class="input-item">
        <text class="tit">短信验证码</text>
        <view class="auth-code-row">
          <input
            type="number"
            v-model="formData.smsCode"
            placeholder="请输入短信验证码"
            :maxlength="6"
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
      <view class="input-item">
        <text class="tit">新密码</text>
        <view class="password-row">
          <input
            v-model="formData.password"
            placeholder="8-18位不含特殊字符的数字、字母组合"
            placeholder-class="input-empty"
            :maxlength="20"
            :password="!showPassword"
          />
          <view
            class="eye-icon"
            :class="showPassword ? 'eye-open' : 'eye-close'"
            @click="togglePassword"
          ></view>
        </view>
      </view>
    </view>
    <button class="confirm-btn" @click="handleReset" :disabled="resetting"> 重置密码 </button>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { forgetPasswordAPI } from '@/apis/member'
import type { ForgetPasswordParam } from '@/types/member'
import { useSmsCode } from '@/composables/useSmsCode'

// 重置密码表单数据
const formData = ref<ForgetPasswordParam>({
  phone: '',
  password: '',
  smsCode: '',
})
// 密码是否明文显示
const showPassword = ref(false)
// 切换密码可见性
const togglePassword = () => {
  showPassword.value = !showPassword.value
}
// 重置加载状态
const resetting = ref(false)
// 图形验证码 + 短信验证码获取逻辑
const { captchaImage, captchaText, smsCountdown, loadCaptcha, sendSmsCode } = useSmsCode()

// 页面加载时获取图形验证码
onLoad(() => {
  loadCaptcha()
})

// 获取短信验证码
const handleGetSmsCode = async () => {
  try {
    await sendSmsCode(formData.value.phone)
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

// 重置密码
const handleReset = async () => {
  const { phone, password, smsCode } = formData.value
  if (!phone) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }
  if (!password) {
    uni.showToast({ title: '请输入新密码', icon: 'none' })
    return
  }
  if (!smsCode) {
    uni.showToast({ title: '请输入短信验证码', icon: 'none' })
    return
  }

  resetting.value = true
  try {
    await forgetPasswordAPI(formData.value)
    uni.showToast({
      title: '密码重置成功',
      icon: 'success',
    })
    setTimeout(() => {
      uni.redirectTo({ url: '/pages/public/login' })
    }, 1500)
  } catch {
    uni.showToast({
      title: '重置失败，请重试',
      icon: 'none',
    })
  } finally {
    resetting.value = false
  }
}
</script>

<style lang="scss">
page {
  background: #fff;
}

.container {
  padding-top: 60px;
  position: relative;
  min-height: 100vh;
  background: #fff;
}

.left-top-sign {
  font-size: 120rpx;
  color: $page-color-base;
  position: relative;
  left: -16rpx;
}

.welcome {
  position: relative;
  left: 50rpx;
  top: -10rpx;
  font-size: 46rpx;
  color: #555;
  margin-bottom: 60rpx;
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
</style>
