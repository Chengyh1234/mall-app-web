import { http } from '@/utils/http'
import type { OssPolicyResult } from '@/types/comment'

/** 获取OSS上传文件授权（前端直传签名） */
export const getOssPolicyAPI = () => {
  return http<OssPolicyResult>({
    method: 'GET',
    url: '/aliyun/oss/policy',
  })
}
