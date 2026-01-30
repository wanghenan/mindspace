import React from 'react'

interface AISummaryProps {
  summary: string
  weekStart: string
  weekEnd: string
  isGenerating?: boolean
}

export const AISummary: React.FC<AISummaryProps> = ({
  summary,
  weekStart,
  weekEnd,
  isGenerating = false
}) => {
  if (isGenerating) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">AI 洞察与建议</h3>
        <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-100">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-purple-600 font-medium">MindSpace 正在分析...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">AI 洞察与建议</h3>
        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 text-gray-500 text-sm">
          暂无本周分析数据，请开始更多对话后查看
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">AI 洞察与建议</h3>
        <span className="text-xs text-gray-500">
          {weekStart} ~ {weekEnd}
        </span>
      </div>

      <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-100">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-purple-800 mb-1">本周情绪总结</h4>
            <p className="text-sm text-purple-700">
              MindSpace 分析了你的对话记录，为你生成了个性化的情绪洞察
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 mb-4">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {summary}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            继续对话
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium border border-purple-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            导出报告
          </button>
        </div>
      </div>
    </div>
  )
}
