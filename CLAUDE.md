# Mify项目规范

## 项目概述

Mify是一个简版的 AI Agent 开发平台（参考 Dify）, 意为Mini Dify，可本地部署，面向团队内部小规模使用（20-50 人同时在线）。

技术栈：Spring Boot 3.x + MyBatis-Plus + MySQL 8.x + Redis 7.x + pgvector

前端：Vue 3 + TypeScript + Element Plus + Vite

容器化：Docker + K8s

### 做什么

| 模块                      | 说明                                                                       |
| ------------------------- | -------------------------------------------------------------------------- |
| 模型提供商管理 (provider) | 管理 OpenAI / Claude / Gemini / Ollama 等 LLM Provider 及模型配置，支持连通性测试 |
| Agent 配置 (agent)        | 配置 Agent 名称、系统提示词、绑定模型、关联知识库和 MCP 工具               |
| 对话引擎 (chat)           | 多轮对话、历史记录、SSE 流式响应                                           |
| 知识库 RAG (knowledge)    | 文档上传 → 异步向量化 → pgvector 余弦搜索 → 注入 LLM 上下文                |
| 简版工作流 (workflow)     | 顺序节点执行：开始 → LLM → 条件分支 → 工具调用 → 结束                      |
| MCP 工具接入 (mcp)        | 接入外部 MCP 工具，供 Agent 和工作流调用                                   |

### 不做什么

- 不做可视化工作流拖拽编排
- 不做多租户 / 权限体系
- 不做插件市场、计费系统
- 不做消息推送、WebSocket 长连接（用 SSE 替代）

---

## 架构

### 整体结构

模块化单体。一个 Spring Boot 应用，Maven 多模块组织。 模块间通过 Service 接口调用，不直接引用其他模块的实现类，为后续微服务拆分留口子。

### 模块划分

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
└── deploy/              # Docker + K8s 部署配置
```

### 模块依赖关系

- mify-chat → mify-agent, mify-provider（对话时读取 Agent 配置和模型配置）
- mify-chat → mify-workflow（对话可能触发工作流）
- mify-chat → mify-knowledge（对话可能走 RAG 检索）
- mify-agent → mify-mcp（Agent 绑定工具）
- mify-workflow → mify-mcp（工作流中工具调用节点需调用 MCP 工具）
- mify-knowledge → mify-provider（embedding 向量化需调用 LLM 提供商）
- 所有业务模块 → mify-common
- mify-app → 所有业务模块（启动入口）

### 外部调用处理

- LLM 调用使用独立线程池（llmExecutor），和业务请求隔离
- Resilience4j 熔断，每个提供商独立熔断器
  - slidingWindowSize: 10
  - failureRateThreshold: 50%
  - waitDurationInOpenState: 30s
- 对话接口 60s 超时，连通性测试 10s 超时
- 重试策略按异常类型区分：网络抖动重试，认证失败不重试，限流退避重试
- 流式响应使用 SseEmitter + 独立线程池

### 缓存策略

- Provider / Agent 配置：Redis Cache-Aside，TTL 30min
- 对话上下文：Redis，TTL 2h，key = session:{sessionId}
- 对话消息持久化走 MySQL，不缓存
- MCP Server 配置数量少，不缓存

### 部署架构（当前 50 人规模）

Nginx（静态文件 + API 反向代理）→ Spring Boot → MySQL / Redis / pgvector / LLM API

- Nginx 配置 SSE 需要 proxy_buffering off
- 全部组件 Docker 镜像化，K8s 部署
- 本地开发直接 java -jar + npm run dev

### 扩展路径（几千人规模，当前不做但不堵死）

1. chat 模块拆分独立部署，水平扩展
2. MySQL 读写分离
3. Redis 单实例 → 集群
4. 引入消息队列做异步处理（对话日志异步写入）

---

## 代码组织

### 后端模块内部结构

每个业务模块统一结构：

```
src/main/java/com/mify/{module}/
├── controller/        # REST 接口，只做参数校验和调用 Service
├── service/           # 业务逻辑接口
├── service/impl/      # 业务逻辑实现
├── mapper/            # MyBatis-Plus Mapper
├── entity/            # 数据库实体
├── dto/               # 请求/响应对象
├── config/            # 模块级配置类
├── exception/         # 模块级自定义异常
└── constant/          # 模块级常量
```

### 分层规则

- Controller 只做参数校验和调用 Service，不写业务逻辑
- Service 处理所有业务逻辑
- 跨模块调用走 Service 接口，不直接引用其他模块的 Mapper 或 Entity
- 公共工具类、基类放 mify-common

### 前端结构

```
mify-web/src/
├── api/               # 接口调用，按模块分文件
├── components/        # 公共组件
├── composables/       # 组合式函数
├── router/            # 路由配置
├── types/             # TypeScript 类型定义
├── utils/             # 工具函数（request.ts 等）
├── views/             # 页面组件，按模块分目录
│   ├── provider/
│   ├── agent/
│   └── chat/
└── App.vue
```

---

## 数据库规范

- 表名：小写下划线，不加前缀。例如 provider、chat_message
- 字段名：小写下划线。例如 api_key、base_url
- 主键：统一用 id，bigint 自增
- 时间字段：created_at、updated_at，datetime 类型
- 逻辑删除：deleted，tinyint，0=正常 1=删除
- 索引命名：idx*{表名}*{字段名}
- 所有外键在应用层维护，不建数据库级外键约束
- 字符集：utf8mb4
- 大表预判：chat_message 增长最快，提前考虑分页查询性能
- 分页查询避免 SELECT COUNT(\*)，用游标分页或估算总数

### 核心数据模型

```
provider (模型提供商)
  └── model_config (模型配置) [1:N]

agent (Agent 配置)
  ├── → model_config [N:1]
  ├── ↔ mcp_server (MCP 工具) [M:N, 通过 agent_tool]
  └── → chat_session (对话会话) [1:N]
        └── → chat_message (对话消息) [1:N]

workflow (工作流定义)
  ├── → workflow_node (节点) [1:N]
  └── → workflow_edge (连线) [1:N]

knowledge_base (知识库)
  └── → document (文档) [1:N]
        └── → document_chunk (文档分块) [1:N]
```

具体表字段详见 docs/er-diagram.md

---

## 接口规范

### 路径

RESTful 风格：/api/v1/{资源复数名}

```
GET    /api/v1/providers          # 列表（分页）
POST   /api/v1/providers          # 创建
GET    /api/v1/providers/{id}     # 详情
PUT    /api/v1/providers/{id}     # 更新
DELETE /api/v1/providers/{id}     # 删除
POST   /api/v1/providers/{id}/test-connection  # 非 CRUD 操作用动词
```

### 统一响应

所有接口返回 Result：

```
{ "code": 200, "message": "success", "data": {...} }
```

### 分页

- 请求：page（从 1 开始）、pageSize（默认 20，最大 100）
- 响应：Result<PageResult>，PageResult 包含 list、total、page、pageSize

### 空值处理

- 列表字段空时返回 []，不返回 null
- 字符串字段空时返回 ""，不返回 null
- 对象不存在时返回 null

### 错误码

四位数字，按模块分段：

```
1000-1999  通用（参数错误、未授权、系统内部错误等）
2000-2999  Provider
3000-3999  Agent
4000-4999  Chat
5000-5999  MCP
6000-6999  Workflow
7000-7999  Knowledge
```

---

## 编码规范（基于阿里巴巴 Java 开发手册）

### 命名

1. **类名用 UpperCamelCase**，方法名、变量名用 lowerCamelCase，常量用 UPPER_SNAKE_CASE，包名全小写无下划线。
2. **禁止用拼音或拼音缩写**命名，禁止单字母变量（循环变量 `i/j/k` 除外）。
3. **方法名体现动词**：查询用 `get/list/query`，修改用 `update`，删除用 `delete/remove`，新增用 `create/add`，布尔返回值用 `is/has/can`。
4. **Service 接口不加 I 前缀**，实现类加 `Impl` 后缀（`AgentService` + `AgentServiceImpl`）。
5. 数据库列名用 snake_case；PO 类用 `Po` 后缀，DTO 用 `Dto`/`Request`/`Response`，Mapper 用 `Mapper` 后缀。

### 异常处理

6. **禁止 catch 后 `e.printStackTrace()` 或空 catch**,必须记录日志或向上抛出。
7. **业务异常统一抛 `BizException(ErrorCode)`**,不用 RuntimeException 传递业务语义。
8. **只在顶层 (GlobalExceptionHandler)处理并转换为 HTTP 响应**,中间层不捕获再包装。
9. **finally 块不写 return**,不在 finally 中抛出新异常 (会吞掉原始异常)。
10. **NPE 防御**:方法返回值优先返回空集合 (`Collections.emptyList()`)而非 null,接口入参用 `@NonNull`/`@Valid` 注解声明约束。

### 日志

11. **使用 SLF4J 接口 + Logback 实现**,类中用 `@Slf4j` (Lombok),禁止用 `System.out.println`。
12. **禁止在循环体内打日志**,高频路径只在异常分支记录。
13. **占位符格式 `log.info("xxx {}", var)`**,禁止字符串拼接 (避免无效 toString 开销)。
14. **日志分级约定**:DEBUG=详细调试,INFO=关键业务节点,WARN=可恢复异常或配置缺失,ERROR=需人工介入的故障。生产环境 INFO 级别,日志文件按天滚动,保留 30 天。
15. **LLM 调用必须记录**:provider、model、耗时、token 数、是否命中缓存,便于成本分析。

### 并发

16. **线程池必须显式创建** (`ThreadPoolExecutor`),禁止用 `Executors.newFixedThreadPool` (无界队列 OOM)。
17. **ThreadLocal 用完必须 `remove()`**,防止线程池场景下数据泄漏。
18. **加锁粒度最小化**:只锁共享变量操作,不锁 I/O 和 LLM 调用；优先用 `ReentrantLock` 替代 `synchronized` (可设超时)。
19. **单例 Bean 的成员变量必须是线程安全的**:无状态 Service 天然安全；有状态则用 `ThreadLocal` 或局部变量,禁止用实例变量存请求上下文。
20. **`CompletableFuture` 异步调用必须指定线程池** (`supplyAsync(task, llmExecutor)`),禁止用默认 `ForkJoinPool.commonPool()` (会影响其他异步任务)。

---

## 行为指令

### 写代码时

- 每个功能用最简单直接的方式实现
- 不引入不必要的设计模式，除非我明确要求
- 不做过度抽象，不过度工程化
- 不引入技术栈以外的依赖，需要时先问我
- 所有外部调用必须有超时设置
- 配置项外化到 application.yml，不硬编码
- 异常处理必须使用 ErrorCode 枚举，禁止硬编码错误码和错误信息

### 改代码时

- 先理解相关模块的设计意图
- 不要为了新功能破坏已有接口契约
- 改完确保已有测试通过

### 不确定时

- 架构选择给我 2-3 个方案对比，我来拍板
- 规范没覆盖的情况，先问我，不要自己编规矩

### 线程池使用

- LLM 调用必须使用 @Qualifier("llmExecutor") 注入的线程池
- 异步非关键任务使用 @Qualifier("asyncExecutor")
- 禁止在业务代码中 new Thread() 或使用默认线程池

---

## Git 规范

### 分支工作流

所有代码修改通过 feature 分支进行，不直接在 master 上提交：

1. 从 `master` 切出分支：`feature/<描述>` 或 `fix/<描述>`
2. 在分支上开发并提交
3. Push 前先 rebase：`git fetch origin && git rebase origin/master`
4. Push 分支到远程，提交 Pull Request
5. 代码 Review 通过后 merge 到 master
6. Merge 完成后删除 feature 分支，继续下一任务

```
master ← feature/xxx → 开发提交 → rebase master → push → Review → Merge → 下一任务
```

### 提交信息格式

遵循 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/) 格式：

```
<type>(<scope>): <subject>

<body>
```

#### type

| type     | 说明                   |
| -------- | ---------------------- |
| feat     | 新功能                 |
| fix      | 修复 Bug               |
| docs     | 文档更新               |
| style    | 代码格式（不影响逻辑） |
| refactor | 重构（非新功能非修 Bug）|
| perf     | 性能优化               |
| test     | 测试相关               |
| chore    | 构建/工具/依赖变更     |
| ci       | CI/CD 配置变更         |

#### scope

使用模块名，与目录名对应：

```
provider, agent, chat, mcp, workflow, knowledge, common, web, deploy
```

跨模块改动可省略 scope 或用逗号分隔（如 `chat, agent`）。

#### subject

- 中文描述，简明扼要（不超过 50 字）
- 动词开头：新增、修复、重构、优化、移除、升级
- 不以句号结尾

#### body（可选）

- 说明改动原因、方案要点、breaking changes
- 关联 issue：`Closes #123` 或 `Refs #456`

#### 示例

```
feat(agent): 新增 Agent 绑定 MCP 工具接口
fix(chat): 修复 SSE 流式响应偶发断连问题
refactor(provider): 重构 LLM 调用超时配置，外化到 application.yml
docs: 更新 CLAUDE.md 项目规范
chore(deploy): 升级基础镜像到 openjdk-17-slim
```
