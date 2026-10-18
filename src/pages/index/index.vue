<template>
  <view class="container">
    <!-- 小程序头部兼容 -->
    <!-- #ifdef MP -->
    <view class="mp-search-box">
      <text class="yticon icon-saomiao nav-icon" @click="handleScan"></text>
      <input class="ser-input" type="text" value="输入关键字搜索" disabled @click="handleSearch" />
      <view class="nav-icon-box">
        <text class="yticon icon-icon-- nav-icon" @click="handleNavToNotice"></text>
        <!-- 未读消息数字徽标（为 0 时不显示） -->
        <text v-if="messageStore.unreadCount > 0" class="nav-badge">
          {{ messageStore.unreadCount > 99 ? '99+' : messageStore.unreadCount }}
        </text>
      </view>
    </view>
    <!-- #endif -->

    <!-- 头部轮播 -->
    <view class="carousel-section">
      <!-- 标题栏和状态栏占位符 -->
      <view class="titleNview-placing"></view>
      <!-- 背景色区域 -->
      <view class="titleNview-background" :style="{ backgroundColor: titleNViewBackground }"></view>
      <swiper class="carousel" circular autoplay :interval="5000" :duration="500" @change="handleSwiperChange">
        <swiper-item
          v-for="(item, index) in advertiseList"
          :key="index"
          class="carousel-item"
          @click="handleNavToAdvertisePage(item)"
        >
          <image :src="item.pic" mode="aspectFill" />
        </swiper-item>
      </swiper>
      <!-- 自定义swiper指示器 -->
      <view class="swiper-dots">
        <text class="num">{{ swiperCurrent + 1 }}</text>
        <text class="sign">/</text>
        <text class="num">{{ swiperLength }}</text>
      </view>
    </view>

    <!-- 头部功能区 -->
    <view class="cate-section">
      <view class="cate-item" @click="handleNavToTopicPage">
        <image src="/static/temp/c3.png"></image>
        <text>专题</text>
      </view>
      <view class="cate-item" @click="handleNavToTopicPage">
        <image src="/static/temp/c5.png"></image>
        <text>话题</text>
      </view>
      <view class="cate-item" @click="handleNavToRecommendBrandPage">
        <image src="/static/temp/c6.png"></image>
        <text>优选</text>
      </view>
      <view class="cate-item" @click="handleNavToHotProductListPage">
        <image src="/static/temp/c7.png"></image>
        <text>特惠</text>
      </view>
    </view>

    <!-- 品牌制造商直供 -->
    <view class="f-header m-t" @click="handleNavToRecommendBrandPage">
      <image src="/static/icon_home_brand.png"></image>
      <view class="tit-box">
        <text class="tit">品牌制造商直供</text>
        <text class="tit2">工厂直达消费者，剔除品牌溢价</text>
      </view>
      <text class="yticon icon-you"></text>
    </view>
    <view class="guess-section">
      <view
        v-for="(item, index) in brandList"
        :key="index"
        class="guess-item"
        @click="handleNavToBrandDetailPage(item)"
      >
        <view class="image-wrapper-brand">
          <image :src="item.logo" mode="aspectFit"></image>
        </view>
        <text class="title clamp">{{ item.name }}</text>
        <text class="title2">商品数量：{{ item.productCount }}</text>
      </view>
    </view>

    <!-- 秒杀专区 -->
    <view class="flash-section m-t" v-if="homeFlashPromotion">
      <!-- 头部：标题 + 倒计时 + 下场时间 -->
      <view class="flash-header">
        <image class="flash-logo" src="/static/icon_flash_promotion.png"></image>
        <view class="flash-title-box">
          <text class="flash-title">秒杀专区</text>
        </view>
        <view class="flash-more" @click="handleNavToFlashPage">
          <text class="flash-more-text">查看全部</text>
          <text class="yticon icon-you"></text>
        </view>
        <view class="flash-countdown">
          <text class="flash-countdown-label">距本场结束</text>
          <view class="flash-countdown-timer">
            <text class="timer">{{ cutDownTime.endHour }}</text>
            <text class="colon">:</text>
            <text class="timer">{{ cutDownTime.endMinute }}</text>
            <text class="colon">:</text>
            <text class="timer">{{ cutDownTime.endSecond }}</text>
          </view>
        </view>
      </view>
      <!-- 秒杀商品：横向滑动卡片 -->
      <scroll-view class="flash-list" scroll-x>
        <view class="flash-scroll-wrapper">
          <view
            v-for="(item, index) in homeFlashPromotion.productList"
            :key="index"
            class="flash-item"
            @click="handleNavToDetailPage(item)"
          >
            <image class="flash-item-img" :src="item.pic" mode="aspectFill"></image>
            <text class="flash-item-name clamp">{{ item.name }}</text>
            <view class="flash-item-price">
              <text class="flash-price">￥{{ flashPrice(item) }}</text>
              <text class="flash-original-price" v-if="flashPrice(item) !== item.price">￥{{ item.price }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 新鲜好物 -->
    <view class="f-header m-t" @click="handleNavToNewProductListPage">
      <image src="/static/icon_new_product.png"></image>
      <view class="tit-box">
        <text class="tit">新鲜好物</text>
        <text class="tit2">为你寻觅世间好物</text>
      </view>
      <text class="yticon icon-you"></text>
    </view>
    <view class="seckill-section">
      <scroll-view class="floor-list" scroll-x>
        <view class="scoll-wrapper">
          <view
            v-for="(item, index) in newProductList"
            :key="index"
            class="floor-item"
            @click="handleNavToDetailPage(item)"
          >
            <image :src="item.pic" mode="aspectFill"></image>
            <text class="title clamp">{{ item.name }}</text>
            <text class="title2 clamp">{{ item.subTitle }}</text>
            <text class="price">￥{{ item.price }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 人气推荐楼层 -->
    <view class="f-header m-t" @click="handleNavToHotProductListPage">
      <image src="/static/icon_hot_product.png"></image>
      <view class="tit-box">
        <text class="tit">人气推荐</text>
        <text class="tit2">大家都赞不绝口的</text>
      </view>
      <text class="yticon icon-you"></text>
    </view>

    <view class="hot-section">
      <view
        v-for="(item, index) in hotProductList"
        :key="index"
        class="guess-item"
        @click="handleNavToDetailPage(item)"
      >
        <view class="image-wrapper">
          <image :src="item.pic" mode="aspectFill"></image>
        </view>
        <view class="txt">
          <text class="title clamp">{{ item.name }}</text>
          <text class="title2">{{ item.subTitle }}</text>
          <text class="price">￥{{ item.price }}</text>
        </view>
      </view>
    </view>

    <!-- 猜你喜欢 -->
    <view class="f-header m-t">
      <image src="/static/icon_recommend_product.png"></image>
      <view class="tit-box">
        <text class="tit">猜你喜欢</text>
        <text class="tit2">你喜欢的都在这里了</text>
      </view>
      <text class="yticon icon-you" v-show="false"></text>
    </view>

    <view class="guess-section">
      <view
        v-for="(item, index) in recommendProductList"
        :key="index"
        class="guess-item"
        @click="handleNavToDetailPage(item)"
      >
        <view class="image-wrapper">
          <image :src="item.pic" mode="aspectFill"></image>
        </view>
        <text class="title clamp">{{ item.name }}</text>
        <text class="title2 clamp">{{ item.subTitle }}</text>
        <text class="price">￥{{ item.price }}</text>
      </view>
    </view>
    <uni-load-more :status="loadingType"></uni-load-more>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  onLoad,
  onShow,
  onHide,
  onUnload,
  onPullDownRefresh,
  onReachBottom,
  onPageScroll,
  onNavigationBarButtonTap,
  onNavigationBarSearchInputClicked,
} from '@dcloudio/uni-app'
import { getHomeContentAPI, getRecommendProductListAPI } from '@/apis/home'
import { useMessageStore } from '@/stores/message'
import type { SmsHomeAdvertise, HomeFlashPromotion } from '@/types/home'
import type { PmsProduct } from '@/types/product'
import type { PmsBrand } from '@/types/brand'
import type { PageParam } from '@/types/common'

// ===== 页面数据 =====
// 消息store（导航栏消息图标未读徽标）
const messageStore = useMessageStore()
// 标题栏背景色
const titleNViewBackground = ref('')
// 标题栏背景色列表
const titleNViewBackgroundList = ['rgb(203, 87, 60)', 'rgb(205, 215, 218)']
// 轮播图当前索引
const swiperCurrent = ref(0)
// 轮播图长度
const swiperLength = ref(0)
// 加载状态
const loadingType = ref<'more' | 'loading' | 'noMore'>('more')
// 页面滚动状态
const isScrolled = ref(false)

// 轮播广告
const advertiseList = ref<SmsHomeAdvertise[]>([])
// 品牌制造商直供
const brandList = ref<PmsBrand[]>([])
// 秒杀专区
const homeFlashPromotion = ref<HomeFlashPromotion | null>(null)
// 新鲜好物
const newProductList = ref<PmsProduct[]>([])
// 人气推荐
const hotProductList = ref<PmsProduct[]>([])
// 猜你喜欢
const recommendProductList = ref<PmsProduct[]>([])
// 猜你喜欢分页参数
const recommendPageParam = ref<PageParam>({
  pageNum: 1,
  pageSize: 4,
})

// ===== 秒杀倒计时 =====
// 秒杀倒计时（每秒更新）
const cutDownTime = ref({ endHour: '00', endMinute: '00', endSecond: '00' })
// 倒计时定时器句柄
let countdownTimer: ReturnType<typeof setInterval> | null = null

// 更新秒杀倒计时
const updateCutDownTime = () => {
  const endTime = homeFlashPromotion.value?.endTime
  if (!endTime) {
    cutDownTime.value = { endHour: '00', endMinute: '00', endSecond: '00' }
    return
  }
  // 兼容两种格式：
  //  1) 完整日期时间（ISO，如 "2026-10-15T22:00:00"）→ new Date 可直接解析
  //  2) 当天时刻（后端 LocalTime，如 "22:00:00"，不带日期）→ 需拼上"今天"日期，
  //     否则 new Date("22:00:00") 为 Invalid Date → getTime()=NaN → 倒计时显示 Na:Na:Na
  let endTs = new Date(endTime).getTime()
  if (Number.isNaN(endTs)) {
    const [h, m, s] = endTime.split(':').map(Number)
    const now = new Date()
    endTs = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, s).getTime()
  }
  // 直接用时间戳差值计算，避免"当天"假设导致的跨天错误
  const offsetTime = endTs - Date.now()
  if (offsetTime <= 0) {
    // 本场已结束，归零
    cutDownTime.value = { endHour: '00', endMinute: '00', endSecond: '00' }
    return
  }
  const endHour = String(Math.floor(offsetTime / (60 * 60 * 1000))).padStart(2, '0')
  const endMinute = String(Math.floor((offsetTime % (60 * 60 * 1000)) / (60 * 1000))).padStart(2, '0')
  const endSecond = String(Math.floor((offsetTime % (60 * 1000)) / 1000)).padStart(2, '0')
  cutDownTime.value = { endHour, endMinute, endSecond }
}

// 启动秒杀倒计时（先立即更新一次，再每秒刷新）
const startCountdown = () => {
  updateCutDownTime()
  if (countdownTimer) clearInterval(countdownTimer)
  countdownTimer = setInterval(updateCutDownTime, 1000)
}

// 停止秒杀倒计时
const stopCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

// 秒杀价（有秒杀价用秒杀价，否则回退商品原价）
const flashPrice = (item: PmsProduct) => item.flashPromotionPrice || item.price

// ===== 数据加载 =====
// 加载首页数据
const loadData = async () => {
  try {
    const res = await getHomeContentAPI()
    const data = res.data
    advertiseList.value = data?.advertiseList || []
    brandList.value = data?.brandList || []
    homeFlashPromotion.value = data?.homeFlashPromotion || null
    newProductList.value = data?.newProductList || []
    hotProductList.value = data?.hotProductList || []
    swiperLength.value = advertiseList.value.length
    titleNViewBackground.value = titleNViewBackgroundList[0]
    // 有秒杀场次则启动倒计时
    if (homeFlashPromotion.value) {
      startCountdown()
    }
    // 加载推荐商品（后端返回分页对象，取 records）
    const recommendRes = await getRecommendProductListAPI(recommendPageParam.value)
    recommendProductList.value = recommendRes.data?.records || []
    uni.stopPullDownRefresh()
  } catch (err) {
    console.error('加载首页数据失败', err)
    uni.stopPullDownRefresh()
  }
}

// ===== 生命周期 =====
// 页面加载时执行
onLoad(() => {
  loadData()
})

// 页面显示时刷新未读消息数并开启轮询，同步导航栏消息按钮红点
onShow(async () => {
  await messageStore.startPolling()
  // #ifdef APP-PLUS
  const pages = getCurrentPages()
  const page = pages[pages.length - 1]
  // @ts-ignore
  const currentWebview = page.$getAppWebview()
  // 延迟到导航栏渲染完成后设置红点，避免首次进入页面时调用无效
  setTimeout(() => {
    if (messageStore.unreadCount > 0) {
      currentWebview.showTitleNViewButtonRedDot({
        index: 1,
        count: messageStore.unreadCount,
      })
    } else {
      currentWebview.hideTitleNViewButtonRedDot({ index: 1 })
    }
  }, 100)
  // #endif
  // #ifdef H5
  syncUnreadBadge()
  // #endif
})

// H5 端同步导航栏消息按钮未读徽标（无原生红点 API，操作 DOM：uni-h5 内置 .uni-page-head-btn-red-dot 类 + badge-text 属性渲染数字）
// #ifdef H5
const syncUnreadBadge = () => {
  setTimeout(() => {
    // 按钮渲染顺序与 pages.json buttons 配置一致：index 1 为消息按钮
    const msgBtn = document.querySelectorAll('.uni-page-head-btn')[1]
    if (!msgBtn) return
    if (messageStore.unreadCount > 0) {
      msgBtn.classList.add('uni-page-head-btn-red-dot')
      msgBtn.setAttribute('badge-text', messageStore.unreadCount > 99 ? '99+' : String(messageStore.unreadCount))
    } else {
      msgBtn.classList.remove('uni-page-head-btn-red-dot')
      msgBtn.removeAttribute('badge-text')
    }
  }, 100)
}
// #endif

// 离开首页时停止未读消息轮询，避免在其他页面继续发请求
onHide(() => {
  messageStore.stopPolling()
})

// 页面卸载时清理定时器（秒杀倒计时 + 消息轮询）
onUnload(() => {
  stopCountdown()
  messageStore.stopPolling()
})

// 下拉刷新时执行
onPullDownRefresh(() => {
  recommendPageParam.value.pageNum = 1
  loadData()
})

// 上拉加载更多时执行
onReachBottom(async () => {
  recommendPageParam.value.pageNum++
  loadingType.value = 'loading'
  try {
    const res = await getRecommendProductListAPI(recommendPageParam.value)
    // 后端返回分页对象，取 records
    const list = res.data?.records || []
    if (list.length === 0) {
      recommendPageParam.value.pageNum--
      loadingType.value = 'noMore'
    } else {
      recommendProductList.value = recommendProductList.value.concat(list)
      loadingType.value = 'more'
    }
  } catch (err) {
    loadingType.value = 'more'
  }
})

// 页面滚动监听 - 改变导航栏按钮颜色
// @ts-ignore
onPageScroll((e: { scrollTop: number }) => {
  isScrolled.value = e.scrollTop > 50
  // #ifdef APP-PLUS
  // 动态改变导航栏按钮颜色 (App端)
  const pages = getCurrentPages()
  const page = pages[pages.length - 1]
  // @ts-ignore
  const currentWebview = page.$getAppWebview()
  if (currentWebview) {
    // @ts-ignore
    currentWebview.setTitleNViewButtonStyle(0, {
      color: isScrolled.value ? '#303133' : '#ffffff',
    })
    // @ts-ignore
    currentWebview.setTitleNViewButtonStyle(1, {
      color: isScrolled.value ? '#303133' : '#ffffff',
    })
  }
  // #endif
  // #ifdef H5
  // 动态改变导航栏图标颜色 (H5端) - 直接操作 DOM，因 titleNView buttons 使用内联 style
  const btnIcons = document.querySelectorAll('.uni-page-head-btn .uni-btn-icon')
  btnIcons.forEach((el: any) => {
    el.style.color = isScrolled.value ? '#303133' : '#ffffff'
  })
  // 同步修改搜索框放大镜图标颜色
  const searchIconPath = document.querySelector('.uni-page-head-search-icon path')
  if (searchIconPath) {
    searchIconPath.setAttribute('fill', isScrolled.value ? '#606266' : '#fff')
  }
  // #endif
})

// ===== 事件处理方法 =====
// 轮播图切换
const handleSwiperChange = (e: any) => {
  const index = e.detail.current
  swiperCurrent.value = index
  const changeIndex = index % titleNViewBackgroundList.length
  titleNViewBackground.value = titleNViewBackgroundList[changeIndex]
}

// 跳转到商品详情页
const handleNavToDetailPage = (item: PmsProduct) => {
  const id = item.id
  uni.navigateTo({
    url: `/pages/product/product?id=${id}`,
  })
}

// 跳转到广告详情页
const handleNavToAdvertisePage = (item: SmsHomeAdvertise) => {
  const target = item.url?.trim()
  if (!target) {
    uni.showToast({ icon: 'none', title: '暂无跳转链接' })
    return
  }
  // 站内页面路径（如 /pages/brand/brandDetail?id=6）
  if (target.startsWith('/pages/')) {
    uni.navigateTo({ url: target })
    return
  }
  // 外部链接（如 www.xxx.com 或 http/https 开头的网页）
  let url = target
  if (!/^https?:\/\//i.test(url)) {
    url = 'http://' + url
  }
  // #ifdef H5
  window.open(url, '_blank')
  // #endif
  // #ifdef APP-PLUS
  // @ts-ignore app-plus 专用
  plus.runtime.openURL(url)
  // #endif
  // #ifdef MP
  uni.setClipboardData({
    data: url,
    success: () => {
      uni.showToast({
        icon: 'none',
        title: '链接已复制到剪贴板',
      })
    },
  })
  // #endif
}

// 跳转到品牌制造商直供页
const handleNavToRecommendBrandPage = () => {
  uni.navigateTo({
    url: '/pages/brand/list',
  })
}

// 跳转到品牌详情页
const handleNavToBrandDetailPage = (item: PmsBrand) => {
  uni.navigateTo({
    url: `/pages/brand/brandDetail?id=${item.id}`,
  })
}

// 跳转到新品列表页
const handleNavToNewProductListPage = () => {
  uni.navigateTo({
    url: '/pages/product/newProductList',
  })
}

// 跳转到人气推荐列表页
const handleNavToHotProductListPage = () => {
  uni.navigateTo({
    url: '/pages/product/hotProductList',
  })
}

// 跳转到秒杀专区页
const handleNavToFlashPage = () => {
  uni.navigateTo({
    url: '/pages/flash/list',
  })
}

// 跳转到专题页
const handleNavToTopicPage = () => {
  uni.showToast({
    icon: 'none',
    title: '功能开发中',
  })
}

// 跳转到搜索页
const handleSearch = () => {
  uni.navigateTo({
    url: '/pages/product/search',
  })
}

// 扫描功能（小程序端导航栏左侧按钮）
const handleScan = () => {
  uni.showToast({
    icon: 'none',
    title: '扫描功能开发中',
  })
}

// 跳转到通知页（小程序端导航栏右侧按钮）
const handleNavToNotice = () => {
  uni.navigateTo({
    url: '/pages/message/message',
  })
}

// 导航栏搜索框点击（H5/App端）
onNavigationBarSearchInputClicked(() => {
  handleSearch()
})

// ===== 其他方法 =====
// 导航栏按钮点击事件
onNavigationBarButtonTap((e: { index: number }) => {
  const index = e.index
  if (index === 0) {
    uni.showToast({
      icon: 'none',
      title: '扫描功能开发中',
    })
  } else if (index === 1) {
    // #ifdef APP-PLUS
    const pages = getCurrentPages()
    const page = pages[pages.length - 1]
    // @ts-ignore
    const currentWebview = page.$getAppWebview()
    currentWebview.hideTitleNViewButtonRedDot({
      index,
    })
    // #endif
    uni.navigateTo({
      url: '/pages/message/message',
    })
  }
})
</script>

<style lang="scss">
/* #ifdef MP */
page {
  .cate-section {
    position: relative;
    z-index: 5;
    border-radius: 16rpx 16rpx 0 0;
    margin-top: -20rpx;
  }

  .carousel-section {
    padding: 0;

    .titleNview-placing {
      padding-top: 0;
      height: 0;
    }

    .swiper-dots {
      left: 45rpx;
      bottom: 40rpx;
    }
  }
}
/* #endif */

page {
  background: #f5f5f5;
}
</style>

<style lang="scss" scoped>
/* #ifdef MP */
.mp-search-box {
  position: absolute;
  left: 0;
  top: 30rpx;
  z-index: 9999;
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0 20rpx;

  .nav-icon {
    font-size: 44rpx;
    color: #fff;
    padding: 0 10rpx;
  }

  .nav-icon-box {
    position: relative;
    display: flex;
    align-items: center;

    .nav-badge {
      position: absolute;
      top: -10rpx;
      right: -10rpx;
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
  }

  .ser-input {
    flex: 1;
    height: 56rpx;
    line-height: 56rpx;
    text-align: center;
    font-size: 28rpx;
    color: $font-color-base;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.6);
  }
}

/* #endif */

.m-t {
  margin-top: 16rpx;
}

/* 搜索头部 - 覆盖在轮播图上方 */
.search-header {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 9999;
  width: 100%;
  padding: 0 30rpx;
  padding-top: calc(var(--status-bar-height) + 16rpx);
  box-sizing: border-box;
  /* 粉色渐变背景 */
  background: linear-gradient(135deg, #fa436a 0%, #ff6b6b 100%);
}

.search-wrapper {
  width: 100%;
  display: flex;
  align-items: center;
  height: 64rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16rpx;
  padding: 0 24rpx;
}

.search-wrapper .yticon {
  font-size: 32rpx;
  color: #999;
}

.search-wrapper .icon-sousuo {
  margin-left: 8rpx;
}

.search-input {
  flex: 1;
  height: 64rpx;
  line-height: 64rpx;
  font-size: 26rpx;
  color: #333;
  background: transparent;
  margin: 0 16rpx;
}

/* 头部 轮播图 */
.carousel-section {
  position: relative;
  padding-top: 10px;

  .titleNview-placing {
    height: var(--status-bar-height);
    padding-top: 44px;
    box-sizing: content-box;
  }

  .titleNview-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 426rpx;
    transition: 0.4s;
  }
}

.carousel {
  width: 100%;
  height: 350rpx;
  padding: 0 28rpx;
  box-sizing: border-box;

  .carousel-item {
    width: 100%;
    height: 100%;
    padding: 0;
    overflow: hidden;
  }

  image {
    width: 100%;
    height: 100%;
    border-radius: 10rpx;
  }
}

.swiper-dots {
  display: flex;
  position: absolute;
  left: 60rpx;
  bottom: 15rpx;
  width: 72rpx;
  height: 36rpx;
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAABkCAYAAADDhn8LAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTMyIDc5LjE1OTI4NCwgMjAxNi8wNC8xOS0xMzoxMzo0MCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OTk4MzlBNjE0NjU1MTFFOUExNjRFQ0I3RTQ0NEExQjMiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OTk4MzlBNjA0NjU1MTFFOUExNjRFQ0I3RTQ0NEExQjMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6Q0E3RUNERkE0NjExMTFFOTg5NzI4MTM2Rjg0OUQwOEUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6Q0E3RUNERkI0NjExMTFFOTg5NzI4MTM2Rjg0OUQwOEUiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4Gh5BPAAACTUlEQVR42uzcQW7jQAwFUdN306l1uWwNww5kqdsmm6/2MwtVCp8CosQtP9vg/2+/gY+DRAMBgqnjIp2PaCxCLLldpPARRIiFj1yBbMV+cHZh9PURRLQNhY8kgWyL/WDtwujjI8hoE8rKLqb5CDJaRMJHokC6yKgSCR9JAukmokIknCQJpLOIrJFwMsBJELFcKHwM9BFkLBMKFxNcBCHlQ+FhoocgpVwwnv0Xn30QBJGMC0QcaBVJiAMiec/dcwKuL4j1QMsVCXFAJE4s4NQA3K/8Y6DzO4g40P7UcmIBJxbEesCKWBDg8wWxHrAiFgT4fEGsB/CwIhYE+AeBAAdPLOcV8HRmWRDAiQVcO7GcV8CLM8uCAE4sQCDAlHcQ7x+ABQEEAggEEAggEEAggEAAgQACASAQQCCAQACBAAIBBAIIBBAIIBBAIABe4e9iAe/xd7EAJxYgEGDeO4j3EODp/cOCAE4sYMyJ5cwCHs4rCwI4sYBxJ5YzC84rCwKcXxArAuthQYDzC2JF0H49LAhwYUGsCFqvx5EF2T07dMaJBetx4cRyaqFtHJ8EIhK0i8OJBQxcECuCVutxJhCRoE0cZwMRyRcFefa/ffZBVPogePihhyCnbBhcfMFFEFM+DD4m+ghSlgmDkwlOgpAl4+BkkJMgZdk4+EgaSCcpVX7bmY9kgXQQU+1TgE0c+QJZUUz1b2T4SBbIKmJW+3iMj2SBVBWz+leVfCQLpIqYbp8b85EskIxyfIOfK5Sf+wiCRJEsllQ+oqEkQfBxmD8BBgA5hVjXyrBNUQAAAABJRU5ErkJggg==);
  background-size: 100% 100%;

  .num {
    width: 36rpx;
    height: 36rpx;
    border-radius: 50px;
    font-size: 24rpx;
    color: #fff;
    text-align: center;
    line-height: 36rpx;
  }

  .sign {
    position: absolute;
    top: 0;
    left: 50%;
    line-height: 36rpx;
    font-size: 12rpx;
    color: #fff;
    transform: translateX(-50%);
  }
}

/* 分类 */
.cate-section {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  padding: 30rpx 22rpx;
  background: #fff;

  .cate-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: $font-sm + 2rpx;
    color: $font-color-dark;
  }

  /* 原图标颜色太深,不想改图了,所以加了透明度 */
  image {
    width: 88rpx;
    height: 88rpx;
    margin-bottom: 14rpx;
    border-radius: 50%;
    opacity: 0.7;
    box-shadow: 4rpx 4rpx 20rpx rgba(250, 67, 106, 0.3);
  }
}

.ad-1 {
  width: 100%;
  height: 210rpx;
  padding: 10rpx 0;
  background: #fff;

  image {
    width: 100%;
    height: 100%;
  }
}

/* 秒杀专区 */
.seckill-section {
  padding: 4rpx 30rpx 24rpx;
  background: #fff;

  .s-header {
    display: flex;
    align-items: center;
    height: 92rpx;
    line-height: 1;

    .s-img {
      width: 140rpx;
      height: 30rpx;
    }

    .tip {
      font-size: $font-base;
      color: $font-color-light;
      margin: 0 20rpx 0 40rpx;
    }

    .timer {
      display: inline-block;
      width: 40rpx;
      height: 36rpx;
      text-align: center;
      line-height: 36rpx;
      margin-right: 14rpx;
      font-size: $font-sm + 2rpx;
      color: #fff;
      border-radius: 2px;
      background: rgba(0, 0, 0, 0.8);
    }

    .icon-you {
      font-size: $font-lg;
      color: $font-color-light;
      flex: 1;
      text-align: right;
    }
  }

  .floor-list {
    white-space: nowrap;
  }

  .scoll-wrapper {
    display: flex;
    align-items: flex-start;
  }

  .floor-item {
    display: flex;
    flex-direction: column;
    width: 300rpx;
    margin-right: 20rpx;
    font-size: $font-sm + 2rpx;
    color: $font-color-dark;
    line-height: 1.8;

    image {
      width: 300rpx;
      height: 300rpx;
      border-radius: 6rpx;
    }

    .title {
      font-size: $font-lg;
      color: $font-color-dark;
      line-height: 80rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .title2 {
      font-size: $font-sm;
      color: $font-color-light;
      line-height: 40rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .price {
      color: $uni-color-primary;
    }
  }
}

.f-header {
  display: flex;
  align-items: center;
  height: 140rpx;
  padding: 6rpx 30rpx 8rpx;
  background: #fff;

  image {
    flex-shrink: 0;
    width: 80rpx;
    height: 80rpx;
    margin-right: 20rpx;
  }

  .tit-box {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .tit {
    font-size: $font-lg + 2rpx;
    color: $font-color-dark;
    line-height: 1.3;
  }

  .tit2 {
    font-size: $font-sm;
    color: $font-color-light;
  }

  .icon-you {
    font-size: $font-lg + 2rpx;
    color: $font-color-light;
  }

  .timer {
    display: inline-block;
    width: 40rpx;
    height: 36rpx;
    text-align: center;
    line-height: 36rpx;
    margin-right: 14rpx;
    font-size: $font-sm + 2rpx;
    color: #fff;
    border-radius: 2px;
    background: rgba(0, 0, 0, 0.8);
  }
}

/* 秒杀专区 */
.flash-section {
  padding-bottom: 24rpx;
  background: #fff;
}

.flash-header {
  display: flex;
  align-items: center;
  height: 140rpx;
  padding: 6rpx 30rpx 8rpx;

  .flash-logo {
    flex-shrink: 0;
    width: 80rpx;
    height: 80rpx;
    margin-right: 20rpx;
  }

  .flash-title-box {
    flex: 1;
    display: flex;
    flex-direction: column;

    .flash-title {
      font-size: $font-lg + 2rpx;
      color: $font-color-dark;
      line-height: 1.3;
    }
  }

  .flash-more {
    display: flex;
    align-items: center;
    margin-right: 16rpx;
    font-size: $font-sm;
    color: $font-color-light;

    .yticon {
      font-size: $font-lg;
    }
  }

  .flash-countdown {
    display: flex;
    flex-direction: column;
    align-items: flex-end;

    .flash-countdown-label {
      font-size: $font-sm;
      color: $font-color-light;
      margin-bottom: 6rpx;
    }

    .flash-countdown-timer {
      display: flex;
      align-items: center;
    }

    .timer {
      display: inline-block;
      width: 40rpx;
      height: 36rpx;
      text-align: center;
      line-height: 36rpx;
      margin-right: 0;
      font-size: $font-sm + 2rpx;
      color: #fff;
      border-radius: 2px;
      background: rgba(0, 0, 0, 0.8);
    }

    .colon {
      margin: 0 6rpx;
      font-size: $font-sm + 2rpx;
      color: $font-color-dark;
    }
  }
}

/* 秒杀商品横向滑动列表 */
.flash-list {
  white-space: nowrap;
  padding: 0 30rpx;
  box-sizing: border-box;
}

.flash-scroll-wrapper {
  display: flex;
  align-items: flex-start;
}

.flash-item {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 240rpx;
  margin-right: 20rpx;
  font-size: $font-sm + 2rpx;
  color: $font-color-dark;
  line-height: 1.8;

  .flash-item-img {
    width: 240rpx;
    height: 240rpx;
    border-radius: 6rpx;
  }

  .flash-item-name {
    font-size: $font-base;
    color: $font-color-dark;
    line-height: 60rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .flash-item-price {
    display: flex;
    align-items: baseline;

    .flash-price {
      font-size: $font-lg;
      font-weight: 600;
      color: $uni-color-primary;
    }

    .flash-original-price {
      margin-left: 10rpx;
      font-size: $font-sm;
      color: $font-color-light;
      text-decoration: line-through;
    }
  }
}

/* 猜你喜欢 */
.guess-section {
  display: flex;
  flex-wrap: wrap;
  padding: 0 30rpx;
  background: #fff;

  .guess-item {
    display: flex;
    flex-direction: column;
    width: 48%;
    padding-bottom: 40rpx;

    &:nth-child(2n + 1) {
      margin-right: 4%;
    }
  }

  .image-wrapper {
    width: 100%;
    height: 330rpx;
    border-radius: 3px;
    overflow: hidden;

    image {
      width: 100%;
      height: 100%;
      opacity: 1;
    }
  }

  .image-wrapper-brand {
    width: 100%;
    height: 150rpx;
    border-radius: 3px;
    overflow: hidden;

    image {
      width: 100%;
      height: 100%;
      opacity: 1;
    }
  }

  .title {
    font-size: $font-lg;
    color: $font-color-dark;
    line-height: 80rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .title2 {
    font-size: $font-sm;
    color: $font-color-light;
    line-height: 40rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .price {
    font-size: $font-lg;
    color: $uni-color-primary;
    line-height: 1;
  }
}

.hot-section {
  display: flex;
  flex-wrap: wrap;
  padding: 0 30rpx;
  background: #fff;

  .guess-item {
    display: flex;
    flex-direction: row;
    width: 100%;
    padding-bottom: 40rpx;
  }

  .image-wrapper {
    width: 30%;
    height: 250rpx;
    border-radius: 3px;
    overflow: hidden;

    image {
      width: 100%;
      height: 100%;
      opacity: 1;
    }
  }

  .title {
    font-size: $font-lg;
    color: $font-color-dark;
    line-height: 80uprpx;
  }

  .title2 {
    font-size: $font-sm;
    color: $font-color-light;
    line-height: 40rpx;
    height: 80rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
  }

  .price {
    font-size: $font-lg;
    color: $uni-color-primary;
    line-height: 80rpx;
  }

  .txt {
    width: 70%;
    display: flex;
    flex-direction: column;
    padding-left: 40rpx;
  }
}
</style>
