const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 3000, // 프론트엔드 port
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // 백엔드 url
        changeOrigin: true, // 원본 요청의 호스트를 타겟 URL로 변경
      }
    }
  },
})