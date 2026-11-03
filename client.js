window.__ModuleLoader__.load({
  id: '@shenjing/brain-regions',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const ROUTE = '/api/shenjing-brain.'

    const S = {
      wrap: { display: 'flex', flexDirection: 'column', gap: '20px', padding: '4px 0 24px' },
      card: { border: '0.5px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-settings-card-fill, var(--dsw-alias-bg-layer-1))', borderRadius: '12px', padding: '16px' },
      h2: { margin: '0 0 4px', fontSize: '15px', lineHeight: '22px', color: 'var(--dsw-alias-label-primary)' },
      desc: { margin: '0 0 14px', fontSize: '12px', lineHeight: '18px', color: 'var(--dsw-alias-label-secondary)' },
      row: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderTop: '0.5px solid var(--dsw-alias-border-l1)' },
      rowFirst: { borderTop: 'none', paddingTop: 0 },
      label: { width: '96px', flex: '0 0 auto', fontSize: '13px', color: 'var(--dsw-alias-label-secondary)' },
      field: { flex: '1 1 auto', minWidth: 0, display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' },
      input: { flex: '1 1 160px', minWidth: '120px', height: '32px', padding: '0 10px', fontSize: '13px', color: 'var(--dsw-alias-label-primary)', background: 'var(--dsw-alias-bg-base)', border: '0.5px solid var(--dsw-alias-border-l2)', borderRadius: '8px', outline: 'none' },
      select: { flex: '1 1 140px', minWidth: '110px', height: '32px', padding: '0 8px', fontSize: '13px', color: 'var(--dsw-alias-label-primary)', background: 'var(--dsw-alias-bg-base)', border: '0.5px solid var(--dsw-alias-border-l2)', borderRadius: '8px' },
      range: { flex: '1 1 140px', minWidth: '110px', accentColor: 'var(--dsw-alias-button-primary-fill)' },
      num: { width: '48px', flex: '0 0 auto', textAlign: 'right', fontSize: '12px', fontVariantNumeric: 'tabular-nums', color: 'var(--dsw-alias-label-secondary)' },
      btn: { height: '32px', padding: '0 14px', fontSize: '13px', borderRadius: '8px', cursor: 'pointer', border: '0.5px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-base)', color: 'var(--dsw-alias-label-primary)' },
      primary: { background: 'var(--dsw-alias-button-primary-fill)', borderColor: 'transparent', color: 'var(--dsw-alias-button-primary-label, #fff)' },
      hint: { fontSize: '12px', lineHeight: '18px', color: 'var(--dsw-alias-label-tertiary)', margin: '8px 0 0' },
      ok: { fontSize: '12px', color: 'var(--dsw-alias-state-success-primary)' },
      bad: { fontSize: '12px', color: 'var(--dsw-alias-state-error-primary)' },
      actions: { display: 'flex', gap: '8px', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap' },
      toggle: { display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--dsw-alias-label-primary)', cursor: 'pointer' },
      meter: { display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--dsw-alias-label-tertiary)', margin: '6px 0 0' },
    }

    const AREAS = [
      { key: 'expression', title: '表达区', hint: '每轮给主模型一句说话指令（语气、长度、重点）' },
      { key: 'emotion', title: '情绪区', hint: '每轮结束后更新情绪数值' },
      { key: 'memory', title: '记忆区', hint: '筛选值得长期保留的一条记忆' },
    ]

    async function call(ctx, endpoint, payload) {
      const response = await fetch(ROUTE + endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload || {}),
      })
      if (!response.ok) throw new Error('请求失败 HTTP ' + response.status)
      const result = await response.json()
      if (!result) throw new Error('空响应')
      if (result.ok === false) throw new Error(result.error && result.error.message ? result.error.message : '请求失败')
      return result.value
    }

    function Row(props) {
      const first = props.first === true
      return h('div', { style: first ? { ...S.row, ...S.rowFirst } : S.row }, [
        h('div', { style: S.label, key: 'l' }, props.label),
        h('div', { style: S.field, key: 'f' }, props.children),
      ])
    }

    function Select(props) {
      return h('select', {
        style: S.select,
        value: props.value || '',
        disabled: props.disabled === true,
        onChange: (e) => props.onChange(e.target.value),
      }, props.options.map((o) => h('option', { key: o.value, value: o.value }, o.label)))
    }

    function Slider(props) {
      const v = typeof props.value === 'number' ? props.value : Number(props.value) || 0
      return h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 160px', minWidth: '140px' } }, [
        h('input', {
          key: 'i', type: 'range', style: S.range, min: 0, max: 100, step: 5,
          value: Math.round(v * 100),
          onChange: (e) => props.onChange(Number(e.target.value) / 100),
        }),
        h('span', { key: 'n', style: S.num }, Math.round(v * 100) + '%'),
      ])
    }

    function Toggle(props) {
      return h('label', { style: S.toggle }, [
        h('input', {
          key: 'c', type: 'checkbox',
          checked: props.value === true,
          onChange: (e) => props.onChange(e.target.checked),
        }),
        h('span', { key: 's' }, props.text || ''),
      ])
    }

    function Section(props) {
      const ctx = props.ctx
      const [cfg, setCfg] = React.useState(null)
      const [providers, setProviders] = React.useState([])
      const [credential, setCredential] = React.useState({ configured: false })
      const [vectorCredential, setVectorCredential] = React.useState({ configured: false })
      const [models, setModels] = React.useState({})
      const [efforts, setEfforts] = React.useState({})
      const [apiKey, setApiKey] = React.useState('')
      const [vectorKey, setVectorKey] = React.useState('')
      const [endocrine, setEndocrine] = React.useState(null)
      const [busy, setBusy] = React.useState('')
      const [notice, setNotice] = React.useState(null)
      const [error, setError] = React.useState('')

      const load = React.useCallback(async () => {
        setError('')
        try {
          const state = await call(ctx, 'state')
          setCfg(state.config)
          setProviders(state.providers || [])
          setCredential(state.credential || { configured: false })
          setVectorCredential(state.vectorCredential || { configured: false })
          setEndocrine(state.endocrine || null)
        } catch (e) {
          setError(String(e && e.message ? e.message : e))
        }
      }, [ctx])

      React.useEffect(() => { load() }, [load])

      const patch = (next) => setCfg((prev) => ({ ...prev, ...next }))
      const numOf = (key, fallback) => (typeof cfg[key] === 'number' ? cfg[key] : Number(cfg[key]) || fallback)

      const loadModels = React.useCallback(async (provider) => {
        if (!provider || models[provider]) return
        try {
          const value = await call(ctx, 'models', { provider })
          setModels((prev) => ({ ...prev, [provider]: value.models || [] }))
        } catch (e) {
          setModels((prev) => ({ ...prev, [provider]: [] }))
        }
      }, [ctx, models])

      const loadEfforts = React.useCallback(async (provider, model) => {
        const key = provider + '|' + model
        if (!provider || !model || efforts[key]) return
        try {
          const value = await call(ctx, 'efforts', { provider, model })
          setEfforts((prev) => ({ ...prev, [key]: value }))
        } catch (e) {
          setEfforts((prev) => ({ ...prev, [key]: { efforts: [], defaultEffort: '' } }))
        }
      }, [ctx, efforts])

      React.useEffect(() => {
        if (!cfg) return
        const seen = new Set()
        AREAS.forEach((area) => {
          const source = cfg[area.key + 'Source'] || 'dsh'
          if (source !== 'dsh') return
          const provider = cfg[area.key + 'Provider'] || cfg.provider || ''
          const model = cfg[area.key + 'Model'] || cfg.model || ''
          if (provider && !seen.has(provider)) { seen.add(provider); loadModels(provider) }
          if (provider && model) loadEfforts(provider, model)
        })
        if (cfg.provider) loadModels(cfg.provider)
      }, [cfg, loadModels, loadEfforts])

      if (error) return h('div', { style: S.wrap }, h('p', { style: S.bad }, '读取配置失败：' + error))
      if (!cfg) return h('div', { style: S.wrap }, h('p', { style: S.desc }, '读取中…'))

      const providerOptions = (current) => {
        const list = providers.map((p) => ({ value: p.id, label: p.name + ' · ' + p.id }))
        if (current && !providers.some((p) => p.id === current)) list.unshift({ value: current, label: current })
        return [{ value: '', label: '（未选）' }].concat(list)
      }

      const modelOptions = (provider, current) => {
        const list = (models[provider] || []).map((m) => ({ value: m.id, label: m.name && m.name !== m.id ? m.name + ' · ' + m.id : m.id }))
        if (current && !list.some((m) => m.value === current)) list.unshift({ value: current, label: current })
        return [{ value: '', label: list.length ? '（未选）' : '（先选 provider）' }].concat(list)
      }

      const effortOptions = (provider, model, current) => {
        const record = efforts[provider + '|' + model] || { efforts: [], defaultEffort: '' }
        const list = record.efforts.map((e) => ({ value: e.id, label: e.name && e.name !== e.id ? e.name + ' · ' + e.id : e.id }))
        if (current && !list.some((e) => e.value === current)) list.unshift({ value: current, label: current })
        const head = [{ value: '', label: record.defaultEffort ? '默认（' + record.defaultEffort + '）' : '默认' }]
        if (!record.efforts.length) head[0] = { value: '', label: '该模型没有思考档位' }
        return head.concat(list)
      }

      const save = async () => {
        setBusy('save'); setNotice(null); setError('')
        try {
          const payload = { config: cfg }
          if (apiKey) payload.apiKey = apiKey
          if (vectorKey) payload.vectorApiKey = vectorKey
          const value = await call(ctx, 'save', payload)
          setCfg(value.config)
          setCredential(value.credential || credential)
          setApiKey(''); setVectorKey('')
          setNotice('已保存，下一轮生效')
        } catch (e) {
          setError(String(e && e.message ? e.message : e))
        } finally { setBusy('') }
      }

      const clearKey = async () => {
        setBusy('clear'); setNotice(null); setError('')
        try {
          const value = await call(ctx, 'save', { config: cfg, clearKey: true })
          setCredential(value.credential || { configured: false })
          setNotice('密钥已清除')
        } catch (e) { setError(String(e && e.message ? e.message : e)) } finally { setBusy('') }
      }

      const test = async (area) => {
        setBusy('test:' + area); setNotice(null); setError('')
        try {
          const value = await call(ctx, 'test', { area, draft: cfg, apiKey, vectorApiKey: vectorKey })
          setNotice((area === 'vector' ? '向量检索' : area) + ' 连通正常（' + value.ms + 'ms）' + (value.sample ? ' · ' + value.sample : ''))
        } catch (e) {
          setError(String(e && e.message ? e.message : e))
        } finally { setBusy('') }
      }

      const areaCard = (area) => {
        const source = cfg[area.key + 'Source'] || 'dsh'
        const provider = cfg[area.key + 'Provider'] || ''
        const model = cfg[area.key + 'Model'] || ''
        const rows = []
        rows.push(h(Row, { key: 'src', label: '来源', first: true },
          h(Select, {
            value: source,
            options: [{ value: 'dsh', label: '现有模型路由' }, { value: 'external', label: '外部 API' }],
            onChange: (v) => patch({ [area.key + 'Source']: v }),
          })))
        if (source === 'dsh') {
          rows.push(h(Row, { key: 'p', label: 'Provider' },
            h(Select, {
              value: provider, options: providerOptions(provider),
              onChange: (v) => {
                patch({ [area.key + 'Provider']: v, [area.key + 'Model']: '', [area.key + 'Effort']: '' })
                loadModels(v)
              },
            })))
          rows.push(h(Row, { key: 'm', label: '模型' },
            h(Select, {
              value: model, options: modelOptions(provider, model),
              onChange: (v) => {
                patch({ [area.key + 'Model']: v, [area.key + 'Effort']: '' })
                loadEfforts(provider, v)
              },
            })))
          rows.push(h(Row, { key: 'e', label: '思考强度' },
            h(Select, {
              value: cfg[area.key + 'Effort'] || '',
              options: effortOptions(provider, model, cfg[area.key + 'Effort'] || ''),
              onChange: (v) => patch({ [area.key + 'Effort']: v }),
            })))
        } else {
          rows.push(h(Row, { key: 'm', label: '模型名' },
            h('input', {
              style: S.input, placeholder: '如 deepseek-chat / gpt-4o-mini',
              value: cfg[area.key + 'ExternalModel'] || cfg.externalModel || '',
              onChange: (e) => patch({ [area.key + 'ExternalModel']: e.target.value }),
            })))
          rows.push(h(Row, { key: 'e', label: '思考强度' },
            h('input', {
              style: S.input, placeholder: '可选，原样发给端点（如 high / low）',
              value: cfg[area.key + 'ExternalEffort'] || '',
              onChange: (e) => patch({ [area.key + 'ExternalEffort']: e.target.value }),
            })))
        }
        if (area.key === 'expression') {
          rows.push(h(Row, { key: 'rich', label: '情绪丰富度' },
            h(Slider, { value: numOf('expressionRichness', 0.5), onChange: (v) => patch({ expressionRichness: v }) })))
        }
        if (area.key === 'emotion') {
          rows.push(h(Row, { key: 'sens', label: '情绪敏感度' },
            h(Slider, { value: numOf('emotionSensitivity', 0.8), onChange: (v) => patch({ emotionSensitivity: v }) })))
        }
        if (area.key === 'memory') {
          rows.push(h(Row, { key: 'den', label: '读取密度' },
            h(Slider, { value: numOf('memoryDensity', 0.5), onChange: (v) => patch({ memoryDensity: v }) })))
          rows.push(h(Row, { key: 'vec', label: '向量检索' },
            h(Toggle, {
              value: cfg.memoryVectorEnabled === true,
              text: '额外用嵌入模型重排记忆',
              onChange: (v) => patch({ memoryVectorEnabled: v }),
            })))
        }
        return h('div', { style: S.card, key: area.key }, [
          h('h2', { style: S.h2, key: 't' }, area.title),
          h('p', { style: S.desc, key: 'd' }, area.hint),
          h('div', { key: 'r' }, rows),
          h('div', { style: S.actions, key: 'a' },
            h('button', { style: S.btn, disabled: busy !== '', onClick: () => test(area.key) },
              busy === 'test:' + area.key ? '测试中…' : '测试这一路')),
        ])
      }

      const endocrineCard = h('div', { style: S.card, key: 'endo' }, [
        h('h2', { style: S.h2, key: 't' }, '内分泌'),
        h('p', { style: S.desc, key: 'd' }, '慢变量：被情绪一点点带动，不随单轮跳动。关掉联动后只向基线回落。'),
        h('div', { key: 'r' }, [
          h(Row, { key: 's', label: '敏感度', first: true },
            h(Slider, { value: numOf('endocrineSensitivity', 0.3), onChange: (v) => patch({ endocrineSensitivity: v }) })),
          h(Row, { key: 'l', label: '与情绪联动' },
            h(Toggle, {
              value: cfg.endocrineLinked !== false,
              text: '情绪变化带动内分泌',
              onChange: (v) => patch({ endocrineLinked: v }),
            })),
        ]),
        endocrine ? h('p', { style: S.meter, key: 'm' },
          '当前：valence ' + Number(endocrine.valence || 0).toFixed(2)
          + ' · energy ' + Number(endocrine.energy || 0).toFixed(2)
          + ' · tension ' + Number(endocrine.tension || 0).toFixed(2)
          + ' · 来源 ' + (endocrine.source === 'emotion' ? '情绪联动' : '基线回落')) : null,
      ])

      const vectorCard = h('div', { style: S.card, key: 'vec' }, [
        h('h2', { style: S.h2, key: 't' }, '向量检索'),
        h('p', { style: S.desc, key: 'd' }, 'POST {Base URL}/embeddings。留空 Base URL 就复用上面的外部 API 地址；模型名要填向量模型，不能填对话模型。'),
        h('div', { key: 'r' }, [
          h(Row, { key: 'u', label: 'Base URL', first: true },
            h('input', {
              style: S.input, placeholder: '留空 = 复用外部 API 的 Base URL',
              value: cfg.vectorBaseUrl || '',
              onChange: (e) => patch({ vectorBaseUrl: e.target.value }),
            })),
          h(Row, { key: 'm', label: '向量模型' },
            h('input', {
              style: S.input, placeholder: '如 text-embedding-3-small / Qwen/Qwen3-Embedding-8B',
              value: cfg.vectorModel || '',
              onChange: (e) => patch({ vectorModel: e.target.value }),
            })),
          h(Row, { key: 'k', label: 'API Key' },
            h('input', {
              style: S.input, type: 'password',
              placeholder: vectorCredential.configured ? '已保存（留空不改）' : '未保存（留空 = 用外部 API 那把）',
              value: vectorKey,
              onChange: (e) => setVectorKey(e.target.value),
            })),
          h(Row, { key: 'r2', label: '密钥引用' },
            h('input', {
              style: S.input, placeholder: 'SHENJING_BRAIN_API_KEY',
              value: cfg.vectorApiKeyRef || '',
              onChange: (e) => patch({ vectorApiKeyRef: e.target.value }),
            })),
        ]),
        h('div', { style: S.actions, key: 'a' },
          h('button', { style: S.btn, disabled: busy !== '', onClick: () => test('vector') },
            busy === 'test:vector' ? '测试中…' : '测试向量端点')),
      ])

      return h('div', { style: S.wrap }, [
        h('div', { style: S.card, key: 'ext' }, [
          h('h2', { style: S.h2, key: 't' }, '外部 API'),
          h('p', { style: S.desc, key: 'd' }, 'OpenAI 兼容端点（POST {Base URL}/chat/completions）。密钥存在宿主凭据里，不写进配置文件。'),
          h('div', { key: 'r' }, [
            h(Row, { key: 'u', label: 'Base URL', first: true },
              h('input', {
                style: S.input, placeholder: 'https://api.example.com/v1',
                value: cfg.externalBaseUrl || '',
                onChange: (e) => patch({ externalBaseUrl: e.target.value }),
              })),
            h(Row, { key: 'k', label: 'API Key' },
              h('input', {
                style: S.input, type: 'password',
                placeholder: credential.configured ? '已保存（留空不改）' : '未保存',
                value: apiKey,
                onChange: (e) => setApiKey(e.target.value),
              }),
              h('button', { style: S.btn, disabled: busy !== '', onClick: clearKey }, '清除')),
            h(Row, { key: 'r2', label: '密钥引用' },
              h('input', {
                style: S.input, placeholder: 'SHENJING_BRAIN_API_KEY',
                value: cfg.externalApiKeyRef || '',
                onChange: (e) => patch({ externalApiKeyRef: e.target.value }),
              })),
            h(Row, { key: 'dm', label: '默认模型' },
              h('input', {
                style: S.input, placeholder: '三路都没单独填时用这个',
                value: cfg.externalModel || '',
                onChange: (e) => patch({ externalModel: e.target.value }),
              })),
          ]),
          h('p', { style: S.hint, key: 'h' }, credential.configured ? '密钥状态：已保存（来源 ' + (credential.source || 'file') + '）' : '密钥状态：未保存'),
        ]),
        ...AREAS.map(areaCard),
        endocrineCard,
        vectorCard,
        h('div', { key: 'act', style: S.actions }, [
          h('button', { key: 's', style: { ...S.btn, ...S.primary }, disabled: busy !== '', onClick: save }, busy === 'save' ? '保存中…' : '保存'),
          h('button', { key: 'r', style: S.btn, disabled: busy !== '', onClick: load }, '重新读取'),
          notice ? h('span', { key: 'n', style: S.ok }, notice) : null,
          error ? h('span', { key: 'e', style: S.bad }, error) : null,
        ]),
      ])
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.slots.inject('settings.section', () => ctx.slots.register({
          name: 'settings.section',
          id: 'shenjing-brain',
          order: 40,
          label: () => '深鲸 · 脑区',
        }, (props) => h(Section, { ...props, ctx })))
      },
    }
  },
})
