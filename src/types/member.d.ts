/**
 * 用户基本信息
 */
export type MemberInfo = {
  /** 用户ID */
  id: number
  /** 用户名 */
  username: string
  /** 昵称 */
  nickname?: string
  /** 头像 */
  icon?: string
  /** 性别：0->未知；1->男；2->女 */
  gender?: number
  /** 生日（yyyy-MM-dd） */
  birthday?: string
  /** 个性签名 */
  personalizedSignature?: string
  /** 积分 */
  integration?: number
  /** 成长值 */
  growth?: number
}

/** 登录接口返回结果 */
export type LoginResult = {
  /** Token 前缀（如 "Bearer "） */
  tokenHead: string
  /** 登录凭证 */
  token: string
}

/** 登录请求参数（短信验证码登录） */
export type LoginParam = {
  /** 手机号 */
  phone: string
  /** 短信验证码 */
  smsCode: string
}

/** 登录请求参数（手机号密码登录） */
export type PasswordLoginParam = {
  /** 手机号 */
  phone: string
  /** 密码 */
  password: string
}

/** 注册请求参数 */
export type RegisterParam = {
  /** 手机号 */
  phone: string
  /** 密码 */
  password: string
  /** 短信验证码 */
  smsCode: string
}

/** 忘记密码（重置密码）请求参数 */
export type ForgetPasswordParam = {
  /** 手机号 */
  phone: string
  /** 新密码 */
  password: string
  /** 短信验证码 */
  smsCode: string
}

/** 图形验证码返回结果 */
export type CaptchaResult = {
  /** 图形验证码唯一标识，提交时需携带 */
  captchaKey: string
  /** 图形验证码图片（Base64 格式，可直接渲染） */
  captchaImage: string
}
