import React from 'react'
import IconBase, { IconProps } from './IconBase'

const AnalyticsIcon: React.FC<IconProps> = (props) => {
  return (
    <IconBase {...props} aria-label={props['aria-label'] || '洞察'}>
      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor"/>
    </IconBase>
  )
}

export default AnalyticsIcon