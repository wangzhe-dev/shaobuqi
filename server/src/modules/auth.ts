import { Router } from 'express'
import bcrypt from 'bcrypt'
import { z } from 'zod'
import { execWrite, queryRows } from '../db'
import { signAccessToken } from '../utils/jwt'
import { sendError, sendSuccess } from '../utils/response'
import { mapUser, type UserRow } from './shared'

const loginSchema = z.object({
  identifier: z.string().trim().min(1),
  password: z.string().min(6)
})

export const authRouter = Router()

authRouter.post('/login/password', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    sendError(res, '登录参数不合法', 400)
    return
  }

  const { identifier, password } = parsed.data

  const users = await queryRows<UserRow[]>(
    `SELECT
      id,
      mobile,
      email,
      password_hash,
      nickname,
      avatar_url,
      bio,
      display_color,
      status,
      published_skill_count,
      total_copy_count,
      avg_success_rate,
      last_login_at,
      created_at,
      updated_at
    FROM users
    WHERE (mobile = ? OR email = ?)
    LIMIT 1`,
    [identifier, identifier]
  )

  const user = users[0]
  if (!user || user.status !== 1) {
    sendError(res, '账号不存在或已禁用', 401)
    return
  }

  if (!user.password_hash) {
    sendError(res, '账号未设置密码，请联系管理员初始化', 401)
    return
  }

  const matched = await bcrypt.compare(password, user.password_hash)
  if (!matched) {
    sendError(res, '账号或密码错误', 401)
    return
  }

  await execWrite('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id])

  const token = signAccessToken({ userId: user.id })

  sendSuccess(res, {
    token,
    user: mapUser(user)
  })
})
