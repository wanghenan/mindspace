interface ProtectedRouteProps {
  children: React.ReactNode
  requireLogin?: boolean
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children
}) => {
  return <>{children}</>
}
