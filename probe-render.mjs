import { createRequire } from 'node:module'
const require = createRequire('/opt/dsh/node_modules/')
const React = require('react')
const { renderToString } = require('react-dom/server')
let reg=null
const ctx={slots:{inject(n,f){f()},register(o,C){reg={o,C};return()=>{}}}}
globalThis.window={__ModuleLoader__:{load(def){const m=def.factory((s)=>{if(s==='react')return React;throw new Error('no '+s)});m.apply(ctx)}}}
await import('./client.js')
console.log('registered', reg.o.id, reg.o.label())
const el = React.createElement(reg.C, { ctx: { connection: { rpc: { call: async()=>({ok:true,value:{config:{},providers:[],credential:{}}}) } } } })
const html = renderToString(el)
console.log('rendered bytes', html.length)
console.log(html.slice(0,300))
