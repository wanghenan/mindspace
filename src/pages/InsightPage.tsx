import React, { useEffect, useState, useMemo } from 'react'
import { useConversations } from '../store/chatStore'
import { useAppStore } from '../store/useAppStore'
import { motion } from 'framer-motion'

// 情绪类型中英文映射
const EMOTION_LABELS: Record<string, { label: string; emoji: string }> = {
  anxiety: { label: '焦虑', emoji: '😰' },
  anger: { label: '愤怒', emoji: '😤' },
  sadness: { label: '悲伤', emoji: '😢' },
  panic: { label: '惊恐', emoji: '😨' },
  overwhelm: { label: '过载', emoji: '😵' },
  exhaustion: { label: '疲惫', emoji: '😴' },
  未知情绪: { label: '待分析', emoji: '❓' }
}

// 颜色配置
const EMOTION_COLORS: Record<string, string> = {
  anxiety: '#F59E0B',
  anger: '#EF4444',
  sadness: '#3B82F6',
  panic: '#8B5CF6',
  overwhelm: '#EC4899',
  exhaustion: '#6B7280'
}

interface InsightStats {
  totalEmotions: number
  totalConversations: number
  totalMessages: number
  avgIntensity: number
  dominantEmotion: string
  sosCount: number
  avgEffectiveness: number
}

// 纯 CSS 饼图组件
const CSSPieChart: React.FC<{ data: { name: string; value: number; color: string }[] }> = ({ data }) => {
  const total = data.reduce((acc, item) => acc + item.value, 0)
  if (total === 0) return null

  let cumulativePercent = 0

  const slices = data.map((item) => {
    const percent = (item.value / total) * 100
    const startAngle = cumulativePercent * 3.6
    cumulativePercent += percent
    const endAngle = cumulativePercent * 3.6
    return { ...item, startAngle, endAngle, percent }
  })

    // 使用 conic-gradient 实现饼图
    const gradientParts = slices.map((slice) => {
      return `${slice.color} ${slice.startAngle}deg ${slice.endAngle}deg`
    })

  return (
    <div className="flex items-center gap-4">
      <div
        className="w-32 h-32 rounded-full"
        style={{
          background: `conic-gradient(${gradientParts.join(', ')})`
        }}
      />
      <div className="flex-1 space-y-2">
        {slices.map((slice) => (
          <div key={slice.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: slice.color }}
              />
              <span style={{ color: 'var(--text-primary)' }}>{slice.name}</span>
            </div>
            <span style={{ color: 'var(--text-secondary)' }}>{slice.value}次</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// 纯 CSS 横向柱状图
const CSSBarChart: React.FC<{ data: { range: string; count: number; color: string }[] }> = ({ data }) => {
  const maxCount = Math.max(...data.map(d => d.count), 1)

  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const width = (item.count / maxCount) * 100
        return (
          <div key={index}>
            <div className="flex justify-between text-sm mb-1">
              <span style={{ color: 'var(--text-primary)' }}>{item.range}</span>
              <span style={{ color: 'var(--text-secondary)' }}>{item.count}次</span>
            </div>
            <div
              className="h-6 rounded-lg overflow-hidden"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${width}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="h-full rounded-lg"
                style={{ backgroundColor: item.color }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// 纯 CSS 柱状图（用于趋势）
const TrendBarChart: React.FC<{ data: { date: string; avgIntensity: number; count: number }[] }> = ({ data }) => {
  const maxIntensity = 10

  return (
    <div className="flex items-end justify-between gap-2 h-40">
      {data.map((item, index) => {
        const height = item.count > 0 ? (item.avgIntensity / maxIntensity) * 100 : 5
        return (
          <div key={index} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t transition-all"
              style={{
                height: `${height}%`,
                backgroundColor: item.count > 0 ? 'var(--accent)' : 'var(--bg-tertiary)',
                minHeight: item.count > 0 ? '4px' : '2px'
              }}
            />
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {item.date.replace('月', '/').replace('日', '')}
            </span>
          </div>
        )
      })}
    </div>
  )
}

const InsightPage: React.FC = () => {
  const conversations = useConversations()
  const emotionHistory = useAppStore(state => state.emotionHistory)
  const [stats, setStats] = useState<InsightStats | null>(null)
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week')

  // 计算统计数据
  useEffect(() => {
    if (conversations.length === 0 && emotionHistory.length === 0) {
      setStats(null)
      return
    }

    const now = Date.now()
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000
    const cutoff = timeRange === 'week' ? weekAgo : monthAgo

    // 过滤时间范围内的数据
    const filteredEmotions = emotionHistory.filter(e => e.timestamp >= cutoff)
    const filteredConversations = conversations.filter(c => c.startTime >= cutoff)

    // 计算对话消息数
    const totalMessages = filteredConversations.reduce(
      (acc, conv) => acc + conv.messages.length, 0
    )

    // 计算平均强度
    const avgIntensity = filteredEmotions.length > 0
      ? filteredEmotions.reduce((acc, e) => acc + (e.intensity || 0), 0) / filteredEmotions.length
      : 0

    // 找出主导情绪
    const emotionCount: Record<string, number> = {}
    filteredEmotions.forEach(e => {
      const key = e.emotion || '未知情绪'
      emotionCount[key] = (emotionCount[key] || 0) + 1
    })
    const dominantEmotion = Object.entries(emotionCount)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '无数据'

    // 计算SOS次数和平均效果
    const sosRecords = filteredEmotions.filter(e => e.copingMethod?.includes('sos'))
    const avgEffectiveness = sosRecords.length > 0
      ? sosRecords.reduce((acc, e) => acc + (e.effectiveness || 0), 0) / sosRecords.length
      : 0

    setStats({
      totalEmotions: filteredEmotions.length,
      totalConversations: filteredConversations.length,
      totalMessages,
      avgIntensity: Math.round(avgIntensity * 10) / 10,
      dominantEmotion,
      sosCount: sosRecords.length,
      avgEffectiveness: Math.round(avgEffectiveness * 10) / 10
    })
  }, [conversations, emotionHistory, timeRange])

  // 情绪分布数据
  const emotionDistribution = useMemo(() => {
    const now = Date.now()
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000
    const cutoff = timeRange === 'week' ? weekAgo : now - 30 * 24 * 60 * 60 * 1000

    const filteredEmotions = emotionHistory.filter(e => e.timestamp >= cutoff)
    const distribution: Record<string, number> = {}

    filteredEmotions.forEach(e => {
      const key = e.emotion || '未知情绪'
      distribution[key] = (distribution[key] || 0) + 1
    })

    return Object.entries(distribution).map(([emotion, count]) => ({
      name: EMOTION_LABELS[emotion]?.label || emotion,
      value: count,
      color: EMOTION_COLORS[emotion] || '#6B7280'
    }))
  }, [emotionHistory, timeRange])

  // 情绪强度分布
  const intensityDistribution = useMemo(() => {
    const now = Date.now()
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000
    const cutoff = timeRange === 'week' ? weekAgo : now - 30 * 24 * 60 * 60 * 1000

    const filteredEmotions = emotionHistory.filter(e => e.timestamp >= cutoff)
    
    // 按强度分组: 1-3轻微, 4-6中等, 7-8严重, 9-10极度
    return [
      { range: '1-3 轻微', count: 0, color: '#10B981' },
      { range: '4-6 中等', count: 0, color: '#F59E0B' },
      { range: '7-8 严重', count: 0, color: '#EF4444' },
      { range: '9-10 极度', count: 0, color: '#8B5CF6' }
    ].map(item => {
      filteredEmotions.forEach(e => {
        const intensity = e.intensity || 0
        if (intensity <= 3 && item.range === '1-3 轻微') item.count++
        else if (intensity >= 4 && intensity <= 6 && item.range === '4-6 中等') item.count++
        else if (intensity >= 7 && intensity <= 8 && item.range === '7-8 严重') item.count++
        else if (intensity >= 9 && item.range === '9-10 极度') item.count++
      })
      return item
    })
  }, [emotionHistory, timeRange])

  // 最近7天的情绪记录
  const recentEmotions = useMemo(() => {
    const now = Date.now()
    const days: Record<string, { date: string; avgIntensity: number; count: number }> = {}

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000)
      const dateKey = `${date.getMonth() + 1}月${date.getDate()}日`
      days[dateKey] = { date: dateKey, avgIntensity: 0, count: 0 }
    }

    emotionHistory.forEach(e => {
      const date = new Date(e.timestamp)
      const dateKey = `${date.getMonth() + 1}月${date.getDate()}日`
      if (days[dateKey]) {
        days[dateKey].avgIntensity = (days[dateKey].avgIntensity * days[dateKey].count + e.intensity) / (days[dateKey].count + 1)
        days[dateKey].count++
      }
    })

    return Object.values(days)
  }, [emotionHistory])

  // 判断是否有数据
  const hasData = conversations.length > 0 || emotionHistory.length > 0

  // 格式化时间范围标签
  const getTimeRangeLabel = () => {
    const now = new Date()
    if (timeRange === 'week') {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - now.getDay())
      return `${weekStart.getMonth() + 1}月${weekStart.getDate()}日 - ${now.getMonth() + 1}月${now.getDate()}日`
    }
    return `${now.getMonth() + 1}月1日 - ${now.getMonth() + 1}月${now.getDate()}日`
  }

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto px-4 pt-6">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            情绪洞察
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            了解你的情绪模式，陪伴你成长
          </p>
        </motion.div>

        {/* 时间范围切换 */}
        {hasData && (
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-between mb-6"
          >
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {getTimeRangeLabel()}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setTimeRange('week')}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: timeRange === 'week' ? 'var(--accent)' : 'var(--bg-secondary)',
                  color: timeRange === 'week' ? 'white' : 'var(--text-primary)'
                }}
              >
                本周
              </button>
              <button
                onClick={() => setTimeRange('month')}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: timeRange === 'month' ? 'var(--accent)' : 'var(--bg-secondary)',
                  color: timeRange === 'month' ? 'white' : 'var(--text-primary)'
                }}
              >
                本月
              </button>
            </div>
          </motion.div>
        )}

        {!hasData ? (
          /* 空状态 */
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center py-16 rounded-2xl"
            style={{ backgroundColor: 'var(--bg-card)' }}
          >
            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <span className="text-4xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              还没有数据
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              开始记录情绪或与 MindSpace 对话，积累数据后即可查看洞察
            </p>
          </motion.div>
        ) : (
          /* 有数据时的展示 */
          <div className="space-y-6">
            {/* 概览统计卡片 */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-card)' }}>
                <div className="text-2xl mb-1">💬</div>
                <div className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
                  {stats?.totalConversations || 0}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>对话次数</div>
              </div>
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-card)' }}>
                <div className="text-2xl mb-1">💭</div>
                <div className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
                  {stats?.totalEmotions || 0}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>情绪记录</div>
              </div>
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-card)' }}>
                <div className="text-2xl mb-1">🆘</div>
                <div className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
                  {stats?.sosCount || 0}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>急救次数</div>
              </div>
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-card)' }}>
                <div className="text-2xl mb-1">💙</div>
                <div className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
                  {stats?.avgEffectiveness?.toFixed(1) || '-'}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>急救效果</div>
              </div>
            </motion.div>

            {/* 最近7天情绪趋势 */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-xl"
              style={{ backgroundColor: 'var(--bg-card)' }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                📈 最近7天情绪记录
              </h3>
              {recentEmotions.some(d => d.count > 0) ? (
                <TrendBarChart data={recentEmotions} />
              ) : (
                <div className="text-center py-8 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  本周还没有情绪记录
                </div>
              )}
            </motion.div>

            {/* 情绪分布和强度分布 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 情绪类型分布 */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-xl"
                style={{ backgroundColor: 'var(--bg-card)' }}
              >
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  🎭 情绪类型分布
                </h3>
                {emotionDistribution.length > 0 ? (
                  <CSSPieChart data={emotionDistribution} />
                ) : (
                  <div className="text-center py-8 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    暂无情绪类型数据
                  </div>
                )}
              </motion.div>

              {/* 情绪强度分布 */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="p-6 rounded-xl"
                style={{ backgroundColor: 'var(--bg-card)' }}
              >
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  📊 情绪强度分布
                </h3>
                {intensityDistribution.some(d => d.count > 0) ? (
                  <CSSBarChart data={intensityDistribution} />
                ) : (
                  <div className="text-center py-8 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    暂无强度分布数据
                  </div>
                )}
              </motion.div>
            </div>

            {/* 主导情绪和建议 */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="p-6 rounded-xl"
              style={{ backgroundColor: 'var(--accent-light)' }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--accent)' }}>
                  <span className="text-2xl">💡</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    本期洞察
                  </h3>
                  <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {stats && stats.dominantEmotion && stats.dominantEmotion !== '无数据' ? (
                      <p>
                        你主要的情绪状态是
                        <span className="font-medium mx-1" style={{ color: 'var(--accent)' }}>
                          {EMOTION_LABELS[stats.dominantEmotion]?.label || stats.dominantEmotion}
                          {EMOTION_LABELS[stats.dominantEmotion]?.emoji || ''}
                        </span>
                        ，共记录了
                        <span className="font-medium mx-1">
                          {emotionHistory.filter(e => e.emotion === stats.dominantEmotion).length}
                        </span>
                        次。
                      </p>
                    ) : (
                      <p>开始记录情绪后，这里会显示你的情绪洞察。</p>
                    )}
                    {stats && stats.avgIntensity > 0 && (
                      <p>
                        平均情绪强度为
                        <span className="font-medium mx-1" style={{ color: 'var(--accent)' }}>
                          {stats.avgIntensity}/10
                        </span>
                        。
                      </p>
                    )}
                    {stats && stats.sosCount && stats.sosCount > 0 && (
                      <p>
                        你已经使用了
                        <span className="font-medium mx-1" style={{ color: 'var(--accent)' }}>
                          {stats.sosCount}次
                        </span>
                        情绪急救，平均效果评分
                        <span className="font-medium mx-1" style={{ color: 'var(--accent)' }}>
                          {stats.avgEffectiveness?.toFixed(1)}/5
                        </span>
                        。
                      </p>
                    )}
                    <p className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                      记住，情绪波动是正常的。MindSpace 会一直陪伴着你。🌙
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 最近的情绪记录列表 */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="p-6 rounded-xl"
              style={{ backgroundColor: 'var(--bg-card)' }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                📝 最近的情绪记录
              </h3>
              {emotionHistory.length > 0 ? (
                <div className="space-y-3">
                  {emotionHistory.slice(0, 5).map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-3 rounded-lg"
                      style={{ backgroundColor: 'var(--bg-secondary)' }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">
                          {EMOTION_LABELS[record.emotion]?.emoji || '📌'}
                        </span>
                        <div>
                          <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                            {EMOTION_LABELS[record.emotion]?.label || record.emotion || '未分类'}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                            {new Date(record.timestamp).toLocaleString('zh-CN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
                          强度 {record.intensity}/10
                        </div>
                        {record.trigger && (
                          <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                            {record.trigger.slice(0, 15)}{record.trigger.length > 15 ? '...' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  暂无情绪记录，开始记录后会在此显示
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default InsightPage
