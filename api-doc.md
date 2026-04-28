{
  "基础信息": {
    "baseUrl": "http://localhost:8080/api/threadpool",
    "contentType": "application/json"
  },
  "接口列表": [
    {
      "name": "获取所有线程池列表",
      "url": "/list",
      "method": "GET",
      "description": "获取所有已注册的线程池概要信息",
      "response": {
        "code": 200,
        "data": [
          {
            "name": "orderPool",
            "corePoolSize": 10,
            "maximumPoolSize": 20,
            "activeCount": 5,
            "queueSize": 3,
            "queueCapacity": 50,
            "taskCount": 100,
            "stats": "[orderPool] 核心:10/20, 活跃:5, 队列:3/50, 总任务:100"
          }
        ],
        "total": 1
      }
    },
    {
      "name": "获取单个线程池详情",
      "url": "/info/{name}",
      "method": "GET",
      "description": "获取指定线程池的详细信息",
      "pathParams": {
        "name": "线程池名称，如 orderPool"
      },
      "response": {
        "code": 200,
        "data": {
          "name": "orderPool",
          "corePoolSize": 10,
          "maximumPoolSize": 20,
          "activeCount": 5,
          "queueSize": 3,
          "queueCapacity": 50,
          "taskCount": 100,
          "stats": "[orderPool] 核心:10/20, 活跃:5, 队列:3/50, 总任务:100"
        }
      },
      "errorResponse": {
        "code": 404,
        "message": "线程池不存在: orderPool"
      }
    },
    {
      "name": "动态更新线程池参数",
      "url": "/update/{name}",
      "method": "POST",
      "description": "运行时动态调整线程池参数",
      "pathParams": {
        "name": "线程池名称"
      },
      "queryParams": {
        "corePoolSize": "核心线程数（可选）",
        "maximumPoolSize": "最大线程数（可选）"
      },
      "requestExample": {
        "corePoolSize": 15,
        "maximumPoolSize": 30
      },
      "successResponse": {
        "code": 200,
        "message": "更新成功",
        "data": {
          "name": "orderPool",
          "corePoolSize": 15,
          "maximumPoolSize": 30,
          "activeCount": 5,
          "queueSize": 3,
          "queueCapacity": 50,
          "taskCount": 100,
          "stats": "[orderPool] 核心:15/30, 活跃:5, 队列:3/50, 总任务:100"
        }
      },
      "errorResponse": {
        "code": 400,
        "message": "corePoolSize不能大于maximumPoolSize"
      }
    },
    {
      "name": "删除线程池",
      "url": "/delete/{name}",
      "method": "DELETE",
      "description": "关闭并删除指定线程池",
      "pathParams": {
        "name": "线程池名称"
      },
      "successResponse": {
        "code": 200,
        "message": "线程池已关闭: orderPool"
      },
      "errorResponse": {
        "code": 404,
        "message": "线程池不存在: orderPool"
      }
    },
    {
      "name": "获取线程池监控指标",
      "url": "/monitor/{name}",
      "method": "GET",
      "description": "获取指定线程池的详细监控指标",
      "pathParams": {
        "name": "线程池名称"
      },
      "response": {
        "code": 200,
        "data": {
          "name": "orderPool",
          "corePoolSize": 10,
          "maximumPoolSize": 20,
          "activeCount": 5,
          "queueSize": 3,
          "queueCapacity": 50,
          "queueUsage": 6.0,
          "taskCount": 100,
          "rejectCount": 0,
          "loadFactor": 25.0,
          "loadLevel": "LOW",
          "isOverloaded": false,
          "uptime": 3600000
        }
      }
    },
    {
      "name": "获取所有线程池监控指标",
      "url": "/monitor/all",
      "method": "GET",
      "description": "获取所有线程池的监控指标列表",
      "response": {
        "code": 200,
        "data": [
          {
            "name": "orderPool",
            "corePoolSize": 10,
            "maximumPoolSize": 20,
            "activeCount": 5,
            "queueSize": 3,
            "queueCapacity": 50,
            "queueUsage": 6.0,
            "taskCount": 100,
            "rejectCount": 0,
            "loadFactor": 25.0,
            "loadLevel": "LOW",
            "isOverloaded": false,
            "uptime": 3600000
          }
        ],
        "total": 1
      }
    },
    {
      "name": "获取线程池健康状态",
      "url": "/health/{name}",
      "method": "GET",
      "description": "获取线程池健康状态，用于监控告警",
      "pathParams": {
        "name": "线程池名称"
      },
      "response": {
        "code": 200,
        "data": {
          "name": "orderPool",
          "status": "HEALTHY",
          "loadFactor": 25.0,
          "loadLevel": "LOW",
          "queueUsage": 6.0
        }
      }
    }
  ],
  "负载等级说明": {
    "LOW": "负载 < 50%，正常",
    "MEDIUM": "50% <= 负载 < 70%，注意",
    "HIGH": "70% <= 负载 < 90%，警告",
    "CRITICAL": "负载 >= 90%，严重"
  },
  "状态说明": {
    "HEALTHY": "正常",
    "WARNING": "过载（负载 > 80%）"
  }
}
---
Markdown 格式
# 动态线程池管理 API
**基础地址**: `http://localhost:8080/api/threadpool`
---
## 1. 获取所有线程池列表
**请求**
GET /api/threadpool/list
**响应**
```json
{
  "code": 200,
  "data": [
    {
      "name": "orderPool",
      "corePoolSize": 10,
      "maximumPoolSize": 20,
      "activeCount": 5,
      "queueSize": 3,
      "queueCapacity": 50,
      "taskCount": 100
    }
  ],
  "total": 1
}
---
2. 获取单个线程池详情
请求
GET /api/threadpool/info/{name}
参数: name - 线程池名称
响应
{
  "code": 200,
  "data": {
    "name": "orderPool",
    "corePoolSize": 10,
    "maximumPoolSize": 20,
    "activeCount": 5,
    "queueSize": 3,
    "queueCapacity": 50,
    "taskCount": 100,
    "stats": "[orderPool] 核心:10/20, 活跃:5, 队列:3/50, 总任务:100"
  }
}
---
3. 动态更新线程池参数
请求
POST /api/threadpool/update/{name}?corePoolSize=15&maximumPoolSize=30
参数:
- name - 线程池名称（路径）
- corePoolSize - 核心线程数（可选）
- maximumPoolSize - 最大线程数（可选）
响应
{
  "code": 200,
  "message": "更新成功",
  "data": { ... }
}
---
4. 删除线程池
请求
DELETE /api/threadpool/delete/{name}
响应
{
  "code": 200,
  "message": "线程池已关闭: orderPool"
}
---
5. 获取监控指标
请求
GET /api/threadpool/monitor/{name}
响应
{
  "code": 200,
  "data": {
    "name": "orderPool",
    "corePoolSize": 10,
    "maximumPoolSize": 20,
    "activeCount": 5,
    "queueSize": 3,
    "queueCapacity": 50,
    "queueUsage": 6.0,
    "taskCount": 100,
    "rejectCount": 0,
    "loadFactor": 25.0,
    "loadLevel": "LOW",
    "isOverloaded": false,
    "uptime": 3600000
  }
}
---
6. 获取所有监控指标
请求
GET /api/threadpool/monitor/all
---
7. 获取健康状态
请求
GET /api/threadpool/health/{name}
响应
{
  "code": 200,
  "data": {
    "name": "orderPool",
    "status": "HEALTHY",
    "loadFactor": 25.0,
    "loadLevel": "LOW",
    "queueUsage": 6.0
  }
}
---
负载等级
等级	负载范围	说明
LOW	< 50%	正常
MEDIUM	50-70%	注意
HIGH	70-90%	警告
CRITICAL	>= 90%	严重

---
8. 测试接口 - 向所有线程池提交测试任务
请求
POST /api/threadpool/test
描述: 向所有已注册的线程池各提交 5 个测试任务，每个任务执行 1 秒
响应
{
  "code": 200,
  "message": "已向所有线程池提交测试任务",
  "data": {
    "poolCount": 2,
    "taskCount": 10,
    "timestamp": 1714300800000
  }
}
---
9. 测试接口 - 向指定线程池提交测试任务
请求
POST /api/threadpool/test/{name}?count=10
路径参数
参数	类型
name	String
查询参数
参数	类型
count	int
响应
{
  "code": 200,
  "message": "已向线程池 [orderPool] 提交 10 个测试任务",
  "data": "[orderPool] 核心:10/20, 活跃:5, 队列:5/50, 总任务:10"
}
错误响应
{
  "code": 404,
  "message": "线程池不存在: orderPool"
}
---