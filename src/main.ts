import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import naive from 'naive-ui'
import './styles/local-fonts.css'
import './styles/interknot-ui-system.css'
import './styles/cyberpunk-common.css'
import './styles/cyberpunk-enhanced.css'
import { generateDemoData } from './utils/demoData'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(naive)

// 生成演示数据
// ⚠️ 安全提示：演示数据包含默认账户和弱密码，仅用于开发环境
// 生产环境部署前请确保：
// 1. 禁用或删除演示数据生成
// 2. 修改所有默认密码
// 3. 启用密码强度验证
if (import.meta.env.DEV) {
  generateDemoData()
}

app.mount('#app')
