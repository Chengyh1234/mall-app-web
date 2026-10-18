/**
 * ES 搜索商品相关类型
 * 对应后端 EsProduct / EsProductRelatedInfo 等 Schema
 */

/** ES 商品属性值 */
export type EsProductAttributeValue = {
  /** 属性ID */
  id: number
  /** 商品属性ID */
  productAttributeId: number
  /** 属性值 */
  value: string
  /** 属性类型；0->规格；1->参数 */
  type: number
  /** 属性名称 */
  name: string
}

/** ES 搜索商品 */
export type EsProduct = {
  /** 商品ID */
  id: number
  /** 商品编码 */
  productSn: string
  /** 品牌ID */
  brandId: number
  /** 品牌名称 */
  brandName: string
  /** 分类ID */
  productCategoryId: number
  /** 分类名称 */
  productCategoryName: string
  /** 图片 */
  pic: string
  /** 商品名称 */
  name: string
  /** 副标题 */
  subTitle: string
  /** 关键字 */
  keywords: string
  /** 价格 */
  price: number
  /** 销量 */
  sale: number
  /** 新品状态：0->不是新品；1->新品 */
  newStatus: number
  /** 推荐状态：0->不推荐；1->推荐 */
  recommandStatus: number
  /** 库存 */
  stock: number
  /** 促销类型；0->无促销；1->单品优惠；2->会员优惠；3->多买优惠；4->满减优惠；5->限时优惠 */
  promotionType: number
  /** 排序 */
  sort: number
  /** 商品属性值列表 */
  attrValueList: EsProductAttributeValue[]
}

/** EsProduct 通用分页响应（对应后端 CommonPageEsProduct） */
export type EsPage<T> = {
  /** 当前页码 */
  pageNum: number
  /** 每页数量 */
  pageSize: number
  /** 总页数 */
  totalPage: number
  /** 总条数 */
  total: number
  /** 分页数据 */
  list: T[]
}

/** ES 商品属性（对应后端 ProductAttr） */
export type ProductAttr = {
  /** 属性ID */
  attrId: number
  /** 属性名称 */
  attrName: string
  /** 属性可选值 */
  attrValues: string[]
}

/** ES 搜索相关品牌、分类及筛选属性信息 */
export type EsProductRelatedInfo = {
  /** 相关品牌名称 */
  brandNames: string[]
  /** 相关分类名称 */
  productCategoryNames: string[]
  /** 筛选属性列表 */
  productAttrs: ProductAttr[]
}