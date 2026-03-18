import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import AutoImport from 'unplugin-auto-import/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { requestUrl, apiPrefix } from './src/config'

const pwaAssetVersion = Date.now().toString()

const withPwaAssetVersion = (path: string) => `${path}?v=${pwaAssetVersion}`

const injectVersionedPwaIcons = () => ({
	name: 'inject-versioned-pwa-icons',
	transformIndexHtml(html: string) {
		return html
			.replace('static/icons/apple-touch-icon.png', withPwaAssetVersion('static/icons/apple-touch-icon.png'))
			.replace('static/icons/icon-96x96.png', withPwaAssetVersion('static/icons/icon-96x96.png'))
	}
})

export default defineConfig({
	plugins: [
		uni(),
		AutoImport({
			// 自动导入 Vue 相关函数，如：ref, reactive, toRef, onLoad 等
			imports: ['vue', 'vue-router', 'uni-app'],
			dts: './src/types/auto-imports.d.ts',
			vueTemplate: true,
			// 生成相应的.eslintrc-auto-import.json文件。
			eslintrc: {
				// 1、改为true 用于生成eslint配置。2、生成后改回false，避免重复生成消耗
				enabled: true
				}
			}),
			injectVersionedPwaIcons(),
			// PWA 支持（仅 H5 构建生效）
			// 图标使用 src/static/icons/ —— UniApp H5 会将其复制到 dist 的 static/icons/
			VitePWA({
				registerType: 'prompt', // 有新版本时提示用户，而非静默更新
				injectRegister: 'auto',
				manifestFilename: `manifest-${pwaAssetVersion}.webmanifest`,
				manifest: {
					name: '烧不起',
					short_name: '烧不起',
					description: '工具 · 社区 · Skill 技能展示平台',
					theme_color: '#5B5BD6',
					background_color: '#F7F8FA',
					display: 'standalone',
					orientation: 'portrait',
					// 固定应用标识，避免 manifest 文件名变化时被识别成另一份应用
					id: './',
					// 相对路径（相对于 manifest.webmanifest 所在目录）
					// UniApp H5 base 是 /h5/，manifest 位于 /h5/manifest.webmanifest
					// 相对路径 "./" 解析为 /h5/ 而非 /，适配任何 base 部署
					start_url: './',
				scope: './',
				lang: 'zh-CN',
					icons: [
						{
							// 相对路径：manifest 在 /h5/，图标在 /h5/static/icons/
							src: withPwaAssetVersion('static/icons/icon-96x96.png'),
							sizes: '96x96',
							type: 'image/png'
						},
						{
							src: withPwaAssetVersion('static/icons/icon-192x192.png'),
							sizes: '192x192',
							type: 'image/png'
						},
						{
							src: withPwaAssetVersion('static/icons/icon-512x512.png'),
							sizes: '512x512',
							type: 'image/png'
						},
						{
							src: withPwaAssetVersion('static/icons/icon-512x512.png'),
							sizes: '512x512',
							type: 'image/png',
							purpose: 'maskable'
						}
				]
			},
			workbox: {
				// 预缓存的文件类型
				globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
				// 运行时缓存策略
				runtimeCaching: [
					{
						// 本地图片资源：缓存优先
						urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
						handler: 'CacheFirst',
						options: {
							cacheName: 'image-cache',
							expiration: {
								maxEntries: 100,
								maxAgeSeconds: 60 * 60 * 24 * 30 // 30 天
							}
						}
					},
					{
						// CDN 字体：缓存优先（长期稳定）
						urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com/,
						handler: 'CacheFirst',
						options: {
							cacheName: 'font-cache',
							expiration: {
								maxEntries: 20,
								maxAgeSeconds: 60 * 60 * 24 * 365 // 1 年
							}
						}
					},
					{
						// 占位图（picsum 等外部图片）：缓存优先
						urlPattern: /^https:\/\/picsum\.photos/,
						handler: 'CacheFirst',
						options: {
							cacheName: 'placeholder-image-cache',
							expiration: {
								maxEntries: 60,
								maxAgeSeconds: 60 * 60 * 24 * 7 // 7 天
							}
						}
					}
				]
			},
			devOptions: {
				// localhost 被浏览器视为安全域，无需 HTTPS 即可测试 PWA
				// type: 'module' 让 SW 以 ESM 方式运行，兼容 Vite 的 HMR
				enabled: true,
				type: 'module',
				navigateFallback: 'index.html'
			}
		})
	],
	optimizeDeps: {
		exclude: ['sard-uniapp'],
	},
	build: {
		minify: 'terser',
		terserOptions: {
			compress: {
				// 生产环境去除log语句和DBUG
				drop_console: process.env.NODE_ENV === 'production',
				drop_debugger: process.env.NODE_ENV === 'production'
			}
		}
	},
	// 开发服务器跨域配置
	server: {
		port: 8085,
		strictPort: true,
		open: true,
		proxy: {
			[`/${apiPrefix}`]: {
				target: requestUrl,
				changeOrigin: true,
				rewrite: (path : string) => path.replace(new RegExp(`^\/${apiPrefix}`), '')
			}
		}
	}
})
