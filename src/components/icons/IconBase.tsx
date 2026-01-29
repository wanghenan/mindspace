import React from 'react'

export interface IconProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  'aria-label'?: string
}

interface IconBaseProps extends IconProps {
  children: React.ReactNode
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8'
}

const IconBase: React.FC<IconBaseProps> = ({ 
  size = 'md', 
  className = '', 
  'aria-label': ariaLabel,
  children 
}) => {
  return (
    <svg
      className={`${sizeClasses[size]} ${className}`}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-label={ariaLabel}
      role={ariaLabel ? 'img' : 'presentation'}
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  )
}

export default IconBase