import { defineConfig, loadEnv } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量（读取 VITE_ES_BASE_URL 作为代理目标）
  const env = loadEnv(mode, process.cwd())

  return {
    build: {
      // 开发阶段启用源码映射：https://uniapp.dcloud.net.cn/tutorial/migration-to-vue3.html#需主动开启-sourcemap
      sourcemap: process.env.NODE_ENV === 'development',
    },
    plugins: [uni()],
    server: {
      // ES 搜索服务代理（VITE_ES_BASE_URL 默认为 http://localhost:8081）
      proxy: {
        '/esProduct': {
          target: env.VITE_ES_BASE_URL || 'http://localhost:8081',
          changeOrigin: true,
        },
      },
    },
  }
})
