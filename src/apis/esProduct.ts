/**
 * ES 搜索商品接口封装（独立 ES 搜索服务）
 */
import { http } from '@/utils/http'
import type { EsPage, EsProduct, EsProductRelatedInfo } from '@/types/esProduct'

/**
 * ES 搜索服务基础地址
 * - H5 开发环境走 vite 代理（相对路径，避免跨域）
 * - 其他环境（小程序 / 生产）走独立 baseURL
 */
// #ifdef H5
const ES_BASE_URL = import.meta.env.DEV ? '' : import.meta.env.VITE_ES_BASE_URL
// #endif
// #ifndef H5
const ES_BASE_URL = import.meta.env.VITE_ES_BASE_URL
// #endif

/**
 * 综合搜索、筛选、排序
 * 排序字段：0->按相关度；1->按新品；2->按销量；3->价格从低到高；4->价格从高到低
 */
export const esSearchProductAPI = (params: {
  /** 搜索关键字 */
  keyword?: string
  /** 品牌ID */
  brandId?: number
  /** 分类ID */
  productCategoryId?: number
  /** 分页页码（从0开始） */
  pageNum?: number
  /** 每页数量 */
  pageSize?: number
  /** 排序字段：0相关度/1新品/2销量/3价格低到高/4价格高到低 */
  sort?: number
}) => {
  return http<EsPage<EsProduct>>({
    method: 'GET',
    url: '/esProduct/search',
    baseURL: ES_BASE_URL,
    params,
  })
}

/**
 * 简单搜索（无筛选排序）
 */
export const esSearchSimpleAPI = (params: {
  /** 搜索关键字 */
  keyword?: string
  /** 分页页码（从0开始） */
  pageNum?: number
  /** 每页数量 */
  pageSize?: number
}) => {
  return http<EsPage<EsProduct>>({
    method: 'GET',
    url: '/esProduct/search/simple',
    baseURL: ES_BASE_URL,
    params,
  })
}

/**
 * 搜索建议：根据输入前缀返回联想商品名
 */
export const esSearchSuggestAPI = (keyword: string) => {
  return http<string[]>({
    method: 'GET',
    url: '/esProduct/suggest',
    baseURL: ES_BASE_URL,
    params: { keyword },
  })
}

/**
 * 获取搜索的相关品牌、分类及筛选属性
 */
export const esSearchRelatedInfoAPI = (keyword?: string) => {
  return http<EsProductRelatedInfo>({
    method: 'GET',
    url: '/esProduct/search/relate',
    baseURL: ES_BASE_URL,
    params: { keyword },
  })
}

/**
 * 根据商品id推荐商品
 */
export const esRecommendProductAPI = (params: {
  /** 商品ID */
  id: number
  /** 分页页码（从0开始） */
  pageNum?: number
  /** 每页数量 */
  pageSize?: number
}) => {
  return http<EsPage<EsProduct>>({
    method: 'GET',
    url: `/esProduct/recommend/${params.id}`,
    baseURL: ES_BASE_URL,
    params: { pageNum: params.pageNum, pageSize: params.pageSize },
  })
}