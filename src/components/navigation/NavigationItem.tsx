import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export interface NavigationItemProps {
  icon: React.ComponentType<{ size?: 'sm' | 'md' | 'lg'; className?: string; 'aria-label'?: string }>
  label: string
  href: string
  isActive?: boolean
  onClick?: () => void
  className?: string
}

const NavigationItem: React.FC<NavigationItemProps> = ({
  icon: Icon,
  label,
  href,
  isActive,
  onClick,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  
  // 自动检测活跃状态
  const active = isActive !== undefined ? isActive : location.pathname === href

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      navigate(href)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick()
    }
  }

  return (
    <div className="relative group">
      <button
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          flex items-center justify-center w-full px-4 py-3 rounded-lg 
          transition-all duration-300 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
          transform hover:scale-105 active:scale-95
          ${active 
            ? 'bg-gradient-to-r from-primary-100 to-primary-50 text-primary-700 shadow-lg' 
            : 'text-neutral-600 hover:bg-gradient-to-r hover:from-neutral-100 hover:to-neutral-50 hover:text-neutral-900 hover:shadow-md'
          }
          ${isHovered && !active ? 'shadow-lg' : ''}
          ${className}
        `}
        aria-label={`导航到${label}`}
        tabIndex={0}
        title={label}
      >
        <Icon 
          size="md" 
          className={`transition-all duration-300 ease-in-out transform
            ${active ? 'text-primary-600 scale-110' : 'text-current hover:scale-105'}
          `}
          aria-label={label}
        />
      </button>
      
      {/* 悬停时显示的文字提示 */}
      <div className={`
        absolute left-full ml-2 px-2 py-1 bg-neutral-800 text-white text-sm rounded-md
        whitespace-nowrap z-50 pointer-events-none
        transition-all duration-200 ease-in-out
        ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}
      `}>
        {label}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-neutral-800 rotate-45"></div>
      </div>
    </div>
  )
}

export default NavigationItem