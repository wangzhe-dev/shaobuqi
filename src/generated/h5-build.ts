export interface H5BuildInfo {
  versionName: string
  versionCode: number
  buildId: string
  publishedAt: string
  forceUpdate: boolean
}

export const CURRENT_H5_BUILD: H5BuildInfo = {
  "versionName": "1.0.2",
  "versionCode": 100,
  "buildId": "local-dev",
  "publishedAt": "2026-03-22T00:00:00.000Z",
  "forceUpdate": true
} as const
