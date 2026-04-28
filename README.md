# 动态线程池监控面板

基于 React + TypeScript + Vite 的线程池监控前端面板，实时展示线程池状态、监控指标、健康状态，支持动态调整线程池参数。

## 功能特性

- **线程池列表** - 查看所有已注册线程池
- **实时监控** - 核心/最大线程数、活跃线程、队列大小、负载因子等
- **健康状态** - 负载等级（LOW/MEDIUM/HIGH/CRITICAL）直观展示
- **动态调整** - 运行时调整核心线程数和最大线程数
- **自动刷新** - 支持 3s / 5s / 10s / 30s 自动刷新
- **测试任务** - 向线程池提交测试任务验证负载

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build
```

## 配置

前端默认代理到 `http://localhost:8080`，如需修改请编辑 `vite.config.ts`：

```ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080', // 修改为你的后端地址
      changeOrigin: true,
    },
  },
},
```

## API 接口

后端需提供以下接口（详见 `api-doc.md`）：

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/threadpool/monitor/all` | GET | 获取所有线程池监控指标 |
| `/api/threadpool/monitor/{name}` | GET | 获取指定线程池监控指标 |
| `/api/threadpool/health/{name}` | GET | 获取线程池健康状态 |
| `/api/threadpool/update/{name}` | POST | 更新线程池参数 |
| `/api/threadpool/delete/{name}` | DELETE | 删除线程池 |
| `/api/threadpool/test/{name}` | POST | 向指定线程池提交测试任务 |
| `/api/threadpool/test` | POST | 向所有线程池提交测试任务 |

## 技术栈

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React（图标）
