import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { useAppStore } from './store/useAppStore'
import { useUserStore } from './store/useUserStore'
import './index.css'

// 数据初始化组件
function DataInitializer({ children }: { children: React.ReactNode }) {
  const initializeApp = useAppStore(state => state.initializeApp)
  const initializeUser = useUserStore(state => state.initializeUser)
  
  React.useEffect(() => {
    initializeApp()
    initializeUser()
  }, [initializeApp, initializeUser])
  
  return <>{children}</>
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <DataInitializer>
        <App />
      </DataInitializer>
    </BrowserRouter>
  </React.StrictMode>,
)
