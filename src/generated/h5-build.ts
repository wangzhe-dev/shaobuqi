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
  "buildId": "1774269428072",
  "publishedAt": "2026-03-23T12:37:08.072Z",
  "forceUpdate": true
} as const
