# AFK 功能开发工作流

**AFK** = Away-From-Keyboard。这是一套把人的判断力集中在前期"定义做什么"、让实现阶段可无人值守的方法论。核心契约是 `ready-for-agent` 标签：**当 issue 打上这个标签，意味着所有决策已落定，agent 接手后不应再问人任何问题。**

本工作流对齐 [mattpocock/skills](https://github.com/mattpocock/skills) **1.0.0**。上游的"主流程"（idea → ship）定义在 `/ask-matt` 路由技能里：`grill-with-docs → to-prd → to-issues → implement`。本文是该主流程的 **AFK 视角注解**——加上 HITL/AFK 分界纪律、各阶段用哪个技能、以及每条做法的**好处与作用**。

> **技能调用分类**（上游 1.0.0 引入）：**User-invoked** 技能只能由人键入名字调用，职责是编排（orchestrate）；**Model-invoked** 技能可被人或模型按任务自动调用，承载可复用纪律。一条铁律：user-invoked 技能可调用 model-invoked 技能，但**绝不调用另一个 user-invoked 技能**。本文流程里，主流程各阶段的入口都是 user-invoked。

---

## 何时用 / 何时不用

**用**：新功能开发（想法 → 上线）、需要多决策对齐的复杂功能、团队协作（文档即共识）。

**不用**：紧急 bug 修复（直接改）、纯重构（用重构计划技能）、单行修改、探索性研究。

---

## 前置：配置技能基建（每仓库一次）

在任何功能开发**之前**做，且每仓库只做一次。后续所有功能开发复用这套配置。

| | |
|---|---|
| **调** | `/setup-matt-pocock-skills`（user-invoked） |
| **喂** | 仓库（空仓库或尚未配置的仓库）|
| **做** | 探索现有状态（`git remote`、`AGENTS.md`/`CLAUDE.md`、`CONTEXT.md`、`docs/adr/`），然后**一次问一个**三个决策：① Issue tracker（GitHub/GitLab/本地 markdown/其他）② Triage label 词汇（5 个标准角色，可改名）③ Domain doc 布局（single-context / multi-context）。每个决策先给一句话 explainer 再给选项和默认。 |
| **产出** | `AGENTS.md`/`CLAUDE.md` 里的 `## Agent skills` 块 + `docs/agents/{issue-tracker,triage-labels,domain}.md` + issue tracker 的 5 个 triage label |
| **注意** | 永远编辑已存在的那一个（`CLAUDE.md` 在就不新建 `AGENTS.md`）；已有 `## Agent skills` 块就原地更新，不追加重复块 |
| **好处/作用** | 这一前置让后续每个技能自动读到正确的配置——issue tracker 在哪、label 叫什么、`CONTEXT.md`/ADR 放哪——不用每次重新指认。尤其关键：阶段 1 的 `/grill-with-docs` 内部会创建并写 `CONTEXT.md`，必须先由 setup 决定它的布局，否则无处落笔。 |

---

## 流程总览

```
前置（每仓库一次）：setup-matt-pocock-skills
                        │
                        ▼
阶段 1-3：人在环（HITL）—— 定义"做什么"
  grill-with-docs → to-prd → to-issues
                    ↓
            产出 ready-for-agent 的切片
                    ↓
阶段 4-5：无人值守（AFK）—— 实现"怎么做"
  implement（TDD）→ 验证 → 提交 → 关闭
```

**分界线是 `ready-for-agent` 标签。** 它不是装饰，是契约：从此刻起，agent 不应再问人问题，所有决策必须能在 issue + ADR + CONTEXT.md 里找到答案。

---

## 阶段 1：grill-with-docs —— 逼问出共识（HITL）

把含糊的"大概做个 X 功能"逼成环环相扣的精确决策，同时沉淀共享语言。

| | |
|---|---|
| **调** | `/grill-with-docs`（user-invoked）|
| **内部组合** | 跑 `/grilling`（model-invoked，可复用的访谈循环）+ `/domain-modeling`（model-invoked，主动建领域模型）|
| **输入** | 模糊的功能想法 + 代码库 |
| **做法** | `/grilling` 纪律：一次只问一个问题，每个问题给**推荐答案**；能从代码答的就探索代码不问人；沿决策树逐分支解决依赖。`/domain-modeling` 纪律在访谈中持续生效：术语一冲突立刻指出（"glossary 定义为 X，但你像在说 Y"）；术语一定型**立刻写进 CONTEXT.md（不批量）**；用具体边界场景逼问关系；代码与口头描述矛盾时当场点破。 |
| **ADR 门槛** | `/domain-modeling` 的 ADR 只在三条**全满足**时才提：① 难逆转 ② 后人会困惑 ③ 真实权衡。缺一条就跳过。 |
| **产出** | `CONTEXT.md`（纯术语表，零实现细节）+ `docs/adr/*.md` |
| **好处/作用** | ① **提前逼出歧义**——在写代码前就发现并解决决策分支，避免实现到一半才发现要返工；② **沉淀共享语言**——术语表让后续每个 agent 不用重新访谈、减少冗长表述、命名一致；③ **ADR 留下"为什么这么选"的永久答案**，后人不会再问同一个问题、也不会推翻已定决策。 |

---

## 阶段 2：to-prd —— 综合成 PRD（HITL）

把访谈共识固化成可追溯、可分发的需求文档。

| | |
|---|---|
| **调** | `/to-prd`（user-invoked）|
| **输入** | 阶段 1 的共识 + 代码理解 |
| **铁律** | **不再访谈，只综合。** 这是该技能的核心约束——别在 PRD 阶段又开提问，共识已在阶段 1 落定。 |
| **做** | ① 探索代码（用 CONTEXT.md 词汇、尊重相关 ADR）② **先和用户确认测试接缝**——优先复用既有接缝、用能到的最高接缝、理想接缝数是 1；新接缝尽量提在最高点 ③ 套模板写 PRD ④ 发布到 issue tracker，打 `ready-for-agent` |
| **PRD 模板** | Problem Statement（用户视角）/ Solution（用户视角 + 引用 ADR）/ User Stories（大量、编号、As-a·I-want·So-that）/ Implementation Decisions（模块·接口·schema·契约，**不写具体文件路径**；原型产出的状态机/reducer/schema 若比散文更精确，可内联并注明来自原型）/ Testing Decisions（测试哲学 + 接缝分层）/ Out of Scope（明确不做 + 理由）/ Further Notes |
| **产出** | PRD issue（已打 `ready-for-agent`） |
| **好处/作用** | ① **共识固化**——口头讨论易散、易忘，落成结构化文档后任何人/agent 都能读到同一份需求；② **测试接缝前置确认**——防止实现阶段写出耦合实现细节的脆弱测试；③ **Out of Scope 设定 agent 边界**——明确"不做什么"，AFK agent 不自作主张扩范围。 |

---

## 阶段 3：to-issues —— 拆成垂直切片（HITL）

把 PRD 拆成相互独立、可独立验收的端到端切片。**这一步是 AFK 设计的关键**：切片越干净，AFK 执行越顺。

| | |
|---|---|
| **调** | `/to-issues`（user-invoked）|
| **输入** | PRD（可直接喂 issue 号/URL/路径，技能会从 tracker 拉取全文 + 评论）|
| **做** | ① 用已有上下文工作 ② 探索代码找"预重构"机会（"先把改动变容易，再做容易的改动"）③ 起草**垂直切片（tracer bullet）**：每个贯穿所有集成层（schema/API/UI/tests）、可独立演示验收、预重构先行 ④ 把拆分作为编号清单呈给用户：每片给 Title / Blocked by / 覆盖的 user stories；问粒度、依赖、要不要合并或再拆，**迭代到用户批准** ⑤ 按依赖顺序发布（阻塞者先，才能在 "Blocked by" 填真实编号），发布即打 `ready-for-agent` |
| **issue 模板** | Parent（若来源是现有 issue）/ What to build（端到端行为，不写文件路径；原型 snippet 同 PRD 规则）/ Acceptance criteria（勾选项）/ Blocked by（真实编号 or "None - can start immediately"）|
| **产出** | N 个 `ready-for-agent` 切片 issue + 依赖图 |
| **注意** | 不关闭/修改父 issue |
| **好处/作用** | ① **垂直切片 vs 水平分层**——按用户价值路径切（端到端窄路径），每片完成即可独立演示/验收/合并，风险局部化；水平分层（先所有数据层再所有 UI）要到最后一刻才集成，问题难定位；② **依赖图让执行顺序无歧义**——agent 不用猜先做哪个；③ **`ready-for-agent` 是 HITL/AFK 分界契约**——打上它意味着"无需再问人"，这是实现阶段能无人值守的前提。 |

---

## ↓↓↓ 分界线：ready-for-agent ↓↓↓

从这一刻起，原则上不再需要人。每个 agent 拿到一个 issue 就能独立开工。此后**每个切片清空上下文、开新 session**（见阶段 4）。

---

## 阶段 4：implement —— AFK 实现（TDD）

无人值守地把切片变成通过测试的代码。

| | |
|---|---|
| **调** | `/implement`（user-invoked）|
| **输入** | PRD + **单个**切片 issue（不要喂全部，避免上下文污染）|
| **内部组合** | 用 `/tdd`（model-invoked）在预先约定的接缝做 TDD |
| **`/tdd` 纪律** | 探索时读 `CONTEXT.md` 让测试名/接口词汇对齐领域语言、尊重 ADR。**反模式：先写所有测试再写所有实现（水平切片）**——会产出测"想象的形状"而非"真实行为"的脆弱测试。正确做法：**一次一个测试一个实现（垂直 tracer bullet）**——`RED→GREEN`（1 测 1 实现）循环，每个测试回应上一轮学到的东西。Planning 阶段先和用户确认接口改动 + 哪些行为要测（不能测一切，聚焦关键路径）；refactor 只在 GREEN 后做，**绝不 RED 时重构**。 |
| **`/implement` 自己的纪律** | 经常跑类型检查、常跑单测试文件、收尾跑一次全量测试；做完用 `/review` 复审；提交到当前分支 |
| **AFK 纪律** | 不问人（答案在 issue/ADR/CONTEXT.md）；不扩大范围（Out of Scope 坚决不做）；不破坏现有测试（回归必须绿）；复用现有接缝 |
| **产出** | 通过测试的代码 + commit |
| **好处/作用** | ① **每切片新 session**——避免上下文污染，agent 聚焦单一切片；② **TDD 给 agent 即时反馈**——红绿循环让代码质量稳定，不靠"写完再看"；③ **不问人 = 真正无人值守**——前提是前三阶段把决策落定了，这正是 HITL/AFK 分工的价值。 |

**并行实现**：上游 1.0.0 的"多 session 构建"路径定义在 `/ask-matt`：因为 `/to-issues` 产出的切片相互独立，**在每个切片之间清空上下文**——为每个 issue 开一个全新 session，喂给它 PRD + 该单一 issue，然后 `/implement`。

> ⚠️ **本 harness 的并行现实约束**：上游文档描述的"多 session"模型假定每个 session 是一个能写的执行体。但本 harness 的 `Agent` 工具**只提供 `Explore` 这一种子代理类型，且它是只读的**（只能读代码、不能 Write/Edit）。因此在本 harness 里：
>
> - **不要把写任务委派给子代理**——把"实现某切片"交给 Explore 类型的 agent，它会产出代码却写不了文件，只能人工搬运，并行承诺当场破产。
> - **分派前的契约检查**（硬规则）：任何委派任务前，先确认目标 agent 类型的工具清单包含任务所需工具。代码任务需要 Write/Edit；若 agent 类型清单里没有，则该任务**不可委派**——拒绝委派，改为在当前 session 串行执行。
> - 本 harness 的"并行"只有两条可行路径：**(a) 在当前 session 串行逐切片实现**（最简单、推荐）；**(b) 真·多检出点并行**——为每个切片开独立 git worktree/checkout，各自跑一个主 session（而非子代理）。
> - 文件归属契约要写进 issue body（`owns: [...]` / `do-not-touch: [...]`），而不是靠口头约定。否则换一个执行者就崩。
>
> 注：上游已**不再提供** `dispatching-parallel-agents` / `subagent-driven-development` 这两个技能。它们假设的带写权限的 `Task()` 原语在本 harness 不存在，按字面照搬会必然复现上述事故。

---

## 阶段 5：验证 + 提交 + 关闭（AFK + 人的一次确认）

实现完成后收尾：人工确认体验、按切片提交、关闭 issue 形成可追溯闭环。

| | |
|---|---|
| **调** | `/review`（user-invoked，被 `/implement` 末尾调用；也可独立调）|
| **做** | 对刚完成的切片做代码复审（fail-fast 检查、单一来源规则、去掉 no-op）|
| **人的唯一介入** | 本地全流程验证——跑一遍完整闭环确认体验。这是**确认**，不是决策 |
| **提交** | 按切片逻辑分组（强耦合合在一起，不强行拆单文件）；被多切片渐进修改的文件按当前状态提交、逻辑分组而非严格时间序 |
| **关闭** | 逐个关闭 issue，评论关联实现 commit + 验收要点 |
| **产出** | 推送的 commit + 关闭的 issue |
| **好处/作用** | ① **本地验证是成本最低的质量门**——只占一个人工介入点，却能在交付前抓住体验问题；② **按切片提交让 review 可读**——reviewer 按价值单元看，不是看一坨；③ **关联 issue 关闭形成可追溯闭环**——commit↔issue 互链，事后查"为什么改的/验收了什么"一目了然。 |

**提交粒度建议**：1 docs commit（如果前置/阶段 1 产出新文档）+ N feature commits（按切片或切片组）。

---

## 核心设计原则（每条的作用）

### 1. HITL 前置，AFK 后置
人的判断力昂贵且不可并行——集中用在"定义做什么"。一旦定义清楚，实现就能无人值守、甚至并行。**作用**：把最稀缺的资源（人的决策）用在最高杠杆处。

### 2. 文档驱动决策，而非对话驱动
每个决策落进 CONTEXT.md（术语）或 ADR（架构）或 PRD（需求）。下次有人或 agent 看代码，不用重新访谈，读文档即可。ADR 让"为什么不复用现有路径"这类问题有永久答案。**作用**：决策沉淀即资产，避免每次重复对齐、避免已定决策被反复推翻。

### 3. 垂直切片，而非水平分层
按用户价值路径切（端到端窄路径贯穿数据/服务/UI/测试），不按技术层切（先所有数据层，再所有 UI）。每个切片可独立演示、验收、合并。**作用**：风险局部化，问题早暴露，每片交付即价值。

### 4. 测试哲学是契约
PRD 明确"不测什么"（实现细节、内部 state），这比"测什么"更重要——防止写出重构即碎的脆弱测试。**作用**：测试描述行为而非实现，能扛重构。

### 5. Out of Scope 是护城河
每个 PRD 明确列出不做的事及理由。让 AFK agent 不自作主张扩大范围。**作用**：给无人值守的 agent 设硬边界，防范围蔓延。

### 6. 上下文卫生（context hygiene）
阶段 1-3 保持在**同一个不中断的上下文窗口**里——不 compact、不清空——让 grill、PRD、切片建立在同一套思考之上。但**每个切片的 `/implement` 都开全新 session**，从 issue 起步。判据是上游 1.0.0 提出的 **smart zone**（约 120k token 的清晰推理窗口）：session 接近它就开始 degrade，应通过 `/handoff` 打包到新 thread 继续，不要硬推 degraded 的上下文。`/handoff` 是 fork（新会话引用旧文件），`/compact` 是 continue（同会话、丢失逐字历史）——选 fork 还是 continue 取决于是否要保留原文。**作用**：同窗口保思考连贯，跨切片换新 session 防污染；smart zone 判据防止在 degraded 上下文里硬撑出低质量产出。

---

## 跨阶段 / 维护类技能（不在主流程上，按需触发）

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

---

## 一句话决策树（调用哪个技能）

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

## 上游 1.0.0 重命名/移除速查（本文涉及的）

- `diagnose` → **`diagnosing-bugs`**（model-invoked；调试纪律循环）
- `write-a-skill` → **`writing-great-skills`**（user-invoked；技能写作参考）
- 新增共享 model-invoked 技能：`domain-modeling`、`codebase-design`、`grilling`（`grill-with-docs`/`grill-me`/`tdd`/`improve-codebase-architecture` 现在依赖它们）
- 新增 user-invoked 路由：`ask-matt`（主流程的"地图"）
- **移除**：`dispatching-parallel-agents`、`subagent-driven-development`、`caveman`、`zoom-out`

---

## 适用范围

本方法论本身技术栈无关，调整的是实现细节（测试框架、提交工具），不变的是 HITL/AFK 分界和文档驱动的核心：

- **后端服务**：阶段 4 的"纯函数→服务→API 层"对应"领域逻辑→服务→端点"
- **多仓库**：前置 setup 选 multi-context 布局，每仓库各自一套 CONTEXT.md
- **纯脚本/工具**：阶段 3 可拆得更粗（单切片即足够）
