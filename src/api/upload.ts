import { apiPrefix, requestUrl } from '@/config'
import { useUserStore } from '@/stores'

export type UploadImageUsage = 'skill_cover' | 'skill_content' | 'user_avatar' | 'feed_image' | 'draft_image'

export type UploadedImageMeta = {
  imageUrl: string
  storageProvider: 'minio'
  bucketName: string
  objectKey: string
  mimeType: string
  fileSize: number
}

type UploadImageParams = {
  filePath: string
  usage: UploadImageUsage
  skillId?: number
  usageRecordId?: number
  draftId?: number
  index?: number
}

const buildUploadUrl = () => {
  // #ifdef H5
  return `/${apiPrefix}/uploads/image`
  // #endif

  // #ifndef H5
  return `${requestUrl}/uploads/image`
  // #endif
}

const parseUploadResponse = (raw: unknown): { code?: number; msg?: string; data?: UploadedImageMeta } | null => {
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return parsed as { code?: number; msg?: string; data?: UploadedImageMeta }
    } catch {
      return null
    }
  }

  if (raw && typeof raw === 'object') {
    return raw as { code?: number; msg?: string; data?: UploadedImageMeta }
  }

  return null
}

export const uploadImageFile = (params: UploadImageParams): Promise<UploadedImageMeta> => {
  return new Promise((resolve, reject) => {
    const token = useUserStore().token

    const formData: Record<string, string> = {
      usage: params.usage
    }
    if (params.skillId) formData.skillId = `${params.skillId}`
    if (params.usageRecordId) formData.usageRecordId = `${params.usageRecordId}`
    if (params.draftId) formData.draftId = `${params.draftId}`
    if (params.index) formData.index = `${params.index}`

    const header: Record<string, string> = {}
    if (token) header.Authorization = `Bearer ${token}`

    uni.uploadFile({
      url: buildUploadUrl(),
      name: 'file',
      filePath: params.filePath,
      formData,
      header,
      success: (res) => {
        const payload = parseUploadResponse(res.data)
        if (res.statusCode !== 200 || !payload) {
          reject(new Error('上传失败'))
          return
        }

        if (payload.code !== 200 || !payload.data) {
          reject(new Error(payload.msg || '上传失败'))
          return
        }

        resolve(payload.data)
      },
      fail: (error) => {
        reject(new Error(error.errMsg || '上传失败'))
      }
    })
  })
}
