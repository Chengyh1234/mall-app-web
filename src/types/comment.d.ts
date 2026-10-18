/** 商品评论回复 */
export type PmsCommentReplay = {
  /** ID */
  id: number
  /** 评论ID */
  commentId: number
  /** 回复用户昵称 */
  memberNickName?: string
  /** 回复用户头像 */
  memberIcon?: string
  /** 回复内容 */
  content: string
  /** 回复时间 */
  createTime: string
  /** 评论人员类型；0->会员；1->管理员 */
  type: number
}

/** 商品评论 */
export type PmsComment = {
  /** ID */
  id: number
  /** 商品ID */
  productId: number
  /** 商品名称 */
  productName?: string
  /** 评论用户昵称 */
  memberNickName?: string
  /** 评论用户头像 */
  memberIcon?: string
  /** 评价星数：0->5 */
  star: number
  /** 评价内容 */
  content: string
  /** 上传图片地址，以逗号隔开 */
  pics?: string
  /** 购买时的商品属性 */
  productAttribute?: string
  /** 评论时间 */
  createTime: string
  /** 展示状态 */
  showStatus?: number
  /** 点赞数 */
  collectCouont: number
  /** 阅读数 */
  readCount: number
  /** 回复数 */
  replayCount: number
}

/** 商品评论详情（含回复列表） */
export type PmsCommentDetail = PmsComment & {
  /** 评论回复列表 */
  replayList: PmsCommentReplay[]
}

/** 发表评论参数 */
export type CommentAddParam = {
  /** 商品ID */
  productId: number
  /** 评价星数：0->5 */
  star: number
  /** 评价内容 */
  content: string
  /** 上传图片地址，以逗号隔开 */
  pics?: string
  /** 购买时的商品属性 */
  productAttribute?: string
}

/** 回复评论参数 */
export type CommentReplyParam = {
  /** 评论ID */
  commentId: number
  /** 回复内容 */
  content: string
}

/** OSS 前端直传签名返回结果 */
export type OssPolicyResult = {
  /** 访问身份验证中用到用户标识 */
  accessKeyId: string
  /** 用户表单上传的策略，经过base64编码过的字符串 */
  policy: string
  /** 对policy签名后的字符串 */
  signature: string
  /** 上传文件夹路径前缀 */
  dir: string
  /** oss对外服务的访问域名 */
  host: string
  /** 上传成功后的回调设置 */
  callback: string
}
