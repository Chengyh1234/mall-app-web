import { http } from '@/utils/http'
import type { CommonPage } from '@/types/common'
import type { MessageItem, MessageQueryParam, MessageType } from '@/types/message'

/** 分页查询消息列表 */
export const getMessageListAPI = (params: MessageQueryParam) => {
  return http<CommonPage<MessageItem>>({
    method: 'GET',
    url: '/member/message/list',
    params,
  })
}

/** 查询未读消息数量 */
export const getUnreadMessageCountAPI = () => {
  return http<number>({
    method: 'GET',
    url: '/member/message/unread-count',
  })
}

/** 标记单条消息已读 */
export const readMessageAPI = (id: number) => {
  return http({
    method: 'PUT',
    url: `/member/message/read/${id}`,
  })
}

/** 全部标记已读（可按类型） */
export const readAllMessageAPI = (type?: MessageType) => {
  return http({
    method: 'PUT',
    url: '/member/message/read-all',
    params: { type },
  })
}