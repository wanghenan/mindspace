/**
 * Tencent Hunyuan Adapter
 *
 * Specific adapter for Tencent Hunyuan (混元) provider that extends the OpenAI-compatible base adapter.
 * Note: Hunyuan uses Tencent Cloud SDK and may require different configuration.
 */

import { OpenAICompatibleAdapter } from './OpenAICompatibleAdapter';

export class HunyuanAdapter extends OpenAICompatibleAdapter {
  constructor() {
    super({ provider: 'hunyuan' });
  }
}
