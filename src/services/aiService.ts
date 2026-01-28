// AI服务层 - 集成阿里千问模型
interface EmotionAnalysisInput {
  intensity: string
  bodyFeelings: string[]
  customInput: string
}

interface EmotionAnalysisResult {
  emotionType: 'anger' | 'panic' | 'sadness' | 'overwhelm' | 'anxiety' | 'exhaustion'
  confidence: number
  reasoning: string
  suggestions: string[]
  empathyMessage: string
}

// 阿里千问API配置
const DASHSCOPE_API_KEY = import.meta.env.VITE_DASHSCOPE_API_KEY
const DASHSCOPE_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation'

// 检查API密钥是否配置
if (!DASHSCOPE_API_KEY) {
  console.warn('⚠️ DASHSCOPE_API_KEY 未配置，将使用备用分析逻辑')
}

// 情绪分析系统提示词
const EMOTION_ANALYSIS_PROMPT = `你是MindSpace的AI情绪分析专家，专门帮助高压职业女性进行情绪急救。

请根据用户提供的信息，分析她的情绪状态并提供急救建议。

分析维度：
1. 情绪强度：mild(轻微) / moderate(中等) / severe(严重) / extreme(极度)
2. 身体感受：heartbeat(心跳快), shaking(手发抖), angry(想发火), crying(想哭), tired(很累), chest(胸口闷), headache(头很痛), nausea(想吐)
3. 用户描述：具体的情况说明

情绪类型定义：
- anger: 愤怒，通常伴随想发火、肌肉紧张
- panic: 惊恐，通常伴随心跳快、手发抖、胸闷
- sadness: 委屈/悲伤，通常伴随想哭、情绪低落
- overwhelm: 过载，通常伴随头痛、胸闷、想吐
- anxiety: 焦虑，通常伴随心跳快、担心、不安
- exhaustion: 疲惫，通常伴随很累、无力感

请以JSON格式返回分析结果：
{
  "emotionType": "情绪类型",
  "confidence": 0.85,
  "reasoning": "分析推理过程",
  "empathyMessage": "温暖的共情话语，不超过30字"
}

要求：
1. 共情话语要温暖、简洁，体现理解和支持
2. 推理过程要基于提供的信息，逻辑清晰
3. 置信度要根据信息完整度和匹配度给出
4. 语气要专业但温暖，避免医疗化表达`

export async function analyzeEmotion(input: EmotionAnalysisInput): Promise<EmotionAnalysisResult> {
  try {
    // 构建用户输入描述
    const intensityMap = {
      mild: '轻微不适',
      moderate: '中等难受', 
      severe: '很痛苦',
      extreme: '极度痛苦'
    }

    const bodyFeelingMap = {
      heartbeat: '心跳加速',
      shaking: '手部颤抖',
      angry: '想要发火',
      crying: '想要哭泣',
      tired: '身体疲惫',
      chest: '胸闷气短',
      headache: '头部疼痛',
      nausea: '恶心想吐'
    }

    const userDescription = `
情绪强度: ${intensityMap[input.intensity as keyof typeof intensityMap]}
身体感受: ${input.bodyFeelings.map(f => bodyFeelingMap[f as keyof typeof bodyFeelingMap]).join('、')}
详细描述: ${input.customInput || '无'}
    `.trim()

    // 调用阿里千问API
    const response = await fetch(DASHSCOPE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
        'X-DashScope-SSE': 'disable'
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        input: {
          messages: [
            {
              role: 'system',
              content: EMOTION_ANALYSIS_PROMPT
            },
            {
              role: 'user', 
              content: userDescription
            }
          ]
        },
        parameters: {
          temperature: 0.3,
          max_tokens: 500,
          top_p: 0.8
        }
      })
    })

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.code) {
      throw new Error(`API错误: ${data.message}`)
    }

    // 解析AI返回的JSON结果
    const aiResponse = data.output.choices[0].message.content
    let analysisResult: EmotionAnalysisResult

    try {
      const parsed = JSON.parse(aiResponse)
      analysisResult = {
        emotionType: parsed.emotionType || 'anxiety',
        confidence: parsed.confidence || 0.7,
        reasoning: parsed.reasoning || '基于提供的信息进行分析',
        suggestions: parsed.suggestions || [],
        empathyMessage: parsed.empathyMessage || '我理解你现在的感受，让我们一起来缓解这种不适'
      }
    } catch (parseError) {
      console.warn('AI返回格式解析失败，使用备用逻辑:', parseError)
      // 备用逻辑：基于规则匹配
      analysisResult = fallbackAnalysis(input)
    }

    return analysisResult

  } catch (error) {
    console.error('AI分析失败:', error)
    // 返回备用分析结果
    return fallbackAnalysis(input)
  }
}

// 备用分析逻辑（当AI服务不可用时）
function fallbackAnalysis(input: EmotionAnalysisInput): EmotionAnalysisResult {
  let emotionType: EmotionAnalysisResult['emotionType'] = 'anxiety'
  let empathyMessage = '我理解你现在的感受，让我们一起来缓解这种不适'

  // 基于身体感受的简单规则匹配
  if (input.bodyFeelings.includes('angry')) {
    emotionType = 'anger'
    empathyMessage = '愤怒是正常的情绪反应，让我们先平复一下'
  } else if (input.bodyFeelings.includes('heartbeat') || input.bodyFeelings.includes('shaking')) {
    emotionType = 'panic'
    empathyMessage = '感受到你的紧张，我们先让身体放松下来'
  } else if (input.bodyFeelings.includes('crying')) {
    emotionType = 'sadness'
    empathyMessage = '委屈的感觉我懂，这一刻你不需要坚强'
  } else if (input.bodyFeelings.includes('tired')) {
    emotionType = 'exhaustion'
    empathyMessage = '你已经很累了，现在是时候照顾自己'
  } else if (input.bodyFeelings.includes('chest') || input.bodyFeelings.includes('headache')) {
    emotionType = 'overwhelm'
    empathyMessage = '感觉被压垮了对吧，我们一步步来缓解'
  }

  return {
    emotionType,
    confidence: 0.6,
    reasoning: '基于身体感受和情绪强度的规则匹配分析',
    suggestions: [],
    empathyMessage
  }
}

// 导出类型定义
export type { EmotionAnalysisInput, EmotionAnalysisResult }