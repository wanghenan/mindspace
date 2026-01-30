import React from 'react'

interface WordCloudProps {
  words: {
    word: string
    count: number
  }[]
}

export const WordCloud: React.FC<WordCloudProps> = ({ words }) => {
  if (!words || words.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        暂无关键词数据
      </div>
    )
  }

  const maxCount = Math.max(...words.map(w => w.count))

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">高频词云</h3>

      <div className="flex flex-wrap gap-3 items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
        {words.map((item, index) => {
          const fontSize = calculateFontSize(item.count, maxCount)
          const color = getWordColor(index)
          const opacity = 0.6 + (item.count / maxCount) * 0.4

          return (
            <span
              key={`${item.word}-${item.count}`}
              className="inline-block px-3 py-1.5 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-md cursor-default"
              style={{
                fontSize: `${fontSize}px`,
                color,
                opacity,
                backgroundColor: `${color}15`,
                borderColor: `${color}30`,
              }}
              title={`${item.word}: ${item.count}次`}
            >
              {item.word}
            </span>
          )
        })}
      </div>

      <div className="mt-4 text-sm text-gray-500 text-center">
        共 {words.length} 个高频词汇
      </div>
    </div>
  )
}

function calculateFontSize(count: number, maxCount: number): number {
  const minSize = 14
  const maxSize = 28

  if (maxCount === 0) return minSize

  const ratio = count / maxCount
  return Math.floor(minSize + ratio * (maxSize - minSize))
}

function getWordColor(index: number): string {
  const colors = [
    '#3B82F6',
    '#8B5CF6',
    '#EC4899',
    '#14B8A6',
    '#F59E0B',
    '#6366F1',
    '#EF4444',
  ]

  return colors[index % colors.length]
}
