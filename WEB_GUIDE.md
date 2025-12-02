# UniLLM Web 前端使用指南

本文档介绍如何使用 UniLLM 的 Web 前端界面来管理 LLM 配置实例和进行聊天。

## 目录

- [快速开始](#快速开始)
- [配置管理](#配置管理)
- [聊天功能](#聊天功能)
- [开发说明](#开发说明)
- [部署](#部署)

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动服务

需要同时启动 API 服务器和 Web 前端：

**终端 1 - 启动 API 服务器：**
```bash
pnpm dev:server
```

服务器将运行在 `http://localhost:3000`

**终端 2 - 启动 Web 前端：**
```bash
pnpm dev:web
```

Web 界面将运行在 `http://localhost:5173` 并自动在浏览器中打开。

## 配置管理

### 查看配置实例

访问 `http://localhost:5173/instances` 可以看到所有配置实例的列表，包括：

- **实例名称**: 自定义的实例名称
- **模板**: 实例所基于的配置模板（OpenAI、Qwen、ZhiPu 等）
- **选中模型**: 当前实例使用的模型 ID
- **创建时间**: 实例创建的时间
- **更新时间**: 最后更新的时间
- **标签**: 
  - "默认" - 系统默认实例
  - "当前" - 当前激活的实例

### 创建新实例

1. 点击页面右上角的 **"创建实例"** 按钮
2. 在弹出的对话框中填写信息：
   - **配置模板**: 选择提供商（OpenAI、Qwen、ZhiPu、Moonshot、Spark）
   - **实例名称**: 给实例起一个有意义的名称
   - **选择模型**: 从可用模型列表中选择一个
   - **密钥配置**: 展开并填写 API Key 等敏感信息
   - **高级配置**: （可选）展开并配置额外参数
3. 点击 **"确定"** 创建实例

示例：创建一个 OpenAI 实例
```
配置模板: openai
实例名称: 我的 GPT-4 实例
选择模型: gpt-4o
密钥配置:
  - apiKey: sk-your-openai-api-key
```

### 编辑实例

1. 找到要编辑的实例行
2. 点击 **"编辑"** 按钮
3. 在对话框中修改配置：
   - 可以修改实例名称
   - 可以更改选择的模型
   - 可以更新密钥（留空表示不修改）
   - 可以调整高级配置
4. 点击 **"确定"** 保存更改

### 删除实例

1. 找到要删除的实例行
2. 点击 **"删除"** 按钮（红色）
3. 在确认对话框中点击 **"确定"**

**注意**: 
- 默认实例不能被删除
- 删除实例会同时删除其关联的密钥信息
- 如果删除的是当前实例，系统会自动切换到其他可用实例

### 切换当前实例

1. 找到要设为当前的实例行
2. 点击 **"设为当前"** 按钮
3. 该实例将成为系统的默认实例，用于聊天等操作

当前实例会显示绿色的"当前"标签。

## 聊天功能

### 访问聊天页面

点击顶部导航栏的 **"聊天"** 菜单项，或访问 `http://localhost:5173/chat`

### 选择实例

在页面顶部的下拉菜单中选择要使用的实例：
- 下拉菜单显示实例名称和其选中的模型
- 选择后会自动切换系统的当前实例
- 切换成功会显示提示消息

### 发送消息

1. 在页面底部的输入框中输入你的消息
2. 发送消息的方式：
   - 按 **Enter** 键发送
   - 按 **Shift + Enter** 换行（不发送）
   - 点击 **"发送"** 按钮

### 查看响应

- AI 的响应会实时流式显示在聊天区域
- 用户消息显示蓝色头像
- AI 消息显示绿色头像
- 支持多轮对话，历史消息会保留

### 清空对话

点击页面右上角的 **"清空对话"** 按钮可以删除所有消息，开始新的对话。

## 配置模板说明

系统支持以下配置模板：

### 1. OpenAI
- **模型**: gpt-4o, gpt-4, gpt-3.5-turbo 等
- **必需密钥**: apiKey
- **用途**: 使用 OpenAI 的 GPT 模型

### 2. Qwen (阿里云)
- **模型**: qwen-plus, qwen-turbo 等
- **必需密钥**: apiKey
- **用途**: 使用阿里云的 Qwen 系列模型

### 3. ZhiPu (智谱 AI)
- **模型**: glm-4, glm-3-turbo 等
- **必需密钥**: apiKey
- **用途**: 使用智谱 AI 的 GLM 系列模型

### 4. Moonshot (Kimi)
- **模型**: moonshot-v1-32k, moonshot-v1-8k 等
- **必需密钥**: apiKey
- **用途**: 使用 Moonshot AI 的 Kimi 模型

### 5. Spark (讯飞星火)
- **模型**: spark-v3, spark-v2 等
- **必需密钥**: appId, apiKey, apiSecret
- **用途**: 使用讯飞星火大模型

## 开发说明

### 技术栈

- **React 18**: 前端框架
- **TypeScript**: 类型安全
- **Vite**: 构建工具
- **Ant Design 5**: UI 组件库
- **React Router 6**: 路由管理
- **Axios**: HTTP 客户端

### 项目结构

```
packages/web/
├── src/
│   ├── api/           # API 客户端
│   │   ├── client.ts  # Axios 配置
│   │   ├── instances.ts
│   │   ├── templates.ts
│   │   ├── models.ts
│   │   └── chat.ts
│   ├── components/    # React 组件
│   │   ├── Layout.tsx
│   │   └── InstanceModal.tsx
│   ├── pages/         # 页面组件
│   │   ├── InstancesPage.tsx
│   │   └── ChatPage.tsx
│   ├── types/         # TypeScript 类型定义
│   │   └── index.ts
│   ├── App.tsx        # 主应用组件
│   ├── main.tsx       # 入口文件
│   └── index.css      # 全局样式
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### 开发命令

```bash
# 开发模式
pnpm dev:web

# 类型检查
cd packages/web && pnpm tsc --noEmit

# 构建
pnpm build:web

# 预览构建
cd packages/web && pnpm preview

# 清理构建产物
cd packages/web && pnpm clean
```

### API 代理配置

Vite 开发服务器配置了 API 代理，将 `/api` 路径的请求代理到 `http://localhost:3000`：

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

## 部署

### 构建生产版本

```bash
pnpm build:web
```

构建产物位于 `packages/web/dist/` 目录。

### 部署到静态文件服务器

可以使用任何静态文件服务器部署，例如：

#### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /path/to/packages/web/dist;
    index index.html;
    
    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API 代理
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Docker 部署

创建 `Dockerfile`:

```dockerfile
# 构建阶段
FROM node:18 as builder
WORKDIR /app
COPY . .
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm build:web

# 运行阶段
FROM nginx:alpine
COPY --from=builder /app/packages/web/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 环境变量

如果需要配置不同的 API 服务器地址，可以修改 `vite.config.ts` 或在 Nginx 中配置代理。

## 故障排除

### 无法连接到 API 服务器

**问题**: Web 界面显示 "请求失败" 或网络错误

**解决方案**:
1. 确认 API 服务器正在运行: `http://localhost:3000`
2. 检查浏览器控制台的网络请求
3. 验证 Vite 代理配置是否正确

### 实例创建失败

**问题**: 创建实例时显示错误

**解决方案**:
1. 确认所有必填字段都已填写
2. 验证 API Key 是否有效
3. 检查 API 服务器日志查看详细错误

### 聊天无响应

**问题**: 发送消息后没有响应

**解决方案**:
1. 确认已选择一个实例
2. 验证实例的 API Key 配置正确
3. 检查网络连接和 API 服务状态
4. 查看浏览器控制台的错误信息

### 流式响应不工作

**问题**: 消息一次性显示而不是逐步显示

**解决方案**:
1. 确认模型支持流式输出
2. 检查网络连接是否稳定
3. 验证 SSE (Server-Sent Events) 是否被正确处理

## 最佳实践

1. **实例命名**: 使用有意义的名称，如 "生产环境 GPT-4" 或 "测试用 Qwen"
2. **密钥管理**: 定期更新 API 密钥，不要在实例名称中包含敏感信息
3. **模型选择**: 根据任务需求选择合适的模型（考虑成本、性能、token 限制）
4. **多实例使用**: 为不同的用途创建不同的实例，方便管理和切换
5. **对话管理**: 定期清空长对话以避免 token 超限

## 许可证

MIT

## 支持

如有问题，请：
1. 查看项目文档
2. 检查 GitHub Issues
3. 提交新的 Issue 描述问题
