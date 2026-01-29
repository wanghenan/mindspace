import React, { useState } from 'react'

export interface UserAvatarProps {
  src?: string
  alt: string
  initials?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base'
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  alt,
  initials,
  size = 'md',
  className = ''
}) => {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
    setImageError(false)
  }

  // 生成用户名首字母
  const getInitials = () => {
    if (initials) return initials
    
    const words = alt.split(' ')
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase()
    }
    return alt.slice(0, 2).toUpperCase()
  }

  const shouldShowImage = src && !imageError && imageLoaded
  const shouldShowInitials = !src || imageError || !imageLoaded

  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        rounded-full 
        overflow-hidden 
        flex 
        items-center 
        justify-center 
        bg-gradient-to-br 
        from-primary-400 
        to-secondary-400 
        text-white 
        font-semibold
        ${className}
      `}
      role="img"
      aria-label={alt}
    >
      {src && (
        <img
          src={src}
          alt={alt}
          onError={handleImageError}
          onLoad={handleImageLoad}
          className={`
            w-full h-full object-cover transition-opacity duration-200
            ${shouldShowImage ? 'opacity-100' : 'opacity-0'}
          `}
        />
      )}
      
      {shouldShowInitials && (
        <span 
          className={`
            transition-opacity duration-200
            ${shouldShowInitials ? 'opacity-100' : 'opacity-0'}
          `}
        >
          {getInitials()}
        </span>
      )}
    </div>
  )
}

export default UserAvatar