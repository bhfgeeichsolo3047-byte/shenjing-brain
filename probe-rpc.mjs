import { apply } from './index.js'

const calls = []
const home = '/tmp/sjbrain-test'
const store = new Map()
const cred = {
  async resolve(ref){ return store.has(ref) ? { value: store.get(ref), source: 'file' } : undefined },
  async describe(ref){ return { configured: store.has(ref), source: store.has(ref) ? 'file' : undefined, writable: true } },
  async set(ref, v){ if(!v) throw new Error('empty'); store.set(ref, v) },
  async unset(ref){ store.delete(ref) },
}
let rpcHandler = null
const routes = new Map()
const ctx = {
  get(name){
    if(name === 'dshHomePath') return (seg) => home
    if(name === 'credentials') return cred
    if(name === 'connection') return { fetch: { register: (route) => { routes.set(route.path, route.fetch); return () => {} } } }
    return undefined
  },
  inject(names, fn){ if(names.includes('connection')) fn({ connection: ctx.get('connection') }) },
  on(){ return () => {} },
  effect(fn){ try { const d = fn(); return () => d && d() } catch { return () => {} } },
  logger: { info(){}, warn(){} },
  llm: {
    async listProviders(){ return [{ id: 'workbuddy', name: 'WorkBuddy' }, { id: 'buddy', name: 'Buddy' }] },
    async listModels(p){ return [{ id: 'deepseek-v4.1-flash', name: 'V4 Flash' }, { id: 'hy4-preview', name: 'HY4' }] },
    async resolveModelInfo(p, m){ return { reasoning: { efforts: [{ id: 'off', name: 'Off' }, { id: 'high', name: 'High' }], defaultEffort: 'high' } } },
    async *stream(){ yield { type: 'text-delta', text: '{"ok":true}' }; yield { type: 'finish', reason: { kind: 'stop' } } },
  },
}

const config = {
  enabled: true, provider: 'buddy', model: 'hy3', effort: '',
  emotionProvider: '', emotionModel: '', emotionEffort: '',
  memoryProvider: '', memoryModel: '', memoryEffort: '',
  expressionProvider: '', expressionModel: '', expressionEffort: '',
  expressionSource: 'dsh', emotionSource: 'dsh', memorySource: 'dsh',
  externalBaseUrl: '', externalApiKeyRef: 'SHENJING_BRAIN_API_KEY', externalModel: '',
  expressionExternalModel: '', expressionExternalEffort: '',
  emotionExternalModel: '', emotionExternalEffort: '',
  memoryExternalModel: '', memoryExternalEffort: '',
  expressionMode: 'dynamic', timeoutMs: 20000, recentTurns: 6, memoryLimit: 100, cooldownMs: 120000,
  archiveDir: '/tmp',
}

apply(ctx, config)
if (routes.size !== 5) throw new Error('RPC 路由未注册，实际 ' + routes.size)

const call = async (endpoint, payload) => {
  const fn = routes.get('/api/shenjing-brain.' + endpoint)
  if (!fn) return { ok: false, error: { code: 'not-found' } }
  const response = await fn({ json: async () => payload || {} })
  return await response.json()
}

const state = await call('state')
console.log('state.ok', state.ok, 'providers', state.value.providers.length, 'cred', JSON.stringify(state.value.credential))
console.log('state.config keys', Object.keys(state.value.config).length)

const models = await call('models', { provider: 'workbuddy' })
console.log('models', models.ok, JSON.stringify(models.value.models.map(m => m.id)))

const efforts = await call('efforts', { provider: 'workbuddy', model: 'deepseek-v4.1-flash' })
console.log('efforts', efforts.ok, JSON.stringify(efforts.value))

const saved = await call('save', { config: { ...state.value.config, provider: 'workbuddy', model: 'deepseek-v4.1-flash', effort: 'high' }, apiKey: 'sk-test-123' })
console.log('save', saved.ok, JSON.stringify(saved.value.credential))

const state2 = await call('state')
console.log('after save provider', state2.value.config.provider, 'model', state2.value.config.model, 'effort', state2.value.config.effort)

const tested = await call('test', { area: 'expression', draft: state2.value.config })
console.log('test', tested.ok, tested.ok ? tested.value.ms + 'ms' : tested.error.message)

const cleared = await call('save', { config: state2.value.config, clearKey: true })
console.log('clearKey', cleared.ok, JSON.stringify(cleared.value.credential))

const missing = await call('nope', {})
console.log('unknown endpoint', missing.ok, missing.error.code)
