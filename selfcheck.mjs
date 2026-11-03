import assert from 'node:assert/strict'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { initStore,writeJson,readJson,messageText,jsonObject,initialEmotion,normalizeEmotion,updateEndocrine,ENDOCRINE_BASELINE,normalizeMemory,candidateMemories,keywordScore,cosine,normalizeCard,renderGuidance,guidanceMessage,callJson,embedTexts } from './lib/core.mjs'
const home=mkdtempSync(join(tmpdir(),'shenjing-brain-'));initStore(home)
const file=join(home,'state.json');writeJson(file,{ok:true});assert.deepEqual(readJson(file,{}),{ok:true})
assert.equal(messageText({type:'user/message',data:{content:[{type:'text',text:'你好'}]}}),'你好')
assert.deepEqual(jsonObject('\`\`\`json\n{"a":1}\n\`\`\`'),{a:1})
const base=initialEmotion()
const emo=normalizeEmotion({mood:'低落',energy:.2,tension:9},base);assert.equal(emo.tension,1);assert.equal(emo.energy,.2)
// 敏感度：0 时几乎不动，1 时完全采纳
const still=normalizeEmotion({mood:'亢奋',energy:1},base,{sensitivity:0});assert.equal(still.energy,base.energy)
const full=normalizeEmotion({mood:'亢奋',energy:1},base,{sensitivity:1});assert.equal(full.energy,1)
const half=normalizeEmotion({mood:'亢奋',energy:1},base,{sensitivity:.5});assert.ok(Math.abs(half.energy-(base.energy+1)/2)<1e-9)
// 内分泌：联动时朝情绪走，不联动时回基线
const hot=updateEndocrine({...ENDOCRINE_BASELINE,energy:.2},{valence:.9,energy:.9,tension:.1},{sensitivity:1,linked:true})
assert.ok(hot.energy>.2);assert.equal(hot.source,'emotion')
const cool=updateEndocrine({valence:.9,energy:.9,tension:.1},{valence:.1,energy:.1,tension:.9},{sensitivity:1,linked:false})
assert.ok(cool.energy<.9);assert.equal(cool.source,'baseline')
const m=normalizeMemory({save:true,kind:'preference',importance:.8,text:'喜欢先把话说完'},'s1',7);assert.equal(m.sourceSeq,7)
assert.equal(normalizeMemory({save:true,text:'  '},'s1',1),null)
assert.equal(candidateMemories([m],'喜欢说话',1).length,1)
assert.ok(keywordScore(m,'喜欢说话')>keywordScore(m,'完全无关的词'))
assert.equal(cosine([1,0],[1,0]),1);assert.equal(cosine([1,0],[0,1]),0);assert.equal(cosine([1],[1,2]),0)
const card=normalizeCard({},emo,[m]);const text=renderGuidance(emo,[m],card,'test');assert.ok(text.includes('不是……而是……'));assert.equal(guidanceMessage(text).role,'user')
// 丰富度：低档只给 mood/energy/tension，高档给全六维；内分泌行只在联动时出现
const lean=renderGuidance(emo,[m],normalizeCard({},emo,[m],{richness:0}),'t',{richness:0,endocrine:hot,endocrineLink:false})
const rich=renderGuidance(emo,[m],normalizeCard({},emo,[m],{richness:1}),'t',{richness:1,endocrine:hot,endocrineLink:true})
assert.ok(!lean.includes('socialDrive'));assert.ok(rich.includes('socialDrive'))
assert.ok(!lean.includes('内分泌（慢变量'));assert.ok(rich.includes('内分泌（慢变量'))
assert.ok(normalizeCard({tone:['a','b','c','d']},emo,[],{richness:0}).tone.length<=1)
const ctx={llm:{stream:async function*(){yield {type:'text-delta',text:'{"save":false}'};yield {type:'finish',reason:{kind:'stop'}}}}}
assert.deepEqual(await callJson(ctx,{provider:'p',model:'m',system:'s',input:{},timeoutMs:1000,sessionId:'s'}),{save:false})
await assert.rejects(()=>callJson(ctx,{provider:'',model:'',system:'s',input:{},timeoutMs:1000,sessionId:'s'}),/未配置/)
await assert.rejects(()=>embedTexts({baseUrl:'',model:'x',inputs:['a']}),/未配置 Base URL/)
console.log('shenjing-brain selfcheck: 27 assertions passed')
