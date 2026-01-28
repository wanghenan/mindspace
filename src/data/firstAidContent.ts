import { FirstAidSuggestion } from '../types'

// 情绪类型映射
export type EmotionType = 
  | 'anger'      // 愤怒
  | 'panic'      // 惊恐
  | 'sadness'    // 委屈/悲伤
  | 'overwhelm'  // 耗尽/过载
  | 'anxiety'    // 焦虑
  | 'exhaustion' // 疲惫

// 急救内容库
export const firstAidContent: Record<EmotionType, FirstAidSuggestion> = {
  anger: {
    empathy: '愤怒是身体在告诉你，有什么东西越过了你的边界。这种感受是正常的，也是值得被看见的。',
    action: {
      type: 'physical',
      name: '推墙释放法',
      instruction: '站起来，双手用力推墙10秒，感受手臂和肩膀的紧张，然后慢慢放松。重复3次。',
      animation: 'push-wall'
    },
    duration: 60
  },
  panic: {
    empathy: '心跳加速、呼吸急促，这是身体在保护你。现在，让我们先让身体慢下来。',
    action: {
      type: 'breathing',
      name: '4-7-8呼吸法',
      instruction: '用鼻子吸气4秒，屏住呼吸7秒，然后用嘴巴呼气8秒。重复4次。',
      animation: 'breathing-478'
    },
    duration: 60
  },
  sadness: {
    empathy: '委屈和难过都是真实的感受，它们需要被看见和接纳。这一刻，你不需要坚强。',
    action: {
      type: 'cognitive',
      name: '蝴蝶拥抱法',
      instruction: '双手交叉放在胸前，像拥抱自己。左右手轮流轻拍肩膀，每侧4次，感受温暖和安全感。',
      animation: 'butterfly-hug'
    },
    duration: 60
  },
  overwhelm: {
    empathy: '当大脑被太多信息填满时，我们需要先清空，再重新开始。',
    action: {
      type: 'physical',
      name: '冷水刺激法',
      instruction: '用冷水冲洗手腕30秒，感受水流的温度。然后闭上眼睛，深呼吸3次。',
      animation: 'cold-water'
    },
    duration: 60
  },
  anxiety: {
    empathy: '焦虑是大脑在预警，但很多时候它预警的是"可能性"，而不是"现实"。',
    action: {
      type: 'breathing',
      name: '盒式呼吸法',
      instruction: '吸气4秒，屏住4秒，呼气4秒，再屏住4秒。想象一个正方形，沿着每条边呼吸。重复5次。',
      animation: 'box-breathing'
    },
    duration: 60
  },
  exhaustion: {
    empathy: '你已经很累了。这一刻，允许自己停下来，不需要再做什么。',
    action: {
      type: 'cognitive',
      name: '身体扫描',
      instruction: '闭上眼睛，从脚趾开始，慢慢感受身体的每一部分。感受哪些地方紧张，哪些地方放松。',
      animation: 'body-scan'
    },
    duration: 60
  }
}

// 根据情绪文本匹配情绪类型
export function matchEmotionType(emotionText: string): EmotionType {
  const text = emotionText.toLowerCase()
  
  if (text.includes('愤怒') || text.includes('生气') || text.includes('恼火')) {
    return 'anger'
  }
  if (text.includes('惊恐') || text.includes('害怕') || text.includes('恐惧') || text.includes('心跳')) {
    return 'panic'
  }
  if (text.includes('委屈') || text.includes('难过') || text.includes('悲伤') || text.includes('想哭')) {
    return 'sadness'
  }
  if (text.includes('过载') || text.includes('炸了') || text.includes('太多') || text.includes('转不动')) {
    return 'overwhelm'
  }
  if (text.includes('焦虑') || text.includes('担心') || text.includes('不安')) {
    return 'anxiety'
  }
  if (text.includes('累') || text.includes('疲惫') || text.includes('耗尽')) {
    return 'exhaustion'
  }
  
  // 默认返回焦虑（最常见的情绪）
  return 'anxiety'
}

// 获取急救内容
export function getFirstAidContent(emotionType: EmotionType): FirstAidSuggestion {
  return firstAidContent[emotionType] || firstAidContent.anxiety
}
