/** 消息类型：1-系统通知 2-订单通知 3-营销通知 */
export type MessageType = 1 | 2 | 3

/** 消息实体（用户视角，已包含已读状态） */
export type MessageItem = {
  /** 消息ID */
  id: number
  /** 消息类型 */
  type: MessageType
  /** 消息标题 */
  title: string
  /** 消息内容 */
  content?: string
  /** 业务ID（如订单ID），用于点击跳转 */
  bizId?: string
  /** 已读状态：0-未读 1-已读 */
  readStatus: 0 | 1
  /** 创建时间 */
  createTime: string
}

/** 消息分页查询参数 */
export type MessageQueryParam = {
  /** 消息类型（不传表示全部） */
  type?: MessageType
  /** 当前页码，从1开始 */
  pageNum: number
  /** 每页数量，默认10 */
  pageSize: number
}