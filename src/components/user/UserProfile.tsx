import React, { useState } from 'react'
import UserAvatar from './UserAvatar'

export interface UserData {
  id: string
  name: string
  email: string
  avatar?: string
  initials?: string
}

export interface UserProfileProps {
  user: UserData
  isCollapsed?: boolean
  className?: string
}

const UserProfile: React.FC<UserProfileProps> = ({
  user,
  isCollapsed = false,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={`
        flex items-center p-3 rounded-lg cursor-pointer
        transition-all duration-300 ease-in-out transform
        hover:scale-105 active:scale-95
        ${isHovered 
          ? 'bg-gradient-to-r from-neutral-100 to-neutral-50 shadow-lg' 
          : 'hover:bg-gradient-to-r hover:from-neutral-50 hover:to-neutral-25'
        }
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={`用户信息: ${user.name}${user.email ? `, ${user.email}` : ''}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          // 这里可以添加用户菜单打开逻辑
        }
      }}
    >
      <div className="relative">
        <UserAvatar
          src={user.avatar}
          alt={user.name}
          initials={user.initials}
          size="md"
          className={`flex-shrink-0 transition-all duration-300 ${
            isHovered ? 'shadow-lg ring-2 ring-primary-200 ring-opacity-50' : ''
          }`}
        />
        {isHovered && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
        )}
      </div>
      
      {!isCollapsed && (
        <div className="ml-3 flex-1 min-w-0" aria-hidden="false">
          <div 
            className={`text-sm font-medium text-neutral-900 truncate transition-all duration-300 ${
              isHovered ? 'text-primary-700' : ''
            }`}
            aria-label={`用户名: ${user.name}`}
          >
            {user.name}
          </div>
          {user.email && (
            <div 
              className={`text-xs text-neutral-500 truncate transition-all duration-300 ${
                isHovered ? 'text-primary-500' : ''
              }`}
              aria-label={`邮箱: ${user.email}`}
            >
              {user.email}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default UserProfile