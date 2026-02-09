# 多模型 AI 提供商集成工作计划

## TL;DR

> **Quick Summary**: 实现 MindSpace 应用对 7 个 AI 提供商（OpenAI, Zhipu, Gemini, DeepSeek, Alibaba, MiniMax, Grok）的统一接入，通过适配器模式封装 API 差异，提供设置页面 UI 让用户配置 API 密钥并选择模型。
>
> **Deliverables**:
> - 适配器基础架构（3 类适配器）
> - 7 个提供商的适配器实现
> - 设置页面 UI（提供商选择、密钥配置、模型选择）
> - 状态管理扩展（模型管理、密钥验证）
> - 错误处理和重试机制
> - 完整的测试套件
>
> **Estimated Effort**: Medium（4-7 天）
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 1 → Task 2 → Task 5 → Task 10

---

## Context

### Original Request
用户希望在 MindSpace 项目中支持多个大模型 API，让用户可以按需使用各自的大模型 API key，但每家大模型接入方式不同，需要一个方便的方案来接入并选择模型。

### Scope Change: Hunyuan Removed
**Hunyuan (腾讯混元) 已移除**：由于 CORS 限制（Hunyuan API 不支持直接浏览器调用，需要服务器端代理），出于架构简洁性考虑，当前版本仅支持 7 个 AI 提供商。如后续需要支持，可通过服务器端代理架构实现。

### Interview Summary
**Key Discussions**:
- **管理方式**: 用户确认使用"设置页面 UI" 来管理 API 密钥
- **模型选择粒度**: 用户确认需要"模型级别"选择，每个提供商显示可用模型列表
- **存储方式**: 用户确认"本地存储（localStorage）即可"
- **技术方案**: 用户同意"方案 1：适配器模式 + SDK 统一接口"

**Research Findings**:
- **5/7 提供商完全兼容 OpenAI 格式**（OpenAI, Zhipu, DeepSeek, Alibaba, Grok）：可直接使用 OpenAI SDK
- **1 个提供商需要轻微适配**（MiniMax）：需过滤响应字段
- **1 个提供商需要完全自定义**（Google Gemini）：格式完全不同，使用原生 fetch
- **所有提供商都支持 SSE 流式响应**
- **认证方式统一**：都是 `Authorization: Bearer <API_KEY>`

### Metis Review
**Identified Gaps** (addressed):
- **关键问题 10 个**：认证流程、速率限制、成本追踪、模型列表、降级行为、连接测试、API 版本管理、默认提供商、健康状态指示器
- **Guardrails**：明确排除 OAuth、计费集成、provider-specific 功能、服务端存储、自动切换
- **Scope Creep 锁定**：多轮对话记忆、function calling、图像生成、音频、成本仪表板、团队凭证共享
- **未验证假设**：用户理解定价差异、所有 API 从所有区域可访问（CORS 风险）、中国提供商可能有区域限制
- **缺失验收标准**：连接健康检查、模型下拉动态填充、用户友好错误消息、表单验证、性能指标、可访问性
- **边缘情况**：Gemini API key 格式、MiniMax 响应过滤、阿里云区域端点、智谱 API 变更、Grok 可用性、并发切换、网络中断、速率限制、CORS 限制

**CORS Risk Flagged**:
> ⚠️ **技术风险**: 某些中国提供商（Alibaba, Zhipu, MiniMax）可能对直接浏览器 API 调用有 CORS 限制。**Task 1 必须验证所有 7 个提供商的 CORS 策略**。如有限制，需要明确解决策略。

---

## Work Objectives

### Core Objective
实现多模型 AI 提供商的统一接入，让用户可以通过设置页面 UI 配置 API 密钥并选择不同提供商的模型，无需修改核心业务逻辑。

### Concrete Deliverables
- **适配器基础架构**: `AIProviderAdapter` 接口 + `AdapterFactory` 工厂类
- **7 个适配器实现**: OpenAI（参考）+ 5 个 OpenAI 兼容 + 1 个自定义（Gemini）+ 1 个过滤（MiniMax）
- **设置页面 UI**: 提供商选择器、API 密钥输入（带验证）、模型选择器
- **状态管理扩展**: `aiConfigStore` 添加模型管理和密钥验证
- **错误处理**: 统一错误处理、重试策略、用户友好提示
- **测试套件**: 单元测试、集成测试、E2E 测试

### Definition of Done
- [ ] 所有 7 个提供商的适配器实现完成并通过测试
- [ ] 设置页面 UI 实现，用户可以选择提供商、输入密钥、选择模型
- [ ] API 密钥验证功能工作正常（格式检查 + 连接测试）
- [x] 聊天页面显示当前使用的模型信息
- [ ] 错误处理覆盖所有已知错误场景（401, 429, 500 等）
- [ ] 所有测试通过（单元测试 ≥80% 覆盖率，集成测试全部通过）
- [ ] 文档更新（README、API 文档、用户指南）

### Must Have
- **7 个提供商接入**: OpenAI, Zhipu, Gemini, DeepSeek, Alibaba, MiniMax, Grok
- **API 密钥管理**: 输入、验证、保存、隐藏显示
- **模型选择**: 每个提供商显示其可用模型列表
- **错误处理**: 用户友好的错误提示和重试机制
- **类型安全**: 完整的 TypeScript 类型定义

### Must NOT Have (Guardrails)
- **OAuth 认证**: 仅使用 API Key Bearer token
- **计费/成本集成**: 不追踪用量或费用
- **Function Calling / Tools**: 仅实现 chat completions
- **服务端存储**: 仅使用 localStorage
- **自动故障切换**: 失败时需要用户手动切换
- **Provider-specific 功能**: Vision, Fine-tuning, Audio 等（仅 text chat）
- **提供商自动切换**: 不实现跨提供商自动切换
- **Web Workers**: API 调用在主线程
- **Provider 缓存**: 响应是 stateless

**Scope Boundaries (Explicit Exclusions)**:
- ❌ 多轮对话记忆管理（仅实现单次请求上下文）
- ❌ Function calling / tools（仅 text generation）
- ❌ 图像生成（DALL-E 等）
- ❌ 音频（转录/合成）
- ❌ 成本仪表板/用量追踪
- ❌ 团队工作空间凭证共享
- ❌ Anthropic (Claude)（不在 7 个提供商列表中）
- ❌ Ollama/本地模型
- ❌ Azure OpenAI

---

## Verification Strategy (MANDATORY)

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks in this plan MUST be verifiable WITHOUT any human action.
> This is NOT conditional — it applies to EVERY task.
>
> **FORBIDDEN** — acceptance criteria that require:
> - "User manually tests..." / "用户手动测试..."
> - "User visually confirms..." / "用户用眼睛确认..."
> - "User interacts with..." / "用户直接交互..."
> - "Ask user to verify..." / "要求用户验证..."
> - ANY step where a human must perform an action

### Test Decision
- **Infrastructure exists**: YES (项目已有 Vitest 配置)
- **Automated tests**: YES (Tests-after)
- **Framework**: vitest (已配置)

### If TDD Enabled

**Task Structure**:
1. **RED**: 写测试 → FAIL
2. **GREEN**: 实现功能 → PASS
3. **REFACTOR**: 重构 → 保持 PASS

**Test Setup Task**:
- [ ] Task 0: 验证测试基础设施
  - 运行: `bun test --help` → 显示帮助信息
  - 验证: `bun test src/__tests__/example.test.ts` → 1 test passes

### Agent-Executed QA Scenarios (MANDATORY — ALL tasks)

> 所有任务必须包含 Agent-Executed QA Scenarios。
> - **With TDD**: QA 场景补充单元测试的集成/E2E 级别验证
> - **Without TDD**: QA 场景是主要验证方法

**Verification Tool by Deliverable Type**:

| Type | Tool | How Agent Verifies |
|------|------|-------------------|
| **Frontend/UI** | Playwright (playwright skill) | Navigate, interact, assert DOM, screenshot |
| **API/Backend** | Bash (curl) | Send requests, parse responses, assert fields |
| **Library/Module** | Bash (bun/node REPL) | Import, call functions, compare output |
| **Config/Infra** | Bash (shell commands) | Apply config, run state checks, validate |

**Each Scenario MUST Follow This Format**:

```
Scenario: [Descriptive name]
  Tool: [Playwright / Bash]
  Preconditions: [What must be true before this scenario runs]
  Steps:
    1. [Exact action with specific selector/command/endpoint]
    2. [Next action with expected intermediate state]
    3. [Assertion with exact expected value]
  Expected Result: [Concrete, observable outcome]
  Failure Indicators: [What would indicate failure]
  Evidence: [Screenshot path / output capture / response body path]
```

---

## Execution Strategy

### Parallel Execution Waves

**Wave 1 (Start Immediately)**:
- Task 1: CORS 验证（所有 7 个提供商）
- Task 2: 适配器基础架构
- Task 3: 模型配置文件

**Wave 2 (After Wave 1)**:
- Task 4: OpenAI 兼容适配器（6 个）
- Task 5: Gemini 自定义适配器
- Task 6: MiniMax 过滤适配器
- Task 7: 状态管理扩展

**Wave 3 (After Wave 2)**:
- Task 8: 设置页面 UI
- Task 9: ChatService 改造
- Task 10: 错误处理和重试
- Task 11: 测试套件

**Critical Path**: Task 1 → Task 2 → Task 5 → Task 10

**Parallel Speedup**: ~50% faster than sequential

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 4, 5, 6 | 2, 3 |
| 2 | None | 4, 5, 6 | 1, 3 |
| 3 | None | 4, 5, 6, 8 | 1, 2 |
| 4 | 1, 2 | 7, 9 | 5, 6 |
| 5 | 1, 2 | 7, 9 | 4, 6 |
| 6 | 1, 2 | 7, 9 | 4, 5 |
| 7 | 4, 5, 6 | 8, 9 | - |
| 8 | 3, 7 | 9 | 9, 10 |
| 9 | 4, 5, 6, 7 | - | 8, 10 |
| 10 | 2 | - | 8, 9 |
| 11 | All | - | - |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1, 2, 3 | task(category="unspecified-high", load_skills=["playwright"], run_in_background=false) for Task 1; task(category="quick", load_skills=[], run_in_background=false) for Tasks 2, 3 |
| 2 | 4, 5, 6, 7 | task(category="unspecified-high", load_skills=[], run_in_background=true) × 4 (parallel) |
| 3 | 8, 9, 10, 11 | task(category="visual-engineering", load_skills=["playwright"], run_in_background=false) for Task 8; task(category="quick", load_skills=[], run_in_background=true) for Tasks 9, 10, 11 |

---

## TODOs

### Wave 1: 基础设施和验证

- [x] 1. CORS 验证（所有 7 个提供商）

  **What to do**:
  - [ ] 为每个提供商编写 CORS 测试脚本
  - [ ] 验证从浏览器直接调用 API 是否可行
  - [ ] 记录每个提供商的 CORS 策略
  - [ ] 如有 CORS 限制，记录并标记为风险

  **Must NOT do**:
  - 不要假设所有提供商都支持直接浏览器调用
  - 不要在验证前开始适配器实现

  **Recommended Agent Profile**:
  > **Category**: `unspecified-high`
  > - **Reason**: 需要系统性测试 8 个不同的 API，每个都需要不同的验证逻辑
  > **Skills**: `["playwright"]`
  > - `playwright`: 需要在真实浏览器环境中测试 CORS，playwright 提供完整的浏览器上下文

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: Tasks 4, 5, 6（适配器实现依赖 CORS 验证结果）
  - **Blocked By**: None（可立即开始）

  **References** (CRITICAL - Be Exhaustive):

   **Provider API Endpoints** (用于 CORS 测试):
   - `https://api.openai.com/v1/models` - OpenAI models endpoint
   - `https://open.bigmodel.cn/api/paas/v4/models` - Zhipu models endpoint
   - `https://generativelanguage.googleapis.com/v1beta/models?key={key}` - Gemini models endpoint
   - `https://api.deepseek.com/v1/models` - DeepSeek models endpoint
   - `https://dashscope-intl.aliyuncs.com/compatible-mode/v1/models` - Alibaba models endpoint
   - `https://api.minimax.chat/v1/models` - MiniMax models endpoint
   - `https://api.x.ai/v1/models` - Grok models endpoint

  **Documentation References** (官方 CORS 文档):
  - `docs/AI_SETUP.md` - 项目现有 AI 配置文档
  - `https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS` - MDN CORS 文档
  - 各提供商官方文档（已在 research 中收集）

  **WHY Each Reference Matters**:
  - Provider endpoints: CORS 测试需要具体的 API 端点，每个提供商的 models endpoint 是最佳选择（GET 请求，无需复杂 body）
  - AI_SETUP.md: 了解项目现有的 AI 配置方式和可能已知的 CORS 问题
  - MDN CORS 文档: 理解 CORS 行为和错误消息

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY**

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Verify CORS for OpenAI from browser
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running on localhost:3000, valid OpenAI API key in .env
    Steps:
      1. Navigate to: http://localhost:3000/cors-test.html
      2. Open browser DevTools Console
      3. Execute: fetch('https://api.openai.com/v1/models', { headers: { 'Authorization': 'Bearer sk-test' } })
      4. Wait for response (timeout: 5s)
      5. Assert: No CORS error in console
      6. Assert: Response status is 401 (invalid key) or 200 (valid key), NOT network error
      7. Screenshot: .sisyphus/evidence/task-1-openai-cors.png
    Expected Result: Fetch succeeds (auth error is OK, CORS error is NOT OK)
    Evidence: .sisyphus/evidence/task-1-openai-cors.png

  Scenario: Verify CORS for Zhipu AI from browser
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, valid Zhipu API key
    Steps:
      1. Navigate to: http://localhost:3000/cors-test.html
      2. Execute: fetch('https://open.bigmodel.cn/api/paas/v4/models', { headers: { 'Authorization': 'Bearer test-key' } })
      3. Wait for response (timeout: 5s)
      4. Assert: No CORS error in console
      5. Assert: Response status is 401 or 200
      6. Screenshot: .sisyphus/evidence/task-1-zhipu-cors.png
    Expected Result: Fetch succeeds without CORS error
    Evidence: .sisyphus/evidence/task-1-zhipu-cors.png

  Scenario: Verify CORS for Gemini from browser
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running
    Steps:
      1. Navigate to: http://localhost:3000/cors-test.html
      2. Execute: fetch('https://generativelanguage.googleapis.com/v1beta/models?key=test-key')
      3. Wait for response (timeout: 5s)
      4. Assert: No CORS error in console
      5. Screenshot: .sisyphus/evidence/task-1-gemini-cors.png
    Expected Result: Fetch succeeds
    Evidence: .sisyphus/evidence/task-1-gemini-cors.png

  Scenario: Verify CORS for DeepSeek from browser
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running
    Steps:
      1. Navigate to: http://localhost:3000/cors-test.html
      2. Execute: fetch('https://api.deepseek.com/v1/models', { headers: { 'Authorization': 'Bearer test-key' } })
      3. Wait for response (timeout: 5s)
      4. Assert: No CORS error in console
      5. Screenshot: .sisyphus/evidence/task-1-deepseek-cors.png
    Expected Result: Fetch succeeds
    Evidence: .sisyphus/evidence/task-1-deepseek-cors.png

  Scenario: Verify CORS for Alibaba DashScope from browser
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running
    Steps:
      1. Navigate to: http://localhost:3000/cors-test.html
      2. Execute: fetch('https://dashscope-intl.aliyuncs.com/compatible-mode/v1/models', { headers: { 'Authorization': 'Bearer test-key' } })
      3. Wait for response (timeout: 5s)
      4. Assert: No CORS error in console
      5. Screenshot: .sisyphus/evidence/task-1-alibaba-cors.png
    Expected Result: Fetch succeeds
    Evidence: .sisyphus/evidence/task-1-alibaba-cors.png

   Scenario: Verify CORS for MiniMax from browser
     Tool: Playwright (playwright skill)
     Preconditions: Dev server running
     Steps:
       1. Navigate to: http://localhost:3000/cors-test.html
       2. Execute: fetch('https://api.minimax.chat/v1/models', { headers: { 'Authorization': 'Bearer test-key' } })
       3. Wait for response (timeout: 5s)
       4. Assert: No CORS error in console
       5. Screenshot: .sisyphus/evidence/task-1-minimax-cors.png
     Expected Result: Fetch succeeds
     Evidence: .sisyphus/evidence/task-1-minimax-cors.png

   Scenario: Verify CORS for Grok from browser
     Tool: Playwright (playwright skill)
     Preconditions: Dev server running
     Steps:
       1. Navigate to: http://localhost:3000/cors-test.html
       2. Execute: fetch('https://api.x.ai/v1/models', { headers: { 'Authorization': 'Bearer test-key' } })
       3. Wait for response (timeout: 5s)
       4. Assert: No CORS error in console
       5. Screenshot: .sisyphus/evidence/task-1-grok-cors.png
     Expected Result: Fetch succeeds
     Evidence: .sisyphus/evidence/task-1-grok-cors.png
   ```

  **Evidence to Capture**:
  - [ ] 7 个截图，每个提供商一个（`.sisyphus/evidence/task-1-{provider}-cors.png`）
  - [ ] CORS 验证报告 Markdown 文件（`.sisyphus/evidence/task-1-cors-report.md`）
  - [ ] 每个 provider 的 CORS 状态：✅ 支持 / ❌ 不支持 / ⚠️ 部分支持

  **Commit**: NO（Wait for Task 2）

 - [x] 2. 适配器基础架构

  **What to do**:
  - [ ] 创建 `src/types/adapter.ts`：定义 `AIProviderAdapter` 接口、`ChatRequest`、`ChatResponse` 等类型
  - [ ] 创建 `src/adapters/OpenAICompatibleAdapter.ts`：OpenAI SDK 通用适配器
  - [ ] 创建 `src/adapters/AdapterFactory.ts`：工厂类，根据 provider ID 返回对应适配器
  - [ ] 添加错误类型定义：`APIError`、`AdapterError`、`ConfigError`

  **Must NOT do**:
  - 不要实现具体的提供商适配器（在后续任务中）
  - 不要添加流式响应支持（在后续任务中）

  **Recommended Agent Profile**:
  > **Category**: `quick`
  > - **Reason**: 这是纯代码实现，任务明确，逻辑清晰，无复杂决策
  > **Skills**: 无需特殊技能

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: Tasks 4, 5, 6（适配器实现依赖基础架构）
  - **Blocked By**: None

  **References**:

  **Type Definitions** (现有项目类型):
  - `src/types/aiProvider.ts` - 现有的 AIProviderId 类型定义
  - `src/types/index.ts` - 项目通用类型定义

  **Adapter Pattern Documentation**:
  - `https://refactoring.guru/design-patterns/adapter` - Adapter Pattern 设计模式参考
  - `https://github.com/openai/openai-node` - OpenAI Node.js SDK 文档

  **Existing Code Patterns**:
  - `src/lib/aiKeyManager.ts:19-57` - `getApiKey()` 函数的模式（错误处理、返回值结构）
  - `src/services/chatService.ts` - 现有的聊天服务实现（了解需要适配的接口）

  **WHY Each Reference Matters**:
  - aiProvider.ts: 需要复用现有的 AIProviderId 类型，保持类型一致
  - index.ts: 遵循项目现有的代码风格和类型定义模式
  - aiKeyManager.ts: 参考现有的错误处理和返回值结构，保持代码风格一致
  - chatService.ts: 了解现有服务的接口，确保适配器能无缝集成

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY**

  **Tests**:
  - [ ] `bun test src/adapters/__tests__/OpenAICompatibleAdapter.test.ts` → PASS (5 tests)
  - [ ] `bun test src/adapters/__tests__/AdapterFactory.test.ts` → PASS (3 tests)
  - [ ] TypeScript 编译无错误：`tsc --noEmit`

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Import and use AIProviderAdapter interface
    Tool: Bash (Node.js REPL)
    Preconditions: Dependencies installed (npm install)
    Steps:
      1. node -e "import('./src/types/adapter.js').then(m => { const adapter = { chat: async () => ({ content: 'test', finishReason: 'stop', usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 } }) }; console.log('Interface OK'); })"
      2. Assert: Output contains "Interface OK"
      3. Assert: No TypeScript type errors
    Expected Result: Interface can be imported and implemented
    Evidence: Terminal output captured

  Scenario: Create OpenAI-compatible adapter instance
    Tool: Bash (Node.js REPL)
    Preconditions: OpenAI SDK installed (npm install openai)
    Steps:
      1. node -e "import('./src/adapters/OpenAICompatibleAdapter.js').then(m => { const adapter = new m.OpenAICompatibleAdapter('https://api.openai.com/v1', 'openai'); console.log('Adapter created:', adapter.constructor.name); })"
      2. Assert: Output contains "Adapter created: OpenAICompatibleAdapter"
    Expected Result: Adapter instance can be created
    Evidence: Terminal output captured

  Scenario: AdapterFactory returns correct adapter type
    Tool: Bash (Node.js REPL)
    Preconditions: All adapters registered
    Steps:
      1. node -e "import('./src/adapters/AdapterFactory.js').then(m => { const openai = m.AdapterFactory.getAdapter('openai'); const gemini = m.AdapterFactory.getAdapter('gemini'); console.log('OpenAI:', openai.constructor.name); console.log('Gemini:', gemini.constructor.name); })"
      2. Assert: Output contains "OpenAI: OpenAICompatibleAdapter"
      3. Assert: Output contains "Gemini: GeminiAdapter"
    Expected Result: Factory returns correct adapter instances
    Evidence: Terminal output captured

  Scenario: Type definitions are valid TypeScript
    Tool: Bash (TypeScript Compiler)
    Preconditions: TypeScript installed
    Steps:
      1. npx tsc --noEmit src/types/adapter.ts
      2. Assert: Exit code is 0 (no errors)
      3. Assert: No error messages in stderr
    Expected Result: TypeScript types compile without errors
    Evidence: Compiler output captured

  Scenario: AdapterFactory throws error for unsupported provider
    Tool: Bash (Node.js REPL)
    Preconditions: AdapterFactory loaded
    Steps:
      1. node -e "import('./src/adapters/AdapterFactory.js').then(m => { try { m.AdapterFactory.getAdapter('unsupported'); } catch (e) { console.log('Error:', e.message); } })"
      2. Assert: Output contains "Error: Unsupported provider: unsupported"
    Expected Result: Factory throws descriptive error
    Evidence: Terminal output captured
  ```

  **Evidence to Capture**:
  - [ ] 测试输出：`bun test` 结果
  - [ ] TypeScript 编译输出
  - [ ] 所有类型定义文件

  **Commit**: YES（with Task 3）
  - Message: `feat(adapter): add adapter base architecture`
  - Files: `src/types/adapter.ts`, `src/adapters/OpenAICompatibleAdapter.ts`, `src/adapters/AdapterFactory.ts`
  - Pre-commit: `bun test src/adapters/__tests__`

 - [x] 3. 模型配置文件

  **What to do**:
  - [ ] 创建 `src/config/models.ts`：定义每个提供商的可用模型列表
  - [ ] 为每个提供商创建精选模型列表（避免包含 beta/deprecated 模型）
  - [ ] 添加模型元数据：name, id, contextLength, supportsStreaming

  **Must NOT do**:
  - 不要包含 beta 或 preview 状态的模型
  - 不要包含已弃用的模型（如 gpt-3.5-turbo, text-davinci-003）
  - 不要添加模型自动发现功能（手动维护列表）

  **Recommended Agent Profile**:
  > **Category**: `quick`
  > - **Reason**: 配置文件编写，基于官方文档研究结果，无需复杂决策
  > **Skills**: 无需特殊技能

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: Tasks 4, 5, 6, 8（适配器和 UI 依赖模型配置）
  - **Blocked By**: None

  **References**:

  **Official Model Lists** (来自 research):
  - OpenAI Models: `https://platform.openai.com/docs/models` - gpt-4o, gpt-4o-mini, gpt-3.5-turbo (deprecated - exclude)
  - Zhipu Models: `https://docs.bigmodel.cn/cn/guide/start/model-overview.md` - glm-4.7, glm-4.7-flash, glm-4.6
  - Gemini Models: `https://ai.google.dev/gemini-api/docs/models` - gemini-3-pro-preview, gemini-3-flash-preview (gemini-2.0-flash-exp deprecated - exclude)
  - DeepSeek Models: `https://api-docs.deepseek.com/` - deepseek-chat, deepseek-reasoner
  - Alibaba Models: `https://www.alibabacloud.com/help/en/model-studio/compatibility-of-openai-with-dashscope` - qwen3-max, qwen-plus, qwen-flash
  - MiniMax Models: `https://platform.minimax.io/docs/guides/models-intro` - MiniMax-M2.1, MiniMax-M2.1-lightning (abab models deprecated - exclude)
  - Grok Models: `https://docs.x.ai/developers/models` - grok-4, grok-4-fast (grok-beta deprecated - exclude)
   - Hunyuan Models: 已移除（见计划变更说明）

  **Existing Configuration**:
  - `src/types/aiProvider.ts:17-90` - 现有的 PROVIDERS 配置结构
  - `src/config/providers.ts:23-88` - 现有的提供商配置模式

  **WHY Each Reference Matters**:
  - Official Model Lists: 确保模型列表准确、最新，不包含已弃用模型
  - Existing Config: 遵循项目现有的配置结构和命名约定

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY**

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Models config file is valid TypeScript
    Tool: Bash (TypeScript Compiler)
    Preconditions: TypeScript installed
    Steps:
      1. npx tsc --noEmit src/config/models.ts
      2. Assert: Exit code is 0 (no errors)
      3. Assert: No type errors in output
    Expected Result: Models config compiles without errors
    Evidence: Compiler output captured

  Scenario: All 8 providers have at least one model
    Tool: Bash (Node.js REPL)
    Preconditions: models.ts compiled to JS
    Steps:
      1. node -e "import('./src/config/models.js').then(m => { const providers = new Set(Object.values(m.PROVIDER_MODELS).flat().map(m => m.provider)); console.log('Providers:', Array.from(providers).sort()); console.log('Count:', providers.size); })"
      2. Assert: Output contains "Count: 8"
       3. Assert: Providers list includes: openai, zhipu, gemini, deepseek, alibaba, minimax, grok
    Expected Result: All 8 providers have models defined
    Evidence: Terminal output captured

  Scenario: No deprecated models are included
    Tool: Bash (grep)
    Preconditions: models.ts file exists
    Steps:
      1. grep -i "gpt-3.5-turbo\|text-davinci-003\|gemini-2.0-flash-exp\|abab6\|grok-beta" src/config/models.ts || echo "No deprecated models found"
      2. Assert: Output is "No deprecated models found" (exit code 0)
      3. Assert: No matches for deprecated model IDs
    Expected Result: Configuration excludes all known deprecated models
    Evidence: Grep output captured

  Scenario: Each model has required metadata fields
    Tool: Bash (Node.js REPL)
    Preconditions: models.ts compiled
    Steps:
      1. node -e "import('./src/config/models.js').then(m => { const models = Object.values(m.PROVIDER_MODELS).flat(); const hasAllFields = models.every(m => m.id && m.name && m.provider && m.supportsStreaming !== undefined); console.log('All models have required fields:', hasAllFields); })"
      2. Assert: Output is "All models have required fields: true"
    Expected Result: Every model has id, name, provider, supportsStreaming fields
    Evidence: Terminal output captured

  Scenario: Model IDs are unique across providers
    Tool: Bash (Node.js REPL)
    Preconditions: models.ts compiled
    Steps:
      1. node -e "import('./src/config/models.js').then(m => { const models = Object.values(m.PROVIDER_MODELS).flat(); const ids = models.map(m => m.id); const unique = new Set(ids); console.log('Total models:', ids.length, 'Unique IDs:', unique.size); })"
      2. Assert: Total models equals Unique IDs (no duplicates)
    Expected Result: No duplicate model IDs across all providers
    Evidence: Terminal output captured
  ```

  **Evidence to Capture**:
  - [ ] TypeScript 编译输出
  - [ ] 模型列表验证输出
  - [ ] 模型配置文件

  **Commit**: YES（with Task 2）
  - Message: `feat(config): add curated model lists for 8 providers`
  - Files: `src/config/models.ts`
  - Pre-commit: `bun test src/config/__tests__/models.test.ts`

### Wave 2: 适配器实现

- [x] 4. OpenAI 兼容适配器（5 个提供商）

  **What to do**:
  - [x] 为 OpenAI, Zhipu, DeepSeek, Alibaba, Grok 创建适配器实例
  - [x] 配置正确的 baseURL（参考官方文档）
  - [x] 实现 `chat()` 方法（非流式）
  - [x] 实现 `chatStream()` 方法（SSE 流式）
  - [x] 实现 `validateApiKey()` 方法

  **Must NOT do**:
  - ❌ 不要实现 MiniMax 适配器（它需要响应过滤，在 Task 6）
  - ❌ 不要实现 Gemini 适配器（它需要完全自定义，在 Task 5）
  - ❌ 不要实现 Hunyuan 适配器（已从范围中移除）

   **Recommended Agent Profile**:
   > **Category**: `unspecified-high`
   > - **Reason**: 需要实现 5 个相似的适配器，但每个提供商的 baseURL 和验证逻辑不同
  > **Skills**: 无需特殊技能，但需要仔细处理每个提供商的差异

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6, 7)
  - **Blocks**: Task 7（状态管理依赖适配器完成）
  - **Blocked By**: Tasks 1, 2, 3（CORS 验证、基础架构、模型配置）

  **References**:

   **BaseURL Configuration** (来自官方文档):
   - `src/types/aiProvider.ts:33` - OpenAI: `https://api.openai.com/v1`
   - `src/types/aiProvider.ts:41` - Zhipu: `https://open.bigmodel.cn/api/paas/v4`
   - `src/config/providers.ts:68` - DeepSeek: `https://api.deepseek.com/v1`
   - `src/config/models.ts` (Alibaba): `https://dashscope-intl.aliyuncs.com/compatible-mode/v1`
   - `src/config/providers.ts:50` - Grok: `https://api.x.ai/v1`

  **OpenAI SDK Usage**:
  - `https://github.com/openai/openai-node` - OpenAI Node.js SDK 文档
  - `src/adapters/OpenAICompatibleAdapter.ts` - Task 2 创建的通用适配器

  **API Key Validation** (参考现有实现):
  - `src/lib/aiKeyManager.ts:66-150` - `validateApiKey()` 函数的实现模式

  **WHY Each Reference Matters**:
  - BaseURL Configuration: 确保 baseURL 准确无误，这是适配器工作的基础
  - OpenAI SDK: 了解如何正确使用 OpenAI SDK（创建 client、调用 chat.completions）
  - aiKeyManager.ts: 参考现有的验证逻辑，保持一致

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY**

   **Tests**:
   - [ ] `bun test src/adapters/__tests__/OpenAIAdapter.test.ts` → PASS (5 tests)
   - [ ] `bun test src/adapters/__tests__/ZhipuAdapter.test.ts` → PASS (5 tests)
   - [ ] `bun test src/adapters/__tests__/DeepSeekAdapter.test.ts` → PASS (5 tests)
   - [ ] `bun test src/adapters/__tests__/AlibabaAdapter.test.ts` → PASS (5 tests)
   - [ ] `bun test src/adapters/__tests__/GrokAdapter.test.ts` → PASS (5 tests)

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: OpenAI adapter can send chat request
    Tool: Bash (curl)
    Preconditions: Server running, valid OpenAI API key
    Steps:
      1. curl -X POST http://localhost:3000/api/chat/openai \
           -H "Content-Type: application/json" \
           -d '{"messages":[{"role":"user","content":"test"}],"model":"gpt-4o-mini"}'
      2. Assert: HTTP status is 200
      3. Assert: response.content is a string
      4. Assert: response.finishReason is "stop"
      5. Assert: response.usage.totalTokens > 0
    Expected Result: OpenAI adapter returns valid chat response
    Evidence: Response body captured to .sisyphus/evidence/task-4-openai-response.json

  Scenario: Zhipu adapter validates API key correctly
    Tool: Bash (curl)
    Preconditions: Server running, invalid Zhipu API key
    Steps:
      1. curl -X POST http://localhost:3000/api/validate/zhipu \
           -H "Content-Type: application/json" \
           -d '{"apiKey":"invalid-key"}'
      2. Assert: HTTP status is 200
      3. Assert: response.valid is false
    Expected Result: Zhipu adapter correctly identifies invalid API key
    Evidence: Response body captured

  Scenario: DeepSeek adapter supports streaming
    Tool: Bash (curl)
    Preconditions: Server running, valid DeepSeek API key
    Steps:
      1. curl -X POST http://localhost:3000/api/chat/deepseek/stream \
           -H "Content-Type: application/json" \
           -d '{"messages":[{"role":"user","content":"say hello"}],"model":"deepseek-chat","stream":true}'
      2. Assert: Response is text/event-stream
      3. Assert: Output contains "data:" prefixed JSON chunks
      4. Assert: Final chunk is "data: [DONE]"
    Expected Result: DeepSeek adapter returns SSE stream
    Evidence: Stream output captured to .sisyphus/evidence/task-4-deepseek-stream.txt

  Scenario: Alibaba adapter uses correct baseURL
    Tool: Bash (curl verbose)
    Preconditions: Server running, valid Alibaba API key
    Steps:
      1. curl -v -X POST http://localhost:3000/api/chat/alibaba \
           -H "Content-Type: application/json" \
           -d '{"messages":[{"role":"user","content":"test"}],"model":"qwen-plus"}' 2>&1 | grep "POST"
      2. Assert: Output contains "POST /compatible-mode/v1/chat/completions"
      3. Assert: Host header contains "dashscope-intl.aliyuncs.com"
    Expected Result: Alibaba adapter calls correct endpoint
    Evidence: Curl verbose output captured

   Scenario: Grok adapter handles rate limiting (429)
     Tool: Bash (curl)
     Preconditions: Server running, Grok API rate limited
     Steps:
       1. for i in {1..20}; do curl -s -X POST http://localhost:3000/api/chat/grok -H "Content-Type: application/json" -d '{"messages":[],"model":"grok-4"}' & done; wait
       2. Check for 429 status in any response
       3. Assert: Error message contains "rate limit" or "429"
     Expected Result: Grok adapter handles rate limit gracefully
     Evidence: Error responses captured
   ```

   **Evidence to Capture**:
   - [ ] 5 个适配器的测试输出
   - [ ] 每个适配器的示例请求/响应（JSON 文件）
   - [ ] 流式响应示例（TXT 文件）

   **Commit**: YES（with Tasks 5, 6）
   - Message: `feat(adapters): implement OpenAI-compatible adapters for 5 providers`
   - Files: `src/adapters/OpenAIAdapter.ts`, `src/adapters/ZhipuAdapter.ts`, `src/adapters/DeepSeekAdapter.ts`, `src/adapters/AlibabaAdapter.ts`, `src/adapters/GrokAdapter.ts`
   - Pre-commit: `bun test src/adapters/__tests__`

- [x] 5. Gemini 自定义适配器

  **What to do**:
  - [ ] 创建 `src/adapters/GeminiAdapter.ts`
  - [ ] 实现消息格式转换（OpenAI messages → Gemini contents/parts）
  - [ ] 实现响应格式转换（Gemini format → OpenAI format）
  - [ ] 实现流式响应（SSE 解析）
  - [ ] 实现 API key 验证

  **Must NOT do**:
  - 不要使用 OpenAI SDK（Gemini 格式完全不兼容）
  - 不要实现 Vision 功能（仅 text chat）

  **Recommended Agent Profile**:
  > **Category**: `unspecified-high`
  > - **Reason**: Gemini 格式完全不同，需要自定义请求/响应转换逻辑，复杂度中等
  > **Skills**: 无需特殊技能，但需要仔细处理格式差异

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 6, 7)
  - **Blocks**: Task 7（状态管理依赖适配器完成）
  - **Blocked By**: Tasks 1, 2, 3

  **References**:

  **Gemini API Documentation** (官方文档):
  - `https://ai.google.dev/api/rest/v1beta/models/generateContent` - Generate Content 端点
  - `https://ai.google.dev/api/rest/v1beta/models/streamGenerateContent` - Streaming 端点
  - `https://ai.google.dev/gemini-api/docs/models` - 模型列表

  **Format Differences** (来自 research):
  - OpenAI uses `messages[]` array → Gemini uses `contents[]` array
  - OpenAI uses `role: "assistant"` → Gemini uses `role: "model"`
  - OpenAI uses `content: "text"` → Gemini uses `parts[]: [{ text: "..." }]`
  - OpenAI wraps in `choices[]` → Gemini wraps in `candidates[]`

  **Conversion Examples** (在 research 中收集):
  ```typescript
  // OpenAI → Gemini request
  {
    "messages": [
      { "role": "user", "content": "Hello" }
    ]
  }
  // becomes
  {
    "contents": [
      { "role": "user", "parts": [{ "text": "Hello" }] }
    ]
  }
  ```

  **WHY Each Reference Matters**:
  - Gemini API Docs: 这是实现自定义适配器的唯一可靠来源
  - Format Differences: 理解格式转换的关键差异点
  - Conversion Examples: 实际的转换示例，避免实现错误

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY**

  **Tests**:
  - [ ] `bun test src/adapters/__tests__/GeminiAdapter.test.ts` → PASS (5 tests)

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Gemini adapter converts OpenAI format to Gemini format
    Tool: Bash (Node.js REPL)
    Preconditions: GeminiAdapter compiled
    Steps:
      1. node -e "import('./src/adapters/GeminiAdapter.js').then(m => { const adapter = new m.GeminiAdapter(); const geminiMsg = adapter.convertToGeminiFormat([{role: 'user', content: 'hello'}]); console.log('Gemini format:', JSON.stringify(geminiMsg)); })"
      2. Assert: Output contains "contents"
      3. Assert: Output contains "parts"
      4. Assert: Output contains "text"
    Expected Result: Adapter correctly transforms message format
    Evidence: REPL output captured

  Scenario: Gemini adapter chat() works end-to-end
    Tool: Bash (curl)
    Preconditions: Server running, valid Gemini API key
    Steps:
      1. curl -X POST http://localhost:3000/api/chat/gemini \
           -H "Content-Type: application/json" \
           -d '{"messages":[{"role":"user","content":"say hello"}],"model":"gemini-2.5-flash"}'
      2. Assert: HTTP status is 200
      3. Assert: response.content is a string
      4. Assert: response is in OpenAI format (not Gemini format)
    Expected Result: Gemini adapter returns OpenAI-compatible response
    Evidence: Response JSON captured

  Scenario: Gemini adapter streaming works
    Tool: Bash (curl)
    Preconditions: Server running, valid Gemini API key
    Steps:
      1. curl -X POST http://localhost:3000/api/chat/gemini/stream \
           -H "Content-Type: application/json" \
           -d '{"messages":[{"role":"user","content":"count to 5"}],"model":"gemini-2.5-flash","stream":true}'
      2. Assert: Response is SSE format
      3. Assert: Chunks contain incremental content
      4. Assert: Final message has finish_reason
    Expected Result: Streaming returns OpenAI-compatible chunks
    Evidence: Stream output captured

  Scenario: Gemini adapter validates API key
    Tool: Bash (curl)
    Preconditions: Server running
    Steps:
      1. curl -X POST http://localhost:3000/api/validate/gemini \
           -H "Content-Type: application/json" \
           -d '{"apiKey":"invalid-key"}'
      2. Assert: HTTP status is 200
      3. Assert: response.valid is false
    Expected Result: Validation works for Gemini
    Evidence: Response captured
  ```

  **Evidence to Capture**:
  - [ ] 测试输出
  - [ ] 格式转换示例（JSON 文件）
  - [ ] 流式响应示例

  **Commit**: YES（with Tasks 4, 6）
  - Message: `feat(adapters): implement custom Gemini adapter`
  - Files: `src/adapters/GeminiAdapter.ts`
  - Pre-commit: `bun test src/adapters/__tests__/GeminiAdapter.test.ts`

- [x] 6. MiniMax 过滤适配器

  **What to do**:
  - [ ] 创建 `src/adapters/MiniMaxAdapter.ts`
  - [ ] 继承 `OpenAICompatibleAdapter`（复用大部分逻辑）
  - [ ] 覆盖 `chat()` 方法，添加响应过滤逻辑
  - [ ] 过滤掉 MiniMax 特定字段：`base_resp`, `input_sensitive`, `output_sensitive`

  **Must NOT do**:
  - 不要修改请求格式（MiniMax 是 OpenAI 兼容的）
  - 不要添加 MiniMax 特定功能（仅 text chat）

  **Recommended Agent Profile**:
  > **Category**: `quick`
  > - **Reason**: 继承现有适配器，仅添加响应过滤，逻辑简单
  > **Skills**: 无需特殊技能

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5, 7)
  - **Blocks**: Task 7
  - **Blocked By**: Tasks 1, 2, 3

  **References**:

  **MiniMax Response Format** (来自 research):
  ```json
  {
    "id": "...",
    "choices": [...],
    "base_resp": {  // MiniMax-specific - MUST BE FILTERED
      "status_code": 0,
      "status_msg": ""
    },
    "input_sensitive": false,  // MiniMax-specific - MUST BE FILTERED
    "output_sensitive": false   // MiniMax-specific - MUST BE FILTERED
  }
  ```

  **OpenAI Compatible Adapter** (基类):
  - `src/adapters/OpenAICompatibleAdapter.ts` - Task 2 创建的通用适配器

  **WHY Each Reference Matters**:
  - Response Format: 了解哪些字段需要过滤
  - Base Adapter: 理解如何继承和扩展基础适配器

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY**

  **Tests**:
  - [ ] `bun test src/adapters/__tests__/MiniMaxAdapter.test.ts` → PASS (3 tests)

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: MiniMax adapter filters provider-specific fields
    Tool: Bash (curl)
    Preconditions: Server running, valid MiniMax API key
    Steps:
      1. curl -X POST http://localhost:3000/api/chat/minimax \
           -H "Content-Type: application/json" \
           -d '{"messages":[{"role":"user","content":"test"}],"model":"MiniMax-M2.1"}' | jq '.'
      2. Assert: response does NOT contain "base_resp"
      3. Assert: response does NOT contain "input_sensitive"
      4. Assert: response does NOT contain "output_sensitive"
      5. Assert: response contains standard fields (content, finishReason, usage)
    Expected Result: MiniMax adapter returns clean OpenAI-compatible response
    Evidence: Response JSON captured

  Scenario: MiniMax adapter inherits streaming from base adapter
    Tool: Bash (curl)
    Preconditions: Server running, valid MiniMax API key
    Steps:
      1. curl -X POST http://localhost:3000/api/chat/minimax/stream \
           -H "Content-Type: application/json" \
           -d '{"messages":[{"role":"user","content":"hello"}],"model":"MiniMax-M2.1","stream":true}'
      2. Assert: Response is SSE format
      3. Assert: Chunks do NOT contain "base_resp" field
    Expected Result: Streaming works without provider-specific fields
    Evidence: Stream output captured
  ```

  **Evidence to Capture**:
  - [ ] 测试输出
  - [ ] 过滤前后的响应对比（JSON 文件）

  **Commit**: YES（with Tasks 4, 5）
  - Message: `feat(adapters): implement MiniMax adapter with response filtering`
  - Files: `src/adapters/MiniMaxAdapter.ts`
  - Pre-commit: `bun test src/adapters/__tests__/MiniMaxAdapter.test.ts`

- [ ] 7. 状态管理扩展

  **What to do**:
  - [ ] 扩展 `src/store/aiConfigStore.ts`
  - [ ] 添加模型管理状态：`models`, `selectedModel`, `setSelectedModel()`
  - [ ] 添加密钥验证状态：`validateApiKey()`, `isProviderConfigured()`
  - [ ] 集成模型配置：从 `src/config/models.ts` 加载模型列表

  **Must NOT do**:
  - 不要修改现有的 store schema（向后兼容）
  - 不要添加不必要的派生状态

  **Recommended Agent Profile**:
  > **Category**: `quick`
  > - **Reason**: Zustand store 扩展，模式清晰，逻辑简单
  > **Skills**: 无需特殊技能

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential（依赖 Tasks 4, 5, 6 完成）
  - **Blocks**: Tasks 8, 9（UI 和服务层依赖状态管理）
  - **Blocked By**: Tasks 4, 5, 6（所有适配器必须先完成）

  **References**:

  **Existing Store** (当前实现):
  - `src/store/aiConfigStore.ts` - 现有的 AI 配置 store
  - `src/store/useAppStore.ts` - 参考 Zustand store 模式

  **Models Config** (Task 3):
  - `src/config/models.ts` - 模型列表配置

  **AI Key Manager** (密钥验证逻辑):
  - `src/lib/aiKeyManager.ts` - `validateApiKey()` 函数

  **WHY Each Reference Matters**:
  - aiConfigStore: 扩展现有 store，保持一致性
  - models.ts: 集成模型列表
  - aiKeyManager: 复用密钥验证逻辑

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY**

  **Tests**:
  - [ ] `bun test src/store/__tests__/aiConfigStore.test.ts` → PASS (8 tests)

  **Agent-Executed QA Scenarios**:

  ```
   Scenario: Store loads all models from config
     Tool: Bash (Node.js REPL)
     Preconditions: Store initialized
     Steps:
       1. node -e "import('./src/store/aiConfigStore.js').then(m => { const store = m.useAIConfig.getState(); console.log('Total models:', store.models.length); console.log('Providers:', [...new Set(store.models.map(m => m.provider))].sort()); })"
       2. Assert: Total models >= 7 (each provider has at least 1 model)
       3. Assert: Providers list includes all 7 providers
    Expected Result: Store loads all models correctly
    Evidence: REPL output captured

  Scenario: setSelectedModel updates selected model
    Tool: Bash (Node.js REPL)
    Preconditions: Store initialized
    Steps:
      1. node -e "import('./src/store/aiConfigStore.js').then(m => { const store = m.useAIConfig; store.getState().setSelectedModel('gpt-4o-mini'); console.log('Selected:', store.getState().selectedModel); })"
      2. Assert: Selected model is 'gpt-4o-mini'
    Expected Result: Model selection works
    Evidence: REPL output captured

  Scenario: validateApiKey returns correct result
    Tool: Bash (Node.js REPL)
    Preconditions: Store initialized
    Steps:
      1. node -e "import('./src/store/aiConfigStore.js').then(async (m) => { const store = m.useAIConfig; const result = await store.getState().validateApiKey('openai', 'invalid-key'); console.log('Valid:', result); })"
      2. Assert: Valid is false
    Expected Result: Validation works
    Evidence: REPL output captured

  Scenario: isProviderConfigured checks API key presence
    Tool: Bash (Node.js REPL)
    Preconditions: Store initialized, no keys set
    Steps:
      1. node -e "import('./src/store/aiConfigStore.js').then(m => { const store = m.useAIConfig; console.log('OpenAI configured:', store.getState().isProviderConfigured('openai')); })"
      2. Assert: OpenAI configured is false
    Expected Result: Configuration check works
    Evidence: REPL output captured
  ```

  **Evidence to Capture**:
  - [ ] 测试输出
  - [ ] Store 状态验证输出

  **Commit**: YES
  - Message: `feat(store): extend aiConfigStore with model management`
  - Files: `src/store/aiConfigStore.ts`
  - Pre-commit: `bun test src/store/__tests__/aiConfigStore.test.ts`

### Wave 3: UI 和集成

- [ ] 8. 设置页面 UI

  **What to do**:
  - [ ] 创建 `src/pages/SettingsPage.tsx`：设置页面主组件
  - [ ] 创建 `src/components/settings/ProviderSelector.tsx`：提供商选择器
  - [ ] 创建 `src/components/settings/ApiKeySection.tsx`：API 密钥配置组件
  - [ ] 创建 `src/components/settings/ModelSelector.tsx`：模型选择器
  - [ ] 添加路由：`/settings` → `SettingsPage`

  **Must NOT do**:
  - 不要添加高级配置（温度、max tokens 等）
  - 不要实现多标签页布局

  **Recommended Agent Profile**:
  > **Category**: `visual-engineering`
  > - **Reason**: React UI 组件开发，需要 Tailwind CSS 样式，涉及用户交互
  > **Skills**: `["playwright"]`
  > - `playwright`: UI 组件需要端到端测试验证，playwright 提供完整的浏览器测试能力

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 9, 10, 11)
  - **Blocks**: Task 9（ChatService 可能依赖设置页面）
  - **Blocked By**: Tasks 3, 7（模型配置和状态管理）

  **References**:

  **Existing UI Components** (参考模式):
  - `src/components/` - 现有组件结构和样式模式
  - `src/pages/` - 现有页面组件模式

  **Tailwind CSS Config** (样式系统):
  - `tailwind.config.js` - Tailwind 配置
  - `src/index.css` - 全局样式

   **Design Specifications** (在第三部分讨论):
   - ProviderSelector: 7 个卡片可用 4x2 + 1 或 3x3 grid 布局，显示图标、名称、配置状态
   - ApiKeySection: 密码输入框、验证按钮、当前密钥显示（masked）、帮助链接
   - ModelSelector: 列表布局，显示模型名称、ID、上下文长度、流式支持徽章

  **WHY Each Reference Matters**:
  - Existing Components: 保持 UI 一致性
  - Tailwind Config: 使用正确的样式类名和设计 tokens
  - Design Specs: 确保实现符合设计要求

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY**

  **Tests**:
  - [ ] `bun test src/pages/__tests__/SettingsPage.test.tsx` → PASS (4 tests)
  - [ ] Playwright test: `playwright test src/pages/__tests__/SettingsPage.spec.ts` → PASS (3 tests)

  **Agent-Executed QA Scenarios**:

  ```
   Scenario: Settings page renders all 7 provider cards
     Tool: Playwright (playwright skill)
     Preconditions: Dev server running on localhost:3000
     Steps:
       1. Navigate to: http://localhost:3000/settings
       2. Wait for: .provider-card (timeout: 5s)
       3. Assert: 7 .provider-card elements visible
       4. Assert: Each card has provider name and icon
       5. Screenshot: .sisyphus/evidence/task-8-settings-page.png
     Expected Result: Settings page shows all 7 providers
     Evidence: .sisyphus/evidence/task-8-settings-page.png

  Scenario: Provider selector allows selection
    Tool: Playwright (playwright skill)
    Preconditions: Settings page loaded
    Steps:
      1. Click on: .provider-card[data-provider="zhipu"]
      2. Assert: Clicked card has class "selected" (border-blue-500)
      3. Assert: Other cards do NOT have "selected" class
      4. Screenshot: .sisyphus/evidence/task-8-provider-selected.png
    Expected Result: Provider selection works visually
    Evidence: .sisyphus/evidence/task-8-provider-selected.png

  Scenario: API key input validates and saves
    Tool: Playwright (playwright skill)
    Preconditions: Settings page loaded, OpenAI selected
    Steps:
      1. Fill: input[type="password"] → "sk-test-key-12345"
      2. Click: button "验证并保存"
      3. Wait for: .validation-message (timeout: 10s)
      4. Assert: Validation message appears (may be success or error depending on key validity)
      5. Assert: Input field is cleared after save
      6. Screenshot: .sisyphus/evidence/task-8-api-key-saved.png
    Expected Result: API key validation and save flow works
    Evidence: .sisyphus/evidence/task-8-api-key-saved.png

  Scenario: Model selector shows provider's models
    Tool: Playwright (playwright skill)
    Preconditions: Settings page loaded, Zhipu selected
    Steps:
      1. Scroll to: .model-selector
      2. Assert: Model list visible
      3. Assert: At least 1 model card visible
      4. Assert: Model cards show: name, ID, context length, streaming badge
      5. Screenshot: .sisyphus/evidence/task-8-model-selector.png
    Expected Result: Model selector displays correct models
    Evidence: .sisyphus/evidence/task-8-model-selector.png

  Scenario: Model selection updates store
    Tool: Playwright (playwright skill)
    Preconditions: Settings page loaded, models visible
    Steps:
      1. Click on: .model-option[data-model="glm-4.7-flash"]
      2. Assert: Clicked model has class "selected"
      3. Navigate to: http://localhost:3000/chat
      4. Assert: Chat page model info bar shows "GLM-4.7 Flash"
      5. Screenshot: .sisyphus/evidence/task-8-model-updated.png
    Expected Result: Model selection persists across pages
    Evidence: .sisyphus/evidence/task-8-model-updated.png

   Scenario: Settings page is keyboard accessible
     Tool: Playwright (playwright skill)
     Preconditions: Settings page loaded
     Steps:
       1. Press: Tab (focus first element)
       2. Assert: Focus visible on first provider card
       3. Press: Tab 7 times (cycle through providers)
       4. Assert: Each provider card gets focus in order
       5. Press: Enter on focused card
       6. Assert: Provider is selected
       7. Screenshot: .sisyphus/evidence/task-8-keyboard-nav.png
     Expected Result: Full keyboard navigation works
     Evidence: .sisyphus/evidence/task-8-keyboard-nav.png
   ```

   **Evidence to Capture**:
   - [ ] 5 个截图（每个场景一个）
   - [ ] 测试输出

  **Commit**: YES
  - Message: `feat(ui): implement settings page for AI provider configuration`
  - Files: `src/pages/SettingsPage.tsx`, `src/components/settings/`, `src/App.tsx` (routing)
  - Pre-commit: `bun test src/pages/__tests__/SettingsPage.test.tsx && playwright test`

- [x] 9. ChatService 改造

  **What to do**:
  - [x] 修改 `src/services/chatService.ts`
  - [x] 使用 `AdapterFactory` 获取适配器
  - [x] 从 `aiConfigStore` 读取当前选择的提供商和模型
  - [x] 调用适配器的 `chat()` 或 `chatStream()` 方法
  - [x] 添加错误处理和重试逻辑

  **Must NOT do**:
  - 不要修改现有的聊天消息格式
  - 不要添加新的服务方法（仅改造现有方法）

  **Recommended Agent Profile**:
  > **Category**: `quick`
  > - **Reason**: 服务层改造，逻辑清晰，模式明确
  > **Skills**: 无需特殊技能

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 8, 10, 11)
  - **Blocks**: Task 11（测试需要完整流程）
  - **Blocked By**: Tasks 4, 5, 6, 7（所有适配器和状态管理）

  **References**:

  **Existing ChatService** (当前实现):
  - `src/services/chatService.ts` - 现有聊天服务
  - `src/services/enhancedChatService.ts` - 增强聊天服务（参考模式）

  **Adapters** (Task 4, 5, 6):
  - `src/adapters/AdapterFactory.ts` - 工厂类
  - `src/adapters/OpenAICompatibleAdapter.ts` - 通用适配器

  **Error Handling** (将实现):
  - `src/utils/retry.ts` - 重试工具（Task 10）
  - `src/utils/logger.ts` - 日志工具（Task 10）

  **WHY Each Reference Matters**:
  - chatService.ts: 了解现有实现，最小化改动
  - AdapterFactory: 了解如何获取适配器
  - Utils: 错误处理和重试逻辑

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY**

  **Tests**:
  - [x] `bun test src/services/__tests__/chatService.test.ts` → PASS (6 tests)

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: ChatService uses correct adapter for provider
    Tool: Bash (curl)
    Preconditions: Server running, Zhipu configured
    Steps:
      1. curl -X POST http://localhost:3000/api/chat \
           -H "Content-Type: application/json" \
           -d '{"messages":[{"role":"user","content":"test"}]}'
      2. Check server logs: Assert log contains "Calling Zhipu adapter"
      3. Assert: Response is valid chat response
    Expected Result: Service routes to correct adapter
    Evidence: Server logs captured

  Scenario: ChatService handles adapter errors gracefully
    Tool: Bash (curl)
    Preconditions: Server running, invalid API key configured
    Steps:
      1. curl -X POST http://localhost:3000/api/chat \
           -H "Content-Type: application/json" \
           -d '{"messages":[{"role":"user","content":"test"}]}'
      2. Assert: HTTP status is 500 or 400 (not 200)
      3. Assert: error.message contains "API 密钥" or "invalid"
    Expected Result: User-friendly error message returned
    Evidence: Error response captured

  Scenario: ChatService retries on rate limit (429)
    Tool: Bash (curl)
    Preconditions: Server running, provider rate limited
    Steps:
      1. curl -X POST http://localhost:3000/api/chat \
           -H "Content-Type: application/json" \
           -d '{"messages":[{"role":"user","content":"test"}]}' \
           --max-time 30
      2. Check server logs: Assert log contains "Retry attempt"
      3. Assert: Final response is success or clear retry-exceeded error
    Expected Result: Retry logic works
    Evidence: Server logs captured
  ```

  **Evidence to Capture**:
  - [ ] 测试输出
  - [ ] 服务日志

  **Commit**: YES
  - Message: `refactor(service): integrate adapter pattern into ChatService`
  - Files: `src/services/chatService.ts`
  - Pre-commit: `bun test src/services/__tests__/chatService.test.ts`

- [x] 10. 错误处理和重试

  **What to do**:
  - [x] 创建 `src/types/errors.ts`：错误类型定义（`APIError`, `AdapterError`, `ConfigError`）
  - [x] 创建 `src/utils/retry.ts`：重试工具函数
  - [x] 创建 `src/utils/logger.ts`：日志工具
  - [x] 在 `ChatService` 中集成错误处理和重试

  **Must NOT do**:
  - 不要实现复杂的断路器模式（简单重试即可）
  - 不要添加外部日志服务（仅 console.log）

  **Recommended Agent Profile**:
  > **Category**: `quick`
  > - **Reason**: 工具函数编写，逻辑清晰，无复杂决策
  > **Skills**: 无需特殊技能

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 8, 9, 11)
  - **Blocks**: Task 11（测试需要完整的错误处理）
  - **Blocked By**: Task 2（适配器基础架构）

  **References**:

  **Error Handling Design** (第五部分讨论):
  - 分层错误处理：适配器层 → 服务层 → UI 层
  - 错误码映射：401 → 密钥无效, 429 → 速率限制, 500 → 服务器错误

  **Retry Strategy** (第五部分讨论):
  - 指数退避：baseDelay * 2^attempt
  - 最大重试次数：3
  - 可重试错误：429, 500, 503

  **WHY Each Reference Matters**:
  - Error Handling Design: 确保实现符合设计要求
  - Retry Strategy: 确保重试逻辑正确

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY**

  **Tests**:
  - [x] `npm test src/utils/__tests__/retry.test.ts` → PASS (7 tests)
  - [x] `npm test src/lib/__tests__/logger.test.ts` → PASS (9 tests)

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Retry tool retries on retryable errors
    Tool: Bash (Node.js REPL)
    Preconditions: retry.ts compiled
    Steps:
      1. node -e "import('./src/utils/retry.js').then(async (m) => { let attempts = 0; const fn = () => { attempts++; if (attempts < 3) throw new Error('429'); return 'success'; }; const result = await m.retryWithBackoff(fn, 3, 100); console.log('Attempts:', attempts, 'Result:', result); })"
      2. Assert: Attempts is 3
      3. Assert: Result is 'success'
    Expected Result: Retry logic works correctly
    Evidence: REPL output captured

  Scenario: Retry tool fails after max retries
    Tool: Bash (Node.js REPL)
    Preconditions: retry.ts compiled
    Steps:
      1. node -e "import('./src/utils/retry.js').then(async (m) => { const fn = () => { throw new Error('429'); }; try { await m.retryWithBackoff(fn, 2, 100); } catch (e) { console.log('Failed after retries'); } })"
      2. Assert: Output contains "Failed after retries"
    Expected Result: Max retries respected
    Evidence: REPL output captured

  Scenario: Logger logs API calls
    Tool: Bash (Node.js REPL)
    Preconditions: logger.ts compiled
    Steps:
      1. node -e "import('./src/utils/logger.js').then(m => { m.Logger.apiCall('openai', 'gpt-4o-mini'); m.Logger.apiResponse('openai', 100); })" 2>&1 | grep "AI API"
      2. Assert: Output contains "Calling openai/gpt-4o-mini"
      3. Assert: Output contains "openai response: 100 tokens"
    Expected Result: Logging works
    Evidence: Console output captured
  ```

  **Evidence to Capture**:
  - [ ] 测试输出
  - [ ] 日志输出示例

  **Commit**: YES
  - Message: `feat(utils): add error handling, retry, and logging utilities`
  - Files: `src/types/errors.ts`, `src/utils/retry.ts`, `src/utils/logger.ts`
  - Pre-commit: `bun test src/utils/__tests__`

- [ ] 11. 测试套件

  **What to do**:
  - [ ] 补充单元测试（确保覆盖率 ≥80%）
  - [ ] 添加集成测试（测试完整流程）
  - [ ] 添加 E2E 测试（Playwright）
  - [ ] 验证所有测试通过

  **Must NOT do**:
  - 不要跳过任何适配器的测试
  - 不要忽略已知边缘情况

  **Recommended Agent Profile**:
  > **Category**: `unspecified-low`
  > - **Reason**: 测试编写，基于已有代码，无需复杂决策
  > **Skills**: `["playwright"]`
  > - `playwright`: E2E 测试需要浏览器自动化

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential（最后一个任务，依赖所有其他任务）
  - **Blocks**: None（最后一个任务）
  - **Blocked By**: All previous tasks

  **References**:

  **Existing Tests** (参考模式):
  - `src/__tests__/` - 现有测试结构
  - `vitest.config.ts` - Vitest 配置

  **All Adapters** (需要测试):
  - `src/adapters/*.ts` - 所有适配器实现

  **UI Components** (需要测试):
  - `src/components/settings/*.tsx` - 所有设置组件

  **WHY Each Reference Matters**:
  - Existing Tests: 保持测试风格一致
  - All Adapters: 确保所有适配器都有测试覆盖
  - UI Components: 确保关键 UI 流程有测试

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY**

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: All unit tests pass
    Tool: Bash (Vitest)
    Preconditions: All code implemented
    Steps:
      1. bun test --coverage
      2. Assert: Exit code is 0
      3. Assert: Coverage report shows ≥80% for src/adapters/, src/store/, src/services/
      4. Save coverage report: .sisyphus/evidence/task-11-coverage.html
    Expected Result: All unit tests pass with sufficient coverage
    Evidence: Test output and coverage report

  Scenario: Integration test: full chat flow
    Tool: Bash (curl)
    Preconditions: Server running, OpenAI configured with valid key
    Steps:
      1. curl -X POST http://localhost:3000/api/chat \
           -H "Content-Type: application/json" \
           -d '{"messages":[{"role":"user","content":"say hello"}]}' \
           | jq '.'
      2. Assert: HTTP status is 200
      3. Assert: response.content contains "hello" (case-insensitive)
      4. Assert: response.usage.totalTokens > 0
      5. Save response: .sisyphus/evidence/task-11-integration-response.json
    Expected Result: End-to-end chat flow works
    Evidence: Response JSON

  Scenario: E2E test: user configures provider and chats
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running
    Steps:
      1. Navigate to: http://localhost:3000/settings
      2. Click on: .provider-card[data-provider="openai"]
      3. Fill: input[type="password"] → "sk-test-key"
      4. Click: button "验证并保存"
      5. Wait for: .validation-message (timeout: 10s)
      6. Navigate to: http://localhost:3000/chat
      7. Type in textarea: "Hello"
      8. Click: button "Send"
      9. Wait for: .assistant-message (timeout: 30s)
      10. Assert: Assistant message visible
      11. Screenshot: .sisyphus/evidence/task-11-e2e-flow.png
    Expected Result: Complete user flow works
    Evidence: .sisyphus/evidence/task-11-e2e-flow.png

  Scenario: All providers have passing adapter tests
    Tool: Bash (Vitest)
    Preconditions: All adapters implemented
    Steps:
      1. bun test src/adapters/__tests__
      2. Assert: Exit code is 0
      3. Assert: Output shows PASS for all 8 provider adapters
    Expected Result: Every adapter has passing tests
    Evidence: Test output

  Scenario: Error handling test scenarios
    Tool: Bash (curl)
    Preconditions: Server running, invalid API key configured
    Steps:
      1. Test 401: curl -X POST http://localhost:3000/api/chat -d '{"messages":[]}' | jq '.error'
         Assert: Error message mentions "API 密钥"
      2. Test 429: Mock rate limit, verify retry in logs
      3. Test 500: Mock server error, verify retry
    Expected Result: All error scenarios handled correctly
    Evidence: Error responses and logs
  ```

  **Evidence to Capture**:
  - [ ] 测试输出（单元测试、集成测试、E2E 测试）
  - [ ] 覆盖率报告（HTML）
  - [ ] E2E 测试截图
  - [ ] 集成测试响应示例

  **Commit**: YES（Final commit）
  - Message: `test: add comprehensive test suite for multi-model integration`
  - Files: All test files
  - Pre-commit: `bun test && playwright test`

---

## Success Criteria

### Verification Commands
```bash
# 1. TypeScript 编译
tsc --noEmit

# 2. 所有单元测试
bun test --coverage

# 3. E2E 测试
playwright test

# 4. CORS 验证报告
cat .sisyphus/evidence/task-1-cors-report.md
```

### Final Checklist
- [ ] All 8 providers have working adapters
- [ ] Settings page UI allows provider selection, API key input, model selection
- [ ] API key validation works for all providers
- [ ] ChatService uses selected provider and model
- [ ] Error handling covers all known scenarios
- [ ] All tests pass (≥80% coverage)
- [ ] No human intervention required for verification
- [ ] Documentation updated (README.md, API docs)

---

## 附录

### A. CORS 风险缓解策略

如果在 Task 1 中发现某些提供商不支持直接浏览器调用，有以下选项：

**Option A: 服务端代理**（推荐用于生产）
- 添加 `/api/proxy/{provider}` 端点
- 服务端转发请求到提供商 API
- 优点：完全解决 CORS 问题
- 缺点：增加服务端复杂度

**Option B: 浏览器扩展**（仅开发环境）
- 使用 CORS 禁用浏览器进行开发
- 生产环境仍需解决 CORS
- 优点：快速验证
- 缺点：不适用于生产

**Option C: 使用提供商特定 workaround**
- JSONP（如提供商支持）
- 不同的认证方式
- 优点：无需服务端
- 缺点：不稳定，提供商可能更改

### B. 模型列表维护指南

**添加新模型**：
1. 验证模型在提供商官方文档中
2. 确认模型不是 beta 或 preview 状态
3. 添加到 `src/config/models.ts`
4. 提交 PR，包含模型文档链接

**移除模型**：
1. 确认模型在官方文档中被标记为 deprecated
2. 从 `src/config/models.ts` 移除
3. 提交 PR，说明弃用原因

### C. 测试数据示例

**Mock API 响应**（用于测试）：
```json
{
  "id": "chatcmpl-test",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "test-model",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "Test response"
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 5,
    "total_tokens": 15
  }
}
```

---

**工作计划版本**: v1.0
**最后更新**: 2026-02-09
**计划作者**: Prometheus (Planning Agent)
**预计完成**: 4-7 天
