import { Router, type Request, type Response } from 'express'
import multer from 'multer'
import type { RowDataPacket } from 'mysql2/promise'
import { z } from 'zod'
import { execWrite, queryRows } from '../db'
import { requireAuth } from '../middlewares/auth'
import { buildObjectKey, resolveImageExtension } from '../services/storage/object-key'
import { minioStorageService } from '../services/storage/minio'
import { sendError, sendSuccess } from '../utils/response'

type SkillOwnerRow = RowDataPacket & {
  id: number
  creator_id: number
}

type FeedPostOwnerRow = RowDataPacket & {
  id: number
  user_id: number
}

type DraftOwnerRow = RowDataPacket & {
  id: number
  user_id: number
}

const uploadImageSchema = z.object({
  usage: z.enum(['skill_cover', 'skill_content', 'user_avatar', 'feed_image', 'draft_image']),
  skillId: z.coerce.number().int().positive().optional(),
  usageRecordId: z.coerce.number().int().positive().optional(),
  draftId: z.coerce.number().int().positive().optional(),
  index: z.coerce.number().int().positive().max(9999).optional()
})

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  }
})

const runUploadSingle = (req: Request, res: Response): Promise<void> => {
  return new Promise((resolve, reject) => {
    upload.single('file')(req, res, (error?: unknown) => {
      if (!error) {
        resolve()
        return
      }

      if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
        reject(new Error('上传文件不能超过 10MB'))
        return
      }

      reject(error)
    })
  })
}

const ensureSkillOwner = async (skillId: number, userId: number): Promise<'ok' | 'not_found' | 'forbidden'> => {
  const rows = await queryRows<SkillOwnerRow[]>(
    `SELECT id, creator_id
    FROM skills
    WHERE id = ?
    LIMIT 1`,
    [skillId]
  )

  const skill = rows[0]
  if (!skill) return 'not_found'
  if (skill.creator_id !== userId) return 'forbidden'
  return 'ok'
}

const ensureFeedPostOwner = async (usageRecordId: number, userId: number): Promise<'ok' | 'not_found' | 'forbidden'> => {
  const rows = await queryRows<FeedPostOwnerRow[]>(
    `SELECT id, user_id
    FROM skill_usage_records
    WHERE id = ?
    LIMIT 1`,
    [usageRecordId]
  )

  const record = rows[0]
  if (!record) return 'not_found'
  if (record.user_id !== userId) return 'forbidden'
  return 'ok'
}

const ensureDraftOwner = async (draftId: number, userId: number): Promise<'ok' | 'not_found' | 'forbidden'> => {
  const rows = await queryRows<DraftOwnerRow[]>(
    `SELECT id, user_id
    FROM drafts
    WHERE id = ?
    LIMIT 1`,
    [draftId]
  )

  const draft = rows[0]
  if (!draft) return 'not_found'
  if (draft.user_id !== userId) return 'forbidden'
  return 'ok'
}

export const uploadsRouter = Router()

uploadsRouter.use(requireAuth)

uploadsRouter.post('/image', async (req, res) => {
  try {
    await runUploadSingle(req, res)
  } catch (error) {
    const msg = error instanceof Error ? error.message : '上传失败'
    sendError(res, msg, 400)
    return
  }

  const parsed = uploadImageSchema.safeParse(req.body)
  if (!parsed.success) {
    sendError(res, parsed.error.issues[0]?.message || '上传参数不合法', 400)
    return
  }

  const file = req.file
  if (!file) {
    sendError(res, '请上传图片文件', 400)
    return
  }

  if (!file.mimetype.startsWith('image/')) {
    sendError(res, '仅支持图片文件上传', 400)
    return
  }

  const payload = parsed.data
  const userId = req.auth!.userId

  if (payload.usage === 'skill_cover' || payload.usage === 'skill_content') {
    if (!payload.skillId) {
      sendError(res, 'skillId 必填', 400)
      return
    }

    const ownerState = await ensureSkillOwner(payload.skillId, userId)
    if (ownerState === 'not_found') {
      sendError(res, 'Skill 不存在', 404)
      return
    }
    if (ownerState === 'forbidden') {
      sendError(res, '无权限上传该 Skill 图片', 403)
      return
    }
  }

  if (payload.usage === 'feed_image') {
    if (!payload.usageRecordId) {
      sendError(res, 'usageRecordId 必填', 400)
      return
    }

    const ownerState = await ensureFeedPostOwner(payload.usageRecordId, userId)
    if (ownerState === 'not_found') {
      sendError(res, '动态不存在', 404)
      return
    }
    if (ownerState === 'forbidden') {
      sendError(res, '无权限上传该动态图片', 403)
      return
    }
  }

  if (payload.usage === 'draft_image') {
    if (!payload.draftId) {
      sendError(res, 'draftId 必填', 400)
      return
    }

    const ownerState = await ensureDraftOwner(payload.draftId, userId)
    if (ownerState === 'not_found') {
      sendError(res, '草稿不存在', 404)
      return
    }
    if (ownerState === 'forbidden') {
      sendError(res, '无权限上传该草稿图片', 403)
      return
    }
  }

  const extension = resolveImageExtension(file.mimetype, file.originalname)
  const objectKey = buildObjectKey({
    usage: payload.usage,
    userId,
    skillId: payload.skillId,
    usageRecordId: payload.usageRecordId,
    draftId: payload.draftId,
    index: payload.index,
    extension
  })

  const uploaded = await minioStorageService.uploadBuffer({
    objectKey,
    buffer: file.buffer,
    mimeType: file.mimetype
  })

  if (payload.usage === 'user_avatar') {
    await execWrite(
      `UPDATE users
      SET avatar_url = ?
      WHERE id = ?`,
      [uploaded.imageUrl, userId]
    )
  }

  sendSuccess(res, uploaded)
})
