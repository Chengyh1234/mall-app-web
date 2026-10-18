import { ref } from 'vue'
import { getCaptchaAPI, verifyQrCodeAPI } from '@/apis/member'

/**
 * 短信验证码获取逻辑（登录/注册/忘记密码共用）
 *
 * 流程：加载图形验证码 → 用户输入图形验证码 → 调 verifyQrCode（后端校验图形验证码）
 *      → 短信验证码下发 → 进入 60s 倒计时
 */
export function useSmsCode() {
  // 图形验证码 Key（提交获取短信验证码时携带）
  const captchaKey = ref('')
  // 图形验证码图片（Base64）
  const captchaImage = ref('')
  // 用户输入的图形验证码
  const captchaText = ref('')
  // 短信验证码倒计时（秒）
  const smsCountdown = ref(0)
  // 倒计时定时器
  let countdownTimer: ReturnType<typeof setInterval> | null = null

  // 加载图形验证码
  const loadCaptcha = async () => {
    try {
      const res = await getCaptchaAPI()
      captchaKey.value = res.data.captchaKey
      captchaImage.value = res.data.captchaImage
      captchaText.value = ''
    } catch {
      // 加载失败静默处理，用户可点击图片重试
    }
  }

  // 校验手机号格式
  const isValidPhone = (phone: string) => /^1[3-9]\d{9}$/.test(phone)

  // 获取短信验证码（携带图形验证码，由后端校验）
  const sendSmsCode = async (phone: string) => {
    if (!isValidPhone(phone)) {
      throw new Error('手机号格式不正确')
    }
    if (!captchaText.value) {
      throw new Error('请输入图形验证码')
    }

    await verifyQrCodeAPI({
      phone,
      captchaKey: captchaKey.value,
      captchaText: captchaText.value,
    })
    // 短信验证码下发后开始 60 秒倒计时
    startCountdown()
  }

  // 开始 60 秒倒计时
  const startCountdown = () => {
    smsCountdown.value = 60
    if (countdownTimer) {
      clearInterval(countdownTimer)
    }
    countdownTimer = setInterval(() => {
      smsCountdown.value--
      if (smsCountdown.value <= 0) {
        smsCountdown.value = 0
        if (countdownTimer) {
          clearInterval(countdownTimer)
          countdownTimer = null
        }
      }
    }, 1000)
  }

  return {
    captchaKey,
    captchaImage,
    captchaText,
    smsCountdown,
    loadCaptcha,
    sendSmsCode,
  }
}
