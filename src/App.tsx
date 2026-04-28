import { useState, useEffect } from 'react'
import {
  Activity,
  AlertTriangle,
  RefreshCw,
  Plus,
  Minus,
  Trash,
  Server,
  Zap,
} from 'lucide-react'
import './App.css'

interface MonitorData {
  name: string
  corePoolSize: number
  maximumPoolSize: number
  activeCount: number
  queueSize: number
  queueCapacity: number
  queueUsage: number
  taskCount: number
  rejectCount: number
  loadFactor: number
  loadLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  isOverloaded: boolean
  uptime: number
}

interface HealthData {
  name: string
  status: 'HEALTHY' | 'WARNING'
  loadFactor: number
  loadLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  queueUsage: number
}

type PoolListItem = MonitorData

const API_BASE = '/api/threadpool'

const loadLevelColors = {
  LOW: 'bg-green-500',
  MEDIUM: 'bg-yellow-500',
  HIGH: 'bg-orange-500',
  CRITICAL: 'bg-red-500',
}

const loadLevelTextColors = {
  LOW: 'text-green-600',
  MEDIUM: 'text-yellow-600',
  HIGH: 'text-orange-600',
  CRITICAL: 'text-red-600',
}

function formatUptime(ms: number): string {
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  return `${hours}h ${minutes}m`
}

function formatLoadLevel(level: string): string {
  const map: Record<string, string> = { LOW: '正常', MEDIUM: '注意', HIGH: '警告', CRITICAL: '严重' }
  return map[level] || level
}

export default function App() {
  const [pools, setPools] = useState<PoolListItem[]>([])
  const [selectedPool, setSelectedPool] = useState<string | null>(null)
  const [monitorData, setMonitorData] = useState<MonitorData | null>(null)
  const [healthData, setHealthData] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updateForm, setUpdateForm] = useState({ corePoolSize: '', maximumPoolSize: '' })
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState(5000)

  const fetchPools = async () => {
    try {
      const res = await fetch(`${API_BASE}/monitor/all`)
      const json = await res.json()
      if (json.code === 200) {
        setPools(json.data)
        if (json.data.length > 0 && !selectedPool) {
          setSelectedPool(json.data[0].name)
        }
      }
    } catch (e) {
      setError('获取线程池列表失败')
    }
  }

  const fetchMonitor = async (name: string) => {
    try {
      const res = await fetch(`${API_BASE}/monitor/${name}`)
      const json = await res.json()
      if (json.code === 200) setMonitorData(json.data)
    } catch (e) {
      console.error('获取监控数据失败')
    }
  }

  const fetchHealth = async (name: string) => {
    try {
      const res = await fetch(`${API_BASE}/health/${name}`)
      const json = await res.json()
      if (json.code === 200) setHealthData(json.data)
    } catch (e) {
      console.error('获取健康状态失败')
    }
  }

  useEffect(() => {
    fetchPools()
  }, [])

  useEffect(() => {
    if (selectedPool) {
      fetchMonitor(selectedPool)
      fetchHealth(selectedPool)
    }
  }, [selectedPool])

  useEffect(() => {
    if (!autoRefresh) return
    const timer = setInterval(() => {
      fetchPools()
      if (selectedPool) {
        fetchMonitor(selectedPool)
        fetchHealth(selectedPool)
      }
    }, refreshInterval)
    return () => clearInterval(timer)
  }, [autoRefresh, selectedPool, refreshInterval])

  const handleUpdate = async () => {
    if (!selectedPool) return
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (updateForm.corePoolSize) params.append('corePoolSize', updateForm.corePoolSize)
      if (updateForm.maximumPoolSize) params.append('maximumPoolSize', updateForm.maximumPoolSize)
      const res = await fetch(`${API_BASE}/update/${selectedPool}?${params}`, { method: 'POST' })
      const json = await res.json()
      if (json.code === 200) {
        fetchPools()
        fetchMonitor(selectedPool)
        setUpdateForm({ corePoolSize: '', maximumPoolSize: '' })
      } else {
        setError(json.message || '更新失败')
      }
    } catch (e) {
      setError('更新失败')
    }
    setLoading(false)
  }

  const handleDelete = async (name: string) => {
    if (!confirm(`确定删除线程池 ${name}？`)) return
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/delete/${name}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.code === 200) {
        if (selectedPool === name) setSelectedPool(null)
        fetchPools()
      } else {
        setError(json.message || '删除失败')
      }
    } catch (e) {
      setError('删除失败')
    }
    setLoading(false)
  }

  const handleTestAll = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/test`, { method: 'POST' })
      const json = await res.json()
      if (json.code === 200) {
        fetchPools()
        if (selectedPool) fetchMonitor(selectedPool)
      } else {
        setError(json.message || '测试失败')
      }
    } catch (e) {
      setError('测试失败')
    }
    setLoading(false)
  }

  const handleTestPool = async (name: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/test/${name}?count=5`, { method: 'POST' })
      const json = await res.json()
      if (json.code === 200) {
        fetchPools()
        fetchMonitor(name)
      } else {
        setError(json.message || '测试失败')
      }
    } catch (e) {
      setError('测试失败')
    }
    setLoading(false)
  }

  const selectedPoolData = pools.find((p) => p.name === selectedPool)

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Server className="w-8 h-8 text-blue-500" />
            <h1 className="text-xl font-bold">动态线程池监控面板</h1>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <span>自动刷新</span>
              <select
                value={autoRefresh ? refreshInterval : ''}
                onChange={(e) => {
                  const val = e.target.value
                  if (val) {
                    setRefreshInterval(Number(val))
                    setAutoRefresh(true)
                  } else {
                    setAutoRefresh(false)
                  }
                }}
                className="bg-gray-800 rounded px-2 py-1"
              >
                <option value="">关闭</option>
                <option value="3000">3秒</option>
                <option value="5000">5秒</option>
                <option value="10000">10秒</option>
                <option value="30000">30秒</option>
              </select>
            </label>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-72 flex-shrink-0">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  线程池列表
                </h2>
                <div className="flex gap-1">
                  <button onClick={handleTestAll} className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors" title="向所有线程池提交测试任务">
                    <Zap className="w-4 h-4 text-yellow-500" />
                  </button>
                  <button onClick={fetchPools} className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
              {pools.length === 0 ? (
                <p className="text-gray-500 text-sm">暂无线程池</p>
              ) : (
                <ul className="space-y-2">
                  {pools.map((pool) => (
                    <li key={pool.name}>
                      <button
                        onClick={() => setSelectedPool(pool.name)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedPool === pool.name
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-800'
                        }`}
                      >
                        <div className="font-medium text-sm">{pool.name}</div>
                        <div className="text-xs opacity-70 mt-1">
                          核心: {pool.corePoolSize}/{pool.maximumPoolSize}
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleTestPool(pool.name); }}
                          className="mt-1 text-xs text-yellow-500 hover:text-yellow-400 flex items-center gap-1"
                        >
                          <Zap className="w-3 h-3" /> 测试
                        </button>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {error && (
              <div className="bg-red-900/30 border border-red-800 rounded-xl p-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className="text-red-400">{error}</span>
              </div>
            )}

            {selectedPool && selectedPoolData && (
              <>
                {/* Overview Cards */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                    <div className="text-sm text-gray-400 mb-1">核心线程数</div>
                    <div className="text-2xl font-bold">{selectedPoolData.corePoolSize}</div>
                  </div>
                  <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                    <div className="text-sm text-gray-400 mb-1">最大线程数</div>
                    <div className="text-2xl font-bold">{selectedPoolData.maximumPoolSize}</div>
                  </div>
                  <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                    <div className="text-sm text-gray-400 mb-1">活跃线程</div>
                    <div className="text-2xl font-bold">{selectedPoolData.activeCount}</div>
                  </div>
                  <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                    <div className="text-sm text-gray-400 mb-1">队列大小</div>
                    <div className="text-2xl font-bold">{selectedPoolData.queueSize}/{selectedPoolData.queueCapacity}</div>
                  </div>
                </div>

                {/* Health & Stats */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Health Status */}
                  {healthData && (
                    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                      <h3 className="font-semibold mb-4">健康状态</h3>
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-3 h-3 rounded-full ${healthData.status === 'HEALTHY' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        <span className="text-lg font-medium">
                          {healthData.status === 'HEALTHY' ? '正常' : '警告'}
                        </span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">负载因子</span>
                          <span className="font-medium">{healthData.loadFactor.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">负载等级</span>
                          <span className={`font-medium ${loadLevelTextColors[healthData.loadLevel]}`}>
                            {formatLoadLevel(healthData.loadLevel)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">队列使用率</span>
                          <span className="font-medium">{healthData.queueUsage.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Monitor Details */}
                  {monitorData && (
                    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                      <h3 className="font-semibold mb-4">监控指标</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">任务总数</span>
                          <span className="font-medium">{monitorData.taskCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">拒绝次数</span>
                          <span className="font-medium">{monitorData.rejectCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">队列使用率</span>
                          <span className="font-medium">{monitorData.queueUsage.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">运行时长</span>
                          <span className="font-medium">{formatUptime(monitorData.uptime)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">过载状态</span>
                          <span className={`font-medium ${monitorData.isOverloaded ? 'text-red-500' : 'text-green-500'}`}>
                            {monitorData.isOverloaded ? '是' : '否'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Load Level Bar */}
                {monitorData && (
                  <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                    <h3 className="font-semibold mb-4">负载等级</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-4 rounded-full overflow-hidden flex">
                        <div className="h-full bg-green-500" style={{ width: '50%' }} />
                        <div className="h-full bg-yellow-500" style={{ width: '20%' }} />
                        <div className="h-full bg-orange-500" style={{ width: '20%' }} />
                        <div className="h-full bg-red-500" style={{ width: '10%' }} />
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${loadLevelColors[monitorData.loadLevel]}`}>
                        {formatLoadLevel(monitorData.loadLevel)}
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>0%</span>
                      <span>50%</span>
                      <span>70%</span>
                      <span>90%</span>
                      <span>100%</span>
                    </div>
                  </div>
                )}

                {/* Update Form */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                  <h3 className="font-semibold mb-4">动态调整参数</h3>
                  <div className="flex gap-4 items-end">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">核心线程数</label>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setUpdateForm(f => ({ ...f, corePoolSize: String(Math.max(1, Number(f.corePoolSize || selectedPoolData.corePoolSize) - 1)) }))} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg">
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          value={updateForm.corePoolSize || selectedPoolData.corePoolSize}
                          onChange={(e) => setUpdateForm(f => ({ ...f, corePoolSize: e.target.value }))}
                          className="w-24 bg-gray-800 rounded-lg px-3 py-2 text-center"
                        />
                        <button onClick={() => setUpdateForm(f => ({ ...f, corePoolSize: String(Number(f.corePoolSize || selectedPoolData.corePoolSize) + 1) }))} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">最大线程数</label>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setUpdateForm(f => ({ ...f, maximumPoolSize: String(Math.max(1, Number(f.maximumPoolSize || selectedPoolData.maximumPoolSize) - 1)) }))} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg">
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          value={updateForm.maximumPoolSize || selectedPoolData.maximumPoolSize}
                          onChange={(e) => setUpdateForm(f => ({ ...f, maximumPoolSize: e.target.value }))}
                          className="w-24 bg-gray-800 rounded-lg px-3 py-2 text-center"
                        />
                        <button onClick={() => setUpdateForm(f => ({ ...f, maximumPoolSize: String(Number(f.maximumPoolSize || selectedPoolData.maximumPoolSize) + 1) }))} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={handleUpdate}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {loading ? '更新中...' : '更新'}
                    </button>
                    <button
                      onClick={() => handleDelete(selectedPool!)}
                      className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            )}

            {!selectedPool && (
              <div className="flex items-center justify-center h-64 text-gray-500">
                请从左侧选择一个线程池
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
