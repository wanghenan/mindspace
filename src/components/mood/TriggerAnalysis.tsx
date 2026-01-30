import React from 'react'

interface TriggerAnalysisProps {
  triggers: {
    scenario: string
    frequency: number
  }[]
}

export const TriggerAnalysis: React.FC<TriggerAnalysisProps> = ({ triggers }) => {
  if (!triggers || triggers.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        暂无压力源数据
      </div>
    )
  }

  const maxFrequency = Math.max(...triggers.map(t => t.frequency))

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">压力源分析</h3>

      <div className="space-y-4">
        {triggers.map((trigger, index) => (
          <div key={`${trigger.scenario}-${index}`} className="relative">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">{trigger.scenario}</span>
              <span className="text-sm text-gray-500">{trigger.frequency}次</span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${(trigger.frequency / maxFrequency) * 100}%`,
                  backgroundColor: getBarColor(index),
                }}
              />
            </div>

            {index === 0 && (
              <span className="absolute -top-1 -right-2 text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">
                最高频
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          小贴士
        </h4>
        <p className="text-sm text-blue-700">
          识别压力源是情绪管理的第一步。当这些场景出现时，可以提前准备应对策略，
          或通过SOS功能快速缓解情绪。
        </p>
      </div>
    </div>
  )
}

function getBarColor(index: number): string {
  const colors = [
    '#EF4444',
    '#F97316',
    '#F59E0B',
    '#EAB308',
    '#84CC16',
  ]

  return colors[index % colors.length]
}
