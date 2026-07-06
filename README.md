# Mify

Mini Dify — 简版 AI Agent 开发平台，可本地部署，面向团队内部小规模使用（20-50 人同时在线）。

## 技术栈

| 层级   | 技术                                      |
| ------ | ----------------------------------------- |
| 后端   | Spring Boot 3.x + MyBatis-Plus + MySQL 8.x |
| 缓存   | Redis 7.x                                 |
| 向量库 | pgvector                                  |
| 前端   | Vue 3 + TypeScript + Element Plus + Vite  |
| 部署   | Docker + K8s                              |

## 功能模块

| 模块       | 说明                                                           |
| ---------- | -------------------------------------------------------------- |
| Provider   | 管理 OpenAI / Claude / Gemini / Ollama 等 LLM Provider 及模型配置 |
| Agent      | 配置 Agent 名称、系统提示词、绑定模型、关联知识库和 MCP 工具   |
| Chat       | 多轮对话、历史记录、SSE 流式响应                               |
| Knowledge  | 文档上传 → 异步向量化 → pgvector 余弦搜索 → 注入 LLM 上下文    |
| Workflow   | 顺序节点执行：开始 → LLM → 条件分支 → 工具调用 → 结束          |
| MCP        | 接入外部 MCP 工具，供 Agent 和工作流调用                       |

## 项目结构

```
mify/
├── mify-app/            # 启动模块，Spring Boot Application
├── mify-provider/       # 模型提供商管理
├── mify-agent/          # Agent 管理与配置
├── mify-chat/           # 对话引擎
├── mify-mcp/            # MCP 工具管理与调用
├── mify-workflow/       # 工作流编排与执行
├── mify-knowledge/      # 知识库与 RAG
├── mify-common/         # 公共模块（工具类、常量、异常、DTO 基类）
├── mify-web/            # Vue 前端
├── deploy/              # Docker + K8s 部署配置
├── CLAUDE.md            # 项目规范（架构、编码、数据库、接口、Git 规范）
└── pom.xml              # Maven 父 POM
```

## 快速开始

### 环境要求

- JDK 17+
- Maven 3.8+
- MySQL 8.x
- Redis 7.x
- PostgreSQL 15+（需安装 pgvector 扩展）
- Node.js 18+（前端开发）

### 本地开发

```bash
# 1. 创建数据库
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS mify DEFAULT CHARACTER SET utf8mb4;"

# 2. 构建并安装所有模块到本地仓库
mvn clean install -DskipTests

# 3. 启动后端（端口 8080）
cd mify-app
mvn spring-boot:run

# 4. 启动前端（新终端）
cd mify-web
npm install
npm run dev
```

### Docker 部署

```bash
docker compose -f deploy/docker-compose.yml up -d
```

## 接口概览

所有接口遵循 RESTful 风格，路径前缀 `/api/v1/`，统一响应格式：

```json
{ "code": 200, "message": "success", "data": {} }
```

| 资源       | 端点                            |
| ---------- | ------------------------------- |
| Provider   | `/api/v1/providers`             |
| Agent      | `/api/v1/agents`                |
| Chat       | `/api/v1/chat/sessions`         |
| MCP        | `/api/v1/mcp/servers`           |
| Workflow   | `/api/v1/workflows`             |
| Knowledge  | `/api/v1/knowledge-bases`       |

## 项目规范

详见 [CLAUDE.md](CLAUDE.md)，涵盖架构设计、代码组织、数据库规范、接口规范、编码规范（基于阿里巴巴 Java 开发手册）、Git 规范。

## License

MIT
