# Surge 诗词与一言

每天从「今日诗词」和「一言」公开接口各获取一句内容。

- 每天 08:00 发送 Surge 本地通知
- Panel 每小时刷新，上栏显示诗词，下栏显示一言
- 不需要 API Token

## 安装

在 Surge 中打开「首页 → 模块 → 安装新模块」，粘贴：

```text
https://raw.githubusercontent.com/Jimmyzsan/Surge2025/main/daily-poem.sgmodule
```

数据接口：`https://v1.jinrishici.com/all.json`、`https://v1.hitokoto.cn/`。
