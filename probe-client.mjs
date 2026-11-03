const registrations = []
const slots = {
  inject(name, fn){ console.log('slots.inject', name); fn() },
  register(options, Comp){ registrations.push({ options, Comp }); return () => {} },
}
const ctx = { slots }
globalThis.window = { __ModuleLoader__: { load(def){ console.log('load id', def.id); const mod = def.factory((spec)=>{ if(spec==='react') return { createElement: (...a)=>({a}), useState: (v)=>[v,()=>{}], useEffect(){}, useCallback: (f)=>f, memo:(x)=>x }; throw new Error('unexpected require '+spec) }); console.log('inject', JSON.stringify(mod.inject)); mod.apply(ctx) } } }
await import('./client.js')
console.log('registered', registrations.length)
const r = registrations[0]
console.log('slot', r.options.name, 'id', r.options.id, 'order', r.options.order, 'label', r.options.label())
const tree = r.Comp({})
console.log('component renders:', typeof tree, tree && tree.a ? tree.a[0] : '')
