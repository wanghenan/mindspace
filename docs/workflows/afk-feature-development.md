# AFK 功能开发工作流

**AFK** = Away-From-Keyboard。这是一套把人的判断力集中在前期"定义做什么"、让实现阶段可无人值守的方法论。核心契约是 `ready-for-agent` 标签：**当 issue 打上这个标签，意味着所有决策已落定，agent 接手后不应再问人任何问题。**

本工作流基于 MindSpace "每日记录 + AI 反馈" 功能的完整实践提炼，对齐 [mattpocock/skills](https://github.com/mattpocock/skills) **1.0.0**。上游的"主流程"（idea → ship）定义在 `/ask-matt` 路由技能里：`grill-with-docs → to-prd → to-issues → implement`。本文是该主流程的 **AFK 视角注解**——加上 HITL/AFK 分界纪律，以及本 harness 的现实约束。

> **技能调用分类**（上游 1.0.0 引入）：**User-invoked** 技能只能由人键入名字调用，职责是编排（orchestrate）；**Model-invoked** 技能可被人或模型按任务自动调用，承载可复用纪律。一条铁律：user-invoked 技能可调用 model-invoked 技能，但**绝不调用另一个 user-invoked 技能**。本文流程里，阶段 1-4 的入口都是 user-invoked。

---

## 何时用 / 何时不用

**用**：新功能开发（想法 → 上线）、需要多决策对齐的复杂功能、团队协作（文档即共识）。

**不用**：紧急 bug 修复（直接改）、纯重构（用重构计划技能）、单行修改、探索性研究。

---

## 流程总览

```
阶段 1-4：人在环（HITL）—— 定义"做什么"
  grill-with-docs → setup → to-prd → to-issues
                    ↓
            产出 ready-for-agent 的切片
                    ↓
阶段 5-6：无人值守（AFK）—— 实现"怎么做"
  TDD 实现 → 验证 → 提交 → 关闭
```

**分界线是 `ready-for-agent` 标签。** 它不是装饰，是契约：从此刻起，agent 不应再问人问题，所有决策必须能在 issue + ADR + CONTEXT.md 里找到答案。

---

## 阶段 1：grill-with-docs —— 逼问出共识（HITL）

**输入**：模糊的功能想法
**输出**：`CONTEXT.md`（术语表）+ `docs/adr/*.md`（架构决策）

**做法**：
- 一次只问一个问题，每个问题给推荐答案 + 理由 + 权衡
- 先探索代码，能从代码答的不问人
- 术语一旦定义，立刻写进 CONTEXT.md（不批量积累）——上游 1.0.0 起这一步走共享的 `/domain-modeling` 技能（挑战术语、写边界场景、即时更新 CONTEXT.md/ADR），`grill-with-docs` 依赖它
- ADR 只在三条都满足时才写：① 难逆转 ② 会让后人困惑 ③ 真实权衡

**质量标准**：把含糊需求逼成环环相扣的精确决策。每个决策有选项 + 推荐理由，避免边做边返工。

---

## 阶段 2：setup —— 配置技能基建（HITL，每仓库一次）

**输入**：空仓库
**输出**：`AGENTS.md` + `docs/agents/{issue-tracker,triage-labels,domain}.md` + issue tracker 的 5 个 triage label

**做法**：三个决策，一次问一个：
1. Issue tracker 用哪个（GitHub / GitLab / 本地 markdown / 其他）
2. Triage label 词汇（5 个标准角色，可用默认或自定义）
3. 领域文档布局（单 context / 多 context）

**一次性**：每仓库只做一次。之后所有功能开发复用这套配置。

---

## 阶段 3：to-prd —— 综合成 PRD（HITL）

**输入**：grill 阶段的共识 + 代码理解
**输出**：发布到 issue tracker 的 PRD issue（打 `ready-for-agent`）

**做法**：不再访谈，只综合。套标准模板：
- **Problem Statement**（从用户视角）
- **Solution**（从用户视角 + 关键设计约束引用 ADR）
- **User Stories**（大量、编号、As-a / I-want / So-that 格式）
- **Implementation Decisions**（模块/接口/schema/契约，不含具体文件路径）
- **Testing Decisions**（测试哲学 + 接缝分层）
- **Out of Scope**（明确不做的事 + 理由）
- **Further Notes**（相关文档引用 + 决策溯源）

**关键动作**：先和用户确认测试接缝，再写 PRD。全程用 CONTEXT.md 术语，引用 ADR。

---

## 阶段 4：to-issues —— 拆成垂直切片（HITL）

**输入**：PRD
**输出**：N 个 tracer-bullet issue，每个打 `ready-for-agent`，含依赖关系

**做法**：拆成**垂直切片**（贯穿数据/服务/UI/测试的端到端窄路径），不是水平切片（先做所有数据层，再做所有 UI）。

**切片规则**：
- 每个切片贯穿所有集成层（schema/API/UI/tests）
- 完成即可独立演示或验收
- 偏好多个薄切片，而非少数厚切片
- 标 HITL（需人决策，如设计评审）或 AFK（可独立实现）
- 让用户确认粒度 / 依赖 / HITL-AFK 标记

**发布顺序**：按依赖顺序发布（阻塞者先），"Blocked by" 引用真实 issue 编号。

**安全切片独立**：临床安全 / 安全关键逻辑（如危机检测）独立成片，便于聚焦验收。

> **这一步是 AFK 设计的关键**：切片越干净，AFK 执行越顺。依赖关系错了，AFK 会卡住或返工。

---

## ↓↓↓ 分界线：ready-for-agent ↓↓↓

从这一刻起，原则上不再需要人。每个 agent 拿到一个 issue 就能独立开工。

---

## 阶段 5：AFK 实现（TDD）

**输入**：一个 `ready-for-agent` 的切片 issue
**输出**：通过测试的代码 + commit

**步骤**：
1. **探索代码**——确认要复用的接口、模式、命名约定
2. **plan mode 理清设计**——中等以上复杂度才用；简单改动直接做
3. **TDD，从最低接缝开始**：
   - 纯函数层（红→绿）
   - 服务/Store 层（红→绿）
   - 组件层（红→绿）
   - E2E（如有）
4. **每步跑测试**，全部完成后跑 build（类型检查 + 构建）
5. **遵守 PRD 测试哲学**：不测 prompt 措辞、不测 AI 返回内容、不测组件内部 state

**AFK 纪律**：
- 不问人——答案在 issue / ADR / CONTEXT.md 里
- 不扩大范围——Out of Scope 的坚决不做
- 不破坏现有测试——回归测试必须绿
- 复用现有接缝——不新建测试基础设施，除非必要

**并行实现**：上游 1.0.0 的"多 session 构建"路径定义在 `/ask-matt`：因为 `/to-issues` 产出的切片相互独立，**在每个切片之间清空上下文**——为每个 issue 开一个全新 session，喂给它 PRD + 该单一 issue，然后 `/implement`。

> ⚠️ **本 harness 的并行现实约束（来自首次实践的硬教训）**：上游文档描述的"多 session"模型假定每个 session 是一个能写的执行体。但本 harness 的 `Agent` 工具**只提供 `Explore` 这一种子代理类型，且它是只读的**（只能读代码、不能 Write/Edit）。因此在本 harness 里：
>
> - **不要把写任务委派给子代理**——把"实现 #N"交给 Explore 类型的 agent，它会产出代码却写不了文件，只能人工搬运，并行承诺当场破产。
> - **分派前的契约检查**（硬规则）：任何委派任务前，先确认目标 agent 类型的工具清单包含任务所需工具。代码任务需要 Write/Edit；若 agent 类型清单里没有，则该任务**不可委派**——拒绝委派，改为在当前 session 串行执行。
> - 本 harness 的"并行"只有两条可行路径：**(a) 在当前 session 串行逐切片实现**（最简单、推荐）；**(b) 真·多检出点并行**——为每个切片开独立 git worktree/checkout，各自跑一个主 session（而非子代理）。
> - 文件归属契约要写进 issue body（`owns: [...]` / `do-not-touch: [...]`），而不是靠口头约定。否则换一个执行者就崩。
>
> 注：上游已**不再提供** `dispatching-parallel-agents` / `subagent-driven-development` 这两个技能。它们假设的带写权限的 `Task()` 原语在本 harness 不存在，按字面照搬会必然复现上述事故。

---

## 阶段 6：验证 + 提交 + 关闭（AFK + 人的一次确认）

**输入**：实现的代码
**输出**：推送的 commit + 关闭的 issue

**步骤**：
1. **本地全流程验证**——唯一需要人介入的点：人跑一遍完整闭环，确认体验。这只是确认，不是决策。
2. **按切片逻辑分组提交**——强耦合的合在一起，不强行拆单文件。文件被多切片渐进修改时，按当前状态提交，逻辑分组而非严格时间序。
3. **推送**
4. **逐个关闭 issue**——评论关联实现 commit + 验收要点

**提交粒度建议**：1 docs commit（如果阶段 1-2 产出新文档）+ N feature commits（按切片或切片组）。

---

## 核心设计原则

### 1. HITL 前置，AFK 后置
人的判断力昂贵且不可并行——集中用在"定义做什么"。一旦定义清楚，实现就能无人值守、甚至并行。

### 2. 文档驱动决策，而非对话驱动
每个决策落进 CONTEXT.md（术语）或 ADR（架构）或 PRD（需求）。下次有人或 agent 看代码，不用重新访谈，读文档即可。ADR 让"为什么不复用现有路径"这类问题有永久答案。

### 3. 垂直切片，而非水平分层
按用户价值路径切（记一笔 → 反馈 → 存档 → 回看），不按技术层切（先所有数据层，再所有 UI）。每个切片可独立演示、验收、合并。

### 4. 测试哲学是契约
PRD 明确"不测什么"（prompt 措辞、AI 返回、内部 state），这比"测什么"更重要——防止写出脆弱的实现细节测试。

### 5. Out of Scope 是护城河
每个 PRD 明确列出不做的事及理由。让 AFK agent 不自作主张扩大范围。

### 6. 上下文卫生（context hygiene）
阶段 1-4 保持在**同一个不中断的上下文窗口**里——不 compact、不清空——让 grill、PRD、切片建立在同一套思考之上。但**每个切片的 `/implement` 都开全新 session**，从 issue 起步。判据是上游 1.0.0 提出的 **smart zone**（约 120k token 的清晰推理窗口）：session 接近它就开始 degrade，应通过 `/handoff` 打包到新 thread 继续，不要硬推 degraded 的上下文。`/handoff` 是 fork（新会话引用旧文件），`/compact` 是 continue（同会话、丢失逐字历史）——选 fork 还是 continue 取决于是否要保留原文。

---

## 工具链速查

| 阶段 | 技能 | 关键产物 |
|------|------|---------|
| 1 | `grill-with-docs`（依赖 `domain-modeling`）| CONTEXT.md + ADR |
| 2 | `setup-matt-pocock-skills` | AGENTS.md + triage labels（每仓库一次）|
| 3 | `to-prd` | PRD issue（`ready-for-agent`）|
| 4 | `to-issues` | 切片 issues（`ready-for-agent` + 依赖图）|
| 5 | `implement` + `tdd` | 代码 + 测试 |
| 6 | git + gh | commits + 关闭 issues |

**上游 1.0.0 重命名/移除速查**（本文涉及的）：
- `diagnose` → **`diagnosing-bugs`**（model-invoked；调试纪律循环）
- `write-a-skill` → **`writing-great-skills`**（user-invoked；技能写作参考）
- 新增共享 model-invoked 技能：`domain-modeling`、`codebase-design`、`grilling`（`grill-with-docs`/`grill-me`/`tdd`/`improve-codebase-architecture` 现在依赖它们）
- 新增 user-invoked 路由：`ask-matt`（主流程的"地图"）
- **移除**：`dispatching-parallel-agents`、`subagent-driven-development`、`caveman`、`zoom-out`

---

## 已知陷阱与改进项

> 来自首次实践的诚实复盘，后续迭代应规避。

1. **写任务不可委派给只读子代理**：首次实践并行做 #10/#11 时，误把实现任务交给 `Explore`（只读）类型子代理——它产出代码却写不了文件，并行承诺当场破产，只能人工搬运。规范做法见阶段 5 的"本 harness 并行现实约束"：委派前做工具契约检查，写任务在本 harness 一律串行执行或开真·多 checkout。

2. **前置检查 vitest 忽略 .worktrees/**：本仓库的 worktree 副本混入全量测试结果，每次都有 14 个噪音失败。新仓库跑这套流程前，确认测试配置排除了无关目录。

3. **测试选择器避免过宽正则**：如 `/记下/` 会匹配多个按钮（提交 + "记下了，谢谢"）。提交按钮等关键交互元素用精确文案或 `aria-label`，避免随功能扩展而冲突。

4. **危机/安全逻辑优先短路**：危机检测必须在配额检查、Key 解析之前执行——安全豁免不该依赖后续逻辑的"恰好跳过"。把安全检测放在函数最入口。

---

## 各阶段技能使用手册（对齐 mattpocock/skills 1.0.0）

> 下面按执行阶段给出**具体怎么调**：调什么、喂什么、产出什么、其中嵌入了哪些 model-invoked 技能。命令名前的 `/` 表示它是 **user-invoked**（人键入触发）；无 `/` 标注的是 **model-invoked**（任务匹配时模型自动触达，人也可显式调）。铁律：user-invoked 不调另一个 user-invoked。

### 阶段 1：逼问出共识

| | |
|---|---|
| **调** | `/grill-with-docs`（user-invoked）|
| **内部组合** | 跑 `/grilling`（model-invoked，可复用的访谈循环）+ `/domain-modeling`（model-invoked，主动建领域模型）|
| **喂** | 模糊的功能想法 + 代码库 |
| **做法** | `/grilling` 纪律：一次只问一个问题，每个问题给**推荐答案**；能从代码答的就探索代码不问人；沿决策树逐分支解决依赖。`/domain-modeling` 纪律在访谈中持续生效：术语一冲突立刻指出（"glossary 定义为 X，但你像在说 Y"）；术语一定型**立刻写进 CONTEXT.md（不批量）**；用具体边界场景逼问关系；代码与口头描述矛盾时当场点破。 |
| **ADR 门槛** | `/domain-modeling` 的 ADR 只在三条**全满足**时才提：① 难逆转 ② 后人会困惑 ③ 真实权衡。缺一条就跳过。 |
| **产出** | `CONTEXT.md`（纯术语表，零实现细节）+ `docs/adr/*.md` |

### 阶段 2：配置技能基建（每仓库一次）

| | |
|---|---|
| **调** | `/setup-matt-pocock-skills`（user-invoked，每仓库只一次） |
| **喂** | 空仓库（或尚未配置的仓库）|
| **做** | 探索现有状态（`git remote`、`AGENTS.md`/`CLAUDE.md`、`CONTEXT.md`、`docs/adr/`），然后**一次问一个**三个决策：① Issue tracker（GitHub/GitLab/本地 markdown/其他）② Triage label 词汇（5 个标准角色，可改名）③ Domain doc 布局（single-context / multi-context）。每个决策先给一句话 explainer 再给选项和默认。 |
| **产出** | `AGENTS.md`/`CLAUDE.md` 里的 `## Agent skills` 块 + `docs/agents/{issue-tracker,triage-labels,domain}.md` + issue tracker 的 5 个 triage label |
| **注意** | 永远编辑已存在的那一个（`CLAUDE.md` 在就不新建 `AGENTS.md`）；已有 `## Agent skills` 块就原地更新，不追加重复块 |

### 阶段 3：综合成 PRD

| | |
|---|---|
| **调** | `/to-prd`（user-invoked）|
| **喂** | 阶段 1 的共识 + 代码理解 |
| **铁律** | **不再访谈，只综合。** 这是该技能的核心约束——别在 PRD 阶段又开提问。 |
| **做** | ① 探索代码（用 CONTEXT.md 词汇、尊重相关 ADR）② **先和用户确认测试接缝**——优先复用既有接缝、用能到的最高接缝、理想接缝数是 1；新接缝尽量提在最高点 ③ 套模板写 PRD ④ 发布到 issue tracker，打 `ready-for-agent` |
| **PRD 模板** | Problem Statement（用户视角）/ Solution（用户视角 + 引用 ADR）/ User Stories（大量、编号、As-a·I-want·So-that）/ Implementation Decisions（模块·接口·schema·契约，**不写具体文件路径**；原型产出的状态机/reducer/schema 若比散文更精确，可内联并注明来自原型）/ Testing Decisions（测试哲学 + 接缝分层）/ Out of Scope（明确不做 + 理由）/ Further Notes |
| **产出** | PRD issue（已打 `ready-for-agent`） |

### 阶段 4：拆成垂直切片

| | |
|---|---|
| **调** | `/to-issues`（user-invoked）|
| **喂** | PRD（可直接喂 issue 号/URL/路径，技能会从 tracker 拉取全文 + 评论）|
| **做** | ① 用已有上下文工作 ② 探索代码找"预重构"机会（"先把改动变容易，再做容易的改动"）③ 起草**垂直切片（tracer bullet）**：每个贯穿所有集成层（schema/API/UI/tests）、可独立演示验收、预重构先行 ④ 把拆分作为编号清单呈给用户：每片给 Title / Blocked by / 覆盖的 user stories；问粒度、依赖、要不要合并或再拆，**迭代到用户批准** ⑤ 按依赖顺序发布（阻塞者先，才能在 "Blocked by" 填真实编号），发布即打 `ready-for-agent` |
| **issue 模板** | Parent（若来源是现有 issue）/ What to build（端到端行为，不写文件路径；原型 snippet 同 PRD 规则）/ Acceptance criteria（勾选项）/ Blocked by（真实编号 or "None - can start immediately"）|
| **产出** | N 个 `ready-for-agent` 切片 issue + 依赖图 |
| **注意** | 不关闭/修改父 issue |

### ↓↓↓ 分界线：`ready-for-agent`。此后每个切片独立、清空上下文、开新 session ↓↓↓

### 阶段 5：实现（每切片一个新 session）

| | |
|---|---|
| **调** | `/implement`（user-invoked）|
| **喂** | PRD + **单个**切片 issue（不要喂全部，避免上下文污染）|
| **内部组合** | 用 `/tdd`（model-invoked）在预先约定的接缝做 TDD |
| **`/tdd` 纪律** | 探索时读 `CONTEXT.md` 让测试名/接口词汇对齐领域语言、尊重 ADR。**反模式：先写所有测试再写所有实现（水平切片）**——会产出测"想象的形状"而非"真实行为"的脆弱测试。正确做法：**一次一个测试一个实现（垂直 tracer bullet）**——`RED→GREEN`（1 测 1 实现）循环，每个测试回应上一轮学到的东西。Planning 阶段先和用户确认接口改动 + 哪些行为要测（不能测一切，聚焦关键路径）；refactor 只在 GREEN 后做，**绝不 RED 时重构**。 |
| **`/implement` 自己的纪律** | 经常跑类型检查、常跑单测试文件、收尾跑一次全量测试；做完用 `/review` 复审；提交到当前分支 |
| **并行（本 harness 现实约束）** | 见上文阶段 5 的专门章节。本 harness 子代理只有只读 `Explore`，写任务不可委派——**串行执行**或**真·多 checkout 并行**；文件归属写进 issue body |
| **产出** | 通过测试的代码 + commit |

### 阶段 6：验证 + 提交 + 关闭

| | |
|---|---|
| **调** | `/review`（user-invoked，被 `/implement` 末尾调用；也可独立调）|
| **做** | 对刚完成的切片做代码复审（fail-fast 检查、单一来源规则、去掉 no-op）|
| **人的唯一介入** | 本地全流程验证——跑一遍完整闭环确认体验。这是**确认**，不是决策 |
| **提交** | 按切片逻辑分组（强耦合合在一起，不强行拆单文件）；被多切片渐进修改的文件按当前状态提交、逻辑分组而非严格时间序 |
| **关闭** | 逐个关闭 issue，评论关联实现 commit + 验收要点 |
| **产出** | 推送的 commit + 关闭的 issue |

### 跨阶段 / 维护类技能（不在主流程上，按需触发）

| 技能 | 调用 | 用途 |
|---|---|---|
| `/triage` | user-invoked | 处理**不是自己创建的** raw issue（bug 报告、外部需求）。把它们走 5 角色（needs-triage/needs-info/ready-for-agent/ready-human/wontfix）状态机，bug 先复现，需 fleshing 时跑 `/grilling`+`/domain-modeling`。**注意**：`/to-issues` 产出的 issue 已是 agent-ready，不要 triage 它们。 |
| `/improve-codebase-architecture` | user-invoked | 维护代码健康，不是功能开发。扫"加深机会"（浅模块→深模块），出 HTML 报告，选一个后跑 `/grilling`+`/domain-modeling`。用的架构词汇来自 `/codebase-design`（model-invoked）。有空就跑，挑一个加深机会**本身会生成 idea**，可带进阶段 1。 |
| `/diagnosing-bugs` | **model-invoked** | 硬 bug / 性能回归的诊断纪律循环。Phase 1 建"tight + red-capable"反馈回路是全部；回路建好前禁止跳到假设。Phase 3 列 3-5 个可证伪假设并**先给用户看再测**。Phase 6 写 post-mortem 并问"什么能预防这个 bug"。 |
| `/codebase-design` | model-invoked | 共享的架构词汇（module/interface/depth/seam/adapter）+ 设计原则。`tdd`/`improve-codebase-architecture` 依赖它，别漂移成"component/service/API"。 |
| `/domain-modeling` | model-invoked | 主动建领域模型的纪律（见阶段 1）。`grill-with-docs`/`triage`/`improve-codebase-architecture` 都在调它。 |
| `/grilling` | model-invoked | 可复用的访谈循环，`grill-with-docs`/`grill-me`/`improve-codebase-architecture`/`triage` 的底层。 |
| `/handoff` | user-invoked | 上下文接近 smart-zone（~120k）时，把当前会话打包成 handoff 文档，**开新 session 引用该文件**继续。fork 语义（新会话 vs `/compact` 的 continue 同会话）。 |
| `/ask-matt` | user-invoked | 不记得该用哪个技能时的路由——它就是本文"主流程"的地图。 |

### 一句话决策树（调用哪个技能）

```
有想法要建？
  有代码库 → /grill-with-docs → /to-prd → /to-issues → (每切片新 session)/implement
  无代码库 → /grill-me
收到外部 issue？ → /triage（别 triage 自己 to-issues 产出的）
代码变 ball of mud？ → /improve-codebase-architecture
硬 bug / 性能回归？ → /diagnosing-bugs
上下文快满了？ → /handoff（fork）而非 /compact（continue），除非是有意的阶段间歇
不记得用哪个？ → /ask-matt
```

---

## 适用范围扩展

本工作流虽以 MindSpace（前端 React 应用）为实践背景，但方法论本身技术栈无关：

- **后端服务**：阶段 5 的"纯函数→服务→API 层"对应"领域逻辑→服务→端点"
- **多仓库**：阶段 2 选 multi-context 布局，每仓库各自一套 CONTEXT.md
- **纯脚本/工具**：阶段 4 可拆得更粗（单切片即足够）

调整的是实现细节（测试框架、提交工具），不变的是 HITL/AFK 分界和文档驱动的核心。
