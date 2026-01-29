import React from 'react'
import IconBase, { IconProps } from './IconBase'

const HomeIcon: React.FC<IconProps> = (props) => {
  return (
    <IconBase {...props} aria-label={props['aria-label'] || '首页'}>
      <path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z" fill="currentColor"/>
    </IconBase>
  )
}

export default HomeIcon