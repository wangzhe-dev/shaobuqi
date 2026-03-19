import { Router } from 'express'
import type { RowDataPacket } from 'mysql2/promise'
import { queryRows } from '../db'
import { safeParseJson } from '../utils/json'
import { buildPaginationMeta, parsePagination } from '../utils/pagination'
import { sendSuccess } from '../utils/response'

type FeedRow = RowDataPacket & {
  id: number
  user_id: number
  skill_id: number | null
  model_name: string
  total_tokens: number | null
  cost_amount: string | null
  currency: string
  reaction: string | null
  note_text: string
  images_json: unknown
  created_at: string
  nickname: string
  display_color: string | null
  skill_title: string | null
  skill_scene: string | null
}

type CountRow = RowDataPacket & { total: number }

export const feedRouter = Router()

// GET /feed — 公开消耗动态列表（有 note_text 的 skill_usage_records）
feedRouter.get('/', async (req, res) => {
  const { page, pageSize, offset } = parsePagination(req.query.page, req.query.pageSize, {
    pageSize: 20,
    maxPageSize: 50
  })

  const rows = await queryRows<FeedRow[]>(
    `SELECT
      sur.id,
      sur.user_id,
      sur.skill_id,
      sur.model_name,
      sur.total_tokens,
      sur.cost_amount,
      sur.currency,
      sur.reaction,
      sur.note_text,
      sur.images_json,
      sur.created_at,
      u.nickname,
      u.display_color,
      s.title  AS skill_title,
      s.scene  AS skill_scene
    FROM skill_usage_records sur
    INNER JOIN users u ON u.id = sur.user_id
    LEFT JOIN skills s ON s.id = sur.skill_id
    WHERE sur.note_text IS NOT NULL AND sur.note_text != ''
    ORDER BY sur.created_at DESC
    LIMIT ? OFFSET ?`,
    [pageSize, offset]
  )

  const countRows = await queryRows<CountRow[]>(
    `SELECT COUNT(1) AS total
    FROM skill_usage_records
    WHERE note_text IS NOT NULL AND note_text != ''`
  )
  const total = countRows[0]?.total ?? 0

  sendSuccess(res, {
    list: rows.map((row) => ({
      id: row.id,
      modelName: row.model_name,
      totalTokens: row.total_tokens,
      costAmount: row.cost_amount,
      currency: row.currency,
      reaction: row.reaction,
      noteText: row.note_text,
      images: safeParseJson<string[]>(row.images_json, []),
      createdAt: row.created_at,
      user: {
        id: row.user_id,
        nickname: row.nickname,
        displayColor: row.display_color
      },
      skill: row.skill_id
        ? { id: row.skill_id, title: row.skill_title, scene: row.skill_scene }
        : null
    })),
    pagination: buildPaginationMeta(page, pageSize, total)
  })
})
