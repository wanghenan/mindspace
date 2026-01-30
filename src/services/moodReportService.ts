import type { MoodReport, Conversation } from '../types'

export function generateMoodReport(conversations: Conversation[]): MoodReport {
  const weekStart = getWeekStart()
  const weekEnd = getWeekEnd()

  const moodChart = analyzeMoodTrends(conversations, weekStart, weekEnd)
  const frequentWords = extractFrequentWords(conversations, weekStart, weekEnd)
  const triggers = identifyTriggers(conversations, weekStart, weekEnd)
  const aiSummary = generateAISummary(moodChart, frequentWords, triggers)

  return {
    id: `report_${Date.now()}`,
    weekStart,
    weekEnd,
    moodChart,
    frequentWords,
    triggers,
    aiSummary
  }
}

function getWeekStart(): string {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const weekStart = new Date(now)

  weekStart.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  weekStart.setHours(0, 0, 0, 0)

  return formatDate(weekStart)
}

function getWeekEnd(): string {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const weekEnd = new Date(now)

  weekEnd.setDate(now.getDate() + (dayOfWeek === 0 ? 0 : 7 - dayOfWeek))
  weekEnd.setHours(23, 59, 59, 999)

  return formatDate(weekEnd)
}

function formatDate(date: Date): string {
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
}

function analyzeMoodTrends(
  conversations: Conversation[],
  weekStart: string,
  weekEnd: string
): MoodReport['moodChart'] {
  const moodData: MoodReport['moodChart'] = []

  const startDate = parseDate(weekStart)
  const endDate = parseDate(weekEnd)

  const dailyMoods = new Map<string, number[]>()

  for (const conv of conversations) {
    const convDate = new Date(conv.startTime)
    if (convDate >= startDate && convDate <= endDate) {
      const dateKey = formatDate(convDate)
      const mood = calculateConversationMood(conv)

      if (!dailyMoods.has(dateKey)) {
        dailyMoods.set(dateKey, [])
      }
      dailyMoods.get(dateKey)!.push(mood)
    }
  }

  const dates = Array.from(dailyMoods.keys()).sort()

  for (const date of dates) {
    const moods = dailyMoods.get(date)!
    const avgMood = moods.reduce((sum, m) => sum + m, 0) / moods.length
    moodData.push({
      date,
      mood: Math.round(avgMood * 10) / 10
    })
  }

  return moodData
}

function extractFrequentWords(
  conversations: Conversation[],
  weekStart: string,
  weekEnd: string
): MoodReport['frequentWords'] {
  const wordCount = new Map<string, number>()

  const startDate = parseDate(weekStart)
  const endDate = parseDate(weekEnd)

  const stopWords = new Set([
    '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一',
    '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有',
    '看', '好', '自己', '这'
  ])

  for (const conv of conversations) {
    const convDate = new Date(conv.startTime)
    if (convDate >= startDate && convDate <= endDate) {
      for (const msg of conv.messages) {
        if (msg.role === 'user') {
          const words = msg.content
            .split(/[\s,.!?;:，。！？；：]/)
            .filter(word => word.length >= 2 && !stopWords.has(word))

          for (const word of words) {
            wordCount.set(word, (wordCount.get(word) || 0) + 1)
          }
        }
      }
    }
  }

  const wordArray = Array.from(wordCount.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15)

  return wordArray
}

function identifyTriggers(
  conversations: Conversation[],
  weekStart: string,
  weekEnd: string
): MoodReport['triggers'] {
  const triggerCount = new Map<string, number>()

  const startDate = parseDate(weekStart)
  const endDate = parseDate(weekEnd)

  const triggerPatterns = [
    { regex: /工作|老板|同事|会议|项目/g, label: '工作场景' },
    { regex: /家庭|父母|孩子|老公|老婆/g, label: '家庭关系' },
    { regex: /朋友|社交|聚会|聊天/g, label: '社交场合' },
    { regex: /钱|花销|预算|账单/g, label: '财务压力' },
    { regex: /累|困|失眠|熬夜/g, label: '身体疲惫' },
    { regex: /不知道|不确定|迷茫/g, label: '迷茫不确定' },
    { regex: /被批评|被骂|委屈/g, label: '被批评指责' },
    { regex: /焦虑|担心|害怕|紧张/g, label: '焦虑紧张' },
  ]

  for (const conv of conversations) {
    const convDate = new Date(conv.startTime)
    if (convDate >= startDate && convDate <= endDate) {
      for (const msg of conv.messages) {
        if (msg.role === 'user') {
          for (const pattern of triggerPatterns) {
            if (pattern.regex.test(msg.content)) {
              triggerCount.set(pattern.label, (triggerCount.get(pattern.label) || 0) + 1)
            }
          }
        }
      }
    }
  }

  const triggers = Array.from(triggerCount.entries())
    .map(([scenario, frequency]) => ({ scenario, frequency }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5)

  return triggers
}

function calculateConversationMood(conv: Conversation): number {
  if (conv.messages.length === 0) return 5

  const negativeKeywords = [
    '难过', '伤心', '委屈', '痛苦', '难受', '糟糕', '讨厌', '愤怒',
    '生气', '崩溃', '绝望', '焦虑', '担心', '害怕', '恐惧', '累', '疲惫'
  ]

  const positiveKeywords = [
    '开心', '快乐', '高兴', '满意', '喜欢', '好', '不错', '还行',
    '平静', '放松', '舒服', '开心', '希望'
  ]

  let score = 5

  for (const msg of conv.messages) {
    if (msg.role === 'user') {
      for (const neg of negativeKeywords) {
        if (msg.content.includes(neg)) {
          score -= 0.5
        }
      }

      for (const pos of positiveKeywords) {
        if (msg.content.includes(pos)) {
          score += 0.3
        }
      }
    }
  }

  const avgMood = Math.max(1, Math.min(10, score))

  return avgMood
}

function generateAISummary(
  moodChart: MoodReport['moodChart'],
  frequentWords: MoodReport['frequentWords'],
  triggers: MoodReport['triggers']
): string {
  const avgMood = moodChart.length > 0
    ? moodChart.reduce((sum, item) => sum + item.mood, 0) / moodChart.length
    : 5

  let summary = `这周你的平均情绪值是 ${avgMood.toFixed(1)}/10。\n\n`

  if (avgMood >= 7) {
    summary += '整体来看，你的情绪状态比较平稳和积极。'
  } else if (avgMood >= 5) {
    summary += '这周情绪起伏不大，有些小波折是正常的。'
  } else {
    summary += '这周感觉压力较大，辛苦你了。'
  }

  if (triggers.length > 0) {
    summary += `\n主要压力来源：${triggers.slice(0, 3).map(t => t.scenario).join('、')}。`
  }

  if (frequentWords.length > 0) {
    summary += `\n这周你经常提到：${frequentWords.slice(0, 5).map(w => w.word).join('、')}。`
  }

  summary += '\n\n建议：\n'

  if (avgMood < 6) {
    summary += '多关注自己的情绪变化，遇到困难时及时倾诉或使用SOS功能。\n'
  }

  if (triggers.some(t => t.scenario === '工作场景')) {
    summary += '工作压力较大时，尝试在工作间隙进行短暂的呼吸练习。\n'
  }

  if (frequentWords.some(w => ['焦虑', '担心', '害怕'].includes(w.word))) {
    summary += '焦虑是大脑的保护机制，试着区分"可能性"和"现实"。\n'
  }

  summary += '记住，你已经在很努力地管理情绪了。MindSpace 会一直陪伴着你。✨'

  return summary
}

function parseDate(dateStr: string): Date {
  const match = dateStr.match(/(\d+)月(\d+)日/)
  if (!match) return new Date()

  const month = parseInt(match[1]) - 1
  const day = parseInt(match[2])
  const now = new Date()
  return new Date(now.getFullYear(), month, day)
}
