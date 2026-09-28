// React 앱 진입점: 전역 스타일을 불러오고 App 컴포넌트를 #root에 StrictMode로 마운트한다.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
