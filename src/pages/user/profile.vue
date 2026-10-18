<template>
  <view class="content">
    <!-- 头像 -->
    <view class="avatar-section">
      <view class="avatar-wrap" @click="chooseAvatar">
        <image class="avatar" :src="formData.icon || '/static/missing-face.png'" mode="aspectFill"></image>
        <view v-if="avatarUploading" class="avatar-mask">
          <text>上传中</text>
        </view>
        <view v-else class="avatar-tip">
          <text>更换头像</text>
        </view>
      </view>
    </view>

    <!-- 昵称 -->
    <view class="row b-b">
      <text class="tit">昵称</text>
      <input
        class="input"
        type="text"
        v-model="formData.nickname"
        maxlength="30"
        placeholder="请输入昵称"
        placeholder-class="placeholder"
      />
    </view>

    <!-- 性别 -->
    <picker :range="genderOptions" :value="genderIndex" @change="handleGenderChange">
      <view class="row b-b">
        <text class="tit">性别</text>
        <view class="picker-value">
          <text>{{ genderOptions[genderIndex] }}</text>
        </view>
        <text class="yticon icon-you arrow"></text>
      </view>
    </picker>

    <!-- 生日 -->
    <picker mode="date" :value="formData.birthday" start="1900-01-01" :end="today" @change="handleBirthdayChange">
      <view class="row b-b">
        <text class="tit">生日</text>
        <view class="picker-value" :class="{ placeholder: !formData.birthday }">
          <text>{{ formData.birthday || '请选择生日' }}</text>
        </view>
        <text class="yticon icon-you arrow"></text>
      </view>
    </picker>

    <!-- 个性签名 -->
    <view class="row sign-row">
      <text class="tit">个性签名</text>
      <textarea
        class="sign-input"
        v-model="formData.signature"
        maxlength="100"
        auto-height
        placeholder="介绍一下自己吧"
        placeholder-class="placeholder"
      />
    </view>

    <button class="add-btn" :loading="saving" @click="handleSave">保存</button>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useMemberStore } from '@/stores/member'
import { updateMemberInfoAPI } from '@/apis/member'
import { uploadImageToOSS } from '@/utils/oss'

// ===== Store =====
const memberStore = useMemberStore()

// ===== 页面数据 =====
// 性别选项（index 与后端 gender 值一一对应：0保密/1男/2女）
const genderOptions = ['保密', '男', '女']
// 表单数据
const formData = ref({
  nickname: '',
  icon: '',
  gender: 0,
  birthday: '',
  signature: '',
})
// 性别选中索引
const genderIndex = computed(() => formData.value.gender)
// 头像是否上传中
const avatarUploading = ref(false)
// 是否保存中
const saving = ref(false)
// 生日选择上限（今天）
const now = new Date()
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

// ===== 生命周期 =====
// 页面显示时从 Store 回显当前资料
onShow(() => {
  const info = memberStore.memberInfo
  if (info) {
    formData.value = {
      nickname: info.nickname || '',
      icon: info.icon || '',
      gender: info.gender ?? 0,
      birthday: info.birthday || '',
      signature: info.personalizedSignature || '',
    }
  }
})

// ===== 事件处理方法 =====
// 性别选择
const handleGenderChange = (e: UniHelper.PickerOnChangeEvent) => {
  formData.value.gender = Number(e.detail.value)
}

// 生日选择
const handleBirthdayChange = (e: UniHelper.PickerOnChangeEvent) => {
  formData.value.birthday = e.detail.value
}

// 选择并上传头像（复用 OSS 直传）
const chooseAvatar = () => {
  if (avatarUploading.value) {
    return
  }
  uni.chooseImage({
    count: 1,
    success: async (res) => {
      avatarUploading.value = true
      try {
        const url = await uploadImageToOSS(res.tempFilePaths[0])
        formData.value.icon = url
      } catch (e) {
        console.error('头像上传失败', e)
        uni.showToast({ icon: 'none', title: '头像上传失败' })
      } finally {
        avatarUploading.value = false
      }
    },
  })
}

// 保存资料
const handleSave = async () => {
  const nickname = formData.value.nickname.trim()
  if (!nickname) {
    uni.showToast({ icon: 'none', title: '请输入昵称' })
    return
  }
  if (avatarUploading.value) {
    uni.showToast({ icon: 'none', title: '头像上传中，请稍候' })
    return
  }
  saving.value = true
  try {
    await updateMemberInfoAPI({
      nickname,
      icon: formData.value.icon || undefined,
      gender: formData.value.gender,
      birthday: formData.value.birthday || undefined,
      signature: formData.value.signature || undefined,
    })
    // 回写 Store，保证个人中心等页面立即展示新资料
    if (memberStore.memberInfo) {
      memberStore.setMemberInfo({
        ...memberStore.memberInfo,
        nickname,
        icon: formData.value.icon,
        gender: formData.value.gender,
        birthday: formData.value.birthday,
        personalizedSignature: formData.value.signature,
      })
    }
    uni.showToast({ title: '保存成功' })
    setTimeout(() => {
      uni.navigateBack()
    }, 800)
  } catch (e) {
    console.error('保存资料失败', e)
  } finally {
    saving.value = false
  }
}
</script>

<style lang="scss">
page {
  background: $page-color-base;
  padding-top: 16rpx;
}
</style>

<style lang="scss" scoped>
.avatar-section {
  display: flex;
  justify-content: center;
  padding: 40rpx 0;
  background: #fff;

  .avatar-wrap {
    position: relative;
    width: 160rpx;
    height: 160rpx;
  }

  .avatar {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    border: 4rpx solid #fff;
  }

  .avatar-tip,
  .avatar-mask {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 0 0 80rpx 80rpx;
    font-size: 22rpx;
    color: #fff;
  }

  .avatar-mask {
    background: rgba(0, 0, 0, 0.5);
    top: 0;
    bottom: auto;
    border-radius: 50%;
  }
}

.row {
  display: flex;
  align-items: center;
  position: relative;
  padding: 0 30rpx;
  min-height: 110rpx;
  background: #fff;

  .tit {
    flex-shrink: 0;
    width: 150rpx;
    font-size: 30rpx;
    color: $font-color-dark;
  }

  .input {
    flex: 1;
    font-size: 30rpx;
    color: $font-color-dark;
  }

  .picker-value {
    flex: 1;
    font-size: 30rpx;
    color: $font-color-dark;

    &.placeholder {
      color: $font-color-light;
    }
  }

  .arrow {
    font-size: 28rpx;
    color: $font-color-light;
  }
}

.sign-row {
  align-items: flex-start;
  padding-top: 28rpx;
  padding-bottom: 28rpx;

  .sign-input {
    flex: 1;
    width: auto;
    min-height: 60rpx;
    font-size: 30rpx;
    line-height: 1.5;
    color: $font-color-dark;
  }
}

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 690rpx;
  height: 80rpx;
  margin: 60rpx auto;
  font-size: $font-lg;
  color: #fff;
  background-color: $base-color;
  border-radius: 10rpx;
  box-shadow: 1px 2px 5px rgba(219, 63, 96, 0.4);
}
</style>
