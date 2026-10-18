<template>
  <view class="container">
    <view class="left-bottom-sign"></view>
    <view class="back-btn yticon icon-zuojiantou-up" @click="navBack"></view>
    <view class="right-top-sign"></view>

    <!-- 原页面：二维码关注 -->
    <view class="wrapper" v-if="pageMode === 'qrcode'">
      <view class="empty">
        <image src="/static/qrcode_for_macrozheng_258.jpg" mode="aspectFit"></image>
        <view class="empty-tips"> 扫描上方二维码<view class="navigator">关注公众号</view>, </view>
        <view class="empty-tips"> 回复<view class="navigator">会员</view>获取体验账号。 </view>
      </view>
    </view>

    <!-- 注册表单 -->
    <view class="wrapper" v-if="pageMode === 'register'">
      <view class="left-top-sign">REGISTER</view>
      <view class="welcome">注册账号！</view>
      <view class="input-content">
        <view class="input-item">
          <text class="tit">手机号</text>
          <input
            type="number"
            v-model="formData.phone"
            placeholder="请输入手机号"
            :maxlength="11"
          />
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
          <text class="tit">密码</text>
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
      <button class="confirm-btn" @click="handleRegister" :disabled="registering"> 注册 </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { registerAPI } from '@/apis/member'
import type { RegisterParam } from '@/types/member'
import { useSmsCode } from '@/composables/useSmsCode'

// ===== 页面数据 =====
// 页面模式：qrcode=二维码页面, register=注册表单
const pageMode = ref<'qrcode' | 'register'>('qrcode')
// 注册表单数据
const formData = ref<RegisterParam>({
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
// 注册加载状态
const registering = ref(false)
// 图形验证码 + 短信验证码获取逻辑
const { captchaImage, captchaText, smsCountdown, loadCaptcha, sendSmsCode } = useSmsCode()

// ===== 生命周期 =====
// 页面加载时根据参数设置模式
onLoad((options) => {
  if (options?.mode === 'register') {
    pageMode.value = 'register'
    loadCaptcha()
  } else {
    pageMode.value = 'qrcode'
  }
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

// 注册
const handleRegister = async () => {
  const { phone, password, smsCode } = formData.value
  if (!phone) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }
  if (!password) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }
  if (!smsCode) {
    uni.showToast({ title: '请输入短信验证码', icon: 'none' })
    return
  }

  registering.value = true
  try {
    await registerAPI(formData.value)
    uni.showToast({
      title: '注册成功',
      icon: 'success',
    })
    setTimeout(() => {
      uni.redirectTo({ url: '/pages/public/login' })
    }, 1500)
  } catch {
    uni.showToast({
      title: '注册失败，请重试',
      icon: 'none',
    })
  } finally {
    registering.value = false
  }
}

// 返回上一页
const navBack = () => {
  uni.navigateBack()
}
</script>

<style lang="scss">
page {
  background: #fff;
}
</style>

<style lang="scss" scoped>
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

.empty {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100vh;
  padding-bottom: 100rpx;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  background: #fff;

  image {
    width: 420rpx;
    height: 420rpx;
    margin-bottom: 30rpx;
  }

  .empty-tips {
    display: flex;
    font-size: 28rpx;
    color: $font-color-disabled;

    .navigator {
      color: $uni-color-primary;
      margin-left: 0rpx;
    }
  }
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
