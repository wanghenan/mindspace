import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { useAppStore } from './store/useAppStore'
import './index.css'

// 数据初始化组件
function DataInitializer({ children }: { children: React.ReactNode }) {
  const initializeApp = useAppStore(state => state.initializeApp)
  
  React.useEffect(() => {
    initializeApp()
  }, [initializeApp])
  
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
