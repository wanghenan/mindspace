import { EmotionType, matchEmotionType, getFirstAidContent } from '../data/firstAidContent'
import { FirstAidSuggestion } from '../types'

/**
 * 根据用户输入的情绪文本，生成急救建议
 */
export function generateFirstAidSuggestion(emotionText: string): FirstAidSuggestion {
  const emotionType = matchEmotionType(emotionText)
  return getFirstAidContent(emotionType)
}

/**
 * 根据明确的情绪类型，获取急救内容
 */
export function getFirstAidByType(emotionType: EmotionType): FirstAidSuggestion {
  return getFirstAidContent(emotionType)
}
