import React, { useEffect, useState } from 'react'
import { useConversations } from '../store/chatStore'
import { generateMoodReport } from '../services/moodReportService'
import type { MoodReport } from '../types'
import { MoodChart } from '../components/mood/MoodChart'
import { WordCloud } from '../components/mood/WordCloud'
import { TriggerAnalysis } from '../components/mood/TriggerAnalysis'
import { AISummary } from '../components/mood/AISummary'

const InsightPage: React.FC = () => {
  const conversations = useConversations()
  const [report, setReport] = useState<MoodReport | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (conversations && conversations.length > 0) {
      setIsGenerating(true)

      setTimeout(() => {
        const newReport = generateMoodReport(conversations)
        setReport(newReport)
        setIsGenerating(false)
      }, 1500)
    }
  }, [conversations])

  const hasData = conversations && conversations.length > 0

  return (
    <div className="p-4 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">情绪洞察</h1>
          <p className="text-gray-600 text-sm">
            了解你的情绪模式，找到压力的源头
          </p>
        </div>

        {!hasData && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">还没有数据</h3>
            <p className="text-gray-600 mb-6">
              开始与 MindSpace 对话，积累更多数据后即可查看情绪周报
            </p>
            <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
              开始对话
            </button>
          </div>
        )}

        {hasData && report && (
          <div className="space-y-6">
            <AISummary
              summary={report.aiSummary}
              weekStart={report.weekStart}
              weekEnd={report.weekEnd}
              isGenerating={isGenerating}
            />

            <MoodChart data={report.moodChart} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <WordCloud words={report.frequentWords} />
              <TriggerAnalysis triggers={report.triggers} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default InsightPage
