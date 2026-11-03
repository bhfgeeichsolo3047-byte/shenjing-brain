import assert from 'node:assert/strict'
import { mkdtempSync,readFileSync,existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { initStore,writeJson,readJson,messageText,jsonObject,initialEmotion,normalizeEmotion,normalizeMemory,candidateMemories,normalizeCard,renderGuidance,guidanceMessage,callJson } from './lib/core.mjs'
const home=mkdtempSync(join(tmpdir(),'shenjing-brain-'));initStore(home)
const file=join(home,'state.json');writeJson(file,{ok:true});assert.deepEqual(readJson(file,{}),{ok:true})
assert.equal(messageText({type:'user/message',data:{content:[{type:'text',text:'你好'}]}}),'你好')
assert.deepEqual(jsonObject('\`\`\`json\n{"a":1}\n\`\`\`'),{a:1})
const emo=normalizeEmotion({mood:'低落',energy:.2,tension:9},initialEmotion());assert.equal(emo.tension,1);assert.equal(emo.energy,.2)
const m=normalizeMemory({save:true,kind:'preference',importance:.8,text:'喜欢先把话说完'},'s1',7);assert.equal(m.sourceSeq,7)
assert.equal(normalizeMemory({save:true,text:'  '},'s1',1),null)
assert.equal(candidateMemories([m],'喜欢说话',1).length,1)
const card=normalizeCard({},emo,[m]);const text=renderGuidance(emo,[m],card,'test');assert.ok(text.includes('不是……而是……'));assert.equal(guidanceMessage(text).role,'user')
const ctx={llm:{stream:async function*(){yield {type:'text-delta',text:'{"save":false}'};yield {type:'finish',reason:{kind:'stop'}}}}}
assert.deepEqual(await callJson(ctx,{provider:'p',model:'m',system:'s',input:{},timeoutMs:1000,sessionId:'s'}),{save:false})
await assert.rejects(()=>callJson(ctx,{provider:'',model:'',system:'s',input:{},timeoutMs:1000,sessionId:'s'}),/未配置/)
console.log('shenjing-brain selfcheck: 18 assertions passed')
