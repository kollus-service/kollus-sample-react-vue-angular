// Vue 앱 진입점: 전역 스타일을 불러오고 App 컴포넌트를 #app에 마운트한다.
import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
