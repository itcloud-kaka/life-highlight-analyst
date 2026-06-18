# 人生高光分析师

一个适配电脑与移动端的个人成长对话网站。它会从用户真实分享的经历中，提炼容易被忽略的优势、隐藏高光、关系特点与事业潜力。

## 本地运行

需要 Node.js 20 或更高版本，以及 OpenAI API Key。

```bash
cp .env.example .env
```

将 `.env` 中的 `OPENAI_API_KEY` 替换为自己的密钥，然后加载环境变量并启动：

```bash
set -a
source .env
set +a
npm start
```

打开 <http://localhost:3000>。

## 环境变量

| 名称 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `OPENAI_API_KEY` | 是 | - | 只配置在服务端，不要写入前端代码 |
| `OPENAI_MODEL` | 否 | `gpt-5.4-mini` | Responses API 使用的模型 |
| `PORT` | 否 | `3000` | Web 服务端口 |

## 部署

可部署到 Render、Railway、Fly.io 或任何支持 Node.js 20+ 的平台：

1. 将本仓库连接到部署平台；
2. 启动命令填写 `npm start`；
3. 添加 `OPENAI_API_KEY` 环境变量；
4. 按需添加 `OPENAI_MODEL`；
5. 部署并绑定域名。

不要使用纯 GitHub Pages 部署聊天功能，因为 GitHub Pages 无法安全保存服务端 API Key。

## 隐私与安全

- API Key 只在服务端读取，不会发送到浏览器。
- 当前版本不使用数据库保存对话。
- 服务端限制了请求大小、上下文长度和每分钟请求次数。
- 该工具用于个人成长交流，不替代医疗或临床心理服务。

Skill 的完整行为规则见 [`SKILL.md`](./SKILL.md)。
