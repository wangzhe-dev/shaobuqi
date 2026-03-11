import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import AutoImport from 'unplugin-auto-import/vite'
import { requestUrl, apiPrefix } from './src/config'

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