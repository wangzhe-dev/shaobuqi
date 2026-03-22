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
  "buildId": "1774162000985",
  "publishedAt": "2026-03-22T06:46:40.985Z",
  "forceUpdate": true
} as const
