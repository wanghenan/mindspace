import React from 'react'
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import type { MoodReport } from '../../types'

interface MoodChartProps {
  data: MoodReport['moodChart']
}

export const MoodChart: React.FC<MoodChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        暂无情绪数据
      </div>
    )
  }

  const chartData = data.map((item) => ({
    date: item.date,
    mood: item.mood,
    emoji: getMoodEmoji(item.mood)
  }))

  const averageMood = data.reduce((sum, item) => sum + item.mood, 0) / data.length

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">情绪气象图</h3>
        <div className="text-sm text-gray-600">
          平均情绪值: <span className="font-bold text-blue-600">{averageMood.toFixed(1)}</span>/10
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis
            domain={[0, 10]}
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                    <p className="text-sm text-gray-600">{data.date}</p>
                    <p className="text-lg font-semibold flex items-center gap-2">
                      {data.emoji} {data.mood}/10
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Area
            type="monotone"
            dataKey="mood"
            stroke="#3B82F6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorMood)"
          />
          <Line
            type="monotone"
            dataKey="mood"
            stroke="#2563EB"
            strokeWidth={2}
            dot={{ fill: '#2563EB', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 flex justify-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
          <span>8-10 心情很好</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <span>5-7 一般</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <span>1-4 心情低落</span>
        </div>
      </div>
    </div>
  )
}

function getMoodEmoji(mood: number): string {
  if (mood >= 8) return '😊'
  if (mood >= 6) return '🙂'
  if (mood >= 4) return '😐'
  if (mood >= 2) return '😔'
  return '😢'
}
