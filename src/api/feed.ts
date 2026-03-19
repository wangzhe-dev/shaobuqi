import { http } from '@/utils/request'

export interface FeedItem {
  id: number
  modelName: string
  totalTokens: number | null
  costAmount: string | null
  currency: string
  reaction: string | null
  noteText: string
  images: string[]
  createdAt: string
  user: {
    id: number
    nickname: string
    displayColor: string | null
  }
  skill: {
    id: number
    title: string | null
    scene: string | null
  } | null
}

export interface FeedResponse {
  list: FeedItem[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export const getFeed = (params?: { page?: number; pageSize?: number }) => {
  return http.get<FeedResponse>('/feed', params)
}
