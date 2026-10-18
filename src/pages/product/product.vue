<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar" :style="{ background: navBgColor }">
      <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
      <view class="navbar-content">
        <view class="nav-back" @click="handleGoBack">
          <view class="back-arrow"></view>
        </view>
        <text class="nav-title" :style="{ opacity: navTitleOpacity }">详情展示</text>
      </view>
    </view>

    <!-- 占位区域，防止内容被导航栏遮挡 -->
    <!-- 轮播图本身需要顶到最上面，导航栏覆盖其上 -->
    <!-- 不需要占位，因为轮播图需要从顶部开始显示 -->

    <!-- 轮播图 -->
    <view class="carousel">
      <swiper
        v-if="imgList.length > 0"
        indicator-dots
        circular
        :autoplay="imgList.length > 1"
        :interval="3000"
        :duration="400"
      >
        <swiper-item class="swiper-item" v-for="(item, index) in imgList" :key="index">
          <view class="image-wrapper">
            <image :src="item" class="loaded" mode="aspectFill"></image>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 商品基本信息 -->
    <view class="introduce-section">
      <text class="title">{{ product.name }}</text
      ><br />
      <text class="title2">{{ product.subTitle }}</text>
      <view class="price-box">
        <text class="price-tip">¥</text>
        <text class="price">{{ displayPrice }}</text>
        <text class="m-price" v-if="originalPriceText">¥{{ originalPriceText }}</text>
      </view>
      <view class="bot-row">
        <text>销量: {{ product.sale }}</text>
        <text>库存: {{ product.stock }}</text>
        <text>浏览量: 768</text>
      </view>
    </view>

    <!-- 分享 -->
    <!--<view class="share-section" @click="handleShare">-->
    <!--  <view class="share-icon">-->
    <!--    <text class="yticon icon-xingxing"></text>-->
    <!--    返-->
    <!--  </view>-->
    <!--  <text class="tit">该商品分享可领49减10红包</text>-->
    <!--  <text class="yticon icon-bangzhu1"></text>-->
    <!--  <view class="share-btn">-->
    <!--    立即分享-->
    <!--    <text class="yticon icon-you"></text>-->
    <!--  </view>-->
    <!--</view>-->

    <!-- 商品规格、参数、优惠券等 -->
    <view class="c-list">
      <view class="c-row b-b" @click="handleToggleSpec">
        <text class="tit">购买类型</text>
        <view class="con">
          <text class="selected-text" v-for="(sItem, sIndex) in specSelected" :key="sIndex">
            {{ sItem.name }}
          </text>
        </view>
        <text class="yticon icon-you"></text>
      </view>
      <view class="c-row b-b" @click="handleToggleAttr">
        <text class="tit">商品参数</text>
        <view class="con">
          <text class="con t-r">查看</text>
        </view>
        <text class="yticon icon-you"></text>
      </view>
      <view class="c-row b-b" @click="handleToggleCoupon('show')">
        <text class="tit">优惠券</text>
        <text class="con t-r red">领取优惠券</text>
        <text class="yticon icon-you"></text>
      </view>
      <view class="c-row b-b">
        <text class="tit">促销活动</text>
        <view class="con-list">
          <text v-for="item in promotionTipList" :key="item">{{ item }}</text>
        </view>
      </view>
      <view class="c-row b-b">
        <text class="tit">服务</text>
        <view class="bz-list con">
          <text v-for="item in serviceList" :key="item">{{ item }} ·</text>
        </view>
      </view>
    </view>

    <!-- 评价 -->
    <view class="eva-section">
      <view class="e-header">
        <text class="tit">评价</text>
        <text>({{ commentTotal }})</text>
        <text class="tip">好评率 {{ commentGoodRate }}%</text>
        <text class="yticon icon-you"></text>
      </view>
      <view v-if="commentList.length === 0" class="no-comment">暂无评价</view>
      <view v-for="(item, index) in commentList" :key="index" class="eva-box">
        <image
          class="portrait"
          :src="item.memberIcon || '/static/missing-face.png'"
          mode="aspectFill"
        ></image>
        <view class="right">
          <view class="head">
            <text class="name">{{ item.memberNickName || '匿名用户' }}</text>
            <uni-rate :value="item.star" :disabled="true" :size="12" />
          </view>
          <text class="con">{{ item.content }}</text>
          <!-- 晒图 -->
          <view v-if="item.pics" class="pics">
            <image
              v-for="(pic, picIndex) in item.pics.split(',')"
              :key="picIndex"
              :src="pic"
              mode="aspectFill"
              @click="previewImage(pic)"
            ></image>
          </view>
          <!-- 回复列表 -->
          <view v-if="item.replayList && item.replayList.length > 0" class="replay-box">
            <view v-for="(reply, replyIndex) in item.replayList" :key="replyIndex" class="replay-item">
              <text class="replay-name">{{ reply.memberNickName || '匿名用户' }}：</text>
              <text class="replay-con">{{ reply.content }}</text>
            </view>
          </view>
          <view class="bot">
            <text v-if="formatCommentAttr(item.productAttribute)" class="attr"
              >规格：{{ formatCommentAttr(item.productAttribute) }}</text
            >
            <text class="time">{{ formatDateTime(item.createTime) }}</text>
          </view>
          <view class="action-row">
            <view class="action-item" @click="handleLikeComment(item)">
              <text class="yticon icon-dianzan-ash"></text>
              <text>{{ item.collectCouont || 0 }}</text>
            </view>
            <view class="action-item" @click="handleReplyComment(item)">
              <text class="yticon icon-pinglun-copy"></text>
              <text>{{ item.replayCount || 0 }}</text>
            </view>
          </view>
        </view>
      </view>
      <view v-if="commentList.length > 0 && !commentFinished" class="load-more" @click="loadComments()">
        加载更多
      </view>
      <view v-if="commentList.length > 0 && commentFinished" class="load-more">没有更多了</view>
    </view>

    <!-- 回复评论弹层 -->
    <view class="reply-popup" :class="{ show: replyPopupShow }" @touchmove.stop.prevent>
      <view class="mask" @click="closeReplyPopup"></view>
      <view class="reply-layer" @click.stop>
        <view class="reply-title">回复评论</view>
        <textarea
          v-model="replyContent"
          class="reply-textarea"
          placeholder="请输入回复内容"
          :maxlength="200"
        ></textarea>
        <button class="reply-btn" @click="submitReply">提交回复</button>
      </view>
    </view>

    <!-- 品牌信息 -->
    <view class="brand-info">
      <view class="d-header">
        <text>品牌信息</text>
      </view>
      <view class="brand-box" @click="handleNavToBrandDetail">
        <view class="image-wrapper">
          <image :src="brand.logo" class="loaded" mode="aspectFit"></image>
        </view>
        <view class="title">
          <text>{{ brand.name }}</text>
          <text>品牌首字母：{{ brand.firstLetter }}</text>
        </view>
      </view>
    </view>

    <!-- 图文详情 -->
    <view class="detail-desc">
      <view class="d-header">
        <text>图文详情</text>
      </view>
      <rich-text :nodes="desc"></rich-text>
    </view>

    <!-- 底部操作菜单 -->
    <view class="page-bottom">
      <navigator url="/pages/index/index" open-type="switchTab" class="p-b-btn">
        <text class="yticon icon-xiatubiao--copy"></text>
        <text>首页</text>
      </navigator>
      <navigator url="/pages/cart/cart" open-type="switchTab" class="p-b-btn">
        <text class="yticon icon-gouwuche"></text>
        <text>购物车</text>
      </navigator>
      <view class="p-b-btn" :class="{ active: favorite }" @click="handleToggleFavorite">
        <text class="yticon icon-shoucang"></text>
        <text>收藏</text>
      </view>

      <view class="action-btn-group" v-if="!isFlash">
        <button type="primary" class="action-btn no-border buy-now-btn" @click="handleBuy">
          立即购买
        </button>
        <button type="primary" class="action-btn no-border add-cart-btn" @click="handleAddToCart">
          加入购物车
        </button>
      </view>
      <!-- 秒杀商品：独立"立即抢购"，不加入购物车、不走普通下单 -->
      <button class="flash-buy-btn" v-else @click="handleBuy">
        立即抢购
      </button>
    </view>

    <!-- 回到顶部 -->
    <view class="back-to-top" :class="{ show: showBackToTop }" @click="handleScrollToTop">
      <text class="yticon icon-shang"></text>
    </view>

    <!-- 规格-模态层弹窗 -->
    <view class="popup spec" :class="specClass" @touchmove.stop.prevent @click="handleToggleSpec">
      <view class="mask"></view>
      <view class="layer attr-content" @click.stop>
        <view class="a-t">
          <image :src="product.pic"></image>
          <view class="right">
            <text class="price">¥{{ displayPrice }}</text>
            <text class="stock">库存：{{ product.stock }}件</text>
            <view class="selected">
              已选：
              <text class="selected-text" v-for="(sItem, sIndex) in specSelected" :key="sIndex">
                {{ sItem.name }}
              </text>
            </view>
          </view>
        </view>
        <view v-for="(item, index) in specList" :key="index" class="attr-list">
          <text>{{ item.name }}</text>
          <view class="item-list">
            <template v-for="(childItem, childIndex) in specChildList" :key="childIndex">
              <text
                v-if="childItem.pid === item.id"
                class="tit"
                :class="{ selected: childItem.selected }"
                @click="handleSelectSpec(childIndex, childItem.pid)"
              >
                {{ childItem.name }}
              </text>
            </template>
          </view>
        </view>
        <view class="buy-quantity">
          <text class="label">数量</text>
          <uni-number-box
            class="step"
            :min="1"
            :max="product.stock || 1"
            :value="buyQuantity"
            @eventChange="handleQuantityChange"
          ></uni-number-box>
        </view>
        <button class="btn" @click="handleSpecConfirm">完成</button>
      </view>
    </view>

    <!-- 属性-模态层弹窗 -->
    <view class="popup spec" :class="attrClass" @touchmove.stop.prevent @click="handleToggleAttr">
      <view class="mask"></view>
      <view class="layer attr-content no-padding" @click.stop>
        <view class="c-list">
          <view v-for="item in attrList" class="c-row b-b" :key="item.key">
            <text class="tit">{{ item.key }}</text>
            <view class="con">
              <text class="con t-r">{{ item.value }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 相关推荐（ES 推荐） -->
    <view class="recommend-section" v-if="recommendList.length > 0">
      <view class="section-title">相关推荐</view>
      <view class="recommend-list">
        <view
          class="recommend-item"
          v-for="item in recommendList"
          :key="item.id"
          @click="handleNavToDetail(item.id)"
        >
          <view class="image-wrapper">
            <image :src="item.pic" mode="aspectFill"></image>
          </view>
          <text class="title clamp">{{ item.name }}</text>
          <view class="price-box">
            <text class="price">¥{{ item.price }}</text>
            <text>已售 {{ item.sale }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 优惠券面板 -->
    <view
      class="mask"
      :class="couponState === 0 ? 'none' : couponState === 1 ? 'show' : ''"
      @click="handleToggleCoupon"
    >
      <view class="mask-content" @click.stop.prevent>
        <view
          class="coupon-item"
          v-for="(item, index) in couponList"
          :key="index"
          @click="handleAddCoupon(item)"
        >
          <view class="con">
            <view class="left">
              <text class="title">{{ item.name }}</text>
              <text class="time">有效期至{{ formatDateTime(item.endTime) }}</text>
            </view>
            <view class="right">
              <text class="price">{{ item.amount }}</text>
              <text>满{{ item.minPoint }}可用</text>
            </view>
            <view class="circle l"></view>
            <view class="circle r"></view>
          </view>
          <text class="tips">{{ formatCouponUseType(item.useType) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad, onPageScroll, onReachBottom } from '@dcloudio/uni-app'
import { getProductDetailAPI } from '@/apis/product'
import { getCommentListAPI, likeCommentAPI, replyCommentAPI } from '@/apis/comment'
import { addCartAPI } from '@/apis/cart'
import { esRecommendProductAPI } from '@/apis/esProduct'
import { getProductCouponListAPI, addMemberCouponAPI } from '@/apis/coupon'
import { createReadHistoryAPI } from '@/apis/memberReadHistory'
import {
  createProductCollectionAPI,
  deleteProductCollectionAPI,
  getProductCollectionDetailAPI,
} from '@/apis/memberProductCollection'
import { useMemberStore } from '@/stores/member'
import type {
  PmsProduct,
  PmsProductAttribute,
  PmsProductAttributeValue,
  PmsSkuStock,
  PmsProductFullReduction,
  PmsProductLadder,
  SpecOption,
  ServiceItem,
  ShareItem,
} from '@/types/product'
import type { EsProduct } from '@/types/esProduct'
import type { PmsBrand } from '@/types/brand'
import type { PmsCommentDetail } from '@/types/comment'
import type { SmsCoupon } from '@/types/coupon'
import { formatDate } from '@/utils/date'
import uniNumberBox from '@/components/uni-number-box.vue'

// ===== 导航栏相关 =====
const statusBarHeight = ref(0)
const scrollY = ref(0)

// 导航栏背景色：初始透明，滚动超过一定距离后渐变为白色
const navBgColor = computed(() => {
  const opacity = Math.min(scrollY.value / 200, 1)
  return `rgba(255, 255, 255, ${opacity})`
})

// 导航栏标题透明度：滚动超过一定距离后显示
const navTitleOpacity = computed(() => {
  return Math.min(scrollY.value / 200, 1)
})

// 是否显示回到顶部按钮：滚动超过一定距离后显示
const showBackToTop = computed(() => scrollY.value > 600)

// ===== 常量 =====

// 默认服务列表
const defaultServiceList: ServiceItem[] = [
  { id: 1, name: '无忧退货' },
  { id: 2, name: '快速退款' },
  { id: 3, name: '免费包邮' },
]

// 默认分享列表
const defaultShareList: ShareItem[] = [
  { type: 1, icon: '/static/temp/share_wechat.png', text: '微信好友' },
  { type: 2, icon: '/static/temp/share_moment.png', text: '朋友圈' },
  { type: 3, icon: '/static/temp/share_qq.png', text: 'QQ好友' },
  { type: 4, icon: '/static/temp/share_qqzone.png', text: 'QQ空间' },
]

// ===== 状态变量 =====

// 弹窗状态
const specClass = ref<'none' | 'show' | 'hide'>('none')
const attrClass = ref<'none' | 'show' | 'hide'>('none')
const couponState = ref(0)

// 规格弹窗本次打开的目的：'buy' 表示选完规格数量后立即购买，否则仅查看/选择
const specAction = ref<'buy' | ''>('')
// 立即购买数量
const buyQuantity = ref(1)

// 商品数据
const product = ref<PmsProduct>({} as PmsProduct)
const brand = ref<PmsBrand>({} as PmsBrand)
const imgList = ref<string[]>([])
const desc = ref('')

// ===== 秒杀上下文 =====
// 从专区进入时携带：活动ID、场次ID、秒杀价；null 表示普通商品
const flashPromotionId = ref<number | null>(null)
const sessionId = ref<number | null>(null)
const flashPurchasePrice = ref<number | null>(null)
// 是否为秒杀抢购商品（决定底部按钮展示与下单接口分流）
const isFlash = computed(() => flashPromotionId.value != null)
// 展示价格：秒杀时用秒杀价，否则用商品当前价
const displayPrice = computed(() =>
  isFlash.value ? flashPurchasePrice.value ?? product.value.price : product.value.price,
)
// 划线原价：秒杀时用商品原价，普通场景用 originalPrice
const originalPriceText = computed<string>(() => {
  if (isFlash.value) {
    return product.value.price > displayPrice.value ? String(product.value.price) : ''
  }
  return product.value.originalPrice && product.value.originalPrice > product.value.price
    ? String(product.value.originalPrice)
    : ''
})

// 规格相关
const specList = ref<PmsProductAttribute[]>([])
const specChildList = ref<SpecOption[]>([])
const specSelected = ref<SpecOption[]>([])
const skuStockList = ref<PmsSkuStock[]>([])

// 属性、促销、服务
const attrList = ref<{ key: string; value: string }[]>([])
const promotionTipList = ref<string[]>([])
const serviceList = ref<string[]>([])

// 优惠券
const couponList = ref<SmsCoupon[]>([])

// 相关推荐（ES）
const recommendList = ref<EsProduct[]>([])

// 评论相关
const commentList = ref<PmsCommentDetail[]>([])
const commentTotal = ref(0)
const commentPageNum = ref(1)
const commentPageSize = ref(5)
const commentFinished = ref(false)
const commentLoading = ref(false)

// 回复弹层
const replyPopupShow = ref(false)
const replyCommentId = ref<number | null>(null)
const replyContent = ref('')

// 格式化时间（保留到秒）
const formatDateTime = (time: string | null | undefined): string => {
  if (!time) return 'N/A'
  const date = new Date(time)
  if (isNaN(date.getTime())) return 'N/A'
  return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
}

// 格式化优惠券使用类型
const formatCouponUseType = (useType: number): string => {
  if (useType === 0) return '全场通用'
  if (useType === 1) return '指定分类商品可用'
  if (useType === 2) return '指定商品可用'
  return ''
}

// 收藏状态
const favorite = ref(false)

// 分享
const shareList = ref<ShareItem[]>([])

// 会员状态
const memberStore = useMemberStore()

// 加载相关推荐（ES 按当前商品推荐）
const loadRecommend = async (id: number) => {
  try {
    const res = await esRecommendProductAPI({ id, pageNum: 0, pageSize: 6 })
    recommendList.value = res.data?.list || []
  } catch (error) {
    console.error('加载相关推荐失败:', error)
    recommendList.value = []
  }
}

// 跳转商品详情
const handleNavToDetail = (id: number) => {
  uni.redirectTo({
    url: `/pages/product/product?id=${id}`,
  })
}

// ===== 数据加载 =====

// 加载商品详情数据
const loadData = async (id: number) => {
  if (!id) return

  try {
    const res = await getProductDetailAPI(id)
    if (res.data) {
      const data = res.data
      product.value = data.product
      skuStockList.value = data.skuStockList
      brand.value = data.brand

      // 初始化原价（如果不存在）
      if (!product.value.originalPrice) {
        product.value.originalPrice = product.value.price
      }

      initImgList()
      initServiceList()
      initSpecList(data)
      initAttrList(data)
      initPromotionTipList(data)
      initProductDesc()
      saveReadHistory()
      initProductCollection()
      loadComments()
      loadRecommend(id)
    }
  } catch (error) {
    console.error('加载商品详情失败:', error)
  }
}

// ===== onLoad =====

// 页面加载
onLoad((options) => {
  // 获取状态栏高度
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0

  const id = options?.id ? Number(options.id) : 0
  // 秒杀上下文（从秒杀专区进入时携带）
  flashPromotionId.value = options?.flashPromotionId ? Number(options.flashPromotionId) : null
  sessionId.value = options?.sessionId ? Number(options.sessionId) : null
  flashPurchasePrice.value = options?.flashPrice ? Number(options.flashPrice) : null
  shareList.value = defaultShareList
  loadData(id)
})

// 监听页面滚动
onPageScroll((e: { scrollTop: number }) => {
  scrollY.value = e.scrollTop
})

// 页面触底加载更多评论
onReachBottom(() => {
  loadComments()
})

// ===== 初始化方法 =====

// 初始化轮播图列表
const initImgList = () => {
  const tempPics = product.value.albumPics?.split(',') || []
  tempPics.unshift(product.value.pic)
  for (const item of tempPics) {
    if (item != null && item !== '') {
      imgList.value.push(item)
    }
  }
}

// 初始化服务列表
const initServiceList = () => {
  const serviceIds = product.value.serviceIds || ''
  for (const item of defaultServiceList) {
    if (serviceIds.indexOf(String(item.id)) !== -1) {
      serviceList.value.push(item.name)
    }
  }
}

// 初始化商品规格
const initSpecList = (data: any) => {
  const { productAttributeList, productAttributeValueList } = data

  for (const item of productAttributeList) {
    if (item.type === 0) {
      // 规格属性
      specList.value.push({
        id: item.id,
        name: item.name,
        type: item.type,
        handAddStatus: item.handAddStatus,
        inputList: item.inputList,
        productAttributeCategoryId: item.productAttributeCategoryId,
        searchType: item.searchType,
        selectType: item.selectType,
        relatedStatus: item.relatedStatus,
        sort: item.sort,
      })

      if (item.handAddStatus === 1) {
        // 支持手动新增
        const filterValueList = productAttributeValueList.filter(
          (v: PmsProductAttributeValue) => v.productAttributeId === item.id,
        )
        const inputList = filterValueList[0]?.value?.split(',') || []
        for (const val of inputList) {
          specChildList.value.push({ pid: item.id, pname: item.name, name: val })
        }
      } else if (item.handAddStatus === 0) {
        // 不支持手动新增
        const inputList = item.inputList?.split(',') || []
        for (const val of inputList) {
          specChildList.value.push({ pid: item.id, pname: item.name, name: val })
        }
      }
    }
  }

  // 根据SKU筛选可用规格
  const availAbleSpecSet = new Set<string>()
  for (const sku of skuStockList.value) {
    try {
      const spDataArr = JSON.parse(sku.spData)
      for (const sp of spDataArr) {
        availAbleSpecSet.add(sp.value)
      }
    } catch (e) {
      console.error('解析spData失败:', e, sku.spData)
    }
  }

  specChildList.value = specChildList.value.filter((item) => availAbleSpecSet.has(item.name))

  // 规格默认选中第一条
  specList.value.forEach((item) => {
    for (const cItem of specChildList.value) {
      if (cItem.pid === item.id) {
        cItem.selected = true
        specSelected.value.push(cItem)
        changeSpecInfo()
        break
      }
    }
  })
}

// 初始化商品参数
const initAttrList = (data: any) => {
  const { productAttributeList, productAttributeValueList } = data

  for (const item of productAttributeList) {
    if (item.type === 1) {
      // 参数属性
      const filterValueList = productAttributeValueList.filter(
        (v: PmsProductAttributeValue) => v.productAttributeId === item.id,
      )
      const value = filterValueList[0]?.value || ''
      attrList.value.push({ key: item.name, value })
    }
  }
}

// 初始化促销活动信息
const initPromotionTipList = (data: any) => {
  const promotionType = product.value.promotionType

  if (promotionType === 0) {
    promotionTipList.value.push('暂无优惠')
  } else if (promotionType === 1) {
    promotionTipList.value.push('单品优惠')
  } else if (promotionType === 2) {
    promotionTipList.value.push('会员优惠')
  } else if (promotionType === 3) {
    promotionTipList.value.push('多买优惠')
    for (const item of data.productLadderList || []) {
      promotionTipList.value.push(`满${item.count}件打${item.discount * 10}折`)
    }
  } else if (promotionType === 4) {
    promotionTipList.value.push('满减优惠')
    for (const item of data.productFullReductionList || []) {
      promotionTipList.value.push(`满${item.fullPrice}元减${item.reducePrice}元`)
    }
  } else if (promotionType === 5) {
    promotionTipList.value.push('限时优惠')
  }
}

// 初始化商品详情HTML
const initProductDesc = () => {
  let rawhtml = product.value.detailMobileHtml || ''

  // #ifdef H5
  const tempNode = document.createElement('div')
  tempNode.innerHTML = rawhtml
  const imgs = tempNode.getElementsByTagName('img')
  for (let i = 0; i < imgs.length; i++) {
    ;(imgs[i] as HTMLElement).style.width = '100%'
    ;(imgs[i] as HTMLElement).style.height = 'auto'
    ;(imgs[i] as HTMLElement).style.display = 'block'
  }
  desc.value = tempNode.innerHTML
  // #endif

  // #ifndef H5
  desc.value = rawhtml
  // #endif
}

// ===== 业务方法 =====

// 好评率（基于已加载评论，star>=4 视为好评）
const commentGoodRate = computed(() => {
  if (commentList.value.length === 0) return 100
  const goodCount = commentList.value.filter((c) => c.star >= 4).length
  return Math.round((goodCount / commentList.value.length) * 100)
})

// 加载评论列表（分页）
const loadComments = async () => {
  if (commentLoading.value || commentFinished.value) return
  commentLoading.value = true
  try {
    const res = await getCommentListAPI(
      product.value.id,
      commentPageNum.value,
      commentPageSize.value,
    )
    const list = res.data.list || []
    commentTotal.value = res.data.total || 0
    commentList.value = commentList.value.concat(list)
    if (list.length < commentPageSize.value) {
      commentFinished.value = true
    } else {
      commentPageNum.value++
    }
  } catch (e) {
    console.error('加载评论列表失败', e)
  } finally {
    commentLoading.value = false
  }
}

// 点赞评论
const handleLikeComment = async (comment: PmsCommentDetail) => {
  try {
    await likeCommentAPI(comment.id)
    comment.collectCouont = (comment.collectCouont || 0) + 1
  } catch (e) {
    console.error('点赞评论失败', e)
  }
}

// 打开回复弹层
const handleReplyComment = (comment: PmsCommentDetail) => {
  replyCommentId.value = comment.id
  replyContent.value = ''
  replyPopupShow.value = true
}

// 关闭回复弹层
const closeReplyPopup = () => {
  replyPopupShow.value = false
}

// 提交回复
const submitReply = async () => {
  const content = replyContent.value.trim()
  if (!content) {
    uni.showToast({ icon: 'none', title: '请输入回复内容' })
    return
  }
  if (replyCommentId.value == null) return
  try {
    await replyCommentAPI({ commentId: replyCommentId.value, content })
    uni.showToast({ icon: 'success', title: '回复成功' })
    replyPopupShow.value = false
    // 重新加载评论，刷新回复列表
    commentList.value = []
    commentPageNum.value = 1
    commentFinished.value = false
    loadComments()
  } catch (e) {
    console.error('回复评论失败', e)
  }
}

// 预览图片
const previewImage = (url: string) => {
  uni.previewImage({ urls: [url], current: url })
}

// 格式化评论规格（兼容JSON字符串与纯文本）
const formatCommentAttr = (attr?: string): string => {
  if (!attr) return ''
  try {
    const attrArr = JSON.parse(attr)
    if (Array.isArray(attrArr)) {
      return attrArr.map((a) => `${a.key}:${a.value}`).join(';')
    }
  } catch {
    // 非JSON格式则原样返回
  }
  return attr
}

// 保存浏览记录
const saveReadHistory = () => {
  if (memberStore.hasLogin) {
    createReadHistoryAPI({
      productId: product.value.id,
      productName: product.value.name,
      productPic: product.value.pic,
      productPrice: String(product.value.price),
      productSubTitle: product.value.subTitle,
    })
  }
}

// 初始化收藏状态
const initProductCollection = async () => {
  if (memberStore.hasLogin) {
    try {
      const res = await getProductCollectionDetailAPI({ productId: product.value.id })
      favorite.value = res.data != null
    } catch (error) {
      console.error('查询收藏状态失败:', error)
    }
  }
}

// 规格改变时更新商品信息
const changeSpecInfo = () => {
  const skuStock = getSkuStock()
  if (skuStock) {
    product.value.originalPrice = skuStock.price
    if (product.value.promotionType === 1) {
      // 单品优惠使用促销价，SKU没有促销价时使用商品本身的促销价
      product.value.price = skuStock.promotionPrice ?? skuStock.price
    } else {
      product.value.price = skuStock.price
    }
    product.value.stock = skuStock.stock
  }
  // 切换规格后，将已选数量限制在库存范围内
  if (buyQuantity.value > product.value.stock) {
    buyQuantity.value = product.value.stock
  }
}

// 获取当前选中的SKU
const getSkuStock = (): PmsSkuStock | null => {
  for (const sku of skuStockList.value) {
    const spDataArr = JSON.parse(sku.spData)
    const availAbleSpecSet = new Map<string, string>()
    for (const sp of spDataArr) {
      availAbleSpecSet.set(sp.key, sp.value)
    }

    let correctCount = 0
    for (const item of specSelected.value) {
      const value = availAbleSpecSet.get(item.pname)
      if (value != null && value === item.name) {
        correctCount++
      }
    }

    if (correctCount === specSelected.value.length) {
      return sku
    }
  }
  return null
}

// ===== 事件处理方法 =====

// 返回上一页
const handleGoBack = () => {
  uni.navigateBack({ delta: 1 })
}

// 回到顶部
const handleScrollToTop = () => {
  uni.pageScrollTo({
    duration: 300,
    scrollTop: 0,
  })
}

// 切换规格弹窗
const handleToggleSpec = () => {
  if (specClass.value === 'show') {
    specClass.value = 'hide'
    setTimeout(() => {
      specClass.value = 'none'
    }, 250)
  } else if (specClass.value === 'none') {
    specClass.value = 'show'
  }
}

// 切换属性弹窗
const handleToggleAttr = () => {
  if (attrClass.value === 'show') {
    attrClass.value = 'hide'
    setTimeout(() => {
      attrClass.value = 'none'
    }, 250)
  } else if (attrClass.value === 'none') {
    attrClass.value = 'show'
  }
}

// 切换优惠券弹窗
const handleToggleCoupon = async (type?: string) => {
  try {
    const res = await getProductCouponListAPI(String(product.value.id))
    couponList.value = res.data || []

    if (!couponList.value || couponList.value.length === 0) {
      uni.showToast({
        title: '暂无可领优惠券',
        icon: 'none',
      })
      return
    }

    const timer = type === 'show' ? 10 : 300
    const state = type === 'show' ? 1 : 0
    couponState.value = 2
    setTimeout(() => {
      couponState.value = state
    }, timer)
  } catch (error) {
    console.error('获取优惠券列表失败:', error)
  }
}

// 选择规格
const handleSelectSpec = (index: number, pid: number) => {
  const list = specChildList.value
  list.forEach((item) => {
    if (item.pid === pid) {
      item.selected = false
    }
  })

  list[index].selected = true

  // 存储已选择
  specSelected.value = []
  list.forEach((item) => {
    if (item.selected) {
      specSelected.value.push(item)
    }
  })

  changeSpecInfo()
}

// 领取优惠券
const handleAddCoupon = async (coupon: SmsCoupon) => {
  handleToggleCoupon()
  try {
    await addMemberCouponAPI(String(coupon.id))
    uni.showToast({
      title: '领取优惠券成功！',
      duration: 2000,
    })
  } catch (error) {
    console.error('领取优惠券失败:', error)
  }
}

// 分享
const handleShare = () => {
  uni.showToast({
    title: '分享功能待实现',
    icon: 'none',
  })
}

// 收藏/取消收藏
const handleToggleFavorite = async () => {
  if (!memberStore.hasLogin) {
    handleCheckLogin()
    return
  }

  try {
    if (favorite.value) {
      // 取消收藏
      await deleteProductCollectionAPI({ productId: product.value.id })
      uni.showToast({
        title: '取消收藏成功！',
        icon: 'none',
      })
    } else {
      // 收藏
      await createProductCollectionAPI({
        productId: product.value.id,
        productName: product.value.name,
        productPic: product.value.pic,
        productPrice: String(product.value.price),
        productSubTitle: product.value.subTitle,
      })
      uni.showToast({
        title: '收藏成功！',
        icon: 'none',
      })
    }
    favorite.value = !favorite.value
  } catch (error) {
    console.error('收藏操作失败:', error)
  }
}

// 立即购买
const handleBuy = () => {
  if (!memberStore.hasLogin) {
    handleCheckLogin()
    return
  }
  // 打开规格弹窗，让用户确认规格与数量
  specAction.value = 'buy'
  specClass.value = 'show'
}

// 规格弹窗确认
const handleSpecConfirm = () => {
  if (specAction.value === 'buy') {
    handleBuyNow()
  } else {
    handleToggleSpec()
  }
}

// 规格弹窗数量变化
const handleQuantityChange = (e: { number: number }) => {
  buyQuantity.value = e.number
}

// 立即购买：校验规格与数量后跳转确认订单页
const handleBuyNow = () => {
  const skuStock = getSkuStock()
  if (!skuStock) {
    uni.showToast({
      title: '请选择规格',
      icon: 'none',
    })
    return
  }
  if (buyQuantity.value < 1 || buyQuantity.value > product.value.stock) {
    uni.showToast({
      title: '数量超出库存范围',
      icon: 'none',
    })
    return
  }
  // 秒杀商品走秒杀下单确认流程（携带活动/场次/秒杀价）
  const url = isFlash.value
    ? `/pages/order/createOrder?skuId=${skuStock.id}&quantity=${buyQuantity.value}&flashPromotionId=${flashPromotionId.value}&sessionId=${sessionId.value}&flashPrice=${flashPurchasePrice.value ?? product.value.price}`
    : `/pages/order/createOrder?skuId=${skuStock.id}&quantity=${buyQuantity.value}`
  uni.navigateTo({
    url,
  })
  // 关闭规格弹窗并重置状态
  handleToggleSpec()
  specAction.value = ''
  buyQuantity.value = 1
}

// 加入购物车
const handleAddToCart = async () => {
  if (!memberStore.hasLogin) {
    handleCheckLogin()
    return
  }

  const skuStock = getSkuStock()
  if (!skuStock) {
    uni.showToast({
      title: '请选择规格',
      icon: 'none',
    })
    return
  }

  try {
    const res = await addCartAPI({
      price: product.value.price,
      productAttr: skuStock.spData,
      productBrand: product.value.brandName,
      productCategoryId: product.value.productCategoryId,
      productId: product.value.id,
      productName: product.value.name,
      productPic: product.value.pic,
      productSkuCode: skuStock.skuCode,
      productSkuId: skuStock.id,
      productSn: product.value.productSn,
      productSubTitle: product.value.subTitle,
      quantity: 1,
    })
    uni.showToast({
      title: res.message,
      duration: 1500,
    })
  } catch (error) {
    console.error('加入购物车失败:', error)
  }
}

// 跳转到品牌详情页
const handleNavToBrandDetail = () => {
  const id = brand.value.id
  uni.navigateTo({
    url: `/pages/brand/brandDetail?id=${id}`,
  })
}

// 检查登录状态
const handleCheckLogin = () => {
  uni.showModal({
    title: '提示',
    content: '你还没登录，是否要登录？',
    confirmText: '去登录',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) {
        uni.navigateTo({
          url: '/pages/public/login',
        })
      }
    },
  })
}
</script>

<style lang="scss">
page {
  background: $page-color-base;
  padding-bottom: calc(160rpx + env(safe-area-inset-bottom));
}
</style>

<style lang="scss" scoped>
/* 自定义导航栏 */
.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 999;

  .navbar-content {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 44px;
    position: relative;
  }

  .nav-back {
    position: absolute;
    left: 20rpx;
    width: 64rpx;
    height: 64rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
    z-index: 10;

    .back-arrow {
      width: 20rpx;
      height: 20rpx;
      border-left: 4rpx solid #333;
      border-bottom: 4rpx solid #333;
      transform: rotate(45deg);
      margin-left: 6rpx;
    }
  }

  .nav-title {
    font-size: 34rpx;
    font-weight: bold;
    color: #333;
  }
}

.icon-you {
  font-size: $font-base + 2rpx;
  color: #888;
}

/* 轮播图 */
.carousel {
  height: 722rpx;
  position: relative;

  swiper {
    height: 100%;
  }

  .image-wrapper {
    width: 100%;
    height: 100%;
  }

  .swiper-item {
    display: flex;
    justify-content: center;
    align-content: center;
    height: 750rpx;
    overflow: hidden;

    image {
      width: 100%;
      height: 100%;
    }
  }
}

/* 标题简介 */
.introduce-section {
  background: #fff;
  padding: 20rpx 30rpx;

  .title {
    font-size: 32rpx;
    color: $font-color-dark;
    height: 50rpx;
    line-height: 50rpx;
  }

  .title2 {
    font-size: 28rpx;
    color: $font-color-light;
    height: 46rpx;
    line-height: 46rpx;
  }

  .price-box {
    display: flex;
    align-items: baseline;
    height: 64rpx;
    padding: 10rpx 0;
    font-size: 26rpx;
    color: $uni-color-primary;
  }

  .price {
    font-size: $font-lg + 2rpx;
  }

  .m-price {
    margin: 0 12rpx;
    color: $font-color-light;
    text-decoration: line-through;
  }

  .bot-row {
    display: flex;
    align-items: center;
    height: 50rpx;
    font-size: $font-sm;
    color: $font-color-light;

    text {
      flex: 1;
    }
  }
}

/* 分享 */
.share-section {
  display: flex;
  align-items: center;
  color: $font-color-base;
  background: linear-gradient(to right, #fdf5f6, #fbebf6);
  padding: 12rpx 30rpx;

  .share-icon {
    display: flex;
    align-items: center;
    width: 70rpx;
    height: 30rpx;
    line-height: 1;
    border: 1rpx solid $uni-color-primary;
    border-radius: 4rpx;
    position: relative;
    overflow: hidden;
    font-size: 22rpx;
    color: $uni-color-primary;

    &:after {
      content: '';
      width: 50rpx;
      height: 50rpx;
      border-radius: 50%;
      left: -20rpx;
      top: -12rpx;
      position: absolute;
      background: $uni-color-primary;
    }
  }

  .icon-xingxing {
    position: relative;
    z-index: 1;
    font-size: 24rpx;
    margin-left: 2rpx;
    margin-right: 10rpx;
    color: #fff;
    line-height: 1;
  }

  .tit {
    font-size: $font-base;
    margin-left: 10rpx;
  }

  .icon-bangzhu1 {
    padding: 10rpx;
    font-size: 30rpx;
    line-height: 1;
  }

  .share-btn {
    flex: 1;
    text-align: right;
    font-size: $font-sm;
    color: $uni-color-primary;
  }

  .icon-you {
    font-size: $font-sm;
    margin-left: 4rpx;
    color: $uni-color-primary;
  }
}

/* 商品规格列表 */
.c-list {
  font-size: $font-sm + 2rpx;
  color: $font-color-base;
  background: #fff;

  .c-row {
    display: flex;
    align-items: center;
    padding: 20rpx 30rpx;
    position: relative;
  }

  .tit {
    width: 140rpx;
  }

  .con {
    flex: 1;
    color: $font-color-dark;

    .selected-text {
      margin-right: 10rpx;
    }
  }

  .bz-list {
    height: 40rpx;
    font-size: $font-sm + 2rpx;
    color: $font-color-dark;

    text {
      display: inline-block;
      margin-right: 30rpx;
    }
  }

  .con-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    color: $font-color-dark;
    line-height: 40rpx;
  }

  .red {
    color: $uni-color-primary;
  }
}

/* 评价 */
.eva-section {
  display: flex;
  flex-direction: column;
  padding: 20rpx 30rpx;
  background: #fff;
  margin-top: 16rpx;

  .e-header {
    display: flex;
    align-items: center;
    height: 70rpx;
    font-size: $font-sm + 2rpx;
    color: $font-color-light;

    .tit {
      font-size: $font-base + 2rpx;
      color: $font-color-dark;
      margin-right: 4rpx;
    }

    .tip {
      flex: 1;
      text-align: right;
    }

    .icon-you {
      margin-left: 10rpx;
    }
  }

  .no-comment {
    padding: 40rpx 0;
    text-align: center;
    font-size: $font-sm + 2rpx;
    color: $font-color-light;
  }

  .load-more {
    padding: 20rpx 0;
    text-align: center;
    font-size: $font-sm + 2rpx;
    color: $font-color-light;
  }
}

.eva-box {
  display: flex;
  padding: 20rpx 0;

  .portrait {
    flex-shrink: 0;
    width: 80rpx;
    height: 80rpx;
    border-radius: 100px;
  }

  .right {
    flex: 1;
    display: flex;
    flex-direction: column;
    font-size: $font-base;
    color: $font-color-base;
    padding-left: 26rpx;

    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .name {
        font-size: $font-base + 2rpx;
        color: $font-color-dark;
      }

      :deep(.uni-rate) {
        margin-left: 16rpx;
      }
    }

    .con {
      font-size: $font-base;
      color: $font-color-dark;
      padding: 20rpx 0;
    }

    /* 晒图 */
    .pics {
      display: flex;
      flex-wrap: wrap;

      image {
        width: 150rpx;
        height: 150rpx;
        margin: 0 12rpx 12rpx 0;
        border-radius: 6rpx;
      }
    }

    /* 回复列表 */
    .replay-box {
      background: #f6f6f6;
      border-radius: 8rpx;
      padding: 16rpx 20rpx;
      margin-bottom: 16rpx;

      .replay-item {
        line-height: 1.6;
        font-size: $font-sm + 2rpx;
        color: $font-color-base;

        .replay-name {
          color: $base-color;
        }
      }
    }

    /* 点赞/回复操作 */
    .action-row {
      display: flex;
      align-items: center;
      margin-top: 16rpx;

      .action-item {
        display: flex;
        align-items: center;
        margin-right: 40rpx;
        font-size: $font-sm + 2rpx;
        color: $font-color-light;

        .yticon {
          font-size: $font-base;
          margin-right: 6rpx;
        }
      }
    }

    .bot {
      display: flex;
      justify-content: space-between;
      font-size: $font-sm;
      color: $font-color-light;
    }
  }
}

/* 回复评论弹层 */
.reply-popup {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  display: none;

  &.show {
    display: block;
  }

  .mask {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
  }

  .reply-layer {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background: #fff;
    padding: 30rpx;
    border-radius: 16rpx 16rpx 0 0;

    .reply-title {
      font-size: $font-base + 4rpx;
      color: $font-color-dark;
      text-align: center;
      margin-bottom: 20rpx;
    }

    .reply-textarea {
      width: 100%;
      height: 160rpx;
      padding: 16rpx;
      box-sizing: border-box;
      font-size: $font-base;
      background: #f6f6f6;
      border-radius: 8rpx;
    }

    .reply-btn {
      margin-top: 24rpx;
      background: $base-color;
      color: #fff;
      border-radius: 40rpx;
      font-size: $font-base;

      &::after {
        border: none;
      }
    }
  }
}

/* 品牌信息 */
.brand-info {
  margin-top: 16rpx;
  background-color: #fff;
  display: flex;
  flex-direction: column;

  .brand-box {
    display: flex;
    align-items: center;
    padding: 30rpx 50rpx;

    .image-wrapper {
      width: 210rpx;
      height: 70rpx;

      image {
        width: 100%;
        height: 100%;
      }
    }

    .title {
      flex: 1;
      display: flex;
      flex-direction: column;
      font-size: $font-lg + 4rpx;
      margin-left: 30rpx;
      color: $font-color-dark;

      text:last-child {
        font-size: $font-sm;
        color: $font-color-light;
        margin-top: 8rpx;
      }
    }
  }

  .d-header {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80rpx;
    font-size: $font-base + 2rpx;
    color: $font-color-dark;
    position: relative;

    text {
      padding: 0 20rpx;
      background: #fff;
      position: relative;
      z-index: 1;
    }

    &:after {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translateX(-50%);
      width: 300rpx;
      height: 0;
      content: '';
      border-bottom: 1px solid #ccc;
    }
  }
}

/* 图文详情 */
.detail-desc {
  background: #fff;
  margin-top: 16rpx;

  .d-header {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80rpx;
    font-size: $font-base + 2rpx;
    color: $font-color-dark;
    position: relative;

    text {
      padding: 0 20rpx;
      background: #fff;
      position: relative;
      z-index: 1;
    }

    &:after {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translateX(-50%);
      width: 300rpx;
      height: 0;
      content: '';
      border-bottom: 1px solid #ccc;
    }
  }
}

.detail-desc:deep(img) {
  width: 100%;
  height: auto;
}

/* 弹出层 */
.popup {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 99;

  &.show {
    display: block;

    .mask {
      animation: showPopup 0.2s linear both;
    }

    .layer {
      animation: showLayer 0.2s linear both;
    }
  }

  &.hide {
    .mask {
      animation: hidePopup 0.2s linear both;
    }

    .layer {
      animation: hideLayer 0.2s linear both;
    }
  }

  &.none {
    display: none;
  }

  .mask {
    position: fixed;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    background-color: rgba(0, 0, 0, 0.4);
  }

  .layer {
    position: fixed;
    z-index: 99;
    bottom: 0;
    width: 100%;
    min-height: 40vh;
    border-radius: 10rpx 10rpx 0 0;
    background-color: #fff;

    .btn {
      height: 66rpx;
      line-height: 66rpx;
      border-radius: 100rpx;
      background: $uni-color-primary;
      font-size: $font-base + 2rpx;
      color: #fff;
      margin: 30rpx auto 20rpx;
    }
  }

  .no-padding {
    padding: 0rpx 0rpx;
  }
}

/* 规格选择弹窗内容 - 与源项目一致，放在顶层 */
.attr-content {
  padding: 10rpx 30rpx;

  .a-t {
    display: flex;

    image {
      width: 170rpx;
      height: 170rpx;
      flex-shrink: 0;
      margin-top: -40rpx;
      border-radius: 8rpx;
    }

    .right {
      display: flex;
      flex-direction: column;
      padding-left: 24rpx;
      font-size: $font-sm + 2rpx;
      color: $font-color-base;
      line-height: 42rpx;

      .price {
        font-size: $font-lg;
        color: $uni-color-primary;
        margin-bottom: 10rpx;
      }

      .selected-text {
        margin-right: 10rpx;
      }
    }
  }

  .attr-list {
    display: flex;
    flex-direction: column;
    font-size: $font-base + 2rpx;
    color: $font-color-base;
    padding-top: 30rpx;
    padding-left: 10rpx;
  }

  .item-list {
    padding: 20rpx 0 0;
    display: flex;
    flex-wrap: wrap;
  }

  /* 数量选择 */
  .buy-quantity {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 30rpx;

    .label {
      font-size: $font-base + 2rpx;
      color: $font-color-base;
    }

    /* 覆盖 uni-number-box 的绝对定位，使其在弹窗内流式布局 */
    :deep(.uni-numbox) {
      position: relative;
      left: auto;
      bottom: auto;
    }
  }
}

@keyframes showPopup {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

@keyframes hidePopup {
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}

@keyframes showLayer {
  0% {
    transform: translateY(120%);
  }

  100% {
    transform: translateY(0%);
  }
}

@keyframes hideLayer {
  0% {
    transform: translateY(0);
  }

  100% {
    transform: translateY(120%);
  }
}

/* 底部操作菜单 */
.page-bottom {
  position: fixed;
  left: 30rpx;
  bottom: calc(30rpx + env(safe-area-inset-bottom));
  z-index: 95;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 690rpx;
  height: 100rpx;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 20rpx 0 rgba(0, 0, 0, 0.5);
  border-radius: 16rpx;

  .p-b-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: $font-sm;
    color: $font-color-base;
    width: 96rpx;
    height: 80rpx;

    // navigator 组件渲染为 <a class="navigator-wrap">，需同步 flex 布局
    :deep(.navigator-wrap) {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }

    .yticon {
      font-size: 40rpx;
      line-height: 48rpx;
      color: $font-color-light;
    }

    &.active,
    &.active .yticon {
      color: $uni-color-primary;
    }

    .icon-fenxiang2 {
      font-size: 42rpx;
      transform: translateY(-2rpx);
    }

    .icon-shoucang {
      font-size: 46rpx;
    }
  }

  .action-btn-group {
    display: flex;
    height: 76rpx;
    border-radius: 100px;
    overflow: hidden;
    box-shadow: 0 20rpx 40rpx -16rpx #fa436a;
    box-shadow: 1px 2px 5px rgba(219, 63, 96, 0.4);
    background: linear-gradient(to right, #ffac30, #fa436a, #f56c6c);
    margin-left: 20rpx;
    position: relative;

    &:after {
      content: '';
      position: absolute;
      top: 50%;
      right: 50%;
      transform: translateY(-50%);
      height: 28rpx;
      width: 0;
      border-right: 1px solid rgba(255, 255, 255, 0.5);
    }

    .action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 180rpx;
      height: 100%;
      font-size: $font-base;
      padding: 0;
      border-radius: 0;
      background: transparent;
    }
  }

  /* 秒杀抢购按钮 */
  .flash-buy-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    height: 100rpx;
    margin-left: 20rpx;
    font-size: 34rpx;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(90deg, #ff6b3d, #fa436a);
    border-radius: 999rpx;

    &::after {
      border: none;
    }
  }
}

/* 回到顶部 */
.back-to-top {
  position: fixed;
  right: 30rpx;
  bottom: calc(170rpx + env(safe-area-inset-bottom));
  z-index: 96;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
  opacity: 0;
  visibility: hidden;
  transform: translateY(20rpx);
  transition: all 0.3s ease;

  .yticon {
    font-size: 36rpx;
    color: $font-color-base;
  }

  &.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
}

/* 优惠券面板 */
.mask {
  display: flex;
  align-items: flex-end;
  position: fixed;
  left: 0;
  top: var(--window-top);
  bottom: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0);
  z-index: 9995;
  transition: 0.3s;

  .mask-content {
    width: 100%;
    min-height: 30vh;
    max-height: 70vh;
    background: #f3f3f3;
    transform: translateY(100%);
    transition: 0.3s;
    overflow-y: scroll;
  }

  &.none {
    display: none;
  }

  &.show {
    background: rgba(0, 0, 0, 0.4);

    .mask-content {
      transform: translateY(0);
    }
  }
}

/* 优惠券列表 */
.coupon-item {
  display: flex;
  flex-direction: column;
  margin: 20rpx 24rpx;
  background: #fff;

  .con {
    display: flex;
    align-items: center;
    position: relative;
    height: 120rpx;
    padding: 0 30rpx;

    &:after {
      position: absolute;
      left: 0;
      bottom: 0;
      content: '';
      width: 100%;
      height: 0;
      border-bottom: 1px dashed #f3f3f3;
      transform: scaleY(50%);
    }
  }

  .left {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex: 1;
    overflow: hidden;
    height: 100rpx;
  }

  .title {
    font-size: 32rpx;
    color: $font-color-dark;
    margin-bottom: 10rpx;
  }

  .time {
    font-size: 24rpx;
    color: $font-color-light;
  }

  .right {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 26rpx;
    color: $font-color-base;
    height: 100rpx;
  }

  .price {
    font-size: 44rpx;
    color: $base-color;

    &:before {
      content: '￥';
      font-size: 34rpx;
    }
  }

  .tips {
    font-size: 24rpx;
    color: $font-color-light;
    line-height: 60rpx;
    padding-left: 30rpx;
  }

  .circle {
    position: absolute;
    left: -6rpx;
    bottom: -10rpx;
    z-index: 10;
    width: 20rpx;
    height: 20rpx;
    background: #f3f3f3;
    border-radius: 100px;

    &.r {
      left: auto;
      right: -6rpx;
    }
  }
}
</style>

<style lang="scss">
/* 非 scoped 样式 - 规格选项按钮样式 */
/* 在 uni-app H5 端，scoped 样式无法作用于 text 原生组件 */
.attr-content .item-list text {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eee;
  margin-right: 20rpx;
  margin-bottom: 20rpx;
  border-radius: 100rpx;
  min-width: 60rpx;
  height: 60rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #333;
}

.attr-content .item-list text.selected {
  background: #fbebee;
  color: #e43a55;
}

// 相关推荐
.recommend-section {
  margin-top: 20rpx;
  padding: 30rpx;
  background: #fff;

  .section-title {
    font-size: 32rpx;
    font-weight: 700;
    color: #303133;
    margin-bottom: 24rpx;
  }

  .recommend-list {
    display: flex;
    flex-wrap: wrap;

    .recommend-item {
      width: 48%;
      margin-bottom: 24rpx;

      &:nth-child(2n + 1) {
        margin-right: 4%;
      }

      .image-wrapper {
        width: 100%;
        height: 320rpx;
        border-radius: 8rpx;
        overflow: hidden;

        image {
          width: 100%;
          height: 100%;
        }
      }

      .title {
        display: block;
        margin-top: 12rpx;
        font-size: 28rpx;
        color: #303133;
        line-height: 1.4;
      }

      .price-box {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 8rpx;
        font-size: 24rpx;
        color: #909399;

        .price {
          font-size: 30rpx;
          font-weight: 600;
          color: #e64340;
        }
      }
    }
  }
}
</style>
