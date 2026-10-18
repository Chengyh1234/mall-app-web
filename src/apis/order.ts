import { http } from '@/utils/http'
import type {
  BuyNowConfirmParam,
  BuyNowParam,
  ConfirmOrderResult,
  FlashPromotionOrderParam,
  GenerateOrderResult,
  OrderParam,
  OmsOrderDetail,
  OmsOrderReturnApply,
  OmsOrderReturnApplyParam,
} from '@/types/order'
import type { CommonPage, PageParam } from '@/types/common'

/** 生成确认单信息 */
export const generateConfirmOrderAPI = (cartIds: number[]) => {
  return http<ConfirmOrderResult>({
    method: 'POST',
    url: '/order/generateConfirmOrder',
    data: cartIds,
  })
}

/** 生成订单 */
export const generateOrderAPI = (data: OrderParam) => {
  return http<GenerateOrderResult>({
    method: 'POST',
    url: '/order/generateOrder',
    data,
  })
}

/** 根据立即购买信息生成确认单 */
export const generateBuyNowConfirmOrderAPI = (data: BuyNowConfirmParam) => {
  return http<ConfirmOrderResult>({
    method: 'POST',
    url: '/order/generateBuyNowConfirmOrder',
    data,
  })
}

/** 根据立即购买信息生成订单 */
export const generateBuyNowOrderAPI = (data: BuyNowParam) => {
  return http<GenerateOrderResult>({
    method: 'POST',
    url: '/order/generateBuyNowOrder',
    data,
  })
}

/** 根据秒杀/限时购信息生成订单（限时购才限购，禁用优惠券与积分） */
export const generateFlashOrderAPI = (data: FlashPromotionOrderParam) => {
  return http<GenerateOrderResult>({
    method: 'POST',
    url: '/order/generateFlashOrder',
    data,
  })
}

/** 按状态分页获取用户订单列表 */
export const getOrderListAPI = (params: PageParam & { status: number }) => {
  return http<CommonPage<OmsOrderDetail>>({
    method: 'GET',
    url: '/order/list',
    params,
  })
}

/** 根据ID获取订单详情 */
export const getOrderDetailAPI = (orderId: number) => {
  return http<OmsOrderDetail>({
    method: 'GET',
    url: `/order/detail/${orderId}`,
  })
}

/** 用户取消订单 */
export const cancelUserOrderAPI = (orderId: number) => {
  return http({
    method: 'POST',
    url: '/order/cancelUserOrder',
    params: { orderId },
  })
}

/** 用户确认收货 */
export const confirmReceiveOrderAPI = (orderId: number) => {
  return http({
    method: 'POST',
    url: '/order/confirmReceiveOrder',
    params: { orderId },
  })
}

/** 用户删除订单 */
export const deleteOrderAPI = (orderId: number) => {
  return http({
    method: 'POST',
    url: '/order/deleteOrder',
    params: { orderId },
  })
}

/** 支付成功回调 */
export const payOrderSuccessAPI = (params: { orderId: number; payType: number }) => {
  return http({
    method: 'POST',
    url: '/order/paySuccess',
    params,
  })
}

/** 支付宝交易状态查询 */
export const fetchAliapyStatusAPI = (params: { outTradeNo: string }) => {
  return http<string>({
    method: 'GET',
    url: '/alipay/query',
    params,
  })
}

/**
 * 支付宝电脑网站支付（扫码支付）
 * 后端 `/alipay/pay` 直接返回二维码内容（纯文本链接，非 CommonResult JSON），
 * 故不走通用 http()，改用原生 uni.request 读取响应体。拦截器会自动拼接 baseURL 与 token。
 */
export const fetchAlipayPayAPI = (params: {
  outTradeNo: string
  subject: string
  totalAmount: number
}): Promise<string> => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: '/alipay/pay',
      method: 'GET',
      data: params,
      // 后端返回纯文本二维码链接，按文本读取，避免默认 json 解析纯文本报错
      dataType: 'text',
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const raw = res.data as any
          let qr = ''
          if (typeof raw === 'string') {
            const t = raw.trim()
            // 兼容：纯文本链接 / CommonResult JSON 字符串
            if (t.startsWith('{')) {
              try {
                const obj = JSON.parse(t)
                qr = obj.data != null ? obj.data : obj.qrCode ?? ''
              } catch (e) {
                qr = t
              }
            } else {
              qr = t
            }
          } else if (raw && typeof raw === 'object') {
            qr = raw.data != null ? raw.data : raw.qrCode ?? ''
          }
          resolve(qr.trim())
        } else {
          reject(res)
        }
      },
      fail: reject,
    })
  })
}

/** 申请退货 */
export const createReturnApplyAPI = (data: OmsOrderReturnApplyParam) => {
  return http({
    method: 'POST',
    url: '/returnApply/create',
    data,
  })
}

/** 获取当前会员的售后申请列表 */
export const getReturnApplyListAPI = () => {
  return http<OmsOrderReturnApply[]>({
    method: 'GET',
    url: '/returnApply/list',
  })
}
