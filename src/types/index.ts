// 用户数据类型
export interface UserData {
  userType?: 'grace' | 'chloe' | 'sophia'
  emotion?: string
  emotionText?: string
}

// SOS急救建议
export interface FirstAidSuggestion {
  empathy: string
  action: {
    type: 'breathing' | 'physical' | 'cognitive'
    name: string
    instruction: string
    animation?: string
  }
  duration: number
}

// 对话消息
export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  emotionTags?: string[]
}

// 对话会话
export interface Conversation {
  id: string
  messages: Message[]
  startTime: number
  endTime?: number
  emotionSummary?: string
}

// 情绪标签
export interface EmotionTag {
  id: string
  emoji: string
  text: string
  category: 'anger' | 'anxiety' | 'sadness' | 'overwhelm' | 'exhaustion' | 'other'
}

// 情绪周报数据
export interface MoodReport {
  id: string
  weekStart: string
  weekEnd: string
  moodChart: {
    date: string
    mood: number // 1-10
  }[]
  frequentWords: {
    word: string
    count: number
  }[]
  triggers: {
    scenario: string
    frequency: number
  }[]
  aiSummary: string
}
