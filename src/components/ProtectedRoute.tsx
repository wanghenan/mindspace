import { Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireLogin?: boolean
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireLogin = true
}) => {
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null)

  useEffect(() => {
    // 检查用户登录状态
    const checkLoginStatus = () => {
      const registered = localStorage.getItem('mindspace_is_registered')
      setIsRegistered(!!registered)
    }

    checkLoginStatus()
  }, [])

  // 加载中显示空白或加载指示器
  if (isRegistered === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center" style={{ color: 'var(--text-secondary)' }}>
          加载中...
        </div>
      </div>
    )
  }

  // 需要登录但未登录
  if (requireLogin && !isRegistered) {
    return <Navigate to="/account" replace />
  }

  return <>{children}</>
}
