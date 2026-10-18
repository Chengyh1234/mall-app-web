import { http } from '@/utils/http'
import type { CommonPage } from '@/types/common'
import type {
  CommentAddParam,
  CommentReplyParam,
  PmsCommentDetail,
} from '@/types/comment'

/** 分页获取商品评论列表 */
export const getCommentListAPI = (
  productId: number,
  pageNum: number,
  pageSize: number,
) => {
  return http<CommonPage<PmsCommentDetail>>({
    method: 'GET',
    url: '/comment/list',
    params: { productId, pageNum, pageSize },
  })
}

/** 获取我的评论列表（需登录） */
export const getMyCommentListAPI = (pageNum: number, pageSize: number) => {
  return http<CommonPage<PmsCommentDetail>>({
    method: 'GET',
    url: '/comment/my',
    params: { pageNum, pageSize },
  })
}

/** 发表评论 */
export const addCommentAPI = (data: CommentAddParam) => {
  return http<null>({
    method: 'POST',
    url: '/comment/add',
    data,
  })
}

/** 回复评论 */
export const replyCommentAPI = (data: CommentReplyParam) => {
  return http<null>({
    method: 'POST',
    url: '/comment/replay/add',
    data,
  })
}

/** 点赞评论 */
export const likeCommentAPI = (id: number) => {
  return http<null>({
    method: 'POST',
    url: `/comment/like/${id}`,
  })
}
