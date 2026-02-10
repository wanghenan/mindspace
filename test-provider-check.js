// 模拟 isProviderConfigured 逻辑
const AI_PROVIDERS = {
  openai: { requiresApiKey: true },
  zhipu: { requiresApiKey: true },
  gemini: { requiresApiKey: true },
  deepseek: { requiresApiKey: true },
  alibaba: { requiresApiKey: true },
  minimax: { requiresApiKey: true },
  grok: { requiresApiKey: true },
  hunyuan: { requiresApiKey: false }
};

// 模拟 getApiKey - 当没有配置时
const getApiKey = (provider) => {
  return { key: '', source: 'none' };
};

const isProviderConfigured = (provider) => {
  const { key } = getApiKey(provider);

  if (AI_PROVIDERS[provider].requiresApiKey === false) {
    console.log(`${provider}: requiresApiKey is false, returning true`);
    return true;
  }

  const result = !!key;
  console.log(`${provider}: key="${key}", result=${result}`);
  return result;
};

console.log('Testing isProviderConfigured with empty key:\n');

// 测试所有提供商
Object.keys(AI_PROVIDERS).forEach(provider => {
  isProviderConfigured(provider);
});
