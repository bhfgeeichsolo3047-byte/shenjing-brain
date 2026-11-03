# 深鲸 · 脑区

一个 Host 插件，三个逻辑区 + 一层慢变量：

- 情绪：在助手回答提交后异步更新 `emotion.json`，六维数值限定在 0–1。
- 内分泌：`endocrine.json`，被情绪一点点带动的慢变量，不随单轮跳动；关掉联动就只向基线回落。
- 记忆：小模型只提交候选记忆；插件做结构校验并写入 `memories.json`，每轮做本地相关性检索，不把记忆当指令。
- 表达控制：每个 Agent 的第一步生成说话指令卡，经 `system-prompt/assemble` 注入 system 段；不生成回答、不增加事实。

## 配置

默认后台模型为 `buddy/hy3`。三路（expression / emotion / memory）各自可以：

- 选来源：`dsh` = 走宿主 llm 路由，`external` = 走外部 OpenAI 兼容端点；
- 分别指定 provider / model / 思考强度（外部来源对应 `*ExternalModel` / `*ExternalEffort`）。

外部端点共用 `externalBaseUrl` 与密钥引用 `externalApiKeyRef`（默认 `SHENJING_BRAIN_API_KEY`），密钥存在宿主凭据里，不写进配置文件。

### 数值旋钮

| 键 | 范围 | 作用 |
| --- | --- | --- |
| `emotionSensitivity` | 0–1（默认 0.8） | 情绪敏感度：这一轮的新判断能拉动旧状态多少。1 = 完全采纳，0 = 几乎不动 |
| `expressionRichness` | 0–1（默认 0.5） | 情绪丰富度：语气层次数与避免项细度，也决定提示里给几维情绪 |
| `endocrineSensitivity` | 0–1（默认 0.3） | 内分泌敏感度：被情绪带动的速度 |
| `endocrineLinked` | 布尔（默认 true） | 内分泌是否与情绪联动；关掉后只向基线回落 |
| `memoryDensity` | 0–1（默认 0.5） | 记忆读取密集程度：每轮取几条（1–8） |
| `memoryVectorEnabled` | 布尔（默认 false） | 是否额外用嵌入模型对召回结果重排 |

### 向量检索

宿主没有 embedding 服务，所以向量检索走外部 `/embeddings` 端点：

- `vectorBaseUrl` 留空则复用 `externalBaseUrl`；
- `vectorModel` 填向量模型（如 `Qwen/Qwen3-Embedding-8B`、`text-embedding-3-small`），不能填对话模型；
- `vectorApiKeyRef` 留空则复用 `externalApiKeyRef`。

开启后：先按关键词圈候选池，再用嵌入余弦重排；端点不可用时安静退回关键词打分，不打断这一轮，失败计入 `health.vectorFallbacks`。

`expressionMode: static` 可关闭表达小模型；其他区仍异步工作。`enabled: false` 关闭整个插件。

后台调用默认 20 秒超时（`timeoutMs`）。表达区失败会在本轮静态降级；情绪/记忆失败不阻塞对话。错误写入家目录的 `logs/errors.jsonl` 和 `health.json`。

## 设置页

设置 → 深鲸 · 脑区。四张卡：

- 外部 API：Base URL、密钥、密钥引用、默认模型；
- 表达区 / 情绪区 / 记忆区：各自的来源与模型，外加对应的滑块与开关；
- 内分泌：敏感度滑块、联动开关，并显示当前数值与来源；
- 向量检索：Base URL、向量模型、密钥，以及一个只测 `/embeddings` 的连通性按钮。

## 状态与边界

状态在 `$DSH_HOME/shenjing-brain/`：

- `emotion.json`：当前情绪状态
- `endocrine.json`：当前内分泌慢变量
- `memories.json`：通过校验的候选记忆，默认最多 100 条
- `health.json`：更新次数与最近错误
- `logs/`：情绪、记忆、向量、提示和错误流水

插件不花钱、不删除档案、不主动外发消息。小模型复用当前 DSH 的模型路由或用户自己填的外部端点。

没有生成后自动重写。

## 安装与仓库

源码仓库：https://github.com/bhfgeeichsolo3047-byte/shenjing-brain

本地开发用 link 装法（本机就是这个）：

```bash
cd /root/.dsh/profiles/web
pnpm add link:/root/Documents/deepseek-harness/default-workspace/shenjing-brain
```

然后在 profile 的 `dsh.profile.bundles` 里列出 `@shenjing/brain-regions`，重启宿主。

状态目录在 `$DSH_HOME/shenjing-brain/`，不进仓库。

`node selfcheck.mjs` 跑自检（27 条断言）；`probe-*.mjs` 是排障时用的探测脚本，不进 `files` 白名单。
