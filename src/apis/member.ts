import { http } from '@/utils/http'
import type {
  LoginResult,
  MemberInfo,
  LoginParam,
  PasswordLoginParam,
  RegisterParam,
  ForgetPasswordParam,
  CaptchaResult,
} from '@/types/member'

/** 获取用户信息 */
export const getMemberInfoAPI = () => {
  return http<MemberInfo>({
    method: 'GET',
    url: '/sso/info',
  })
}

/** 修改用户信息（昵称/头像/性别/生日/签名，null 字段不覆盖） */
export const updateMemberInfoAPI = (data: {
  nickname: string
  icon?: string
  gender?: number
  birthday?: string
  signature?: string
}) => {
  return http({
    method: 'PUT',
    url: '/sso/info',
    data,
  })
}

/** 手机号密码登录 */
export const loginAPI = (data: PasswordLoginParam) => {
  return http<LoginResult>({
    method: 'POST',
    url: '/sso/login',
    header: {
      'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    data,
  })
}

/** 获取图形验证码 */
export const getCaptchaAPI = () => {
  return http<CaptchaResult>({
    method: 'GET',
    url: '/captcha',
  })
}

/** 校验图形验证码并发送短信验证码 */
export const verifyQrCodeAPI = (data: { phone: string; captchaKey: string; captchaText: string }) => {
  return http({
    method: 'POST',
    url: '/sso/verifyQrCode',
    header: {
      'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    data,
  })
}

/** 短信验证码登录 */
export const loginBySmsCodeAPI = (data: LoginParam) => {
  return http<LoginResult>({
    method: 'POST',
    url: '/sso/loginBySmsCode',
    header: {
      'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    data,
  })
}

/** 注册（短信验证码） */
export const registerAPI = (data: RegisterParam) => {
  return http({
    method: 'POST',
    url: '/sso/register',
    header: {
      'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    data,
  })
}

/** 忘记密码（重置密码，无需登录） */
export const forgetPasswordAPI = (data: ForgetPasswordParam) => {
  return http({
    method: 'POST',
    url: '/sso/forgetPassword',
    header: {
      'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    data,
  })
}
