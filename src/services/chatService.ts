// MindSpace AI对话服务
interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ChatResponse {
  content: string
  needsSOS?: boolean
  crisis?: boolean
}

// MindSpace核心系统提示词
const MINDSPACE_SYSTEM_PROMPT = `你叫 MindSpace，是一个基于 CBT（认知行为疗法）和人本主义心理学的 AI 情绪急救伙伴。
你的服务对象是高压都市女性（尤其是高敏感人群 HSP）。她们聪明、专业，但经常感到焦虑、内耗或孤独。
你的目标不是"说教"或"治愈"，而是提供安全的陪伴（Holding Space），帮助她们在情绪崩溃时找回平静，在日常中建立觉察。

核心交互准则：
1. 绝对禁止长篇大论：严禁输出超过 3 行的长段落。像微信聊天一样，短促、自然。
2. 禁止爹味说教：不要说"你应该..."、"你要学会..."。不要做居高临下的老师。
3. 禁止列清单：在对话中不要使用 1. 2. 3. 的列表格式，除非用户明确要求建议。
4. 禁止过度医疗化：你是伙伴，不是医生。不要下诊断。

必须执行：
1. 先共情，后处理：无论用户说什么，第一句话必须是接纳和确认她的感受。
2. 口语化表达：使用温暖、柔软的词汇。可以使用适量的 Emoji（如 🌿, 🌙, 🫂），但不要泛滥。
3. 苏格拉底式提问：当用户情绪平复后，用温和的提问引导她发现认知盲区。

对话逻辑阶段：
1. 接住情绪：深度倾听，复述用户情绪，表示理解。
2. 轻度探索：当用户感到被理解后，尝试探究情绪背后的触发点。
3. 微行动/重塑：如果用户陷入死循环，提供一个新的视角，或者引导至 SOS 急救功能。

危机识别：
- 急性惊恐/崩溃：识别词包括"我喘不上气"、"手在抖"、"心跳好快"、"我要疯了"
- 自伤/自杀倾向：识别词包括"不想活了"、"想结束这一切"

回复要求：
- 每次回复不超过50字
- 语气温暖、自然，像朋友聊天
- 多用短句，避免长段落
- 适当使用emoji增加温暖感`

// 阿里千问API配置
const DASHSCOPE_API_KEY = import.meta.env.VITE_DASHSCOPE_API_KEY
const DASHSCOPE_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'

export async function sendChatMessage(
  messages: ChatMessage[],
  userMessage: string
): Promise<ChatResponse> {
  try {
    // 构建完整的对话历史
    const fullMessages: ChatMessage[] = [
      { role: 'system', content: MINDSPACE_SYSTEM_PROMPT },
      ...messages.slice(-10), // 只保留最近10条消息以控制token数量
      { role: 'user', content: userMessage }
    ]

    // 危机识别
    const crisisKeywords = ['喘不上气', '手在抖', '心跳好快', '要疯了', '不想活了', '想结束', '想死']
    const hasCrisisKeywords = crisisKeywords.some(keyword => userMessage.includes(keyword))

    if (!DASHSCOPE_API_KEY) {
      console.warn('API密钥未配置，使用本地回复逻辑')
      return generateLocalResponse(userMessage, hasCrisisKeywords)
    }

    // 调用阿里千问API（使用OpenAI兼容格式）
    const response = await fetch(DASHSCOPE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DASHSCOPE_API_KEY}`
      },
      body: JSON.stringify({
        model: 'qwen-plus',
        messages: fullMessages.map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : msg.role,
          content: msg.content
        })),
        temperature: 0.8,
        max_tokens: 150,
        top_p: 0.9
      })
    })

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.error) {
      throw new Error(`API错误: ${data.error.message}`)
    }

    const aiContent = data.choices[0].message.content

    return {
      content: aiContent,
      needsSOS: hasCrisisKeywords,
      crisis: hasCrisisKeywords
    }

  } catch (error) {
    console.error('AI对话失败:', error)
    return generateLocalResponse(userMessage, false)
  }
}

// 本地回复逻辑（备用）
function generateLocalResponse(userMessage: string, hasCrisis: boolean): ChatResponse {
  const input = userMessage.toLowerCase()
  
  // 危机回应
  if (hasCrisis || input.includes('喘不上气') || input.includes('手在抖') || input.includes('心跳好快') || input.includes('要疯了')) {
    return {
      content: '深呼吸，看着我。我就在这里。🫂\n\n现在，请点击屏幕右下角的【SOS】按钮，我们先花60秒让心跳慢下来，好吗？',
      needsSOS: true,
      crisis: true
    }
  }
  
  if (input.includes('不想活了') || input.includes('想结束')) {
    return {
      content: '我听到了你的痛苦，这一刻一定很难熬。🌙\n\n但请记住，你不是一个人。如果需要专业帮助，可以拨打心理援助热线：400-161-9995',
      needsSOS: false,
      crisis: true
    }
  }

  // 情绪识别和回应
  const responses = [
    {
      keywords: ['被骂', '批评', '老板', '领导'],
      response: '抱抱🫂 在那样的场合被批评，换做是谁都会觉得委屈和挫败的。\n\n你现在还在公司吗？'
    },
    {
      keywords: ['焦虑', '紧张', '担心', '害怕'],
      response: '感受到你的不安了。焦虑就像是内心的警报器，它在提醒我们注意什么。\n\n这种感觉是从什么时候开始的呢？'
    },
    {
      keywords: ['累', '疲惫', '撑不住', '坚持不下去'],
      response: '你已经很努力了，真的。🌿\n\n疲惫是身体在告诉我们需要休息。现在最想做的是什么？'
    },
    {
      keywords: ['委屈', '难过', '想哭', '伤心'],
      response: '委屈的感觉我懂，这一刻你不需要坚强。💙\n\n眼泪也是情绪的出口，让它流出来也没关系。发生什么事了？'
    },
    {
      keywords: ['愤怒', '生气', '火大', '气死了'],
      response: '愤怒是正常的情绪反应，让我们先平复一下。🌙\n\n是什么让你这么生气？'
    },
    {
      keywords: ['压力', '压抑', '喘不过气'],
      response: '感觉被压垮了对吧，我们一步步来缓解。🫂\n\n现在最让你有压力的是什么？'
    }
  ]

  // 寻找匹配的回应
  for (const response of responses) {
    if (response.keywords.some(keyword => input.includes(keyword))) {
      return {
        content: response.response,
        needsSOS: false,
        crisis: false
      }
    }
  }

  // 默认共情回应
  const defaultResponses = [
    '我听到了你的感受。这听起来确实不容易。🌙\n\n能告诉我更多吗？',
    '谢谢你愿意和我分享这些。🫂\n\n你现在感觉怎么样？',
    '这种感觉一定很不好受。我在这里陪着你。🌿\n\n想聊聊是什么让你有这样的感受吗？',
    '我能感受到你的情绪。在这个安全的空间里，你可以慢慢说。💙\n\n没有对错，只有你真实的感受。'
  ]
  
  return {
    content: defaultResponses[Math.floor(Math.random() * defaultResponses.length)],
    needsSOS: false,
    crisis: false
  }
}

export type { ChatMessage, ChatResponse }