# 深鲸 · 脑区

一个 Host 插件，三个逻辑区：

- 情绪/内分泌：在助手回答提交后异步更新 `emotion.json`，数值限定在 0–1。
- 记忆：小模型只提交候选记忆；插件做结构校验并写入 `memories.json`，每轮用本地相关性检索，不把记忆当指令。
- 表达控制：每个 Agent 的第一步生成说话指令卡，经 `agent/pre-step` 附加给主模型；不生成回答、不增加事实。

## 配置

默认后台模型为 `buddy/hy3`。可分别用 `emotionProvider/emotionModel` 与 `memoryProvider/memoryModel` 覆盖，表达区使用 `provider/model`。

`expressionMode: static` 可关闭表达小模型；其他两区仍异步工作。`enabled: false` 关闭整个插件。

所有后台调用默认 12 秒超时。表达区失败会在本轮静态降级；情绪/记忆失败不阻塞对话。错误写入家目录的 `logs/errors.jsonl` 和 `health.json`。

## 状态与边界

状态在 `$DSH_HOME/shenjing-brain/`：

- `emotion.json`：当前情绪状态
- `memories.json`：通过校验的候选记忆，默认最多 100 条
- `health.json`：更新次数与最近错误
- `logs/`：情绪、记忆、提示和错误流水

插件不花钱、不删除档案、不主动外发消息。小模型使用当前 DSH 的模型路由，复用已有凭据；插件不保存 API 密钥。

第一版没有生成后自动重写，也没有 UI 面板。安装后新启动的 Agent 才挂载每轮提示；已有 Agent 的注册情况需以实际运行日志验证。

## 安装与仓库

源码仓库：https://github.com/bhfgeeichsolo3047-byte/shenjing-brain

本地开发用 link 装法（本机就是这个）：

```bash
cd /root/.dsh/profiles/web
pnpm add link:/root/Documents/deepseek-harness/default-workspace/shenjing-brain
```

然后在 profile 的 `dsh.profile.bundles` 里列出 `@shenjing/brain-regions`，重启宿主。

状态目录在 `$DSH_HOME/shenjing-brain/`（config.json、emotion.json、memories.json、health.json、logs/），不进仓库。

`node selfcheck.mjs` 跑自检；`probe-*.mjs` 是排障时用的探测脚本，不进 `files` 白名单。

