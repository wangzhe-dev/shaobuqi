#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const projectRoot = path.resolve(__dirname, '..')
const manifestPath = path.join(projectRoot, 'src/manifest.json')
const appVersionPath = path.join(projectRoot, 'public/app-version.json')

const readJsonFile = (filePath, fallback = {}) => {
  if (!fs.existsSync(filePath)) return fallback

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch (error) {
    console.error(`[sync-app-version] failed to parse ${filePath}`)
    throw error
  }
}

const writeJsonFile = (filePath, value) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

const normalizeVersionName = (value) => String(value || '').trim()

const normalizeVersionCode = (value) => {
  const next = Number.parseInt(String(value || '').trim(), 10)
  return Number.isFinite(next) ? next : 0
}

const normalizeBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === '') return fallback
  return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase())
}

const normalizeNotes = (value, fallback = []) => {
  if (value === undefined || value === null || value === '') return fallback

  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || '').trim())
      .filter(Boolean)
  }

  return String(value)
    .split(/\r?\n|\|/g)
    .map((item) => item.trim())
    .filter(Boolean)
}

const resolvePublicBaseUrl = (existingConfig) => {
  const envBaseUrl = String(process.env.APP_UPDATE_PUBLIC_BASE_URL || '').trim().replace(/\/+$/, '')
  if (envBaseUrl) return envBaseUrl

  const existingApkUrl = String(existingConfig?.android?.apkUrl || '').trim()
  if (!existingApkUrl) return 'https://www.shaobuqi.com'

  try {
    const url = new URL(existingApkUrl)
    return `${url.protocol}//${url.host}`
  } catch {
    return 'https://www.shaobuqi.com'
  }
}

const manifestConfig = readJsonFile(manifestPath)
const existingConfig = readJsonFile(appVersionPath)

const versionName = normalizeVersionName(manifestConfig.versionName)
const versionCode = normalizeVersionCode(manifestConfig.versionCode)
const publicBaseUrl = resolvePublicBaseUrl(existingConfig)

const defaultAndroidApkUrl = `${publicBaseUrl}/download/shaobuqi.apk`
const androidNotes = normalizeNotes(
  process.env.APP_UPDATE_ANDROID_NOTES ?? process.env.APP_UPDATE_NOTES,
  normalizeNotes(existingConfig?.android?.notes, ['修复已知问题', '优化整体使用体验'])
)
const iosNotes = normalizeNotes(
  process.env.APP_UPDATE_IOS_NOTES ?? process.env.APP_UPDATE_NOTES,
  normalizeNotes(existingConfig?.ios?.notes, ['修复已知问题', '优化整体使用体验'])
)

const nextConfig = {
  ...existingConfig,
  android: {
    ...(existingConfig.android || {}),
    versionName,
    versionCode,
    apkUrl: String(process.env.APP_UPDATE_ANDROID_APK_URL || '').trim() || String(existingConfig?.android?.apkUrl || '').trim() || defaultAndroidApkUrl,
    force: normalizeBoolean(process.env.APP_UPDATE_ANDROID_FORCE ?? process.env.APP_UPDATE_FORCE, Boolean(existingConfig?.android?.force)),
    notes: androidNotes
  },
  ios: {
    ...(existingConfig.ios || {}),
    versionName,
    versionCode,
    storeUrl: String(process.env.APP_UPDATE_IOS_STORE_URL || '').trim() || String(existingConfig?.ios?.storeUrl || '').trim(),
    force: normalizeBoolean(process.env.APP_UPDATE_IOS_FORCE ?? process.env.APP_UPDATE_FORCE, Boolean(existingConfig?.ios?.force)),
    notes: iosNotes
  }
}

writeJsonFile(appVersionPath, nextConfig)

console.log(`[sync-app-version] ${path.relative(projectRoot, appVersionPath)} <= v${versionName} (${versionCode})`)
