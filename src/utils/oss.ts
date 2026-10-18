import { getOssPolicyAPI } from '@/apis/oss'

/**
 * 图片直传 OSS（阿里云表单直传）
 * 流程：获取签名 -> 构造表单字段 -> uni.uploadFile 上传到 host -> 返回完整访问 URL
 * 说明：
 * - 默认携带后端下发的 callback 字段，OSS 上传成功后回调服务端记录；
 * - 若回调地址为内网地址（如 localhost）导致上传被拒绝（Private address is
 *   forbidden to callback），则去掉 callback 降级重试，图片地址仍可由 host+key 拼接；
 * - 后端关闭回调（callback 为空）时自动不带 callback 直传；
 * - 成功判定兼容 2xx（OSS 可能返回 200/204 等），并带 15s 超时兜底，避免卡在上传中。
 * @param filePath 本地图片路径（uni.chooseImage 返回的 tempFilePaths 项）
 * @returns Promise<string> 图片完整访问地址
 */
export const uploadImageToOSS = (filePath: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await getOssPolicyAPI()
      const policy = res.data

      // 生成随机文件名（目录已由后端按日期生成）
      const extMatch = filePath.match(/\.(\w+)$/)
      const ext = extMatch ? extMatch[1] : 'jpg'
      const filename = `${Date.now()}-${Math.floor(Math.random() * 1e6)}.${ext}`
      const key = `${policy.dir}/${filename}`

      // 执行一次直传（withCallback 控制是否携带回调配置）
      const doUpload = (withCallback: boolean): Promise<string> =>
        new Promise((resolveUpload, rejectUpload) => {
          const formData: Record<string, string> = {
            key,
            policy: policy.policy,
            OSSAccessKeyId: policy.accessKeyId,
            signature: policy.signature,
            success_action_status: '200',
          }
          if (withCallback && policy.callback) {
            formData.callback = policy.callback
          }
          // 兜底超时：防止平台回调异常导致一直卡在"上传中"
          const timer = setTimeout(() => {
            rejectUpload(new Error('上传超时'))
          }, 15000)
          uni.uploadFile({
            url: policy.host,
            filePath,
            name: 'file',
            timeout: 30000,
            formData,
            success(uploadRes) {
              clearTimeout(timer)
              // OSS 直传成功可能返回 200/204 等 2xx 状态码
              if (uploadRes.statusCode >= 200 && uploadRes.statusCode < 300) {
                resolveUpload(`${policy.host}/${key}`)
              } else {
                const errData = uploadRes.data ? String(uploadRes.data) : ''
                rejectUpload(
                  new Error(`上传失败，状态码：${uploadRes.statusCode}，${errData}`),
                )
              }
            },
            fail(err) {
              clearTimeout(timer)
              rejectUpload(err)
            },
          })
        })

      try {
        const url = await doUpload(true)
        resolve(url)
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e)
        // 回调地址为内网（如 localhost）时 OSS 拒绝回调，降级为不带回调直传
        if (message.includes('forbidden to callback')) {
          const url = await doUpload(false)
          resolve(url)
        } else {
          reject(e)
        }
      }
    } catch (e) {
      reject(e)
    }
  })
}
